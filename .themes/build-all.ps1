# Build politicsapp-civic, politicsapp-newsroom, politicsapp-forum from politicsapp source.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot      # ...\politicsapp
$workspace = Split-Path -Parent $root          # ...\CLAUDE
. (Join-Path $PSScriptRoot 'apply-theme.ps1') -? *> $null  # dot-source disabled; call as command

function Build-Theme {
  param($Name, $Display, [hashtable]$Palette, [hashtable]$HexMap, [hashtable]$UnitGradients)
  $dest = Join-Path $workspace $Name
  if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
  Copy-Item -Recurse -Path $root -Destination $dest
  # Strip the .themes folder from the copy
  $themesInCopy = Join-Path $dest '.themes'
  if (Test-Path $themesInCopy) { Remove-Item -Recurse -Force $themesInCopy }
  & (Join-Path $PSScriptRoot 'apply-theme.ps1') -Target $dest -Palette $Palette -DisplayName $Display -HexMap $HexMap -UnitGradients $UnitGradients
}

# ════════════════════════════════════════════════════════════════════
# CIVIC — navy + crimson + gold
# ════════════════════════════════════════════════════════════════════
$civicPalette = @{
  bg              = '#0d1424'
  cardSolid       = '#16213e'
  cardGlass       = 'rgba(22, 33, 62, 0.7)'
  primary         = '#c8102e'
  primaryLight    = '#1a2540'
  primaryMid      = '#a00d24'
  primaryAccent   = '#d4af37'
  text            = '#f4f1e8'
  muted           = '#94a3c7'
  border          = 'rgba(212, 175, 55, 0.28)'
  glass           = 'rgba(22, 33, 62, 0.7)'
  glassStrong     = 'rgba(22, 33, 62, 0.85)'
  glassBorder     = 'rgba(212, 175, 55, 0.28)'
  themeColor      = '#0d1424'
  bodyGradient    = @'
radial-gradient(ellipse at 10% 5%,  rgba(200, 16, 46, 0.20), transparent 55%),
      radial-gradient(ellipse at 90% 10%, rgba(212, 175, 55, 0.16), transparent 55%),
      radial-gradient(ellipse at 50% 95%, rgba(160, 13, 36, 0.18), transparent 60%),
      radial-gradient(ellipse at 95% 75%, rgba(212, 175, 55, 0.12), transparent 55%),
      linear-gradient(135deg, #0d1424 0%, #16213e 50%, #1a2540 100%)
'@
}
$civicHexMap = @{
  '#f48ca8' = '#c8102e'   # pink accent  → crimson
  '#c084fc' = '#d4af37'   # purple       → gold (primary gradient stop)
  '#a78bfa' = '#a00d24'   # purple-mid   → crimson-deep
  '#ff8fcd' = '#d4af37'   # bright pink  → gold
  '#7c5fd0' = '#a00d24'   # deep purple  → crimson-deep
  '#6b3aa8' = '#5a0a18'   # button shadow → deep crimson
  '#8b5cf6' = '#c8102e'   # purple       → crimson
  '#d4a8ff' = '#e6c869'   # light purple → light gold
  '#9e6dd0' = '#c8102e'   # mid purple   → crimson
  '#e07d9b' = '#c8102e'   # pink         → crimson
  '#5a2890' = '#5a0a18'
  '#4a3080' = '#5a0a18'
  '#5a2a8a' = '#5a0a18'
  '#7a2a8a' = '#5a0a18'
  '#702a70' = '#5a0a18'
  '#4a2870' = '#5a0a18'
  '#4a2880' = '#5a0a18'
  '#7a3a8a' = '#5a0a18'
  '#603a8a' = '#5a0a18'
  'rgba(192, 132, 252' = 'rgba(212, 175, 55'   # all purple alpha → gold alpha
  'rgba(192,132,252' = 'rgba(212,175,55'
  'rgba(244, 140, 168' = 'rgba(200, 16, 46'
  'rgba(167, 139, 250' = 'rgba(160, 13, 36'
  'rgba(236, 72, 153' = 'rgba(212, 175, 55'
}
Build-Theme -Name 'politicsapp-civic' -Display 'Civic' -Palette $civicPalette -HexMap $civicHexMap -UnitGradients $null

# ════════════════════════════════════════════════════════════════════
# NEWSROOM — charcoal + crimson + cream
# ════════════════════════════════════════════════════════════════════
$newsroomPalette = @{
  bg              = '#1a1a1c'
  cardSolid       = '#232327'
  cardGlass       = 'rgba(35, 35, 39, 0.75)'
  primary         = '#dc2626'
  primaryLight    = '#2a1818'
  primaryMid      = '#b91c1c'
  primaryAccent   = '#fbbf24'
  text            = '#faf6ef'
  muted           = '#9ca3af'
  border          = 'rgba(220, 38, 38, 0.25)'
  glass           = 'rgba(35, 35, 39, 0.75)'
  glassStrong     = 'rgba(35, 35, 39, 0.9)'
  glassBorder     = 'rgba(220, 38, 38, 0.25)'
  themeColor      = '#1a1a1c'
  bodyGradient    = @'
radial-gradient(ellipse at 15% 10%, rgba(220, 38, 38, 0.14), transparent 55%),
      radial-gradient(ellipse at 85% 90%, rgba(251, 191, 36, 0.10), transparent 55%),
      linear-gradient(180deg, #1a1a1c 0%, #232327 100%)
'@
}
$newsroomHexMap = @{
  '#f48ca8' = '#dc2626'   # crimson
  '#c084fc' = '#fbbf24'   # amber (was purple primary -> use amber for gradient contrast)
  '#a78bfa' = '#f59e0b'   # orange-amber
  '#ff8fcd' = '#ef4444'   # red
  '#7c5fd0' = '#991b1b'   # deep red
  '#6b3aa8' = '#7f1d1d'   # button shadow
  '#8b5cf6' = '#ef4444'   # red (was matching #c084fc -> #fbbf24 causing flat gradients)
  '#d4a8ff' = '#fde047'   # light gold
  '#9e6dd0' = '#dc2626'   # crimson
  '#e07d9b' = '#f87171'   # light coral
  '#5a2890' = '#7f1d1d'
  '#4a3080' = '#7f1d1d'
  '#5a2a8a' = '#7f1d1d'
  '#7a2a8a' = '#7f1d1d'
  '#702a70' = '#7f1d1d'
  '#4a2870' = '#7f1d1d'
  '#4a2880' = '#7f1d1d'
  '#7a3a8a' = '#7f1d1d'
  '#603a8a' = '#7f1d1d'
  'rgba(192, 132, 252' = 'rgba(220, 38, 38'
  'rgba(192,132,252' = 'rgba(220,38,38'
  'rgba(244, 140, 168' = 'rgba(220, 38, 38'
  'rgba(167, 139, 250' = 'rgba(185, 28, 28'
  'rgba(236, 72, 153' = 'rgba(251, 191, 36'
}
Build-Theme -Name 'politicsapp-newsroom' -Display 'Newsroom' -Palette $newsroomPalette -HexMap $newsroomHexMap -UnitGradients $null

# ════════════════════════════════════════════════════════════════════
# FORUM - turquoise-dominant dark (deep teal base, turquoise primary, cyan accents)
# ════════════════════════════════════════════════════════════════════
$forumPalette = @{
  bg              = '#0a2a20'
  cardSolid       = '#0f3a2a'
  cardGlass       = 'rgba(15, 58, 42, 0.7)'
  primary         = '#2dd4bf'
  primaryLight    = '#0f3a2a'
  primaryMid      = '#0d9488'
  primaryAccent   = '#67e8f9'
  text            = '#e4f0ee'
  muted           = '#8acdc4'
  border          = 'rgba(45, 212, 191, 0.45)'
  glass           = 'rgba(15, 58, 42, 0.72)'
  glassStrong     = 'rgba(15, 58, 42, 0.9)'
  glassBorder     = 'rgba(45, 212, 191, 0.45)'
  themeColor      = '#0a2a20'
  bodyGradient    = @"
radial-gradient(ellipse at 12% 8%,  rgba(45, 212, 191, 0.45), transparent 55%),
      radial-gradient(ellipse at 88% 12%, rgba(103, 232, 249, 0.35), transparent 55%),
      radial-gradient(ellipse at 50% 95%, rgba(13, 148, 136, 0.45), transparent 60%),
      radial-gradient(ellipse at 95% 75%, rgba(94, 234, 212, 0.32), transparent 55%),
      linear-gradient(135deg, #0a2a20 0%, #0f3a2a 50%, #1a5440 100%)
"@
}
$forumHexMap = @{
  '#f48ca8' = '#67e8f9'
  '#c084fc' = '#2dd4bf'
  '#a78bfa' = '#0d9488'
  '#ff8fcd' = '#67e8f9'
  '#7c5fd0' = '#0a6963'
  '#6b3aa8' = '#053633'
  '#8b5cf6' = '#5eead4'
  '#d4a8ff' = '#a5f3eb'
  '#9e6dd0' = '#2dd4bf'
  '#e07d9b' = '#67e8f9'
  '#5a2890' = '#053633'
  '#4a3080' = '#053633'
  '#5a2a8a' = '#053633'
  '#7a2a8a' = '#053633'
  '#702a70' = '#053633'
  '#4a2870' = '#053633'
  '#4a2880' = '#053633'
  '#7a3a8a' = '#053633'
  '#603a8a' = '#053633'
  'rgba(192, 132, 252' = 'rgba(45, 212, 191'
  'rgba(192,132,252' = 'rgba(45,212,191'
  'rgba(244, 140, 168' = 'rgba(103, 232, 249'
  'rgba(167, 139, 250' = 'rgba(13, 148, 136'
  'rgba(236, 72, 153' = 'rgba(94, 234, 212'
}
Build-Theme -Name 'politicsapp-forum' -Display 'Forum' -Palette $forumPalette -HexMap $forumHexMap -UnitGradients $null

Write-Host "`nAll three themes built."
