$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) {
    $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
}

$destArtifactDir = "C:\Users\6219034372\.gemini\antigravity\brain\4f1f7eba-3eab-44fd-9e0c-986e4c8f0403"
$destPublicDir = "D:\Project\BengkelSaku\public\screenshots"

if (-not (Test-Path $destPublicDir)) {
    New-Item -ItemType Directory -Path $destPublicDir -Force | Out-Null
}

$targets = @(
    @{ Name = "01_landing_hero.png"; Url = "http://localhost:4000"; Width = 1440; Height = 1080 },
    @{ Name = "02_landing_full.png"; Url = "http://localhost:4000"; Width = 1440; Height = 3200 },
    @{ Name = "03_diagnose.png"; Url = "http://localhost:4000/diagnose"; Width = 1440; Height = 1100 },
    @{ Name = "04_garage.png"; Url = "http://localhost:4000/garage"; Width = 1440; Height = 1600 },
    @{ Name = "05_inspection.png"; Url = "http://localhost:4000/inspection"; Width = 1440; Height = 1800 },
    @{ Name = "06_spareparts.png"; Url = "http://localhost:4000/spareparts"; Width = 1440; Height = 1800 },
    @{ Name = "07_maintenance.png"; Url = "http://localhost:4000/maintenance"; Width = 1440; Height = 1800 },
    @{ Name = "08_signin.png"; Url = "http://localhost:4000/signin"; Width = 1440; Height = 1080 },
    @{ Name = "09_ar_inspector.png"; Url = "http://localhost:4000/ar-inspector"; Width = 1440; Height = 1300 }
)

foreach ($t in $targets) {
    $outPub = Join-Path $destPublicDir $t.Name
    $outArt = Join-Path $destArtifactDir $t.Name
    
    Write-Host "Capturing $($t.Name) from $($t.Url)..."
    
    $args = @(
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=$($t.Width),$($t.Height)",
        "--screenshot=$outPub",
        $t.Url
    )
    
    Start-Process -FilePath $edge -ArgumentList $args -Wait
    
    if (Test-Path $outPub) {
        Copy-Item -Path $outPub -Destination $outArt -Force
        Write-Host " Saved to $outPub and $outArt"
    } else {
        Write-Host " Failed to generate $($t.Name)"
    }
    
    Start-Sleep -Milliseconds 600
}

Write-Host "All public view screenshots captured successfully!"
