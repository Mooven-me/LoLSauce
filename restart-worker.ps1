# restart-worker.ps1
while ($true) {
    Write-Host "$(Get-Date): Starting Symfony worker..."
    
    # Run the docker command
    docker exec lolsauce-php-1 php bin/console messenger:consume async -vv --memory-limit=128M --time-limit=3600
    
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "$(Get-Date): Worker stopped gracefully"
    } else {
        Write-Host "$(Get-Date): Worker crashed with exit code $exitCode"
    }
    
    Write-Host "$(Get-Date): Restarting in 5 seconds..."
    Start-Sleep -Seconds 5
}