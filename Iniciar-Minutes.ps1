$ErrorActionPreference = "Stop"
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$preferredPort = 5173
$url = "http://127.0.0.1:$preferredPort/"
$logPath = Join-Path $env:TEMP "minutes-in-leonida-vite.log"
$errorLogPath = Join-Path $env:TEMP "minutes-in-leonida-vite-error.log"

function Test-MinutesServer([string]$address) {
  try {
    $response = Invoke-WebRequest -Uri $address -TimeoutSec 2 -UseBasicParsing
    return $response.StatusCode -eq 200 -and $response.Content.Contains("Minutes in Leonida")
  } catch {
    return $false
  }
}

if (-not (Test-MinutesServer $url)) {
  $port = $preferredPort
  while ($port -lt $preferredPort + 10) {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
    try {
      $listener.Start()
      $listener.Stop()
      break
    } catch {
      $listener.Stop()
      $port++
    }
  }
  if ($port -ge $preferredPort + 10) { throw "Não encontrei uma porta livre entre $preferredPort e $($preferredPort + 9)." }

  $node = (Get-Command node -ErrorAction Stop).Source
  $vite = Join-Path $projectPath "node_modules\vite\bin\vite.js"
  Start-Process -FilePath $node `
    -ArgumentList @($vite, "--host", "127.0.0.1", "--port", "$port", "--strictPort") `
    -WorkingDirectory $projectPath `
    -WindowStyle Hidden `
    -RedirectStandardOutput $logPath `
    -RedirectStandardError $errorLogPath | Out-Null

  $url = "http://127.0.0.1:$port/"
  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 500
    if (Test-MinutesServer $url) { $ready = $true; break }
  }
  if (-not $ready) { throw "O servidor não iniciou. Confira os registros em $logPath e $errorLogPath" }
}

$chromePaths = @(
  (Join-Path $env:ProgramFiles "Google\Chrome\Application\chrome.exe"),
  (Join-Path ${env:ProgramFiles(x86)} "Google\Chrome\Application\chrome.exe"),
  (Join-Path $env:LOCALAPPDATA "Google\Chrome\Application\chrome.exe")
)
$chrome = $chromePaths | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if ($chrome) {
  Start-Process -FilePath $chrome -ArgumentList $url
} else {
  Start-Process $url
}
