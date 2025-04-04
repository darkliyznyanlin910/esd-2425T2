# PowerShell script to add custom DNS entries to Windows hosts file
# Must run as Administrator

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Please run this script as Administrator"
    exit 1
}

# Hosts file location
$hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"

# DNS entries to add
$entries = @(
    "127.0.0.1 admin.esd.local",
    "127.0.0.1 customer.esd.local",
    "127.0.0.1 driver.esd.local",
    "127.0.0.1 api.esd.local",
    "127.0.0.1 temporal.esd.local"
)

Write-Host "Adding custom DNS entries to $hostsFile..."

# Get current content of hosts file
$currentContent = Get-Content $hostsFile

# Check if entries already exist and add if they don't
foreach ($entry in $entries) {
    if ($currentContent -contains $entry) {
        Write-Host "Entry already exists: $entry"
    }
    else {
        Add-Content -Path $hostsFile -Value $entry
        Write-Host "Added: $entry"
    }
}

Write-Host "Done. Custom DNS entries have been added."

# Flush DNS cache
Write-Host "Flushing DNS cache..."
ipconfig /flushdns
Write-Host "DNS cache flushed." 