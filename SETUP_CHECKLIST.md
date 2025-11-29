# Setup Checklist ✓

Use this checklist to ensure everything is properly set up.

## Pre-Installation

- [ ] Python 3.9+ installed (`python --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL 12+ installed (`psql --version`)
- [ ] Git installed (optional) (`git --version`)
- [ ] Code editor installed (VS Code, PyCharm, etc.)

## Database Setup

- [ ] PostgreSQL service is running
- [ ] Created database: `academy_db`
- [ ] Database is accessible (test connection)
- [ ] Noted database credentials (username, password)

## Backend Setup

- [ ] Navigated to `backend/` directory
- [ ] Created virtual environment (`python -m venv venv`)
- [ ] Activated virtual environment
- [ ] Installed dependencies (`pip install -r requirements.txt`)
- [ ] Created `.env` file from `.env.example`
- [ ] Updated `.env` with correct `DATABASE_URL`
- [ ] Updated `.env` with strong `SECRET_KEY`
- [ ] Ran setup script (`python setup.py`)
- [ ] Created admin user successfully
- [ ] Backend starts without errors (`python main.py`)
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] Health check endpoint works: http://localhost:8000/health

## Frontend Setup

- [ ] Navigated to `frontend/` directory
- [ ] Installed dependencies (`npm install`)
- [ ] Created `.env.local` from `.env.local.example`
- [ ] Verified `NEXT_PUBLIC_API_URL=http://localhost:8000`
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Login page loads correctly

## First Login Test

- [ ] Opened http://localhost:3000 in browser
- [ ] Redirected to login page
- [ ] Entered admin credentials
- [ ] Successfully logged in
- [ ] Redirected to dashboard
- [ ] Dashboard shows statistics (even if zeros)
- [ ] Navigation menu works
- [ ] Can navigate to all pages

## Feature Testing

### Teachers
- [ ] Navigate to Teachers page
- [ ] Click "Add Teacher"
- [ ] Create a test teacher
- [ ] Teacher appears in list
- [ ] Can edit teacher
- [ ] Can view teacher statistics
- [ ] Teacher status can be changed

### Students
- [ ] Navigate to Students page
- [ ] Click "Add Student"
- [ ] Create a test student
- [ ] Assign to teacher created above
- [ ] Set fee amount
- [ ] Student appears in list
- [ ] Can edit student
- [ ] Can filter by teacher
- [ ] Can filter by fee status

### Lessons
- [ ] Navigate to Lessons page
- [ ] Click "Start Lesson"
- [ ] Select student and teacher
- [ ] Lesson starts successfully
- [ ] Active lesson indicator shows
- [ ] Click "End Lesson"
- [ ] Lesson appears in history
- [ ] Duration is calculated correctly

### Payments
- [ ] Navigate to Payments page
- [ ] Click "Add Payment"
- [ ] Create payment for a student
- [ ] Payment appears in list
- [ ] Can mark payment as paid
- [ ] Revenue totals update correctly
- [ ] Can filter by status

### Dashboard
- [ ] Navigate to Dashboard
- [ ] Statistics show correct counts
- [ ] Teacher hours display
- [ ] Student history displays
- [ ] Alerts show (if applicable)
- [ ] All cards show data

## Security Checks

- [ ] Changed default admin password
- [ ] `.env` file is in `.gitignore`
- [ ] `.env.local` file is in `.gitignore`
- [ ] Strong `SECRET_KEY` is used (not default)
- [ ] Database password is strong
- [ ] No sensitive data in git repository

## Optional: Sample Data

- [ ] Created 2-3 teachers
- [ ] Created 5-10 students
- [ ] Assigned students to teachers
- [ ] Recorded several lessons
- [ ] Added payment records
- [ ] Tested all filtering options

## API Testing (Optional)

- [ ] Opened http://localhost:8000/docs
- [ ] Tested authentication endpoints
- [ ] Tested at least one endpoint per section
- [ ] Responses are correct
- [ ] Error handling works

## Production Readiness (When Ready to Deploy)

- [ ] Read DEPLOYMENT.md
- [ ] Set up production database
- [ ] Generated new `SECRET_KEY` for production
- [ ] Updated CORS settings for production domain
- [ ] Configured environment variables
- [ ] Set up SSL/HTTPS
- [ ] Tested on staging environment
- [ ] Set up backup strategy
- [ ] Configured monitoring
- [ ] Set up error logging

## Documentation Review

- [ ] Read README.md
- [ ] Read QUICKSTART.md
- [ ] Reviewed backend/README.md
- [ ] Reviewed frontend/README.md
- [ ] Understand API endpoints
- [ ] Know how to troubleshoot common issues

## Common Issues Resolved

### Backend won't start
- [ ] Virtual environment is activated
- [ ] All dependencies installed
- [ ] Database connection string is correct
- [ ] PostgreSQL is running
- [ ] Port 8000 is not in use

### Frontend won't start
- [ ] Node modules installed
- [ ] `.env.local` exists
- [ ] API URL is correct
- [ ] Port 3000 is not in use

### Can't login
- [ ] Admin user was created successfully
- [ ] Using correct credentials
- [ ] Backend is running
- [ ] Browser console shows no errors
- [ ] Network tab shows API calls

### Database errors
- [ ] Database exists
- [ ] User has correct permissions
- [ ] Connection string format is correct
- [ ] PostgreSQL accepts connections

## Performance Checks

- [ ] Page loads are fast (<2 seconds)
- [ ] API responses are quick (<1 second)
- [ ] No console errors in browser
- [ ] No memory leaks observed
- [ ] Database queries are efficient

## Final Verification

- [ ] All features work as expected
- [ ] No errors in backend console
- [ ] No errors in frontend console
- [ ] UI is responsive on mobile
- [ ] UI is responsive on tablet
- [ ] UI is responsive on desktop
- [ ] Data persists after server restart
- [ ] Can logout and login again

## You're Ready! 🎉

Once all items are checked:
- ✅ Your system is fully operational
- ✅ You can start using it for your academy
- ✅ You can begin customizing as needed
- ✅ You're ready to add real data

## Next Steps

1. **Add Real Data**
   - Input your actual teachers
   - Add your students
   - Start tracking lessons

2. **Customize**
   - Update branding/colors
   - Modify fee structures
   - Adjust schedules

3. **Deploy** (when ready)
   - Follow DEPLOYMENT.md
   - Set up on production server
   - Configure domain and SSL

4. **Train Users**
   - Show teachers how to track lessons
   - Demonstrate payment tracking
   - Review dashboard features

## Need Help?

If any items fail:
1. Check the troubleshooting sections in README.md
2. Review the relevant documentation
3. Check server logs for errors
4. Verify all prerequisites are met
5. Try the setup again from scratch

## Maintenance Checklist (Weekly)

- [ ] Check disk space
- [ ] Review error logs
- [ ] Verify backups are working
- [ ] Check system performance
- [ ] Update dependencies (if needed)

## Maintenance Checklist (Monthly)

- [ ] Review user accounts
- [ ] Clean up old data (if needed)
- [ ] Check for security updates
- [ ] Review and optimize database
- [ ] Test backup restoration

---

**Congratulations!** You now have a fully functional Online Academy Management System! 🎓
