/* ============================================
   Animal Math — Favorites Pack System
   Shared module loaded by all generator pages.
   Auto-injects "Add to Pack" button + dropdown.
   Stores packs in localStorage.
   ============================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'animalmath_packs';

  // ===== Pack Manager =====
  const PackManager = {
    getPacks() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch { return []; }
    },

    savePacks(packs) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
    },

    createPack(name) {
      const packs = this.getPacks();
      const pack = {
        id: 'pack_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        name: name.trim(),
        created: new Date().toISOString(),
        worksheets: []
      };
      packs.push(pack);
      this.savePacks(packs);
      return pack;
    },

    addWorksheet(packId, worksheet) {
      const packs = this.getPacks();
      const pack = packs.find(p => p.id === packId);
      if (!pack) return null;
      const ws = {
        id: 'ws_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        title: worksheet.title || 'Untitled',
        subtitle: worksheet.subtitle || '',
        generator: worksheet.generator || '',
        generatorUrl: worksheet.generatorUrl || '',
        added: new Date().toISOString(),
        svgData: worksheet.svgData || '',
        answerKeySvgs: worksheet.answerKeySvgs || []
      };
      pack.worksheets.push(ws);
      this.savePacks(packs);
      return ws;
    },

    removeWorksheet(packId, wsId) {
      const packs = this.getPacks();
      const pack = packs.find(p => p.id === packId);
      if (!pack) return;
      pack.worksheets = pack.worksheets.filter(w => w.id !== wsId);
      this.savePacks(packs);
    },

    deletePack(packId) {
      const packs = this.getPacks().filter(p => p.id !== packId);
      this.savePacks(packs);
    },

    renamePack(packId, newName) {
      const packs = this.getPacks();
      const pack = packs.find(p => p.id === packId);
      if (pack) { pack.name = newName.trim(); this.savePacks(packs); }
    },

    getTotalCount() {
      return this.getPacks().reduce((sum, p) => sum + p.worksheets.length, 0);
    }
  };

  // ===== Fix relative paths in SVG markup =====
  // Converts relative image hrefs (e.g. "../branding/logo.jpg") to absolute URLs
  // so SVGs render correctly when displayed on any page (like My Packs).
  function fixSvgPaths(svgHtml) {
    return svgHtml.replace(/(href=["'])(?!https?:\/\/|data:|#)([^"']+)(["'])/g, function(match, pre, path, post) {
      try {
        var abs = new URL(path, window.location.href).href;
        return pre + abs + post;
      } catch (e) { return match; }
    });
  }

  // ===== Capture current worksheet =====
  function captureWorksheet() {
    const sheetWrap = document.getElementById('sheetWrap');
    if (!sheetWrap) return null;

    // Get all non-answer-key worksheet pages
    const pages = sheetWrap.querySelectorAll('.worksheet-page:not(.ak-print-only)');
    if (pages.length === 0) return null;

    // Capture SVGs from worksheet pages, fixing relative paths
    const svgs = [];
    pages.forEach(page => {
      const svg = page.querySelector('svg');
      if (svg) svgs.push(fixSvgPaths(svg.outerHTML));
    });
    if (svgs.length === 0) return null;

    // Get title
    const headerInput = document.getElementById('headerText');
    const subtitleInput = document.getElementById('subtitleText');
    let title = headerInput ? headerInput.value : document.title;
    let subtitle = subtitleInput ? subtitleInput.value : '';

    // Try to get generator name from page title or heading
    const pageHeading = document.querySelector('.gen-title, h1, h2');
    const generator = pageHeading ? pageHeading.textContent.trim() : document.title.replace(' — Animal Math', '');

    // Capture answer keys and fix their paths too
    const akSvgs = captureAnswerKeys().map(fixSvgPaths);

    return {
      title: title,
      subtitle: subtitle,
      generator: generator,
      generatorUrl: window.location.pathname,
      svgData: svgs.join('|||SVGSEP|||'),
      answerKeySvgs: akSvgs
    };
  }

  function captureAnswerKeys() {
    // Use the global hook exposed by each generator's IIFE.
    // This calls renderWorksheetSVG with showAnswers:true inside the generator scope,
    // producing answer key SVGs identical to the worksheet but with answers filled in.
    if (typeof window._amCaptureAnswerKeys === 'function') {
      try {
        return window._amCaptureAnswerKeys();
      } catch (e) {
        console.warn('Answer key capture failed:', e);
        return [];
      }
    }
    return [];
  }

  // ===== Inject UI =====
  function injectUI() {
    const buttonGroup = document.querySelector('.button-group');
    if (!buttonGroup) return;

    // Create the Add to Pack button container
    const container = document.createElement('div');
    container.style.cssText = 'position:relative;';
    container.innerHTML = `
      <button id="favBtnAddToPack" style="
        width:100%; padding:11px 14px; font-size:13px; font-weight:600;
        border:2px solid #fde68a; border-radius:8px; cursor:pointer;
        background:white; color:#b45309; transition:all 0.2s;
        display:flex; align-items:center; justify-content:center; gap:6px;
      ">⭐ Add to Pack</button>
      <div id="favPackDropdown" style="
        display:none; position:absolute; bottom:calc(100% + 8px); left:0; right:0;
        background:white; border:1px solid #e5e7eb; border-radius:10px;
        box-shadow:0 8px 30px rgba(0,0,0,0.12); z-index:200; overflow:hidden; min-width:220px;
      ">
        <div style="padding:10px 14px; font-family:'DM Sans',sans-serif; font-size:11px;
          font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;
          border-bottom:1px solid #f1f5f9;">Add to Pack</div>
        <div id="favPackList"></div>
        <div id="favNewPackBtn" style="border-top:1px solid #f1f5f9; padding:10px 14px;
          display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13px;
          font-weight:600; color:#b45309;">＋ Create New Pack</div>
        <div id="favNewPackInput" style="display:none; border-top:1px solid #f1f5f9;
          padding:10px 14px;">
          <div style="display:flex; gap:8px;">
            <input id="favNewPackName" type="text" placeholder="Pack name..."
              style="flex:1; padding:6px 10px; border:1px solid #e5e7eb; border-radius:6px;
              font-size:13px; outline:none; font-family:Inter,sans-serif;">
            <button id="favNewPackCreate" style="background:#f59e0b; color:white; border:none;
              padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600;
              cursor:pointer;">Add</button>
          </div>
        </div>
      </div>
    `;
    buttonGroup.appendChild(container);

    // Toast element
    const toast = document.createElement('div');
    toast.id = 'favToast';
    toast.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(100px);
      background:#1e293b; color:white; padding:12px 24px; border-radius:10px;
      font-size:14px; font-weight:500; z-index:500; transition:transform 0.3s ease;
      box-shadow:0 8px 30px rgba(0,0,0,0.2); display:flex; align-items:center; gap:8px;
      font-family:Inter,-apple-system,sans-serif;
    `;
    document.body.appendChild(toast);

    // Hover effect
    const btn = document.getElementById('favBtnAddToPack');
    btn.addEventListener('mouseenter', () => { btn.style.background = '#fffbeb'; btn.style.borderColor = '#f59e0b'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'white'; btn.style.borderColor = '#fde68a'; });

    // Event: toggle dropdown
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dd = document.getElementById('favPackDropdown');
      const isVisible = dd.style.display !== 'none';
      if (isVisible) {
        dd.style.display = 'none';
      } else {
        renderPackList();
        dd.style.display = 'block';
        // Reset new pack input
        document.getElementById('favNewPackInput').style.display = 'none';
        document.getElementById('favNewPackBtn').style.display = '';
      }
    });

    // Event: new pack button
    document.getElementById('favNewPackBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('favNewPackInput').style.display = 'block';
      document.getElementById('favNewPackBtn').style.display = 'none';
      const input = document.getElementById('favNewPackName');
      input.value = '';
      input.focus();
    });

    // Event: create pack and add
    document.getElementById('favNewPackCreate').addEventListener('click', (e) => {
      e.stopPropagation();
      createPackAndAdd();
    });

    document.getElementById('favNewPackName').addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') createPackAndAdd();
    });

    // Close dropdown on outside click
    document.addEventListener('click', () => {
      document.getElementById('favPackDropdown').style.display = 'none';
    });

    // Prevent dropdown clicks from closing it
    document.getElementById('favPackDropdown').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  function renderPackList() {
    const list = document.getElementById('favPackList');
    const packs = PackManager.getPacks();

    if (packs.length === 0) {
      list.innerHTML = `<div style="padding:12px 14px; font-size:12px; color:#94a3b8; text-align:center;">
        No packs yet — create one below</div>`;
      return;
    }

    list.innerHTML = packs.map(p => `
      <div class="fav-pack-item" data-id="${p.id}" style="
        display:flex; align-items:center; justify-content:space-between;
        padding:10px 14px; cursor:pointer; transition:background 0.15s;
        font-size:13px; font-weight:500;
      ">
        <span>${escHtml(p.name)}</span>
        <span style="font-size:11px; color:#94a3b8; background:#f1f5f9;
          padding:2px 8px; border-radius:10px;">${p.worksheets.length} sheet${p.worksheets.length !== 1 ? 's' : ''}</span>
      </div>
    `).join('');

    // Add hover + click events
    list.querySelectorAll('.fav-pack-item').forEach(item => {
      item.addEventListener('mouseenter', () => { item.style.background = '#fffbeb'; });
      item.addEventListener('mouseleave', () => { item.style.background = ''; });
      item.addEventListener('click', () => {
        addToExistingPack(item.dataset.id);
      });
    });
  }

  function addToExistingPack(packId) {
    const ws = captureWorksheet();
    if (!ws) {
      showToast('Generate a worksheet first!', false);
      return;
    }
    const packs = PackManager.getPacks();
    const pack = packs.find(p => p.id === packId);
    if (!pack) return;

    PackManager.addWorksheet(packId, ws);
    document.getElementById('favPackDropdown').style.display = 'none';
    showToast(`Added to "${pack.name}"`);
  }

  function createPackAndAdd() {
    const name = document.getElementById('favNewPackName').value.trim();
    if (!name) return;

    const ws = captureWorksheet();
    if (!ws) {
      showToast('Generate a worksheet first!', false);
      return;
    }

    const pack = PackManager.createPack(name);
    PackManager.addWorksheet(pack.id, ws);
    document.getElementById('favPackDropdown').style.display = 'none';
    showToast(`Added to "${name}"`);
  }

  function showToast(message, success = true) {
    const toast = document.getElementById('favToast');
    toast.innerHTML = success
      ? `<span style="color:#4ade80;">✓</span> ${escHtml(message)}`
      : `<span style="color:#f87171;">!</span> ${escHtml(message)}`;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, 2500);
  }

  function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ===== Initialize on DOM ready =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUI);
  } else {
    injectUI();
  }

  // Expose PackManager globally for the My Packs page
  window.AnimalMathPacks = PackManager;

})();
