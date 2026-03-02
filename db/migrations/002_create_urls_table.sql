CREATE TABLE IF NOT EXISTS urls (
    id BIGSERIAL PRIMARY KEY,

    short_code VARCHAR(10) UNIQUE NOT NULL,

    long_url TEXT NOT NULL,

    user_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    last_accessed_at TIMESTAMP,

    access_count BIGINT DEFAULT 0,

    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_expires_at ON urls(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_id ON urls(user_id);