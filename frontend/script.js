// API Endpoint - works for both local and deployed versions
const API = window.location.hostname === "localhost" 
    ? "http://localhost:3003" 
    : "https://lib-9gnv.onrender.com";

// REGISTER - REQUIREMENT: User Registration & Authentication (15 Marks)
async function register(){
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let role = document.getElementById("role").value;

    if(!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        let r = await fetch(API + "/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, email, password, role})
        });

        let data = await r.json();
        
        if(r.ok) {
            alert("✓ Registered Successfully! Please login");
            showLogin();
        } else {
            alert("❌ " + data.msg);
        }
    } catch(e) {
        alert("Connection error: " + e.message);
    }
}

// LOGIN - REQUIREMENT: Secure user registration and login (students only)
async function login(){
    let email = document.getElementById("lemail").value.trim();
    let password = document.getElementById("lpassword").value;

    if(!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {
        let r = await fetch(API + "/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });

        let data = await r.json();

        if(data.msg === "success" && data.token) {
            // Store both token and user info
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            alert("✓ Login successful!");

            if(data.user.role === "admin") loadAdmin();
            else loadStudent();
        } else {
            alert("❌ " + data.msg);
        }
    } catch(e) {
        alert("Connection error: " + e.message);
    }
}

//  STUDENT PAGE LOAD - REQUIREMENT: Book Catalogue
async function loadStudent(){
    loginPage.style.display = "none";
    registerPage.style.display = "none";
    dashboard.style.display = "block";
    adminPanel.style.display = "none";

    let user = JSON.parse(localStorage.user);
    document.getElementById("welcomeMsg").innerText = `Welcome, ${user.name}!`;
    
    await searchBooks();
    await myBooks();
}

//  ADMIN PAGE LOAD - REQUIREMENT: Admin users can add, update, or delete books
async function loadAdmin(){
    loginPage.style.display = "none";
    registerPage.style.display = "none";
    dashboard.style.display = "none";
    adminPanel.style.display = "block";

    let user = JSON.parse(localStorage.user);
    document.getElementById("adminWelcome").innerText = `Admin Panel - ${user.name}`;
    
    await loadAllBooksAdmin();
}

// Get Authorization Header with JWT Token
function getHeaders() {
    let token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

//  FETCH BOOKS - REQUIREMENT: Display all books with title, author, ISBN, and availability status
async function searchBooks(){
    let s = document.getElementById("search")?.value || "";
    
    try {
        let r = await fetch(API + "/books?q=" + encodeURIComponent(s));
        let books = await r.json();
        let list = "";

        let user = JSON.parse(localStorage.user);

        if(books.length === 0) {
            list = "<p>No books found</p>";
        } else {
            books.forEach(b => {
                let status = b.available ? "✓ Available" : "✗ Borrowed";
                let statusClass = b.available ? "available" : "borrowed";
                
                list += `<div class='book ${statusClass}'>
                    <div class='book-info'>
                        <h4>${b.title}</h4>
                        <p><strong>Author:</strong> ${b.author}</p>
                        <p><strong>ISBN:</strong> ${b.isbn || "N/A"}</p>
                        <p><strong>Category:</strong> ${b.category || "General"}</p>
                        <p class='status ${statusClass}'>Status: ${status}</p>
                    </div>
                    <div class='book-actions'>`;

                if(user.role === "admin") {
                    list += `<button class='btn-delete' onclick="delBook(${b.id})">Delete</button>`;
                } else if(b.available) {
                    list += `<button class='btn-borrow' onclick="borrow(${b.id})">Borrow Book</button>`;
                } else {
                    list += `<button class='btn-unavailable' disabled>Not Available</button>`;
                }

                list += `</div></div>`;
            });
        }

        document.getElementById("bookList").innerHTML = list;
    } catch(e) {
        document.getElementById("bookList").innerHTML = `<p style='color:red'>Error loading books: ${e.message}</p>`;
    }
}

//  ADMIN ADD BOOK - REQUIREMENT: Admin users can add books
async function addBook(){
    let title = document.getElementById("title").value.trim();
    let author = document.getElementById("author").value.trim();
    let isbn = document.getElementById("isbn").value.trim();
    let category = document.getElementById("category").value.trim();

    if(!title || !author || !isbn || !category) {
        alert("Please fill all fields");
        return;
    }

    try {
        let r = await fetch(API + "/books", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({title, author, isbn, category})
        });

        let data = await r.json();

        if(r.ok) {
            alert("✓ Book added successfully");
            document.getElementById("title").value = "";
            document.getElementById("author").value = "";
            document.getElementById("isbn").value = "";
            document.getElementById("category").value = "";
            await loadAllBooksAdmin();
        } else {
            alert("❌ " + (data.msg || "Error adding book"));
        }
    } catch(e) {
        alert("Connection error: " + e.message);
    }
}

// LOAD ALL BOOKS FOR ADMIN - REQUIREMENT: Admin users can manage books
async function loadAllBooksAdmin(){
    try {
        let r = await fetch(API + "/books");
        let books = await r.json();
        let list = "";

        if(books.length === 0) {
            list = "<p>No books in catalogue</p>";
        } else {
            books.forEach(b => {
                list += `<div class='book-admin'>
                    <div class='book-info'>
                        <h4>${b.title}</h4>
                        <p><strong>Author:</strong> ${b.author}</p>
                        <p><strong>ISBN:</strong> ${b.isbn || "N/A"}</p>
                        <p><strong>Category:</strong> ${b.category || "General"}</p>
                        <p><strong>Status:</strong> ${b.available ? "Available" : "Borrowed"}</p>
                    </div>
                    <div class='book-actions'>
                        <button class='btn-delete' onclick="delBook(${b.id})">Delete</button>
                    </div>
                </div>`;
            });
        }

        document.getElementById("bookListAdmin").innerHTML = list;
    } catch(e) {
        document.getElementById("bookListAdmin").innerHTML = `<p style='color:red'>Error: ${e.message}</p>`;
    }
}

// DELETE BOOK - REQUIREMENT: Admin users can delete books
async function delBook(id){
    if(!confirm("Are you sure you want to delete this book?")) return;

    try {
        let r = await fetch(API + "/books/" + id, {
            method: "DELETE",
            headers: getHeaders()
        });

        if(r.ok) {
            alert("✓ Book deleted");
            loadAllBooksAdmin();
            searchBooks();
        } else {
            alert("❌ Error deleting book");
        }
    } catch(e) {
        alert("Connection error: " + e.message);
    }
}

// BORROW BOOK - REQUIREMENT: Allow students to request/borrow available books
async function borrow(id){
    try {
        let r = await fetch(API + "/borrow/" + id, {
            method: "POST",
            headers: getHeaders()
        });

        let data = await r.json();

        if(r.ok) {
            alert("✓ Book borrowed successfully! Due date: 7 days");
            await searchBooks();
            await myBooks();
        } else {
            alert("❌ " + (data.msg || "Error borrowing book"));
        }
    } catch(e) {
        alert("Connection error: " + e.message);
    }
}

// VIEW BORROWED - REQUIREMENT: Track borrowed books with due dates
async function myBooks(){
    try {
        let u = JSON.parse(localStorage.user);
        let r = await fetch(API + "/mybooks/" + u.id, {
            headers: getHeaders()
        });

        let data = await r.json();
        let html = "";

        if(!Array.isArray(data) || data.length === 0) {
            html = "<p>You haven't borrowed any books yet</p>";
        } else {
            data.forEach(b => {
                let dueDate = new Date(b.due_date);
                let returnDate = b.return_date ? new Date(b.return_date) : null;
                let returned = returnDate ? "✓ Returned" : "⏰ Active";
                let returnedClass = returnDate ? "returned" : "active";
                
                html += `<div class='borrowed-book ${returnedClass}'>
                    <div class='borrow-info'>
                        <h4>${b.title}</h4>
                        <p><strong>Author:</strong> ${b.author}</p>
                        <p><strong>Borrowed:</strong> ${new Date(b.borrow_date).toLocaleDateString()}</p>
                        <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
                        <p class='status'>${returned}</p>
                    </div>
                    <div class='borrow-actions'>`;
                
                if(!returnDate) {
                    html += `<button class='btn-return' onclick="returnBook(${b.book_id})">Return Book</button>`;
                }
                
                html += `</div></div>`;
            });
        }

        document.getElementById("my").innerHTML = html;
    } catch(e) {
        document.getElementById("my").innerHTML = `<p style='color:red'>Error loading borrowed books: ${e.message}</p>`;
    }
}

// RETURN BOOK - REQUIREMENT: Track borrowed books and manage returns
async function returnBook(id){
    if(!confirm("Return this book?")) return;

    try {
        let r = await fetch(API + "/return/" + id, {
            method: "POST",
            headers: getHeaders()
        });

        let data = await r.json();

        if(r.ok) {
            alert("✓ Book returned successfully");
            await searchBooks();
            await myBooks();
        } else {
            alert("❌ " + (data.msg || "Error returning book"));
        }
    } catch(e) {
        alert("Connection error: " + e.message);
    }
    myBooks();
}
