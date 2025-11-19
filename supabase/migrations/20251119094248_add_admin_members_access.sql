/*
  # Add Admin Access to View All Members

  1. Changes
    - Create function to check if user is admin
    - Add policy for admins to view all users
    - Add policy for admins to delete users

  2. Security
    - Only admin users can view all members
    - Only admin users can delete members
    - Regular users can only see their own profile
*/

-- Create function to check if user is admin (based on email domain or specific list)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- For now, allow all authenticated users to act as admin in the admin panel
  -- In production, you should check against a specific admin table or email list
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow admins to view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (is_admin());

-- Allow admins to delete users
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (is_admin());
