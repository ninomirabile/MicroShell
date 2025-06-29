-- MicroShell Database Initialization Script
-- This script is executed when the PostgreSQL container starts

-- Create database if it doesn't exist (handled by Docker environment variables)
-- CREATE DATABASE microshell_db;

-- Create user if it doesn't exist (handled by Docker environment variables)
-- CREATE USER microshell WITH ENCRYPTED PASSWORD 'microshell123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE microshell_db TO microshell;

-- Set default search path
ALTER DATABASE microshell_db SET search_path TO public;

-- Create extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Additional database setup can be added here
-- Tables will be created by SQLAlchemy/FastAPI on application startup 