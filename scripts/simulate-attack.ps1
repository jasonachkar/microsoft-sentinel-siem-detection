<#
.SYNOPSIS
Orchestrates the automated DevSecOps threat validation pipeline using Red Canary's Atomic Red Team.
#>

$ResourceGroup = "rg-sentinel-honeypot-temp"
$VmName = "vm-honeypot-01"
$ErrorActionPreference = "Stop"

Write-Host "[Phase 1] Provisioning Temporary Honeypot Infrastructure..." -ForegroundColor Cyan
Set-Location -Path .\terraform-honeypot
terraform init
terraform apply -auto-approve
Set-Location -Path ..

Write-Host "[Phase 2] Bootstrapping Atomic Red Team (Enterprise BAS)..." -ForegroundColor Yellow
$InstallAtomic = @'
IEX (IWR 'https://raw.githubusercontent.com/redcanaryco/invoke-atomicredteam/master/install-atomicredteam.ps1' -UseBasicParsing);
Install-AtomicRedTeam -getAtomics -Force
'@
Set-Content -Path ".\install_atomic.ps1" -Value $InstallAtomic
az vm run-command invoke --command-id RunPowerShellScript --name $VmName -g $ResourceGroup --scripts "@install_atomic.ps1"

Write-Host "[Phase 3] Executing MITRE ATT&CK T1059.001 (PowerShell) via Atomic Red Team..." -ForegroundColor Red
$RunAtomic = @'
Import-Module "C:\AtomicRedTeam\invoke-atomicredteam\Invoke-AtomicRedTeam.psd1" -Force
Invoke-AtomicTest T1059.001 -TestNumbers 1,2 -Confirm:$false
'@
Set-Content -Path ".\run_atomic.ps1" -Value $RunAtomic
az vm run-command invoke --command-id RunPowerShellScript --name $VmName -g $ResourceGroup --scripts "@run_atomic.ps1"

# Cleanup temp scripts.
Remove-Item ".\install_atomic.ps1", ".\run_atomic.ps1" -ErrorAction SilentlyContinue

Write-Host "[Phase 4] Attack executed. Polling Sentinel API for alert verification..." -ForegroundColor Cyan
Start-Sleep -Seconds 60
python .\scripts\assert-detection.py

Write-Host "[Phase 5] Tearing down Honeypot Infrastructure..." -ForegroundColor Green
Set-Location -Path .\terraform-honeypot
terraform destroy -auto-approve
Set-Location -Path ..

Write-Host "Enterprise BAS Validation Complete. No rogue infrastructure remaining." -ForegroundColor Green
