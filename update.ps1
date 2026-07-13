$srcPath      = "C:\Apps\feedbackhub-src"
$publishPath  = "C:\Apps\feedbackhub"
$frontendPath = "$srcPath\frontend"
$wwwrootPath  = "$srcPath\backend\feedbackhub\feedbackhub\wwwroot"
$port         = 5185

Write-Host "== Pull neuester Code =="
Set-Location $srcPath
git pull
if ($LASTEXITCODE -ne 0) { Write-Host "FEHLER: git pull fehlgeschlagen" -ForegroundColor Red; exit 1 }

Write-Host "== Frontend bauen =="
Set-Location $frontendPath
if (-not (Test-Path "$frontendPath\node_modules")) { cmd /c "npm install" }
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) { Write-Host "FEHLER: Frontend-Build fehlgeschlagen" -ForegroundColor Red; exit 1 }

Write-Host "== wwwroot aufbauen (dist als Unterordner + Raw-Files) =="
Remove-Item $wwwrootPath -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path "$wwwrootPath\dist" -Force | Out-Null
Copy-Item "$frontendPath\dist\*" "$wwwrootPath\dist" -Recurse -Force
foreach ($dir in @("js", "css", "img")) {
    if (Test-Path "$frontendPath\$dir") {
        Copy-Item "$frontendPath\$dir" $wwwrootPath -Recurse -Force
    }
}
Copy-Item "$frontendPath\*.html" $wwwrootPath -Force -ErrorAction SilentlyContinue

Write-Host "== App offline nehmen (IIS gibt Locks frei) =="
Set-Content "$publishPath\app_offline.htm" "<html><body><h2>Update laeuft, bitte kurz warten...</h2></body></html>"
Start-Sleep -Seconds 5

Write-Host "== appsettings.json sichern =="
$settingsBackup = $null
if (Test-Path "$publishPath\appsettings.json") {
    $settingsBackup = Get-Content "$publishPath\appsettings.json" -Raw
}

Write-Host "== Publish =="
dotnet publish "$srcPath\backend\feedbackhub\feedbackhub\feedbackhub.csproj" -c Release -o $publishPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "FEHLER: Publish fehlgeschlagen - App bleibt offline (app_offline.htm manuell loeschen!)" -ForegroundColor Red
    exit 1
}

if ($settingsBackup) {
    Set-Content "$publishPath\appsettings.json" $settingsBackup -NoNewline
    Write-Host "-- Server-appsettings.json wiederhergestellt --"
}

Write-Host "== App wieder online nehmen =="
Remove-Item "$publishPath\app_offline.htm" -Force

Write-Host "== Warm-up Request =="
Start-Sleep -Seconds 2
try {
    $resp = Invoke-WebRequest "https://feedbackhub.cd.ch" -UseBasicParsing -TimeoutSec 20
    Write-Host "OK: App antwortet (HTTP $($resp.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "WARNUNG: App antwortet nicht auf https://feedbackhub.cd.ch - IIS-Log pruefen" -ForegroundColor Yellow
}
