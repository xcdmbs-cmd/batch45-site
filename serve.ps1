# ============================================================
#  تشغيل موقع الدفعة 45 محليًا (خادم HTTP بسيط)
#  مزدوج النقر على تشغيل-الموقع.bat يفتح هذا السكربت تلقائيًا
# ============================================================
$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot
$port = 8080

# find Python
$candidates = @(
  (Join-Path $env:LOCALAPPDATA 'Programs\Python\Python312\python.exe'),
  (Join-Path $env:LOCALAPPDATA 'Programs\Python\Python311\python.exe')
)
$py = $null
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
  Write-Host "لم يتم العثور على Python. ثبّته من https://python.org ثم أعد المحاولة." -ForegroundColor Red
  Read-Host "اضغط Enter للإغلاق"
  exit 1
}

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════╗"
Write-Host "  ║   بوابة الدفعة 45 — الهندسة الكيميائية            ║"
Write-Host "  ║   جامعة الجزيرة — كلية الهندسة والتكنولوجيا        ║"
Write-Host "  ╚══════════════════════════════════════════════════╝"
Write-Host ""
Write-Host "  العنوان: http://localhost:$port" -ForegroundColor Cyan
Write-Host "  كلمة مرور الدفعة الافتراضية: data/config.json"
Write-Host "  للإيقاف: اضغط Ctrl+C في هذه النافذة" -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Milliseconds 600
Start-Process "http://localhost:$port/"

if ($py -eq 'PY_LAUNCHER') {
  & py -3 -m http.server $port
} else {
  & $py -m http.server $port
}
