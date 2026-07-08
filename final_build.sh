#!/bin/bash
set -ex

# The one and only script to build the final APK.

echo "--- FINAL BUILD SCRIPT STARTED ---"

# Navigate to the android directory
cd android

# Clean the build
echo "--- Cleaning workspace ---"
./gradlew clean --no-daemon

# Run the final assembly
echo "--- Assembling Release APK ---"
./gradlew assembleRelease --no-daemon

# Verify the output
echo "--- Verifying Final APK ---"
ls -l app/build/outputs/apk/release/

echo "--- FINAL BUILD SCRIPT COMPLETED ---"
