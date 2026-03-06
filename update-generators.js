// Script to update worksheet generators with new title/subtitle system
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'generators');

const configs = [
  { dir: 'ordinal-numbers', title: 'Ordinal Numbers', subtitle: '' },
  { dir: 'making-ten', title: 'Making 10', subtitle: '' },
  { dir: 'fact-families', title: 'Fact Families', subtitle: '' },
  { dir: 'patterns', title: 'Number Patterns', subtitle: 'Find the pattern and fill in the missing numbers.' },
  { dir: 'number-line', title: 'Number Line', subtitle: '' },
  { dir: 'measurement', title: 'Measurement Practice', subtitle: '' },
  { dir: 'ten-frame-counting', title: 'Ten Frame Counting', subtitle: '' },
  { dir: 'ten-frame-making-ten', title: 'Making Ten', subtitle: '' },
  { dir: 'fill-ten-frame', title: 'Fill in the Ten Frame', subtitle: 'Fill in the ten frame for each number.' },
  { dir: 'place-value-chart', title: 'Place Value Chart', subtitle: 'Write each digit in the correct place value column.' },
  { dir: 'missing-numbers-grid', title: 'Missing Numbers', subtitle: '' },
];

for (const cfg of configs) {
  const filePath = path.join(BASE, cfg.dir, 'index.html');
  let content = fs.readFileSync(filePath, 'utf8');

  // CHANGE 1: Update Google Fonts link
  content = content.replace(
    '<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@700&family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet">'
  );

  // CHANGE 3: Update .adv-sub CSS to include input[type="text"]
  // Only change if it has .adv-sub select { but not .adv-sub input
  if (content.includes('.adv-sub select {') && !content.includes('.adv-sub input[type="text"]')) {
    content = content.replace(
      /\.adv-sub select \{/,
      '.adv-sub select,\n    .adv-sub input[type="text"] {'
    );
  }
  if (content.includes('.adv-sub select,\n    .adv-sub input[type="text"] {') === false &&
      content.includes('.adv-sub select {') && !content.includes('input[type="text"]')) {
    // Try alternate format
  }

  // CHANGE 2: Replace custom title HTML section
  const oldTitleHtml1 = /<!-- Custom title -->\s*<div class="adv-checkbox-row">\s*<input type="checkbox" id="customTitleEnabled" \/>\s*<label for="customTitleEnabled">Customize worksheet title<\/label>\s*<\/div>\s*<div class="adv-sub" id="customTitleOptions" style="display:none;">\s*<label for="worksheetTitle">Title<\/label>\s*<input type="text" id="worksheetTitle" value="[^"]*"[^\/]*\/>\s*<\/div>/;

  const newTitleHtml = `<!-- Customize worksheet titles -->
          <div class="adv-checkbox-row">
            <input type="checkbox" id="customTitleEnabled" />
            <label for="customTitleEnabled">Customize worksheet titles</label>
          </div>
          <div class="adv-sub" id="customTitleOptions" style="display:none;">
            <div class="adv-checkbox-row" style="margin-bottom:8px;">
              <input type="checkbox" id="showTitle" checked />
              <label for="showTitle">Show title</label>
            </div>
            <div id="titleInputWrap">
              <label for="headerText">Title</label>
              <input type="text" id="headerText" value="${cfg.title}" />
            </div>
            <div class="adv-checkbox-row" style="margin-top:10px;margin-bottom:8px;">
              <input type="checkbox" id="showSubtitle" checked />
              <label for="showSubtitle">Show subtitle</label>
            </div>
            <div id="subtitleInputWrap">
              <label for="subtitleText">Subtitle</label>
              <input type="text" id="subtitleText" value="${cfg.subtitle}" />
            </div>
          </div>`;

  if (oldTitleHtml1.test(content)) {
    content = content.replace(oldTitleHtml1, newTitleHtml);
  } else {
    console.log(`WARNING: Could not find custom title HTML in ${cfg.dir}`);
  }

  // CHANGE 4: Update svgEl function to support children
  if (content.includes('function svgEl(tag, attrs) {')) {
    content = content.replace(
      /function svgEl\(tag, attrs\) \{\s*const el = document\.createElementNS\("http:\/\/www\.w3\.org\/2000\/svg", tag\);\s*if \(attrs\) Object\.entries\(attrs\)\.forEach\(\(\[k, v\]\) => el\.setAttribute\(k, v\)\);\s*return el;\s*\}/,
      `function svgEl(tag, attrs, children) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
      if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      if (children) children.forEach(c => el.appendChild(c));
      return el;
    }`
    );
  }

  // CHANGE 4: Update JS element references - replace elTitle with new refs
  content = content.replace(
    /const elTitle = document\.getElementById\("worksheetTitle"\);/,
    `const elHeaderText = document.getElementById("headerText");
    const elSubtitleText = document.getElementById("subtitleText");
    const elShowTitle = document.getElementById("showTitle");
    const elShowSubtitle = document.getElementById("showSubtitle");
    const elTitleInputWrap = document.getElementById("titleInputWrap");
    const elSubtitleInputWrap = document.getElementById("subtitleInputWrap");`
  );

  // CHANGE 8: Update event listeners
  content = content.replace(
    /elCustomTitleEnabled\.addEventListener\("change", \(\) => \{\s*elCustomTitleOptions\.style\.display = elCustomTitleEnabled\.checked \? "block" : "none";\s*renderWithoutRandomization\(\);\s*\}\);\s*elTitle\.addEventListener\("input", \(\) => renderWithoutRandomization\(\)\);/,
    `elCustomTitleEnabled.addEventListener("change", () => {
      elCustomTitleOptions.style.display = elCustomTitleEnabled.checked ? "" : "none";
      renderWithoutRandomization();
    });
    elShowTitle.addEventListener("change", () => {
      elTitleInputWrap.style.display = elShowTitle.checked ? "" : "none";
      renderWithoutRandomization();
    });
    elShowSubtitle.addEventListener("change", () => {
      elSubtitleInputWrap.style.display = elShowSubtitle.checked ? "" : "none";
      renderWithoutRandomization();
    });
    elHeaderText.addEventListener("input", () => renderWithoutRandomization());
    elSubtitleText.addEventListener("input", () => renderWithoutRandomization());`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated common patterns in ${cfg.dir}`);
}

console.log('Done with common patterns. Manual updates still needed for each file.');
