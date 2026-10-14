ALTER TABLE users
ADD COLUMN IF NOT EXISTS balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00;

CREATE TABLE IF NOT EXISTS custom_orders (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    designer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    budget DECIMAL(12, 2) NOT NULL,
    deadline_days INT NOT NULL DEFAULT 3,
    format VARCHAR(100) DEFAULT 'Figma / SVG',
    reference_file_url VARCHAR(500),
    status VARCHAR(30) DEFAULT 'pending',
    submission_file_url VARCHAR(500),
    submission_notes TEXT,
    counter_budget DECIMAL(12, 2),
    designer_share DECIMAL(12, 2),
    platform_fee DECIMAL(12, 2),
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
