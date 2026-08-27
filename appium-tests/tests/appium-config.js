/**
 * =============================================================================
 * MATRIGLUCO ANDROID APP — APPIUM DESIRED CAPABILITIES & CONFIGURATION
 * =============================================================================
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const APK_PATH = path.resolve(
  __dirname,
  "../../frontend/app/build/outputs/apk/debug/app-debug.apk"
);

export const APPIUM_CONFIG = {
  hostname: process.env.APPIUM_HOST || "127.0.0.1",
  port: parseInt(process.env.APPIUM_PORT || "4723", 10),
  path: "/",
  capabilities: {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": process.env.ANDROID_DEVICE_NAME || "Android Device",
    "appium:app": APK_PATH,
    "appium:appPackage": "com.matrigluco.app.debug",
    "appium:appActivity": "com.matrigluco.app.MainActivity",
    "appium:noReset": false,
    "appium:fullReset": false,
    "appium:autoGrantPermissions": true,
    "appium:newCommandTimeout": 240,
    "appium:ensureWebviewsHavePages": true,
    "appium:nativeWebScreenshot": true,
    "appium:connectHardwareKeyboard": true,
  },
};
