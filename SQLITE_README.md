# SQLite Version - Complete Guide

## Why SQLite?

✅ **No database installation required** - SQLite is built into Python
✅ **Zero configuration** - Works immediately
✅ **Single file database** - Easy to backup and move
✅ **Perfect for development** - Quick to set up and test
✅ **Great for small deployments** - Handles hundreds of users easily
✅ **All features work** - No limitations compared to PostgreSQL

## What Changed?

The system now uses **SQLite by default** instead of PostgreSQL:

### Before (PostgreSQL):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/academy_db
```
- Required PostgreSQL installation
- Required database creation
- Required user management

### After (SQLite):
```env
DATABASE_URL=sqlite:///./academy.db
```
- No installation needed
- No configuration needed
- Database is a single file: `academy.db`

## Setup Comparison

### SQLite (Now - Easy!)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python setup.py
python main.py
```
✅ Done in 2 minutes!

### PostgreSQL (Before - Complex)
```bash
# Install PostgreSQL (separate download)
# Configure PostgreSQL
# Create database
createdb academy_db
# Create user
psql -c "CREATE USER ..."
# Set permissions
psql -c "GRANT ALL ..."
# Then setup backend...
```
⏰ Takes 10-15 minutes

## Database File Location

Your entire database is stored in:
```
backend/academy.db
```

This single file contains:
- All users and authentication
- All teachers
- All students
- All lessons
- All payments
- Everything!

## Backup & Restore

### Backup (Copy the file)
```bash
# Windows
copy backend\academy.db backend\academy_backup.db

# Mac/Linux
cp backend/academy.db backend/academy_backup.db
```

### Restore (Copy it back)
```bash
# Windows
copy backend\academy_backup.db backend\academy.db

# Mac/Linux
cp backend/academy_backup.db backend/academy.db
```

### Automated Backup Script

**Windows (backup.bat):**
```batch
@echo off
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
copy backend\academy.db "backup\academy_%TIMESTAMP%.db"
echo Backup created: academy_%TIMESTAMP%.db
```

**Mac/Linux (backup.sh):**
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p backup
cp backend/academy.db "backup/academy_$TIMESTAMP.db"
echo "Backup created: academy_$TIMESTAMP.db"
```

## Reset Database

To start fresh:

```bash
# Stop the backend server (Ctrl+C)

# Delete the database
# Windows:
del backend\academy.db

# Mac/Linux:
rm backend/academy.db

# Run setup again
cd backend
python setup.py

# Start server
python main.py
```

## Performance

### SQLite Can Handle:
✅ Hundreds of concurrent users
✅ Thousands of students
✅ Millions of lesson records
✅ Fast queries (milliseconds)
✅ Reliable transactions

### When to Switch to PostgreSQL:
- 1000+ concurrent users
- Multiple servers needed
- Advanced features required
- Enterprise deployment

**For most academies, SQLite is perfect!**

## Database Viewer Tools

Want to view your database?

### Free Tools:
1. **DB Browser for SQLite** (Recommended)
   - Download: https://sqlitebrowser.org
   - Open `backend/academy.db`
   - View/edit all data

2. **SQLite Viewer (VS Code Extension)**
   - Install in VS Code
   - Right-click `academy.db` → "Open Database"

3. **Command Line**
   ```bash
   cd backend
   sqlite3 academy.db

   # List tables
   .tables

   # View students
   SELECT * FROM students;

   # Exit
   .quit
   ```

## Migration from SQLite to PostgreSQL

If you grow and need PostgreSQL later:

### Step 1: Export Data (Manual)
```bash
# Use DB Browser or command line to export data
sqlite3 academy.db .dump > backup.sql
```

### Step 2: Switch to PostgreSQL
```bash
# Install PostgreSQL
# Create database
createdb academy_db

# Update .env
DATABASE_URL=postgresql://user:password@localhost:5432/academy_db

# Run setup to create tables
python setup.py

# Import your data manually or use migration tools
```

### Step 3: Or Just Start Fresh
Since all CRUD operations work the same, you can:
1. Keep SQLite database as backup
2. Create new PostgreSQL database
3. Use the UI to re-add important data
4. Keep both for a transition period

## Troubleshooting

### "Database is locked" error
**Cause:** Another process is using the database

**Solution:**
```bash
# Stop all backend servers
# Check for running Python processes
# Windows:
tasklist | findstr python
taskkill /PID <PID> /F

# Mac/Linux:
ps aux | grep python
kill <PID>
```

### Database file not found
**Cause:** Running from wrong directory

**Solution:**
```bash
# Make sure you're in backend directory
cd backend
python main.py
```

### Corrupted database
**Cause:** System crash while writing

**Solution:**
```bash
# Restore from backup
copy backup\academy_backup.db backend\academy.db

# Or start fresh
del backend\academy.db
python setup.py
```

## Security Considerations

### ✅ Good Practices:
- Keep `academy.db` in `.gitignore` (already done)
- Regular backups
- Don't share database file (contains passwords)
- Use strong admin password

### ⚠️ Note:
- SQLite file contains all data
- Anyone with the file can access data
- For production, ensure proper file permissions:

**Windows:**
```bash
# Right-click academy.db → Properties → Security
# Remove all users except your account
```

**Linux:**
```bash
chmod 600 backend/academy.db
chown youruser:yourgroup backend/academy.db
```

## Production Deployment with SQLite

SQLite works fine for production with moderate traffic!

### VPS Deployment:
```bash
# Upload your project
# Install Python and Node.js
# Setup as normal
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env (DATABASE_URL=sqlite:///./academy.db)
python setup.py

# Use systemd or pm2 to keep running
```

### Backup Strategy:
```bash
# Daily backups via cron
0 2 * * * /path/to/backup.sh

# Or use cloud sync
rclone copy /path/to/academy.db dropbox:backups/
```

## Advantages Over PostgreSQL

### For Small-Medium Academies:

✅ **Easier Setup**
- No database server installation
- No user management
- No connection configuration

✅ **Easier Backup**
- Just copy one file
- Restore = copy file back
- Version control friendly

✅ **Easier Deployment**
- Upload one file
- No database server needed
- Cheaper hosting options

✅ **Easier Development**
- Start coding immediately
- No database setup time
- Same database locally and production

✅ **Zero Maintenance**
- No database server updates
- No connection pool tuning
- No vacuum/analyze needed

## Common Questions

**Q: Is SQLite fast enough?**
A: Yes! For most academies (< 500 students), you won't notice any difference.

**Q: Can I use it in production?**
A: Absolutely! Many production apps use SQLite successfully.

**Q: What if I outgrow SQLite?**
A: Switch to PostgreSQL anytime by changing the DATABASE_URL.

**Q: How many students can it handle?**
A: Easily 10,000+ students. The bottleneck is usually your server, not SQLite.

**Q: Is my data safe?**
A: Yes! SQLite is very reliable. Just backup regularly.

**Q: Can multiple users access it?**
A: Yes! SQLite handles concurrent reads and writes well.

## File Size

Your database file size depends on data:

- **Empty database**: ~40 KB
- **10 students, 5 teachers**: ~50 KB
- **100 students, 100 lessons**: ~200 KB
- **1000 students, 10000 lessons**: ~2-5 MB
- **10000 students, 100000 lessons**: ~20-50 MB

Even with years of data, it stays small!

## Summary

✅ **SQLite is now the default** - No PostgreSQL installation needed
✅ **All features work** - No limitations
✅ **Easy backup** - Single file
✅ **Easy deployment** - Upload and go
✅ **Production ready** - For most use cases
✅ **Can switch later** - To PostgreSQL if needed

## Quick Links

- **Quick Start**: [QUICKSTART_SQLITE.md](QUICKSTART_SQLITE.md)
- **Full Documentation**: [README.md](README.md)
- **Setup Checklist**: [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

**You're ready to go!** Just run `start.bat` (Windows) or `./start.sh` (Mac/Linux) and start managing your academy! 🎓
