# setup_complete.ps1 - Windows PowerShell Setup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Community Health Tracker Complete Setup" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Setup Backend
Write-Host "`n[1/4] Setting up Backend..." -ForegroundColor Green
Set-Location backend

# Create virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate

# Install requirements
if (Test-Path "requirements.txt") {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    
    # Download spaCy model
    Write-Host "Downloading spaCy language model..." -ForegroundColor Yellow
    python -m spacy download en_core_web_sm
} else {
    Write-Host "requirements.txt not found!" -ForegroundColor Red
    Write-Host "Creating requirements.txt..." -ForegroundColor Yellow
    @"
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.9
python-decouple==3.8
djangorestframework-simplejwt==5.3.0
pandas==2.1.3
numpy==1.24.3
scikit-learn==1.3.2
joblib==1.3.2
spacy==3.7.2
"@ | Out-File -FilePath requirements.txt -Encoding utf8
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
}

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
python manage.py makemigrations
python manage.py migrate

Set-Location ..

# Step 2: Setup Frontend
Write-Host "`n[2/4] Setting up Frontend Web..." -ForegroundColor Green
Set-Location frontend-web

# Check if package.json exists
if (Test-Path "package.json") {
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
        npm install
    } else {
        Write-Host "node_modules already exists, skipping npm install..." -ForegroundColor Yellow
    }
} else {
    Write-Host "package.json not found! Is this a React project?" -ForegroundColor Red
}

Set-Location ..

# Step 3: Create .env files
Write-Host "`n[3/4] Creating configuration files..." -ForegroundColor Green

# Backend .env
@"
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
DATABASE_NAME=health_tracker_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
"@ | Out-File -FilePath backend\.env -Encoding utf8

# Frontend .env
@"
REACT_APP_API_URL=http://localhost:8000/api
"@ | Out-File -FilePath frontend-web\.env -Encoding utf8

# Step 4: Display completion
Write-Host "`n[4/4] Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend Server (in one terminal):" -ForegroundColor White
Write-Host "  cd backend" -ForegroundColor Gray
Write-Host "  .\venv\Scripts\Activate" -ForegroundColor Gray
Write-Host "  python manage.py runserver" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend Server (in another terminal):" -ForegroundColor White
Write-Host "  cd frontend-web" -ForegroundColor Gray
Write-Host "  npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "Access the application:" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8000/api" -ForegroundColor Gray
Write-Host "  Admin Panel: http://localhost:8000/admin" -ForegroundColor Gray
Write-Host "  Web App: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

# setup_complete.ps1 - Windows PowerShell Setup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Community Health Tracker Complete Setup" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Setup Backend
Write-Host "`n[1/4] Setting up Backend..." -ForegroundColor Green
Set-Location backend

# Create virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate

# Install requirements
if (Test-Path "requirements.txt") {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    
    # Download spaCy model
    Write-Host "Downloading spaCy language model..." -ForegroundColor Yellow
    python -m spacy download en_core_web_sm
} else {
    Write-Host "requirements.txt not found!" -ForegroundColor Red
    Write-Host "Creating requirements.txt..." -ForegroundColor Yellow
    @"
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.9
python-decouple==3.8
djangorestframework-simplejwt==5.3.0
pandas==2.1.3
numpy==1.24.3
scikit-learn==1.3.2
joblib==1.3.2
spacy==3.7.2
"@ | Out-File -FilePath requirements.txt -Encoding utf8
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
}

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
python manage.py makemigrations
python manage.py migrate

Set-Location ..

# Step 2: Setup Frontend
Write-Host "`n[2/4] Setting up Frontend Web..." -ForegroundColor Green
Set-Location frontend-web

# Check if package.json exists
if (Test-Path "package.json") {
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
        npm install
    } else {
        Write-Host "node_modules already exists, skipping npm install..." -ForegroundColor Yellow
    }
} else {
    Write-Host "package.json not found! Is this a React project?" -ForegroundColor Red
}

Set-Location ..

# Step 3: Create .env files
Write-Host "`n[3/4] Creating configuration files..." -ForegroundColor Green

# Backend .env
@"
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
DATABASE_NAME=health_tracker_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
"@ | Out-File -FilePath backend\.env -Encoding utf8

# Frontend .env
@"
REACT_APP_API_URL=http://localhost:8000/api
"@ | Out-File -FilePath frontend-web\.env -Encoding utf8

# Step 4: Display completion
Write-Host "`n[4/4] Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend Server (in one terminal):" -ForegroundColor White
Write-Host "  cd backend" -ForegroundColor Gray
Write-Host "  .\venv\Scripts\Activate" -ForegroundColor Gray
Write-Host "  python manage.py runserver" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend Server (in another terminal):" -ForegroundColor White
Write-Host "  cd frontend-web" -ForegroundColor Gray
Write-Host "  npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "Access the application:" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8000/api" -ForegroundColor Gray
Write-Host "  Admin Panel: http://localhost:8000/admin" -ForegroundColor Gray
Write-Host "  Web App: http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan