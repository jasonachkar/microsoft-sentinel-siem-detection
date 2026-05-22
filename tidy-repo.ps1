<#
.SYNOPSIS
Cleans up the repository root and organizes the DevSecOps project files into their correct architecture.
#>

Write-Host "🧹 Tidying up the workspace..." -ForegroundColor Cyan

# 1. Ensure directories exist
$TargetDirs = @("terraform", ".github\workflows", "scripts", "src-cli", "terraform-honeypot")
foreach ($dir in $TargetDirs) {
    if (-Not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    }
}

# 2. Move Phase 1: Terraform Foundation files
$tfFiles = @("providers.tf", "variables.tf", "main.tf", "outputs.tf")
foreach ($file in $tfFiles) {
    if (Test-Path $file) { Move-Item -Path $file -Destination "terraform\" -Force }
}

# 3. Move Phase 2: CI/CD & Security files
if (Test-Path "sentinel-ci-cd.yaml") { Move-Item "sentinel-ci-cd.yaml" ".github\workflows\" -Force }
if (Test-Path "enforce-branch-protections.sh") { Move-Item "enforce-branch-protections.sh" "scripts\" -Force }

# 4. Move Phase 3: Go Deployment Tool files
$goFiles = @("go.mod", "main.go", "deployer.go")
foreach ($file in $goFiles) {
    if (Test-Path $file) { Move-Item -Path $file -Destination "src-cli\" -Force }
}

# 5. Move Phase 4: Honeypot Infrastructure
if (Test-Path "honeypot-main.tf") { Move-Item "honeypot-main.tf" "terraform-honeypot\main.tf" -Force }
if (Test-Path "simulate-attack.ps1") { Move-Item "simulate-attack.ps1" "scripts\" -Force }

Write-Host "✅ Repository successfully structured for DevSecOps best practices!" -ForegroundColor Green