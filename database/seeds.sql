-- Standart kategoriyalarni qo'shish
INSERT INTO categories (name, slug) VALUES 
('Icons', 'icons'),
('Illustrations', 'illustrations'),
('UI Kits', 'ui-kits'),
('Patterns', 'patterns'),
('Badges', 'badges');

-- Birinchi Master Admin foydalanuvchisini yaratish (Parol: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES 
('System Admin', 'admin@svgstore.com', '$2a$10$wT8Kz3J8pL.3M5f.pGZ8.uQx4v/9Xk/5pZq9u6g3v1.', 'admin');