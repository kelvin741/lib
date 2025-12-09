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
