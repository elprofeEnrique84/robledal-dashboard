import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lqvlhnvyywuhoftzqlej.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdmxobnZ5eXd1aG9mdHpxbGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTM0ODMsImV4cCI6MjA4OTI4OTQ4M30.8yI4aTEKl_qUrU8WNqyHKrUKWXOfbjKlK1duPgpLBW0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
