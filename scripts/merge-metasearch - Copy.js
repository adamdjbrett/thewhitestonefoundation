const fs = require('fs');
const path = require('path');

const SITES = [
  "https://jcrt-dev.netlify.app/metasearch.json",
  "https://journal.thenewpolis.com/metasearch.json",
  "https://thenewpolis.com/metasearch.json",
  "https://esthesis.org/metasearch.json"
];

async function ingestMetadata() {
  let globalData = [];

  for (const url of SITES) {
    try {
      console.log(`🔍 Fetching from ${url}...`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const data = await response.json();
      
      if (data && data.entries) {
        globalData.push(...data.entries); 
      }
    } catch (err) {
      console.error(`❌ Error ingesting ${url}:`, err.message);
    }
  }

  globalData.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const outputPath = path.join(__dirname, '../content/page-setup/global-metasearch.json');
  
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(outputPath, JSON.stringify(globalData, null, 2));
  console.log(`✅ Success! Global metasearch.json created with ${globalData.length} entries.`);
}

ingestMetadata();