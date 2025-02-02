import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jralndtkkmayksuckgcd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYWxuZHRra21heWtzdWNrZ2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNjQ3NzYsImV4cCI6MjA1Mzc0MDc3Nn0.M1URkssBpDCy_A1Z9HKl2dxcnj0g2Q5Tb2v7r5m9fZQ'
const Supabase = createClient(supabaseUrl, supabaseKey);

export default Supabase;
