param([int]$Port = 3000)

$dir = $PSScriptRoot
if (-not $dir) { $dir = (Get-Location).Path }

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Starting Baskly.money Local Server      " -ForegroundColor Green
Write-Host "  Directory: $dir" -ForegroundColor Gray
Write-Host "  URL:       http://localhost:$Port       " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
} catch {
    Write-Host "Port $Port is busy. Trying port 3001..." -ForegroundColor Yellow
    $Port = 3001
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Start()
}

Start-Process "http://localhost:$Port/"

Write-Host "Server running. Press Ctrl+C in this window to stop.`n" -ForegroundColor DarkGray

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/" -or $path -eq "") { $path = "/index.html" }
        $localFile = Join-Path $dir ($path.TrimStart('/'))

        if (Test-Path $localFile -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localFile)
            $ext = [System.IO.Path]::GetExtension($localFile).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".svg"  { "image/svg+xml" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.Close()
    } catch {
        # Handle client aborts smoothly
    }
}
