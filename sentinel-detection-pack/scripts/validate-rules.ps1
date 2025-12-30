param(
  [switch]$CheckSamples
)

$ErrorActionPreference = "Stop"
$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..")

$requiredKqlFields = @(
  "RuleId", "Name", "Category", "Severity", "Tactics", "Techniques", "DataSources",
  "QueryFrequency", "QueryPeriod", "TriggerOperator", "TriggerThreshold", "Version",
  "Author", "Status", "Description", "FalsePositives"
)
$requiredYamlFields = @(
  "id", "name", "description", "severity", "query", "queryFrequency", "queryPeriod",
  "triggerOperator", "triggerThreshold", "tactics", "techniques", "entityMappings", "kind"
)

$kqlFiles = Get-ChildItem -Path (Join-Path $RootDir "rules") -Recurse -Filter "*.kql" | Where-Object { $_.Name -notlike "._*" }
if (-not $kqlFiles) {
  Write-Error "No KQL files found under $RootDir\rules"
}

$ruleIds = @{}
$failed = $false

foreach ($kql in $kqlFiles) {
  $firstLine = Get-Content -Path $kql.FullName -TotalCount 1
  if ($firstLine -ne "/*") {
    Write-Host "Missing metadata header start in $($kql.FullName)"
    $failed = $true
  }

  foreach ($field in $requiredKqlFields) {
    if (-not (Select-String -Path $kql.FullName -Pattern "^$field:" -SimpleMatch)) {
      Write-Host "Missing $field in $($kql.FullName)"
      $failed = $true
    }
  }

  $ruleIdLine = Select-String -Path $kql.FullName -Pattern "^RuleId:" | Select-Object -First 1
  $ruleId = if ($ruleIdLine) { $ruleIdLine.Line -replace "^RuleId:\s*", "" } else { "" }
  if (-not $ruleId) {
    Write-Host "Missing RuleId value in $($kql.FullName)"
    $failed = $true
  } elseif ($ruleIds.ContainsKey($ruleId)) {
    Write-Host "Duplicate RuleId $ruleId in $($kql.FullName) and $($ruleIds[$ruleId])"
    $failed = $true
  } else {
    $ruleIds[$ruleId] = $kql.FullName
  }

  $relPath = $kql.FullName.Substring((Join-Path $RootDir "rules").Length + 1)
  $baseName = $relPath -replace "\.kql$", ""
  $yamlPath = Join-Path (Join-Path $RootDir "rules-yaml") ("$baseName.yaml")

  if (-not (Test-Path $yamlPath)) {
    Write-Host "Missing YAML for $($kql.FullName) at $yamlPath"
    $failed = $true
    continue
  }

  foreach ($field in $requiredYamlFields) {
    if (-not (Select-String -Path $yamlPath -Pattern "^$field:" -SimpleMatch)) {
      Write-Host "Missing $field in $yamlPath"
      $failed = $true
    }
  }

  $yamlIdLine = Select-String -Path $yamlPath -Pattern "^id:" | Select-Object -First 1
  $yamlId = if ($yamlIdLine) { $yamlIdLine.Line -replace "^id:\s*", "" } else { "" }
  if ($ruleId -and $yamlId -and ($yamlId -ne $ruleId)) {
    Write-Host "RuleId mismatch between $($kql.FullName) ($ruleId) and $yamlPath ($yamlId)"
    $failed = $true
  }
}

# Hygiene checks
$allFiles = Get-ChildItem -Path $RootDir -Recurse -File
$secretScanFiles = $allFiles | Where-Object { $_.FullName -notmatch "\\\\scripts\\\\" }
if ($allFiles | Select-String -Pattern "\t" -AllMatches) {
  Write-Host "Tabs found in repository"
  $failed = $true
}
if ($allFiles | Select-String -Pattern "[ \t]+$" -AllMatches) {
  Write-Host "Trailing whitespace found in repository"
  $failed = $true
}
if ($allFiles | Select-String -Pattern "\r$" -AllMatches) {
  Write-Host "CRLF line endings found in repository"
  $failed = $true
}
if ($secretScanFiles | Select-String -Pattern "BEGIN (RSA|OPENSSH|PRIVATE) KEY|AKIA[0-9A-Z]{16}|-----BEGIN" -AllMatches) {
  Write-Host "Potential secret material found in repository"
  $failed = $true
}

if ($CheckSamples) {
  $requiredFields = @{
    "SigninLogs" = @("TimeGenerated", "UserPrincipalName", "IPAddress", "ResultType")
    "AuditLogs" = @("TimeGenerated", "OperationName", "InitiatedBy", "TargetResources")
    "SecurityEvent" = @("TimeGenerated", "EventID", "Computer")
    "DeviceProcessEvents" = @("TimeGenerated", "ActionType", "FileName", "DeviceName")
    "OfficeActivity" = @("TimeGenerated", "Operation", "UserId", "Parameters")
    "EmailEvents" = @("TimeGenerated", "NetworkMessageId", "SenderFromAddress", "RecipientEmailAddress", "EmailDirection")
    "EmailAttachmentInfo" = @("TimeGenerated", "NetworkMessageId", "AttachmentName", "AttachmentFileExtension")
    "CommonSecurityLog" = @("TimeGenerated", "SourceIP", "DestinationIP")
    "AzureDiagnostics" = @("TimeGenerated", "ResourceProvider", "OperationName", "ResourceId")
    "AzureActivity" = @("TimeGenerated", "OperationNameValue", "Caller", "ActivityStatusValue")
  }

  $sampleFiles = Get-ChildItem -Path (Join-Path $RootDir "sample-data") -Filter "*.jsonl" | Where-Object { $_.Name -notlike "._*" }
  $errors = @()

  foreach ($file in $sampleFiles) {
    $lines = Get-Content -Path $file.FullName
    for ($i = 0; $i -lt $lines.Count; $i++) {
      $line = $lines[$i].Trim()
      if (-not $line) { continue }
      try {
        $obj = $line | ConvertFrom-Json
      } catch {
        $errors += "$($file.FullName):$($i+1) invalid JSON: $($_.Exception.Message)"
        continue
      }
      $table = $obj.SampleTable
      if (-not $table) {
        $errors += "$($file.FullName):$($i+1) missing SampleTable"
        continue
      }
      if (-not $requiredFields.ContainsKey($table)) {
        $errors += "$($file.FullName):$($i+1) unknown SampleTable '$table'"
        continue
      }
      $missing = @()
      foreach ($field in $requiredFields[$table]) {
        if (-not ($obj.PSObject.Properties.Name -contains $field)) {
          $missing += $field
        }
      }
      if ($missing.Count -gt 0) {
        $errors += "$($file.FullName):$($i+1) missing fields for $table: $($missing -join ', ')"
      }
    }
  }

  if ($errors.Count -gt 0) {
    Write-Host "Sample data validation failed:"
    $errors | ForEach-Object { Write-Host "- $_" }
    $failed = $true
  } else {
    Write-Host "Sample data validation passed."
  }
}

if ($failed) {
  Write-Error "Validation failed."
} else {
  Write-Host "Validation passed."
}
