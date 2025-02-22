-- Enable RLS
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated service role
CREATE POLICY "Enable all access for service role" ON episodes
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Create policy to allow reading published episodes
CREATE POLICY "Allow reading published episodes" ON episodes
    FOR SELECT
    USING (status = 'published');

-- Create policy to allow inserting episodes for testing (in development)
CREATE POLICY "Allow inserting episodes for testing" ON episodes
    FOR INSERT
    WITH CHECK (current_setting('app.environment', TRUE) = 'development');
