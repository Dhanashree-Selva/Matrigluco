# Matrigluco Platform — Baseline & High-Concurrency Load Testing Suite

High-concurrency performance engineering and baseline load testing framework for the Matrigluco Clinical Platform (FastAPI Backend + ML Inference + Tracking Endpoints).

---

## 📊 Baseline Load Test Execution Profile

* **Concurrent Virtual Users (VUs)**: **100 Users simultaneously**
* **Continuous Test Duration**: **60 Seconds (1.0 Minute)**
* **Ramp-Up Window**: 5 seconds
* **Total Requests Handled**: **6,770 Requests**
* **Throughput / RPS**: **110.1 Requests per Second**
* **Fastest Response (Min)**: **3.14 ms**
* **Average Response (Mean)**: **824.52 ms**
* **Median Response (P50)**: **803.55 ms**
* **95th Percentile (P95)**: **1,893.09 ms**
* **Slowest Response (Max)**: **2,728.84 ms**

---

## 📂 Directory Structure

```text
load-tests/
├── package.json               # Dependencies (xlsx)
├── config.js                  # Concurrency (100 VUs), duration (60s), and weighted endpoints
├── index.js                   # High-performance async load testing runner
├── reports/
│   ├── Matrigluco_Baseline_Load_Test_Report.xlsx # Formatted 3-Tab Excel Report
│   └── load-test-summary.json # Machine-readable execution telemetry
└── README.md                  # Documentation & metrics guide
```

---

## 🔍 Metric Interpretation Guide

### 1. Requests Per Second (RPS)
```text
Throughput: ~110.1 req/sec
Meaning: The Matrigluco API handled approximately 110 requests every single second under 100 concurrent users.
```

### 2. Response Time Distribution
```text
Fastest (Min): 3.14 ms       -> Ultra-fast cache & lightweight liveness probes
Average (Mean): 824.52 ms    -> Mean latency across mixed ML & DB queries under full load
Median (P50): 803.55 ms      -> 50% of all requests completed in under 804ms
95th Percentile: 1.89s       -> 95% of all requests completed in under 1.89 seconds
Slowest (Max): 2.73s         -> Heavy authenticated password hashing / cold queries
```

---

## 🧪 Endpoint Performance Breakdown

| Endpoint Name | Method | Route Path | Total Requests | RPS | Min (ms) | Avg (ms) | P95 (ms) | Max (ms) | Success % |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Health Liveness Probe** | `GET` | `/api/v1/health/live` | 2,018 | 32.8 | 3.3 | 791.5 | 1070.3 | 1346.3 | **100%** |
| **Health Readiness Check** | `GET` | `/api/v1/health/ready` | 1,369 | 22.3 | 8.3 | 855.3 | 1146.2 | 1409.9 | **100%** |
| **ML Risk Model Metadata** | `GET` | `/api/v1/ml/models` | 1,031 | 16.8 | 3.1 | 462.0 | 670.1 | 928.8 | **100%** |
| **Clinical GDM Risk Prediction** | `POST`| `/api/v1/ml/assessments`| 1,014 | 16.5 | 4.0 | 469.2 | 678.3 | 928.7 | **100%** |
| **Auth Login Validation** | `POST`| `/api/v1/auth/login` | 690 | 11.2 | 81.7 | 1812.1 | 2369.7 | 2728.8 | **100%** |
| **AI Assistant Gateway** | `GET` | `/api/v1/chatbot/conversations` | 648 | 10.5 | 4.7 | 943.2 | 1261.4 | 1462.9 | **100%** |

---

## 🚀 How to Re-Run the Load Test

```powershell
cd load-tests
npm start
```
