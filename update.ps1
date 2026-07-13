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

Write-Host "== Laufenden Prozess stoppen (VOR dem Publish - Datei-Locks!) =="
$conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($conns) {
    $conns.OwningProcess | Sort-Object -Unique | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

Write-Host "== appsettings.json sichern =="
$settingsBackup = $null
if (Test-Path "$publishPath\appsettings.json") {
    $settingsBackup = Get-Content "$publishPath\appsettings.json" -Raw
}

Write-Host "== Publish =="
dotnet publish "$srcPath\backend\feedbackhub\feedbackhub\feedbackhub.csproj" -c Release -o $publishPath
if ($LASTEXITCODE -ne 0) { Write-Host "FEHLER: Publish fehlgeschlagen" -ForegroundColor Red; exit 1 }

if ($settingsBackup) {
    Set-Content "$publishPath\appsettings.json" $settingsBackup -NoNewline
    Write-Host "-- Server-appsettings.json wiederhergestellt --"
}

Write-Host "== Neustart auf Port $port =="
Start-Process -FilePath "dotnet" `
    -ArgumentList "`"$publishPath\feedbackhub.dll`"" `
    -WorkingDirectory $publishPath `
    -WindowStyle Hidden

Start-Sleep -Seconds 5

Write-Host "== Check =="
$check = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($check) {
    Write-Host "OK: Backend laeuft auf Port $port" -ForegroundColor Green
} else {
    Write-Host "FEHLER: Backend NICHT erreichbar - Log pruefen: dotnet $publishPath\feedbackhub.dll manuell starten" -ForegroundColor Red
}
