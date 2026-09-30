-- ==========================================
-- SEED DATA: ROLES & PERMISSIONS
-- ==========================================

-- Insert Roles
INSERT INTO public.roles (id, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'ADMIN', 'Administrator with full access to all system features.'),
('22222222-2222-2222-2222-222222222222', 'EMPLOYEE', 'Standard employee with restricted access based on permissions.')
ON CONFLICT (name) DO NOTHING;

-- Insert Permissions
INSERT INTO public.permissions (id, resource, action, description) VALUES
(uuid_generate_v4(), 'employees', 'view', 'View employee list and details'),
(uuid_generate_v4(), 'employees', 'create', 'Create new employees'),
(uuid_generate_v4(), 'employees', 'edit', 'Edit employee details'),
(uuid_generate_v4(), 'employees', 'delete', 'Delete or deactivate employees'),
(uuid_generate_v4(), 'customers', 'view', 'View customer list and details'),
(uuid_generate_v4(), 'customers', 'create', 'Create new customers'),
(uuid_generate_v4(), 'customers', 'edit', 'Edit customer details'),
(uuid_generate_v4(), 'customers', 'delete', 'Delete or deactivate customers'),
(uuid_generate_v4(), 'payments', 'view', 'View payment records'),
(uuid_generate_v4(), 'payments', 'create', 'Create new payment records'),
(uuid_generate_v4(), 'payments', 'edit', 'Edit payment records')
ON CONFLICT (resource, action) DO NOTHING;

-- Assign Default Permissions to EMPLOYEE role
-- Note: ADMIN automatically gets all permissions via the has_permission function logic, 
-- but we explicitly assign restricted ones to EMPLOYEE.
DO $$
DECLARE
    employee_role_id UUID;
BEGIN
    SELECT id INTO employee_role_id FROM public.roles WHERE name = 'EMPLOYEE';

    -- Assign customer and payment permissions to EMPLOYEE
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT employee_role_id, id FROM public.permissions 
    WHERE resource IN ('customers', 'payments') AND action IN ('view', 'create', 'edit')
    ON CONFLICT DO NOTHING;
END $$;
