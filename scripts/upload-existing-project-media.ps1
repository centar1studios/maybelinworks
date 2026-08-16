$ErrorActionPreference = "Stop"

$Bucket = "maybelinworks-media"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

$FenixDirectory = Join-Path $ProjectRoot "public\assets\fenix_pub"
$CasaDirectory = Join-Path $ProjectRoot "public\assets\casa"

$Uploads = @()


# FENIX PUBLICATION PAGES

1..24 | ForEach-Object {
    $FileName = "page_{0:D2}.png" -f $_

    $Uploads += [PSCustomObject]@{
        Source = Join-Path $FenixDirectory $FileName
        Key = "projects/fenix/$FileName"
        ContentType = "image/png"
    }
}


# FENIX TYPOGRAPHY

$Uploads += [PSCustomObject]@{
    Source = Join-Path $FenixDirectory "fenix_pub_typeface1.jpg"
    Key = "projects/fenix/fenix_pub_typeface1.jpg"
    ContentType = "image/jpeg"
}

$Uploads += [PSCustomObject]@{
    Source = Join-Path $FenixDirectory "fenix_pub_typeface2.jpg"
    Key = "projects/fenix/fenix_pub_typeface2.jpg"
    ContentType = "image/jpeg"
}

$Uploads += [PSCustomObject]@{
    Source = Join-Path $FenixDirectory "sugar.png"
    Key = "projects/fenix/sugar.png"
    ContentType = "image/png"
}


# FENIX PHOTOGRAPHY

$Uploads += [PSCustomObject]@{
    Source = Join-Path $FenixDirectory "fenix_pub_photography1_final_pages.png"
    Key = "projects/fenix/fenix_pub_photography1_final_pages.png"
    ContentType = "image/png"
}

$Uploads += [PSCustomObject]@{
    Source = Join-Path $FenixDirectory "fenix_pub_photography2_final_pages.png"
    Key = "projects/fenix/fenix_pub_photography2_final_pages.png"
    ContentType = "image/png"
}


# FENIX EDITORIAL DEVELOPMENT

$Uploads += [PSCustomObject]@{
    Source = Join-Path $FenixDirectory "fenix_pub_dep1_final_pages.png"
    Key = "projects/fenix/fenix_pub_dep1_final_pages.png"
    ContentType = "image/png"
}

$Uploads += [PSCustomObject]@{
    Source = Join-Path $FenixDirectory "fenix_pub_depa1_final_pages.png"
    Key = "projects/fenix/fenix_pub_depa1_final_pages.png"
    ContentType = "image/png"
}


# FENIX MOODBOARD

$Uploads += [PSCustomObject]@{
    Source = Join-Path $FenixDirectory "fenix_pub_moodboard.png"
    Key = "projects/fenix/fenix_pub_moodboard.png"
    ContentType = "image/png"
}


# CASA

$CasaFiles = @(
    "casa_pres1.png",
    "casa_red.png",
    "casa_ryg.png",
    "casa_pres2.png",
    "casa_pres3.png",
    "casa_bw.png",
    "casa_square.png",
    "casa_pres4.png",
    "casa_pres5.png",
    "casa_pres6.png"
)

foreach ($FileName in $CasaFiles) {
    $Uploads += [PSCustomObject]@{
        Source = Join-Path $CasaDirectory $FileName
        Key = "projects/casa-guadalupe/$FileName"
        ContentType = "image/png"
    }
}


# CHECK FILES FIRST

Write-Host ""
Write-Host "Checking project images..." -ForegroundColor Cyan

foreach ($Item in $Uploads) {
    if (-not (Test-Path $Item.Source)) {
        throw "Missing file: $($Item.Source)"
    }
}

Write-Host "All $($Uploads.Count) files were found." -ForegroundColor Green
Write-Host ""


# UPLOAD TO R2

$Current = 0

foreach ($Item in $Uploads) {
    $Current++

    Write-Host "[$Current/$($Uploads.Count)] Uploading $($Item.Key)" -ForegroundColor Cyan

    & npx wrangler r2 object put "$Bucket/$($Item.Key)" `
        --file "$($Item.Source)" `
        --content-type "$($Item.ContentType)" `
        --cache-control "public, max-age=31536000, immutable" `
        --remote

    if ($LASTEXITCODE -ne 0) {
        throw "Upload failed for $($Item.Source)"
    }
}

Write-Host ""
Write-Host "All existing portfolio images are now in R2!" -ForegroundColor Green