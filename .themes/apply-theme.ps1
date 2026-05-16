param(
  [Parameter(Mandatory=$true)][string]$Target,
  [Parameter(Mandatory=$true)][hashtable]$Palette,
  [Parameter(Mandatory=$true)][string]$DisplayName,
  [Parameter(Mandatory=$true)][hashtable]$HexMap,
  [hashtable]$UnitGradients
)

# Target: full path to destination folder (will be created by copying politicsapp source).
# Palette: hashtable with keys: bg, cardSolid, cardGlass, primary, primaryLight, primaryMid, primaryAccent, deep, shadow,
#                              text, muted, border, glass, glassBorder, themeColor, bodyGradient
# HexMap: { 'oldHex' = 'newHex' } for replacing inline gradients across all files
# UnitGradients: optional { unitNum = "linear-gradient(...)" } to rewrite units.js

$ErrorActionPreference = 'Stop'

$indexPath = Join-Path $Target 'index.html'
$index = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)

# ── Replace :root block ──────────────────────────────────────────────
$newRoot = @"
  :root {
    --primary: $($Palette.primary);
    --primary-light: $($Palette.primaryLight);
    --primary-mid: $($Palette.primaryMid);
    --primary-accent: $($Palette.primaryAccent);
    --green: #4ade80;
    --green-light: #1a2e1a;
    --yellow: #f5c842;
    --yellow-light: #2e2a1a;
    --red: #e05a5a;
    --red-light: #2e1a1a;
    --teal: #5ac8c8;
    --teal-light: #1a2e2e;
    --bg: $($Palette.bg);
    --card: $($Palette.cardGlass);
    --card-solid: $($Palette.cardSolid);
    --text: $($Palette.text);
    --muted: $($Palette.muted);
    --border: $($Palette.border);
    --glass: $($Palette.glass);
    --glass-strong: $($Palette.glassStrong);
    --glass-border: $($Palette.glassBorder);
    --radius: 16px;
    --shadow: 0 2px 16px rgba(0,0,0,0.07);
    --body-gradient: $($Palette.bodyGradient);
  }
"@

$rootMatch = [regex]::Match($index, '(?s):root\s*\{.*?\}')
if ($rootMatch.Success) {
  $index = $index.Substring(0, $rootMatch.Index) + $newRoot + $index.Substring($rootMatch.Index + $rootMatch.Length)
}

# ── Title and theme-color meta ───────────────────────────────────────
$index = $index -replace '<title>Politics</title>', "<title>Politics - $DisplayName</title>"
$index = $index -replace '"theme-color" content="#2a1f3a"', "`"theme-color`" content=`"$($Palette.themeColor)`""
$index = $index -replace 'apple-mobile-web-app-title" content="Politics"', "apple-mobile-web-app-title`" content=`"Politics`""

# ── Hex-map replacement across index.html (gradients in CSS rules) ──
foreach ($k in $HexMap.Keys) {
  $index = $index -replace [regex]::Escape($k), $HexMap[$k]
}

[System.IO.File]::WriteAllText($indexPath, $index, (New-Object System.Text.UTF8Encoding $false))

# ── Apply hex map to data/units.js if no explicit UnitGradients given ──
$unitsPath = Join-Path $Target 'data\units.js'
$unitsContent = [System.IO.File]::ReadAllText($unitsPath, [System.Text.Encoding]::UTF8)
if ($UnitGradients) {
  foreach ($k in $UnitGradients.Keys) {
    $pattern = "(unitNum:$k,[^,]*?gradient:`")[^`"]+(`")"
    $unitsContent = [regex]::Replace($unitsContent, $pattern, "`${1}$($UnitGradients[$k])`${2}")
  }
} else {
  foreach ($k in $HexMap.Keys) {
    $unitsContent = $unitsContent -replace [regex]::Escape($k), $HexMap[$k]
  }
}
[System.IO.File]::WriteAllText($unitsPath, $unitsContent, (New-Object System.Text.UTF8Encoding $false))

# ── manifest.json ────────────────────────────────────────────────────
$manifestPath = Join-Path $Target 'manifest.json'
$manifest = [System.IO.File]::ReadAllText($manifestPath, [System.Text.Encoding]::UTF8)
$manifest = $manifest -replace '"name": "Politics"', "`"name`": `"Politics - $DisplayName`""
$manifest = $manifest -replace '"short_name": "Politics"', "`"short_name`": `"Politics`""
$manifest = $manifest -replace '"background_color": "#2a1f3a"', "`"background_color`": `"$($Palette.themeColor)`""
$manifest = $manifest -replace '"theme_color": "#2a1f3a"', "`"theme_color`": `"$($Palette.themeColor)`""
[System.IO.File]::WriteAllText($manifestPath, $manifest, (New-Object System.Text.UTF8Encoding $false))

# ── sw.js: bump cache name per theme + per build to defeat stale SW cache ──
$swPath = Join-Path $Target 'sw.js'
if (Test-Path $swPath) {
  $sw = [System.IO.File]::ReadAllText($swPath, [System.Text.Encoding]::UTF8)
  $themeSlug = ($DisplayName.ToLower() -replace '[^a-z0-9]+','-')
  $stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $sw = $sw -replace "const CACHE_NAME = '[^']+';", "const CACHE_NAME = 'politicsapp-$themeSlug-$stamp';"
  [System.IO.File]::WriteAllText($swPath, $sw, (New-Object System.Text.UTF8Encoding $false))
}

# ── README.md ────────────────────────────────────────────────────────
$readmePath = Join-Path $Target 'README.md'
if (Test-Path $readmePath) {
  $readme = [System.IO.File]::ReadAllText($readmePath, [System.Text.Encoding]::UTF8)
  $readme = $readme -replace '^# Politics$', "# Politics - $DisplayName"
  $readme = $readme -replace '^# Politics\s', "# Politics - $DisplayName`n"
  [System.IO.File]::WriteAllText($readmePath, $readme, (New-Object System.Text.UTF8Encoding $false))
}

Write-Host "Themed: $Target ($DisplayName)"
