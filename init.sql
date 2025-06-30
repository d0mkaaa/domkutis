CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS repository_settings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL DEFAULT 'default',
    hidden_repos JSONB DEFAULT '[]'::jsonb,
    featured_repos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS activity_settings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL DEFAULT 'default',
    show_discord BOOLEAN DEFAULT TRUE,
    show_spotify BOOLEAN DEFAULT TRUE,
    show_coding BOOLEAN DEFAULT TRUE,
    show_gaming BOOLEAN DEFAULT TRUE,
    show_general BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
CREATE INDEX IF NOT EXISTS idx_repository_settings_user_id ON repository_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_settings_user_id ON activity_settings(user_id);

INSERT INTO repository_settings (user_id, hidden_repos, featured_repos) 
VALUES ('default', '[]'::jsonb, '[]'::jsonb) 
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO activity_settings (user_id) 
VALUES ('default') 
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repository_settings_updated_at 
    BEFORE UPDATE ON repository_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_settings_updated_at 
    BEFORE UPDATE ON activity_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 