# Creates a "nice" shortcut on your Desktop that launches the dev server.
# Run once from PowerShell (right-click -> Run with PowerShell, or:  powershell -ExecutionPolicy Bypass -File scripts\create-shortcut.ps1)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$launcher = Join-Path $repoRoot "scripts\launch.bat"
if (-not (Test-Path $launcher)) {
    Write-Error "launch.bat not found at $launcher"
    exit 1
}

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "nice.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $launcher
$shortcut.WorkingDirectory = $repoRoot
$shortcut.WindowStyle = 1
$shortcut.Description = "Start the nice dev server on http://localhost:3030"
$shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,167"
$shortcut.Save()

Write-Host "Created shortcut: $shortcutPath"
Write-Host "Double-click it any time to launch the app."
