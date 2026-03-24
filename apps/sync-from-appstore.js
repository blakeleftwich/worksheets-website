/**
 * Sync App Store metadata into each app's info.json
 *
 * Usage: node apps/sync-from-appstore.js
 *
 * What it does:
 * 1. Fetches latest data from iTunes API for all apps
 * 2. Downloads current icons and screenshots
 * 3. Updates each app's info.json with fresh App Store data
 * 4. Preserves any fields you've manually customized (marked with "custom" object)
 *
 * How overrides work:
 * - info.json has "appStore" (auto-synced) and "custom" (your overrides) sections
 * - The page reads: custom.title || appStore.title, custom.description || appStore.description, etc.
 * - To customize a field, add it to the "custom" object in info.json
 * - The sync script NEVER touches the "custom" object
 *
 * Example info.json after sync:
 * {
 *   "slug": "animal-math-games",
 *   "trackId": 799973028,
 *   "category": "Animal Math Series",
 *   "grade": "Pre-K – 2nd",
 *   "appStore": {
 *     "title": "Animal Math Games For Kids",
 *     "description": "Join math-explorer Emma on a ...",
 *     "rating": 4.5,
 *     "ratingCount": 3679,
 *     "price": "Free",
 *     "url": "https://apps.apple.com/us/app/id799973028",
 *     "screenshotCount": 3,
 *     "features": ["Fun gameplay", "Professional narration", ...]
 *   },
 *   "custom": {
 *     "title": "Animal Math Games"
 *   }
 * }
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const APPS_DIR = path.join(__dirname);
const ICONS_DIR = path.join(APPS_DIR, 'icons');
const SS_DIR = path.join(APPS_DIR, 'screenshots');
const DEVELOPER_ID = 480933875;
const MAX_SCREENSHOTS = 3;

// Slug-to-trackId mapping (add new apps here)
const SLUG_MAP = {
  'animal-math-games': 799973028,
  'animal-first-grade-math': 903749612,
  'animal-kindergarten-math': 1064151827,
  'animal-math-toddler-games': 1140979547,
  'animal-pre-k-math': 882334694,
  'animal-second-grade-math': 932147619,
  'animal-math-kindergarten-full': 1064152246,
  'animal-math-school-edition': 799953489,
  'addition-flash-cards': 958762099,
  'subtraction-flash-cards': 958762326,
  'multiplication-flashcards': 960948021,
  'division-flash-cards': 960947603,
  'multiplication-flash-cards-full': 960948405,
  'math-flash-cards': 1200001735,
  'ask-me-colors': 677024235,
  'ask-me-shapes': 683837839,
  'colors-and-shapes': 711225430,
  'shape-game': 716379186,
  'number-match': 698019156,
  'animal-puzzles': 621162682,
  'princess-puzzles': 592786449,
  'farm-puzzles': 549755896,
  'farm-games': 1069878949,
  'coloring-animal-zoo': 550047972,
  'princess-coloring': 567308957,
  'coloring-farm': 517339696,
  'jigsaw-kittens': 972532327,
  'jigsaw-puppies': 972528630,
  'jigsaw-orcas': 1023960454,
  'jigsaw-sharks': 1023960706,
  'jigsaw-polar-bears': 1013847430,
  'farm-story-maker': 1014867757,
  'whose-toes': 532948861,
  'jungle-jam': 480933872,
  'phonics-flashcards': 6448996882,
  'storytime-read-aloud': 1645374904,
  'good-morning-stickers': 1168025542
};

// Category assignments (edit here to recategorize)
const CATEGORIES = {
  799973028: 'Animal Math Series', 903749612: 'Animal Math Series',
  1064151827: 'Animal Math Series', 1140979547: 'Animal Math Series',
  882334694: 'Animal Math Series', 932147619: 'Animal Math Series',
  799953489: 'Animal Math Series', 1064152246: 'Animal Math Series',
  960948021: 'Flash Cards', 958762099: 'Flash Cards', 958762326: 'Flash Cards',
  960947603: 'Flash Cards', 960948405: 'Flash Cards', 1200001735: 'Flash Cards',
  677024235: 'Colors & Shapes', 683837839: 'Colors & Shapes',
  711225430: 'Colors & Shapes', 716379186: 'Colors & Shapes', 698019156: 'Colors & Shapes',
  621162682: 'Puzzles & Jigsaws', 592786449: 'Puzzles & Jigsaws',
  549755896: 'Puzzles & Jigsaws', 1069878949: 'Puzzles & Jigsaws',
  972532327: 'Puzzles & Jigsaws', 972528630: 'Puzzles & Jigsaws',
  1023960454: 'Puzzles & Jigsaws', 1023960706: 'Puzzles & Jigsaws',
  1013847430: 'Puzzles & Jigsaws',
  550047972: 'Coloring', 567308957: 'Coloring', 517339696: 'Coloring',
  6448996882: 'Stories & Reading', 1645374904: 'Stories & Reading',
  1014867757: 'Other Fun', 532948861: 'Other Fun', 480933872: 'Other Fun',
  1168025542: 'Other Fun'
};

// Grade assignments (edit here to change grade labels)
const GRADES = {
  799973028: 'Pre-K \u2013 2nd', 903749612: '1st Grade', 1064151827: 'Kindergarten',
  1140979547: 'Toddlers', 882334694: 'Pre-K', 932147619: '2nd Grade',
  960948021: '3rd Grade', 799953489: 'Pre-K \u2013 2nd', 1064152246: 'Kindergarten',
  958762099: 'K \u2013 2nd', 958762326: 'K \u2013 2nd', 960947603: '3rd Grade',
  960948405: '3rd Grade', 1200001735: 'K \u2013 3rd',
  677024235: 'Pre-K', 683837839: 'Pre-K', 711225430: 'Pre-K', 716379186: 'Pre-K',
  698019156: 'Pre-K',
  621162682: 'All Ages', 592786449: 'All Ages', 549755896: 'All Ages',
  1069878949: 'All Ages', 972532327: 'All Ages', 972528630: 'All Ages',
  1023960454: 'All Ages', 1023960706: 'All Ages', 1013847430: 'All Ages',
  550047972: 'All Ages', 567308957: 'All Ages', 517339696: 'All Ages',
  6448996882: 'Pre-K \u2013 1st', 1645374904: 'Pre-K \u2013 2nd',
  1014867757: 'All Ages', 532948861: 'All Ages', 480933872: 'Toddlers',
  1168025542: 'All Ages'
};

// --- Helpers ---

function download(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(filepath);
        return download(res.headers.location, filepath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', e => { file.close(); reject(e); });
  });
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function generateFeatures(app) {
  // Generate sensible default features from App Store data
  const features = [];
  if (app.description) {
    if (/count/i.test(app.description)) features.push('Counting practice');
    if (/add/i.test(app.description)) features.push('Addition skills');
    if (/subtract/i.test(app.description)) features.push('Subtraction skills');
    if (/multiply|multiplication/i.test(app.description)) features.push('Multiplication practice');
    if (/divisi/i.test(app.description)) features.push('Division practice');
    if (/shape/i.test(app.description)) features.push('Shape recognition');
    if (/color/i.test(app.description)) features.push('Color identification');
    if (/puzzle/i.test(app.description)) features.push('Problem-solving skills');
    if (/pattern/i.test(app.description)) features.push('Pattern recognition');
    if (/narrat/i.test(app.description)) features.push('Professional narration');
  }
  // Always include these defaults
  if (!features.includes('Professional narration') && /narrat/i.test(app.description || ''))
    features.push('Professional narration');
  features.push('Kid-safe design');
  features.push('Parental controls');
  // Pad to at least 6
  const extras = ['Fun and engaging gameplay', 'No ads', 'Designed by teachers', 'Positive encouragement'];
  while (features.length < 6) {
    const e = extras.shift();
    if (e && !features.includes(e)) features.push(e);
    else break;
  }
  return features;
}

// --- Main ---

async function main() {
  console.log('Fetching app data from iTunes API...');

  // Build trackId list from SLUG_MAP
  const trackIds = Object.values(SLUG_MAP);
  const idString = trackIds.join(',');

  const data = await fetchJSON(`https://itunes.apple.com/lookup?id=${idString}`);
  const storeApps = data.results.filter(r => r.wrapperType === 'software');

  console.log(`Found ${storeApps.length} apps on App Store`);

  // Index by trackId
  const storeMap = {};
  storeApps.forEach(a => { storeMap[a.trackId] = a; });

  // Ensure directories exist
  if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });
  if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

  let updated = 0;
  let iconsDl = 0;
  let ssDl = 0;

  for (const [slug, trackId] of Object.entries(SLUG_MAP)) {
    const appDir = path.join(APPS_DIR, slug);
    const infoPath = path.join(appDir, 'info.json');
    const storeApp = storeMap[trackId];

    if (!storeApp) {
      console.log(`  SKIP ${slug} — not found on App Store (id${trackId})`);
      continue;
    }

    // Ensure app directory exists
    if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

    // Read existing info.json to preserve custom overrides
    let existing = {};
    if (fs.existsSync(infoPath)) {
      try { existing = JSON.parse(fs.readFileSync(infoPath, 'utf8')); }
      catch (e) { /* ignore parse errors */ }
    }

    // Download icon
    const iconUrl = storeApp.artworkUrl512 || storeApp.artworkUrl100;
    if (iconUrl) {
      const iconFile = path.join(ICONS_DIR, `appstore_${trackId}.jpg`);
      try {
        await download(iconUrl, iconFile);
        iconsDl++;
      } catch (e) {
        console.log(`  WARN: Failed to download icon for ${slug}: ${e.message}`);
      }
    }

    // Download screenshots (first N)
    const ssUrls = storeApp.screenshotUrls || [];
    let ssCount = 0;
    for (let i = 0; i < Math.min(MAX_SCREENSHOTS, ssUrls.length); i++) {
      const ssFile = path.join(SS_DIR, `${trackId}_${i + 1}.jpg`);
      try {
        await download(ssUrls[i], ssFile);
        ssCount++;
        ssDl++;
      } catch (e) {
        console.log(`  WARN: Failed to download screenshot ${i+1} for ${slug}: ${e.message}`);
      }
    }

    // Build appStore section
    const appStoreData = {
      title: storeApp.trackName,
      description: storeApp.description || '',
      rating: parseFloat((storeApp.averageUserRating || 0).toFixed(1)),
      ratingCount: storeApp.userRatingCount || 0,
      price: storeApp.formattedPrice || 'Free',
      url: `https://apps.apple.com/us/app/id${trackId}`,
      screenshotCount: ssCount,
      features: generateFeatures(storeApp)
    };

    // Build new info.json — preserve custom, update appStore
    const newInfo = {
      slug: slug,
      trackId: trackId,
      category: existing.category || CATEGORIES[trackId] || 'Other Fun',
      grade: existing.grade || GRADES[trackId] || 'All Ages',
      appStore: appStoreData,
      custom: existing.custom || {}
    };

    fs.writeFileSync(infoPath, JSON.stringify(newInfo, null, 2));
    updated++;
  }

  console.log(`\nDone!`);
  console.log(`  ${updated} info.json files updated`);
  console.log(`  ${iconsDl} icons downloaded`);
  console.log(`  ${ssDl} screenshots downloaded`);
  console.log(`\nTo customize an app, edit its info.json and add fields to the "custom" object:`);
  console.log(`  "custom": { "title": "My Custom Title", "description": "My custom description" }`);
  console.log(`\nThe sync script will never overwrite the "custom" object.`);

  // Clean up temp files
  const tempFiles = ['developer_apps.json', 'itunes_full.json', 'apps-data.json', 'build-data.js'];
  tempFiles.forEach(f => {
    const p = path.join(APPS_DIR, f);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`  Cleaned up ${f}`);
    }
  });
}

main().catch(e => { console.error('Error:', e); process.exit(1); });
