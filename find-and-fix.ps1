<#
.SYNOPSIS
Recursively searches the repository for misplaced rule automation scripts and
moves them back to the root scripts directory expected by CI.
#>

$MissingFiles = @("validate-rules.sh", "bundle-rules.sh")
$TargetDir = "scripts"

Write-Host "Searching workspace for missing files..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------------"

if (-not (Test-Path -LiteralPath $TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
    Write-Host "Created target directory: $TargetDir"
}

$FilesRestored = 0
$FilesAlreadyCorrect = 0
$FilesMissing = 0

foreach ($File in $MissingFiles) {
    $TargetPath = Join-Path -Path $TargetDir -ChildPath $File
    $ResolvedTarget = $null

    if (Test-Path -LiteralPath $TargetPath) {
        $ResolvedTarget = (Resolve-Path -LiteralPath $TargetPath).Path
    }

    if ($ResolvedTarget) {
        Write-Host "[ OK ] $File is already at: $TargetPath" -ForegroundColor Green
        $FilesAlreadyCorrect++
        continue
    }

    $FoundFile = Get-ChildItem -Path . -Recurse -File -Filter $File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.FullName -notmatch "\\\.git\\" -and
            $_.FullName -ne (Join-Path -Path (Get-Location) -ChildPath $TargetPath)
        } |
        Select-Object -First 1

    if ($FoundFile) {
        Write-Host "[ FOUND ] $File located at: $($FoundFile.DirectoryName)" -ForegroundColor Yellow
        Move-Item -LiteralPath $FoundFile.FullName -Destination $TargetPath -Force
        Write-Host "[ FIXED ] -> Moved successfully to: $TargetPath" -ForegroundColor Green
        $FilesRestored++
    }
    else {
        Write-Host "[ ALERT ] $File was not found anywhere in the workspace." -ForegroundColor Red
        $FilesMissing++
    }
}

Write-Host "--------------------------------------------------------"

if ($FilesMissing -eq 0) {
    Write-Host "All files are present in scripts/." -ForegroundColor Green
    Write-Host "Restored: $FilesRestored; already correct: $FilesAlreadyCorrect"
}
else {
    Write-Host "Warning: $FilesMissing file(s) could not be found anywhere." -ForegroundColor Yellow
    Write-Host "Restore missing files from Git history if needed." -ForegroundColor Yellow
}
