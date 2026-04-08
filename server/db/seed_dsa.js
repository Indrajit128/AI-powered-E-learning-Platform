const fs = require('fs');
const path = require('path');
const { supabase } = require('../db/db');

async function seedDSA() {
  try {
    const dsaData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seeds/coding_questions_dsa.json'), 'utf8'));
    
    const { data, error } = await supabase
      .from('coding_challenges')
      .insert(dsaData);
    
    if (error) throw error;
    console.log('✅ DSA challenges seeded:', data.length);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  }
}

seedDSA();

