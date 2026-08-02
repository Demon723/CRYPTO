#!/bin/bash
set -e

echo "=========================================="
echo "SYNEX Database Setup Script"
echo "=========================================="

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "Docker detected. Starting PostgreSQL and Redis with docker-compose..."
    docker-compose -f ../../compose.yaml up -d postgres redis
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
    echo "Database services started."
    exit 0
fi

# Check if Docker Compose V2 is available
if docker compose version &> /dev/null; then
    echo "Docker Compose V2 detected. Starting PostgreSQL and Redis..."
    docker compose -f ../../compose.yaml up -d postgres redis
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
    echo "Database services started."
    exit 0
fi

# Check if PostgreSQL is installed locally
if command -v pg_ctl &> /dev/null; then
    echo "Local PostgreSQL detected."
    
    # Initialize database if not exists
    if [ ! -d "/usr/local/var/postgres" ]; then
        echo "Initializing PostgreSQL database cluster..."
        initdb /usr/local/var/postgres -E utf8 --locale=en_US.UTF-8
    fi
    
    # Start PostgreSQL
    echo "Starting PostgreSQL..."
    pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start
    
    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    sleep 3
    
    # Create database if not exists
    if command -v psql &> /dev/null; then
        psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'synex';" | grep -q 1 || createdb -U postgres synex
    fi
    
    echo "PostgreSQL started on localhost:5432"
    exit 0
fi

# Check if Homebrew is available
if command -v brew &> /dev/null; then
    echo "Homebrew detected. Installing PostgreSQL..."
    brew install postgresql@14
    brew services start postgresql@14
    
    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
    
    # Create database
    if command -v psql &> /dev/null; then
        psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'synex';" | grep -q 1 || createdb -U postgres synex
    fi
    
    echo "PostgreSQL installed and started on localhost:5432"
    exit 0
fi

# Check if Postgres.app is installed
if [ -d "/Applications/Postgres.app" ]; then
    echo "Postgres.app detected. Starting PostgreSQL..."
    open -a Postgres.app
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
    echo "PostgreSQL started via Postgres.app"
    exit 0
fi

echo "ERROR: No PostgreSQL installation found."
echo ""
echo "Please install PostgreSQL using one of these methods:"
echo "1. Docker: docker compose -f ../../compose.yaml up -d postgres"
echo "2. Homebrew: brew install postgresql@14 && brew services start postgresql@14"
echo "3. Postgres.app: https://postgresapp.com/"
echo "4. EnterpriseDB: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads"
echo ""
echo "After installation, run: createdb -U postgres synex"
echo "Then set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/synex"
exit 1
