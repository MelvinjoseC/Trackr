# Trackr 📋⏱

Trackr is an enterprise-grade Django web application designed for comprehensive task management, project deliverable tracking, employee attendance, and leave management. It serves as an all-in-one productivity portal for engineering organizations to monitor KPIs, process approvals, calculate comp-off credits, and visualize team performance metrics.

---

## 🚀 Key Features

*   **🔒 Authentication & Role Security**: Session-based authentication with role hierarchies (MD, Admin, Employee) and password hashing with PBKDF2.
*   **📋 Task & Timesheet Management**:
    *   Create, edit, delete, and track tasks with status tracking (*In Progress*, *Completed*, *Paused*).
    *   Estimate benchmarks, log working hours, and review timesheets.
*   **🗂 Project Tracking**: Assign distinct scopes, check deliverables, and update project status with indexed database queries.
*   **📅 Attendance & Compensatory Leaves (Comp-Off)**:
    *   Record daily punch-in, punch-out, and break times.
    *   Interactive monthly attendance calendar.
    *   Auto-calculation of compensated worktime with multi-tier approval flows for compensatory leaves.
*   **🏖 Leave & Holiday Management**:
    *   Submit leave applications and monitor approval queues.
    *   Annual holiday calendar excluding non-working days.
*   **🧑‍🤝‍🧑 Team Dashboards & KPI Rankings**:
    *   Rank teams based on KPIs (Speed of Execution, Quality of Work, Task Ownership).
    *   Interactive chart analytics and team performance metrics.
*   **📊 Reports & Exporting**: Export project summary reports and weekly breakdown sheets directly to styled Excel workbooks.
*   **🩺 System Health Checks**: Automated liveness and database ping check at `/health/` and `/api/health/`.
*   **🐳 Docker Ready**: Full container support with Dockerfile and Docker Compose.

---

## 🛠 Tech Stack

*   **Framework**: [Django 5.0](https://www.djangoproject.com/) (Python 3.11 / 3.12+)
*   **Databases**: [MySQL](https://www.mysql.com/) (Production) and [SQLite](https://www.sqlite.org/) (Local Development)
*   **Static Assets & Serving**: WhiteNoise and Gunicorn
*   **Data Processing & Reports**: `openpyxl`, `matplotlib`, `pillow`
*   **Testing & CI/CD**: Django Test Suite, GitHub Actions

---

## ⚙️ Configuration & Environment Variables

Trackr includes a **dynamic database fallback system**. If MySQL configuration is not specified in your `.env` file, the application seamlessly defaults to local SQLite (`db.sqlite3`), enabling zero-friction onboarding.

Create a `.env` file in the project root:

```env
# General
SECRET_KEY=your-secure-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration (Optional - Defaults to SQLite if omitted)
DB_ENGINE=mysql
DB_NAME=tasktracker
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# Email Settings for Alerts (Optional)
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

---

## 🏃 Quick Start

### 1. Prerequisites
Make sure Python 3.11+ or 3.12+ is installed.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 3. Run Migrations
```bash
python manage.py migrate
```

### 4. Seed Demo Data (Optional)
Populate sample users (Admin, Developer), projects, tasks, and holidays:
```bash
python manage.py seed_demo_data
```

### 5. Start Development Server
```bash
python manage.py runserver
```
Visit `http://127.0.0.1:8000/` in your browser.

---

## 🧪 Running Automated Tests

Run the full automated test suite:
```bash
python manage.py test
```

To run individual test modules:
```bash
python manage.py test tracker.tests.test_models
python manage.py test tracker.tests.test_auth
python manage.py test tracker.tests.test_tasks
python manage.py test tracker.tests.test_leaves
python manage.py test tracker.tests.test_commands
python manage.py test tracker.tests.test_context_processors
```

---

## 🐳 Docker Deployment

To build and run Trackr with MySQL using Docker Compose:

```bash
docker-compose up --build -d
```

The web service will be available at `http://localhost:8000` with automated database health checking.

---

## 📂 Project Architecture

```text
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI test pipeline
├── task_tracker/                # Core Project Configuration
│   ├── settings.py              # Environment configuration & DB fallbacks
│   ├── urls.py                  # Root URL configuration with health checks
│   ├── wsgi.py                  # WSGI entrypoint
│   └── asgi.py                  # ASGI entrypoint
├── tracker/                     # Main Application
│   ├── decorators.py            # Session & role authentication decorators
│   ├── forms.py                 # ModelForms with custom validations
│   ├── models.py                # Database models & indexes
│   ├── views.py                 # Views & API endpoints
│   ├── urls.py                  # Tracker routing definitions
│   ├── admin.py                 # Django admin registrations
│   ├── management/
│   │   └── commands/
│   │       ├── hash_legacy_passwords.py  # Password migration tool
│   │       └── seed_demo_data.py         # Demo data onboarding tool
│   ├── tests/                   # Automated Test Suite
│   │   ├── test_models.py
│   │   ├── test_auth.py
│   │   ├── test_tasks.py
│   │   ├── test_leaves.py
│   │   ├── test_commands.py
│   │   └── test_context_processors.py
│   └── templates/               # HTML Templates
├── static/                      # Static Assets (CSS, JS, Images)
├── Dockerfile                   # Production Docker image build
├── docker-compose.yml           # Multi-container orchestration
├── requirements.txt             # Pinned production dependencies
└── requirements-dev.txt         # Development & testing dependencies
```
