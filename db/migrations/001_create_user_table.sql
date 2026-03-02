CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,

    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,

    plan VARCHAR(20) NOT NULL DEFAULT 'free',

    stripe_customer_id TEXT,

    billing_period_start TIMESTAMP NOT NULL DEFAULT NOW(),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);