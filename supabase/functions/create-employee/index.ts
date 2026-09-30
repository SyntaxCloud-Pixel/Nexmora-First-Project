import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    // Create admin client to bypass RLS and create auth users
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the caller is an ADMIN
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) throw new Error('Unauthorized')

    // Check if caller has ADMIN role (bypassing RLS with admin client)
    const { data: callerProfile, error: callerError } = await supabaseAdmin
      .from('profiles')
      .select('role:roles(name)')
      .eq('id', user.id)
      .single()
      
    if (callerError || callerProfile?.role?.name !== 'ADMIN') {
      throw new Error('Forbidden: Admin privileges required')
    }

    // Parse payload
    const { email, password, first_name, last_name, employee_code, phone, department, designation, role_id } = await req.json()

    // 1. Create Auth User
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authCreateError) throw authCreateError

    // 2. Create Profile Record
    const { error: profileError } = await supabaseAdmin.from('profiles').insert([
      {
        id: authData.user.id,
        email,
        first_name,
        last_name,
        employee_code,
        phone,
        department,
        designation,
        role_id,
        account_status: 'ACTIVE'
      }
    ])

    if (profileError) {
      // Rollback auth user creation if profile fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    // Log the action
    await supabaseAdmin.from('audit_logs').insert([{
      actor_user_id: user.id,
      action: 'employee.created',
      entity_type: 'profiles',
      entity_id: authData.user.id,
      description: `Created employee ${first_name} ${last_name}`
    }])

    return new Response(
      JSON.stringify({ message: 'Employee created successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
