// Script to update remaining generator files with header rendering and gatherOptions
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'generators');

// Common new header block template (used for search/replace)
function makeNewHeader(destructuredVars) {
  return `      const { ${destructuredVars} } = options;
      const pageW = 612, pageH = 792, margin = 36;
      const svg = svgEl("svg", { width: pageW, height: pageH, viewBox: "0 0 " + pageW + " " + pageH, xmlns: "http://www.w3.org/2000/svg" });
      svg.appendChild(svgEl("rect", { x: 0, y: 0, width: pageW, height: pageH, fill: "#fff" }));

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
}

// Replace old header block pattern with new one
function replaceOldHeader(content, newDestructured) {
  // Match the old header pattern: destructure, svg creation with style element, rect, then if/else header block
  const oldPattern = /const \{ ([^}]+) \} = options;\s*const pageW = 612, pageH = 792, margin = 36;\s*const svg = svgEl\("svg"[^)]+\);\s*(?:const st = document\.createElementNS[^;]+;\s*st\.textContent = "\.txt \{[^"]*\}";\s*svg\.appendChild\(st\);\s*)?svg\.appendChild\(svgEl\("rect"[^)]+\)\);\s*(?:const midX = pageW \/ 2;\s*)?let top(?:GridY|Y);\s*(?:\{\s*let curY = 10;\s*)?if \(showHeader === "both"\) \{[\s\S]*?\} else \{\s*(?:const tl = svgEl[^;]+;[\s\S]*?svg\.appendChild\(tl\);|[^}]*)\s*top(?:GridY|Y) = \d+;\s*\}/;

  if (oldPattern.test(content)) {
    content = content.replace(oldPattern, makeNewHeader(newDestructured));
    return content;
  }
  return null;
}

// Process each file
const configs = [
  {
    dir: 'fact-families',
    defaultTitle: 'Fact Families',
    autoTitleLogic: `const op = document.getElementById("operationType").value;
      const range = document.getElementById("rangeSelect").value;
      let opLabel = op === "add-sub" ? "Addition & Subtraction" : "Multiplication & Division";
      return opLabel + " Fact Families Within " + range;`,
  },
  {
    dir: 'patterns',
    defaultTitle: 'Number Patterns',
    defaultSubtitle: 'Find the pattern and fill in the missing numbers.',
  },
  {
    dir: 'number-line',
    defaultTitle: 'Number Line',
  },
  {
    dir: 'measurement',
    defaultTitle: 'Measurement Practice',
  },
  {
    dir: 'ten-frame-counting',
    defaultTitle: 'Ten Frame Counting',
  },
  {
    dir: 'ten-frame-making-ten',
    defaultTitle: 'Making Ten',
  },
  {
    dir: 'fill-ten-frame',
    defaultTitle: 'Fill in the Ten Frame',
    defaultSubtitle: 'Fill in the ten frame for each number.',
  },
  {
    dir: 'place-value-chart',
    defaultTitle: 'Place Value Chart',
    defaultSubtitle: 'Write each digit in the correct place value column.',
  },
  {
    dir: 'missing-numbers-grid',
    defaultTitle: 'Missing Numbers',
  },
];

for (const cfg of configs) {
  const filePath = path.join(BASE, cfg.dir, 'index.html');
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if there's still an elTitle reference in gatherOptions (meaning it wasn't updated yet)
  const hasOldTitle = content.includes('elTitle.value');

  if (hasOldTitle) {
    console.log(`${cfg.dir}: Still has elTitle references - needs manual gatherOptions update`);
  }

  // Check if old header pattern exists
  const hasOldHeader = content.includes('st.textContent = ".txt {') || content.includes('st.textContent = ".txt{');
  if (hasOldHeader) {
    console.log(`${cfg.dir}: Still has old .txt style header`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Analysis complete.');
