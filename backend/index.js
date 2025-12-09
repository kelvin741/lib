// LIBRARY SYSTEM BACKEND (FINAL WORKING VERSION)

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*"
}));

// DATABASE CONNECTION
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false
});

// MIDDLEWARE: Verify JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({msg: "No token provided"});
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({msg: "Invalid token"});
    }
};

// TEST ROUTE
app.get("/",(req,res)=>{ res.send("Library Server Running"); });

// DATABASE CONNECTION TEST
app.get("/test-db", async (req,res)=>{
    try {
        const result = await db.query("SELECT NOW()");
        res.json({msg:"Database connected!", time: result.rows[0]});
    } catch (e) {
        res.status(500).json({msg:"Database connection failed", error: e.message});
    }
});

// INITIALIZE DATABASE SCHEMA
app.get("/init-db", async (req,res)=>{
    try {
        // Drop existing tables in correct order (due to foreign keys)
        await db.query("DROP TABLE IF EXISTS borrow CASCADE");
        await db.query("DROP TABLE IF EXISTS book_copies CASCADE");
        await db.query("DROP TABLE IF EXISTS book_authors CASCADE");
        await db.query("DROP TABLE IF EXISTS books CASCADE");
        await db.query("DROP TABLE IF EXISTS authors CASCADE");
        await db.query("DROP TABLE IF EXISTS categories CASCADE");
        await db.query("DROP TABLE IF EXISTS library_summary CASCADE");
        await db.query("DROP TABLE IF EXISTS book_full_view CASCADE");
        await db.query("DROP TABLE IF EXISTS logs CASCADE");
        await db.query("DROP TABLE IF EXISTS users CASCADE");

        // Create users table
        await db.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'student',
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create categories table
        await db.query(`
            CREATE TABLE categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT
            )
        `);

        // Create authors table
        await db.query(`
            CREATE TABLE authors (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                biography TEXT
            )
        `);

        // Create books table
        await db.query(`
            CREATE TABLE books (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                isbn VARCHAR(20) UNIQUE NOT NULL,
                category VARCHAR(100),
                available BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create book_authors table (for many-to-many relationship)
        await db.query(`
            CREATE TABLE book_authors (
                id SERIAL PRIMARY KEY,
                book_id INTEGER REFERENCES books(id),
                author_id INTEGER REFERENCES authors(id)
            )
        `);

        // Create book_copies table
        await db.query(`
            CREATE TABLE book_copies (
                id SERIAL PRIMARY KEY,
                book_id INTEGER REFERENCES books(id),
                copy_number INTEGER,
                available BOOLEAN DEFAULT true
            )
        `);

        // Create borrow table
        await db.query(`
            CREATE TABLE borrow (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                book_id INTEGER REFERENCES books(id),
                borrow_date TIMESTAMP DEFAULT NOW(),
                due_date TIMESTAMP,
                return_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create logs table
        await db.query(`
            CREATE TABLE logs (
                id SERIAL PRIMARY KEY,
                action VARCHAR(255),
                user_id INTEGER REFERENCES users(id),
                timestamp TIMESTAMP DEFAULT NOW()
            )
        `);

        // Insert test users
        const hashedStudent = await bcrypt.hash("password123", 10);
        const hashedAdmin = await bcrypt.hash("admin123", 10);
        
        await db.query("INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4)", 
            ["Student User", "student@example.com", hashedStudent, "student"]);
        
        await db.query("INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4)", 
            ["Admin User", "admin@example.com", hashedAdmin, "admin"]);

        // Insert sample authors
        const authors = [
            "F. Scott Fitzgerald",
            "Harper Lee",
            "George Orwell",
            "J.K. Rowling",
            "Stephen King"
        ];

        for(let author of authors) {
            await db.query("INSERT INTO authors(name) VALUES($1)", [author]);
        }

        // Insert sample categories
        const categories = ["Fiction", "Mystery", "Science Fiction", "Technology", "Biography"];
        for(let cat of categories) {
            await db.query("INSERT INTO categories(name) VALUES($1)", [cat]);
        }

        // Insert sample books with ISBN
        await db.query(`
            INSERT INTO books(title, author, isbn, category, available) VALUES
            ('The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Fiction', true),
            ('To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'Fiction', true),
            ('1984', 'George Orwell', '978-0-452-26255-4', 'Science Fiction', true),
            ('Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', '978-0-43965-959-8', 'Fiction', true),
            ('The Shining', 'Stephen King', '978-0-385-12167-5', 'Mystery', true),
            ('Python Programming', 'Guido van Rossum', '978-0-596-10910-5', 'Technology', true),
            ('Data Science Handbook', 'Jake VanderPlas', '978-1-491-91205-8', 'Technology', true),
            ('Clean Code', 'Robert C. Martin', '978-0-13-235088-4', 'Technology', true),
            ('The Hobbit', 'J.R.R. Tolkien', '978-0-547-92836-8', 'Fiction', true),
            ('Dune', 'Frank Herbert', '978-0-441-17271-9', 'Science Fiction', true)
        `);

        res.json({msg:"✅ Database reset and initialized successfully with test data"});
    } catch (e) {
        console.error("DB init error:", e.message);
        res.status(500).json({msg:"Database initialization failed", error: e.message});
    }
});


// REGISTER
app.post("/register", async (req,res)=>{
    let {name,email,password,role} = req.body;
    
    if(!name || !email || !password) {
        return res.status(400).json({msg:"Please fill all required fields"});
    }
    
    try{
        // Check if email already exists
        const existing = await db.query("SELECT id FROM users WHERE email=$1", [email]);
        if(existing.rows.length > 0) {
            return res.status(400).json({msg:"Email already registered"});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4)",
            [name,email,hashedPassword,role || "student"]
        );
        res.json({msg:"Registered successfully"});
    }catch(e){
        console.error("Registration error:", e.message);
        res.status(400).json({msg:"Registration failed: " + e.message});
    }
});


// LOGIN (WITH JWT)
app.post("/login", async(req,res)=>{
    let {email,password} = req.body;
    let user = await db.query("SELECT * FROM users WHERE email=$1",[email]);

    if(user.rows.length === 0) return res.status(400).json({msg:"No account found"});
    
    const passwordMatch = await bcrypt.compare(password, user.rows[0].password);
    if(!passwordMatch) return res.status(400).json({msg:"Wrong password"});

    const token = jwt.sign({id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role}, process.env.JWT_SECRET, {expiresIn: "24h"});
    res.json({msg:"success", token: token, user: {id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email, role: user.rows[0].role}}); 
});


// GET BOOKS - REQUIREMENT: Display all books with title, author, ISBN, and availability status
app.get("/books", async(req,res)=>{
    let q = req.query.q || "";
    let books = await db.query("SELECT * FROM books WHERE title ILIKE $1 OR author ILIKE $1 OR isbn ILIKE $1", [`%${q}%`]);
    res.json(books.rows);
});


// ADD BOOK (ADMIN) — REQUIRES JWT - REQUIREMENT: Admin users can add books
app.post("/books", verifyToken, async(req,res)=>{
    if(req.user.role !== "admin") return res.status(403).json({msg:"Admin access required"});
    
    let {title, author, isbn, category} = req.body;
    try {
        await db.query("INSERT INTO books(title,author,isbn,category) VALUES($1,$2,$3,$4)", 
        [title, author, isbn, category]);
        res.json({msg:"Book added"});
    } catch(e) {
        res.status(400).json({msg:"Error adding book", error: e.message});
    }
});


// DELETE BOOK (ADMIN)
app.delete("/books/:id", verifyToken, async(req,res)=>{
    if(req.user.role !== "admin") return res.status(403).json({msg:"Admin access required"});
    
    try {
        await db.query("DELETE FROM books WHERE id=$1",[req.params.id]);
        res.json({msg:"Deleted"});
    } catch(e) {
        res.status(400).json({msg:"Error deleting book", error: e.message});
    }
});


// BORROW BOOK (REQUIRES LOGIN)
app.post("/borrow/:id", verifyToken, async(req,res)=>{
    let user_id = req.user.id;

    let due = new Date();
    due.setDate(due.getDate()+7);

    try {
        await db.query("INSERT INTO borrow(user_id,book_id,due_date) VALUES($1,$2,$3)",[user_id,req.params.id,due]);
        await db.query("UPDATE books SET available=false WHERE id=$1",[req.params.id]);
        res.json({msg:"Borrowed successfully"});
    } catch(e) {
        res.status(400).json({msg:"Error borrowing book", error: e.message});
    }
});


// RETURN BOOK (REQUIRES LOGIN)
app.post("/return/:id", verifyToken, async(req,res)=>{
    let user_id = req.user.id;

    try {
        await db.query("UPDATE borrow SET return_date=NOW() WHERE user_id=$1 AND book_id=$2",
        [user_id,req.params.id]);
        await db.query("UPDATE books SET available=true WHERE id=$1",[req.params.id]);
        res.json({msg:"Book returned successfully"});
    } catch(e) {
        res.status(400).json({msg:"Error returning book", error: e.message});
    }

    res.json({msg:"Returned"});
});


// MY BORROWS (REQUIRES LOGIN)
app.get("/mybooks/:uid", verifyToken, async(req,res)=>{
    if(req.user.id != req.params.uid) return res.status(403).json({msg:"Access denied"});
    
    try {
        let out = await db.query(`
           SELECT b.title,b.author,br.borrow_date,br.due_date,br.return_date,br.book_id
           FROM borrow br 
           JOIN books b ON b.id=br.book_id 
           WHERE br.user_id=$1`,[req.params.uid]);
        res.json(out.rows);
    } catch(e) {
        res.status(400).json({msg:"Error fetching borrowed books", error: e.message});
    }
});


// START SERVER
const PORT = process.env.PORT || 3003;
app.listen(PORT,()=>console.log(`Server running on ${PORT}`));
