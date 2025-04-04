# Custom DNS Scripts

These scripts add local DNS entries to your system's hosts file for development purposes.

## DNS Entries Added

```
127.0.0.1 admin.esd.local
127.0.0.1 customer.esd.local
127.0.0.1 driver.esd.local
127.0.0.1 api.esd.local
127.0.0.1 temporal.esd.local
```

## Usage Instructions

### Unix Systems (Linux/macOS)

1. Open a terminal
2. Navigate to this directory
3. Make the script executable:
   ```bash
   chmod +x add_dns_unix.sh
   ```
4. Run the script with sudo:
   ```bash
   sudo ./add_dns_unix.sh
   ```

### Windows Systems

#### Using PowerShell (Recommended)

1. Right-click on `add_dns_windows.ps1`
2. Select "Run with PowerShell as Administrator"

If you get execution policy errors, you may need to run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

#### Using Batch File

1. Right-click on `add_dns_windows.bat`
2. Select "Run as administrator"

## Verification

After running the script, you can verify the DNS entries are working by:

1. Pinging one of the domains:
   ```
   ping admin.esd.local
   ```
2. It should resolve to 127.0.0.1
