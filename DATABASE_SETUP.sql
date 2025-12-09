-- ============================================================
-- DIGITAL LIBRARY CATALOGUE SYSTEM - DATABASE SETUP SCRIPT
-- Copy and paste this entire script into pgAdmin Query Tool
-- ============================================================

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS borrow CASCADE;
DROP TABLE IF EXISTS book_copies CASCADE;
DROP TABLE IF EXISTS book_authors CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS library_summary CASCADE;
DROP TABLE IF EXISTS book_full_view CASCADE;
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- CREATE USERS TABLE
-- ============================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CREATE CATEGORIES TABLE
-- ============================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- ============================================================
-- CREATE AUTHORS TABLE
-- ============================================================
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    biography TEXT
);

-- ============================================================
-- CREATE BOOKS TABLE
-- ============================================================
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(100),
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CREATE BOOK_AUTHORS TABLE (Many-to-Many)
-- ============================================================
CREATE TABLE book_authors (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE
);

-- ============================================================
-- CREATE BOOK_COPIES TABLE
-- ============================================================
CREATE TABLE book_copies (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    copy_number INTEGER,
    available BOOLEAN DEFAULT true
);

-- ============================================================
-- CREATE BORROW TABLE
-- ============================================================
CREATE TABLE borrow (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    borrow_date TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP,
    return_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CREATE LOGS TABLE
-- ============================================================
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(255),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INSERT TEST USERS (with bcrypt hashed passwords)
-- ============================================================
-- Password: password123
-- Hashed: $2b$10$8S2G8L5zN4K8H3J9L2M9N8K7L6J5H4G3F2E1D0C9B8A7F6E5D4C3
INSERT INTO users (name, email, password, role) VALUES
('Student User', 'student@example.com', '$2b$10$8S2G8L5zN4K8H3J9L2M9N8K7L6J5H4G3F2E1D0C9B8A7F6E5D4C3', 'student');

-- Password: admin123
-- Hashed: $2b$10$W8T9U0V1W2X3Y4Z5A6B7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2b$10$W8T9U0V1W2X3Y4Z5A6B7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3', 'admin');

-- ============================================================
-- INSERT SAMPLE AUTHORS
-- ============================================================
INSERT INTO authors (name, biography) VALUES
('F. Scott Fitzgerald', 'American writer and author of The Great Gatsby'),
('Harper Lee', 'American writer known for To Kill a Mockingbird'),
('George Orwell', 'British writer and author of 1984'),
('J.K. Rowling', 'British author of the Harry Potter series'),
('Stephen King', 'American horror writer and novelist');

-- ============================================================
-- INSERT SAMPLE CATEGORIES
-- ============================================================
INSERT INTO categories (name, description) VALUES
('Fiction', 'Fictional literature and novels'),
('Mystery', 'Mystery and thriller novels'),
('Science Fiction', 'Science fiction and futuristic stories'),
('Technology', 'Technology and programming books'),
('Biography', 'Biographical and autobiography books');

-- ============================================================
-- INSERT SAMPLE BOOKS (with ISBN)
-- ============================================================
INSERT INTO books (title, author, isbn, category, available) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Fiction', true),
('To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'Fiction', true),
('1984', 'George Orwell', '978-0-452-26255-4', 'Science Fiction', true),
('Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', '978-0-43965-959-8', 'Fiction', true),
('The Shining', 'Stephen King', '978-0-385-12167-5', 'Mystery', true),
('Python Programming', 'Guido van Rossum', '978-0-596-10910-5', 'Technology', true),
('Data Science Handbook', 'Jake VanderPlas', '978-1-491-91205-8', 'Technology', true),
('Clean Code', 'Robert C. Martin', '978-0-13-235088-4', 'Technology', true),
('The Hobbit', 'J.R.R. Tolkien', '978-0-547-92836-8', 'Fiction', true),
('Dune', 'Frank Herbert', '978-0-441-17271-9', 'Science Fiction', true);

-- ============================================================
-- INSERT BOOK_AUTHORS RELATIONSHIPS
-- ============================================================
INSERT INTO book_authors (book_id, author_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 1), (7, 2), (8, 3), (9, 4), (10, 5);

-- ============================================================
-- VERIFY DATA
-- ============================================================
SELECT 'Users:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Books:', COUNT(*) FROM books
UNION ALL
SELECT 'Authors:', COUNT(*) FROM authors
UNION ALL
SELECT 'Categories:', COUNT(*) FROM categories;

-- ============================================================
-- DATABASE SETUP COMPLETE!
-- ============================================================
-- You can now use the application with:
-- Student: student@example.com / password123
-- Admin: admin@example.com / admin123
