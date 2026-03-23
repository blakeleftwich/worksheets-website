// Convert sprite sheet SVGs into individual icon symbols
// Sprite uses: transform="translate(0,pageH) scale(0.1,-0.1)"
// So path coords are in 10x space with Y flipped
// We keep paths in original space and use viewBox in that space

const fs = require('fs');
const path = require('path');

function getPathBBox(d) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  // Simple approach: extract all number pairs from the path
  // This won't be perfect for arcs but good enough for bounding box
  const numPattern = /[-+]?[0-9]*\.?[0-9]+/g;
  const commands = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];
  let cx = 0, cy = 0, startX = 0, startY = 0;

  function updateBounds(x, y) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }

  for (const cmd of commands) {
    const type = cmd[0];
    if (type === 'Z' || type === 'z') { cx = startX; cy = startY; continue; }

    const numStr = cmd.slice(1).trim();
    const nums = [];
    let m;
    const re = /[-+]?[0-9]*\.?[0-9]+/g;
    while ((m = re.exec(numStr)) !== null) nums.push(parseFloat(m[0]));

    const isRel = type === type.toLowerCase();

    switch (type.toUpperCase()) {
      case 'M':
        for (let i = 0; i < nums.length; i += 2) {
          cx = isRel ? cx + nums[i] : nums[i];
          cy = isRel ? cy + nums[i+1] : nums[i+1];
          updateBounds(cx, cy);
          if (i === 0) { startX = cx; startY = cy; }
        }
        break;
      case 'L': case 'T':
        for (let i = 0; i < nums.length; i += 2) {
          cx = isRel ? cx + nums[i] : nums[i];
          cy = isRel ? cy + nums[i+1] : nums[i+1];
          updateBounds(cx, cy);
        }
        break;
      case 'H':
        for (const n of nums) { cx = isRel ? cx + n : n; updateBounds(cx, cy); }
        break;
      case 'V':
        for (const n of nums) { cy = isRel ? cy + n : n; updateBounds(cx, cy); }
        break;
      case 'C':
        for (let i = 0; i < nums.length; i += 6) {
          const pts = isRel ?
            [[cx+nums[i],cy+nums[i+1]], [cx+nums[i+2],cy+nums[i+3]], [cx+nums[i+4],cy+nums[i+5]]] :
            [[nums[i],nums[i+1]], [nums[i+2],nums[i+3]], [nums[i+4],nums[i+5]]];
          for (const [px,py] of pts) updateBounds(px, py);
          cx = pts[2][0]; cy = pts[2][1];
        }
        break;
      case 'S': case 'Q':
        for (let i = 0; i < nums.length; i += 4) {
          const pts = isRel ?
            [[cx+nums[i],cy+nums[i+1]], [cx+nums[i+2],cy+nums[i+3]]] :
            [[nums[i],nums[i+1]], [nums[i+2],nums[i+3]]];
          for (const [px,py] of pts) updateBounds(px, py);
          cx = pts[1][0]; cy = pts[1][1];
        }
        break;
      case 'A':
        for (let i = 0; i < nums.length; i += 7) {
          const x = isRel ? cx + nums[i+5] : nums[i+5];
          const y = isRel ? cy + nums[i+6] : nums[i+6];
          updateBounds(x, y);
          cx = x; cy = y;
        }
        break;
    }
  }

  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

function processFile(inputPath, category) {
  const svg = fs.readFileSync(inputPath, 'utf8');
  const pageHpt = 1536; // page height in pt
  const pageH10 = pageHpt * 10; // = 15360, the value in the path coordinate space

  // Extract all paths
  const pathRegex = /<path\s+d="([^"]+)"/g;
  const paths = [];
  let match;
  while ((match = pathRegex.exec(svg)) !== null) {
    paths.push(match[1]);
  }

  // Compute bounding boxes
  const icons = [];
  for (let i = 0; i < paths.length; i++) {
    const bbox = getPathBBox(paths[i]);
    if (bbox.w < 100 || bbox.h < 100) continue; // Skip tiny fragments
    icons.push({ pathD: paths[i], bbox, index: i });
  }

  // Group nearby paths into single icons
  const groups = [];
  const used = new Set();

  for (let i = 0; i < icons.length; i++) {
    if (used.has(i)) continue;
    const group = [icons[i]];
    used.add(i);

    for (let j = i + 1; j < icons.length; j++) {
      if (used.has(j)) continue;
      const gi = icons[j];
      let close = false;
      for (const gp of group) {
        const overlapX = gp.bbox.maxX >= gi.bbox.minX - 300 && gi.bbox.maxX >= gp.bbox.minX - 300;
        const overlapY = gp.bbox.maxY >= gi.bbox.minY - 300 && gi.bbox.maxY >= gp.bbox.minY - 300;
        if (overlapX && overlapY) { close = true; break; }
      }
      if (close) { group.push(gi); used.add(j); }
    }
    groups.push(group);
  }

  // Convert each group to a standalone SVG icon
  const results = [];
  for (let g = 0; g < groups.length; g++) {
    const group = groups[g];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of group) {
      minX = Math.min(minX, p.bbox.minX);
      minY = Math.min(minY, p.bbox.minY);
      maxX = Math.max(maxX, p.bbox.maxX);
      maxY = Math.max(maxY, p.bbox.maxY);
    }

    const pad = 80;
    // viewBox in the original path coordinate space
    const vbX = minX - pad;
    const vbY = minY - pad;
    const vbW = maxX - minX + pad * 2;
    const vbH = maxY - minY + pad * 2;

    // The paths have Y going UP (math convention). To render normally (Y going down),
    // we flip: scale(1,-1) and translate to compensate
    // After flip, the viewBox Y needs to be: pageH10 - maxY - pad to pageH10 - minY + pad
    const flippedY = pageH10 - maxY - pad;
    const flippedViewBox = `${vbX} ${flippedY} ${vbW} ${vbH}`;

    const pathEls = group.map(p => `<path d="${p.pathD}"/>`).join('');

    // For standalone SVG preview: use transform to flip Y
    const svgStandalone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${flippedY} ${vbW} ${vbH}" fill="#3f3d3d" stroke="none">
<g transform="translate(0,${pageH10}) scale(1,-1)">${pathEls}</g>
</svg>`;

    // For makeSymbolVB: same approach
    // Scale viewBox by 0.1 to get reasonable coordinates
    const svbX = (vbX / 10).toFixed(1);
    const svbY = (flippedY / 10).toFixed(1);
    const svbW = (vbW / 10).toFixed(1);
    const svbH = (vbH / 10).toFixed(1);
    const scaledViewBox = `${svbX} ${svbY} ${svbW} ${svbH}`;

    // For the symbol, scale the transform too
    const symbolInner = `<g transform="translate(0,${pageHpt}) scale(1,-1) scale(0.1,0.1)">${pathEls}</g>`;

    results.push({
      id: `icon-${category}-${g + 1}`,
      viewBox: scaledViewBox,
      innerHTML: symbolInner,
      standaloneSvg: svgStandalone,
      pathCount: group.length,
    });
  }

  return results;
}

// Process all files
const files = [
  { file: 'fruit-veggies.svg', category: 'fruit' },
  { file: 'food.svg', category: 'food' },
  { file: 'animals2.svg', category: 'animal' },
  { file: 'space.svg', category: 'space' },
  { file: 'toys.svg', category: 'toy' },
  { file: 'sports.svg', category: 'sport' },
];

const outputDir = path.join(__dirname, 'images', 'icon-library');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Clean old files
const oldFiles = fs.readdirSync(outputDir);
for (const f of oldFiles) fs.unlinkSync(path.join(outputDir, f));

let totalIcons = 0;

for (const { file, category } of files) {
  const inputPath = path.join('C:\\Users\\blake\\Downloads', file);
  console.log(`\nProcessing ${file}...`);

  try {
    const icons = processFile(inputPath, category);
    console.log(`  Found ${icons.length} icons (from grouped paths)`);
    totalIcons += icons.length;

    // Write each icon as a standalone SVG for preview
    for (const icon of icons) {
      fs.writeFileSync(path.join(outputDir, `${icon.id}.svg`), icon.standaloneSvg);
    }

    // Write a JS file with makeSymbolVB calls
    const jsLines = icons.map(icon => {
      return `  // ${icon.id} (${icon.pathCount} paths)\n  defs.appendChild(\n    makeSymbolVB("${icon.id}", \`${icon.innerHTML}\`, "${icon.viewBox}")\n  );`;
    }).join('\n\n');
    fs.writeFileSync(path.join(outputDir, `${category}-symbols.js`), jsLines);

  } catch (e) {
    console.error(`  Error: ${e.message}`);
  }
}

console.log(`\nTotal: ${totalIcons} icons processed`);
console.log(`Output: ${outputDir}`);
