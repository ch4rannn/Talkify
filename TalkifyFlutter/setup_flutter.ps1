$ErrorActionPreference = 'Stop'

$downloadPath = "e:\website creation\chat app\TalkifyFlutter\flutter_sdk.zip"
$extractPath = "e:\website creation\chat app\TalkifyFlutter"
$flutterBin = "e:\website creation\chat app\TalkifyFlutter\flutter\bin"

Write-Host "Waiting for background download to finish..."
while ((Get-Item $downloadPath -ErrorAction SilentlyContinue).length -lt 1200000000) {
    Start-Sleep -Seconds 10
}

Write-Host "Download appears complete. Waiting 10 extra seconds to ensure file lock is released..."
Start-Sleep -Seconds 10

Write-Host "Extracting Flutter SDK (this might take several minutes)..."
Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force

Write-Host "Extraction complete. Unblocking flutter commands..."
Get-ChildItem -Path $flutterBin -Recurse | Unblock-File -ErrorAction SilentlyContinue

Write-Host "Temporarily adding flutter to local PATH for this session..."
$env:Path += ";$flutterBin"

Write-Host "Flutter setup complete! Now running pub get..."
cd "e:\website creation\chat app\TalkifyFlutter"
flutter pub get

Write-Host "Done! You can now run 'flutter run' to start the app!"
