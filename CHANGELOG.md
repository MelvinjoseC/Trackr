# Changelog

All notable changes to the Trackr platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - Senior Architecture Overhaul

### Added
- **Domain Services Layer**:
  - `TaskService`: Timesheet aggregation, completion rate calculations, and project workload metrics.
  - `LeaveService`: Multi-tier leave validation, conflict detection, holiday-aware business day calculations, and approval state machine.
  - `AttendanceService`: Net working hours calculation with overnight shift support and break deductions.
- **Enterprise Observability & Middleware**:
  - `RequestMetricsMiddleware`: HTTP latency tracking and `X-Response-Time-ms` header emission with slow request warnings.
  - `GlobalExceptionMiddleware`: Centralized exception interception with structured JSON errors for API consumers.
- **Audit Logging System**:
  - `AuditLog` model with automatic post-save signals capturing leave status transitions and task updates.
  - Dedicated Django Admin interface for audit trail inspection.
- **QuerySet & Model Managers**:
  - Custom managers for `TrackerTasks`, `LeaveApplication`, and `Attendance` providing domain query methods (`for_employee`, `completed`, `pending`, `overlapping_range`).
- **Developer Tooling & Automation**:
  - `pyproject.toml` with `ruff`, `black`, `isort`, and `pytest` configurations.
  - `.pre-commit-config.yaml` for pre-commit quality enforcement.
  - `Makefile` and `scripts/dev.ps1` for task automation across platforms.
  - `export_monthly_report` CLI command for CSV/JSON workload export.
  - `prune_stale_sessions` maintenance command with `--dry-run` support.

### Changed
- Enhanced `settings.py` with strict production security checks and HSTS preload configuration.
- Extended `LeaveApplicationForm`, `TrackerTaskForm`, and `TaskFilterForm` with cross-field date validation.
- Updated GitHub Actions CI workflow to run linting and test coverage reports.
