-- ==========================================
-- 1. RBAC HELPER FUNCTIONS
-- ==========================================

-- Function to get the current user's role and status
-- We use security definer to bypass RLS for this specific check,
-- allowing us to safely look up the profile of the requesting user.
CREATE OR REPLACE FUNCTION public.get_user_status_and_role()
RETURNS TABLE (
    account_status VARCHAR(20),
    role_name VARCHAR(50)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT p.account_status, r.name
    FROM public.profiles p
    LEFT JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid();
END;
$$;

-- Function to check if the current user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(req_resource VARCHAR, req_action VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_active BOOLEAN;
    has_perm BOOLEAN;
BEGIN
    -- 1. Check if user is active
    SELECT (p.account_status = 'ACTIVE') INTO is_active
    FROM public.profiles p
    WHERE p.id = auth.uid();

    IF NOT is_active OR is_active IS NULL THEN
        RETURN FALSE;
    END IF;

    -- 2. Check if user is an ADMIN (Admins have all permissions implicitly)
    -- Or if they explicitly have the permission mapped via their role.
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles p
        JOIN public.roles r ON p.role_id = r.id
        LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
        LEFT JOIN public.permissions perm ON rp.permission_id = perm.id
        WHERE p.id = auth.uid()
        AND (
            r.name = 'ADMIN' 
            OR (perm.resource = req_resource AND perm.action = req_action)
        )
    ) INTO has_perm;

    RETURN has_perm;
END;
$$;

-- ==========================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. RLS POLICIES
-- ==========================================

-- ------------------------------------------
-- Roles & Permissions (Read-only for all active users, Admin can manage)
-- ------------------------------------------
CREATE POLICY "Active users can view roles" ON public.roles
    FOR SELECT USING ( public.has_permission('roles', 'view') OR (SELECT account_status FROM public.get_user_status_and_role()) = 'ACTIVE' );

CREATE POLICY "Admins can manage roles" ON public.roles
    FOR ALL USING ( (SELECT role_name FROM public.get_user_status_and_role()) = 'ADMIN' );

CREATE POLICY "Active users can view permissions" ON public.permissions
    FOR SELECT USING ( (SELECT account_status FROM public.get_user_status_and_role()) = 'ACTIVE' );

CREATE POLICY "Admins can manage permissions" ON public.permissions
    FOR ALL USING ( (SELECT role_name FROM public.get_user_status_and_role()) = 'ADMIN' );

CREATE POLICY "Active users can view role_permissions" ON public.role_permissions
    FOR SELECT USING ( (SELECT account_status FROM public.get_user_status_and_role()) = 'ACTIVE' );

CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions
    FOR ALL USING ( (SELECT role_name FROM public.get_user_status_and_role()) = 'ADMIN' );

-- ------------------------------------------
-- Profiles (Employees)
-- ------------------------------------------
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING ( auth.uid() = id );

CREATE POLICY "Users with permission can view profiles" ON public.profiles
    FOR SELECT USING ( public.has_permission('employees', 'view') );

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING ( (SELECT role_name FROM public.get_user_status_and_role()) = 'ADMIN' );

-- ------------------------------------------
-- Packages
-- ------------------------------------------
CREATE POLICY "Active users can view packages" ON public.packages
    FOR SELECT USING ( (SELECT account_status FROM public.get_user_status_and_role()) = 'ACTIVE' );

CREATE POLICY "Admins can manage packages" ON public.packages
    FOR ALL USING ( (SELECT role_name FROM public.get_user_status_and_role()) = 'ADMIN' );

-- ------------------------------------------
-- Customers
-- ------------------------------------------
CREATE POLICY "Users with permission can view customers" ON public.customers
    FOR SELECT USING ( public.has_permission('customers', 'view') );

CREATE POLICY "Users with permission can insert customers" ON public.customers
    FOR INSERT WITH CHECK ( public.has_permission('customers', 'create') );

CREATE POLICY "Users with permission can update customers" ON public.customers
    FOR UPDATE USING ( public.has_permission('customers', 'edit') );

CREATE POLICY "Users with permission can delete customers" ON public.customers
    FOR DELETE USING ( public.has_permission('customers', 'delete') );

-- ------------------------------------------
-- Payments
-- ------------------------------------------
CREATE POLICY "Users with permission can view payments" ON public.payments
    FOR SELECT USING ( public.has_permission('payments', 'view') );

CREATE POLICY "Users with permission can insert payments" ON public.payments
    FOR INSERT WITH CHECK ( public.has_permission('payments', 'create') );

CREATE POLICY "Users with permission can update payments" ON public.payments
    FOR UPDATE USING ( public.has_permission('payments', 'edit') );

-- ------------------------------------------
-- Audit Logs (Insert only for app, Admin can view)
-- ------------------------------------------
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING ( (SELECT role_name FROM public.get_user_status_and_role()) = 'ADMIN' );

CREATE POLICY "Active users can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK ( (SELECT account_status FROM public.get_user_status_and_role()) = 'ACTIVE' );

-- ==========================================
-- 4. SECURE TRIGGER FOR NEW AUTH USERS
-- ==========================================
-- When a new auth.users is created, we don't automatically create a profile here 
-- because the Admin sets the code, role, etc. The edge function will create the profile.
-- However, we can enforce that Profiles can only be inserted by Service Role or Admin.

CREATE POLICY "Service Role or Admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK ( 
        (SELECT role_name FROM public.get_user_status_and_role()) = 'ADMIN' 
        OR current_user = 'postgres' -- Typically service role
    );
