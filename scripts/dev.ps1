<#
.SYNOPSIS
    Development workflow helper script for Windows PowerShell.
.EXAMPLE
    .\scripts\dev.ps1 test
    .\scripts\dev.ps1 run
    .\scripts\dev.ps1 check
#>
param(
    [Parameter(Position=0)]
    [ValidateSet("run", "test", "lint", "migrate", "makemigrations", "seed", "check", "clean")]
    [string]$Command = "check"
)

switch ($Command) {
    "run" {
        python manage.py runserver
    }
    "test" {
        python manage.py test tracker
    }
    "lint" {
        ruff check .
    }
    "migrate" {
        python manage.py migrate
    }
    "makemigrations" {
        python manage.py makemigrations
    }
    "seed" {
        python manage.py seed_demo_data
    }
    "check" {
        python manage.py check
        python manage.py test tracker
    }
    "clean" {
        Get-ChildItem -Path . -Include __pycache__,*.pyc -Recurse -Force | Remove-Item -Recurse -Force
        Write-Host "Bytecode caches cleaned." -ForegroundColor Green
    }
}
