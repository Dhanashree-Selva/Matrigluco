param([string]$DrawableDirectory='core/designsystem/src/main/res/drawable')
$ErrorActionPreference='Stop'
$files=Get-ChildItem -LiteralPath $DrawableDirectory -Filter 'ic_huge_*_24.xml'
if($files.Count -ne 32){throw "Expected 32 canonical Hugeicons vectors, found $($files.Count)."}
foreach($file in $files){
 [xml]$xml=Get-Content -LiteralPath $file.FullName -Raw
 $vector=$xml.vector
 if($vector.width -ne '24dp' -or $vector.height -ne '24dp' -or $vector.viewportWidth -ne '24' -or $vector.viewportHeight -ne '24'){throw "Invalid 24x24 geometry in $($file.Name)"}
 if(-not $vector.path){throw "No paths in $($file.Name)"}
 foreach($path in $vector.path){if([string]::IsNullOrWhiteSpace($path.pathData)){throw "Empty path in $($file.Name)"};if($path.strokeWidth -ne '1.5'){throw "Inconsistent stroke in $($file.Name)"}}
}
$legacy=Get-ChildItem -LiteralPath $DrawableDirectory -Filter 'ic_huge_*.xml'|Where-Object{$_.BaseName -notmatch '_24$'}
if($legacy){throw "Legacy Hugeicons resources remain: $($legacy.Name -join ', ')"}
Write-Output "Validated $($files.Count) canonical 24x24 Hugeicons vectors."
