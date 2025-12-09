// LIBRARY SYSTEM BACKEND (FINAL WORKING VERSION)

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(cors());

// DATABASE CONNECTION
const db = new Pool({
    user:"postgres",
    host:"localhost",
    password:"1234",          // CHANGE to your pgAdmin password
    database:"library_db",
    port:5432
});

// TEST ROUTE
app.get("/",(req,res)=>{ res.send("Library Server Running"); });


// REGISTER
app.post("/register", async (req,res)=>{
    let {name,email,password,role} = req.body;
    try{
        await db.query(
            "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4)",
            [name,email,password,role || "student"]
        );
        res.json({msg:"Registered"});
    }catch(e){
        res.json({msg:"Email already exists"});
    }
});


// LOGIN (FIXED)
app.post("/login", async(req,res)=>{
    let {email,password} = req.body;
    let user = await db.query("SELECT * FROM users WHERE email=$1",[email]);

    if(user.rows.length === 0) return res.json({msg:"No account"});
    if(user.rows[0].password !== password) return res.json({msg:"Wrong password"});

    res.json({msg:"success", user:user.rows[0]}); // <-- FIXED
});


// GET BOOKS
app.get("/books", async(req,res)=>{
    let q = req.query.q || "";
    let books = await db.query("SELECT * FROM books WHERE title ILIKE $1 OR author ILIKE $1", [`%${q}%`]);
    res.json(books.rows);
});


// ADD BOOK (ADMIN) — UPDATED (removed isbn)
app.post("/books", async(req,res)=>{
    let {title,author,category} = req.body;
    await db.query("INSERT INTO books(title,author,category) VALUES($1,$2,$3)", 
    [title,author,category]);
    res.json({msg:"Book added"});
});


// DELETE BOOK
app.delete("/books/:id", async(req,res)=>{
    await db.query("DELETE FROM books WHERE id=$1",[req.params.id]);
    res.json({msg:"Deleted"});
});


// BORROW BOOK
app.post("/borrow/:id", async(req,res)=>{
    let {user_id} = req.body;

    let due = new Date();
    due.setDate(due.getDate()+7);

    await db.query("INSERT INTO borrow(user_id,book_id,due_date) VALUES($1,$2,$3)",[user_id,req.params.id,due]);
    await db.query("UPDATE books SET available=false WHERE id=$1",[req.params.id]);

    res.json({msg:"Borrowed"});
});


// RETURN BOOK
app.post("/return/:id", async(req,res)=>{
    let {user_id} = req.body;

    await db.query("UPDATE borrow SET return_date=NOW() WHERE user_id=$1 AND book_id=$2",
    [user_id,req.params.id]);

    await db.query("UPDATE books SET available=true WHERE id=$1",[req.params.id]);

    res.json({msg:"Returned"});
});


// MY BORROWS
app.get("/mybooks/:uid", async(req,res)=>{
    let out = await db.query(`
       SELECT b.title,b.author,br.borrow_date,br.due_date,br.return_date,br.book_id
       FROM borrow br 
       JOIN books b ON b.id=br.book_id 
       WHERE br.user_id=$1`,[req.params.uid]);
    res.json(out.rows);
});


// START SERVER
app.listen(3003,()=>console.log("Server running on 3003"));
