const API = "http://localhost:3003";

// REGISTER
async function register(){
    let user={
        name:document.getElementById("name").value,
        email:document.getElementById("email").value,
        password:document.getElementById("password").value,
        role:document.getElementById("role").value
    };

    let r=await fetch(API+"/register",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(user)
    });

    alert("Registered Successfully");
    showLogin();
}

// LOGIN
async function login(){
    let email=document.getElementById("lemail").value;
    let password=document.getElementById("lpassword").value;

    let r=await fetch(API+"/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password})
    });

    let data=await r.json();

    if(data.msg!=="ok") return alert(data.msg);

    localStorage.setItem("user",JSON.stringify(data.user));

    if(data.user.role=="admin") loadAdmin();
    else loadStudent();
}

//  STUDENT PAGE LOAD 
async function loadStudent(){
    loginPage.style.display="none";
    registerPage.style.display="none";
    dashboard.style.display="block";
    adminPanel.style.display="none";

    searchBooks();
    myBooks();
}

//  ADMIN PAGE LOAD 
async function loadAdmin(){
    loginPage.style.display="none";
    registerPage.style.display="none";
    dashboard.style.display="none";
    adminPanel.style.display="block";

    searchBooks();
}

//  FETCH BOOKS 
async function searchBooks(){
    let s=document.getElementById("search")?.value || "";
    let r=await fetch(API+"/books?q="+s);
    let books=await r.json();
    let list="";

    let user = JSON.parse(localStorage.user);

    books.forEach(b=>{
        list+=`<div class='book'>
            <b>${b.title}</b> - ${b.author} (${b.available?"Available":"Borrowed"}) `;

        if(user.role=="admin"){
            list+=`<button onclick="delBook(${b.id})">Delete</button>`;
        } else if(b.available){
            list+=`<button onclick="borrow(${b.id})">Borrow</button>`;
        }

        list+=`</div>`;
    });

    document.getElementById("bookList").innerHTML=list;
}

//  ADMIN ADD BOOK 
async function addBook(){
    let b={
        title:title.value,author:author.value,
        isbn:isbn.value,category:category.value
    };

    await fetch(API+"/books",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(b)
    });

    alert("Book Added");
    searchBooks();
}

// DELETE BOOK
async function delBook(id){
    await fetch(API+"/books/"+id,{method:"DELETE"});
    alert("Deleted");
    searchBooks();
}

// BORROW
async function borrow(id){
    let user=JSON.parse(localStorage.user);

    await fetch(API+"/borrow/"+id,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({user_id:user.id})
    });

    alert("Borrowed");
    searchBooks();
    myBooks();
}

// VIEW BORROWED
async function myBooks(){
    let u=JSON.parse(localStorage.user);

    let r=await fetch(API+"/mybooks/"+u.id);
    let data=await r.json();

    document.getElementById("my").innerHTML =
    data.map(b=>`<p>${b.title} | Due: ${b.due_date?.slice(0,10)} 
    ${!b.return_date?`<button onclick="returnBook(${b.book_id})">Return</button>`:"Returned"}</p>`).join("");
}

// RETURN BOOK
async function returnBook(id){
    let u=JSON.parse(localStorage.user);

    await fetch(API+"/return/"+id,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({user_id:u.id})
    });

    alert("Returned");
    myBooks();
}
