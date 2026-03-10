/* ============================================================
   EGPT Course Site — site.js
   Two-panel SPA: sidebar tree nav + main content frame
   Vanilla JS, no framework, no build step
   ============================================================ */

(function () {
  'use strict';

  var DATA = window.SITE_DATA;
  if (!DATA) {
    console.warn('SITE_DATA not found — site.js cannot initialize.');
    return;
  }

  var RAW_BASE = (DATA.site && DATA.site.raw_url) || 'https://raw.githubusercontent.com/eabadir/EGPT/main';
  var REPO_BASE = (DATA.site && DATA.site.repo_url) || 'https://github.com/eabadir/EGPT';

  // DOM refs
  var treeNav = document.getElementById('tree-nav');
  var landing = document.getElementById('landing');
  var iframe = document.getElementById('content-iframe');
  var rendered = document.getElementById('content-rendered');
  var breadcrumb = document.getElementById('content-breadcrumb');
  var githubLink = document.getElementById('content-github-link');
  var sidebar = document.getElementById('sidebar');
  var sidebarToggle = document.getElementById('sidebar-toggle');
  var mobileMenuBtn = document.getElementById('mobile-menu-btn');
  var homeLink = document.querySelector('[data-home]');

  // Create backdrop element for mobile sidebar
  var backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  document.body.appendChild(backdrop);

  /* ============================================================
     TREE BUILDING
     ============================================================ */

  function buildTree() {
    if (!DATA.modules || !DATA.modules.length) {
      treeNav.innerHTML = '<p style="padding:1rem;opacity:0.5;font-size:0.8rem">No modules found.</p>';
      return;
    }

    var html = '';

    for (var i = 0; i < DATA.modules.length; i++) {
      var mod = DATA.modules[i];
      var primaryIdea = (mod.primary_ideas && mod.primary_ideas.length) ? mod.primary_ideas[0].toLowerCase() : 'id1';

      html += '<div class="tree-node tree-node--module" data-dir="' + esc(mod.dir) + '">';
      html += '<div class="tree-toggle" tabindex="0" role="button" aria-expanded="false" data-expanded="false">';
      html += '<span class="tree-arrow">&#9656;</span>'; // ▸
      html += '<span class="tree-dot" style="background:var(--' + esc(primaryIdea) + '-color)"></span>';
      html += '<span class="tree-label">' + esc(mod.label) + '</span>';
      html += '</div>';
      html += '<div class="tree-children" style="display:none">';

      // Highlights section
      if (mod.highlights && mod.highlights.length) {
        html += '<div class="tree-node tree-node--section">';
        html += '<div class="tree-toggle" tabindex="0" role="button" aria-expanded="false" data-expanded="false">';
        html += '<span class="tree-arrow">&#9656;</span>';
        html += '<span class="tree-label">&#9733; Highlights</span>'; // ★
        html += '</div>';
        html += '<div class="tree-children" style="display:none">';
        for (var h = 0; h < mod.highlights.length; h++) {
          var hl = mod.highlights[h];
          var hfname = hl.file.split('/').pop();
          html += '<div class="tree-node tree-node--file" tabindex="0" role="button" data-dir="' + esc(mod.dir) + '" data-file="' + esc(hl.file) + '">';
          html += '<span class="tree-label" title="' + esc(hl.label || hfname) + '">' + esc(hfname) + '</span>';
          html += '</div>';
        }
        html += '</div></div>';
      }

      // Subsections
      if (mod.subsections) {
        for (var s = 0; s < mod.subsections.length; s++) {
          var sub = mod.subsections[s];
          html += '<div class="tree-node tree-node--section">';
          html += '<div class="tree-toggle" tabindex="0" role="button" aria-expanded="false" data-expanded="false">';
          html += '<span class="tree-arrow">&#9656;</span>';
          html += '<span class="tree-label">' + esc(sub.title) + '</span>';
          html += '</div>';
          html += '<div class="tree-children" style="display:none">';
          if (sub.files) {
            for (var f = 0; f < sub.files.length; f++) {
              var fname = sub.files[f].split('/').pop();
              html += '<div class="tree-node tree-node--file" tabindex="0" role="button" data-dir="' + esc(mod.dir) + '" data-file="' + esc(sub.files[f]) + '">';
              html += '<span class="tree-label">' + esc(fname) + '</span>';
              html += '</div>';
            }
          }
          html += '</div></div>';
        }
      }

      html += '</div></div>'; // close tree-children and tree-node--module
    }

    treeNav.innerHTML = html;
    attachTreeListeners();
  }

  function attachTreeListeners() {
    treeNav.addEventListener('click', handleTreeClick);
    treeNav.addEventListener('keydown', handleTreeKeydown);
  }

  function handleTreeClick(e) {
    // Toggle expand/collapse
    var toggle = e.target.closest('.tree-toggle');
    if (toggle) {
      toggleNode(toggle);
      return;
    }

    // File click
    var fileNode = e.target.closest('.tree-node--file');
    if (fileNode) {
      var dir = fileNode.getAttribute('data-dir');
      var file = fileNode.getAttribute('data-file');
      navigateTo(dir, file);
      markActive(fileNode);
    }
  }

  function handleTreeKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;

    var toggle = e.target.closest('.tree-toggle');
    if (toggle) {
      e.preventDefault();
      toggleNode(toggle);
      return;
    }

    var fileNode = e.target.closest('.tree-node--file');
    if (fileNode) {
      e.preventDefault();
      var dir = fileNode.getAttribute('data-dir');
      var file = fileNode.getAttribute('data-file');
      navigateTo(dir, file);
      markActive(fileNode);
    }
  }

  function toggleNode(toggle) {
    var children = toggle.nextElementSibling;
    if (!children) return;
    var arrow = toggle.querySelector('.tree-arrow');
    var isExpanded = toggle.getAttribute('data-expanded') === 'true';

    toggle.setAttribute('data-expanded', String(!isExpanded));
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    children.style.display = isExpanded ? 'none' : 'block';
    if (arrow) {
      arrow.innerHTML = isExpanded ? '&#9656;' : '&#9662;'; // ▸ or ▾
    }
  }

  function markActive(fileNode) {
    var prev = treeNav.querySelectorAll('.tree-node--active');
    for (var i = 0; i < prev.length; i++) {
      prev[i].classList.remove('tree-node--active');
    }
    fileNode.classList.add('tree-node--active');
  }

  /* ============================================================
     NAVIGATION
     ============================================================ */

  function navigateTo(moduleDir, filePath) {
    var fullPath = moduleDir ? (moduleDir + '/' + filePath) : filePath;
    var ext = filePath.split('.').pop().toLowerCase();

    // Hide landing, prepare content area
    landing.style.display = 'none';

    // Update breadcrumb
    var parts = fullPath.split('/');
    breadcrumb.textContent = parts.join(' / ');

    // Update GitHub link
    githubLink.href = REPO_BASE + '/blob/main/' + fullPath;
    githubLink.style.display = '';

    // Route by file type
    if (ext === 'html' || ext === 'htm') {
      showIframe(fullPath);
    } else if (ext === 'pdf') {
      showIframe(fullPath);
    } else if (ext === 'md') {
      showRendered();
      fetchAndRenderMarkdown(fullPath);
    } else {
      // Source code
      showRendered();
      fetchAndRenderCode(fullPath, ext);
    }

    // Close mobile sidebar
    closeMobileSidebar();
  }

  function showIframe(src) {
    iframe.src = src;
    iframe.style.display = 'block';
    rendered.style.display = 'none';
  }

  function showRendered() {
    iframe.style.display = 'none';
    iframe.src = 'about:blank';
    rendered.style.display = 'block';
  }

  /* ============================================================
     CONTENT RENDERING
     ============================================================ */

  function fetchAndRenderMarkdown(path) {
    rendered.innerHTML = '<p class="loading">Loading...</p>';

    fetch(RAW_BASE + '/' + path)
      .then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then(function (text) {
        if (typeof marked === 'undefined') {
          // marked not loaded yet — show raw text
          rendered.innerHTML = '<article class="markdown-body"><pre>' + escapeHtml(text) + '</pre></article>';
          return;
        }
        rendered.innerHTML = '<article class="markdown-body">' + marked.parse(text) + '</article>';

        // Syntax-highlight code blocks
        highlightCodeBlocks();

        // Re-init mermaid for any diagrams
        initMermaidBlocks();
      })
      .catch(function (e) {
        rendered.innerHTML = '<p class="error">Could not load file. <a href="' + REPO_BASE + '/blob/main/' + escapeHtml(path) + '" target="_blank">View on GitHub</a></p>';
      });
  }

  function fetchAndRenderCode(path, lang) {
    rendered.innerHTML = '<p class="loading">Loading...</p>';

    fetch(RAW_BASE + '/' + path)
      .then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then(function (text) {
        var langMap = { lean: 'plaintext', js: 'javascript', py: 'python', tex: 'latex', ts: 'typescript', sh: 'bash', zsh: 'bash', yml: 'yaml', json: 'json', css: 'css' };
        var hljsLang = langMap[lang] || lang;
        var highlighted;

        if (typeof hljs !== 'undefined' && hljs.getLanguage && hljs.getLanguage(hljsLang)) {
          highlighted = hljs.highlight(text, { language: hljsLang }).value;
        } else if (typeof hljs !== 'undefined' && hljs.highlightAuto) {
          highlighted = hljs.highlightAuto(text).value;
        } else {
          highlighted = escapeHtml(text);
        }

        rendered.innerHTML = '<pre class="code-view"><code class="hljs">' + highlighted + '</code></pre>';
      })
      .catch(function (e) {
        rendered.innerHTML = '<p class="error">Could not load file. <a href="' + REPO_BASE + '/blob/main/' + escapeHtml(path) + '" target="_blank">View on GitHub</a></p>';
      });
  }

  function highlightCodeBlocks() {
    if (typeof hljs === 'undefined') return;
    var blocks = rendered.querySelectorAll('pre code');
    for (var i = 0; i < blocks.length; i++) {
      // Skip mermaid blocks
      if (blocks[i].classList.contains('language-mermaid')) continue;
      try {
        hljs.highlightElement(blocks[i]);
      } catch (e) { /* ignore */ }
    }
  }

  function initMermaidBlocks() {
    if (typeof mermaid === 'undefined') return;
    // Find mermaid code blocks and convert them
    var mermaidBlocks = rendered.querySelectorAll('code.language-mermaid');
    for (var i = 0; i < mermaidBlocks.length; i++) {
      var pre = mermaidBlocks[i].closest('pre');
      if (!pre) continue;
      var div = document.createElement('div');
      div.className = 'mermaid';
      div.textContent = mermaidBlocks[i].textContent;
      pre.parentNode.replaceChild(div, pre);
    }
    try {
      mermaid.run({ querySelector: '.markdown-body .mermaid' });
    } catch (e) { /* ignore */ }
  }

  /* ============================================================
     HOME / LANDING
     ============================================================ */

  function goHome() {
    landing.style.display = '';
    iframe.style.display = 'none';
    iframe.src = 'about:blank';
    rendered.style.display = 'none';
    rendered.innerHTML = '';
    breadcrumb.textContent = '';
    githubLink.style.display = 'none';

    var prev = treeNav.querySelectorAll('.tree-node--active');
    for (var i = 0; i < prev.length; i++) {
      prev[i].classList.remove('tree-node--active');
    }
  }

  if (homeLink) {
    homeLink.addEventListener('click', function (e) {
      e.preventDefault();
      goHome();
    });
  }

  /* ============================================================
     MOBILE SIDEBAR
     ============================================================ */

  function openMobileSidebar() {
    sidebar.classList.add('sidebar--open');
    backdrop.classList.add('sidebar-backdrop--visible');
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('sidebar--open');
    backdrop.classList.remove('sidebar-backdrop--visible');
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      openMobileSidebar();
    });
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      closeMobileSidebar();
    });
  }

  backdrop.addEventListener('click', function () {
    closeMobileSidebar();
  });

  /* ============================================================
     PERSONA TABS (landing page)
     ============================================================ */

  function initPersonaTabs() {
    var containers = document.querySelectorAll('.do-this-first');
    for (var c = 0; c < containers.length; c++) {
      (function (container) {
        var tabs = container.querySelectorAll('.persona-tab');
        var panes = container.querySelectorAll('.persona-content');

        for (var t = 0; t < tabs.length; t++) {
          tabs[t].addEventListener('click', function () {
            var target = this.getAttribute('data-persona');

            for (var j = 0; j < tabs.length; j++) { tabs[j].classList.remove('active'); }
            for (var j = 0; j < panes.length; j++) { panes[j].classList.remove('active'); }

            this.classList.add('active');
            var pane = container.querySelector('.persona-content[data-persona="' + target + '"]');
            if (pane) pane.classList.add('active');
          });
        }

        // Auto-activate first tab
        if (!container.querySelector('.persona-tab.active') && tabs.length > 0) {
          tabs[0].click();
        }
      })(containers[c]);
    }
  }

  function initPersonaGroups() {
    var groups = document.querySelectorAll('.persona-group');
    for (var g = 0; g < groups.length; g++) {
      (function (group) {
        var groupTabs = group.querySelectorAll('.persona-tab');
        for (var t = 0; t < groupTabs.length; t++) {
          groupTabs[t].addEventListener('click', function () {
            var groupName = this.getAttribute('data-group');
            if (!groupName) return;

            var container = group.closest('.do-this-first');
            if (!container) return;

            for (var j = 0; j < groupTabs.length; j++) { groupTabs[j].classList.remove('active'); }
            this.classList.add('active');

            var personaTabs = container.querySelectorAll('.persona-tab[data-in-group]');
            for (var p = 0; p < personaTabs.length; p++) {
              if (personaTabs[p].getAttribute('data-in-group') === groupName) {
                personaTabs[p].style.display = '';
              } else {
                personaTabs[p].style.display = 'none';
                var pane = container.querySelector('.persona-content[data-persona="' + personaTabs[p].getAttribute('data-persona') + '"]');
                if (pane) pane.classList.remove('active');
                personaTabs[p].classList.remove('active');
              }
            }

            var firstVisible = container.querySelector('.persona-tab[data-in-group="' + groupName + '"]');
            if (firstVisible && !container.querySelector('.persona-tab[data-in-group="' + groupName + '"].active')) {
              firstVisible.click();
            }
          });
        }
      })(groups[g]);
    }
  }

  /* ============================================================
     MERMAID INITIALIZATION
     ============================================================ */

  function initMermaid() {
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'neutral',
        securityLevel: 'loose',
        flowchart: { useMaxWidth: true, htmlLabels: true }
      });
    }
  }

  /* ============================================================
     UTILITIES
     ============================================================ */

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function esc(s) {
    // Escape for safe insertion into HTML attributes
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ============================================================
     INITIALIZATION
     ============================================================ */

  function init() {
    buildTree();
    initPersonaTabs();
    initPersonaGroups();
    initMermaid();

    // Hide GitHub link initially (shown on navigate)
    if (githubLink) githubLink.style.display = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
