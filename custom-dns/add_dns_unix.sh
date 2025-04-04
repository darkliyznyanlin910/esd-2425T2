#!/bin/bash

# Check if running with sudo/root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# Hosts file location
HOSTS_FILE="/etc/hosts"

# DNS entries to add
ENTRIES=(
  "127.0.0.1 admin.esd.local"
  "127.0.0.1 customer.esd.local"
  "127.0.0.1 driver.esd.local"
  "127.0.0.1 api.esd.local"
  "127.0.0.1 temporal.esd.local"
)

echo "Adding custom DNS entries to $HOSTS_FILE..."

# Check if entries already exist and add if they don't
for ENTRY in "${ENTRIES[@]}"; do
  if grep -q "$ENTRY" "$HOSTS_FILE"; then
    echo "Entry already exists: $ENTRY"
  else
    echo "$ENTRY" >> "$HOSTS_FILE"
    echo "Added: $ENTRY"
  fi
done

echo "Done. Custom DNS entries have been added."

# Flush DNS cache if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Flushing DNS cache for macOS..."
  dscacheutil -flushcache
  killall -HUP mDNSResponder
  echo "DNS cache flushed."
fi

# Flush DNS cache if on Linux (Ubuntu/Debian)
if [ -f /etc/debian_version ]; then
  echo "Flushing DNS cache for Debian/Ubuntu..."
  systemd-resolve --flush-caches 2>/dev/null || service nscd restart 2>/dev/null || true
  echo "DNS cache flushed."
fi 