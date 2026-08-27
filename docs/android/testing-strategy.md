# Android Testing Strategy

- Unit: DTO serialization, mappers, use cases, reducers, validators, date/unit handling and auth single-flight with JUnit/coroutines/Turbine.
- HTTP: MockWebServer golden fixtures for every canonical DTO, errors, token rotation, pagination and SSE framing.
- Persistence: Room migration/ownership/logout-clear tests and DataStore tests.
- UI: FragmentScenario/Espresso for loading, empty, offline, error, accessibility and navigation; no fake production data path.
- Integration: debug environment against FastAPI test fixtures; ownership/401/upload/download checks.
- Release: lint, unit/instrumentation suite, dependency/security scan, baseline profile and macrobenchmark startup/scroll gates.

Contract fixtures must be generated from confirmed schemas, checked into tests, and fail on unknown required fields.
