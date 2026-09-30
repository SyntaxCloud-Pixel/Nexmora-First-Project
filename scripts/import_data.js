require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Needs service role key to bypass RLS for migration
);

async function importCustomers(filePath) {
  const results = [];
  
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Parsed ${results.length} customers. Uploading...`);
      const { data, error } = await supabase.from('customers').insert(results);
      if (error) {
        console.error('Error uploading customers:', error);
      } else {
        console.log('Successfully imported customers.');
      }
    });
}

// Example usage:
// importCustomers('./legacy_customers.csv');
