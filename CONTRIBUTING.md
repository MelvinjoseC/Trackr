# Contributing to Trackr

Thank you for contributing to Trackr! We follow enterprise engineering standards and conventional commits.

---

## 🏗 Development Workflow

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MelvinjoseC/Trackr.git
   cd Trackr
   ```

2. **Set up virtual environment & install dependencies**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   make install-dev          # Or: pip install -r requirements.txt -r requirements-dev.txt
   ```

3. **Initialize local database**:
   ```bash
   make migrate
   make seed
   ```

4. **Verify tests and linter**:
   ```bash
   make test
   make lint
   ```

---

## 📜 Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

- `feat(...)`: New domain feature or service capability
- `fix(...)`: Bug fix
- `refactor(...)`: Code refactoring without behavioral alteration
- `perf(...)`: Performance optimization or database indexing
- `test(...)`: Unit, integration, or regression tests
- `chore(...)`: Tooling, build configuration, or dependency updates
- `docs(...)`: Documentation changes or architectural guides

---

## 🏛 Code Architecture Standards

- **Domain Logic Separation**: Business logic lives in `tracker/services/` (`TaskService`, `LeaveService`, `AttendanceService`), keeping views concise.
- **Custom Managers**: Model-specific filters live in `tracker/managers.py`.
- **Audit Trails**: Sensitive mutations and approvals trigger audit log entries in `AuditLog`.
- **Validation**: Cross-field rules are enforced in `tracker/forms.py` and model validators.
- **Test Coverage**: All new services and features must include test suites in `tracker/tests/`.
