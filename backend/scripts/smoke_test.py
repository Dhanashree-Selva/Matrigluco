#!/usr/bin/env python3
"""
MatriGluco Production / Staging Deployment Smoke Test Script.
Validates live/readiness health probes, CORS headers, and basic API connectivity.
"""

import sys
import argparse
import requests


def run_smoke_tests(base_url: str) -> bool:
    print(f"[*] Executing MatriGluco smoke tests against: {base_url}")
    all_passed = True

    # 1. Liveness check
    try:
        live_resp = requests.get(f"{base_url}/api/v1/health/live", timeout=5)
        if live_resp.status_code == 200 and live_resp.json().get("status") == "ok":
            print("[PASS] Liveness probe PASSED (/api/v1/health/live)")
        else:
            print(f"[FAIL] Liveness probe FAILED: HTTP {live_resp.status_code} - {live_resp.text}")
            all_passed = False
    except Exception as e:
        print(f"[FAIL] Liveness probe EXCEPTION: {e}")
        all_passed = False

    # 2. Readiness check
    try:
        ready_resp = requests.get(f"{base_url}/api/v1/health/ready", timeout=5)
        if ready_resp.status_code == 200 and ready_resp.json().get("status") == "ready":
            print("[PASS] Readiness probe PASSED (/api/v1/health/ready)")
        else:
            print(
                f"[FAIL] Readiness probe FAILED: HTTP {ready_resp.status_code} - {ready_resp.text}"
            )
            all_passed = False
    except Exception as e:
        print(f"[FAIL] Readiness probe EXCEPTION: {e}")
        all_passed = False

    # 3. Security headers check
    try:
        head_resp = requests.get(f"{base_url}/api/v1/health/live", timeout=5)
        headers = head_resp.headers
        if headers.get("X-Content-Type-Options") == "nosniff" and "X-Request-ID" in headers:
            print("[PASS] Security headers & Request ID verification PASSED")
        else:
            print(f"[FAIL] Missing expected security headers: {headers}")
            all_passed = False
    except Exception as e:
        print(f"[FAIL] Security headers EXCEPTION: {e}")
        all_passed = False

    return all_passed


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MatriGluco Deployment Smoke Test")
    parser.add_argument(
        "--url", default="http://127.0.0.1:8000", help="Base URL of the MatriGluco API"
    )
    args = parser.parse_args()

    success = run_smoke_tests(args.url.rstrip("/"))
    if not success:
        print("[!] Smoke tests failed. Review service logs.")
        sys.exit(1)
    else:
        print("[+] All smoke tests passed successfully.")
        sys.exit(0)
