# 🔐 Security Guidelines - MicroShell Project

## ⚠️ IMPORTANT: Security Checklist Before Deployment

### 🔑 Environment Variables & Secrets

**NEVER commit these to version control:**
- [ ] `.env` files (already in .gitignore)
- [ ] Database files (`*.db`, `*.sqlite`)
- [ ] API keys, passwords, tokens
- [ ] SSL certificates (`*.pem`, `*.key`, `*.crt`)

### 🛠️ Before First Run

1. **Copy environment template:**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Generate secure SECRET_KEY:**
   ```bash
   python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
   ```

3. **Update .env with secure values:**
   - Replace `CHANGE-THIS-IN-PRODUCTION-USE-SECURE-RANDOM-KEY` with generated key
   - Change `ADMIN_PASSWORD` to a strong password
   - Update database URL for production

### 🚀 Production Deployment

#### Critical Security Steps:

1. **Environment Variables:**
   ```bash
   # Generate secure keys
   export SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
   export ADMIN_PASSWORD="YourSecurePassword123!"
   export DATABASE_URL="postgresql://user:pass@host:5432/db"
   ```

2. **Database Security:**
   - Use PostgreSQL in production (not SQLite)
   - Enable SSL connections
   - Use connection pooling
   - Regular backups with encryption

3. **JWT Security:**
   - Use RS256 algorithm for production (instead of HS256)
   - Short token expiry times
   - Implement token rotation
   - Secure token storage

4. **CORS Configuration:**
   ```python
   ALLOWED_ORIGINS=[
       "https://yourdomain.com",
       "https://app.yourdomain.com"
   ]
   ```

### 🛡️ Security Best Practices

#### Backend (FastAPI):
- [ ] Use HTTPS only in production
- [ ] Enable rate limiting
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (SQLAlchemy ORM)
- [ ] XSS protection headers
- [ ] Secure password hashing (bcrypt)

#### Frontend (Angular):
- [ ] Content Security Policy (CSP)
- [ ] Secure HTTP headers
- [ ] Token storage in httpOnly cookies (not localStorage)
- [ ] Input sanitization
- [ ] CSRF protection

#### Infrastructure:
- [ ] Firewall configuration
- [ ] Regular security updates
- [ ] Monitoring and logging
- [ ] Backup encryption
- [ ] Access control (principle of least privilege)

### 🔍 Security Audit

Run these commands regularly:

```bash
# Python dependencies
pip install safety
safety scan

# Node.js dependencies  
npm audit
npm audit fix

# Code quality
flake8 backend/
npm run lint
```

### 🚨 Incident Response

If you suspect a security breach:
1. Immediately rotate all secrets (JWT keys, passwords)
2. Review access logs
3. Update all dependencies
4. Check for unauthorized access
5. Consider temporary service shutdown if needed

### 📞 Security Contacts

- **Security Issues**: [Create a private issue]
- **Vulnerability Reports**: [Security team email]

---

**Remember**: Security is not a one-time setup, but an ongoing process! 🔒 