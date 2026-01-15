
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

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
        console.log(`Found ${profiles.length} profiles:`);
        console.log(JSON.stringify(profiles, null, 2));
    }

    // 2. Check current user (we can't really do this easily in a script without logging in, 
    // but we can check if the profiles table is empty or RLS is blocking)
    // If profiles.length is 0 but error is null, it might be RLS or just empty.
}

checkProfiles();
