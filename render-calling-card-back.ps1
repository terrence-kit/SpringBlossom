$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$width = 1659
$height = 948
$outputPath = Join-Path $PSScriptRoot 'Spring-Blossom-Calling-Card-Back.png'

$bitmap = New-Object System.Drawing.Bitmap(
  $width,
  $height,
  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$canvas = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$graphics.Clear([System.Drawing.Color]::Black)

$venuePath = Join-Path $PSScriptRoot 'INTERIOR.png'
if (-not (Test-Path -LiteralPath $venuePath)) {
  throw "Missing venue image: $venuePath"
}

$venueImage = [System.Drawing.Image]::FromFile($venuePath)
$targetRatio = $width / $height
$sourceWidth = $venueImage.Width
$sourceHeight = [int]($sourceWidth / $targetRatio)
$sourceY = [int](($venueImage.Height - $sourceHeight) / 2)
$graphics.DrawImage(
  $venueImage,
  $canvas,
  0,
  $sourceY,
  $sourceWidth,
  $sourceHeight,
  [System.Drawing.GraphicsUnit]::Pixel
)
$venueImage.Dispose()

$blackOverlay = New-Object System.Drawing.SolidBrush(
  [System.Drawing.Color]::FromArgb(205, 0, 0, 0)
)
$graphics.FillRectangle($blackOverlay, $canvas)

$background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $canvas,
  [System.Drawing.Color]::FromArgb(185, 0, 0, 0),
  [System.Drawing.Color]::FromArgb(35, 79, 0, 31),
  0
)
$graphics.FillRectangle($background, $canvas)

$pinkGlow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 255, 31, 119))
$graphics.FillEllipse($pinkGlow, -180, -260, 720, 720)
$graphics.FillEllipse($pinkGlow, 1240, 540, 620, 620)

$gold = [System.Drawing.Color]::FromArgb(255, 230, 180, 76)
$goldSoft = [System.Drawing.Color]::FromArgb(145, 230, 180, 76)
$pink = [System.Drawing.Color]::FromArgb(255, 216, 102, 137)
$paper = [System.Drawing.Color]::FromArgb(255, 255, 248, 243)
$muted = [System.Drawing.Color]::FromArgb(255, 190, 171, 181)

$outerBorder = New-Object System.Drawing.Pen($gold, 3)
$innerBorder = New-Object System.Drawing.Pen($goldSoft, 1)
$graphics.DrawRectangle($outerBorder, 24, 24, $width - 49, $height - 49)
$graphics.DrawRectangle($innerBorder, 38, 38, $width - 77, $height - 77)

function Draw-Blossom {
  param(
    [System.Drawing.Graphics]$Target,
    [float]$CenterX,
    [float]$CenterY,
    [float]$Size,
    [int]$Opacity
  )

  $petalBrush = New-Object System.Drawing.SolidBrush(
    [System.Drawing.Color]::FromArgb($Opacity, 221, 70, 127)
  )
  $centerBrush = New-Object System.Drawing.SolidBrush(
    [System.Drawing.Color]::FromArgb([Math]::Min(255, $Opacity + 60), 255, 216, 121)
  )

  for ($index = 0; $index -lt 5; $index++) {
    $angle = (($index * 72) - 90) * [Math]::PI / 180
    $petalX = $CenterX + ([Math]::Cos($angle) * $Size * 0.35) - ($Size * 0.25)
    $petalY = $CenterY + ([Math]::Sin($angle) * $Size * 0.35) - ($Size * 0.18)
    $Target.FillEllipse($petalBrush, $petalX, $petalY, $Size * 0.5, $Size * 0.36)
  }

  $Target.FillEllipse(
    $centerBrush,
    $CenterX - ($Size * 0.09),
    $CenterY - ($Size * 0.09),
    $Size * 0.18,
    $Size * 0.18
  )

  $petalBrush.Dispose()
  $centerBrush.Dispose()
}

Draw-Blossom -Target $graphics -CenterX 70 -CenterY 78 -Size 76 -Opacity 125
Draw-Blossom -Target $graphics -CenterX 1515 -CenterY 104 -Size 95 -Opacity 105
Draw-Blossom -Target $graphics -CenterX 1580 -CenterY 160 -Size 54 -Opacity 75
Draw-Blossom -Target $graphics -CenterX 105 -CenterY 850 -Size 82 -Opacity 75

$brandFont = New-Object System.Drawing.Font('Georgia', 49, [System.Drawing.FontStyle]::Bold)
$restoFont = New-Object System.Drawing.Font('Segoe UI', 14, [System.Drawing.FontStyle]::Bold)
$headingFont = New-Object System.Drawing.Font('Segoe UI', 20, [System.Drawing.FontStyle]::Bold)
$qrLabelFont = New-Object System.Drawing.Font('Georgia', 25, [System.Drawing.FontStyle]::Bold)
$qrDetailFont = New-Object System.Drawing.Font('Segoe UI', 11, [System.Drawing.FontStyle]::Regular)
$locationLabelFont = New-Object System.Drawing.Font('Segoe UI', 11, [System.Drawing.FontStyle]::Bold)
$locationFont = New-Object System.Drawing.Font('Georgia', 24, [System.Drawing.FontStyle]::Bold)
$hoursFont = New-Object System.Drawing.Font('Segoe UI', 11, [System.Drawing.FontStyle]::Regular)
$monogramFont = New-Object System.Drawing.Font('Georgia', 43, [System.Drawing.FontStyle]::Bold)

$goldBrush = New-Object System.Drawing.SolidBrush($gold)
$pinkBrush = New-Object System.Drawing.SolidBrush($pink)
$paperBrush = New-Object System.Drawing.SolidBrush($paper)
$mutedBrush = New-Object System.Drawing.SolidBrush($muted)

$logoPen = New-Object System.Drawing.Pen($gold, 3)
$graphics.DrawEllipse($logoPen, 104, 70, 125, 125)
$graphics.DrawString('SB', $monogramFont, $goldBrush, 120, 87)
$graphics.DrawString('SPRING BLOSSOM', $brandFont, $goldBrush, 265, 65)
$graphics.DrawString('R E S T O   B A R', $restoFont, $pinkBrush, 270, 143)

$dividerPen = New-Object System.Drawing.Pen($goldSoft, 1)
$graphics.DrawLine($dividerPen, 267, 195, 1540, 195)

$centerFormat = New-Object System.Drawing.StringFormat
$centerFormat.Alignment = [System.Drawing.StringAlignment]::Center
$centerFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
$headingRect = New-Object System.Drawing.RectangleF(0, 203, $width, 50)
$graphics.DrawString('SCAN  |  FOLLOW  |  STAY CONNECTED', $headingFont, $paperBrush, $headingRect, $centerFormat)

$qrFiles = @(
  @{ Path = 'WEBSITE QR.png'; Label = 'WEBSITE'; Detail = 'Scan to explore' },
  @{ Path = 'FACEBOOK QR.png'; Label = 'FACEBOOK'; Detail = 'Spring Blossom Resto Bar' },
  @{ Path = 'INSTAGRAM QR.png'; Label = 'INSTAGRAM'; Detail = '@springblossomrestobar' }
)
$qrXPositions = @(269, 669, 1069)
$qrPanelSize = 320
$qrImageSize = 300
$qrY = 270

$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

$inverseMatrix = New-Object System.Drawing.Imaging.ColorMatrix
$inverseMatrix.Matrix00 = -1
$inverseMatrix.Matrix11 = -1
$inverseMatrix.Matrix22 = -1
$inverseMatrix.Matrix33 = 1
$inverseMatrix.Matrix40 = 1
$inverseMatrix.Matrix41 = 1
$inverseMatrix.Matrix42 = 1
$inverseMatrix.Matrix44 = 1
$inverseAttributes = New-Object System.Drawing.Imaging.ImageAttributes
$inverseAttributes.SetColorMatrix($inverseMatrix)

for ($index = 0; $index -lt $qrFiles.Count; $index++) {
  $item = $qrFiles[$index]
  $sourcePath = Join-Path $PSScriptRoot $item.Path
  if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Missing QR image: $sourcePath"
  }

  $x = $qrXPositions[$index]
  $qrGlowPen = New-Object System.Drawing.Pen(
    [System.Drawing.Color]::FromArgb(48, 255, 63, 146),
    12
  )
  $qrBorderPen = New-Object System.Drawing.Pen($pink, 2)
  $qrInnerPen = New-Object System.Drawing.Pen($goldSoft, 1)
  $graphics.DrawRectangle($qrGlowPen, $x - 7, $qrY - 7, $qrPanelSize + 14, $qrPanelSize + 14)
  $graphics.DrawRectangle($qrBorderPen, $x - 4, $qrY - 4, $qrPanelSize + 8, $qrPanelSize + 8)

  $panelBrush = New-Object System.Drawing.SolidBrush(
    [System.Drawing.Color]::FromArgb(255, 2, 2, 3)
  )
  $graphics.FillRectangle($panelBrush, $x, $qrY, $qrPanelSize, $qrPanelSize)
  $graphics.DrawRectangle($qrInnerPen, $x + 4, $qrY + 4, $qrPanelSize - 8, $qrPanelSize - 8)
  $panelBrush.Dispose()
  $qrGlowPen.Dispose()
  $qrBorderPen.Dispose()
  $qrInnerPen.Dispose()

  $qrImage = [System.Drawing.Image]::FromFile($sourcePath)
  $destination = [System.Drawing.Rectangle]::new(
    [int]($x + 10),
    [int]($qrY + 10),
    [int]$qrImageSize,
    [int]$qrImageSize
  )
  $graphics.DrawImage(
    $qrImage,
    $destination,
    0,
    0,
    $qrImage.Width,
    $qrImage.Height,
    [System.Drawing.GraphicsUnit]::Pixel,
    $inverseAttributes
  )
  $qrImage.Dispose()

  $labelRectangle = [System.Drawing.RectangleF]::new(
    [float]($x - 25),
    608,
    [float]($qrPanelSize + 50),
    42
  )
  $detailRectangle = [System.Drawing.RectangleF]::new(
    [float]($x - 45),
    652,
    [float]($qrPanelSize + 90),
    30
  )
  $graphics.DrawString($item.Label, $qrLabelFont, $goldBrush, $labelRectangle, $centerFormat)
  $graphics.DrawString($item.Detail, $qrDetailFont, $mutedBrush, $detailRectangle, $centerFormat)
}

$locationDivider = New-Object System.Drawing.Pen($pink, 2)
$graphics.DrawLine($locationDivider, 265, 734, 1394, 734)
$locationLabelRect = New-Object System.Drawing.RectangleF(0, 755, $width, 30)
$locationRect = [System.Drawing.RectangleF]::new(70, 793, [float]($width - 140), 48)
$hoursRect = New-Object System.Drawing.RectangleF(0, 855, $width, 28)
$graphics.DrawString('VISIT SPRING BLOSSOM', $locationLabelFont, $pinkBrush, $locationLabelRect, $centerFormat)
$graphics.DrawString('2nd Floor, Xperiential Spot, Basdiot, Moalboal, Cebu', $locationFont, $paperBrush, $locationRect, $centerFormat)
$graphics.DrawString('OPEN DAILY  |  10:00 AM - 1:00 AM', $hoursFont, $mutedBrush, $hoursRect, $centerFormat)

$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()
$blackOverlay.Dispose()
$background.Dispose()
$pinkGlow.Dispose()
$inverseAttributes.Dispose()
$outerBorder.Dispose()
$innerBorder.Dispose()
$logoPen.Dispose()
$dividerPen.Dispose()
$locationDivider.Dispose()
$brandFont.Dispose()
$restoFont.Dispose()
$headingFont.Dispose()
$qrLabelFont.Dispose()
$qrDetailFont.Dispose()
$locationLabelFont.Dispose()
$locationFont.Dispose()
$hoursFont.Dispose()
$monogramFont.Dispose()
$goldBrush.Dispose()
$pinkBrush.Dispose()
$paperBrush.Dispose()
$mutedBrush.Dispose()
$centerFormat.Dispose()

Write-Output $outputPath
