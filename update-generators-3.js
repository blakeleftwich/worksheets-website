const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, 'generators');

const NEW_HEADER_BLOCK = `
      const midX = pageW / 2;
      let topGridY;
      {
        let curY = 10;
        if (showHeader === "both") {
          svg.appendChild(svgEl("text", { x: margin, y: curY + 16, "font-family": "Fredoka, sans-serif", "font-size": 12, "font-weight": 400, fill: "#4a5568" }, [document.createTextNode("Name")]));
          svg.appendChild(svgEl("line", { x1: margin + 38, y1: curY + 18, x2: midX - 30, y2: curY + 18, stroke: "#718096", "stroke-width": 0.75 }));
          svg.appendChild(svgEl("text", { x: midX + 20, y: curY + 16, "font-family": "Fredoka, sans-serif", "font-size": 12, "font-weight": 400, fill: "#4a5568" }, [document.createTextNode("Date")]));
          svg.appendChild(svgEl("line", { x1: midX + 54, y1: curY + 18, x2: pageW - margin, y2: curY + 18, stroke: "#718096", "stroke-width": 0.75 }));
          curY += 28;
        } else if (showHeader === "name") {
          svg.appendChild(svgEl("text", { x: margin, y: curY + 16, "font-family": "Fredoka, sans-serif", "font-size": 12, "font-weight": 400, fill: "#4a5568" }, [document.createTextNode("Name")]));
          svg.appendChild(svgEl("line", { x1: margin + 38, y1: curY + 18, x2: pageW - margin, y2: curY + 18, stroke: "#718096", "stroke-width": 0.75 }));
          curY += 28;
        }
        if (title) {
          svg.appendChild(svgEl("text", { x: margin, y: curY + 38, "font-family": "'Google Sans Flex', sans-serif", "font-size": 40, "font-weight": 700, fill: "#9ca3af" }, [document.createTextNode(title)]));
          curY += 46;
        }
        if (subtitle) {
          svg.appendChild(svgEl("text", { x: margin, y: curY + 14, "font-family": "Fredoka, sans-serif", "font-size": 16, "font-weight": 400, fill: "#4a5568" }, [document.createTextNode(subtitle)]));
          curY += 20;
        }
        topGridY = curY + 6;
      }`;

const configs = [
  {
    dir: 'patterns',
    defaultTitle: 'Number Patterns',
    defaultSubtitle: 'Find the pattern and fill in the missing numbers.',
    destructured: 'showHeader, title, subtitle, branded, showAnswers, blanks',
    oldDestructured: 'showHeader, title, branded, showAnswers, blanks',
    gatherTitle: `return "Number Patterns";`,
    normalRenderPattern: /\{ showHeader: opts\.showHeader, title: opts\.title, branded: opts\.branded, showAnswers: false, blanks: opts\.blanks \}/g,
    normalRenderReplace: '{ showHeader: opts.showHeader, title: opts.title, subtitle: opts.subtitle, branded: opts.branded, showAnswers: false, blanks: opts.blanks }',
    answerRenderPattern: /\{ showHeader: "none", title: opts\.title, branded: opts\.branded, showAnswers: true, blanks: opts\.blanks \}/g,
    answerRenderReplace: '{ showHeader: "none", title: opts.title + " \\u2014 Answer Key", subtitle: "", branded: opts.branded, showAnswers: true, blanks: opts.blanks }',
  },
  {
    dir: 'number-line',
    defaultTitle: 'Number Line',
    defaultSubtitle: '',
    destructured: 'showHeader, title, subtitle, branded, showAnswers',
    oldDestructured: 'showHeader, title, branded, showAnswers',
    autoTitleLogic: true,
    normalRenderPattern: /\{ showHeader: opts\.showHeader, title: opts\.title, branded: opts\.branded, showAnswers: false \}/g,
    normalRenderReplace: '{ showHeader: opts.showHeader, title: opts.title, subtitle: opts.subtitle, branded: opts.branded, showAnswers: false }',
    answerRenderPattern: /\{ showHeader: "none", title: opts\.title, branded: opts\.branded, showAnswers: true \}/g,
    answerRenderReplace: '{ showHeader: "none", title: opts.title + " \\u2014 Answer Key", subtitle: "", branded: opts.branded, showAnswers: true }',
  },
  {
    dir: 'measurement',
    defaultTitle: 'Measurement Practice',
    defaultSubtitle: '',
    destructured: 'showHeader, title, subtitle, branded, showAnswers',
    oldDestructured: 'showHeader, title, branded, showAnswers',
    autoTitleLogic: true,
    normalRenderPattern: /\{ showHeader: opts\.showHeader, title: opts\.title, branded: opts\.branded, showAnswers: false \}/g,
    normalRenderReplace: '{ showHeader: opts.showHeader, title: opts.title, subtitle: opts.subtitle, branded: opts.branded, showAnswers: false }',
    answerRenderPattern: /\{ showHeader: "none", title: opts\.title, branded: opts\.branded, showAnswers: true \}/g,
    answerRenderReplace: '{ showHeader: "none", title: opts.title + " \\u2014 Answer Key", subtitle: "", branded: opts.branded, showAnswers: true }',
  },
  {
    dir: 'ten-frame-counting',
    defaultTitle: 'Ten Frame Counting',
    defaultSubtitle: '',
    destructured: 'showHeader, title, subtitle, branded, showAnswers, layout, range',
    oldDestructured: 'showHeader, title, branded, showAnswers, layout, range',
    normalRenderPattern: /\{ showHeader: opts\.showHeader, title: opts\.title, branded: opts\.branded, showAnswers: false, layout: opts\.layout, range: opts\.range \}/g,
    normalRenderReplace: '{ showHeader: opts.showHeader, title: opts.title, subtitle: opts.subtitle, branded: opts.branded, showAnswers: false, layout: opts.layout, range: opts.range }',
    answerRenderPattern: /\{ showHeader: "none", title: opts\.title, branded: opts\.branded, showAnswers: true, layout: opts\.layout, range: opts\.range \}/g,
    answerRenderReplace: '{ showHeader: "none", title: opts.title + " \\u2014 Answer Key", subtitle: "", branded: opts.branded, showAnswers: true, layout: opts.layout, range: opts.range }',
  },
  {
    dir: 'ten-frame-making-ten',
    defaultTitle: 'Making Ten',
    defaultSubtitle: '',
    destructured: 'showHeader, title, subtitle, branded, showAnswers, target',
    oldDestructured: 'showHeader, title, branded, showAnswers, target',
    normalRenderPattern: /\{ showHeader: opts\.showHeader, title: opts\.title, branded: opts\.branded, showAnswers: false, target: opts\.target \}/g,
    normalRenderReplace: '{ showHeader: opts.showHeader, title: opts.title, subtitle: opts.subtitle, branded: opts.branded, showAnswers: false, target: opts.target }',
    answerRenderPattern: /\{ showHeader: "none", title: opts\.title, branded: opts\.branded, showAnswers: true, target: opts\.target \}/g,
    answerRenderReplace: '{ showHeader: "none", title: opts.title + " \\u2014 Answer Key", subtitle: "", branded: opts.branded, showAnswers: true, target: opts.target }',
  },
  {
    dir: 'fill-ten-frame',
    defaultTitle: 'Fill in the Ten Frame',
    defaultSubtitle: 'Fill in the ten frame for each number.',
    destructured: 'showHeader, title, subtitle, branded, showAnswers, frameStyle, range',
    oldDestructured: 'showHeader, title, branded, showAnswers, frameStyle, range',
    normalRenderPattern: /\{ showHeader: opts\.showHeader, title: opts\.title, branded: opts\.branded, showAnswers: false, frameStyle: opts\.frameStyle, range: opts\.range \}/g,
    normalRenderReplace: '{ showHeader: opts.showHeader, title: opts.title, subtitle: opts.subtitle, branded: opts.branded, showAnswers: false, frameStyle: opts.frameStyle, range: opts.range }',
    answerRenderPattern: /\{ showHeader: "none", title: opts\.title, branded: opts\.branded, showAnswers: true, frameStyle: opts\.frameStyle, range: opts\.range \}/g,
    answerRenderReplace: '{ showHeader: "none", title: opts.title + " \\u2014 Answer Key", subtitle: "", branded: opts.branded, showAnswers: true, frameStyle: opts.frameStyle, range: opts.range }',
  },
  {
    dir: 'missing-numbers-grid',
    defaultTitle: 'Missing Numbers',
    defaultSubtitle: '',
    destructured: 'showHeader, title, subtitle, branded, showAnswers',
    oldDestructured: 'showHeader, title, branded, showAnswers',
    autoTitleLogic: true,
    normalRenderPattern: /\{ showHeader: opts\.showHeader, title: opts\.title, branded: opts\.branded, showAnswers: false \}/g,
    normalRenderReplace: '{ showHeader: opts.showHeader, title: opts.title, subtitle: opts.subtitle, branded: opts.branded, showAnswers: false }',
    answerRenderPattern: /\{ showHeader: "none", title: opts\.title, branded: opts\.branded, showAnswers: true \}/g,
    answerRenderReplace: '{ showHeader: "none", title: opts.title + " \\u2014 Answer Key", subtitle: "", branded: opts.branded, showAnswers: true }',
  },
];

for (const cfg of configs) {
  const filePath = path.join(BASE, cfg.dir, 'index.html');
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Replace old destructured options with new (adding subtitle)
  if (cfg.oldDestructured && content.includes(`const { ${cfg.oldDestructured} } = options;`)) {
    content = content.replace(
      `const { ${cfg.oldDestructured} } = options;`,
      `const { ${cfg.destructured} } = options;`
    );
    changed = true;
  }

  // 2. Remove old style element and header block, replace with new
  // Pattern: everything from "svg.appendChild(svgEl("rect"..." through the closing "}" of the else block
  const oldHeaderRegex = /(?:const st = document\.createElementNS[^;]+;\s*st\.textContent = "\.txt \{ font-family:[^"]*";\s*svg\.appendChild\(st\);\s*)?svg\.appendChild\(svgEl\("rect",\s*\{[^}]+\}\)\);\s*(?:\/\/[^\n]*\n\s*)?(?:const midX = pageW \/ 2;\s*)?let top(?:GridY|Y);\s*if \(showHeader === "both"\) \{[\s\S]*?\} else \{\s*(?:const tl = svgEl[^;]+;\s*tl\.textContent[^;]+;\s*svg\.appendChild\(tl\);\s*)?top(?:GridY|Y) = \d+;\s*\}/;

  if (oldHeaderRegex.test(content)) {
    content = content.replace(oldHeaderRegex, `svg.appendChild(svgEl("rect", { x: 0, y: 0, width: pageW, height: pageH, fill: "#fff" }));${NEW_HEADER_BLOCK}`);
    changed = true;
  } else {
    console.log(`WARNING: Could not find old header pattern in ${cfg.dir}`);
  }

  // 3. Update normal render calls
  if (cfg.normalRenderPattern) {
    content = content.replace(cfg.normalRenderPattern, cfg.normalRenderReplace);
    changed = true;
  }

  // 4. Update answer key render calls
  if (cfg.answerRenderPattern) {
    content = content.replace(cfg.answerRenderPattern, cfg.answerRenderReplace);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${cfg.dir}`);
  }
}

console.log('Done with header/render updates.');
