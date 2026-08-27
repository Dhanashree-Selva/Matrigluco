# Authentication and Session Contract

Login is `POST /api/v1/auth/login` with email/password. The response contains a 15-minute Bearer access JWT (`expires_in` seconds), an opaque refresh token, and user data. Refresh is `POST /api/v1/auth/refresh` with `{refresh_token}`; the backend atomically rotates the token, detects reuse, and may invalidate the family. This is body transport, not an HttpOnly-cookie-only design.

Android Phase 5 must keep the access token memory-first and persist only what is required for restart restoration. The opaque refresh token needs Keystore-backed encrypted storage; plain SharedPreferences is prohibited. DataStore may store non-secret session metadata, never unencrypted credentials. Use one mutex/single-flight refresh operation: on an eligible 401, refresh once, atomically replace both tokens, retry once, then clear session on failure. Do not refresh login/refresh requests or loop retries.

Startup: read secure refresh material → refresh → call `/auth/me` → publish authenticated state. Logout must send the current refresh token to `/auth/logout`, clear secure tokens regardless of network outcome, cancel user work, and clear user-scoped Room/cache/files. `/logout-all`, session list/revocation and password change require Bearer auth. Password change invalidates refresh sessions.

Unresolved: `TokenPairResponse.user` is an untyped map, so Android should obtain authoritative identity from `/auth/me`; confirm whether access-token revocation is intentionally eventual until expiry. No cookies or Android `CookieJar` are required by the canonical contract.
