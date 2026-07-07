# Trackr 📋⏱

Trackr is a comprehensive, production-ready Django web application designed for task management, project tracking, employee attendance, and leave management. It serves as an all-in-one portal for organizations to track productivity, process approvals, calculate comp-off credits, and monitor team performance metrics.

---

## 🚀 Key Features

*   **🔒 Authentication & Employee Directory**: Robust signup/login with roles (MD, Admins, Employees) and profile picture uploads.
*   **📋 Task & Timesheet Management**:
    *   Create, edit, delete, and track tasks with status (In Progress, Completed, Paused).
    *   Log working hours, estimate benchmarks, and submit timesheets.
*   **🗂 Project Tracking**: Assign distinct scopes, check deliverables, and update project status.
*   **📅 Attendance & Compensatory Leaves (Comp-Off)**:
    *   Record daily punch-in, punch-out, and break times.
    *   Interactive monthly attendance calendar.
    *   Auto-calculation of compensated worktime with MD approval flows for compensatory leaves.
*   **🏖 Leave & Holiday Management**:
    *   Submit leave applications and monitor approval queues.
    *   Holiday calendars and team holiday listings.
*   **🧑‍🤝‍🧑 Team Dashboards & Rankings**:
    *   Rank teams based on KPIs (Speed of execution, Quality of work, Task ownership).
    *   Interactive charts and team rankings.
*   **📊 Reports & Exporting**: Export project summary reports directly to Excel spreadsheet sheets.
*   **📬 Notifications**: System-wide notifications for task assignments and status updates.

---

## 🛠 Tech Stack

*   **Framework**: [Django](https://www.djangoproject.com/) (Python 3.12+)
*   **Databases**: [MySQL](https://www.mysql.com/) (Production) and [SQLite](https://www.sqlite.org/) (Local Development)
*   **Libraries**:
    *   `openpyxl` (Excel reporting)
    *   `python-dotenv` (Environment configuration)
    *   `celery` & `redis` (Background task queue)

---

## ⚙️ Configuration & Database Setup

Trackr is equipped with a **dynamic database fallback system**. By default, if MySQL configuration is not detected in environment variables, the application will automatically fall back to the local SQLite database (`db.sqlite3`), allowing developers to run and test the project instantly.

### Environment variables (`.env`)
Create a `.env` file in the project root directory:

```env
# Database Configuration (Optional - Defaults to SQLite if not provided)
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

## 🏃 Getting Started

### 1. Prerequisites
Make sure Python 3.12+ is installed on your machine.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Create Database Migrations
Generate migrations for the tracker app and apply them:
```bash
python manage.py makemigrations tracker
python manage.py migrate
```

### 4. Start Development Server
```bash
python manage.py runserver
```
Visit the application at `http://127.0.0.1:8000/`.

---

## 📂 Project Structure

```text
├── manage.py            # Django project entrypoint
├── db.sqlite3           # SQLite Database (for local dev)
├── requirements.txt     # Python package requirements
├── task_tracker/        # Project Configuration
│   ├── settings.py      # Project Settings (Dotenv integration & DB fallbacks)
│   └── urls.py          # Root Routing Configuration
└── tracker/             # Main Application Code
    ├── models.py        # Database Models
    ├── views.py         # Application Logic & API Endpoints
    ├── urls.py          # Tracker app routing
    ├── forms.py         # Form Definitions (with dynamic choice binding)
    └── templates/       # HTML Templates
```
