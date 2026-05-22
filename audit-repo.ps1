<#
.SYNOPSIS
Audits the DevSecOps repository structure to ensure all files and paths exist exactly where the CI/CD pipeline expects them.
#>

Write-Host "[INFO] Initiating DevSecOps Repository Audit..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------------"

# Define the exact architecture the pipeline requires
$ExpectedArchitecture = @{
    # CI/CD Pipeline
    ".github\workflows\sentinel-ci-cd.yaml" = "File"

    # Core Automation Scripts
    "scripts\validate-rules.sh"             = "File"
    "scripts\bundle-rules.sh"               = "File"
    "scripts\simulate-attack.ps1"           = "File"
    "scripts\enforce-branch-protections.sh" = "File"
    "scripts\threat-intel-ingest.py"        = "File"
    "scripts\ai-soc-copilot.py"             = "File"
    "scripts\assert-detection.py"           = "File"

    # Custom Go Deployment CLI
    "src-cli\main.go"                       = "File"
    "src-cli\deployer.go"                   = "File"
    "src-cli\go.mod"                        = "File"

    # Infrastructure as Code (Foundation)
    "terraform\main.tf"                     = "File"
    "terraform\providers.tf"                = "File"
    "terraform\variables.tf"                = "File"
    "terraform\outputs.tf"                  = "File"

    # Infrastructure as Code (Honeypot)
    "terraform-honeypot\main.tf"            = "File"

    # Infrastructure as Code (SOAR and Multi-Cloud)
    "terraform-soar\main.tf"                = "File"
    "terraform-aws-connector\main.tf"       = "File"

    # Enterprise Detection Pack
    "sentinel-detection-pack\rules\cloud\Kubernetes_Suspicious_Exec.kql"       = "File"
    "sentinel-detection-pack\rules-yaml\cloud\Kubernetes_Suspicious_Exec.yaml" = "File"

    # PrimeReact Dashboards
    "sentinel-detection-pack\ui\src\components\SoarDashboard.jsx"   = "File"
    "sentinel-detection-pack\ui\src\components\AICopilot.jsx"       = "File"
    "sentinel-detection-pack\ui\src\components\FinOpsDashboard.jsx" = "File"
}

$ErrorsFound = 0

foreach ($Item in $ExpectedArchitecture.GetEnumerator()) {
    $Path = $Item.Key

    if (Test-Path -Path $Path) {
        Write-Host "[ PASS ] Found: $Path" -ForegroundColor Green
    } else {
        Write-Host "[ FAIL ] Missing: $Path" -ForegroundColor Red
        $ErrorsFound++
    }
}

Write-Host "--------------------------------------------------------"

# Check root directory for misplaced files
$RootFiles = Get-ChildItem -Path . -File | Select-Object -ExpandProperty Name
$MisplacedFiles = @()

foreach ($File in $RootFiles) {
    if ($File -in @("sentinel-ci-cd.yaml", "main.go", "deployer.go", "go.mod", "providers.tf", "variables.tf", "outputs.tf", "simulate-attack.ps1", "enforce-branch-protections.sh")) {
        $MisplacedFiles += $File
    }
    # Special check for main.tf since there are two of them
    if ($File -eq "main.tf") {
        $MisplacedFiles += $File
    }
}

if ($MisplacedFiles.Count -gt 0) {
    Write-Host "[WARN] WARNING: Found these files dumped in the root directory instead of their proper folders:" -ForegroundColor Yellow
    foreach ($File in $MisplacedFiles) {
        Write-Host "   -> $File" -ForegroundColor Yellow
    }
}

Write-Host "--------------------------------------------------------"

if ($ErrorsFound -eq 0 -and $MisplacedFiles.Count -eq 0) {
    Write-Host "[SUCCESS] Audit Complete: Architecture is perfectly structured." -ForegroundColor Green
} else {
    Write-Host "[ERROR] Audit Failed: $ErrorsFound missing items detected." -ForegroundColor Red
    Write-Host "[FIX] FIX: If files are misplaced in the root, run your tidy-repo.ps1 script again. If validate-rules.sh is entirely missing, you will need to restore it from your Git history or a previous commit." -ForegroundColor Cyan
}
