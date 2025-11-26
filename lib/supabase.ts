import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bpnxrddagsuycmjdrvbe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbnhyZGRhZ3N1eWNtamRydmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzA4NTMsImV4cCI6MjA3OTMwNjg1M30.HOGoWgVQyOE8ige4rUhl5QoqAe3DWe6BxcsMMwbI6-Y';

export const supabase = createClient(supabaseUrl, supabaseKey);