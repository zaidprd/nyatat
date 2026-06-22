# ═══════════════════════════════════════════════════════
#  KapurPad — Android Build Script (Bubblewrap + TWA)
#  Jalankan: powershell -ExecutionPolicy Bypass -File build-android.ps1
# ═══════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

Write-Host "`n━━━ KapurPad Android Builder ━━━`n" -ForegroundColor Cyan

# ── 1. Cek Java ──────────────────────────────────────
Write-Host "[1/6] Cek Java..." -ForegroundColor Yellow
try {
    $javaVersion = & java -version 2>&1
    Write-Host "    ✅ Java ditemukan: $($javaVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "    ❌ Java tidak ditemukan. Install dulu dari: https://adoptium.net" -ForegroundColor Red
    exit 1
}

# ── 2. Install Bubblewrap ─────────────────────────────
Write-Host "[2/6] Install Bubblewrap CLI..." -ForegroundColor Yellow
npm install -g @bubblewrap/cli
Write-Host "    ✅ Bubblewrap siap" -ForegroundColor Green

# ── 3. Generate Keystore ──────────────────────────────
Write-Host "[3/6] Generate keystore..." -ForegroundColor Yellow
$keystorePath = ".\kapurpad.keystore"
if (Test-Path $keystorePath) {
    Write-Host "    ℹ️  Keystore sudah ada, skip generate" -ForegroundColor Cyan
} else {
    & keytool -genkeypair `
        -alias kapurpad `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -keystore $keystorePath `
        -storepass kapurpad2024 `
        -keypass kapurpad2024 `
        -dname "CN=KapurPad, OU=App, O=KapurPad, L=Jakarta, ST=DKI Jakarta, C=ID"
    Write-Host "    ✅ Keystore dibuat: kapurpad.keystore" -ForegroundColor Green
    Write-Host "    ⚠️  SIMPAN FILE INI BAIK-BAIK! Jangan sampai hilang!" -ForegroundColor Red
}

# ── 4. Ambil SHA-256 & Update assetlinks.json ─────────
Write-Host "[4/6] Ambil SHA-256 fingerprint..." -ForegroundColor Yellow
$keytoolOutput = & keytool -list -v -keystore $keystorePath -alias kapurpad -storepass kapurpad2024 2>&1
$sha256Line = $keytoolOutput | Where-Object { $_ -match "SHA256:" }
$sha256 = ($sha256Line -replace ".*SHA256:\s*", "").Trim()
Write-Host "    SHA-256: $sha256" -ForegroundColor Cyan

# Update assetlinks.json
$assetlinks = @(
    @{
        relation = @("delegate_permission/common.handle_all_urls")
        target   = @{
            namespace                = "android_app"
            package_name             = "com.kapurpad.app"
            sha256_cert_fingerprints = @($sha256)
        }
    }
) | ConvertTo-Json -Depth 5

$assetlinks | Out-File -FilePath ".\public\.well-known\assetlinks.json" -Encoding utf8
Write-Host "    ✅ assetlinks.json diupdate dengan SHA-256 asli" -ForegroundColor Green

# ── 5. Build APK ──────────────────────────────────────
Write-Host "[5/6] Build APK (ini butuh beberapa menit)..." -ForegroundColor Yellow
bubblewrap build --manifest .\twa-manifest.json
Write-Host "    ✅ APK berhasil dibuild!" -ForegroundColor Green

# ── 6. Info hasil ─────────────────────────────────────
Write-Host "`n[6/6] Selesai! File output:" -ForegroundColor Yellow
Write-Host "    📦 APK: .\app-release-signed.apk" -ForegroundColor White
Write-Host "    🔑 Keystore: .\kapurpad.keystore (JANGAN DIHAPUS!)" -ForegroundColor White
Write-Host "    🔗 assetlinks.json: .\public\.well-known\assetlinks.json" -ForegroundColor White

Write-Host "`n━━━ Langkah berikutnya ━━━" -ForegroundColor Cyan
Write-Host "1. Push ke GitHub (git push) → Netlify otomatis deploy assetlinks.json"
Write-Host "2. Verifikasi: https://kapurpad.netlify.app/.well-known/assetlinks.json"
Write-Host "3. Upload APK ke: https://play.google.com/apps/publish"
Write-Host "4. Isi deskripsi, screenshot, dan privacy policy:"
Write-Host "   https://kapurpad.netlify.app/privacy-policy.html`n"
