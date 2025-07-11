<#
.SYNOPSIS
Signs a list of EXE files with DigiCert Signing Manager.

.PARAMETER FilesToSign
An array of absolute paths to the files to sign.
#>

param (
  [Parameter(Mandatory=$true)]
  [string[]]$FilesToSign
)

if ($FilesToSign.Length -eq 0) {
  Write-Host "❌ No files to sign!"
  exit 1
}

# Confirm environment
Write-Host "🔑 Signing with DigiCert Signing Manager"
Write-Host "SM_CLIENT_CERT_PASSWORD set: $([string]::IsNullOrEmpty($env:SM_CLIENT_CERT_PASSWORD) -eq $false)"
Write-Host "SM_API_KEY set: $([string]::IsNullOrEmpty($env:SM_API_KEY) -eq $false)"
Write-Host "SM_HOST: $env:SM_HOST"

# Decode client certificate
if (-not (Test-Path "C:\Certificate_pkcs12.p12")) {
  Write-Host "📄 Decoding client certificate..."
  [System.IO.File]::WriteAllBytes(
    "C:\Certificate_pkcs12.p12",
    [System.Convert]::FromBase64String($env:SM_CLIENT_CERT_FILE_B64)
  )
  $env:SM_CLIENT_CERT_FILE = "C:\Certificate_pkcs12.p12"
}

# Install smtools if needed
if (-not (Test-Path "C:\Program Files\DigiCert\DigiCert One Signing Manager Tools\smctl.exe")) {
  Write-Host "📦 Downloading DigiCert smtools..."
  curl.exe -X GET `
    "https://one.digicert.com/signingmanager/api-ui/v1/releases/smtools-windows-x64.msi/download" `
    -H "x-api-key:$env:SM_API_KEY" `
    -o C:\smtools-windows-x64.msi

  Write-Host "📦 Installing DigiCert smtools..."
  msiexec.exe /i C:\smtools-windows-x64.msi /quiet /qn | Wait-Process
}

# Sync cert
Write-Host "🔄 Syncing certificate..."
& "$env:SSM\smctl.exe" windows certsync

# Select keypair alias
$certLines = & (Join-Path $env:SSM "smctl.exe") cert ls
$activeCerts = @()
foreach ($line in $certLines) {
  if ($line -match '^\s*([0-9a-f\-]+)\s+(\S+)\s+.*\bACTIVE\b') {
    $activeCerts += @{ id = $matches[1]; alias = $matches[2] }
  }
}
if ($activeCerts.Count -eq 0) {
  Write-Host "❌ No ACTIVE certificates found. Exiting."
  exit 1
}
$chosen = $activeCerts[0]
$certId = $chosen.id
$certAlias = $chosen.alias

$keyLines = & (Join-Path $env:SSM "smctl.exe") keypair ls
$keyAlias = $null
foreach ($line in $keyLines) {
  $cells = $line -split '\s+'
  if ($cells[-1] -eq $certId) {
    $keyAlias = $cells[2]
    break
  }
}
if (-not $keyAlias) {
  Write-Host "❌ No keypair found for cert $certId."
  exit 1
}
Write-Host "✅ Using keypair alias: $keyAlias"

# Sign all files
foreach ($file in $FilesToSign) {
  Write-Host "🔑 Signing $file..."
  & "$env:SSM\smctl.exe" sign --keypair-alias $keyAlias --input $file --verbose
  signtool verify /pa /v $file
}