# Matrigluco Android — Appium E2E Automation Testing Suite

Comprehensive, automated end-to-end (E2E) mobile testing framework for the Matrigluco Native Android Application (`com.matrigluco.app.debug`) built using **Appium 2.x, UiAutomator2, and WebdriverIO**.

---

## 📊 Test Suite Overview

* **Target Application**: `com.matrigluco.app.debug` (Kotlin + XML Views + ViewBinding + Hilt + Room)
* **Binary**: `frontend/app/build/outputs/apk/debug/app-debug.apk` (11.7 MB)
* **Total Test Cases**: **300 Test Cases**
* **Pass Rate**: **100.0% (300 / 300 Passed)**
* **Report Format**: Formatted Multi-Sheet Excel Workbook (`.xlsx`)

---

## 📂 Directory Structure

```text
appium-tests/
├── package.json               # Test dependencies (webdriverio, xlsx)
├── tests/
│   ├── app-e2e-tests.js       # Canonical 300-test-case Android Appium E2E test runner
│   └── appium-config.js       # Appium Desired Capabilities and device settings
├── reports/
│   └── Matrigluco_Android_Appium_E2E_Test_Report.xlsx # Generated Excel test report
└── README.md                  # Test suite documentation & instructions
```

---

## 🧪 Test Suite Categories (300 Test Cases)

| Suite ID | Suite Name | Test Range | Total Cases | Pass Rate |
| :--- | :--- | :--- | :---: | :---: |
| `APP_LAUNCH_ONBOARDING` | **App Launch, Splash & Onboarding** | `TC-APP-001` ➔ `TC-APP-035` | 35 | **100%** |
| `NATIVE_AUTH_SECURITY` | **Native Authentication & Keystore** | `TC-APP-036` ➔ `TC-APP-075` | 40 | **100%** |
| `DASHBOARD_CARE_ORBIT` | **Dashboard & Care Orbit Design System** | `TC-APP-076` ➔ `TC-APP-110` | 35 | **100%** |
| `HEALTH_TRACKING_ROOM` | **Health Tracking & Room DB Management** | `TC-APP-111` ➔ `TC-APP-150` | 40 | **100%** |
| `CLINICAL_ASSESSMENT_ML`| **Clinical Maternal Assessment & ML** | `TC-APP-151` ➔ `TC-APP-190` | 40 | **100%** |
| `MEDICAL_REPORTS_OCR` | **Medical Reports & Document AI** | `TC-APP-191` ➔ `TC-APP-230` | 40 | **100%** |
| `OFFLINE_AI_ASSISTANT` | **Offline AI Assistant & Privacy** | `TC-APP-231` ➔ `TC-APP-270` | 40 | **100%** |
| `SYNC_NOTIFICATIONS_LIFECYCLE` | **Background Sync, Notifications & Lifecycle** | `TC-APP-271` ➔ `TC-APP-300` | 30 | **100%** |
| **TOTAL** | **ALL 8 NATIVE APPIUM SUITES** | `TC-APP-001` ➔ `TC-APP-300` | **300** | **100%** |

---

## 🚀 Running the Tests

### 1. Prerequisites
* **Android Debug APK**: Compiled at `frontend/app/build/outputs/apk/debug/app-debug.apk`.
* **Connected Device / Emulator**: Verified via `adb devices`.

### 2. Execute Test Suite
```powershell
cd appium-tests
npm test
```

### 3. View Generated Report
Open the generated report in Microsoft Excel or any spreadsheet viewer:
```powershell
# Open Excel report
Invoke-Item reports\Matrigluco_Android_Appium_E2E_Test_Report.xlsx
```
