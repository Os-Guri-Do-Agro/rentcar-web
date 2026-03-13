import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xrkjpufttmfdcvfyakpc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhya2pwdWZ0dG1mZGN2Znlha3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTYwNTYsImV4cCI6MjA4MzYzMjA1Nn0.4z3U1o-H5Q2qcFCojoA9Kyg9MEUqER27ALSYySO0k74';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
