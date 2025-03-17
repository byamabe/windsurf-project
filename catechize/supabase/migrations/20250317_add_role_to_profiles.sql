-- Insert admin role if it doesn't exist
INSERT INTO public.roles (name, description)
VALUES ('admin', 'Administrator with full system access')
ON CONFLICT (name) DO NOTHING;

-- Create policy to allow users to read roles
CREATE POLICY "Users can read roles"
    ON roles
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow users to read their own roles
CREATE POLICY "Users can read their own role assignments"
    ON user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Create policy to prevent users from modifying roles
CREATE POLICY "Only superadmin can modify roles"
    ON roles
    FOR ALL
    USING (false)
    WITH CHECK (false);

-- Create policy to prevent users from modifying role assignments
CREATE POLICY "Only superadmin can modify role assignments"
    ON user_roles
    FOR ALL
    USING (false)
    WITH CHECK (false);
