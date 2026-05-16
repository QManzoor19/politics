// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Politics â€” Main Application Logic
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const STORAGE_PREFIX = 'politicsapp';

// State
let done = new Set();
try { done = new Set(JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}-done`) || '[]')); } catch(e) {}
let total = 0;
units.forEach(u => total += u.nodes.length);
let qIdx = 0, qAns = false, qScore = 0, shuffled = [];
let lastScrollY = 0;
let ddOpen = false;
let quizUnit = 'all';
let customCards = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}-custom-cards`) || '[]');
let fcFilter = '';
let fcCards = [];
let fcIndex = 0;
let fcFlipped = false;
const collapsed = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}-collapsed`) || '{}');

// XP & Streak State
let xp = parseInt(localStorage.getItem('politicsapp-xp') || '0');
let streak = parseInt(localStorage.getItem('politicsapp-streak') || '0');
let lastStudyDate = localStorage.getItem('politicsapp-last-study') || '';
let level = 1;
let fcFlipsSession = 0;
let earnedBadgeIds = JSON.parse(localStorage.getItem('politicsapp-badges') || '[]');
let currentLessonName = '';
let textSizeLevel = parseInt(localStorage.getItem('politicsapp-text-size') || '0');
let lessonViewMode = localStorage.getItem('politicsapp-view-mode') || 'all'; // 'all' or 'paged'
let lessonPages = [];
let lessonPageIdx = 0;
let lessonGagneTop = '';
let lessonGagneBottom = '';
let lessonFullContent = '';
let currentLessonUnit = 0;
let currentLessonSub = '';

const badges = [
  { id: 'first_lesson', name: 'First Steps', desc: 'Complete your first lesson', icon: 'ðŸ“–', check: () => done.size >= 1 },
  { id: 'unit1_complete', name: 'Unit 1 Master', desc: 'Complete all Unit 1 lessons', icon: 'ðŸŽ“', check: () => { const u1 = units.find(u=>u.unitNum===1); return u1 && u1.nodes.every(n=>done.has('1-'+n.name)); }},
  { id: 'quiz_perfect', name: 'Perfect Score', desc: 'Get 100% on a quiz', icon: 'ðŸ’¯', check: () => (localStorage.getItem('politicsapp-perfect-quiz')==='true') },
  { id: 'streak_3', name: 'On a Roll', desc: '3-day study streak', icon: 'ðŸ”¥', check: () => streak >= 3 },
  { id: 'streak_7', name: 'Week Warrior', desc: '7-day study streak', icon: 'âš¡', check: () => streak >= 7 },
  { id: 'xp_100', name: 'Century', desc: 'Earn 100 XP', icon: 'ðŸ’ª', check: () => xp >= 100 },
  { id: 'xp_500', name: 'Scholar', desc: 'Earn 500 XP', icon: 'ðŸ§ ', check: () => xp >= 500 },
  { id: 'xp_1000', name: 'Political Scientist', desc: 'Earn 1000 XP', icon: 'ðŸ›ï¸', check: () => xp >= 1000 },
  { id: 'cards_50', name: 'Card Collector', desc: 'Flip 50 flashcards', icon: 'ðŸƒ', check: () => parseInt(localStorage.getItem('politicsapp-flips')||'0') >= 50 },
  { id: 'five_lessons', name: 'Dedicated', desc: 'Complete 5 lessons', icon: 'â­', check: () => done.size >= 5 },
  { id: 'ten_lessons', name: 'Halfway There', desc: 'Complete 10 lessons', icon: 'ðŸŒŸ', check: () => done.size >= 10 },
  { id: 'all_lessons', name: 'Completionist', desc: 'Complete all lessons', icon: 'ðŸ‘‘', check: () => done.size >= total },
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// XP & STREAK SYSTEM
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function checkStreak() {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  if (lastStudyDate === today) {
    // Already studied today, streak stays
  } else if (lastStudyDate === yesterday) {
    // Studied yesterday, streak continues (will increment on next activity)
  } else if (lastStudyDate !== '') {
    // Missed a day, reset streak
    streak = 0;
    localStorage.setItem('politicsapp-streak', streak);
  }
  level = Math.floor(xp / 100) + 1;
  updateXPDisplay();
}

function recordActivity() {
  const today = getTodayStr();
  if (lastStudyDate !== today) {
    if (lastStudyDate === getYesterdayStr() || lastStudyDate === '') {
      streak++;
    } else {
      streak = 1;
    }
    lastStudyDate = today;
    localStorage.setItem('politicsapp-streak', streak);
    localStorage.setItem('politicsapp-last-study', lastStudyDate);
  }
}

function addXP(amount, reason) {
  recordActivity();
  xp += amount;
  level = Math.floor(xp / 100) + 1;
  localStorage.setItem('politicsapp-xp', xp);
  updateXPDisplay();
  showXPToast(amount, reason);
  checkBadges();
}

function updateXPDisplay() {
  const lvlEl = document.getElementById('xp-level');
  const fillEl = document.getElementById('xp-fill');
  const textEl = document.getElementById('xp-text');
  const streakEl = document.getElementById('streak-display');
  if (lvlEl) lvlEl.textContent = 'Lvl ' + level;
  if (fillEl) fillEl.style.width = (xp % 100) + '%';
  if (textEl) textEl.textContent = xp + ' XP';
  if (streakEl) streakEl.textContent = '\uD83D\uDD25 ' + streak;
}

function showXPToast(amount, reason) {
  const toast = document.createElement('div');
  toast.className = 'xp-toast';
  toast.textContent = '+' + amount + ' XP' + (reason ? ' â€” ' + reason : '');
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1600);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ACHIEVEMENT BADGES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function renderBadges() {
  const container = document.getElementById('badges-container');
  if (!container) return;
  const earnedCount = badges.filter(b => earnedBadgeIds.includes(b.id) || b.check()).length;
  let h = '<div style="text-align:center;margin:12px 0 4px;font-size:0.85rem;color:var(--muted);font-weight:700">' + earnedCount + ' / ' + badges.length + ' badges earned</div>';
  h += '<div class="badge-grid">';
  badges.forEach(b => {
    const earned = earnedBadgeIds.includes(b.id) || b.check();
    h += '<div class="badge-card ' + (earned ? 'earned' : 'locked') + '">';
    h += '<span class="badge-icon">' + (earned ? b.icon : 'ðŸ”’') + '</span>';
    h += '<div class="badge-name">' + b.name + '</div>';
    h += '<div class="badge-desc">' + b.desc + '</div>';
    h += '</div>';
  });
  h += '</div>';
  container.innerHTML = h;
}

function checkBadges() {
  let newBadge = null;
  badges.forEach(b => {
    if (!earnedBadgeIds.includes(b.id) && b.check()) {
      earnedBadgeIds.push(b.id);
      newBadge = b;
    }
  });
  localStorage.setItem('politicsapp-badges', JSON.stringify(earnedBadgeIds));
  renderBadges();
  if (newBadge) showBadgePopup(newBadge);
}

function showBadgePopup(badge) {
  const popup = document.createElement('div');
  popup.className = 'badge-popup';
  popup.innerHTML = '<div class="badge-popup-box">' +
    '<div class="badge-popup-icon">' + badge.icon + '</div>' +
    '<div class="badge-popup-title">Badge Earned!</div>' +
    '<div style="font-weight:800;font-size:1rem;margin-bottom:4px">' + badge.name + '</div>' +
    '<div class="badge-popup-desc">' + badge.desc + '</div>' +
    '<button class="badge-popup-btn" onclick="this.closest(\'.badge-popup\').remove()">Awesome!</button>' +
    '</div>';
  document.body.appendChild(popup);
  popup.addEventListener('click', function(e) {
    if (e.target === popup) popup.remove();
  });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TAB NAVIGATION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function showTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
  if (id === 'lessons') closeLesson();
  if (id === 'flashcards') initFlashcards();
  if (id === 'graphs') initGraphBuilder();
  if (id === 'badges') { renderBadges(); renderBloomsRadar(); renderMyWriting(); renderMyNotes(); renderSavedChats(); }
  if (id === 'cases') renderCasesList();
  if (id === 'settings') loadApiKeyUI();
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LESSON LIST (DUO PATH)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function toggleUnit(num) {
  collapsed[num] = !collapsed[num];
  localStorage.setItem(`${STORAGE_PREFIX}-collapsed`, JSON.stringify(collapsed));
  buildList();
}

// Mini Quiz Handler
function checkMiniQuiz(btn) {
  const quiz = btn.closest('.mini-quiz');
  if (quiz.dataset.answered === 'true') return;
  quiz.dataset.answered = 'true';

  const isCorrect = btn.dataset.correct === 'true';
  const feedback = quiz.querySelector('.mini-quiz-feedback');
  const allBtns = quiz.querySelectorAll('.mini-quiz-opt');

  allBtns.forEach(b => {
    b.disabled = true;
    if (b.dataset.correct === 'true') b.classList.add('correct');
    else if (b === btn && !isCorrect) b.classList.add('wrong');
  });

  if (isCorrect) {
    feedback.textContent = 'âœ“ Correct! Nice work.';
    feedback.className = 'mini-quiz-feedback show correct-fb';
    try { addXP(5, 'Mini quiz correct'); } catch(e) {}
  } else {
    feedback.textContent = 'âœ— Not quite. The correct answer is highlighted above.';
    feedback.className = 'mini-quiz-feedback show wrong-fb';
  }
}

function buildList() {
  let h = '<div class="duo-path">';
  units.forEach(u => {
    const doneCount = u.nodes.filter(n => done.has(u.unitNum + '-' + n.name)).length;
    const isCollapsed = collapsed[u.unitNum] !== false;
    const allDone = doneCount === u.nodes.length;
    h += `<div class="duo-unit"><div class="duo-unit-header" style="background:${u.gradient};box-shadow:0 4px 0 ${u.shadow}" onclick="toggleUnit(${u.unitNum})"><div class="unit-label">Unit ${u.unitNum} Â· ${doneCount}/${u.nodes.length} <span class="unit-toggle">${isCollapsed ? 'â–¶' : 'â–¼'}</span></div><div class="unit-name">${u.label}</div>${allDone ? '<div style="font-size:0.7rem;margin-top:4px;opacity:0.8">âœ“ Complete</div>' : ''}</div><div class="duo-nodes${isCollapsed ? ' collapsed' : ''}">`;
    u.nodes.forEach(n => {
      const id = u.unitNum + '-' + n.name, d = done.has(id), c = d ? 'done' : 'next';
      const checkSvg = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      const checkBadge = `<div class="duo-checkmark"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`;
      h += `<div class="duo-node ${c}" onclick="openLesson(${u.unitNum},'${n.name.replace(/'/g, "\\'")}','${n.sub.replace(/'/g, "\\'")}')"><button class="duo-btn ${c}">${d ? checkSvg : n.icon}${d ? checkBadge : ''}</button><div class="duo-node-label"><div class="node-name">${n.name}</div><div class="node-sub">${n.sub}</div></div></div>`;
    });
    h += '</div></div>';
  });
  h += '</div>';
  document.getElementById('lesson-list').innerHTML = h;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LESSON READER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function openLesson(u, name, sub) {
  lastScrollY = window.scrollY;
  document.getElementById('lesson-list').style.display = 'none';
  document.getElementById('lesson-reader').style.display = 'block';
  const goalEl = document.getElementById('goal-setting');
  if (goalEl) goalEl.style.display = 'none';
  let content = L[name] || simpleContent(name, sub);
  const safeName = name.replace(/'/g, "\\'");

  // Make vocab-pills clickable with glossary definitions
  const glossMap = {};
  const glossAbbrevMap = {};
  glossaryData.forEach(g => {
    const tl = g.term.toLowerCase();
    glossMap[tl] = g.def;
    // Also map without parenthetical abbreviations: "Production possibilities frontier (PPF)" -> also match "production possibilities frontier" and "ppf"
    const noParens = tl.replace(/\s*\([^)]*\)\s*/g, '').trim();
    if (noParens !== tl) glossMap[noParens] = g.def;
    const abbrevMatch = g.term.match(/\(([A-Z]{2,})\)/);
    if (abbrevMatch) glossAbbrevMap[abbrevMatch[1].toLowerCase()] = g.def;
    // Map individual significant words
    tl.split(/[\s(),\/]+/).forEach(w => { if (w.length > 3 && !glossMap[w]) glossMap[w] = g.def; });
  });

  function findGlossDef(term) {
    const tl = term.toLowerCase().trim();
    // Direct match
    if (glossMap[tl]) return glossMap[tl];
    // Abbreviation match (e.g. "PPF", "GDP", "CPI")
    if (glossAbbrevMap[tl]) return glossAbbrevMap[tl];
    // Strip trailing s/es/ing/ies
    const stems = [tl.replace(/s$/, ''), tl.replace(/es$/, ''), tl.replace(/ing$/, ''), tl.replace(/ies$/, 'y'), tl.replace(/tion$/, 'te')];
    for (const s of stems) { if (glossMap[s]) return glossMap[s]; }
    // Try matching each word
    const words = tl.split(/[\s(),\/\-]+/);
    for (const w of words) {
      if (w.length > 3 && glossMap[w]) return glossMap[w];
      if (glossAbbrevMap[w]) return glossAbbrevMap[w];
    }
    // Fuzzy: find glossary entry containing or contained by the term
    const found = glossaryData.find(g => {
      const gl = g.term.toLowerCase();
      const glClean = gl.replace(/\s*\([^)]*\)\s*/g, '').trim();
      return gl.includes(tl) || tl.includes(gl) || tl.includes(glClean) || glClean.includes(tl) ||
        gl.split(/\s+/).some(w => w.length > 4 && tl.includes(w)) ||
        words.some(w => w.length > 4 && gl.includes(w));
    });
    if (found) return found.def;
    return null;
  }

  content = content.replace(/<span class="vocab-pill">([^<]+)<\/span>/g, (match, term) => {
    let def = findGlossDef(term);
    if (!def) def = 'A key politics term. Check the Glossary tab for the full definition.';
    const eDef = def.replace(/\\/g, '').replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/\n/g, ' ');
    const eTerm = term.replace(/'/g, "&#39;");
    return `<span class="vocab-pill kw-clickable" data-term="${eTerm}" data-def="${eDef}">${term}</span>`;
  });

  const videoHTML = buildVideoSection(name);

  // â•â•â• GAGNÃ‰'S 9 EVENTS + BLOOM'S + UDL â•â•â•
  const ped = pedagogy[name] || {};
  let gagneTop = '';
  let gagneBottom = '';

  // Event 1: Gain Attention â€” Hook
  if (ped.hook) {
    gagneTop += `<div class="gagne-hook"><span class="hook-label">Think About This</span>${ped.hook}</div>`;
  }

  // Event 2: Inform Objectives
  if (ped.objectives && ped.objectives.length) {
    gagneTop += `<div class="gagne-objectives"><div class="obj-label">Learning Objectives</div><ul>${ped.objectives.map(o => '<li>' + o + '</li>').join('')}</ul></div>`;
  }

  // Event 3: Stimulate Recall â€” Prerequisites
  if (ped.prerequisites && ped.prerequisites.length) {
    const links = ped.prerequisites.map(p => {
      const pUnit = units.find(uu => uu.nodes.some(n => n.name === p));
      const pNode = pUnit ? pUnit.nodes.find(n => n.name === p) : null;
      if (pUnit && pNode) {
        return `<a onclick="openLesson(${pUnit.unitNum},'${p.replace(/'/g, "\\'")}','${pNode.sub.replace(/'/g, "\\'")}')">${p}</a>`;
      }
      return p;
    }).join(', ');
    gagneTop += `<div class="gagne-prereqs"><div class="prereq-label">Before You Start â€” Review</div>${links}</div>`;
  }

  // UDL: Relevance Tags
  if (ped.tags && ped.tags.length) {
    gagneTop += `<div class="relevance-tags">${ped.tags.map(t => '<span class="relevance-tag">' + t + '</span>').join('')}</div>`;
  }

  // UDL: Text Size + View Mode Controls
  gagneTop += `<div class="udl-toolbar"><button class="udl-btn" onclick="adjustTextSize(-1)" title="Decrease text size">A-</button><button class="udl-btn" onclick="adjustTextSize(0)" title="Reset text size">A</button><button class="udl-btn" onclick="adjustTextSize(1)" title="Increase text size">A+</button><span style="width:1px;height:20px;background:var(--border);margin:0 4px"></span><button class="udl-btn${lessonViewMode==='all'?' active':''}" onclick="setLessonViewMode('all')">View All</button><button class="udl-btn${lessonViewMode==='paged'?' active':''}" onclick="setLessonViewMode('paged')">Page by Page</button></div>`;

  // Event 9: Enhance Retention â€” Transfer
  if (ped.transfer) {
    gagneBottom += `<div class="gagne-transfer"><span class="transfer-label">Connect & Transfer</span>${ped.transfer}</div>`;
  }

  // Bloom's Ladder
  if (ped.bloomsLadder) {
    const bl = ped.bloomsLadder;
    const levels = typeof bloomsLevels !== 'undefined' ? bloomsLevels : [];
    let stepsHTML = '';
    ['remember', 'understand', 'apply', 'analyse', 'evaluate', 'create'].forEach(lvl => {
      if (bl[lvl]) {
        const meta = levels.find(l => l.id === lvl) || { label: lvl, color: '#888', icon: 'ðŸ“' };
        stepsHTML += `<div class="bl-step"><div class="bl-level-badge" style="background:${meta.color}20;color:${meta.color}">${meta.icon}</div><div class="bl-step-content"><div class="bl-step-label" style="color:${meta.color}">${meta.label}</div><div class="bl-step-prompt">${bl[lvl]}</div></div></div>`;
      }
    });
    gagneBottom += `<div class="blooms-ladder"><div class="bl-title">ðŸ§  Bloom's Thinking Ladder â€” Challenge Yourself</div><div class="bl-steps">${stepsHTML}</div></div>`;
  }

  // UDL: Explain-It-Back (with save button)
  const savedExplain = localStorage.getItem('politicsapp-explain-' + name) || '';
  const ebId = safeName.replace(/[^a-zA-Z0-9]/g, '');
  gagneBottom += `<div class="explain-back"><div class="eb-label">âœï¸ Explain It Back</div><p style="font-size:0.82rem;color:var(--muted);margin-bottom:8px">In your own words, explain the main idea of this lesson. Writing it out deepens understanding.</p><textarea id="eb-textarea-${ebId}" placeholder="Write your explanation here...">${savedExplain.replace(/</g,'&lt;')}</textarea><div style="display:flex;align-items:center;gap:10px;margin-top:8px"><button class="case-save-btn" onclick="saveExplainBack('${safeName}')">Save</button><span class="eb-save" id="eb-save-${ebId}"></span></div></div>`;

  // Store lesson data for pagination
  lessonGagneTop = gagneTop;
  lessonGagneBottom = gagneBottom;
  lessonFullContent = content;
  currentLessonUnit = u;
  currentLessonSub = sub;
  lessonPageIdx = 0;

  // Split content into pages by <h3> tags
  lessonPages = splitLessonPages(content);

  renderLessonContent(name, u, sub, safeName, videoHTML);

  // Show notes toggle, AI helper, and load notes for this lesson
  currentLessonName = name;
  const notesToggle = document.getElementById('notes-toggle');
  if (notesToggle) notesToggle.style.display = 'flex';
  loadNotes(name);
  showAIHelper();

  window.scrollTo(0, 0);
}

function toggleKwPopup(el, term, def) {
  const existing = document.querySelector('.kw-popup-overlay');
  if (existing) { existing.remove(); return; }
  const overlay = document.createElement('div');
  overlay.className = 'kw-popup-overlay';
  const popup = document.createElement('div');
  popup.className = 'kw-popup';
  popup.innerHTML = '<div class="kw-popup-handle"></div><div class="kw-popup-term">' + term + '</div><div class="kw-popup-def">' + def + '</div>';
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SCENARIO STORIES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const scenarioStories = {};

function getScenarioStory(name) {
  const story = scenarioStories[name];
  if (!story) return '';
  const step = story.steps[1];
  if (!step) return '';
  const choiceButtons = Object.entries(step.choices).map(([key, choice]) =>
    `<button class="scenario-choice" onclick="scenarioChoose('${story.id}', 1, '${key}')">${key}) ${choice.label}</button>`
  ).join('');
  return `<div class="scenario-story">
  <div class="scenario-header">ðŸŽ­ Scenario Challenge</div>
  <div class="scenario-text" id="scenario-text">${step.text}</div>
  <div class="scenario-choices" id="scenario-choices">${choiceButtons}</div>
  <div class="scenario-outcome" id="scenario-outcome"></div>
</div>`;
}

function scenarioChoose(storyId, step, choice) {
  const storyEntry = Object.values(scenarioStories).find(s => s.id === storyId);
  if (!storyEntry) return;
  const currentStep = storyEntry.steps[step];
  if (!currentStep || !currentStep.choices[choice]) return;
  const chosen = currentStep.choices[choice];

  // Award XP
  try { if (typeof addXP === 'function') addXP(5, 'Scenario choice'); } catch(e) {}

  const outcomeEl = document.getElementById('scenario-outcome');
  const choicesEl = document.getElementById('scenario-choices');

  // Disable choice buttons
  choicesEl.querySelectorAll('.scenario-choice').forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'default';
  });

  if (chosen.next === 'end') {
    outcomeEl.innerHTML = chosen.outcome + '<div class="scenario-xp">+5 XP earned</div>';
  } else {
    const nextStep = storyEntry.steps[chosen.next];
    if (!nextStep) { outcomeEl.innerHTML = chosen.outcome; return; }
    const nextChoiceButtons = Object.entries(nextStep.choices).map(([key, c]) =>
      `<button class="scenario-choice" onclick="scenarioChoose('${storyId}', ${chosen.next}, '${key}')">${key}) ${c.label}</button>`
    ).join('');
    outcomeEl.innerHTML = chosen.outcome +
      '<div class="scenario-xp">+5 XP earned</div>' +
      '<div style="margin-top:18px;border-top:1px solid var(--border);padding-top:16px">' +
        '<div class="scenario-text" id="scenario-text">' + nextStep.text + '</div>' +
        '<div class="scenario-choices" id="scenario-choices">' + nextChoiceButtons + '</div>' +
        '<div class="scenario-outcome" id="scenario-outcome"></div>' +
      '</div>';
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// DEEP DIVE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function toggleDeepDive(name, sub) {
  const area = document.getElementById('deep-dive-area');
  const btn = document.getElementById('dd-btn');
  if (ddOpen) { area.innerHTML = ''; btn.classList.remove('active'); btn.innerHTML = 'ðŸ”¬ Deep Dive â€” Go Deeper'; ddOpen = false; return; }
  ddOpen = true; btn.classList.add('active'); btn.innerHTML = 'ðŸ”¬ Deep Dive â€” Close';
  const scenarioHTML = getScenarioStory(name);
  area.innerHTML = scenarioHTML + '<div id="deep-dive-content-area"><div class="deep-dive-loading"><div class="spinner"></div>Loading deep dive content...</div></div>';
  generateDeepDive(name, sub);
}

async function generateDeepDive(name, sub) {
  const area = document.getElementById('deep-dive-content-area');
  // Try AI first
  const hasAI = getProxyUrl() || getApiKey();
  if (hasAI) {
    try {
      const data = await callClaude(
        [{ role: 'user', content: `You are a university politics professor. Write an advanced deep-dive lesson on "${name}" (${sub}) for a student who has already read the basics. Include: 1) Advanced theories and real debates among psychologists 2) Key empirical studies with details (researcher, year, findings) 3) Real-world applications and case studies 4) Critical evaluation and modern perspectives 5) Connections to other politics topics. Format as HTML using: <h3> for headers, <p> with <strong> for key terms, <div class="key-point"><span class="kp-icon">ðŸ’¡</span><span>...</span></div> for insights, <div class="example-box"><strong>ðŸ”— Case study:</strong>...</div> for examples, <div class="warning-box"><strong>âš ï¸ Debate:</strong>...</div> for controversies. Write ~800 words. Start directly with <h3>.` }],
        null,
        2000
      );
      if (data.content && data.content[0]) {
        area.innerHTML = '<div class="deep-dive-content">' + data.content[0].text + '</div>';
        addXP(10, 'Deep dive');
        return;
      }
    } catch(e) { console.log('AI unavailable, using fallback'); }
  }
  // Use pre-built deep dive
  const dd = DD[name];
  if (dd) {
    area.innerHTML = '<div class="deep-dive-content">' + dd + '</div>';
    addXP(10, 'Deep dive');
    return;
  }
  // Generic fallback
  area.innerHTML = `<div class="deep-dive-content">
<h3>Advanced Analysis: ${name}</h3>
<p>This deep dive goes beyond the basics of <strong>${name.toLowerCase()}</strong>. It covers advanced theories, landmark studies, policy debates, and real-world applications.</p>
<div class="key-point"><span class="kp-icon">ðŸ’¡</span><span><strong>University-level thinking:</strong> The best politics students don't just describe theories â€” they <em>evaluate</em> them. For every theory, ask: What assumptions does it make? Do they hold in the real world? What does the empirical evidence say?</span></div>
<p>For the full textbook treatment, visit <strong>openstax.org/details/books/politics-2e</strong> â€” a free, peer-reviewed university textbook.</p>
</div>`;
  addXP(10, 'Deep dive');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LESSON NAVIGATION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function closeLesson() {
  document.getElementById('lesson-list').style.display = 'block';
  document.getElementById('lesson-reader').style.display = 'none';
  document.getElementById('reading-progress').style.width = '0';
  ddOpen = false;
  currentLessonName = '';
  // Hide notes panel and bottom bar
  const notesToggle = document.getElementById('notes-toggle');
  const notesPanel = document.getElementById('notes-panel');
  const bottomBar = document.getElementById('enki-bottom-bar');
  if (notesToggle) notesToggle.style.display = 'none';
  if (notesPanel) notesPanel.style.display = 'none';
  if (bottomBar) bottomBar.classList.remove('show');
  document.body.classList.remove('paged-mode-active');
  hideAIHelper();
  const goalEl = document.getElementById('goal-setting');
  if (goalEl) goalEl.style.display = 'flex';
  window.scrollTo(0, lastScrollY);
}

function splitLessonPages(html) {
  // Strategy: split every mini-quiz onto its own page, group remaining content by <h3> sections
  // 1. First, split by both <h3> and <div class="mini-quiz" boundaries
  const tokens = [];
  // Use a regex to find all split points
  const splitRegex = /(<h3[^>]*>|<div class="mini-quiz"[^>]*>)/g;
  let lastIdx = 0;
  let match;
  while ((match = splitRegex.exec(html)) !== null) {
    // Push content before this match
    if (match.index > lastIdx) {
      const before = html.substring(lastIdx, match.index).trim();
      if (before.length > 10) tokens.push({ type: 'content', html: before });
    }
    lastIdx = match.index;
    // If it's a mini-quiz, find its closing </div> (the quiz block)
    if (match[0].includes('mini-quiz')) {
      // Find the end of this mini-quiz block â€” it ends with </div>\n</div> pattern
      // Match from the opening <div class="mini-quiz" to the feedback closing </div>\n</div>
      const quizStart = match.index;
      // Find the closing: mini-quiz ends after feedback </div> then one more </div>
      let depth = 0;
      let i = quizStart;
      let foundStart = false;
      while (i < html.length) {
        if (html.substring(i, i + 4) === '<div') { depth++; foundStart = true; }
        if (html.substring(i, i + 6) === '</div>') {
          depth--;
          if (foundStart && depth === 0) {
            const quizEnd = i + 6;
            tokens.push({ type: 'quiz', html: html.substring(quizStart, quizEnd) });
            lastIdx = quizEnd;
            splitRegex.lastIndex = quizEnd;
            break;
          }
        }
        i++;
      }
    }
    // If it's an h3, we just let the next iteration pick up content from here
    // The h3 tag itself will be part of the next content block
  }
  // Push remaining content
  if (lastIdx < html.length) {
    const remaining = html.substring(lastIdx).trim();
    if (remaining.length > 10) tokens.push({ type: 'content', html: remaining });
  }

  if (tokens.length <= 1) return [{ type: 'learn', html: html }];

  // Merge consecutive content tokens, then split by <h3> for bite-sized pages
  // First: merge consecutive content tokens into single blocks
  const merged = [];
  tokens.forEach(t => {
    if (t.type === 'quiz') {
      merged.push(t);
    } else {
      // Merge with previous content token if it exists
      if (merged.length > 0 && merged[merged.length - 1].type === 'content') {
        merged[merged.length - 1].html += '\n' + t.html;
      } else {
        merged.push({ type: 'content', html: t.html });
      }
    }
  });

  // Now build pages: split content blocks by <h3>, quizzes get their own page
  const pages = [];
  merged.forEach(t => {
    if (t.type === 'quiz') {
      pages.push({ type: 'test', html: t.html });
    } else {
      const subSections = t.html.split(/(?=<h3[^>]*>)/);
      subSections.forEach(s => {
        s = s.trim();
        // Skip tiny fragments (just dividers, opening tags, whitespace)
        const textOnly = s.replace(/<[^>]+>/g, '').trim();
        if (textOnly.length > 20) pages.push({ type: 'learn', html: s });
      });
    }
  });

  return pages.length > 0 ? pages : [{ type: 'learn', html: html }];
}

function renderLessonContent(name, u, sub, safeName, videoHTML) {
  const isPaged = lessonViewMode === 'paged' && lessonPages.length > 1;
  const bottomBar = document.getElementById('enki-bottom-bar');

  if (isPaged) {
    // Show Enki-style paged mode
    document.body.classList.add('paged-mode-active');
    if (bottomBar) bottomBar.classList.add('show');

    // Insert objectives as their own page after the intro (page 0)
    // Only do this once when pages are first built
    if (lessonPages.length > 0 && !lessonPages._objectivesInserted) {
      // Build objectives page from gagneTop data
      const ped = (typeof pedagogy !== 'undefined') ? pedagogy[name] : null;
      if (ped && ped.objectives && ped.objectives.length) {
        const objHTML = '<div class="gagne-objectives"><div class="obj-label">Learning Objectives</div><ul>' +
          ped.objectives.map(o => '<li>' + o + '</li>').join('') + '</ul></div>';
        // Also add prerequisites if any
        let prereqHTML = '';
        if (ped.prerequisites && ped.prerequisites.length) {
          const links = ped.prerequisites.map(p => {
            const pUnit = units.find(uu => uu.nodes.some(n => n.name === p));
            const pNode = pUnit ? pUnit.nodes.find(n => n.name === p) : null;
            if (pUnit && pNode) return '<a onclick="openLesson(' + pUnit.unitNum + ',\'' + p.replace(/'/g, "\\'") + '\',\'' + pNode.sub.replace(/'/g, "\\'") + '\')">' + p + '</a>';
            return p;
          }).join(', ');
          prereqHTML = '<div class="gagne-prereqs"><div class="prereq-label">Before You Start â€” Review</div>' + links + '</div>';
        }
        lessonPages.splice(0, 0, { type: 'objectives', html: objHTML + prereqHTML });
      }
      lessonPages._objectivesInserted = true;
    }

    const page = lessonPages[lessonPageIdx];
    const totalPages = lessonPages.length;
    const isFirstContentPage = lessonPageIdx === 0;
    const isLastPage = lessonPageIdx >= totalPages - 1;

    // Segmented progress bar
    const segs = lessonPages.map((_, i) => {
      let cls = 'enki-seg';
      if (i < lessonPageIdx) cls += ' done';
      else if (i === lessonPageIdx) cls += ' current';
      return '<div class="' + cls + '" onclick="goToLessonPage(' + i + ')"></div>';
    }).join('');
    const progressBar = '<div class="enki-progress">' + segs + '</div>';

    // Page type tag
    let tag = '';
    if (page.type === 'test') tag = '<div class="enki-tag enki-tag-test">Test Yourself</div>';
    else if (page.type === 'objectives') tag = '<div class="enki-tag enki-tag-learn">Objectives</div>';
    else if (isFirstContentPage) tag = '<div class="enki-tag enki-tag-hook">Introduction</div>';
    else tag = '<div class="enki-tag enki-tag-learn">Learn</div>';

    // UDL toolbar (text size + view mode) â€” shown on every page
    const toolbar = '<div class="udl-toolbar"><button class="udl-btn" onclick="adjustTextSize(-1)" title="Decrease text size">A-</button><button class="udl-btn" onclick="adjustTextSize(0)" title="Reset text size">A</button><button class="udl-btn" onclick="adjustTextSize(1)" title="Increase text size">A+</button><span style="width:1px;height:20px;background:var(--border);margin:0 4px"></span><button class="udl-btn" onclick="setLessonViewMode(\'all\')">View All</button><button class="udl-btn active" onclick="setLessonViewMode(\'paged\')">Page by Page</button></div>';

    // Header on first page â€” only hook, no objectives (those are on page 1 now)
    let header = '';
    if (isFirstContentPage) {
      const ped = (typeof pedagogy !== 'undefined') ? pedagogy[name] : null;
      let hookHTML = '';
      if (ped && ped.hook) hookHTML = '<div class="gagne-hook"><span class="hook-label">Think About This</span>' + ped.hook + '</div>';
      let tagsHTML = '';
      if (ped && ped.tags && ped.tags.length) tagsHTML = '<div class="relevance-tags">' + ped.tags.map(t => '<span class="relevance-tag">' + t + '</span>').join('') + '</div>';
      header = '<div class="lesson-header"><h1>' + name + '</h1><p>Unit ' + u + ' â€” ' + sub + '</p></div>' + hookHTML + tagsHTML;
    }

    // Bottom content on last page
    let bottomContent = '';
    if (isLastPage) {
      bottomContent = lessonGagneBottom +
        `<button class="deep-dive-btn" id="dd-btn" onclick="toggleDeepDive('${safeName}','${(currentLessonSub || sub).replace(/'/g, "\\'")}')">Deep Dive â€” Go Deeper</button><div id="deep-dive-area"></div>${videoHTML}`;
    }

    document.getElementById('lesson-content').innerHTML = progressBar + toolbar + header + tag + '<div class="lesson-body">' + page.html + '</div>' + bottomContent;

    // Update bottom bar
    const prevBtn = document.getElementById('enki-prev');
    const nextBtn = document.getElementById('enki-next');
    const pageCount = document.getElementById('enki-page-count');
    if (prevBtn) prevBtn.disabled = lessonPageIdx === 0;
    if (pageCount) pageCount.textContent = (lessonPageIdx + 1) + ' / ' + totalPages;
    if (nextBtn) {
      if (isLastPage) {
        nextBtn.textContent = 'Complete';
        nextBtn.className = 'enki-next-btn complete-btn';
        nextBtn.onclick = function() { markDone(u, safeName); };
      } else {
        nextBtn.textContent = 'Next';
        nextBtn.className = 'enki-next-btn';
        nextBtn.onclick = function() { goToLessonPage(lessonPageIdx + 1); };
      }
    }
  } else {
    // View All mode
    document.body.classList.remove('paged-mode-active');
    if (bottomBar) bottomBar.classList.remove('show');

    document.getElementById('lesson-content').innerHTML =
      `<div class="lesson-header"><h1>${name}</h1><p>Unit ${u} â€” ${sub}</p></div>${lessonGagneTop}${lessonFullContent}${lessonGagneBottom}<button class="deep-dive-btn" id="dd-btn" onclick="toggleDeepDive('${safeName}','${(currentLessonSub || sub).replace(/'/g, "\\'")}')">Deep Dive â€” Go Deeper</button><div id="deep-dive-area"></div>${videoHTML}<button class="done-btn" onclick="markDone(${u},'${safeName}')">Mark as Complete</button>`;
  }

  // Re-attach vocab pill click handlers
  document.querySelectorAll('.kw-clickable').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleKwPopup(this, this.dataset.term, this.dataset.def);
    });
  });

  applyTextSize();
  if (isPaged) window.scrollTo(0, 0);
}

function enkiNext() {
  if (lessonPageIdx < lessonPages.length - 1) {
    goToLessonPage(lessonPageIdx + 1);
  }
}

function goToLessonPage(idx) {
  if (idx < 0 || idx >= lessonPages.length) return;
  lessonPageIdx = idx;
  ddOpen = false;
  const safeName = currentLessonName.replace(/'/g, "\\'");
  const videoHTML = buildVideoSection(currentLessonName);
  renderLessonContent(currentLessonName, currentLessonUnit, currentLessonSub, safeName, videoHTML);
}

function setLessonViewMode(mode) {
  lessonViewMode = mode;
  localStorage.setItem('politicsapp-view-mode', mode);
  lessonPageIdx = 0;
  ddOpen = false;
  const safeName = currentLessonName.replace(/'/g, "\\'");
  const videoHTML = buildVideoSection(currentLessonName);
  renderLessonContent(currentLessonName, currentLessonUnit, currentLessonSub, safeName, videoHTML);
}

function markDone(u, name) {
  const id = u + '-' + name;
  const wasNew = !done.has(id);
  done.add(id);
  localStorage.setItem(`${STORAGE_PREFIX}-done`, JSON.stringify([...done]));
  updateProgress(); buildList(); closeLesson();
  if (wasNew) {
    addXP(20, 'Lesson complete');
    recordGoalProgress();
  }
}

function updateProgress() {
  const p = (done.size / total) * 100;
  document.getElementById('course-progress').style.width = p + '%';
  document.getElementById('progress-label').textContent = `Course progress â€” ${done.size} of ${total} lessons`;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// READING PROGRESS BAR
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

window.addEventListener('scroll', () => {
  if (document.getElementById('lesson-reader').style.display === 'block') {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    document.getElementById('reading-progress').style.width = pct + '%';
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SEARCH
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function openSearch() {
  document.getElementById('search-overlay').style.display = 'flex';
  document.getElementById('search-input').value = '';
  document.getElementById('search-input').focus();
  document.getElementById('search-results').innerHTML = '<p style="color:var(--muted);padding:20px;text-align:center;font-size:0.88rem">Type to search across all content...</p>';
}

function closeSearch() {
  document.getElementById('search-overlay').style.display = 'none';
}

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
  if (e.key === 'Escape') closeSearch();
});

function doSearch(q) {
  const r = document.getElementById('search-results');
  if (!q || q.length < 2) { r.innerHTML = '<p style="color:var(--muted);padding:20px;text-align:center;font-size:0.88rem">Type at least 2 characters...</p>'; return; }
  const ql = q.toLowerCase();
  const results = [];

  // Search lessons
  units.forEach(u => {
    u.nodes.forEach(n => {
      const content = L[n.name] || '';
      const textContent = content.replace(/<[^>]+>/g, ' ').toLowerCase();
      if (n.name.toLowerCase().includes(ql) || n.sub.toLowerCase().includes(ql) || textContent.includes(ql)) {
        let snippet = '';
        const idx = textContent.indexOf(ql);
        if (idx >= 0) snippet = '...' + textContent.substring(Math.max(0, idx - 40), idx + 60).trim() + '...';
        results.push({ type: 'Lesson', title: n.name, sub: 'Unit ' + u.unitNum + ' â€” ' + n.sub, snippet, action: `openLesson(${u.unitNum},'${n.name.replace(/'/g, "\\'")}','${n.sub.replace(/'/g, "\\'")}')` });
      }
    });
  });

  // Search glossary
  glossaryData.forEach(g => {
    if (g.term.toLowerCase().includes(ql) || g.def.toLowerCase().includes(ql)) {
      results.push({ type: 'Glossary', title: g.term, sub: g.def.substring(0, 80) + '...', snippet: '', action: "showTab('glossary',document.querySelectorAll('.tab-btn')[4]);document.getElementById('glossary-search').value='" + q.replace(/'/g, "\\'") + "';filterGlossary();" });
    }
  });

  // Search quiz
  quizData.forEach(q2 => {
    if (q2.q.toLowerCase().includes(ql) || q2.explain.toLowerCase().includes(ql)) {
      results.push({ type: 'Quiz', title: q2.q.substring(0, 60) + '...', sub: q2.explain.substring(0, 80), snippet: '', action: "showTab('quiz',document.querySelectorAll('.tab-btn')[2])" });
    }
  });

  if (results.length === 0) { r.innerHTML = '<div style="padding:30px;text-align:center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:8px;opacity:0.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg><p style="color:var(--muted);font-size:0.88rem">No results found.</p></div>'; return; }
  r.innerHTML = results.slice(0, 15).map(x => `<div class="search-result" onclick="${x.action};closeSearch()"><div class="search-result-type">${x.type}</div><div class="search-result-title">${x.title}</div><div class="search-result-snippet">${x.sub}</div></div>`).join('');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// QUIZ
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

function buildQuizFilter() {
  const unitNames = ['All', ...units.map(u => 'Unit ' + u.unitNum)];
  document.getElementById('quiz-filter').innerHTML = unitNames.map((n, i) =>
    `<button class="quiz-filter-btn${i === 0 ? ' active' : ''}" onclick="setQuizUnit(${i === 0 ? "'all'" : i},this)">${n}</button>`
  ).join('');
}

function setQuizUnit(u, btn) {
  quizUnit = u;
  document.querySelectorAll('.quiz-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  startQuiz();
}

function getFilteredQuiz() {
  if (quizUnit === 'all') return quizData;
  const unitLabel = units[quizUnit - 1]?.label || '';
  // Filter quiz questions to those whose question or explanation mentions the unit label.
  // (Will be refined as quiz data is populated.)
  return quizData.filter(q => q.q.toLowerCase().includes(unitLabel.toLowerCase()) || q.explain.toLowerCase().includes(unitLabel.toLowerCase()));
}

function startQuiz() {
  const filtered = getFilteredQuiz();
  shuffled = shuffle(filtered.length > 0 ? filtered : quizData);
  qIdx = 0; qScore = 0;
  renderQ();
}

function renderQ() {
  if (qIdx >= shuffled.length) {
    const pct = shuffled.length > 0 ? Math.round(qScore / shuffled.length * 100) : 0;
    const svgTrophy = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${pct >= 70 ? '#4ade80' : '#e8893c'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:12px"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;
    document.getElementById('quiz-container').innerHTML = `<div class="quiz-score-display">${svgTrophy}<div class="score-big">${qScore}/${shuffled.length}</div><div class="score-label">questions correct (${pct}%)</div><p style="margin-top:16px;color:var(--muted);font-size:0.9rem">${pct >= 90 ? 'Outstanding!' : pct >= 70 ? 'Great work!' : pct >= 50 ? 'Good effort!' : 'Keep studying!'}</p><button class="next-q-btn show" style="margin-top:20px" onclick="startQuiz()">Try Again</button></div>`;
    addXP(15, 'Quiz complete');
    if (pct === 100 && shuffled.length > 0) {
      localStorage.setItem('politicsapp-perfect-quiz', 'true');
      checkBadges();
    }
    return;
  }
  const q = shuffled[qIdx]; qAns = false;
  // Get Bloom's level badge
  let bloomBadge = '';
  if (typeof getBloomLevel !== 'undefined' && typeof bloomsLevels !== 'undefined') {
    const bl = getBloomLevel(q.q);
    const meta = bloomsLevels.find(l => l.id === bl);
    if (meta) bloomBadge = `<span class="bloom-badge" style="background:${meta.color}20;color:${meta.color}">${meta.icon} ${meta.label}</span>`;
  }
  document.getElementById('quiz-container').innerHTML = `<div style="font-size:0.78rem;color:var(--muted);font-weight:700;margin-bottom:10px">Question ${qIdx + 1} of ${shuffled.length} ${bloomBadge}</div><div class="quiz-question">${q.q}</div><div class="quiz-options">${q.options.map((o, i) => `<button class="quiz-option" onclick="ansQ(${i})">${o}</button>`).join('')}</div><div class="quiz-feedback" id="qfb"></div><button class="next-q-btn" id="nqb" onclick="nextQ()">Next â†’</button>`;
}

function ansQ(i) {
  if (qAns) return; qAns = true;
  const q = shuffled[qIdx], btns = document.querySelectorAll('.quiz-option');
  btns.forEach(b => b.disabled = true);
  btns[q.correct].classList.add('correct');
  const fb = document.getElementById('qfb');
  // Track Bloom's level
  trackBloomAnswer(q.q);
  if (i === q.correct) { qScore++; addXP(5, 'Correct answer'); fb.className = 'quiz-feedback show correct'; fb.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:4px"><polyline points="20 6 9 17 4 12"/></svg> ' + q.explain; }
  else { btns[i].classList.add('wrong'); fb.className = 'quiz-feedback show wrong'; fb.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e05a5a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:4px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ' + q.explain; }
  document.getElementById('nqb').classList.add('show');
}

function nextQ() { qIdx++; renderQ(); }

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GAME MODES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

let currentGameMode = 'quiz';

function setGameMode(mode, btn) {
  currentGameMode = mode;
  document.querySelectorAll('.game-mode-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.getElementById('quiz-mode').style.display = mode === 'quiz' ? 'block' : 'none';
  document.getElementById('truefalse-mode').style.display = mode === 'truefalse' ? 'block' : 'none';
  document.getElementById('match-mode').style.display = mode === 'match' ? 'block' : 'none';
  document.getElementById('fillblank-mode').style.display = mode === 'fillblank' ? 'block' : 'none';

  if (mode === 'truefalse') startTrueFalse();
  if (mode === 'match') startMatchUp();
  if (mode === 'fillblank') startFillBlank();
}

// â”€â”€â”€ TRUE OR FALSE â”€â”€â”€

const tfStatements = [
  { s: "Scarcity means society has limited resources but unlimited wants.", t: true, why: "This is the fundamental economic problem â€” resources are finite but human desires are not." },
  { s: "Opportunity cost only includes money you spend.", t: false, why: "Opportunity cost includes the value of the NEXT BEST alternative you gave up â€” not just money, but time, other experiences, etc." },
  { s: "When the price of a good rises, quantity demanded falls.", t: true, why: "This is the Law of Demand â€” there's an inverse relationship between price and quantity demanded." },
  { s: "The supply curve slopes downward.", t: false, why: "The supply curve slopes UPWARD â€” higher prices incentivise producers to supply more." },
  { s: "GDP counts the sale of used cars.", t: false, why: "GDP only counts NEW final goods and services. Used goods were already counted when first produced." },
  { s: "Inflation means the general price level is rising.", t: true, why: "Inflation is a sustained increase in the OVERALL price level, not just one good getting more expensive." },
  { s: "A monopolist is a price taker.", t: false, why: "A monopolist is a PRICE MAKER â€” they have market power to set prices because they're the only seller." },
  { s: "Comparative advantage is about having the lowest opportunity cost.", t: true, why: "You should specialise in whatever you can produce at the lowest opportunity cost â€” that's your comparative advantage." },
  { s: "A price ceiling set ABOVE equilibrium causes a shortage.", t: false, why: "A ceiling above equilibrium is NOT binding â€” it has no effect. Only a ceiling BELOW equilibrium causes a shortage." },
  { s: "Consumer surplus is the difference between willingness to pay and the actual price.", t: true, why: "If you'd pay $50 but only pay $30, your consumer surplus is $20." },
  { s: "In the long run, firms in perfect competition earn economic profit.", t: false, why: "In long-run competitive equilibrium, economic profit is ZERO. Profits attract entry, which drives price down to average total cost." },
  { s: "The money multiplier equals 1 divided by the reserve ratio.", t: true, why: "If the reserve ratio is 10%, the multiplier is 1/0.10 = 10. A $100 deposit can create up to $1,000." },
  { s: "Fiscal policy is controlled by the central bank.", t: false, why: "Fiscal policy (taxes and government spending) is controlled by the GOVERNMENT. The central bank controls MONETARY policy." },
  { s: "A negative externality means a third party is harmed by a transaction.", t: true, why: "When a factory pollutes, nearby residents are harmed even though they weren't part of the production decision." },
  { s: "The Phillips curve shows a trade-off between inflation and GDP.", t: false, why: "The Phillips curve shows a trade-off between INFLATION and UNEMPLOYMENT, not GDP." },
  { s: "Public goods are non-excludable and non-rival.", t: true, why: "You can't stop people from using public goods (non-excludable) and one person's use doesn't reduce others' (non-rival)." },
  { s: "When the government prints more money, prices tend to rise.", t: true, why: "More money chasing the same goods pushes prices up â€” this is the quantity theory of money (MV = PY)." },
  { s: "The Prisoner's Dilemma shows why cooperation is easy.", t: false, why: "The Prisoner's Dilemma shows why cooperation is HARD â€” each player's dominant strategy is to defect, even though both would be better off cooperating." },
  { s: "Real GDP adjusts for inflation.", t: true, why: "Real GDP uses constant prices to remove the effect of inflation, showing actual changes in output." },
  { s: "A tariff on imports benefits domestic consumers.", t: false, why: "Tariffs HURT consumers by raising prices. They benefit domestic PRODUCERS and generate government revenue." },
];

let tfIdx = 0, tfScore = 0, tfTotal = 10, tfAnswered = false, tfShuffled = [];

function startTrueFalse() {
  tfShuffled = shuffle(tfStatements).slice(0, tfTotal);
  tfIdx = 0;
  tfScore = 0;
  renderTF();
}

function renderTF() {
  const el = document.getElementById('truefalse-mode');
  if (tfIdx >= tfShuffled.length) {
    const pct = Math.round((tfScore / tfShuffled.length) * 100);
    el.innerHTML = `<div class="game-result">
      <div class="game-result-icon">${pct >= 80 ? 'ðŸ†' : pct >= 60 ? 'ðŸ‘' : 'ðŸ’ª'}</div>
      <div class="game-result-score">${tfScore}/${tfShuffled.length}</div>
      <div class="game-result-label">${pct}% correct</div>
      <div class="game-result-msg">${pct >= 80 ? 'Excellent! You really know your politics!' : pct >= 60 ? 'Good work! Keep studying to sharpen up.' : 'Keep going â€” review the lessons and try again!'}</div>
      <button class="game-restart-btn" onclick="startTrueFalse()">Play Again</button>
    </div>`;
    addXP(15, 'True/False game');
    return;
  }
  const q = tfShuffled[tfIdx];
  tfAnswered = false;
  el.innerHTML = `<div class="tf-score">Question ${tfIdx + 1} of ${tfShuffled.length} Â· Score: ${tfScore}</div>
    <div class="tf-statement">${q.s}</div>
    <div class="tf-buttons">
      <button class="tf-btn true-btn" onclick="answerTF(true)">âœ“ True</button>
      <button class="tf-btn false-btn" onclick="answerTF(false)">âœ— False</button>
    </div>
    <div class="tf-feedback" id="tf-feedback"></div>`;
}

function answerTF(answer) {
  if (tfAnswered) return;
  tfAnswered = true;
  const q = tfShuffled[tfIdx];
  const correct = answer === q.t;
  if (correct) { tfScore++; addXP(5, 'True/False correct'); }

  const btns = document.querySelectorAll('.tf-btn');
  btns.forEach(b => {
    b.disabled = true;
    if (b.classList.contains('true-btn')) b.classList.add(q.t ? 'correct' : (answer === true ? 'wrong' : ''));
    if (b.classList.contains('false-btn')) b.classList.add(!q.t ? 'correct' : (answer === false ? 'wrong' : ''));
  });

  const fb = document.getElementById('tf-feedback');
  fb.className = 'tf-feedback show ' + (correct ? 'good' : 'bad');
  fb.textContent = (correct ? 'âœ“ Correct! ' : 'âœ— Wrong. ') + q.why;

  setTimeout(() => { tfIdx++; renderTF(); }, 2200);
}

// â”€â”€â”€ MATCH UP â”€â”€â”€

let matchTerms = [], matchDefs = [], matchSelected = null, matchedCount = 0, matchTotal = 6, matchWrong = 0;

function startMatchUp() {
  const terms = shuffle(glossaryData.filter(g => g.def.length < 120)).slice(0, matchTotal);
  matchTerms = terms.map((t, i) => ({ id: i, text: t.term, matched: false }));
  matchDefs = shuffle(terms.map((t, i) => ({ id: i, text: t.def.length > 80 ? t.def.substring(0, 77) + '...' : t.def, matched: false })));
  matchSelected = null;
  matchedCount = 0;
  matchWrong = 0;
  renderMatch();
}

function renderMatch() {
  const el = document.getElementById('match-mode');
  if (matchedCount >= matchTotal) {
    const score = Math.max(0, matchTotal - matchWrong);
    el.innerHTML = `<div class="game-result">
      <div class="game-result-icon">${matchWrong === 0 ? 'ðŸ†' : matchWrong <= 2 ? 'â­' : 'ðŸ’ª'}</div>
      <div class="game-result-score">${score}/${matchTotal}</div>
      <div class="game-result-label">${matchWrong === 0 ? 'Perfect match!' : matchWrong + ' mistake' + (matchWrong > 1 ? 's' : '')}</div>
      <button class="game-restart-btn" onclick="startMatchUp()">Play Again</button>
    </div>`;
    addXP(20, 'Match-Up game');
    return;
  }

  const termsHTML = matchTerms.map(t =>
    `<button class="match-item${t.matched ? ' matched' : ''}${matchSelected && matchSelected.side === 'term' && matchSelected.id === t.id ? ' selected' : ''}" ${t.matched ? 'disabled' : ''} onclick="selectMatch('term',${t.id})">${t.text}</button>`
  ).join('');
  const defsHTML = matchDefs.map(d =>
    `<button class="match-item${d.matched ? ' matched' : ''}${matchSelected && matchSelected.side === 'def' && matchSelected.id === d.id ? ' selected' : ''}" ${d.matched ? 'disabled' : ''} onclick="selectMatch('def',${d.id})">${d.text}</button>`
  ).join('');

  el.innerHTML = `<div class="match-score">Matched: ${matchedCount}/${matchTotal}${matchWrong > 0 ? ' Â· Mistakes: ' + matchWrong : ''}</div>
    <div class="match-grid">
      <div><div class="match-col-label">Terms</div>${termsHTML}</div>
      <div><div class="match-col-label">Definitions</div>${defsHTML}</div>
    </div>`;
}

function selectMatch(side, id) {
  if (!matchSelected) {
    matchSelected = { side, id };
    renderMatch();
    return;
  }
  if (matchSelected.side === side) {
    matchSelected = { side, id };
    renderMatch();
    return;
  }

  // Check if it's a match
  const termId = side === 'term' ? id : matchSelected.id;
  const defId = side === 'def' ? id : matchSelected.id;

  if (termId === defId) {
    // Correct match
    matchTerms.find(t => t.id === termId).matched = true;
    matchDefs.find(d => d.id === defId).matched = true;
    matchedCount++;
    matchSelected = null;
    addXP(3, 'Match correct');
    renderMatch();
  } else {
    // Wrong match
    matchWrong++;
    matchSelected = null;
    // Show shake animation briefly
    renderMatch();
    const items = document.querySelectorAll('.match-item:not(.matched)');
    items.forEach(i => i.classList.add('wrong-match'));
    setTimeout(() => items.forEach(i => i.classList.remove('wrong-match')), 400);
  }
}

// â”€â”€â”€ FILL THE BLANK â”€â”€â”€

const fbQuestions = [
  { sentence: "The fundamental economic problem is ___.", answer: "scarcity", options: ["scarcity", "inflation", "unemployment", "trade"] },
  { sentence: "The value of the next best alternative you give up is called ___.", answer: "opportunity cost", options: ["opportunity cost", "sunk cost", "marginal cost", "total cost"] },
  { sentence: "The demand curve slopes ___ because higher prices mean less quantity demanded.", answer: "downward", options: ["upward", "downward", "sideways", "flat"] },
  { sentence: "The supply curve slopes ___ because higher prices incentivise more production.", answer: "upward", options: ["upward", "downward", "sideways", "flat"] },
  { sentence: "When quantity supplied exceeds quantity demanded, there is a ___.", answer: "surplus", options: ["shortage", "surplus", "equilibrium", "monopoly"] },
  { sentence: "A good with few substitutes tends to have ___ demand.", answer: "inelastic", options: ["elastic", "inelastic", "unit elastic", "infinite"] },
  { sentence: "GDP stands for Gross ___ Product.", answer: "Domestic", options: ["Domestic", "Direct", "Demand", "Dollar"] },
  { sentence: "A single seller in a market is called a ___.", answer: "monopoly", options: ["monopoly", "oligopoly", "cartel", "competitor"] },
  { sentence: "Adam Smith's ___ describes how self-interest promotes the common good.", answer: "invisible hand", options: ["invisible hand", "iron fist", "golden rule", "free rider"] },
  { sentence: "A tax designed to correct a negative externality is called a ___ tax.", answer: "Pigouvian", options: ["Pigouvian", "progressive", "regressive", "flat"] },
  { sentence: "The CPI measures the cost of a fixed ___ of goods over time.", answer: "basket", options: ["basket", "truck", "bundle", "pile"] },
  { sentence: "When government borrowing raises interest rates and reduces private investment, this is called ___.", answer: "crowding out", options: ["crowding out", "pumping up", "free riding", "price gouging"] },
  { sentence: "A country should specialise in goods where it has a ___ advantage.", answer: "comparative", options: ["absolute", "comparative", "natural", "unfair"] },
  { sentence: "The money multiplier equals 1 divided by the ___.", answer: "reserve ratio", options: ["reserve ratio", "interest rate", "inflation rate", "tax rate"] },
  { sentence: "Goods that are non-excludable and non-rival are called ___ goods.", answer: "public", options: ["public", "private", "club", "common"] },
  { sentence: "The Phillips curve shows a short-run trade-off between inflation and ___.", answer: "unemployment", options: ["unemployment", "GDP", "interest rates", "trade"] },
  { sentence: "In the long run, a competitive firm earns ___ economic profit.", answer: "zero", options: ["zero", "maximum", "negative", "unlimited"] },
  { sentence: "When one person's actions impose costs on bystanders, this is a negative ___.", answer: "externality", options: ["externality", "equilibrium", "elasticity", "efficiency"] },
];

let fbIdx = 0, fbScore = 0, fbTotal = 10, fbAnswered = false, fbShuffled = [];

function startFillBlank() {
  fbShuffled = shuffle(fbQuestions).slice(0, fbTotal);
  fbIdx = 0;
  fbScore = 0;
  renderFB();
}

function renderFB() {
  const el = document.getElementById('fillblank-mode');
  if (fbIdx >= fbShuffled.length) {
    const pct = Math.round((fbScore / fbShuffled.length) * 100);
    el.innerHTML = `<div class="game-result">
      <div class="game-result-icon">${pct >= 80 ? 'ðŸ†' : pct >= 60 ? 'ðŸ‘' : 'ðŸ’ª'}</div>
      <div class="game-result-score">${fbScore}/${fbShuffled.length}</div>
      <div class="game-result-label">${pct}% correct</div>
      <div class="game-result-msg">${pct >= 80 ? 'Amazing! You know your terms!' : pct >= 60 ? 'Solid work! A few more reviews and you\'ll ace it.' : 'Keep studying â€” the glossary and flashcards will help!'}</div>
      <button class="game-restart-btn" onclick="startFillBlank()">Play Again</button>
    </div>`;
    addXP(15, 'Fill the Blank game');
    return;
  }
  const q = fbShuffled[fbIdx];
  fbAnswered = false;
  const display = q.sentence.replace('___', '<span class="fb-blank" id="fb-blank">???</span>');
  const chips = shuffle(q.options).map(o =>
    `<button class="fb-chip" onclick="answerFB('${o.replace(/'/g, "\\'")}')">${o}</button>`
  ).join('');

  el.innerHTML = `<div class="tf-score">Question ${fbIdx + 1} of ${fbShuffled.length} Â· Score: ${fbScore}</div>
    <div class="fb-sentence">${display}</div>
    <div class="fb-chips" id="fb-chips">${chips}</div>
    <div class="fb-feedback" id="fb-feedback"></div>`;
}

function answerFB(answer) {
  if (fbAnswered) return;
  fbAnswered = true;
  const q = fbShuffled[fbIdx];
  const correct = answer === q.answer;
  if (correct) { fbScore++; addXP(5, 'Fill blank correct'); }

  const blank = document.getElementById('fb-blank');
  blank.textContent = q.answer;
  blank.classList.add(correct ? 'filled' : 'wrong-fill');

  document.querySelectorAll('.fb-chip').forEach(c => {
    c.disabled = true;
    if (c.textContent === q.answer) c.classList.add('correct-chip');
    else if (c.textContent === answer && !correct) c.classList.add('wrong-chip');
  });

  const fb = document.getElementById('fb-feedback');
  fb.className = 'fb-feedback show ' + (correct ? 'good' : 'bad');
  fb.textContent = correct ? 'âœ“ Correct!' : 'âœ— The answer is: ' + q.answer;

  setTimeout(() => { fbIdx++; renderFB(); }, 1800);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// FLASHCARDS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function getAllCards() { return [...glossaryData, ...customCards]; }
function saveCustomCards() { localStorage.setItem(`${STORAGE_PREFIX}-custom-cards`, JSON.stringify(customCards)); }

// Category mapping for glossary terms â€” to be filled in alongside the glossary.
const fcCategories = [
  { name: 'All', filter: null }
];

let fcCategory = 'All';
let fcViewMode = 'card'; // 'card' or 'list'

function getCardCategory(card) {
  for (const cat of fcCategories) {
    if (cat.terms && cat.terms.includes(card.term)) return cat.name;
  }
  if (customCards.find(c => c.term === card.term)) return 'Custom';
  return 'Other';
}

function initFlashcards() {
  const all = getAllCards();
  let filtered = all;

  // Apply category filter
  if (fcCategory === 'Custom') {
    filtered = customCards.slice();
  } else if (fcCategory !== 'All') {
    const cat = fcCategories.find(c => c.name === fcCategory);
    if (cat && cat.terms) filtered = all.filter(c => cat.terms.includes(c.term));
  }

  // Apply search filter
  if (fcFilter) filtered = filtered.filter(c => c.term.toLowerCase().includes(fcFilter) || c.def.toLowerCase().includes(fcFilter));

  // Toolbar
  document.getElementById('fc-toolbar').innerHTML = '<input class="fc-search" placeholder="Search ' + all.length + ' cards..." value="' + fcFilter + '" oninput="fcFilter=this.value.toLowerCase();initFlashcards()">' +
    '<div class="fc-toolbar-right">' +
    '<button class="fc-toolbar-btn' + (fcViewMode==='card'?' active':'') + '" onclick="fcViewMode=\'card\';initFlashcards()" title="Card view">&#x1F0CF;</button>' +
    '<button class="fc-toolbar-btn' + (fcViewMode==='list'?' active':'') + '" onclick="fcViewMode=\'list\';initFlashcards()" title="List view">&#9776;</button>' +
    '<button class="fc-toolbar-btn" onclick="toggleFCFullscreen()" title="Fullscreen">&#x26F6;</button>' +
    '<button class="fc-toolbar-btn" onclick="showAddCard()">+ Add</button>' +
    '<button class="fc-toolbar-btn" onclick="exportCards()">Export</button>' +
    '<button class="fc-toolbar-btn" onclick="document.getElementById(\'fc-import-file\').click()">Import</button>' +
    '<input type="file" id="fc-import-file" accept=".json,.csv,.txt" style="display:none" onchange="importCards(this)">' +
    '</div>';

  // Clear stats area (categories will go below cards now)
  document.getElementById('fc-stats').innerHTML = '';

  fcCards = filtered.slice();
  fcIndex = 0;
  fcFlipped = false;
  var c = document.getElementById('fc-container');

  // Build category grid HTML
  var catGridHTML = '<div class="fc-cat-grid">' +
    fcCategories.map(cat => {
      const count = cat.name === 'All' ? all.length : cat.name === 'Custom' ? customCards.length : (cat.terms ? cat.terms.length : 0);
      return '<button class="fc-cat-card' + (fcCategory === cat.name ? ' active' : '') + '" onclick="fcCategory=\'' + cat.name.replace(/'/g, "\\'") + '\';fcIndex=0;initFlashcards()"><span class="fc-cat-card-name">' + cat.name + '</span><span class="fc-cat-card-count">' + count + '</span></button>';
    }).join('') + '</div>';

  if (fcCards.length === 0) { c.innerHTML = '<div class="fc-empty">No cards in this category.</div>' + catGridHTML; return; }

  if (fcViewMode === 'list') {
    // List view
    c.innerHTML = '<div class="fc-list">' + fcCards.map((card, i) => {
      const isCustom = customCards.find(cc => cc.term === card.term);
      return '<div class="fc-list-item" onclick="fcIndex=' + i + ';fcViewMode=\'card\';initFlashcards()">' +
        '<div class="fc-list-term">' + card.term + '</div>' +
        '<div class="fc-list-def">' + card.def + '</div>' +
        (isCustom ? '<span class="fc-list-badge">Custom</span>' : '') +
        '</div>';
    }).join('') + '</div>' + catGridHTML;
  } else {
    // Card view
    c.innerHTML = '<div class="fc-viewer"><div class="fc-card-wrap"><div class="fc-card" id="fc-card" onclick="flipFC()"><div class="fc-front" id="fc-front"></div><div class="fc-back" id="fc-back"></div></div></div><div class="fc-controls"><button onclick="prevFC()">&larr; Prev</button><span id="fc-progress"></span><button onclick="nextFC()">Next &rarr;</button><button onclick="shuffleFC()">Shuffle</button></div></div>' + catGridHTML;
    updateFC();
  }
}
function updateFC() {
  if (fcCards.length === 0) return;
  var card = fcCards[fcIndex];
  document.getElementById('fc-front').textContent = card.term;
  document.getElementById('fc-back').textContent = card.def;
  document.getElementById('fc-progress').textContent = (fcIndex + 1) + ' / ' + fcCards.length;
}
function flipFC() {
  var el = document.getElementById('fc-card');
  fcFlipped = !fcFlipped;
  if (fcFlipped) { el.classList.add('flipped'); trackFlip(); }
  else { el.classList.remove('flipped'); }
}
function nextFC() {
  if (fcCards.length === 0) return;
  fcIndex = (fcIndex + 1) % fcCards.length;
  fcFlipped = false;
  var el = document.getElementById('fc-card');
  el.classList.add('no-transition'); el.classList.remove('flipped');
  void el.offsetHeight; el.classList.remove('no-transition');
  updateFC();
}
function prevFC() {
  if (fcCards.length === 0) return;
  fcIndex = (fcIndex - 1 + fcCards.length) % fcCards.length;
  fcFlipped = false;
  var el = document.getElementById('fc-card');
  el.classList.add('no-transition'); el.classList.remove('flipped');
  void el.offsetHeight; el.classList.remove('no-transition');
  updateFC();
}
function shuffleFC() {
  for (var i = fcCards.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = fcCards[i]; fcCards[i] = fcCards[j]; fcCards[j] = tmp; }
  fcIndex = 0; fcFlipped = false;
  var el = document.getElementById('fc-card');
  el.classList.add('no-transition'); el.classList.remove('flipped');
  void el.offsetHeight; el.classList.remove('no-transition');
  updateFC();
}

let fcFullscreen = false;

function toggleFCFullscreen() {
  const panel = document.getElementById('tab-flashcards');
  if (!panel) return;
  fcFullscreen = !fcFullscreen;
  if (fcFullscreen) {
    panel.classList.add('fc-fullscreen');
    document.body.style.overflow = 'hidden';
  } else {
    panel.classList.remove('fc-fullscreen');
    document.body.style.overflow = '';
  }
}

// Exit fullscreen on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && fcFullscreen) toggleFCFullscreen();
});

function showAddCard(term, def, editIdx) {
  const isEdit = editIdx !== undefined;
  const modal = document.createElement('div');
  modal.className = 'fc-modal';
  modal.id = 'fc-modal';
  modal.innerHTML = `<div class="fc-modal-box">
    <div class="fc-modal-title">${isEdit ? 'Edit' : 'Add'} Flashcard</div>
    <input class="fc-modal-input" id="fc-new-term" placeholder="Term / Question" value="${term || ''}">
    <textarea class="fc-modal-input" id="fc-new-def" placeholder="Definition / Answer" rows="3">${def || ''}</textarea>
    <div class="fc-modal-btns">
      <button class="fc-modal-btn secondary" onclick="document.getElementById('fc-modal').remove()">Cancel</button>
      <button class="fc-modal-btn primary" onclick="${isEdit ? `saveEditCard(${editIdx})` : 'addCard()'}">${isEdit ? 'Save' : 'Add'}</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('fc-new-term').focus();
}

function addCard() {
  const term = document.getElementById('fc-new-term').value.trim();
  const def = document.getElementById('fc-new-def').value.trim();
  if (!term || !def) return;
  customCards.push({ term, def });
  saveCustomCards();
  document.getElementById('fc-modal').remove();
  initFlashcards();
}

function editCard(idx) {
  const card = customCards[idx];
  showAddCard(card.term, card.def, idx);
}

function saveEditCard(idx) {
  const term = document.getElementById('fc-new-term').value.trim();
  const def = document.getElementById('fc-new-def').value.trim();
  if (!term || !def) return;
  customCards[idx] = { term, def };
  saveCustomCards();
  document.getElementById('fc-modal').remove();
  initFlashcards();
}

function deleteCard(idx) {
  if (!confirm('Delete this card?')) return;
  customCards.splice(idx, 1);
  saveCustomCards();
  initFlashcards();
}

function exportCards() {
  const all = getAllCards();
  const data = JSON.stringify(all, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'politicsapp-flashcards.json'; a.click();
  URL.revokeObjectURL(url);
}

function importCards(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const text = e.target.result;
      let cards;
      if (file.name.endsWith('.json')) {
        cards = JSON.parse(text);
      } else {
        cards = text.split('\n').filter(l => l.trim()).map(l => {
          const sep = l.includes('\t') ? '\t' : ',';
          const parts = l.split(sep);
          return { term: parts[0]?.trim() || '', def: parts.slice(1).join(sep).trim() || '' };
        }).filter(c => c.term && c.def);
      }
      if (!Array.isArray(cards) || cards.length === 0) { alert('No valid cards found.'); return; }
      const newCards = cards.filter(c => c.term && c.def);
      customCards.push(...newCards);
      saveCustomCards();
      alert('Imported ' + newCards.length + ' cards!');
      initFlashcards();
    } catch(err) { alert('Error reading file: ' + err.message); }
  };
  reader.readAsText(file);
  input.value = '';
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GLOSSARY
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function renderGlossary(f = '') {
  const fl = glossaryData.filter(g => g.term.toLowerCase().includes(f.toLowerCase()) || g.def.toLowerCase().includes(f.toLowerCase()));
  document.getElementById('glossary-list').innerHTML = fl.map(g => `<div class="glossary-item"><div class="glossary-term">${g.term}</div><div class="glossary-def">${g.def}</div></div>`).join('');
}

function filterGlossary() { renderGlossary(document.getElementById('glossary-search').value); }

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CHAT (AI TUTOR)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// API KEY MANAGEMENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function getApiKey() {
  return localStorage.getItem('politicsapp-api-key') || localStorage.getItem(`${STORAGE_PREFIX}-api-key`) || '';
}

function getProxyUrl() {
  return localStorage.getItem('politicsapp-proxy-url') || '';
}

// Unified function for all Claude API calls
async function callClaude(messages, systemPrompt, maxTokens) {
  const proxyUrl = getProxyUrl();
  const apiKey = getApiKey();
  maxTokens = maxTokens || 1000;

  if (proxyUrl) {
    // Use proxy (works on mobile)
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt || undefined,
        messages: messages
      })
    });
    return await res.json();
  } else if (apiKey) {
    // Direct API call (desktop only)
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt || undefined,
        messages: messages
      })
    });
    return await res.json();
  } else {
    return { error: { message: 'No API key or proxy configured. Go to Settings (âš™ï¸) to set up AI.' } };
  }
}

function saveApiKey() {
  const input = document.getElementById('api-key-input');
  const key = input.value.trim();
  const status = document.getElementById('api-key-status');

  if (!key) {
    localStorage.removeItem('politicsapp-api-key');
    localStorage.removeItem(`${STORAGE_PREFIX}-api-key`);
    status.textContent = 'API key removed.';
    status.style.color = 'var(--muted)';
    return;
  }

  if (!key.startsWith('sk-ant-')) {
    status.textContent = 'Invalid key â€” should start with sk-ant-';
    status.style.color = 'var(--red)';
    return;
  }

  localStorage.setItem('politicsapp-api-key', key);
  localStorage.setItem(`${STORAGE_PREFIX}-api-key`, key);
  status.textContent = 'Key saved! AI features are now enabled.';
  status.style.color = 'var(--green)';
  input.value = '';
  input.type = 'password';

  // Test the key
  testApiKey(key, status);
}

async function testApiKey(key, statusEl) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say "ok"' }]
      })
    });
    if (res.ok) {
      statusEl.textContent = 'Key verified and saved! AI features are active.';
      statusEl.style.color = 'var(--green)';
    } else {
      const err = await res.json();
      statusEl.textContent = 'Key saved but test failed: ' + (err.error?.message || 'Unknown error');
      statusEl.style.color = 'var(--red)';
    }
  } catch(e) {
    statusEl.textContent = 'Key saved. Could not verify (network error) â€” it may still work.';
    statusEl.style.color = 'var(--primary)';
  }
}

function saveProxyUrl() {
  const input = document.getElementById('proxy-url-input');
  const url = input.value.trim();
  const status = document.getElementById('proxy-url-status');

  if (!url) {
    localStorage.removeItem('politicsapp-proxy-url');
    status.textContent = 'Proxy URL removed. Using direct API key instead.';
    status.style.color = 'var(--muted)';
    return;
  }

  if (!url.startsWith('https://')) {
    status.textContent = 'URL must start with https://';
    status.style.color = 'var(--red)';
    return;
  }

  localStorage.setItem('politicsapp-proxy-url', url);
  status.textContent = 'Saved! Testing connection...';
  status.style.color = 'var(--primary)';
  testProxy(url, status);
}

async function testProxy(url, statusEl) {
  try {
    const data = await callClaude(
      [{ role: 'user', content: 'Say "connected" in one word.' }],
      null,
      10
    );
    if (data.content) {
      statusEl.textContent = 'Proxy working! AI features are active on all devices.';
      statusEl.style.color = 'var(--green)';
    } else if (data.error) {
      statusEl.textContent = 'Proxy reached but error: ' + (data.error.message || data.error);
      statusEl.style.color = 'var(--red)';
    }
  } catch(e) {
    statusEl.textContent = 'Could not reach proxy. Check the URL.';
    statusEl.style.color = 'var(--red)';
  }
}

function loadApiKeyUI() {
  const key = getApiKey();
  const proxy = getProxyUrl();
  const status = document.getElementById('api-key-status');
  const proxyStatus = document.getElementById('proxy-url-status');
  const proxyInput = document.getElementById('proxy-url-input');

  if (proxy) {
    if (proxyStatus) { proxyStatus.textContent = 'Proxy URL is set. AI works on all devices.'; proxyStatus.style.color = 'var(--green)'; }
    if (proxyInput) proxyInput.value = proxy;
  }
  if (key && status) {
    status.textContent = 'API key is set.';
    status.style.color = 'var(--green)';
  }
}

function resetAllProgress() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('politicsapp'));
  keys.forEach(k => localStorage.removeItem(k));
  location.reload();
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CHAT (AI TUTOR) â€” uses Claude API
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function ppFillInput(text) {
  const inp = document.getElementById('chat-input');
  if (!inp) return;
  inp.value = text;
  inp.focus();
}
function ppResetChat() {
  if (!confirm('Clear this chat and start a new one?')) return;
  const log = document.getElementById('chat-messages');
  if (log) log.innerHTML = '';
  const hero = document.getElementById('pp-tutor-hero');
  if (hero) hero.classList.remove('hidden');
  const chatBox = document.getElementById('pp-tutor-chat');
  if (chatBox) chatBox.classList.add('no-history');
  const resetBtn = document.getElementById('pp-tutor-reset');
  if (resetBtn) resetBtn.classList.add('hidden');
}

async function sendChat() {
  const inp = document.getElementById('chat-input'), raw = inp.value.trim();
  if (!raw) return;
  inp.value = '';
  // Swap from hero to chat view
  const hero = document.getElementById('pp-tutor-hero');
  if (hero) hero.classList.add('hidden');
  const chatBox = document.getElementById('pp-tutor-chat');
  if (chatBox) chatBox.classList.remove('no-history');
  const resetBtn = document.getElementById('pp-tutor-reset');
  if (resetBtn) resetBtn.classList.remove('hidden');
  appendMsg(raw, 'user');
  const msg = raw;
  document.getElementById('chat-send-btn').disabled = true;
  const t = appendMsg('', 'bot thinking', true);

  try {
    const d = await callClaude(
      buildHist(msg),
      "You are a friendly politics tutor. Keep responses short and scannable. Use: ## headers to break up topics, **bold** for key terms, bullet points for lists. Keep each paragraph to 1-2 sentences max. Use a real-world example. End with a **Key takeaway:** one-liner. Never write walls of text.",
      1000
    );
    t.remove();
    if (d.error) {
      appendMsg(d.error.message || "Error â€” check Settings (âš™ï¸) for API key or proxy setup.", 'bot');
    } else {
      appendMsg(d.content?.[0]?.text || "Sorry, couldn't get a response.", 'bot');
    }
  } catch(e) {
    t.remove();
    appendMsg("Connection error. Check Settings (âš™ï¸) for API/proxy setup.", 'bot');
  }
  document.getElementById('chat-send-btn').disabled = false;
}

function buildHist(m) {
  const msgs = document.querySelectorAll('#chat-messages .msg'), h = [];
  msgs.forEach(x => { if (x.classList.contains('thinking')) return; h.push({ role: x.classList.contains('user') ? 'user' : 'assistant', content: x.textContent }); });
  h.push({ role: 'user', content: m });
  return h.slice(-10);
}

function formatAIText(text) {
  // Convert markdown to structured HTML
  let html = text
    // Headers: ## or ### become styled section headers
    .replace(/^###\s+(.+)$/gm, '<div class="ai-section-title">$1</div>')
    .replace(/^##\s+(.+)$/gm, '<div class="ai-section-title">$1</div>')
    // Bold/italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:3px;font-size:0.85em">$1</code>')
    // List items
    .replace(/^[-â€¢]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>');
  // Split into paragraphs on double newlines
  const blocks = html.split(/\n\n+/);
  html = blocks.map(function(block) {
    block = block.trim();
    if (!block) return '';
    // If block is all list items, wrap in <ul>
    if (/^<li>/.test(block)) return '<ul class="ai-list">' + block.replace(/\n/g, '') + '</ul>';
    // If block is a section title, return as-is
    if (/^<div class="ai-section-title">/.test(block)) return block;
    // Otherwise wrap in paragraph
    return '<p class="ai-para">' + block.replace(/\n/g, '<br>') + '</p>';
  }).join('');
  return '<div class="ai-formatted">' + html + '</div>';
}

function appendMsg(t, c, isThinking) {
  const b = document.getElementById('chat-messages'), d = document.createElement('div');
  d.className = 'msg ' + c;
  if (isThinking || c.includes('thinking')) {
    d.innerHTML = '<span></span><span></span><span></span>';
  } else if (c.includes('bot')) {
    d.innerHTML = formatAIText(t);
  } else {
    d.textContent = t;
  }
  b.appendChild(d); b.scrollTop = b.scrollHeight;
  return d;
}

function saveConversation() {
  const msgs = document.querySelectorAll('#chat-messages .msg');
  const convo = [];
  msgs.forEach(function(m) {
    if (m.classList.contains('thinking')) return;
    convo.push({ role: m.classList.contains('user') ? 'user' : 'bot', text: m.textContent.replace(/Copy$|Copied!$/, '').trim() });
  });
  if (convo.length < 2) return; // need at least a question + answer

  const saved = JSON.parse(localStorage.getItem('politicsapp-saved-chats') || '[]');
  // Use first user message as title
  const firstQ = convo.find(function(m) { return m.role === 'user'; });
  const title = firstQ ? firstQ.text.substring(0, 60) : 'Chat';
  saved.unshift({ title: title, date: new Date().toISOString().split('T')[0], messages: convo });
  // Keep max 20 saved chats
  if (saved.length > 20) saved.pop();
  localStorage.setItem('politicsapp-saved-chats', JSON.stringify(saved));

  const btn = document.getElementById('chat-save-btn');
  if (btn) {
    btn.textContent = 'Saved!';
    setTimeout(function() { btn.textContent = 'Save Chat'; }, 1500);
  }
}

function renderSavedChats() {
  const container = document.getElementById('saved-chats');
  if (!container) return;
  const saved = JSON.parse(localStorage.getItem('politicsapp-saved-chats') || '[]');
  if (saved.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--muted);padding:16px;font-size:0.85rem">No saved chats yet. Use "Save Chat" during a conversation.</div>';
    return;
  }
  container.innerHTML = saved.map(function(chat, i) {
    return '<div class="saved-chat-item" onclick="viewSavedChat(' + i + ')">' +
      '<div class="saved-chat-title">' + chat.title + '</div>' +
      '<div class="saved-chat-meta">' + chat.date + ' Â· ' + chat.messages.length + ' messages</div>' +
    '</div>';
  }).join('');
}

function viewSavedChat(idx) {
  const saved = JSON.parse(localStorage.getItem('politicsapp-saved-chats') || '[]');
  const chat = saved[idx];
  if (!chat) return;
  const container = document.getElementById('saved-chats');
  let html = '<button class="case-save-btn" onclick="renderSavedChats()" style="margin-bottom:12px">â† Back</button>' +
    '<div class="saved-chat-title" style="margin-bottom:8px">' + chat.title + '</div>';
  chat.messages.forEach(function(m) {
    if (m.role === 'user') {
      html += '<div class="msg user" style="max-width:90%;margin-bottom:8px">' + m.text + '</div>';
    } else {
      html += '<div class="msg bot" style="max-width:90%;margin-bottom:8px">' + m.text + '</div>';
    }
  });
  html += '<button class="done-btn" style="margin-top:12px;background:var(--red,#e74c3c)" onclick="deleteSavedChat(' + idx + ')">Delete Chat</button>';
  container.innerHTML = html;
}

function deleteSavedChat(idx) {
  const saved = JSON.parse(localStorage.getItem('politicsapp-saved-chats') || '[]');
  saved.splice(idx, 1);
  localStorage.setItem('politicsapp-saved-chats', JSON.stringify(saved));
  renderSavedChats();
}

function sendSuggestion(el) { document.getElementById('chat-input').value = el.textContent; sendChat(); }

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// VIDEO SECTION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function buildVideoSection(name) {
  const vids = videoData[name];
  if (!vids || vids.length === 0) return '';
  let cards = vids.map(v =>
    `<a class="video-card" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener"><div class="video-thumb"><img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="${v.t}" loading="lazy"><div class="play-icon"></div></div><div class="video-info"><div class="video-title">${v.t}</div><div class="video-channel">${v.c}</div></div></a>`
  ).join('');
  return `<div class="video-section"><h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px;margin-right:6px"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>Watch & Learn</h3><div class="video-grid">${cards}</div></div>`;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// AI HELPER (Enki-style)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function toggleAIHelper() {
  const panel = document.getElementById('ai-helper-panel');
  if (panel.classList.contains('show')) {
    panel.classList.remove('show');
  } else {
    panel.classList.add('show');
    // Reset to actions view
    document.getElementById('ai-panel-actions').style.display = 'flex';
    document.getElementById('ai-response-area').classList.remove('show');
  }
}

function aiAction(type) {
  const responseArea = document.getElementById('ai-response-area');
  const responseBox = document.getElementById('ai-response-box');
  const actionsEl = document.getElementById('ai-panel-actions');

  responseArea.classList.add('show');
  responseBox.innerHTML = '<div class="ai-response-loading"><div class="spinner"></div>Thinking...</div>';

  // Get current lesson context
  const lessonName = currentLessonName || 'politics';
  const ped = (typeof pedagogy !== 'undefined') ? pedagogy[lessonName] : null;

  if (type === 'hint') {
    // Generate a hint based on the current lesson
    const hints = getHintsForLesson(lessonName, ped);
    setTimeout(() => {
      responseBox.innerHTML = '<strong>ðŸ’¡ Hint:</strong><br><br>' + hints;
      addXP(2, 'AI hint');
    }, 600);
  } else if (type === 'motivate') {
    const motivations = getMotivation(lessonName);
    setTimeout(() => {
      responseBox.innerHTML = motivations;
    }, 500);
  } else if (type === 'ask') {
    // Show input field
    responseBox.innerHTML = '<div style="margin-bottom:8px;font-weight:700;color:var(--text)">What would you like to know?</div>' +
      '<div class="ai-input-row">' +
      '<input class="ai-input" id="ai-question-input" placeholder="Type your question..." onkeydown="if(event.key===\'Enter\'){event.preventDefault();askAI()}">' +
      '<button class="ai-send-btn" id="ai-send-question" style="min-width:60px;padding:12px 18px">Ask</button>' +
      '</div>';
    setTimeout(() => {
      const input = document.getElementById('ai-question-input');
      const btn = document.getElementById('ai-send-question');
      if (input) input.focus();
      // Ensure button works on mobile with both click and touch
      if (btn) {
        btn.onclick = function(e) { e.preventDefault(); askAI(); };
        btn.ontouchend = function(e) { e.preventDefault(); askAI(); };
      }
    }, 100);
  }
}

function getHintsForLesson(name, ped) {
  // Build contextual hints from pedagogy data and lesson content
  const hints = [];

  if (ped && ped.objectives) {
    hints.push('This lesson is about: <strong>' + ped.objectives[0] + '</strong>');
  }
  if (ped && ped.transfer) {
    hints.push('Try connecting this to real life: ' + ped.transfer.substring(0, 150) + '...');
  }

  // Fallback hints — to be filled in alongside lesson content.
  const lessonHints = {};

  if (lessonHints[name]) {
    hints.unshift(lessonHints[name]);
  }

  if (hints.length === 0) {
    hints.push('Focus on the <strong>bold terms</strong> in the lesson â€” those are the key concepts. Try explaining each one in your own words.');
  }

  return hints[0];
}

function getMotivation(name) {
  const messages = [
    '<strong>\ud83d\udd25 You\u0027re doing great!</strong><br><br>Every psychologist started exactly where you are. The fact that you\u0027re here learning about the mind puts you ahead of most people who just guess about human behavior.',
    '<strong>\ud83d\udcaa Keep going!</strong><br><br>Politics is like a superpower - once you understand conditioning, cognitive biases, and social influence, you\u0027ll see the world completely differently. You\u0027re building that superpower right now.',
    '<strong>\ud83e\udde0 Fun fact:</strong><br><br>The concepts you\u0027re learning right now are the same ones used by clinical psychologists, UX designers, HR leaders, and researchers. You\u0027re learning to think like the people who understand human behavior at the deepest level.',
    '<strong>\u2b50 Progress check:</strong><br><br>You\u0027ve chosen to invest your time in understanding the mind - a choice that pays compounding returns. Every insight transfers to relationships, work, and self-understanding for the rest of your life.',
    '<strong>\ud83c\udfaf Remember:</strong><br><br>You don\u0027t need to memorise everything. Politics is about <em>frameworks</em> - how we learn, remember, perceive, and relate. Once those click, everything else follows.',
    '<strong>\ud83d\ude80 Almost there!</strong><br><br>Each lesson builds on the last. The more you learn, the easier new concepts become because they all connect. You\u0027re building a web of understanding about how minds work.'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

async function askAI() {
  const input = document.getElementById('ai-question-input');
  if (!input) return;
  const question = input.value.trim();
  if (!question) return;

  const responseBox = document.getElementById('ai-response-box');
  responseBox.innerHTML = '<div class="ai-response-loading"><div class="spinner"></div>Thinking...</div>';

  const hasAI = getProxyUrl() || getApiKey();
  if (hasAI) {
    try {
      const lessonContext = currentLessonName ? 'The student is currently studying: ' + currentLessonName + '.' : '';
      const data = await callClaude(
        [{ role: 'user', content: `You are a friendly politics tutor. ${lessonContext} Answer in a structured, scannable format: use ## headers to organize, **bold** key terms, bullet points where helpful. Keep paragraphs to 1-2 sentences. Include a real-world example. End with **Key takeaway:** one-liner. Never write walls of text.\n\nQuestion: ${question}` }],
        null,
        600
      );
      if (data.content && data.content[0]) {
        responseBox.innerHTML = '<strong>ðŸ“š Answer:</strong><br><br>' + formatAIText(data.content[0].text);
        addXP(5, 'AI question');
        return;
      }
    } catch(e) { console.log('AI unavailable'); }
  }

  responseBox.innerHTML = '<strong>ðŸ“š Answer:</strong><br><br>To get AI-powered answers, set up your API key or proxy in <strong>Settings (âš™ï¸)</strong>. In the meantime, try the <strong>glossary</strong> for definitions or the <strong>"Get a Hint"</strong> button.';
}

// Show/hide AI button with lesson
function showAIHelper() {
  const btn = document.getElementById('ai-helper-btn');
  if (btn) btn.style.display = 'flex';
}
function hideAIHelper() {
  const btn = document.getElementById('ai-helper-btn');
  const panel = document.getElementById('ai-helper-panel');
  if (btn) btn.style.display = 'none';
  if (panel) panel.classList.remove('show');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// NOTES PANEL (UDL)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function toggleNotes() {
  const panel = document.getElementById('notes-panel');
  if (panel.style.display === 'flex') {
    panel.style.display = 'none';
  } else {
    panel.style.display = 'flex';
    loadNotes(currentLessonName);
  }
}

function loadNotes(lessonName) {
  const ta = document.getElementById('notes-textarea');
  if (!ta || !lessonName) return;
  ta.value = localStorage.getItem('politicsapp-notes-' + lessonName) || '';
}

function saveNotes() {
  if (!currentLessonName) return;
  const ta = document.getElementById('notes-textarea');
  if (!ta) return;
  const text = ta.value.trim();
  localStorage.setItem('politicsapp-notes-' + currentLessonName, text);

  // Track which lessons have notes (for organized display)
  const notesIndex = JSON.parse(localStorage.getItem('politicsapp-notes-index') || '[]');
  const exists = notesIndex.indexOf(currentLessonName);
  if (text && exists < 0) {
    notesIndex.push(currentLessonName);
    localStorage.setItem('politicsapp-notes-index', JSON.stringify(notesIndex));
  } else if (!text && exists >= 0) {
    notesIndex.splice(exists, 1);
    localStorage.setItem('politicsapp-notes-index', JSON.stringify(notesIndex));
  }

  const indicator = document.getElementById('notes-saved');
  if (indicator) {
    indicator.textContent = 'Saved!';
    clearTimeout(indicator._timeout);
    indicator._timeout = setTimeout(() => { indicator.textContent = ''; }, 1500);
  }
}

function renderMyNotes() {
  const container = document.getElementById('my-notes');
  if (!container) return;
  const notesIndex = JSON.parse(localStorage.getItem('politicsapp-notes-index') || '[]');
  // Also scan for any legacy notes not in index
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('politicsapp-notes-') && key !== 'politicsapp-notes-index') {
      const lesson = key.replace('politicsapp-notes-', '');
      const text = localStorage.getItem(key);
      if (text && text.trim() && notesIndex.indexOf(lesson) < 0) notesIndex.push(lesson);
    }
  }
  if (notesIndex.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--muted);padding:16px;font-size:0.85rem">No notes yet. Use the ðŸ“ button during lessons to take notes.</div>';
    return;
  }
  container.innerHTML = notesIndex.map(function(lesson, idx) {
    const text = localStorage.getItem('politicsapp-notes-' + lesson) || '';
    if (!text.trim()) return '';
    const safeLesson = lesson.replace(/'/g, "\\'");
    return '<div class="writing-entry" id="note-entry-' + idx + '">' +
      '<div class="writing-entry-title" style="display:flex;justify-content:space-between;align-items:center">ðŸ“ ' + lesson +
      '<div style="display:flex;gap:6px">' +
      '<button class="note-action-btn" onclick="editNote(\'' + safeLesson + '\',' + idx + ')">Edit</button>' +
      '<button class="note-action-btn note-delete-btn" onclick="deleteNote(\'' + safeLesson + '\')">Delete</button>' +
      '</div></div>' +
      '<div class="writing-entry-text" id="note-text-' + idx + '">' + text.replace(/</g, '&lt;').replace(/\n/g, '<br>') + '</div>' +
      '</div>';
  }).filter(Boolean).join('');
}

function editNote(lesson, idx) {
  const textEl = document.getElementById('note-text-' + idx);
  if (!textEl) return;
  const currentText = localStorage.getItem('politicsapp-notes-' + lesson) || '';
  const safeLesson = lesson.replace(/'/g, "\\'");
  textEl.innerHTML = '<textarea class="notes-textarea" id="note-edit-' + idx + '" style="min-height:120px">' + currentText.replace(/</g, '&lt;') + '</textarea>' +
    '<div style="display:flex;gap:8px;margin-top:8px">' +
    '<button class="case-save-btn" onclick="saveEditedNote(\'' + safeLesson + '\',' + idx + ')">Save</button>' +
    '<button class="note-action-btn" onclick="renderMyNotes()">Cancel</button>' +
    '</div>';
}

function saveEditedNote(lesson, idx) {
  const ta = document.getElementById('note-edit-' + idx);
  if (!ta) return;
  localStorage.setItem('politicsapp-notes-' + lesson, ta.value);
  if (!ta.value.trim()) {
    deleteNote(lesson);
  } else {
    renderMyNotes();
  }
}

function deleteNote(lesson) {
  localStorage.removeItem('politicsapp-notes-' + lesson);
  const notesIndex = JSON.parse(localStorage.getItem('politicsapp-notes-index') || '[]');
  const idx = notesIndex.indexOf(lesson);
  if (idx >= 0) notesIndex.splice(idx, 1);
  localStorage.setItem('politicsapp-notes-index', JSON.stringify(notesIndex));
  renderMyNotes();
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TEXT SIZE (UDL)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function adjustTextSize(dir) {
  if (dir === 0) textSizeLevel = 0;
  else textSizeLevel = Math.max(-2, Math.min(3, textSizeLevel + dir));
  localStorage.setItem('politicsapp-text-size', textSizeLevel);
  applyTextSize();
}

function applyTextSize() {
  const reader = document.getElementById('lesson-content');
  if (!reader) return;
  // Remove all text-size classes
  reader.className = reader.className.replace(/text-size--?\d/g, '').trim();
  reader.classList.add('text-size-' + textSizeLevel);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EXPLAIN-IT-BACK (UDL)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function saveExplainBack(lessonName) {
  const safeId = lessonName.replace(/[^a-zA-Z0-9]/g, '');
  const textarea = document.getElementById('eb-textarea-' + safeId);
  if (!textarea) return;
  const value = textarea.value.trim();
  if (!value) return;

  // Save the text
  localStorage.setItem('politicsapp-explain-' + lessonName, value);

  // Save to the writings index (for My Writing section)
  const writings = JSON.parse(localStorage.getItem('politicsapp-writings-index') || '[]');
  const existing = writings.findIndex(w => w.lesson === lessonName);
  const entry = { lesson: lessonName, date: new Date().toISOString().split('T')[0] };
  if (existing >= 0) writings[existing] = entry;
  else writings.push(entry);
  localStorage.setItem('politicsapp-writings-index', JSON.stringify(writings));

  // Show saved indicator
  const el = document.getElementById('eb-save-' + safeId);
  if (el) {
    el.textContent = 'Saved!';
    el.style.color = 'var(--green)';
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => { el.textContent = ''; }, 2000);
  }

  addXP(10, 'Explain-it-back saved');
}

function renderMyWriting() {
  const container = document.getElementById('my-writing');
  if (!container) return;
  const writings = JSON.parse(localStorage.getItem('politicsapp-writings-index') || '[]');
  if (writings.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--muted);padding:20px;font-size:0.88rem">No writing yet. Use the "Explain It Back" section at the end of lessons to build your collection.</div>';
    return;
  }
  container.innerHTML = '<div style="margin-bottom:12px;font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:var(--primary)">My Writing â€” ' + writings.length + ' entries</div>' +
    writings.map(w => {
      const text = localStorage.getItem('politicsapp-explain-' + w.lesson) || '';
      return '<div class="writing-entry"><div class="writing-entry-title">' + w.lesson + '</div><div class="writing-entry-text">' + text.replace(/</g, '&lt;').replace(/\n/g, '<br>') + '</div><div class="writing-entry-date">Saved ' + w.date + '</div></div>';
    }).join('');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GOAL TRACKING (UDL)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function getWeekKey() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil((((now - start) / 86400000) + start.getDay() + 1) / 7);
  return now.getFullYear() + '-W' + week;
}

function updateGoal() {
  const target = parseInt(document.getElementById('goal-target').value) || 3;
  localStorage.setItem('politicsapp-goal-target', target);
  renderGoal();
}

function recordGoalProgress() {
  const weekKey = getWeekKey();
  const weekDone = JSON.parse(localStorage.getItem('politicsapp-week-' + weekKey) || '[]');
  const today = getTodayStr();
  if (!weekDone.includes(today + '-' + currentLessonName)) {
    weekDone.push(today + '-' + currentLessonName);
    localStorage.setItem('politicsapp-week-' + weekKey, JSON.stringify(weekDone));
  }
  renderGoal();
}

function renderGoal() {
  const target = parseInt(localStorage.getItem('politicsapp-goal-target') || '3');
  const weekKey = getWeekKey();
  const weekDone = JSON.parse(localStorage.getItem('politicsapp-week-' + weekKey) || '[]');
  const count = weekDone.length;
  const pct = Math.min(100, Math.round((count / target) * 100));

  const goalInput = document.getElementById('goal-target');
  const goalText = document.getElementById('goal-text');
  const goalFill = document.getElementById('goal-fill');
  if (goalInput) goalInput.value = target;
  if (goalText) goalText.textContent = count + ' / ' + target + ' this week' + (pct >= 100 ? ' â€” Goal met!' : '');
  if (goalFill) goalFill.style.width = pct + '%';
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CASE STUDIES (4C/ID)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

let currentCaseScaffold = 'guided';

function renderCasesList() {
  const list = document.getElementById('cases-list');
  if (!list || typeof caseStudies === 'undefined') return;
  list.innerHTML = caseStudies.map((c, i) => `<div class="case-card" onclick="openCase(${i})">
    <div class="case-card-unit">Unit ${c.unit}</div>
    <div class="case-card-title">${c.title}</div>
    <div class="case-card-concepts">${c.concepts.map(cc => '<span class="case-concept-tag">' + cc + '</span>').join('')}</div>
  </div>`).join('');
}

function openCase(idx) {
  const c = caseStudies[idx];
  if (!c) return;
  document.getElementById('cases-list').style.display = 'none';
  const reader = document.getElementById('case-reader');
  reader.style.display = 'block';
  currentCaseScaffold = 'guided';
  renderCaseContent(c);
}

function closeCase() {
  document.getElementById('cases-list').style.display = 'block';
  document.getElementById('case-reader').style.display = 'none';
}

function setCaseScaffold(level, caseId) {
  currentCaseScaffold = level;
  const c = caseStudies.find(cs => cs.id === caseId);
  if (c) renderCaseContent(c);
}

function renderCaseContent(c) {
  const reader = document.getElementById('case-reader');
  const savedResponse = localStorage.getItem('politicsapp-case-' + c.id) || '';

  let stepsHTML = '';
  if (currentCaseScaffold === 'guided') {
    stepsHTML = '<div class="case-steps">' + c.guided.map((s, i) =>
      '<div class="case-step"><div class="case-step-num">' + (i + 1) + '</div>' + s + '</div>'
    ).join('') + '</div>';
  } else if (currentCaseScaffold === 'supported') {
    stepsHTML = '<div class="case-steps">' + c.supported.map((s, i) =>
      '<div class="case-step"><div class="case-step-num">' + (i + 1) + '</div>' + s + '</div>'
    ).join('') + '</div>';
  } else {
    stepsHTML = '<div class="case-step" style="padding-left:18px;font-size:0.93rem">' + c.independent + '</div>';
  }

  reader.innerHTML = `<div class="case-reader">
    <button class="back-btn" onclick="closeCase()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>Back to cases</button>
    <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:6px;background:linear-gradient(90deg,var(--primary),#f0b060);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${c.title}</h2>
    <div class="case-card-concepts" style="margin-bottom:16px">${c.concepts.map(cc => '<span class="case-concept-tag">' + cc + '</span>').join('')}</div>
    <div class="case-scenario">${c.scenario}</div>
    <div class="case-scaffold-tabs">
      <button class="case-scaffold-btn${currentCaseScaffold === 'guided' ? ' active' : ''}" onclick="setCaseScaffold('guided','${c.id}')">Guided</button>
      <button class="case-scaffold-btn${currentCaseScaffold === 'supported' ? ' active' : ''}" onclick="setCaseScaffold('supported','${c.id}')">Supported</button>
      <button class="case-scaffold-btn${currentCaseScaffold === 'independent' ? ' active' : ''}" onclick="setCaseScaffold('independent','${c.id}')">Independent</button>
    </div>
    ${stepsHTML}
    <div class="case-response-area">
      <h3 style="font-size:0.85rem;font-weight:800;color:var(--primary);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Your Analysis</h3>
      <textarea class="case-response-textarea" placeholder="Write your analysis here..." oninput="localStorage.setItem('politicsapp-case-${c.id}',this.value)">${savedResponse.replace(/</g, '&lt;')}</textarea>
      <button class="case-save-btn" onclick="this.textContent='Saved!';setTimeout(()=>this.textContent='Save Progress',1500)">Save Progress</button>
    </div>
  </div>`;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// BLOOM'S RADAR CHART
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function renderBloomsRadar() {
  const container = document.getElementById('blooms-radar');
  if (!container || typeof bloomsLevels === 'undefined') return;

  // Count quiz answers per Bloom's level from storage
  const answered = JSON.parse(localStorage.getItem('politicsapp-bloom-answered') || '{}');
  const levels = bloomsLevels;
  const maxVal = Math.max(1, ...Object.values(answered));

  // Simple bar chart instead of full radar (more readable)
  let barsHTML = levels.map(l => {
    const count = answered[l.id] || 0;
    const pct = Math.round((count / maxVal) * 100);
    return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
      <span style="min-width:80px;font-size:0.75rem;font-weight:700;color:${l.color}">${l.icon} ${l.label}</span>
      <div style="flex:1;height:8px;background:var(--border);border-radius:99px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${l.color};border-radius:99px;transition:width 0.5s"></div>
      </div>
      <span style="font-size:0.72rem;font-weight:700;color:var(--muted);min-width:20px">${count}</span>
    </div>`;
  }).join('');

  container.innerHTML = `<div class="blooms-radar-wrap">
    <div class="blooms-radar-title">Bloom's Thinking Profile</div>
    <p style="font-size:0.78rem;color:var(--muted);margin-bottom:12px">Questions answered by cognitive level</p>
    ${barsHTML}
    <div class="blooms-radar-legend">${levels.map(l => '<span style="background:' + l.color + '20;color:' + l.color + '">' + l.label + '</span>').join('')}</div>
  </div>`;
}

// Track Bloom's level when answering quiz
function trackBloomAnswer(questionText) {
  if (typeof getBloomLevel === 'undefined') return;
  const level = getBloomLevel(questionText);
  const answered = JSON.parse(localStorage.getItem('politicsapp-bloom-answered') || '{}');
  answered[level] = (answered[level] || 0) + 1;
  localStorage.setItem('politicsapp-bloom-answered', JSON.stringify(answered));
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// INIT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// FLASHCARD FLIP TRACKING
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function trackFlip() {
  const totalFlips = parseInt(localStorage.getItem('politicsapp-flips') || '0') + 1;
  localStorage.setItem('politicsapp-flips', totalFlips);
  fcFlipsSession++;
  if (fcFlipsSession <= 20) {
    addXP(1, 'Card flip');
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GRAPH BUILDER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

var graphScenario = 'sd';
var graphDemandShift = 0;
var graphSupplyShift = 0;
var graphPriceLine = 200;
var graphDragging = null;
var graphDragStartY = 0;
var graphDragStartVal = 0;

var graphScenarios = [
  { id: 'sd', label: 'Supply & Demand' },
  { id: 'dshift', label: 'Demand Shift' },
  { id: 'sshift', label: 'Supply Shift' },
  { id: 'ceiling', label: 'Price Ceiling' },
  { id: 'floor', label: 'Price Floor' }
];

function initGraphBuilder() {
  var scenEl = document.getElementById('graph-scenarios');
  scenEl.innerHTML = graphScenarios.map(function(s) {
    return '<button class="graph-scenario-btn' + (s.id === graphScenario ? ' active' : '') + '" onclick="setGraphScenario(\'' + s.id + '\')">' + s.label + '</button>';
  }).join('');
  buildGraphControls();
  drawGraph();
  setupGraphDrag();
}

function setGraphScenario(id) {
  graphScenario = id;
  graphDemandShift = 0;
  graphSupplyShift = 0;
  graphPriceLine = 200;
  initGraphBuilder();
}

function buildGraphControls() {
  var ctrl = document.getElementById('graph-controls');
  var html = '';
  if (graphScenario === 'sd' || graphScenario === 'dshift' || graphScenario === 'sshift') {
    html += '<div class="graph-slider-row"><label>Demand Shift</label><input type="range" min="-100" max="100" value="' + graphDemandShift + '" id="graph-demand-slider" oninput="graphDemandShift=parseInt(this.value);document.getElementById(\'demand-val\').textContent=this.value;drawGraph()"><span class="slider-val" id="demand-val">' + graphDemandShift + '</span></div>';
    html += '<div class="graph-slider-row"><label>Supply Shift</label><input type="range" min="-100" max="100" value="' + graphSupplyShift + '" id="graph-supply-slider" oninput="graphSupplyShift=parseInt(this.value);document.getElementById(\'supply-val\').textContent=this.value;drawGraph()"><span class="slider-val" id="supply-val">' + graphSupplyShift + '</span></div>';
  } else if (graphScenario === 'ceiling') {
    html += '<div class="graph-slider-row"><label>Price Ceiling</label><input type="range" min="60" max="340" value="' + graphPriceLine + '" id="graph-price-slider" oninput="graphPriceLine=parseInt(this.value);document.getElementById(\'price-val\').textContent=this.value;drawGraph()"><span class="slider-val" id="price-val">' + graphPriceLine + '</span></div>';
  } else if (graphScenario === 'floor') {
    html += '<div class="graph-slider-row"><label>Price Floor</label><input type="range" min="60" max="340" value="' + graphPriceLine + '" id="graph-price-slider" oninput="graphPriceLine=parseInt(this.value);document.getElementById(\'price-val\').textContent=this.value;drawGraph()"><span class="slider-val" id="price-val">' + graphPriceLine + '</span></div>';
  }
  ctrl.innerHTML = html;
}

function drawGraph() {
  var canvas = document.getElementById('graph-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var pad = 50;
  var gW = W - pad * 2, gH = H - pad * 2;
  ctx.clearRect(0, 0, W, H);

  // Axes
  ctx.strokeStyle = '#b5a48a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, pad - 10);
  ctx.lineTo(pad, H - pad);
  ctx.lineTo(W - pad + 10, H - pad);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#b5a48a';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Quantity', W / 2, H - 10);
  ctx.save();
  ctx.translate(15, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Price', 0, 0);
  ctx.restore();

  // Compute line positions
  var dShift = graphDemandShift * 0.8;
  var sShift = graphSupplyShift * 0.8;

  // Original demand: from (pad, pad) to (pad+gW, pad+gH) -- top-left to bottom-right
  // Actually demand slopes down: high price at low Q
  // demand: P = maxP - slope*Q + shift => line from top-left to bottom-right
  // supply: P = minP + slope*Q + shift => line from bottom-left to top-right

  function demandY(x, shift) { return pad + (x - pad) * (gH / gW) - shift; }
  function supplyY(x, shift) { return (H - pad) - (x - pad) * (gH / gW) + shift; }

  // Ghost lines (original positions) if shifted
  if (dShift !== 0 || sShift !== 0) {
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.3;
    // Original demand
    ctx.strokeStyle = '#6eb5ff';
    ctx.beginPath();
    ctx.moveTo(pad, demandY(pad, 0));
    ctx.lineTo(pad + gW, demandY(pad + gW, 0));
    ctx.stroke();
    // Original supply
    ctx.strokeStyle = '#ff6e6e';
    ctx.beginPath();
    ctx.moveTo(pad, supplyY(pad, 0));
    ctx.lineTo(pad + gW, supplyY(pad + gW, 0));
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
  }

  // Demand curve (blue)
  ctx.strokeStyle = '#6eb5ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pad, demandY(pad, dShift));
  ctx.lineTo(pad + gW, demandY(pad + gW, dShift));
  ctx.stroke();
  // D label
  ctx.fillStyle = '#6eb5ff';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillText('D' + (dShift !== 0 ? "'" : ''), pad + gW + 5, demandY(pad + gW, dShift) + 5);

  // Supply curve (red)
  ctx.strokeStyle = '#ff6e6e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pad, supplyY(pad, sShift));
  ctx.lineTo(pad + gW, supplyY(pad + gW, sShift));
  ctx.stroke();
  // S label
  ctx.fillStyle = '#ff6e6e';
  ctx.fillText('S' + (sShift !== 0 ? "'" : ''), pad + gW + 5, supplyY(pad + gW, sShift) + 5);

  // Equilibrium: where demand = supply
  // demandY = supplyY => pad + (x-pad)*(gH/gW) - dShift = (H-pad) - (x-pad)*(gH/gW) + sShift
  // 2*(x-pad)*(gH/gW) = gH + sShift + dShift
  // (x-pad) = (gH + sShift + dShift) / (2 * gH/gW) = (gH + sShift + dShift) * gW / (2*gH)
  var eqXoff = (gH + sShift + dShift) * gW / (2 * gH);
  var eqX = pad + eqXoff;
  var eqY = demandY(eqX, dShift);

  // Clamp to graph area
  if (eqX >= pad && eqX <= pad + gW && eqY >= pad && eqY <= H - pad) {
    // Dashed lines to axes
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(eqX, eqY);
    ctx.lineTo(eqX, H - pad);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eqX, eqY);
    ctx.lineTo(pad, eqY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Equilibrium dot
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(eqX, eqY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Q*', eqX, H - pad + 16);
    ctx.textAlign = 'right';
    ctx.fillText('P*', pad - 8, eqY + 4);
  }

  // Price ceiling / floor
  if (graphScenario === 'ceiling' || graphScenario === 'floor') {
    var pLineY = H - pad - (graphPriceLine / 400) * gH;
    ctx.setLineDash([8, 5]);
    ctx.strokeStyle = graphScenario === 'ceiling' ? '#f5c842' : '#e8893c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pad, pLineY);
    ctx.lineTo(pad + gW, pLineY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(graphScenario === 'ceiling' ? 'Ceiling' : 'Floor', pad + gW - 45, pLineY - 8);

    // Find Qs and Qd at that price
    // At price pLineY: demand x where demandY(x,dShift)=pLineY and supply x where supplyY(x,sShift)=pLineY
    var qdX = pad + (pLineY - pad + dShift) * gW / gH;
    var qsX = pad + (H - pad - pLineY + sShift) * gW / gH;

    if (qdX > pad && qsX > pad && qdX < pad + gW && qsX < pad + gW) {
      // Shade shortage or surplus area
      ctx.globalAlpha = 0.15;
      if (graphScenario === 'ceiling' && pLineY > eqY) {
        // Below equilibrium: shortage (Qd > Qs)
        ctx.fillStyle = '#e05a5a';
        ctx.fillRect(Math.min(qsX, qdX), pLineY - 15, Math.abs(qdX - qsX), 30);
      } else if (graphScenario === 'floor' && pLineY < eqY) {
        // Above equilibrium: surplus (Qs > Qd)
        ctx.fillStyle = '#6eb5ff';
        ctx.fillRect(Math.min(qdX, qsX), pLineY - 15, Math.abs(qsX - qdX), 30);
      }
      ctx.globalAlpha = 1;
    }
  }

  updateGraphExplanation(eqX, eqY, pad, gW, gH, H);
}

function updateGraphExplanation(eqX, eqY, pad, gW, gH, H) {
  var el = document.getElementById('graph-explanation');
  if (!el) return;
  var eqPrice = Math.round(((H - pad - eqY) / gH) * 100);
  var eqQty = Math.round(((eqX - pad) / gW) * 100);
  var origPrice = 50, origQty = 50;
  var html = '';

  if (graphScenario === 'sd') {
    if (graphDemandShift === 0 && graphSupplyShift === 0) {
      html = 'Equilibrium where supply meets demand. Use the sliders to shift the curves and see how price and quantity change.';
    } else {
      var pDir = eqPrice > origPrice ? 'rises' : eqPrice < origPrice ? 'falls' : 'stays the same';
      var qDir = eqQty > origQty ? 'rises' : eqQty < origQty ? 'falls' : 'stays the same';
      var pClass = eqPrice > origPrice ? 'increase' : eqPrice < origPrice ? 'decrease' : '';
      var qClass = eqQty > origQty ? 'increase' : eqQty < origQty ? 'decrease' : '';
      html = 'Equilibrium price <span class="' + pClass + '">' + pDir + '</span> to ~' + eqPrice + ', quantity <span class="' + qClass + '">' + qDir + '</span> to ~' + eqQty + '.';
    }
  } else if (graphScenario === 'dshift') {
    if (graphDemandShift > 0) html = 'Demand <span class="increase">increased</span> &rarr; equilibrium price <span class="increase">rises</span> and quantity <span class="increase">rises</span>.';
    else if (graphDemandShift < 0) html = 'Demand <span class="decrease">decreased</span> &rarr; equilibrium price <span class="decrease">falls</span> and quantity <span class="decrease">falls</span>.';
    else html = 'Shift the demand curve to see how equilibrium changes.';
  } else if (graphScenario === 'sshift') {
    if (graphSupplyShift > 0) html = 'Supply <span class="increase">increased</span> &rarr; equilibrium price <span class="decrease">falls</span> and quantity <span class="increase">rises</span>.';
    else if (graphSupplyShift < 0) html = 'Supply <span class="decrease">decreased</span> &rarr; equilibrium price <span class="increase">rises</span> and quantity <span class="decrease">falls</span>.';
    else html = 'Shift the supply curve to see how equilibrium changes.';
  } else if (graphScenario === 'ceiling') {
    var cPrice = Math.round((graphPriceLine / 400) * 100);
    if (cPrice < eqPrice) html = 'Price ceiling at ~' + cPrice + ' is <span class="decrease">below equilibrium</span> (~' + eqPrice + '). This creates a <span class="decrease">shortage</span> &mdash; quantity demanded exceeds quantity supplied.';
    else html = 'Price ceiling at ~' + cPrice + ' is above equilibrium (~' + eqPrice + '). The ceiling is <span class="increase">not binding</span> &mdash; the market operates normally.';
  } else if (graphScenario === 'floor') {
    var fPrice = Math.round((graphPriceLine / 400) * 100);
    if (fPrice > eqPrice) html = 'Price floor at ~' + fPrice + ' is <span class="increase">above equilibrium</span> (~' + eqPrice + '). This creates a <span class="increase">surplus</span> &mdash; quantity supplied exceeds quantity demanded.';
    else html = 'Price floor at ~' + fPrice + ' is below equilibrium (~' + eqPrice + '). The floor is <span class="increase">not binding</span> &mdash; the market operates normally.';
  }
  el.innerHTML = html;
}

function setupGraphDrag() {
  var canvas = document.getElementById('graph-canvas');
  if (!canvas) return;
  canvas.style.cursor = 'grab';
  var pad = 50, gW = canvas.width - pad * 2, gH = canvas.height - pad * 2;

  function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function onDown(e) {
    e.preventDefault();
    var pos = getMousePos(e);
    var dShift = graphDemandShift * 0.8;
    var sShift = graphSupplyShift * 0.8;
    function demandY(x) { return pad + (x - pad) * (gH / gW) - dShift; }
    function supplyY(x) { return (canvas.height - pad) - (x - pad) * (gH / gW) + sShift; }
    var dy = Math.abs(pos.y - demandY(pos.x));
    var sy = Math.abs(pos.y - supplyY(pos.x));
    if (dy < 20 && dy < sy) { graphDragging = 'demand'; graphDragStartY = pos.y; graphDragStartVal = graphDemandShift; canvas.style.cursor = 'grabbing'; }
    else if (sy < 20) { graphDragging = 'supply'; graphDragStartY = pos.y; graphDragStartVal = graphSupplyShift; canvas.style.cursor = 'grabbing'; }
  }
  function onMove(e) {
    if (!graphDragging) return;
    e.preventDefault();
    var pos = getMousePos(e);
    var delta = Math.round((graphDragStartY - pos.y) / 0.8);
    if (graphDragging === 'demand') {
      graphDemandShift = Math.max(-100, Math.min(100, graphDragStartVal + delta));
      var sl = document.getElementById('graph-demand-slider');
      if (sl) { sl.value = graphDemandShift; }
      var vl = document.getElementById('demand-val');
      if (vl) { vl.textContent = graphDemandShift; }
    } else if (graphDragging === 'supply') {
      graphSupplyShift = Math.max(-100, Math.min(100, graphDragStartVal + delta));
      var sl2 = document.getElementById('graph-supply-slider');
      if (sl2) { sl2.value = graphSupplyShift; }
      var vl2 = document.getElementById('supply-val');
      if (vl2) { vl2.textContent = graphSupplyShift; }
    }
    drawGraph();
  }
  function onUp() {
    graphDragging = null;
    canvas.style.cursor = 'grab';
  }

  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseup', onUp);
  canvas.addEventListener('mouseleave', onUp);
  canvas.addEventListener('touchstart', onDown, { passive: false });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onUp);
}

// Responsive canvas resize
function resizeGraphCanvas() {
  var canvas = document.getElementById('graph-canvas');
  if (!canvas) return;
  var container = canvas.parentElement;
  var w = Math.min(400, container.clientWidth - 32);
  canvas.width = w;
  canvas.height = w;
  if (document.getElementById('tab-graphs') && document.getElementById('tab-graphs').classList.contains('active')) {
    drawGraph();
  }
}
window.addEventListener('resize', resizeGraphCanvas);

buildList();
updateProgress();
buildQuizFilter();
startQuiz();
renderGlossary();
initFlashcards();
checkStreak();
updateXPDisplay();
renderBadges();
renderGoal();
renderCasesList();
loadApiKeyUI();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// INTERACTIVE DEMOS (Diagrams tab)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// 1) STROOP TEST
const STROOP_COLORS = [
  { name: 'red',    hex: '#e05a5a' },
  { name: 'green',  hex: '#4ade80' },
  { name: 'blue',   hex: '#5b9ef0' },
  { name: 'yellow', hex: '#f5c842' }
];
let stroopState = null;

function startStroop() {
  stroopState = { trial: 0, total: 20, correct: 0, startTime: Date.now() };
  document.getElementById('stroop-buttons').style.display = 'flex';
  document.getElementById('stroop-start').style.display = 'none';
  document.getElementById('stroop-result').innerHTML = '';
  document.querySelectorAll('.stroop-btn').forEach(btn => {
    btn.onclick = () => stroopAnswer(btn.dataset.color);
  });
  nextStroopTrial();
}
function nextStroopTrial() {
  if (stroopState.trial >= stroopState.total) return endStroop();
  const wordPick = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
  let inkPick = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
  if (Math.random() < 0.7) {
    while (inkPick.name === wordPick.name) {
      inkPick = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    }
  }
  stroopState.currentInk = inkPick.name;
  const wordEl = document.getElementById('stroop-word');
  wordEl.textContent = wordPick.name.toUpperCase();
  wordEl.style.color = inkPick.hex;
  document.getElementById('stroop-progress').textContent = (stroopState.trial + 1) + ' / ' + stroopState.total;
}
function stroopAnswer(color) {
  if (!stroopState) return;
  if (color === stroopState.currentInk) stroopState.correct++;
  stroopState.trial++;
  nextStroopTrial();
}
function endStroop() {
  const elapsed = Math.round((Date.now() - stroopState.startTime) / 100) / 10;
  const acc = Math.round((stroopState.correct / stroopState.total) * 100);
  const avgPerItem = (elapsed / stroopState.total).toFixed(2);
  document.getElementById('stroop-buttons').style.display = 'none';
  document.getElementById('stroop-start').style.display = 'block';
  document.getElementById('stroop-start').textContent = 'Try Again';
  document.getElementById('stroop-word').textContent = 'Done!';
  document.getElementById('stroop-word').style.color = '';
  document.getElementById('stroop-progress').textContent = '';
  let comment = '';
  if (avgPerItem < 1.0) comment = 'Very fast â€” you handled the interference well.';
  else if (avgPerItem < 1.6) comment = 'Typical range â€” most adults take ~1â€“1.5 sec per item due to Stroop interference.';
  else comment = 'Slower than average â€” interference from the printed word is real.';
  document.getElementById('stroop-result').innerHTML =
    '<div style="padding:14px;background:var(--primary-light);border-radius:10px;border:1px solid var(--primary)">' +
    '<div style="font-weight:800;color:var(--primary);margin-bottom:6px">Results</div>' +
    '<div style="font-size:0.88rem;line-height:1.6">' +
    'Accuracy: <strong>' + acc + '%</strong> Â· Avg ' + avgPerItem + ' sec/item Â· Total ' + elapsed + ' sec' +
    '<br><span style="color:var(--muted);font-size:0.82rem">' + comment + '</span>' +
    '</div></div>';
  stroopState = null;
}

// 2) REACTION TIME
let rxnState = null;
function startRxn() {
  rxnState = { trial: 0, total: 5, times: [], waiting: false };
  document.getElementById('rxn-start').style.display = 'none';
  document.getElementById('rxn-result').innerHTML = '';
  rxnNext();
}
function rxnNext() {
  if (rxnState.trial >= rxnState.total) return rxnEnd();
  const area = document.getElementById('rxn-area');
  area.style.background = '#e05a5a';
  area.style.color = '#fff';
  area.textContent = 'Wait for green... (Trial ' + (rxnState.trial + 1) + ' / ' + rxnState.total + ')';
  rxnState.waiting = true;
  rxnState.early = false;
  const delay = 1000 + Math.random() * 4000;
  rxnState.timer = setTimeout(() => {
    if (rxnState.early) return;
    area.style.background = '#4ade80';
    area.style.color = '#1f1a2e';
    area.textContent = 'CLICK NOW!';
    rxnState.greenAt = Date.now();
    rxnState.waiting = false;
  }, delay);
}
function rxnClick() {
  if (!rxnState) return;
  const area = document.getElementById('rxn-area');
  if (rxnState.waiting) {
    rxnState.early = true;
    clearTimeout(rxnState.timer);
    area.style.background = '#f5c842';
    area.style.color = '#1f1a2e';
    area.textContent = 'Too early! Trial repeating...';
    setTimeout(rxnNext, 1200);
    return;
  }
  if (rxnState.greenAt) {
    const ms = Date.now() - rxnState.greenAt;
    rxnState.times.push(ms);
    rxnState.greenAt = null;
    rxnState.trial++;
    area.style.background = '#5b9ef0';
    area.style.color = '#fff';
    area.textContent = ms + ' ms';
    setTimeout(rxnNext, 900);
  }
}
function rxnEnd() {
  const t = rxnState.times;
  const avg = Math.round(t.reduce((a, b) => a + b, 0) / t.length);
  const fastest = Math.min.apply(null, t);
  let band = 'Average for adults';
  if (avg < 200) band = 'Very fast';
  else if (avg < 250) band = 'Faster than average';
  else if (avg > 350) band = 'Slower than average â€” try again rested';
  const area = document.getElementById('rxn-area');
  area.style.background = '#5b9ef0';
  area.style.color = '#fff';
  area.textContent = 'Done!';
  document.getElementById('rxn-start').style.display = 'block';
  document.getElementById('rxn-start').textContent = 'Try Again';
  document.getElementById('rxn-result').innerHTML =
    '<div style="padding:14px;background:var(--primary-light);border-radius:10px;border:1px solid var(--primary)">' +
    '<div style="font-weight:800;color:var(--primary);margin-bottom:6px">Results</div>' +
    '<div style="font-size:0.88rem;line-height:1.6">' +
    'Trials: ' + t.map(function(x){return x + 'ms';}).join(', ') + '<br>' +
    '<strong>Average: ' + avg + ' ms</strong> Â· Fastest: ' + fastest + ' ms<br>' +
    '<span style="color:var(--muted);font-size:0.82rem">' + band + '. Typical adult range: 200â€“300 ms. Reaction time involves a full perception â†’ decision â†’ motor chain.</span>' +
    '</div></div>';
  rxnState = null;
}

// 3) DIGIT SPAN
let digitState = null;
function startDigitSpan() {
  digitState = { length: 3, sequence: [], showing: false, history: [] };
  document.getElementById('digit-start').style.display = 'none';
  document.getElementById('digit-result').innerHTML = '';
  digitNextRound();
}
function digitNextRound() {
  digitState.sequence = [];
  for (let i = 0; i < digitState.length; i++) {
    digitState.sequence.push(Math.floor(Math.random() * 10));
  }
  digitState.showing = true;
  document.getElementById('digit-input-row').style.display = 'none';
  showDigitsSequentially(0);
}
function showDigitsSequentially(idx) {
  const display = document.getElementById('digit-display');
  if (idx >= digitState.sequence.length) {
    display.textContent = '?';
    display.style.color = 'var(--primary)';
    digitState.showing = false;
    const row = document.getElementById('digit-input-row');
    row.style.display = 'flex';
    const inp = document.getElementById('digit-input');
    inp.value = '';
    inp.focus();
    return;
  }
  display.style.color = 'var(--text)';
  display.textContent = digitState.sequence[idx];
  setTimeout(function() {
    display.textContent = '';
    setTimeout(function() { showDigitsSequentially(idx + 1); }, 250);
  }, 800);
}
function submitDigits() {
  if (!digitState || digitState.showing) return;
  const inp = document.getElementById('digit-input');
  const guess = inp.value.replace(/\D/g, '');
  const truth = digitState.sequence.join('');
  digitState.history.push({ length: digitState.length, correct: guess === truth, truth: truth, guess: guess });
  if (guess === truth) {
    digitState.length++;
    if (digitState.length > 12) return digitEnd();
    digitNextRound();
  } else {
    digitEnd();
  }
}
function digitEnd() {
  const winsArr = digitState.history.filter(function(h){return h.correct;});
  const maxSpan = winsArr.length > 0 ? Math.max.apply(null, winsArr.map(function(h){return h.length;})) : 2;
  document.getElementById('digit-display').textContent = 'âœ“';
  document.getElementById('digit-display').style.color = 'var(--green)';
  document.getElementById('digit-input-row').style.display = 'none';
  document.getElementById('digit-start').style.display = 'block';
  document.getElementById('digit-start').textContent = 'Try Again';
  let comment = '';
  if (maxSpan >= 9) comment = 'Above average â€” strong working memory.';
  else if (maxSpan >= 6) comment = 'Typical range â€” Miller\'s "magical 7 Â± 2" centers here.';
  else if (maxSpan >= 4) comment = 'On the lower end of normal range.';
  else comment = 'Try again â€” distractions, anxiety, and tiredness all reduce the apparent span.';
  const last = digitState.history[digitState.history.length - 1];
  document.getElementById('digit-result').innerHTML =
    '<div style="padding:14px;background:var(--primary-light);border-radius:10px;border:1px solid var(--primary)">' +
    '<div style="font-weight:800;color:var(--primary);margin-bottom:6px">Your span: ' + maxSpan + ' digits</div>' +
    '<div style="font-size:0.88rem;color:var(--muted);line-height:1.6">' + comment +
    '<br><span style="font-size:0.78rem">Last sequence: <strong>' + (last ? last.truth : '') + '</strong>' +
    ' Â· Your guess: <strong>' + (last ? last.guess : '') + '</strong></span></div></div>';
  digitState = null;
}

// 4) MÃœLLER-LYER
function adjustMueller(val) {
  const v = parseInt(val);
  const half = v / 2;
  const center = 200;
  const x1 = center - half, x2 = center + half;
  document.getElementById('muller-bottom').setAttribute('x1', x1);
  document.getElementById('muller-bottom').setAttribute('x2', x2);
  const bl1 = document.getElementById('muller-bl1');
  const bl2 = document.getElementById('muller-bl2');
  const br1 = document.getElementById('muller-br1');
  const br2 = document.getElementById('muller-br2');
  bl1.setAttribute('x1', x1); bl1.setAttribute('x2', x1 - 15);
  bl2.setAttribute('x1', x1); bl2.setAttribute('x2', x1 - 15);
  br1.setAttribute('x1', x2); br1.setAttribute('x2', x2 + 15);
  br2.setAttribute('x1', x2); br2.setAttribute('x2', x2 + 15);
  document.getElementById('muller-result').textContent = 'Your line: ' + v + 'px (top reference: 200px)';
}
function revealMueller() {
  const v = parseInt(document.getElementById('muller-slider').value);
  const diff = v - 200;
  const direction = diff > 0 ? 'longer' : (diff < 0 ? 'shorter' : 'identical');
  let comment;
  if (Math.abs(diff) <= 5) comment = 'Within Â±5px â€” you mostly resisted the illusion.';
  else if (diff < 0) comment = 'You set it ' + Math.abs(diff) + 'px shorter than the reference â€” exactly what the illusion predicts. Outward arrowheads make a line look longer, so you compensated.';
  else comment = 'You set it ' + diff + 'px longer than the reference. Unusual â€” the standard MÃ¼ller-Lyer illusion goes the other way.';
  document.getElementById('muller-result').innerHTML =
    '<strong>Top line: 200 px Â· Your line: ' + v + ' px (' + direction + ' by ' + Math.abs(diff) + ' px)</strong><br>' +
    '<span style="color:var(--muted);font-size:0.82rem">' + comment + ' Your visual system applies depth-cue heuristics automatically â€” and you can\'t simply turn them off.</span>';
}

// ═══════════════════════════════════════════
// DEEP-LINK HANDLER
// Opens a specific tab on load when launched with ?tab=<id>
// Used by PWA manifest shortcuts (lessons / quiz / flashcards).
// ═══════════════════════════════════════════
(function () {
  const tab = new URLSearchParams(location.search).get('tab');
  if (!tab) return;
  const run = () => {
    const btn = Array.from(document.querySelectorAll('.tab-btn'))
      .find(b => (b.getAttribute('onclick') || '').includes("showTab('" + tab + "'"));
    if (btn) btn.click();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
