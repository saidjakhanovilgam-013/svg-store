-- Eski mahsulotlar va ID larni tozalash
TRUNCATE TABLE products RESTART IDENTITY CASCADE;

-- Kategoriyalar
INSERT INTO categories (name, slug) VALUES 
('Ikonkalar', 'ikonkalar'),
('Illyustratsiyalar', 'illyustratsiyalar'),
('Logotiplar', 'logotiplar'),
('Patternlar', 'patternlar')
ON CONFLICT (slug) DO NOTHING;

-- 25 ta SVG mahsulot
INSERT INTO products (designer_id, category_id, title, description, price, preview_svg_path, file_zip_path, status)
VALUES 
(1, 1, 'Cyberpunk Neon Icon Set', 'Zamonaviy neon va kibernetik uslubdagi 50 ta vektor ikonkalar to''plami.', 12.99, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/cpu.svg', '/uploads/files/sample.zip', 'approved'),
(1, 1, '3D Glassmorphism Badges', 'Shaffof shisha va lyuminesent effektga ega interaktiv nishonlar.', 15.50, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-check.svg', '/uploads/files/sample.zip', 'approved'),
(1, 1, 'Minimal Finance Crypto Icons', 'Kriptovalyuta va bank operatsiyalari uchun minimalist ikonkalar.', 8.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/wallet.svg', '/uploads/files/sample.zip', 'approved'),
(1, 1, 'E-Commerce Rocket Launch', 'Onlayn do''kon va startaplar uchun dinamik raketa vektorlari.', 9.99, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/rocket.svg', '/uploads/files/sample.zip', 'approved'),
(1, 1, 'Social Media Glow Pack', 'Ijtimoiy tarmoqlar uchun neon yoritilgan ikonkalar.', 6.50, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/share-2.svg', '/uploads/files/sample.zip', 'approved'),
(1, 1, 'AI Robotics Intelligence', 'Sun''niy intellekt va robototexnika uchun futuristik elementlar.', 18.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/bot.svg', '/uploads/files/sample.zip', 'approved'),
(1, 1, 'Weather Animated SVG Pack', 'Jonli va harakatlanuvchi ob-havo holatlari vektor to''plami.', 11.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/cloud-lightning.svg', '/uploads/files/sample.zip', 'approved'),

(1, 2, 'Futuristic City Vector Art', 'Kelajak shahri va uchuvchi mashinalar illyustratsiyasi.', 24.99, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/building-2.svg', '/uploads/files/sample.zip', 'approved'),
(1, 2, 'Abstract Holographic Sphere', 'Golografik va 3D shakldagi abstrakt fazoviy illyustratsiya.', 14.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/globe.svg', '/uploads/files/sample.zip', 'approved'),
(1, 2, 'Developer Workspace Vector', 'Dasturchi va dizayner ish stoli illyustratsiyasi.', 19.50, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/laptop.svg', '/uploads/files/sample.zip', 'approved'),
(1, 2, 'Astronaut in Deep Space', 'Ochiq koinotda muallaq turgan kosmonavt illyustratsiyasi.', 22.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/sparkles.svg', '/uploads/files/sample.zip', 'approved'),
(1, 2, 'Gaming Mascot Character', 'Kiber-sport jamoalari va strimerlar uchun maskot qahramoni.', 16.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/gamepad-2.svg', '/uploads/files/sample.zip', 'approved'),
(1, 2, 'Virtual Reality Experience', 'VR ko''zoynak taqqan foydalanuvchi va meta-olam tushunchasi.', 21.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/glasses.svg', '/uploads/files/sample.zip', 'approved'),

(1, 3, 'Quantum Tech Logo Template', 'Yuqori texnologik startaplar uchun kvant uslubidagi tayyor logotip.', 29.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/atom.svg', '/uploads/files/sample.zip', 'approved'),
(1, 3, 'Cyber Shield Security Badge', 'Kiberxavfsizlik va server himoyasi kompaniyalari uchun logotip.', 25.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-alert.svg', '/uploads/files/sample.zip', 'approved'),
(1, 3, 'Apex Infinity Monogram', 'Minimalist va cheksizlik belgisiga ega brending logotipi.', 19.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/infinity.svg', '/uploads/files/sample.zip', 'approved'),
(1, 3, 'Phoenix Gaming Shield', 'Alovli feniks va qalqon ko''rinishidagi esport logotipi.', 32.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/flame.svg', '/uploads/files/sample.zip', 'approved'),
(1, 3, 'Cloud SaaS Platform Emblem', 'Bulutli texnologiyalar va dasturiy ta''minotlar uchun ramz.', 22.50, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/cloud-cog.svg', '/uploads/files/sample.zip', 'approved'),

(1, 4, 'Cyber Grid Seamless Pattern', 'Veb-saytlar foni uchun mo''ljallangan kibernetik to''r patterni.', 10.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/grid.svg', '/uploads/files/sample.zip', 'approved'),
(1, 4, 'Geometric Circuit Board', 'Elektron plata va mikrosxemalar shaklidagi uzuksiz pattern.', 13.50, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/circuit-board.svg', '/uploads/files/sample.zip', 'approved'),
(1, 4, 'Neon Topographic Contours', 'Topografik va relyef uslubidagi neon chiziqli fonsiz pattern.', 11.50, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/layers.svg', '/uploads/files/sample.zip', 'approved'),
(1, 4, 'Minimalist Geometric Waves', 'Yumshoq to''lqinlar va geometrik shakllardan iborat pattern.', 9.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/waves.svg', '/uploads/files/sample.zip', 'approved'),
(1, 4, 'Hexagon Honeycomb Network', 'Olti burchakli asalari iniga o''xshash texnologik pattern.', 12.00, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/hexagons.svg', '/uploads/files/sample.zip', 'approved'),
(1, 4, 'Retro Synthwave Sun Pattern', '80-yillar retrowave uslubidagi quyosh va gorizont fonlari.', 14.50, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/sun.svg', '/uploads/files/sample.zip', 'approved'),
(1, 4, 'Binary Code Data Stream', 'Nollar va birlardan tashkil topgan ma''lumotlar oqimi patterni.', 8.50, 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/binary.svg', '/uploads/files/sample.zip', 'approved');
