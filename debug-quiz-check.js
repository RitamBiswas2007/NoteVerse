
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sjrypsrbupnqeduqxlss.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcnlwc3JidXBucWVkdXF4bHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjUyODEsImV4cCI6MjA4MzYwMTI4MX0.L1u8NzUpN0ypJvhLY3ykeNyMI7O38h_UbxHXuMKqK4U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking quiz_attempts table...");
    const { data: qData, error: qError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .limit(1);

    if (qError) {
        console.error("quiz_attempts Error:", qError);
    } else {
        console.log("quiz_attempts Data:", qData);
    }

    console.log("\nChecking notes table...");
    const { error: nError } = await supabase
        .from('notes')
        .select('count')
        .limit(1);

    if (nError) {
        console.error("notes Error:", nError);
    } else {
        console.log("notes table exists");
    }

    console.log("\nChecking peer_notes table...");
    const { error: pnError } = await supabase
        .from('peer_notes')
        .select('count')
        .limit(1);

    if (pnError) {
        console.error("peer_notes Error:", pnError);
    } else {
        console.log("peer_notes table exists");
    }
}

check();
