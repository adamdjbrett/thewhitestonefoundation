import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITES = [
  "https://jcrt-dev.netlify.app/metadata/search.json",
  "https://journal.thenewpolis.com/metadata/search.json",
  "https://thenewpolis.com/metadata/search.json",
  "https://esthesis.org/metadata/search.json"
];

async function ingestMetadata() {
  let globalData = [];

  for (const url of SITES) {
    try {
      console.log(`🔍 Fetching from ${url}...`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const data = await response.json();
      const entries = data.items || data.entries || [];
      
      if (entries.length > 0) {
        const enrichedEntries = entries.map(item => ({
          ...item,
          site: data.site || "External Source"
        }));
        globalData.push(...enrichedEntries); 
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