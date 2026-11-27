$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
$dir = Join-Path $env:USERPROFILE '.pathfinder-dev'
$file = Join-Path $dir 'launcher-token.dpapi'
function Plain($secure) { [System.Net.NetworkCredential]::new('', $secure).Password }
try {
    if (Test-Path $file) {
        $env:PATHFINDER_DEV_TOKEN = Plain (ConvertTo-SecureString (Get-Content -LiteralPath $file -Raw).Trim())
    } else {
        if ($env:PATHFINDER_DEV_TOKEN -cnotmatch '^[a-fA-F0-9]{64}$') {
            $bytes = New-Object byte[] 32
            $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
            try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
            $env:PATHFINDER_DEV_TOKEN = ([BitConverter]::ToString($bytes)).Replace('-','').ToLowerInvariant()
        }
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        $encrypted = ConvertFrom-SecureString (ConvertTo-SecureString $env:PATHFINDER_DEV_TOKEN -AsPlainText -Force)
        [IO.File]::WriteAllText($file, $encrypted)
        Write-Host 'Token saved for this Windows account. Enter it once on the phone.'
    }
    if ($env:PATHFINDER_DEV_TOKEN -cnotmatch '^[a-fA-F0-9]{64}$') { throw 'Invalid stored token' }
    $show=Read-Host 'Show token for phone setup? [y/N]'
    if ($show -eq 'y') { Write-Host $env:PATHFINDER_DEV_TOKEN; Write-Host 'Do not share or screenshot this token.'; Read-Host 'Press Enter when done' | Out-Null; Clear-Host }
    $adb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'
    if (!(Test-Path $adb)) { throw 'ADB not found' }
    $null = & $adb start-server
    if ($LASTEXITCODE -ne 0) { throw 'ADB start failed' }
    $list = & $adb devices
    if ($LASTEXITCODE -ne 0) { throw 'ADB devices failed' }
    $devices = @($list | Where-Object { $_ -match '^\S+\s+device\s*$' })
    if ($devices.Count -ne 1) { throw 'Connect and authorize exactly one Android device, then restart launcher.' }
    $serial = ($devices[0] -split '\s+')[0]
    & $adb -s $serial reverse tcp:8787 tcp:8787
    if ($LASTEXITCODE -ne 0) { throw 'ADB reverse failed' }
    $mode=Read-Host 'Mode: M = free MOCK (default), O = paid OpenAI'
    if ($mode -eq 'o') {
        $env:PATHFINDER_AI_MODE='openai'
        $env:OPENAI_API_KEY=Plain (Read-Host 'Paste OpenAI API key (hidden)' -AsSecureString)
        if (!$env:OPENAI_API_KEY) { throw 'API key missing' }
    } elseif ($mode -eq '' -or $mode -eq 'm') {
        $env:PATHFINDER_AI_MODE='mock'
        Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
    } else { throw 'Unknown mode' }
    Write-Host 'Keep this window open. Ctrl+C stops backend.'
    & node backend/server.cjs
    if ($LASTEXITCODE -ne 0) { throw 'Backend stopped with an error' }
} catch {
    Write-Host ('STOP: '+$_.Exception.Message)
    exit 1
} finally {
    Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
    Remove-Item Env:PATHFINDER_DEV_TOKEN -ErrorAction SilentlyContinue
}
