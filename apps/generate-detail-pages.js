const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const JSON_PATH = path.join(BASE_DIR, 'developer_apps.json');

// Load iTunes data
const itunesData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const allApps = itunesData.results.filter(a => a.wrapperType === 'software');
const appsByTrackId = {};
allApps.forEach(a => { appsByTrackId[a.trackId] = a; });

// Slug → trackId mapping
const slugMap = {
  'animal-math-games': 799973028,
  'animal-first-grade-math': 903749612,
  'animal-kindergarten-math': 1064151827,
  'animal-math-toddler-games': 1140979547,
  'animal-pre-k-math': 882334694,
  'animal-second-grade-math': 932147619,
  'animal-math-kindergarten-full': 1064152246,
  'animal-math-school-edition': 799953489,
  'ask-me-colors': 677024235,
  'ask-me-shapes': 683837839,
  'colors-and-shapes': 711225430,
  'shape-game': 716379186,
  'addition-flash-cards': 958762099,
  'subtraction-flash-cards': 958762326,
  'multiplication-flashcards': 960948021,
  'division-flash-cards': 960947603,
  'multiplication-flash-cards-full': 960948405,
  'math-flash-cards': 1200001735,
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
  'good-morning-stickers': 1168025542,
};

// Categories for related apps
const categories = {
  'math': ['animal-math-games', 'animal-first-grade-math', 'animal-kindergarten-math', 'animal-math-toddler-games', 'animal-pre-k-math', 'animal-second-grade-math', 'animal-math-kindergarten-full', 'animal-math-school-edition'],
  'ask-me': ['ask-me-colors', 'ask-me-shapes', 'colors-and-shapes', 'shape-game'],
  'flash-cards': ['addition-flash-cards', 'subtraction-flash-cards', 'multiplication-flashcards', 'division-flash-cards', 'multiplication-flash-cards-full', 'math-flash-cards'],
  'matching': ['number-match'],
  'puzzles': ['animal-puzzles', 'princess-puzzles', 'farm-puzzles', 'farm-games', 'jigsaw-kittens', 'jigsaw-puppies', 'jigsaw-orcas', 'jigsaw-sharks', 'jigsaw-polar-bears'],
  'coloring': ['coloring-animal-zoo', 'princess-coloring', 'coloring-farm'],
  'other': ['farm-story-maker', 'whose-toes', 'jungle-jam', 'phonics-flashcards', 'storytime-read-aloud', 'good-morning-stickers'],
};

// Reverse lookup: slug → category
const slugToCategory = {};
for (const [cat, slugs] of Object.entries(categories)) {
  slugs.forEach(s => { slugToCategory[s] = cat; });
}

// Display names
const displayNames = {
  'animal-math-games': 'Animal Math Games',
  'animal-first-grade-math': 'Animal 1st Grade Math',
  'animal-kindergarten-math': 'Animal Kindergarten Math',
  'animal-math-toddler-games': 'Animal Math Toddler Games',
  'animal-pre-k-math': 'Animal Pre-K Math',
  'animal-second-grade-math': 'Animal 2nd Grade Math',
  'animal-math-kindergarten-full': 'Animal Math Kindergarten (Full)',
  'animal-math-school-edition': 'Animal Math School Edition',
  'ask-me-colors': 'Ask Me Colors',
  'ask-me-shapes': 'Ask Me Shapes',
  'colors-and-shapes': 'Colors and Shapes',
  'shape-game': 'Shape Game',
  'addition-flash-cards': 'Addition Flash Cards',
  'subtraction-flash-cards': 'Subtraction Flash Cards',
  'multiplication-flashcards': 'Multiplication Flashcards',
  'division-flash-cards': 'Division Flash Cards',
  'multiplication-flash-cards-full': 'Multiplication Flash Cards (Full)',
  'math-flash-cards': 'Math Flash Cards',
  'number-match': 'Number Match',
  'animal-puzzles': 'Animal Puzzles',
  'princess-puzzles': 'Princess Puzzles',
  'farm-puzzles': 'Farm Puzzles',
  'farm-games': 'Farm Games',
  'coloring-animal-zoo': 'Coloring Animal Zoo',
  'princess-coloring': 'Princess Coloring',
  'coloring-farm': 'Coloring Farm',
  'jigsaw-kittens': 'Jigsaw Wonder Kittens',
  'jigsaw-puppies': 'Jigsaw Wonder Puppies',
  'jigsaw-orcas': 'Jigsaw Wonder Orcas',
  'jigsaw-sharks': 'Jigsaw Wonder Sharks',
  'jigsaw-polar-bears': 'Jigsaw Wonder Polar Bears',
  'farm-story-maker': 'Farm Story Maker',
  'whose-toes': "Whose Toes Are Those?",
  'jungle-jam': 'Jungle Jam',
  'phonics-flashcards': 'Phonics Flashcards',
  'storytime-read-aloud': 'Storytime Read-Aloud',
  'good-morning-stickers': 'Good Morning Stickers',
};

// Age/grade badges
const ageBadges = {
  'animal-math-games': 'Pre-K to Grade 2',
  'animal-first-grade-math': 'Grade 1',
  'animal-kindergarten-math': 'Kindergarten',
  'animal-math-toddler-games': 'Ages 2-4',
  'animal-pre-k-math': 'Pre-K',
  'animal-second-grade-math': 'Grade 2',
  'animal-math-kindergarten-full': 'Kindergarten',
  'animal-math-school-edition': 'Pre-K to Grade 2',
  'ask-me-colors': 'Ages 2-5',
  'ask-me-shapes': 'Ages 2-5',
  'colors-and-shapes': 'Ages 2-5',
  'shape-game': 'Ages 2-5',
  'addition-flash-cards': 'Grades K-3',
  'subtraction-flash-cards': 'Grades K-3',
  'multiplication-flashcards': 'Grades 2-4',
  'division-flash-cards': 'Grades 2-4',
  'multiplication-flash-cards-full': 'Grades 2-4',
  'math-flash-cards': 'Grades K-4',
  'number-match': 'Ages 3-6',
  'animal-puzzles': 'Ages 2-5',
  'princess-puzzles': 'Ages 2-5',
  'farm-puzzles': 'Ages 2-5',
  'farm-games': 'Ages 2-5',
  'coloring-animal-zoo': 'Ages 2-6',
  'princess-coloring': 'Ages 2-6',
  'coloring-farm': 'Ages 2-6',
  'jigsaw-kittens': 'Ages 3-7',
  'jigsaw-puppies': 'Ages 3-7',
  'jigsaw-orcas': 'Ages 3-7',
  'jigsaw-sharks': 'Ages 3-7',
  'jigsaw-polar-bears': 'Ages 3-7',
  'farm-story-maker': 'Ages 3-6',
  'whose-toes': 'Ages 2-5',
  'jungle-jam': 'Ages 3-7',
  'phonics-flashcards': 'Ages 3-7',
  'storytime-read-aloud': 'Ages 2-6',
  'good-morning-stickers': 'All Ages',
};

// Descriptions (short marketing paragraphs)
const descriptions = {
  'animal-math-games': "Travel the world from Bessie's Farm to outer space! Join Emma through 100+ math games covering Pre-K through 2nd Grade. Kids explore counting, addition, subtraction, place value, patterns, equations, and word problems with friendly animal characters. Professional narration, no ads, and kid-safe design make it the go-to math app for early learners.",
  'animal-first-grade-math': "Join Emma helping animal friends complete 100+ first grade math challenges! Kids practice counting by 2s, 5s, and 10s, explore number patterns, compare with greater than and less than, solve missing sign problems, tackle word problems, and master addition and subtraction within 20. No ads, professionally narrated, and classroom ready.",
  'animal-kindergarten-math': "Join Emma with silly pets through 100+ fun kindergarten math games! Children practice counting to 100, add and subtract with objects, solve problems within 5, classify objects by attributes, and learn to name shapes. Engaging animal characters and professional narration keep kids learning and smiling.",
  'animal-math-toddler-games': "Introduce toddlers to numbers with three delightful animal friends! Little ones practice counting, number identification, connect the dots, match numbers to groups, and touch to count objects on screen. Designed for the youngest learners with large buttons, gentle sounds, and a safe ad-free environment.",
  'animal-pre-k-math': "Explore the farm with Sherman the sheep through 100 fun Pre-K math games! Children count 1-10, add and subtract with objects and pictures, solve problems within 5, and learn to name shapes and colors. No ads, no subscriptions, and professional narration throughout.",
  'animal-second-grade-math': "Help Emma's animal friends through 100+ second grade math challenges! Students work with plus, minus, greater than, and less than symbols, discover number patterns, solve equations within 100, count by 1s, 10s, and 100s, and build place value understanding. Aligned with common classroom standards.",
  'animal-math-kindergarten-full': "The complete kindergarten math experience with all content unlocked! Every game from Animal Kindergarten Math is available from the start with no in-app purchases needed. Perfect for classrooms and families who want full access to all 100+ activities.",
  'animal-math-school-edition': "The school and classroom edition of Animal Math Games, designed for teachers and schools. All content from Pre-K through 2nd Grade is unlocked with volume purchasing available. Kid-safe, no ads, no in-app purchases, and works offline for classrooms with limited Wi-Fi.",
  'ask-me-colors': "A colorful learning game where toddlers identify colors through fun interactive questions! Kids tap the correct color as a friendly voice asks them to find it. Simple, engaging, and perfect for building early color recognition skills.",
  'ask-me-shapes': "A fun shape learning game where toddlers identify shapes through interactive questions! Kids tap the correct shape as a friendly voice guides them. Simple gameplay builds early geometry recognition skills in a safe, ad-free environment.",
  'colors-and-shapes': "Learn colors and shapes together in this engaging preschool game! Kids identify, match, and sort both colors and shapes through a variety of interactive activities. Builds early visual discrimination and vocabulary skills.",
  'shape-game': "Explore shapes and colors with fun preschool activities! Kids learn to identify and name basic shapes, match shapes to outlines, and build early geometry skills through hands-on play.",
  'addition-flash-cards': "Building addition skills has never been more fun! Kids match addition equations to their answers in a fast-paced card matching game. Hear numbers spoken aloud, customize difficulty levels, and use the Show Me feature to learn new facts.",
  'subtraction-flash-cards': "Building subtraction skills with fun matching! Kids match subtraction equations to answers in an engaging card game. Features spoken numbers, customizable difficulty, and the Show Me option to learn tricky facts.",
  'multiplication-flashcards': "Fun and intuitive flash card matching to learn multiplication! Match multiplication equations to their answers, select specific multipliers to practice, customize difficulty, and enjoy new card designs that make drill practice feel like a game.",
  'division-flash-cards': "Learn division through fun flash card matching! Kids match division equations to answers, select specific divisors to practice, and customize difficulty. The engaging card matching format turns division drill into an enjoyable game.",
  'multiplication-flash-cards-full': "The complete multiplication flash cards experience with all features unlocked! Practice every multiplier with customizable difficulty levels. All card designs and features are available from the start.",
  'math-flash-cards': "All four operations in one app! Practice addition, subtraction, multiplication, and division with fun flash card matching. Switch between operations, customize difficulty, and build math fluency across all basic facts.",
  'number-match': "A fun number matching game for young learners! Kids match numbers to groups of objects, building one-to-one correspondence and early number sense. Colorful visuals and simple gameplay keep young minds engaged.",
  'animal-puzzles': "Adorable animal jigsaw puzzles for kids! Piece together colorful puzzles featuring cute animals while building spatial reasoning, fine motor skills, and problem-solving abilities. Multiple difficulty levels grow with your child.",
  'princess-puzzles': "Magical princess jigsaw puzzles for kids! Assemble beautiful princess scenes while developing spatial awareness, fine motor skills, and patience. Fun sound effects and multiple difficulty levels make every puzzle an adventure.",
  'farm-puzzles': "Fun farm-themed jigsaw puzzles for kids! Put together puzzles featuring farm animals and scenes while building spatial reasoning and fine motor skills. Easy-to-use piece dragging and cheerful sounds make puzzle time a joy.",
  'farm-games': "A collection of fun farm-themed games and puzzles for kids! Explore the farm with animal puzzles, matching games, and interactive activities. Perfect for toddlers and preschoolers who love farm animals.",
  'coloring-animal-zoo': "Color adorable zoo animals with a tap! Kids choose from a variety of animal pictures and bring them to life with vibrant colors. Simple tap-to-color mechanics make this perfect for the youngest artists.",
  'princess-coloring': "A magical princess coloring book for kids! Tap to fill beautiful princess scenes with color. Easy-to-use tap mechanics and enchanting designs make creative playtime simple and fun for young children.",
  'coloring-farm': "A fun farm coloring book for kids! Tap to color farm animals and scenes with vibrant colors. Simple mechanics and cheerful designs make this the perfect creative activity for young children.",
  'jigsaw-kittens': "Adorable kitten jigsaw puzzles from the Jigsaw Wonder series! Piece together beautiful kitten photos while building spatial reasoning and problem-solving skills. Multiple puzzle sizes for all skill levels.",
  'jigsaw-puppies': "Cute puppy jigsaw puzzles from the Jigsaw Wonder series! Assemble charming puppy photos while developing spatial awareness and patience. Multiple puzzle sizes let kids choose their challenge level.",
  'jigsaw-orcas': "Amazing orca jigsaw puzzles from the Jigsaw Wonder series! Piece together stunning orca whale photos while building problem-solving skills. Educational and fun with multiple difficulty levels.",
  'jigsaw-sharks': "Exciting shark jigsaw puzzles from the Jigsaw Wonder series! Assemble incredible shark photos while developing spatial reasoning. Fun facts and multiple puzzle sizes make learning about sharks an adventure.",
  'jigsaw-polar-bears': "Beautiful polar bear jigsaw puzzles from the Jigsaw Wonder series! Piece together stunning polar bear photos while building spatial awareness and problem-solving skills. Multiple difficulty levels for all ages.",
  'farm-story-maker': "Create your own farm stories! Kids place farm animals, characters, and objects on scenes to build imaginative stories. Encourages creativity, storytelling, and language development through open-ended play.",
  'whose-toes': "Whose toes are those? A fun guessing game where kids look at animal toes and guess which animal they belong to! Builds observation skills, animal knowledge, and vocabulary through playful interaction.",
  'jungle-jam': "A child-friendly jungle adventure game! Explore the jungle with fun activities and challenges. Engaging gameplay in a safe, kid-friendly environment with no ads or in-app purchases.",
  'phonics-flashcards': "Learn phonics with interactive flash cards! Kids practice letter sounds, blends, and sight words through engaging card-based activities. Build early reading skills with professional audio and clear visuals.",
  'storytime-read-aloud': "Interactive read-aloud stories for young children! Listen to engaging stories with professional narration while following along with beautiful illustrations. Builds listening comprehension and a love of reading.",
  'good-morning-stickers': "Bright and cheerful emoji stickers to share good morning greetings! A fun sticker pack for iMessage featuring sunshine, happy faces, and positive morning vibes.",
};

// Features
const features = {
  'animal-math-games': ['Count to 100 with fun challenges', 'Addition and subtraction practice', 'Classify and sort objects', 'Name and identify shapes', 'Professional narration throughout', 'Parental controls built in', 'Place value and expanded form', 'Word problems and reasoning'],
  'animal-first-grade-math': ['Count by 2s, 5s, and 10s', 'Number patterns and sequences', 'Greater than and less than comparisons', 'Missing signs in equations', 'Word problems and story math', 'Add and subtract within 20', 'No ads or subscriptions', 'Classroom aligned curriculum'],
  'animal-kindergarten-math': ['Count to 100 step by step', 'Addition and subtraction with objects', 'Add and subtract within 5', 'Classify objects by attributes', 'Name and identify shapes', 'Professional narration and feedback', 'No ads or in-app purchases', 'Works offline for travel'],
  'animal-math-toddler-games': ['Counting practice with objects', 'Number identification 1-10', 'Connect the dots activities', 'Match numbers to groups', 'Touch to count on screen', 'Large buttons for little fingers', 'Gentle sounds and encouragement', 'Safe ad-free environment'],
  'animal-pre-k-math': ['Count from 1 to 10', 'Addition and subtraction with objects', 'Add and subtract within 5', 'Name shapes and colors', 'Professional narration', 'No ads or subscriptions', 'Engaging farm characters', 'Works offline anywhere'],
  'animal-second-grade-math': ['Plus, minus, greater, less symbols', 'Number patterns and sequences', 'Equations within 100', 'Count by 1s, 10s, and 100s', 'Place value understanding', 'Multi-step problem solving', 'Aligned with school standards', 'No ads or data collection'],
  'animal-math-kindergarten-full': ['All games unlocked from start', 'Complete kindergarten curriculum', 'No in-app purchases needed', 'Count, add, and subtract', 'Shape and object identification', 'Professional narration', 'Perfect for classrooms', 'Works offline'],
  'animal-math-school-edition': ['All Pre-K to Grade 2 content', 'Volume purchase available', 'No ads or in-app purchases', 'Works offline in classrooms', 'Kid-safe and COPPA compliant', 'Professional narration', 'Covers all core math topics', 'Designed for school use'],
  'ask-me-colors': ['Identify colors by name', 'Fun voice-guided questions', 'Tap to answer gameplay', 'Build color vocabulary', 'Simple toddler-friendly design', 'Cheerful sounds and feedback'],
  'ask-me-shapes': ['Identify shapes by name', 'Interactive voice questions', 'Tap to answer format', 'Build geometry vocabulary', 'Toddler-friendly large buttons', 'Positive audio feedback'],
  'colors-and-shapes': ['Learn colors and shapes together', 'Matching and sorting activities', 'Visual discrimination practice', 'Build early vocabulary', 'Multiple activity types', 'Engaging preschool content'],
  'shape-game': ['Identify basic shapes', 'Match shapes to outlines', 'Color and shape combos', 'Early geometry foundations', 'Fun preschool activities', 'Simple tap gameplay'],
  'addition-flash-cards': ['Match equations to answers', 'Hear numbers spoken aloud', 'Custom difficulty levels', 'Show Me learning feature', 'Fast-paced card matching', 'Track progress over time'],
  'subtraction-flash-cards': ['Match equations to answers', 'Hear numbers spoken aloud', 'Custom difficulty levels', 'Show Me learning feature', 'Engaging card game format', 'Build subtraction fluency'],
  'multiplication-flashcards': ['Match equations to answers', 'Select specific multipliers', 'Custom difficulty settings', 'New card designs', 'Fun matching gameplay', 'Build multiplication fluency'],
  'division-flash-cards': ['Match equations to answers', 'Select specific divisors', 'Custom difficulty settings', 'Engaging card format', 'Build division fluency', 'Learn through play'],
  'multiplication-flash-cards-full': ['All multipliers unlocked', 'Every card design available', 'Custom difficulty levels', 'No in-app purchases', 'Complete multiplication practice', 'Track your progress'],
  'math-flash-cards': ['All four operations included', 'Switch between operations', 'Custom difficulty levels', 'Fun card matching format', 'Build overall math fluency', 'Hear numbers spoken aloud'],
  'number-match': ['Match numbers to object groups', 'One-to-one correspondence', 'Build early number sense', 'Colorful visual design', 'Simple engaging gameplay', 'Perfect for young learners'],
  'animal-puzzles': ['Adorable animal puzzle pieces', 'Multiple difficulty levels', 'Build spatial reasoning', 'Develop fine motor skills', 'Problem-solving practice', 'Cheerful completion rewards'],
  'princess-puzzles': ['Beautiful princess scenes', 'Multiple difficulty levels', 'Spatial awareness building', 'Fine motor development', 'Fun sound effects', 'Encouraging completion rewards'],
  'farm-puzzles': ['Farm animal themed puzzles', 'Easy piece dragging', 'Build spatial reasoning', 'Fine motor skill practice', 'Multiple puzzle sizes', 'Cheerful sound feedback'],
  'farm-games': ['Farm animal puzzles', 'Matching game activities', 'Interactive farm exploration', 'Multiple game types', 'Toddler-friendly controls', 'Fun farm sounds'],
  'coloring-animal-zoo': ['Tap to color animals', 'Vibrant color palette', 'Zoo animal designs', 'Simple tap mechanics', 'Perfect for young artists', 'Save and share creations'],
  'princess-coloring': ['Magical princess scenes', 'Tap to fill with color', 'Enchanting designs', 'Easy-to-use interface', 'Creative free play', 'Beautiful color palette'],
  'coloring-farm': ['Farm animal scenes', 'Tap to color design', 'Cheerful farm theme', 'Simple for young kids', 'Vibrant color choices', 'Fun creative activity'],
  'jigsaw-kittens': ['Beautiful kitten photos', 'Multiple puzzle sizes', 'Build spatial reasoning', 'Problem-solving practice', 'Adorable reward animations', 'Relaxing puzzle gameplay'],
  'jigsaw-puppies': ['Charming puppy photos', 'Multiple puzzle sizes', 'Spatial awareness building', 'Patience and focus practice', 'Cute completion rewards', 'Choose your challenge level'],
  'jigsaw-orcas': ['Stunning orca whale photos', 'Multiple difficulty levels', 'Educational and fun', 'Build problem-solving skills', 'Amazing ocean imagery', 'Learn about orcas'],
  'jigsaw-sharks': ['Incredible shark photos', 'Multiple puzzle sizes', 'Spatial reasoning practice', 'Fun shark facts', 'Exciting ocean theme', 'Choose your difficulty'],
  'jigsaw-polar-bears': ['Stunning polar bear photos', 'Multiple difficulty levels', 'Spatial awareness building', 'Problem-solving practice', 'Beautiful arctic imagery', 'Relaxing puzzle play'],
  'farm-story-maker': ['Place animals on scenes', 'Build imaginative stories', 'Creative open-ended play', 'Farm characters and objects', 'Storytelling development', 'Language skill building'],
  'whose-toes': ['Guess the animal by its toes', 'Fun observation game', 'Build animal knowledge', 'Vocabulary development', 'Playful interactive format', 'Surprising reveals'],
  'jungle-jam': ['Jungle adventure activities', 'Child-friendly gameplay', 'Safe kid environment', 'No ads or purchases', 'Engaging jungle theme', 'Fun challenges and games'],
  'phonics-flashcards': ['Letter sound practice', 'Blends and combinations', 'Sight word recognition', 'Professional audio', 'Clear visual design', 'Build early reading skills'],
  'storytime-read-aloud': ['Professional narration', 'Beautiful illustrations', 'Follow-along text', 'Listening comprehension', 'Build love of reading', 'Engaging story collection'],
  'good-morning-stickers': ['Cheerful emoji stickers', 'iMessage integration', 'Morning greeting themes', 'Sunshine and happy faces', 'Easy to share', 'Positive vibes collection'],
};

// Amazon URLs for some apps
const amazonUrls = {
  'animal-math-games': 'https://www.amazon.com/dp/B00NM2O28U',
  'animal-first-grade-math': 'https://www.amazon.com/dp/B014G2F9EO',
  'animal-kindergarten-math': 'https://www.amazon.com/dp/B01N4IDGP9',
  'animal-math-toddler-games': 'https://www.amazon.com/dp/B074PMXZ7M',
  'animal-pre-k-math': 'https://www.amazon.com/dp/B013XQAQ8C',
  'animal-second-grade-math': 'https://www.amazon.com/dp/B015D0Z8FC',
};

// Count available screenshots for each trackId
function countScreenshots(trackId) {
  let count = 0;
  for (let i = 1; i <= 20; i++) {
    const p = path.join(BASE_DIR, 'screenshots', `${trackId}_${i}.jpg`);
    if (fs.existsSync(p)) count++;
    else break;
  }
  return count;
}

function starHTML(rating) {
  const full = Math.floor(rating);
  const half = (rating - full) >= 0.25 ? 1 : 0;
  const empty = 5 - full - half;
  let html = '';
  for (let i = 0; i < full; i++) html += '&#9733;';
  if (half) html += '&#9734;';
  for (let i = 0; i < empty; i++) html += '&#9734;';
  return html;
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function getRelatedApps(slug, count = 4) {
  const cat = slugToCategory[slug];
  if (!cat) return [];
  const sameCat = categories[cat].filter(s => s !== slug);
  // If not enough, grab from other categories
  let related = [...sameCat];
  if (related.length < count) {
    const others = Object.values(categories).flat().filter(s => s !== slug && !related.includes(s));
    related = related.concat(others.slice(0, count - related.length));
  }
  return related.slice(0, count);
}

function generatePage(slug, trackId) {
  const app = appsByTrackId[trackId];
  if (!app) {
    console.warn(`  WARNING: No iTunes data for trackId ${trackId} (${slug}), skipping.`);
    return null;
  }

  const name = displayNames[slug] || app.trackName;
  const badge = ageBadges[slug] || '4+';
  const desc = descriptions[slug] || app.description || '';
  const featureList = features[slug] || [];
  const rating = app.averageUserRating || 0;
  const ratingCount = app.userRatingCount || 0;
  const price = app.price || 0;
  const formattedPrice = app.formattedPrice || 'Free';
  const appStoreUrl = app.trackViewUrl || '';
  const amazonUrl = amazonUrls[slug] || '';
  const screenshotCount = countScreenshots(trackId);
  const related = getRelatedApps(slug);

  const priceClass = price === 0 ? 'free' : 'paid';
  const priceLabel = price === 0 ? 'Free' : formattedPrice;

  // Build action buttons
  let actionButtons = '';
  if (appStoreUrl) {
    actionButtons += `<a href="${escapeHTML(appStoreUrl)}" target="_blank" rel="noopener" class="action-btn appstore-action">&#xf179; App Store &rarr;</a>`;
  }
  if (amazonUrl) {
    actionButtons += `<a href="${escapeHTML(amazonUrl)}" target="_blank" rel="noopener" class="action-btn amazon-action">Amazon Appstore &rarr;</a>`;
  }

  // Build screenshot gallery
  let screenshotGallery = '';
  if (screenshotCount > 0) {
    let thumbs = '';
    for (let i = 1; i <= screenshotCount; i++) {
      thumbs += `<img src="../screenshots/${trackId}_${i}.jpg" alt="${escapeHTML(name)} screenshot ${i}" class="gallery-thumb" data-index="${i - 1}" loading="lazy">`;
    }
    screenshotGallery = `
  <section class="screenshot-section">
    <div class="section-inner">
      <h2 class="section-heading">Screenshots</h2>
      <div class="gallery-container">
        <button class="scroll-arrow scroll-left" aria-label="Scroll left">&lsaquo;</button>
        <div class="gallery-strip">${thumbs}</div>
        <button class="scroll-arrow scroll-right" aria-label="Scroll right">&rsaquo;</button>
      </div>
    </div>
  </section>`;
  }

  // Build features section
  let featuresSection = '';
  if (featureList.length > 0) {
    const items = featureList.map(f => `<div class="feature-item"><span class="feature-check">&#10003;</span> ${escapeHTML(f)}</div>`).join('\n            ');
    featuresSection = `
  <section class="features-section">
    <div class="section-inner">
      <h2 class="section-heading">What Your Child Will Learn</h2>
      <div class="features-grid">
            ${items}
      </div>
    </div>
  </section>`;
  }

  // Build related apps section
  let relatedSection = '';
  if (related.length > 0) {
    const cards = related.map(rs => {
      const rtid = slugMap[rs];
      const rapp = appsByTrackId[rtid];
      if (!rapp) return '';
      const rname = displayNames[rs] || rapp.trackName;
      const rprice = rapp.price === 0 ? 'Free' : rapp.formattedPrice;
      const rpriceClass = rapp.price === 0 ? 'free' : 'paid';
      return `
          <a href="../${rs}/index.html" class="related-card">
            <img src="../icons/appstore_${rtid}.jpg" alt="${escapeHTML(rname)}" class="related-icon">
            <div class="related-name">${escapeHTML(rname)}</div>
            <div class="related-meta">
              <span class="star-rating"><span class="stars">${starHTML(rapp.averageUserRating || 0)}</span> ${(rapp.averageUserRating || 0).toFixed(1)}</span>
              <span class="price-badge ${rpriceClass}">${rprice}</span>
            </div>
          </a>`;
    }).filter(Boolean).join('');

    relatedSection = `
  <section class="related-section">
    <div class="section-inner">
      <h2 class="section-heading">You Might Also Like</h2>
      <div class="related-grid">${cards}
      </div>
    </div>
  </section>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(name)} | Animal Math</title>
  <meta name="description" content="${escapeHTML(desc.substring(0, 160))}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #fff;
      color: #1e293b;
      min-height: 100vh;
    }

    /* ===== Header ===== */
    .site-header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .nav-links { display: flex; gap: 4px; }
    .nav-links a {
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      text-decoration: none;
      padding: 8px 14px;
      border-radius: 8px;
      transition: all 0.15s;
    }
    .nav-links a:hover { background: #f1f5f9; color: #1e293b; }
    .nav-links a.active { background: #fef3c7; color: #92400e; }

    /* ===== Back Link ===== */
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 16px 0 0;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      padding-left: 24px;
      padding-right: 24px;
      padding-top: 20px;
    }
    .back-link a {
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      text-decoration: none;
      transition: color 0.15s;
    }
    .back-link a:hover { color: #1e293b; }

    /* ===== App Header ===== */
    .app-header {
      background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%);
      padding: 40px 24px 48px;
    }
    .app-header-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      gap: 32px;
      align-items: flex-start;
    }
    .app-icon {
      width: 140px;
      height: 140px;
      border-radius: 24px;
      flex-shrink: 0;
      object-fit: cover;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
    }
    .app-info {
      flex: 1;
      min-width: 0;
    }
    .app-info h1 {
      font-family: 'DM Sans', sans-serif;
      font-size: 32px;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1.2;
      margin-bottom: 12px;
    }
    .app-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .grade-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      background: #fef3c7;
      color: #92400e;
    }
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
    .star-rating .stars {
      color: #f59e0b;
      font-size: 16px;
      letter-spacing: -1px;
    }
    .rating-count {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 400;
    }
    .price-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .price-badge.free { background: #dcfce7; color: #166534; }
    .price-badge.paid { background: #f1f5f9; color: #475569; }

    .app-description {
      font-size: 15px;
      line-height: 1.7;
      color: #475569;
      margin-bottom: 20px;
      max-width: 700px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 22px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s;
    }
    .appstore-action {
      background: #1e293b;
      color: white;
      border: 2px solid #1e293b;
    }
    .appstore-action:hover {
      background: #334155;
      border-color: #334155;
    }
    .amazon-action {
      background: white;
      color: #1e293b;
      border: 2px solid #e2e8f0;
    }
    .amazon-action:hover {
      border-color: #f59e0b;
      color: #92400e;
      background: #fffbeb;
    }

    /* ===== Screenshot Gallery ===== */
    .screenshot-section {
      background: #1a1a2e;
      padding: 40px 0;
    }
    .section-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .screenshot-section .section-heading {
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .gallery-container {
      position: relative;
    }
    .gallery-strip {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scroll-behavior: smooth;
      padding: 8px 0 16px;
      scrollbar-width: thin;
      scrollbar-color: #475569 transparent;
    }
    .gallery-strip::-webkit-scrollbar { height: 6px; }
    .gallery-strip::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
    .gallery-thumb {
      height: 200px;
      width: auto;
      border-radius: 12px;
      flex-shrink: 0;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 2px solid transparent;
    }
    .gallery-thumb:hover {
      transform: scale(1.04);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      border-color: rgba(255,255,255,0.3);
    }
    .scroll-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      border: none;
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
      cursor: pointer;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.15s;
    }
    .scroll-arrow:hover { background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
    .scroll-left { left: -8px; }
    .scroll-right { right: -8px; }

    /* ===== Lightbox ===== */
    .lightbox {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.92);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    .lightbox.active { display: flex; }
    .lightbox-close {
      position: absolute;
      top: 20px;
      right: 24px;
      background: none;
      border: none;
      color: white;
      font-size: 36px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.15s;
      z-index: 10;
    }
    .lightbox-close:hover { opacity: 1; }
    .lightbox img {
      max-height: 85vh;
      max-width: 90vw;
      border-radius: 12px;
      object-fit: contain;
    }
    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.15);
      border: none;
      color: white;
      font-size: 32px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .lightbox-nav:hover { background: rgba(255,255,255,0.3); }
    .lightbox-prev { left: 20px; }
    .lightbox-next { right: 20px; }

    /* ===== Features ===== */
    .features-section {
      padding: 48px 0;
      background: #f8fafc;
    }
    .features-section .section-heading {
      font-family: 'DM Sans', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 24px;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .feature-item {
      background: white;
      padding: 14px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #334155;
      border: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .feature-check {
      color: #22c55e;
      font-size: 18px;
      font-weight: 700;
      flex-shrink: 0;
    }

    /* ===== Related Apps ===== */
    .related-section {
      padding: 48px 0 64px;
    }
    .related-section .section-heading {
      font-family: 'DM Sans', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 24px;
    }
    .related-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .related-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 20px;
      text-align: center;
      text-decoration: none;
      transition: all 0.2s;
    }
    .related-card:hover {
      border-color: #fbbf24;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      transform: translateY(-2px);
    }
    .related-icon {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      object-fit: cover;
      margin-bottom: 12px;
    }
    .related-name {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    .related-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .related-meta .star-rating { font-size: 12px; }
    .related-meta .stars { font-size: 13px; }
    .related-meta .price-badge { font-size: 11px; padding: 2px 8px; }

    /* ===== Footer ===== */
    .site-footer {
      text-align: center;
      padding: 24px;
      font-size: 13px;
      color: #94a3b8;
      border-top: 1px solid #e5e7eb;
      background: #fff;
    }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .site-header { padding: 0 16px; }
      .nav-links { gap: 2px; flex-wrap: wrap; justify-content: center; }
      .nav-links a { padding: 6px 10px; font-size: 13px; }

      .app-header { padding: 24px 16px 32px; }
      .app-header-inner {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .app-icon { width: 110px; height: 110px; border-radius: 20px; }
      .app-info h1 { font-size: 24px; }
      .app-meta { justify-content: center; }
      .app-description { max-width: 100%; }
      .action-buttons { justify-content: center; }

      .features-grid { grid-template-columns: 1fr; }

      .related-grid { grid-template-columns: repeat(2, 1fr); }

      .back-link { padding-left: 16px; }
    }
    @media (max-width: 480px) {
      .related-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="../../"><img src="../../images/logo.png" alt="Animal Math" height="36"></a>
      <nav class="nav-links">
        <a href="../../printables/">Printables</a>
        <a href="../../generators.html">Generators</a>
        <a href="../../tools/index.html">Tools</a>
        <a href="../../songs/index.html">Songs</a>
        <a href="../index.html" class="active">Apps</a>
        <a href="../../about.html">About</a>
        <a href="../../my-sets/index.html">My Worksheet Sets</a>
      </nav>
    </div>
  </header>

  <div class="back-link"><a href="../index.html">&larr; Back to Apps</a></div>

  <section class="app-header">
    <div class="app-header-inner">
      <img src="../icons/appstore_${trackId}.jpg" alt="${escapeHTML(name)}" class="app-icon">
      <div class="app-info">
        <h1>${escapeHTML(name)}</h1>
        <div class="app-meta">
          <span class="grade-badge">${escapeHTML(badge)}</span>
          <span class="star-rating"><span class="stars">${starHTML(rating)}</span> ${rating.toFixed(1)}</span>
          <span class="rating-count">(${ratingCount.toLocaleString()} ratings)</span>
          <span class="price-badge ${priceClass}">${priceLabel}</span>
        </div>
        <p class="app-description">${escapeHTML(desc)}</p>
        <div class="action-buttons">
          ${actionButtons}
        </div>
      </div>
    </div>
  </section>
${screenshotGallery}
${featuresSection}
${relatedSection}

  <footer class="site-footer">
    &copy; ${new Date().getFullYear()} Eggroll Games LLC. All rights reserved.
  </footer>

  <!-- Lightbox -->
  <div class="lightbox" id="lightbox">
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <button class="lightbox-nav lightbox-prev" aria-label="Previous">&lsaquo;</button>
    <img src="" alt="Screenshot" id="lightbox-img">
    <button class="lightbox-nav lightbox-next" aria-label="Next">&rsaquo;</button>
  </div>

  <script>
    // Gallery scroll arrows
    const strip = document.querySelector('.gallery-strip');
    const leftBtn = document.querySelector('.scroll-left');
    const rightBtn = document.querySelector('.scroll-right');
    if (strip && leftBtn && rightBtn) {
      leftBtn.addEventListener('click', () => strip.scrollBy({ left: -300, behavior: 'smooth' }));
      rightBtn.addEventListener('click', () => strip.scrollBy({ left: 300, behavior: 'smooth' }));
    }

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const thumbs = document.querySelectorAll('.gallery-thumb');
    let currentIndex = 0;
    const sources = Array.from(thumbs).map(t => t.src);

    function openLightbox(index) {
      currentIndex = index;
      lightboxImg.src = sources[currentIndex];
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
    function navigate(dir) {
      currentIndex = (currentIndex + dir + sources.length) % sources.length;
      lightboxImg.src = sources[currentIndex];
    }

    thumbs.forEach((t, i) => t.addEventListener('click', () => openLightbox(i)));
    document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-prev')?.addEventListener('click', () => navigate(-1));
    document.querySelector('.lightbox-next')?.addEventListener('click', () => navigate(1));
    lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox?.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  </script>
</body>
</html>`;
}

// Main
let generated = 0;
let skipped = 0;

for (const [slug, trackId] of Object.entries(slugMap)) {
  const dir = path.join(BASE_DIR, slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const html = generatePage(slug, trackId);
  if (html) {
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
    console.log(`  Generated: apps/${slug}/index.html`);
    generated++;
  } else {
    skipped++;
  }
}

console.log(`\nDone! Generated ${generated} pages, skipped ${skipped}.`);
