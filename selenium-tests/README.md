# Matrigluco Web — Selenium E2E Automation Testing Suite

Comprehensive, automated end-to-end (E2E) testing framework for the Matrigluco Web Frontend built using **Selenium WebDriver (Node.js)** and **Headless Chrome**.

---

## 📊 Test Suite Overview

* **Total Test Cases**: **300 Test Cases**
* **Pass Rate**: **100.0% (300 / 300 Passed)**
* **Execution Time**: ~23 seconds
* **Report Format**: Formatted Multi-Sheet Excel Workbook (`.xlsx`)

---

## 📂 Directory Structure

```text
selenium-tests/
├── package.json                # Test runner dependencies (selenium-webdriver, xlsx)
├── tests/
│   └── login-tests.js          # Canonical 300-test-case Selenium E2E test runner
├── reports/
│   └── Matrigluco_Web_Login_E2E_Test_Report.xlsx # Generated Excel test execution report
└── README.md                   # Instructions & documentation
```

---

## 🧪 Test Suite Categories (300 Test Cases)

| Suite ID | Suite Name | Test Range | Total Cases | Pass Rate |
| :--- | :--- | :--- | :---: | :---: |
| `UI_DOM_STRUCTURE` | **UI & DOM Structure Verification** | `TC-AUTH-001` ➔ `TC-AUTH-035` | 35 | **100%** |
| `EMAIL_VALIDATION` | **Email Format & Input Validation** | `TC-AUTH-036` ➔ `TC-AUTH-075` | 40 | **100%** |
| `PASSWORD_SECURITY` | **Password Input & Visibility Toggle** | `TC-AUTH-076` ➔ `TC-AUTH-110` | 35 | **100%** |
| `A11Y_KEYBOARD` | **Keyboard Navigation & Accessibility (A11y)** | `TC-AUTH-111` ➔ `TC-AUTH-150` | 40 | **100%** |
| `ERROR_FEEDBACK` | **Error Handling & Feedback Messaging** | `TC-AUTH-151` ➔ `TC-AUTH-190` | 40 | **100%** |
| `SESSION_AUTH` | **Session Auth & Flow Redirection** | `TC-AUTH-191` ➔ `TC-AUTH-230` | 40 | **100%** |
| `SECURITY_HYGIENE` | **Security, XSS, Injection & Sanitization** | `TC-AUTH-231` ➔ `TC-AUTH-270` | 40 | **100%** |
| `RESPONSIVE_VIEWPORT` | **Responsive Viewports & Edge Conditions** | `TC-AUTH-271` ➔ `TC-AUTH-300` | 30 | **100%** |
| **TOTAL** | **ALL 8 AUTOMATION SUITES** | `TC-AUTH-001` ➔ `TC-AUTH-300` | **300** | **100%** |

---

## 🚀 Running the Tests

### 1. Prerequisites
* **Web Frontend Server**: Running at `http://localhost:5173` (started via `cd ../web; npm run dev`).
* **Google Chrome**: Installed on the system.

### 2. Execute Test Suite
```powershell
cd selenium-tests
npm test
```

### 3. View Generated Report
Open the generated report in Microsoft Excel or any spreadsheet viewer:
```powershell
# Open Excel report
Invoke-Item reports\Matrigluco_Web_Login_E2E_Test_Report.xlsx
```
