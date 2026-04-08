const supabase = require('./db');
const fs = require('fs');
const path = require('path');

async function setupAssignments() {
    console.log('🚀 Starting Assignment System Database Setup...');

    try {
        const schemaPath = path.join(__dirname, 'assignments_schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        // Split SQL into individual statements
        // Note: This is a simple split, might fail on complex SQL but should work for basic table creations
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
            
            if (error) {
                // If RPC fails (likely because exec_sql doesn't exist), fallback to direct query if possible
                // or just log that we need to run it in Supabase SQL editor
                console.warn('⚠️ RPC exec_sql failed. This is expected if the RPC is not set up in Supabase.');
                console.error('Error details:', error);
                console.log('\n--- PLEASE RUN THE FOLLOWING IN SUPABASE SQL EDITOR ---\n');
                console.log(sql);
                console.log('\n----------------------------------------------------\n');
                return;
            }
        }

        console.log('✅ Assignment system tables created successfully!');
    } catch (err) {
        console.error('❌ Setup failed:', err);
    }
}

setupAssignments();
