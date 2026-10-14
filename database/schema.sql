-- 1. Jadvallarni o'chirish (Agar mavjud bo'lsa)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Foydalanuvchilar jadvali
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(100),
    role VARCHAR(20) DEFAULT 'buyer', -- buyer, designer, admin
    is_approved_designer BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(255) DEFAULT 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/user.svg',
    phone VARCHAR(30),
    bio TEXT,
    card_number VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.1. Sotuvchilikka (dizaynerlikka) arizalar jadvali
CREATE TABLE designer_requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    portfolio_url VARCHAR(255) NOT NULL,
    experience_level VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Kategoriyalar jadvali
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

-- 4. SVG Mahsulotlar jadvali
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    designer_id INT REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    preview_svg_path VARCHAR(255) NOT NULL,
    file_zip_path VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    views_count INT DEFAULT 0,
    downloads_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Buyurtmalar jadvali
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    buyer_id INT REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
    payment_provider VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Buyurtma ichidagi mahsulotlar
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    price DECIMAL(10, 2) NOT NULL,
    designer_share DECIMAL(10, 2) NOT NULL
);

-- 7. PostgreSQL Sessiyalar jadvali (connect-pg-simple)
CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
