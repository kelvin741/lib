# Deployment Guide - Library Management System

## Prerequisites
- PostgreSQL database with tables already created in pgAdmin
- Node.js 14+ installed
- Git repository set up
- Render.com account (or similar hosting service)

## Backend Deployment on Render.com

### Step 1: Set Environment Variables
On Render.com dashboard, add these environment variables:
```
DATABASE_URL=postgresql://library_db_ju4h_user:VqaYSeVdyD6T2HnEEZUOXWs9S1wNxfLo@dpg-d4s5fae3jp1c73cv42p0-a.oregon-postgres.render.com/library_db_ju4h
PORT=3003
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
DATABASE_SSL=true
```

### Step 2: Create Web Service on Render
1. Go to Render.com dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: library-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/index.js`
   - **Plan**: Free or Paid (your choice)

### Step 3: Add Environment Variables
In the "Environment" section, paste all environment variables from Step 1

### Step 4: Deploy
Click "Create Web Service" and Render will automatically deploy

## Local Development Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Create `.env` File
Copy `.env.example` to `.env` and update with your local database:
```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://postgres:1234@localhost:5432/library_db
PORT=3003
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
DATABASE_SSL=false
```

### Step 3: Run Server Locally
```bash
npm start
```

Server will run on http://localhost:3003

### Step 4: Test Connection
```bash
curl http://localhost:3003/test-db
```

## Important Notes

⚠️ **DO NOT commit `.env` file** - it contains sensitive credentials
- The `.gitignore` already excludes it
- Use `.env.example` as a template for developers

✅ **Database Tables** - Already created in pgAdmin, no need to run SQL scripts

✅ **SSL Connection** - Render PostgreSQL requires SSL connection (already configured)

## API Endpoints

- `GET /` - Server status
- `GET /test-db` - Test database connection
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /books?q=search` - Search books
- `POST /books` - Add new book (admin only)
- `DELETE /books/:id` - Delete book
- `POST /borrow/:id` - Borrow book
- `POST /return/:id` - Return book
- `GET /mybooks/:uid` - Get user's borrowed books

## Troubleshooting

### Database Connection Failed
- Check `DATABASE_URL` is correct
- Verify Render PostgreSQL is accessible
- Check `DATABASE_SSL=true` is set

### CORS Errors
- Update `CORS_ORIGIN` to your frontend domain
- For local testing, use `CORS_ORIGIN=*`

### Port Already in Use
- Change `PORT` environment variable
- Or kill process using the port: `lsof -ti:3003 | xargs kill`
