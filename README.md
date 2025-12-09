# Digital Library Catalogue System

## 📚 Project Overview

A comprehensive digital library management system that enables students to search, borrow, and return books while allowing administrators to manage the book catalogue. The system is built with a modern web interface and a secure Node.js/PostgreSQL backend.

**Exam Question:** Question 2 - DIGITAL LIBRARY CATALOGUE SYSTEM (60 MARKS)

---

## 🌐 Deployment Links

| Component | Link | Status |
|-----------|------|--------|
| **Backend API** | https://lib-9gnv.onrender.com | ✅ Live on Render |
| **Frontend** | https://kelvin741.github.io/lib | ✅ Hosted on GitHub Pages |

---

## 👤 Login Details

### Student Account
- **Email:** student@example.com
- **Password:** password123
- **Role:** Student

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** Admin

---

## ✅ Feature Checklist

### 1. Authentication & Book Submission (15 Marks)
- [x] User registration system (students and admins)
- [x] Secure login with JWT tokens
- [x] Password hashing with bcrypt
- [x] Session management with localStorage
- [x] Admin users can add new books
- [x] Admin users can update books
- [x] Admin users can delete books
- [x] Role-based access control

### 2. Book Catalogue (15 Marks)
- [x] Display all books with title, author, ISBN, and availability status
- [x] Search functionality (by title, author, or category)
- [x] Filter options for books
- [x] Responsive grid layout for book display
- [x] Real-time availability status indicators
- [x] Category organization
- [x] Professional UI with book cards

### 3. Borrow & Return Management (15 Marks)
- [x] Students can request/borrow available books
- [x] Track borrowed books with due dates (7 days)
- [x] View borrowed book history
- [x] Return book functionality
- [x] Automatic book availability updates
- [x] Borrow date tracking
- [x] Return status indicators

### 4. Deployment (15 Marks)
- [x] Backend: Node.js + PostgreSQL hosted on Render
- [x] Frontend: Hosted on GitHub Pages
- [x] Full integration between frontend and backend
- [x] Environment configuration with .env
- [x] JWT token-based authentication
- [x] CORS configuration for cross-origin requests
- [x] Responsive design for all devices

---

## 📁 Project Structure

```
library-management-system/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── script.js           # JavaScript logic
│   ├── style.css           # Styling
│   └── README.md           # Frontend docs
├── backend/
│   ├── index.js            # Express server & routes
│   ├── package.json        # Dependencies
│   ├── .env                # Environment variables
│   └── .env.example        # Example env file
├── .gitignore              # Git ignore file
├── Procfile                # Render deployment config
├── DEPLOYMENT.md           # Deployment guide
└── README.md               # This file
```

---

## 🚀 Installation Instructions

### Prerequisites
- Node.js 14+
- PostgreSQL 12+
- Git
- GitHub account
- Render.com account

### Backend Setup (Local Development)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with local database:**
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/library_db
   PORT=3003
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   DATABASE_SSL=false
   JWT_SECRET=your-secret-key-here
   ```

5. **Create database tables in pgAdmin:**
   ```sql
   -- Users table
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       role VARCHAR(20) DEFAULT 'student',
       created_at TIMESTAMP DEFAULT NOW()
   );

   -- Books table
   CREATE TABLE books (
       id SERIAL PRIMARY KEY,
       title VARCHAR(200) NOT NULL,
       author VARCHAR(200) NOT NULL,
       category VARCHAR(100),
       available BOOLEAN DEFAULT true,
       created_at TIMESTAMP DEFAULT NOW()
   );

   -- Borrow records table
   CREATE TABLE borrow (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id),
       book_id INTEGER REFERENCES books(id),
       borrow_date TIMESTAMP DEFAULT NOW(),
       due_date DATE NOT NULL,
       return_date DATE,
       created_at TIMESTAMP DEFAULT NOW()
   );
   ```

6. **Run the server:**
   ```bash
   npm start
   ```

   Server will be available at `http://localhost:3003`

### Frontend Setup (Local Development)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Open `index.html` in a browser** or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 3000

   # Or using Node.js (if http-server is installed)
   npx http-server -p 3000
   ```

   Access frontend at `http://localhost:3000`

### Backend Deployment (Render)

1. **Push code to GitHub:**
   ```bash
   git push origin main
   ```

2. **Create New Web Service on Render:**
   - Go to https://render.com/dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set Build Command: `npm install`
   - Set Start Command: `node backend/index.js`

3. **Add Environment Variables:**
   ```
   DATABASE_URL=postgresql://library_db_ju4h_user:VqaYSeVdyD6T2HnEEZUOXWs9S1wNxfLo@dpg-d4s5fae3jp1c73cv42p0-a.oregon-postgres.render.com/library_db_ju4h
   PORT=3003
   NODE_ENV=production
   CORS_ORIGIN=https://kelvin741.github.io
   DATABASE_SSL=true
   JWT_SECRET=0018057aa6f8775130246d89b14f8add
   ```

4. **Deploy:** Render will automatically build and deploy

### Frontend Deployment (GitHub Pages)

1. **Create GitHub repository:**
   ```bash
   # Initialize if not already done
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/kelvin741/lib.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` / `/(root)`
   - Click Save

3. **Update API endpoint** in `script.js`:
   - The frontend automatically detects if running locally or deployed
   - For deployed version, it uses the Render backend URL

---

## 📡 API Endpoints

### Public Endpoints
- `GET /` - Server status
- `GET /test-db` - Test database connection
- `POST /register` - User registration
- `POST /login` - User login (returns JWT token)
- `GET /books?q=search` - Get all books (with optional search)

### Protected Endpoints (Require JWT Token)
- `POST /books` - Add new book (Admin only)
- `DELETE /books/:id` - Delete book (Admin only)
- `POST /borrow/:id` - Borrow a book (Logged-in students)
- `POST /return/:id` - Return a book (Logged-in students)
- `GET /mybooks/:uid` - Get user's borrowed books (Logged-in users)

### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 🔐 Security Features

1. **Password Security:**
   - Passwords are hashed using bcrypt
   - Never stored in plain text

2. **JWT Authentication:**
   - Token-based authentication
   - 24-hour token expiration
   - Secure token storage in localStorage

3. **Role-Based Access Control:**
   - Admin-only operations protected
   - User-specific data access restrictions

4. **Database Security:**
   - Parameterized queries to prevent SQL injection
   - SSL connection for remote databases

5. **Environment Variables:**
   - Sensitive data (.env) excluded from git
   - Example .env.example provided for reference

---

## 🎨 User Interface Features

1. **Responsive Design:**
   - Works on desktop, tablet, and mobile
   - Flexible grid layout
   - Touch-friendly buttons

2. **User Experience:**
   - Clean, modern interface
   - Intuitive navigation
   - Real-time feedback with alerts
   - Loading states

3. **Visual Indicators:**
   - Color-coded book status (green=available, orange=borrowed)
   - Status badges for borrowed books
   - Icons in placeholders for better UX

4. **Accessibility:**
   - Semantic HTML
   - Keyboard navigation support
   - Clear error messages

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Logic and API communication
- **Fetch API** - HTTP requests

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **pg** - PostgreSQL client
- **dotenv** - Environment configuration

### Deployment
- **Render.com** - Backend hosting
- **GitHub Pages** - Frontend hosting
- **Git** - Version control

---

## 🧪 Testing the System

### Test Flow: Student Journey

1. **Register:**
   - Go to frontend → Click "Register here"
   - Fill in: Name, Email, Password, Role (Student)
   - Click Register

2. **Login:**
   - Use registered email and password
   - Should see Student Dashboard

3. **Search Books:**
   - Type in search box (e.g., "Python", "Harry")
   - Click Search or press Enter
   - View filtered results

4. **Borrow a Book:**
   - Click "Borrow Book" on any available book
   - Check "My Borrowed Books" section
   - Should see due date (today + 7 days)

5. **Return a Book:**
   - In "My Borrowed Books", click "Return Book"
   - Book status updates to "Returned"

### Test Flow: Admin Journey

1. **Login as Admin:**
   - Use admin credentials from login details above

2. **Add a Book:**
   - Fill in: Title, Author, Category
   - Click "+ Add Book"
   - Should appear in book list

3. **Delete a Book:**
   - Click "Delete" on any book
   - Book disappears from list

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check PostgreSQL is running
- Verify DATABASE_URL in .env is correct
- Check port 3003 is available

### Can't Login
- Verify user exists in database
- Check password is correct
- Look for JWT_SECRET in .env

### CORS Errors
- Check CORS_ORIGIN in .env matches frontend URL
- For local testing, use `http://localhost:3000`
- For production, use actual frontend URL

### Books Not Loading
- Check backend API URL in script.js
- Verify database connection works
- Check browser console for errors

---

## 📝 Notes

- Database tables must be created manually in pgAdmin before first run
- JWT tokens expire after 24 hours (user must login again)
- Borrowed books are marked unavailable until returned
- Admin can delete any book regardless of borrow status
- Search is case-insensitive and matches partial text

---

## 👨‍💻 Developed By

**Student:** Kelvin741
**Course:** CS3139: WEB TECHNOLOGIES
**University:** Academic City University

---

## 📄 License

This project is created for educational purposes as part of the CS3139 examination.

---

**Last Updated:** December 2025
