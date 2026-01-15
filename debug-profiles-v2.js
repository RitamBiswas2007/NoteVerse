
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sjrypsrbupnqeduqxlss.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcnlwc3JidXBucWVkdXF4bHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjUyODEsImV4cCI6MjA4MzYwMTI4MX0.L1u8NzUpN0ypJvhLY3ykeNyMI7O38h_UbxHXuMKqK4U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    console.log("Attempting to fetch profiles...");

    // 1. Fetch all profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        console.log(`Found ${profiles?.length || 0} profiles.`);
        if (profiles.length === 0) {
            console.log("Possible causes: 1. Table is empty. 2. RLS Policies are preventing read access for anonymous/unauthenticated query.");
        }
        else {
            console.log(JSON.stringify(profiles, null, 2));
        }
    }
}

checkProfiles();
