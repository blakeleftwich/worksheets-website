const fs = require('fs');
const d = JSON.parse(fs.readFileSync('apps/developer_apps.json', 'utf8'));
const apps = d.results.filter(r => r.wrapperType === 'software');

const slugMap = {
  799973028:'animal-math-games', 903749612:'animal-first-grade-math',
  1064151827:'animal-kindergarten-math', 1140979547:'animal-math-toddler-games',
  882334694:'animal-pre-k-math', 932147619:'animal-second-grade-math',
  960948021:'multiplication-flashcards', 799953489:'animal-math-school-edition',
  1064152246:'animal-math-kindergarten-full', 958762099:'addition-flash-cards',
  958762326:'subtraction-flash-cards', 960947603:'division-flash-cards',
  960948405:'multiplication-flash-cards-full', 1200001735:'math-flash-cards',
  677024235:'ask-me-colors', 683837839:'ask-me-shapes',
  711225430:'colors-and-shapes', 716379186:'shape-game',
  698019156:'number-match', 621162682:'animal-puzzles',
  592786449:'princess-puzzles', 549755896:'farm-puzzles',
  1069878949:'farm-games', 550047972:'coloring-animal-zoo',
  567308957:'princess-coloring', 517339696:'coloring-farm',
  972532327:'jigsaw-kittens', 972528630:'jigsaw-puppies',
  1023960454:'jigsaw-orcas', 1023960706:'jigsaw-sharks',
  1013847430:'jigsaw-polar-bears', 1014867757:'farm-story-maker',
  532948861:'whose-toes', 480933872:'jungle-jam',
  6448996882:'phonics-flashcards', 1645374904:'storytime-read-aloud',
  1168025542:'good-morning-stickers'
};

const displayNames = {
  799973028:'Animal Math Games', 903749612:'Animal 1st Grade Math',
  1064151827:'Animal Kindergarten Math', 1140979547:'Animal Math Toddler Games',
  882334694:'Animal Pre-K Math', 932147619:'Animal 2nd Grade Math',
  960948021:'Multiplication Flashcards', 799953489:'Animal Math School Edition',
  1064152246:'Animal Math Kindergarten (Full)', 958762099:'Addition Flash Cards',
  958762326:'Subtraction Flash Cards', 960947603:'Division Flash Cards',
  960948405:'Multiplication Flash Cards (Full)', 1200001735:'Math Flash Cards',
  677024235:'Ask Me! Colors', 683837839:'Ask Me! Shapes',
  711225430:'Colors & Shapes', 716379186:'Shape Game',
  698019156:'Number Match', 621162682:'Animal Puzzles',
  592786449:'Princess Puzzles', 549755896:'Farm Puzzles',
  1069878949:'Farm Games', 550047972:'Coloring Animal Zoo',
  567308957:'Princess Coloring', 517339696:'Coloring Farm',
  972532327:'Jigsaw: Kittens', 972528630:'Jigsaw: Puppies',
  1023960454:'Jigsaw: Orcas', 1023960706:'Jigsaw: Sharks',
  1013847430:'Jigsaw: Polar Bears', 1014867757:'Farm Story Maker',
  532948861:'Whose Toes Are Those?', 480933872:'Jungle Jam',
  6448996882:'Phonics Flashcards', 1645374904:'Storytime Read-Aloud',
  1168025542:'Good Morning Stickers'
};

const categoriesMap = {
  799973028:'Animal Math Series', 903749612:'Animal Math Series',
  1064151827:'Animal Math Series', 1140979547:'Animal Math Series',
  882334694:'Animal Math Series', 932147619:'Animal Math Series',
  799953489:'Animal Math Series', 1064152246:'Animal Math Series',
  960948021:'Flash Cards', 958762099:'Flash Cards', 958762326:'Flash Cards',
  960947603:'Flash Cards', 960948405:'Flash Cards', 1200001735:'Flash Cards',
  677024235:'Colors & Shapes', 683837839:'Colors & Shapes',
  711225430:'Colors & Shapes', 716379186:'Colors & Shapes', 698019156:'Colors & Shapes',
  621162682:'Puzzles & Jigsaws', 592786449:'Puzzles & Jigsaws',
  549755896:'Puzzles & Jigsaws', 1069878949:'Puzzles & Jigsaws',
  972532327:'Puzzles & Jigsaws', 972528630:'Puzzles & Jigsaws',
  1023960454:'Puzzles & Jigsaws', 1023960706:'Puzzles & Jigsaws',
  1013847430:'Puzzles & Jigsaws',
  550047972:'Coloring', 567308957:'Coloring', 517339696:'Coloring',
  6448996882:'Stories & Reading', 1645374904:'Stories & Reading',
  1014867757:'Other Fun', 532948861:'Other Fun', 480933872:'Other Fun',
  1168025542:'Other Fun'
};

const grades = {
  799973028:'Pre-K \u2013 2nd', 903749612:'1st Grade', 1064151827:'Kindergarten',
  1140979547:'Toddlers', 882334694:'Pre-K', 932147619:'2nd Grade',
  960948021:'3rd Grade', 799953489:'Pre-K \u2013 2nd', 1064152246:'Kindergarten',
  958762099:'K \u2013 2nd', 958762326:'K \u2013 2nd', 960947603:'3rd Grade',
  960948405:'3rd Grade', 1200001735:'K \u2013 3rd',
  677024235:'Pre-K', 683837839:'Pre-K', 711225430:'Pre-K', 716379186:'Pre-K',
  698019156:'Pre-K',
  621162682:'All Ages', 592786449:'All Ages', 549755896:'All Ages',
  1069878949:'All Ages', 972532327:'All Ages', 972528630:'All Ages',
  1023960454:'All Ages', 1023960706:'All Ages', 1013847430:'All Ages',
  550047972:'All Ages', 567308957:'All Ages', 517339696:'All Ages',
  6448996882:'Pre-K \u2013 1st', 1645374904:'Pre-K \u2013 2nd',
  1014867757:'All Ages', 532948861:'All Ages', 480933872:'Toddlers',
  1168025542:'All Ages'
};

const ssDir = 'apps/screenshots/';
const ssFiles = fs.readdirSync(ssDir);

const result = apps.map(app => {
  const id = app.trackId;
  const slug = slugMap[id];
  if (!slug) return null;
  const ssCount = ssFiles.filter(f => f.startsWith(id + '_')).length;
  return {
    slug,
    trackId: id,
    displayName: displayNames[id] || app.trackName,
    appStoreTitle: app.trackName,
    category: categoriesMap[id] || 'Other Fun',
    grade: grades[id] || 'All Ages',
    description: (app.description || '').substring(0, 300),
    features: ['Fun and engaging gameplay', 'Professional narration', 'Kid-safe design', 'Parental controls', 'No ads', 'Designed by teachers'],
    rating: parseFloat((app.averageUserRating || 0).toFixed(1)),
    ratingCount: app.userRatingCount || 0,
    price: app.formattedPrice || 'Free',
    appStoreUrl: 'https://apps.apple.com/us/app/id' + id,
    screenshotCount: Math.min(ssCount, 3),
    icon: 'icons/appstore_' + id + '.jpg'
  };
}).filter(Boolean);

fs.writeFileSync('apps/apps-data.json', JSON.stringify(result, null, 2));
console.log('Created apps-data.json with ' + result.length + ' apps');
