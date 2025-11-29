# Login Credentials

This file contains all demo user credentials for the Online Academy Management System.

---

## 🔐 Demo User Accounts

### 1. **Admin Account**
- **Username:** `admin`
- **Password:** `admin123`
- **Dashboard:** `/dashboard`
- **Access Level:** Full system access
  - Manage students
  - Manage teachers
  - View/manage lessons
  - Handle payments
  - View analytics

---

### 2. **Teacher Account**
- **Username:** `teacher`
- **Password:** `teacher123`
- **Dashboard:** `/teacher-dashboard`
- **Access Level:** Teacher features
  - View assigned students
  - Start/stop lessons
  - Track teaching hours (daily, weekly, monthly)
  - View lesson history
  - View student information

**Teacher Profile:**
- Name: John Doe
- Subject: Mathematics
- Phone: 1234567890
- Email: teacher@academy.com

---

### 3. **Student Account**
- **Username:** `student`
- **Password:** `student123`
- **Dashboard:** `/student-dashboard`
- **Access Level:** Student features
  - View lesson history
  - Track total learning hours
  - View attendance rate
  - Check payment status
  - View payment history
  - Unlock achievements

**Student Profile:**
- Name: Jane Smith
- Parent Contact: 9876543210
- Teams ID: student@teams.com
- Fee Status: Paid

---

## 📝 Notes

- These are **demo accounts** created automatically when you first run the system
- The accounts are created by the `create_demo_users.py` script
- To reset the database and recreate these users:
  1. Delete `backend/academy.db`
  2. Run `start.bat` (Windows) or `start.sh` (Linux/Mac)
  3. The demo users will be recreated automatically

---

## 🚀 Quick Start

1. **Start the system:**
   ```bash
   # Windows
   start.bat

   # Linux/Mac
   ./start.sh
   ```

2. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/docs

3. **Login with any account above**

4. **Test the dashboards:**
   - Admin can see everything
   - Teacher can manage lessons and view students
   - Student can view their own progress and payments

---

## 🔧 Creating More Users

### Via Admin Dashboard:
1. Login as admin
2. Go to "Teachers" or "Students" page
3. Click "Add New"
4. Fill in the details (Name, Subject/Contact, etc.)
5. **The system automatically creates a user account!**

### Auto-Generated Login Credentials:
When you add a new teacher or student through the admin dashboard:

**For Teachers:**
- Username: Teacher's name without spaces, lowercase (e.g., "John Doe" → `johndoe`)
- Password: `teacher123` (default for all teachers)
- Dashboard: `/teacher-dashboard`

**For Students:**
- Username: Student's name without spaces, lowercase (e.g., "Jane Smith" → `janesmith`)
- Password: `student123` (default for all students)
- Dashboard: `/student-dashboard`

**Example:**
- Add teacher named "Sarah Johnson"
- Auto-created login: Username = `sarahjohnson`, Password = `teacher123`

### Manually via Database:
You can also create users directly by running Python scripts in the backend directory.

---

## 🛡️ Security Notes

**IMPORTANT:** In production:
- Change all default passwords
- Use strong passwords
- Enable HTTPS
- Set proper environment variables
- Restrict admin access