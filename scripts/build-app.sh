#!/bin/zsh
# Builds a release binary and wraps it in build/Shipwright Academy.app
set -euo pipefail
cd "$(dirname "$0")/.."

node scripts/check-rules.js
node scripts/build-curriculum.js
swift build -c release
BIN="$(swift build -c release --show-bin-path)"
APP="build/Shipwright Academy.app"

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp "$BIN/ShipwrightAcademy" "$APP/Contents/MacOS/ShipwrightAcademy"
cp -R "$BIN/ShipwrightAcademy_ShipwrightAcademy.bundle" "$APP/Contents/Resources/"

cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Shipwright Academy</string>
  <key>CFBundleDisplayName</key><string>Shipwright Academy</string>
  <key>CFBundleIdentifier</key><string>com.shipwright.academy</string>
  <key>CFBundleExecutable</key><string>ShipwrightAcademy</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleVersion</key><string>1</string>
  <key>LSMinimumSystemVersion</key><string>26.0</string>
  <key>LSApplicationCategoryType</key><string>public.app-category.education</string>
  <key>NSHighResolutionCapable</key><true/>
</dict>
</plist>
PLIST

codesign --force --deep --sign - "$APP"
echo "Built $APP"
