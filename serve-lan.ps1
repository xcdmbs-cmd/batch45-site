# ============================================================
#  مشاركة الموقع مع الدفعة على الشبكة المحلية (نفس Wi-Fi)
#  الطلاب يفتحون رابط IP الظاهر في النافذة — بدون إنترنت
# ============================================================
$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot
$port = 8080

# ---- find python ----
$py = $null
$candidates = @(
  (Join-Path $env:LOCALAPPDATA 'Programs\Python\Python312\python.exe'),
  (Join-Path $env:LOCALAPPDATA 'Programs\Python\Python311\python.exe')
)
foreach ($c in $candidates) { if (Test-Path $c) { $py = $c; break } }
if (-not $py) {
  $cmd = Get-Command python -ErrorAction SilentlyContinue
  if ($cmd) { $py = $cmd.Source }
}
if (-not $py) {
  $launcher = Get-Command py -ErrorAction SilentlyContinue
  if ($launcher) { $py = 'PY_LAUNCHER' }
}
if (-not $py) {
  Write-Host "لم يتم العثور على Python. ثبّته من https://python.org" -ForegroundColor Red
  Read-Host "اضغط Enter للإغلاق"; exit 1
}

# ---- LAN IPv4 ----
$ip = $null
try {
  $ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' -and $_.PrefixOrigin -ne 'WellKnown' } |
        Sort-Object InterfaceMetric | Select-Object -First 1).IPAddress
} catch {}
if (-not $ip) {
  try {
    $line = (ipconfig | Select-String 'IPv4' | Select-Object -First 1).Line
    if ($line -match '(\d+\.\d+\.\d+\.\d+)') { $ip = $Matches[1] }
  } catch {}
}
if (-not $ip) { $ip = 'localhost' }

Write-Host ""
Write-Host "  ╔════════════════════════════════════════════════════════╗"
Write-Host "  ║   مشاركة بوابة الدفعة 45 على الشبكة المحلية             ║"
Write-Host "  ╚════════════════════════════════════════════════════════╝"
Write-Host ""
Write-Host "  ✅ شارك هذا الرابط مع زملائك (يجب أن يكونوا على نفس الشبكة):" -ForegroundColor Cyan
Write-Host ""
Write-Host ("      http://{0}:{1}" -f $ip, $port) -ForegroundColor Green
Write-Host ""
Write-Host "  كلمة المرور الافتراضية: راجع data/config.json" -ForegroundColor Yellow
Write-Host "  ملاحظة: قد يظهر تنبيه جدار حماية ويندوز — اختر «السماح» لنوع الشبكة الحالية."
Write-Host "  للإنهاء: Ctrl+C ثم أغلق النافذة."
Write-Host ""

Start-Sleep -Milliseconds 800
try { Start-Process "http://localhost:$port/" } catch {}

if ($py -eq 'PY_LAUNCHER') { & py -3 -m http.server $port } else { & $py -m http.server $port }
