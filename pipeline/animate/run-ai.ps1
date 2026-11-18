# Run an Illustrator script (ExtendScript .jsx) with arguments, through Illustrator's own scripting
# interface. No screen control: Illustrator is driven by code only.
#   powershell -File pipeline/animate/run-ai.ps1 <script.jsx> <arg1> <arg2> ...
# The script reads its arguments from the global array ARGS (Illustrator's COM call rejects an
# argument array from PowerShell: "Unsupported Variant type").
param([Parameter(Mandatory = $true)][string]$Script, [Parameter(ValueFromRemainingArguments = $true)][string[]]$Rest)
$ErrorActionPreference = 'Stop'
$ai = New-Object -ComObject Illustrator.Application
$full = (Resolve-Path $Script).Path.Replace('\', '/')
$list = ($Rest | ForEach-Object { '"' + $_.Replace('\', '/').Replace('"', '\"') + '"' }) -join ', '
$code = "var ARGS = [$list]; `$.evalFile(new File(`"$full`"));"
$result = $ai.DoJavaScript($code)
Write-Output "illustrator: $result"
