# Run an Animate script (JSFL) and close Animate when the script is done. No screen control.
#   powershell -File pipeline/animate/run-an.ps1 <script.jsfl> [-TimeoutSec 600]
# The script writes <script>.log beside itself and ends it with a line "RESULT OK" or "RESULT FAILED".
# Animate does not close itself after fl.quit() here, so this waits for that line and then stops
# only the Animate process it started itself (an Animate the owner already had open is left alone).
param([Parameter(Mandatory = $true)][string]$Script, [int]$TimeoutSec = 600)
$ErrorActionPreference = 'Stop'
$exe = Get-ChildItem 'C:\Program Files\Adobe' -Directory -Filter 'Adobe Animate*' | Sort-Object Name -Descending |
  ForEach-Object { Join-Path $_.FullName 'Animate.exe' } | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $exe) { Write-Output 'animate: Animate.exe not found'; exit 2 }
$full = (Resolve-Path $Script).Path
$log = [System.IO.Path]::ChangeExtension($full, '.log')
if (Test-Path $log) { Remove-Item $log -Force }
$before = @(Get-Process Animate -ErrorAction SilentlyContinue | ForEach-Object { $_.Id })
Start-Process -FilePath $exe -ArgumentList ('"' + $full + '"') | Out-Null
$result = ''
$until = (Get-Date).AddSeconds($TimeoutSec)
while ((Get-Date) -lt $until) {
  Start-Sleep -Milliseconds 1500
  if (Test-Path $log) {
    $text = Get-Content $log -Raw
    if ($text -match 'RESULT (OK|FAILED)') { $result = $Matches[1]; break }
  }
}
Start-Sleep -Seconds 2
Get-Process Animate -ErrorAction SilentlyContinue | Where-Object { $before -notcontains $_.Id } | Stop-Process -Force
if (Test-Path $log) { Get-Content $log | Write-Output }
if ($result -eq 'OK') { exit 0 }
if ($result -eq '') { Write-Output "animate: no result after $TimeoutSec s" }
exit 1
