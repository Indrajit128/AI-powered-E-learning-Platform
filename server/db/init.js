const fs = require('fs');
const path = require('path');
const db = require('./db');

const initDB = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Applying schema mapping (this will drop existing tables)...');
        await db.query(schema);
        console.log('✅ Schema applied successfully!');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error applying schema:', err.message);
        process.exit(1);
    }
};

initDB();
