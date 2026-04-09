// ═══════════════════════════
// STATE
// ═══════════════════════════
const KEY = 'fw3';
let S = {
    activeCh: 0,
    chapters: [{ title: 'Chapter One', text: '', words: 0, status: 'writing' }],
    timeline: [], promises: [], characters: [],
    notes: [],
    trash: [],
    aic: [
        { text: 'Every scene ends with a cliffhanger.', on: true },
        { text: 'Protagonist: Instinct → Assess → Response.', on: true },
        { text: 'Magic: Intention → Action → Effect → Conclusion → Reaction.', on: true },
        { text: 'Paragraph: Idea + Justification + (Opposite) + Conclusion.', on: true },
        { text: 'Scene: Objective → Conflict → Disaster → Reaction → Dilemma → Decision.', on: true },
    ]
};
function load() { try { const d = localStorage.getItem(KEY); if (d) S = { ...S, ...JSON.parse(d) }; } catch (e) { } }
let saveT;
function save() {
    clearTimeout(saveT);
    saveT = setTimeout(() => {
        localStorage.setItem(KEY, JSON.stringify(S));
        const dot = document.getElementById('save-dot');
        dot.classList.add('saved');
        setTimeout(() => dot.classList.remove('saved'), 1400);
    }, 600);
}
load();

// ═══════════════════════════
// DRAWER STATE
// ═══════════════════════════

const midDrawer = document.getElementById('mid-drawer');
const rightDrawer = document.getElementById('right-drawer');
const overlay = document.getElementById('overlay');

function openMid() {
    midDrawer.classList.add('open');
    overlay.classList.add('show');
    document.body.classList.add('menu-active');
}

function closeMid() {
    midDrawer.classList.remove('open');
    overlay.classList.remove('show');
    document.body.classList.remove('menu-active');
}

function openRight() {
    rightDrawer.classList.add('open');
}

function closeRight() {
    rightDrawer.classList.remove('open');
}

function openRight() {
    rightDrawer.classList.add('open');
    midDrawer.classList.add('methods-open');
    renderAIC();
}

function closeRight() {
    rightDrawer.classList.remove('open');
    midDrawer.classList.remove('methods-open');
}

document.getElementById('fold-btn').addEventListener('click', () => openMid());
overlay.addEventListener('click', () => closeMid());
document.getElementById('mid-left-edge').addEventListener('click', () => openRight());

//  DRAG LOGIC 

// mid-right-edge → Arrastar para ESQUERDA = apenas FECHAR mid-drawer
let midRightDrag = null;
const midRightEdge = document.getElementById('mid-right-edge');

midRightEdge.addEventListener('mousedown', e => { midRightDrag = e.clientX; e.stopPropagation(); });
midRightEdge.addEventListener('touchstart', e => { midRightDrag = e.touches[0].clientX; e.stopPropagation(); }, { passive: true });

document.addEventListener('mousemove', e => {
    if (midRightDrag !== null && e.clientX - midRightDrag < -40) {
        midRightDrag = null;
        closeMid();
    }
});
document.addEventListener('touchmove', e => {
    if (midRightDrag !== null && e.touches[0].clientX - midRightDrag < -40) {
        midRightDrag = null;
        closeMid();
    }
}, { passive: true });

// mid-left-edge → Arrastar DIREITA = ABRE Methods | Arrastar ESQUERDA = FECHA Methods
let midLeftDrag = null;
const midLeftEdge = document.getElementById('mid-left-edge');

midLeftEdge.addEventListener('mousedown', e => { midLeftDrag = e.clientX; e.stopPropagation(); });
midLeftEdge.addEventListener('touchstart', e => { midLeftDrag = e.touches[0].clientX; e.stopPropagation(); }, { passive: true });

document.addEventListener('mousemove', e => {
    if (midLeftDrag !== null) {
        const diff = e.clientX - midLeftDrag;
        if (diff > 50) {
            midLeftDrag = null;
            openRight();
        } else if (diff < -50) {
            midLeftDrag = null;
            closeRight();
        }
    }
});

document.addEventListener('touchmove', e => {
    if (midLeftDrag !== null) {
        const diff = e.touches[0].clientX - midLeftDrag;
        if (diff > 50) {
            midLeftDrag = null;
            openRight();
        } else if (diff < -50) {
            midLeftDrag = null;
            closeRight();
        }
    }
}, { passive: true });

// right-left-edge (borda direita do Methods) → arrastar para direita = FECHA Methods
let rightLeftDrag = null;
const rightLeftEdge = document.getElementById('right-left-edge');

rightLeftEdge.addEventListener('mousedown', e => { rightLeftDrag = e.clientX; e.stopPropagation(); });
rightLeftEdge.addEventListener('touchstart', e => { rightLeftDrag = e.touches[0].clientX; e.stopPropagation(); }, { passive: true });

document.addEventListener('mousemove', e => {
    if (rightLeftDrag !== null && e.clientX - rightLeftDrag > 40) {
        rightLeftDrag = null;
        closeRight();
    }
});
document.addEventListener('touchmove', e => {
    if (rightLeftDrag !== null && e.touches[0].clientX - rightLeftDrag > 40) {
        rightLeftDrag = null;
        closeRight();
    }
}, { passive: true });

// Limpar ao soltar
document.addEventListener('mouseup', () => {
    midLeftDrag = null;
    midRightDrag = null;
    rightLeftDrag = null;
});
document.addEventListener('touchend', () => {
    midLeftDrag = null;
    midRightDrag = null;
    rightLeftDrag = null;
});

// ═══════════════════════════
// DETAIL OVERLAY
// ═══════════════════════════
const detOverlay = document.getElementById('detail-overlay');
const detTitle = document.getElementById('det-title');
const detScroll = document.getElementById('det-scroll');
const detAddBtn = document.getElementById('det-add-btn');
let currentSection = null;

function openDetail(section) {
    currentSection = section;
    const titles = { chapters: 'Chapters', timeline: 'Timeline', promises: 'Promises (PPP)', characters: 'Characters' };
    detTitle.textContent = titles[section] || section;
    renderDetail(section);
    detOverlay.classList.add('open');
    closeMid();
    updateTrashBadge();
}
function closeDetail() { detOverlay.classList.remove('open'); }

document.getElementById('det-back').addEventListener('click', () => { closeDetail(); openMid(); });
document.getElementById('btn-chapters').addEventListener('click', () => openDetail('chapters'));
document.getElementById('btn-timeline').addEventListener('click', () => openDetail('timeline'));
document.getElementById('btn-promises').addEventListener('click', () => {
    // Garante que existe exatamente 1 bloco de promises
    if (!S.promises || !Array.isArray(S.promises) || S.promises.length === 0) {
        S.promises = [{ title: 'Promises', text: '' }];
        save();
    }
    closeMid();
    currentSection = 'promises';
    openItemView('promises', 0);
});
document.getElementById('btn-characters').addEventListener('click', () => openDetail('characters'));

detAddBtn.addEventListener('click', () => {
    if (currentSection === 'chapters') {
        S.chapters.push({ title: 'Chapter ' + (S.chapters.length + 1), text: '', words: 0, status: 'draft' });
        renderDetail(currentSection); updateCounts(); save();
    } else {
        const item = { title: '', text: '' };
        S[currentSection].push(item);
        const idx = S[currentSection].length - 1;
        updateCounts(); save();
        renderDetail(currentSection);
        openItemView(currentSection, idx);
    }
});

function renderDetail(s) {
    detScroll.innerHTML = '';
    if (s === 'chapters') renderChapters();
    else if (s === 'timeline') renderTimeline();
    else if (s === 'promises') renderPromises();
    else if (s === 'characters') renderCharacters();
}

// ═══════════════════════════
// ADD FILE MODAL  (nome da nota)
// ═══════════════════════════
const addModal = document.getElementById('add-modal');
const newNoteName = document.getElementById('new-note-name');

document.getElementById('add-file-btn').addEventListener('click', () => {
    newNoteName.value = '';
    addModal.classList.add('show');
    setTimeout(() => newNoteName.focus(), 120);
});

document.getElementById('modal-cancel').addEventListener('click', () => {
    addModal.classList.remove('show');
});

function confirmNewNote() {
    const name = newNoteName.value.trim() || 'Note';
    addModal.classList.remove('show');
    S.notes.push({ title: name, text: '' });
    const newIdx = S.notes.length - 1;
    renderNotes(); save();
    openNoteView(newIdx);
}

document.getElementById('modal-confirm').addEventListener('click', confirmNewNote);

newNoteName.addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmNewNote();
    if (e.key === 'Escape') addModal.classList.remove('show');
});

// ═══════════════════════════
// EDITOR (contenteditable)
// ═══════════════════════════
const wa = document.getElementById('write-area');

// ── Undo stack ───────────────────────────────────────────
// Each entry = plain text snapshot. We push when the user
// pauses typing (500 ms) or performs a big delete.
let undoStack = [];        // array of plain-text strings
let undoPointer = -1;      // current position in stack
let undoPushT = null;
const UNDO_MAX = 200;

function undoPush(text) {
    // Trim everything after current pointer (branch)
    undoStack = undoStack.slice(0, undoPointer + 1);
    // Avoid pushing duplicate
    if (undoStack[undoPointer] === text) return;
    undoStack.push(text);
    if (undoStack.length > UNDO_MAX) undoStack.shift();
    undoPointer = undoStack.length - 1;
    updateUndoBtn();
}

function scheduleUndoPush() {
    clearTimeout(undoPushT);
    undoPushT = setTimeout(() => undoPush(getPlainText()), 500);
}

function undoStep() {
    if (undoPointer <= 0) return;
    undoPointer--;
    const text = undoStack[undoPointer];
    setPlainText(text);
    // persist
    if (S.chapters[S.activeCh]) {
        S.chapters[S.activeCh].text = text;
        S.chapters[S.activeCh].status = 'writing';
    }
    updateWC(); updateCounts(); save();
    clearGrammarMarks();
    updateUndoBtn();
}

function updateUndoBtn() {
    const btn = document.getElementById('undo-btn');
    if (!btn) return;
    btn.style.opacity = undoPointer > 0 ? '1' : '0.25';
}

document.getElementById('undo-btn').addEventListener('click', undoStep);

// Ctrl+Z / Cmd+Z — only when write-area is focused (let browser handle other inputs)
document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (document.activeElement === wa || wa.contains(document.activeElement)) {
            e.preventDefault();
            undoStep();
        }
    }
});

// ── Plain text helpers ────────────────────────────────────
// Single canonical DOM→text walk used by BOTH getPlainText() and
// wrapRangeWithSpan(). Because both use identical logic, API offsets
// are always consistent with DOM positions — no innerText quirks.
//
// Rules (mirror Chrome contenteditable behaviour):
//   • text node  → its textContent verbatim
//   • <br>       → "\n"
//   • block open → prepend "\n" if something came before it
//     (DIV, P, LI, BLOCKQUOTE — but NOT the root #write-area itself)
function domWalk(rootNode, visitor) {
    // visitor(type, node|null, extra)
    //   type "text"  → node = TextNode
    //   type "nl"    → synthetic newline from block / BR
    let hasContent = false;

    function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length > 0) {
                visitor('text', node);
                hasContent = true;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName;
            if (tag === 'BR') {
                visitor('nl', node);
                hasContent = true;
                return;
            }
            const isBlock = node !== rootNode && /^(DIV|P|LI|BLOCKQUOTE)$/.test(tag);
            if (isBlock && hasContent) visitor('nl', node);
            for (const c of node.childNodes) walk(c);
        }
    }
    walk(rootNode);
}

function getPlainText() {
    let result = '';
    domWalk(wa, (type, node) => {
        if (type === 'text') result += node.textContent;
        else result += '\n';
    });
    return result;
}

// Save/restore caret by character offset within plain text
function getCaretOffset() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;
    const range = sel.getRangeAt(0);
    const pre = range.cloneRange();
    pre.selectNodeContents(wa);
    pre.setEnd(range.endContainer, range.endOffset);
    return pre.toString().length;
}

function setCaretOffset(offset) {
    const sel = window.getSelection();
    if (!sel) return;
    let remaining = offset;
    let found = false;
    function walk(node) {
        if (found) return;
        if (node.nodeType === Node.TEXT_NODE) {
            const len = node.textContent.length;
            if (remaining <= len) {
                const r = document.createRange();
                r.setStart(node, remaining);
                r.collapse(true);
                sel.removeAllRanges();
                sel.addRange(r);
                found = true;
            } else {
                remaining -= len;
            }
        } else {
            for (const child of node.childNodes) walk(child);
        }
    }
    walk(wa);
}

function setPlainText(text) {
    // Render as divs-per-line (matches contenteditable default behavior)
    if (!text) { wa.innerHTML = ''; return; }
    const lines = text.split('\n');
    wa.innerHTML = lines.map((l, i) =>
        i === 0
            ? (l ? escHtml(l) : '<br>')
            : `<div>${l ? escHtml(l) : '<br>'}</div>`
    ).join('');
}

function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Load / label / word-count ─────────────────────────────
function loadCh() {
    const ch = S.chapters[S.activeCh] || S.chapters[0];
    setPlainText(ch.text || '');
    undoStack = [ch.text || ''];
    undoPointer = 0;
    updateUndoBtn();
    updateLabel(); updateWC();
    clearGrammarMarks();
    renderPromisesOverlay();
}

function updateLabel() {
    const ch = S.chapters[S.activeCh];
    if (!ch) return;
    document.getElementById('lbl-num').textContent = S.activeCh + 1;
    document.getElementById('lbl-name').textContent = ch.title || 'untitled';
}

function updateWC() {
    const text = getPlainText();
    const w = text.trim().split(/\s+/).filter(Boolean).length;
    document.getElementById('save-label').textContent = w + ' words';
    if (S.chapters[S.activeCh]) S.chapters[S.activeCh].words = w;
}

wa.addEventListener('input', () => {
    if (!S.chapters[S.activeCh]) S.chapters[S.activeCh] = { title: 'Chapter ' + (S.activeCh + 1), text: '', words: 0, status: 'writing' };
    const text = getPlainText();
    S.chapters[S.activeCh].text = text;
    S.chapters[S.activeCh].status = 'writing';
    updateWC(); updateCounts(); save();
    scheduleUndoPush();
    scheduleGrammarCheck();
});

// Paste: strip formatting, keep plain text
wa.addEventListener('paste', e => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
});

// ═══════════════════════════
// GRAMMAR CHECK (Sapling AI)
// Replace YOUR_SAPLING_API_KEY with a free key from https://sapling.ai/user/settings
// Free tier: 50,000 characters/day, no credit card needed
// ═══════════════════════════
const SAPLING_API_KEY = '5SALXIEOB7XHNCZ6C1GIE3P4ZTH8GCFZ%3D%3D';

let grammarT = null;
let grammarMarks = [];    // [{from, to, message, replacements}]
let activePopover = null;
let grammarInFlight = false;
let grammarPending = false;

function scheduleGrammarCheck() {
    clearTimeout(grammarT);
    grammarT = setTimeout(runGrammarCheck, 1000);
}

async function runGrammarCheck() {
    if (grammarInFlight) { grammarPending = true; return; }
    const text = getPlainText();
    if (!text.trim() || text.trim().length < 10) { clearGrammarMarks(); return; }

    grammarInFlight = true;
    try {
        const res = await fetch('https://api.sapling.ai/api/v1/edits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: SAPLING_API_KEY,
                text,
                session_id: 'fw3-editor',
                neural_spellcheck: true
            })
        });
        if (!res.ok) return;
        const data = await res.json();
        // Sapling returns: { edits: [{start, end, replacement, error_type, ...}] }
        const matches = (data.edits || []).map(e => ({
            offset: e.start,
            length: e.end - e.start,
            message: e.error_type || 'Suggestion',
            replacements: e.replacement ? [e.replacement] : []
        })).filter(m => m.replacements.length > 0);
        applyGrammarMarks(text, matches);
    } catch (e) {
        // silently fail — no internet, rate limit, etc.
    } finally {
        grammarInFlight = false;
        if (grammarPending) {
            grammarPending = false;
            scheduleGrammarCheck();
        }
    }
}
function clearGrammarMarks() {
    grammarMarks = [];
    closePopover();
    // Unwrap all grammar spans without disturbing text
    wa.querySelectorAll('.gr-err').forEach(span => {
        const parent = span.parentNode;
        while (span.firstChild) parent.insertBefore(span.firstChild, span);
        parent.removeChild(span);
    });
    // Normalize text nodes
    wa.normalize();
}

function applyGrammarMarks(plainText, matches) {
    // Re-check that text hasn't changed since the async call.
    // Compare using getPlainText() — same function that built plainText.
    if (getPlainText() !== plainText) return;

    clearGrammarMarks();
    if (matches.length === 0) return;

    // Save caret
    const caretOff = getCaretOffset();

    // We need to find text nodes and inject spans at character offsets.
    // Strategy: collect all text nodes with cumulative offsets, then
    // process matches from last to first (so earlier offsets stay valid).
    const sortedMatches = [...matches].sort((a, b) => b.offset - a.offset);

    for (const m of sortedMatches) {
        const from = m.offset;
        const to = from + m.length;
        const replacements = (m.replacements || []).slice(0, 5).map(r => r.value);
        const message = m.message || '';

        wrapRangeWithSpan(from, to, { message, replacements });
    }

    grammarMarks = matches;

    // Restore caret
    try { setCaretOffset(caretOff); } catch (e) { }
}

// Wrap character range [from, to) in the editor with a <span class="gr-err">
// Uses domWalk — same as getPlainText — so offsets are guaranteed to match.
function wrapRangeWithSpan(from, to, data) {
    // Build segments: each text node mapped to its [start, end) char range.
    // Synthetic newlines (from blocks/BR) advance pos but have no DOM node.
    const segments = [];  // { node: TextNode, start, end }
    let pos = 0;

    domWalk(wa, (type, node) => {
        if (type === 'text') {
            const len = node.textContent.length;
            segments.push({ node, start: pos, end: pos + len });
            pos += len;
        } else {
            pos += 1;  // synthetic \n
        }
    });

    let startNode = null, startOff = 0, endNode = null, endOff = 0;

    for (const seg of segments) {
        if (!startNode && seg.end > from) {
            startNode = seg.node;
            startOff = from - seg.start;
        }
        if (!endNode && seg.end >= to) {
            endNode = seg.node;
            endOff = to - seg.start;
        }
        if (startNode && endNode) break;
    }

    if (!startNode || !endNode) return;

    // If the match spans a block boundary, clip to the start node's block end.
    if (startNode !== endNode) {
        endNode = startNode;
        endOff = startNode.textContent.length;
    }

    try {
        const range = document.createRange();
        range.setStart(startNode, Math.max(0, startOff));
        range.setEnd(endNode, Math.min(endOff, endNode.textContent.length));
        if (range.collapsed) return;
        const span = document.createElement('span');
        span.className = 'gr-err';
        span.dataset.message = data.message;
        span.dataset.replacements = JSON.stringify(data.replacements);
        span.addEventListener('click', e => { e.stopPropagation(); openPopover(span, data); });
        range.surroundContents(span);
    } catch (e) {
        // skip — range crossed a nested element boundary
    }
}

// ── Popover ───────────────────────────────────────────────
function openPopover(span, data) {
    closePopover();
    const pop = document.createElement('div');
    pop.id = 'gr-popover';

    const msg = document.createElement('div');
    msg.className = 'gr-pop-msg';
    msg.textContent = data.message;
    pop.appendChild(msg);

    if (data.replacements && data.replacements.length > 0) {
        const pills = document.createElement('div');
        pills.className = 'gr-pop-pills';
        data.replacements.forEach(rep => {
            const btn = document.createElement('button');
            btn.className = 'gr-pop-pill';
            btn.textContent = rep;
            btn.addEventListener('click', () => {
                applyCorrection(span, rep);
                closePopover();
            });
            pills.appendChild(btn);
        });
        pop.appendChild(pills);
    }

    // Dismiss button
    const dismiss = document.createElement('button');
    dismiss.className = 'gr-pop-dismiss';
    dismiss.textContent = 'Ignore';
    dismiss.addEventListener('click', () => {
        span.classList.add('gr-ignored');
        closePopover();
    });
    pop.appendChild(dismiss);

    document.body.appendChild(pop);
    activePopover = pop;

    // Position below the span
    const rect = span.getBoundingClientRect();
    const popW = 220;
    let left = rect.left;
    if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
    pop.style.left = left + 'px';
    pop.style.top = (rect.bottom + 6) + 'px';
}

function closePopover() {
    if (activePopover) { activePopover.remove(); activePopover = null; }
}

document.addEventListener('click', e => {
    if (activePopover && !activePopover.contains(e.target)) closePopover();
});

function applyCorrection(span, replacement) {
    // Replace span with plain text node
    const text = document.createTextNode(replacement);
    span.parentNode.replaceChild(text, span);
    wa.normalize();
    // Update state
    const plain = getPlainText();
    if (S.chapters[S.activeCh]) {
        S.chapters[S.activeCh].text = plain;
        S.chapters[S.activeCh].status = 'writing';
    }
    undoPush(plain);
    updateWC(); updateCounts(); save();
}

// ═══════════════════════════
// TRASH
// ═══════════════════════════
const trashOverlay = document.getElementById('trash-overlay');
const trashScroll = document.getElementById('trash-scroll');

function openTrash() {
    renderTrash();
    trashOverlay.classList.add('open');
}

function closeTrash() {
    trashOverlay.classList.remove('open');
}

document.getElementById('trash-back').addEventListener('click', closeTrash);

document.getElementById('trash-btn').addEventListener('click', () => {
    if (currentSection === 'chapters') openTrash();
});

function purgeExpiredTrash() {
    const week = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (!S.trash) S.trash = [];
    S.trash = S.trash.filter(item => (now - item.deletedAt) < week);
}

function updateTrashBadge() {
    purgeExpiredTrash();
    const badge = document.getElementById('trash-count-badge');
    const trashBtn = document.getElementById('trash-btn');
    const count = (S.trash || []).length;
    badge.textContent = count > 0 ? count : '';
    trashBtn.style.display = currentSection === 'chapters' ? 'flex' : 'none';
}

function renderTrash() {
    purgeExpiredTrash();
    trashScroll.innerHTML = '';
    const trash = S.trash || [];
    if (trash.length === 0) {
        trashScroll.innerHTML = '<div class="trash-empty-msg">Trash is empty</div>';
        return;
    }
    // empty-all button
    const emptyBtn = document.createElement('button');
    emptyBtn.className = 'trash-empty-btn';
    emptyBtn.textContent = 'Empty trash';
    emptyBtn.addEventListener('click', () => {
        S.trash = [];
        save(); renderTrash(); updateTrashBadge();
    });
    trashScroll.appendChild(emptyBtn);

    const week = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    trash.forEach((item, i) => {
        const msLeft = week - (now - item.deletedAt);
        const daysLeft = Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
        const div = document.createElement('div');
        div.className = 'trash-item';
        div.innerHTML = `
          <div class="trash-item-info">
            <div class="trash-item-title">${esc(item.title || 'Untitled')}</div>
            <div class="trash-item-meta">${item.words || 0} words · ${daysLeft === 1 ? 'deleted today' : 'deleted ' + daysLeft + 'd ago'}</div>
          </div>
          <div class="trash-item-actions">
            <button class="trash-item-restore">Restore</button>
            <button class="trash-item-del">×</button>
          </div>
        `;
        div.querySelector('.trash-item-restore').addEventListener('click', () => {
            S.chapters.push({ title: item.title, text: item.text, words: item.words, status: item.status || 'draft' });
            S.trash.splice(i, 1);
            updateCounts(); save();
            renderTrash(); updateTrashBadge();
            renderDetail('chapters');
        });
        div.querySelector('.trash-item-del').addEventListener('click', () => {
            S.trash.splice(i, 1);
            save(); renderTrash(); updateTrashBadge();
        });
        trashScroll.appendChild(div);
    });
}

// ═══════════════════════════
// CHAPTERS
// ═══════════════════════════
let dragSrcIdx = null;

function renderChapters() {
    detScroll.innerHTML = '';
    purgeExpiredTrash();
    updateTrashBadge();
    S.chapters.forEach((ch, i) => {
        const div = document.createElement('div');
        div.className = 'ch-card' + (i === S.activeCh ? ' active-ch' : '');
        div.draggable = true;
        div.dataset.idx = i;
        div.innerHTML = `
          <div class="ch-drag-handle" title="Drag to reorder">
            <div class="ch-drag-bar"></div>
            <div class="ch-drag-bar"></div>
            <div class="ch-drag-bar"></div>
          </div>
          <span class="ch-num">${String(i + 1).padStart(2, '0')}</span>
          <div class="ch-info">
            <input class="card-title-inp" value="${esc(ch.title || '')}" placeholder="Chapter title…">
            <div class="ch-meta">${ch.words || 0} words · ${ch.status || 'draft'}</div>
          </div>
          <div class="ch-dot ${ch.status || 'draft'}"></div>
          <button class="ch-trash-btn" title="Move to trash">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        `;

        // drag events
        div.addEventListener('dragstart', e => {
            dragSrcIdx = i;
            setTimeout(() => div.classList.add('dragging'), 0);
            e.dataTransfer.effectAllowed = 'move';
        });
        div.addEventListener('dragend', () => {
            div.classList.remove('dragging');
            detScroll.querySelectorAll('.ch-card').forEach(c => c.classList.remove('drag-over'));
            dragSrcIdx = null;
        });
        div.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            detScroll.querySelectorAll('.ch-card').forEach(c => c.classList.remove('drag-over'));
            if (dragSrcIdx !== null && dragSrcIdx !== i) div.classList.add('drag-over');
        });
        div.addEventListener('drop', e => {
            e.preventDefault();
            if (dragSrcIdx === null || dragSrcIdx === i) return;
            const moved = S.chapters.splice(dragSrcIdx, 1)[0];
            S.chapters.splice(i, 0, moved);
            if (S.activeCh === dragSrcIdx) S.activeCh = i;
            else if (dragSrcIdx < i && S.activeCh > dragSrcIdx && S.activeCh <= i) S.activeCh--;
            else if (dragSrcIdx > i && S.activeCh < dragSrcIdx && S.activeCh >= i) S.activeCh++;
            updateCounts(); save();
            renderChapters();
            updateLabel();
        });

        // touch drag (mobile)
        let touchStartY = null, touchStartIdx = null;
        div.addEventListener('touchstart', e => {
            if (!e.target.closest('.ch-drag-handle')) return;
            touchStartY = e.touches[0].clientY;
            touchStartIdx = i;
            div.classList.add('dragging');
        }, { passive: true });
        div.addEventListener('touchmove', e => {
            if (touchStartIdx === null) return;
            e.preventDefault();
            const y = e.touches[0].clientY;
            const cards = [...detScroll.querySelectorAll('.ch-card')];
            cards.forEach(c => c.classList.remove('drag-over'));
            const target = cards.find(c => {
                const r = c.getBoundingClientRect();
                return y >= r.top && y <= r.bottom && c !== div;
            });
            if (target) target.classList.add('drag-over');
        }, { passive: false });
        div.addEventListener('touchend', e => {
            if (touchStartIdx === null) return;
            div.classList.remove('dragging');
            const cards = [...detScroll.querySelectorAll('.ch-card')];
            const overCard = cards.find(c => c.classList.contains('drag-over'));
            cards.forEach(c => c.classList.remove('drag-over'));
            if (overCard) {
                const toIdx = parseInt(overCard.dataset.idx);
                const moved = S.chapters.splice(touchStartIdx, 1)[0];
                S.chapters.splice(toIdx, 0, moved);
                if (S.activeCh === touchStartIdx) S.activeCh = toIdx;
                updateCounts(); save();
                renderChapters();
                updateLabel();
            }
            touchStartIdx = null;
        });

        const inp = div.querySelector('.card-title-inp');
        inp.addEventListener('input', e => { S.chapters[i].title = e.target.value; updateLabel(); save(); });
        inp.addEventListener('click', e => e.stopPropagation());

        div.querySelector('.ch-dot').addEventListener('click', e => {
            e.stopPropagation();
            const c = ['draft', 'writing', 'done'];
            S.chapters[i].status = c[(c.indexOf(S.chapters[i].status || 'draft') + 1) % 3];
            renderDetail('chapters'); save();
        });

        div.querySelector('.ch-trash-btn').addEventListener('click', e => {
            e.stopPropagation();
            if (S.chapters.length <= 1) return; // cannot delete last chapter
            if (!S.trash) S.trash = [];
            S.trash.push({ ...S.chapters[i], deletedAt: Date.now() });
            S.chapters.splice(i, 1);
            if (S.activeCh >= S.chapters.length) S.activeCh = Math.max(0, S.chapters.length - 1);
            loadCh(); updateCounts(); save();
            renderChapters();
            updateTrashBadge();
        });

        div.addEventListener('click', () => {
            S.activeCh = i; loadCh(); closeDetail(); save();
        });
        detScroll.appendChild(div);
    });
}

// ═══════════════════════════
// ITEM VIEW (shared for timeline/promises/characters)
// ═══════════════════════════
const itemView = document.getElementById('item-view');
const itemViewTitleEl = document.getElementById('item-view-title');
const itemViewBody = document.getElementById('item-view-body');
let activeItemSection = null;
let activeItemIdx = null;

// make title editable
itemViewTitleEl.contentEditable = 'true';
itemViewTitleEl.spellcheck = false;
itemViewTitleEl.addEventListener('input', () => {
    if (activeItemSection === null) return;
    S[activeItemSection][activeItemIdx].title = itemViewTitleEl.textContent.trim();
    save();
});

const TL_TEMPLATE = `972 Year\n* Main character is born.\n* Something else happens.\n975 Year\n* Main character first steps ;-;`;
const PP_TEMPLATE = `[] exemplo de promise aqui`;
const CH_TEMPLATE = `Name\nCapabilities\n* ...\nMotivation & Goal\n* ...\nLikeability\n* ...\nPast\n* ...`;

function openItemView(section, idx) {
    document.getElementById('item-view-del').style.display = section === 'promises' ? 'none' : '';
    activeItemSection = section;
    activeItemIdx = idx;
    const item = S[section][idx];
    itemViewTitleEl.textContent = item.title || '';
    itemViewBody.innerHTML = '';

    if (section === 'promises') {
        // Promises: rendered lines view
        if (!item.text) { item.text = PP_TEMPLATE; save(); }
        buildPromisesInItemView(item);
    } else {
        // Timeline / Characters: plain textarea
        const ta = document.createElement('textarea');
        ta.id = 'item-view-ta';
        ta.placeholder = 'Write anything…';
        if (section === 'timeline' && !item.text) { item.text = TL_TEMPLATE; save(); }
        if (section === 'characters' && !item.text) { item.text = CH_TEMPLATE; save(); }
        ta.value = item.text || '';
        ta.spellcheck = false;
        ta.addEventListener('input', () => { S[activeItemSection][activeItemIdx].text = ta.value; save(); });
        itemViewBody.appendChild(ta);
        ta.focus();
    }
    itemView.classList.add('open');
}

// ── PROMISES rendered inside item-view ────────────────────
function buildPromisesInItemView(item) {
    const wrap = document.createElement('div');
    wrap.id = 'pv-wrap';

    function render() {
        wrap.innerHTML = '';
        const lines = (item.text || '').split('\n').filter(l => l.trim() !== '');
        lines.forEach((line, li) => {
            const text = line.startsWith('[]') ? line.slice(2).trim() : line.trim();
            const row = document.createElement('div');
            row.className = 'promise-line is-promise';

            const xBtn = document.createElement('button');
            xBtn.className = 'promise-x';
            xBtn.textContent = '×';
            xBtn.addEventListener('click', () => {
                const arr = item.text.split('\n').filter(l => l.trim() !== '');
                arr.splice(li, 1);
                item.text = arr.join('\n');
                save(); render(); renderPromisesOverlay();
            });
            row.appendChild(xBtn);

            const span = document.createElement('span');
            span.className = 'promise-text';
            span.textContent = text;
            row.appendChild(span);
            wrap.appendChild(row);
        });

        // input row at bottom
        const inputRow = document.createElement('div');
        inputRow.style.cssText = 'padding:12px 0 4px;';
        const ta = document.createElement('textarea');
        ta.id = 'pv-input';
        ta.placeholder = 'Ta bugado, digita [] e escreva um promise…';
        ta.spellcheck = false;
        ta.rows = 1;
        ta.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = ta.value.trim();
                if (!val) return;
                const stored = (item.text || '').split('\n').filter(l => l.trim() !== '');
                stored.push(val);
                item.text = stored.join('\n');
                save(); render(); renderPromisesOverlay();
                setTimeout(() => {
                    const newInput = wrap.querySelector('#pv-input');
                    if (newInput) newInput.focus();
                    wrap.scrollTop = wrap.scrollHeight;
                }, 0);
            }
        });
        inputRow.appendChild(ta);
        wrap.appendChild(inputRow);
        setTimeout(() => ta.focus(), 0);
    }
    render();
    itemViewBody.appendChild(wrap);
}

function closeItemView() {
    itemView.classList.remove('open');
    if (currentSection !== 'promises') {
        renderDetail(currentSection);
    }
    activeItemSection = null;
    activeItemIdx = null;
}

document.getElementById('item-view-back').addEventListener('click', () => {
    closeItemView();
    if (currentSection === 'promises') openMid();
});
document.getElementById('item-view-del').addEventListener('click', () => {
    if (activeItemSection === null || activeItemSection === 'promises') return;
    S[activeItemSection].splice(activeItemIdx, 1);
    updateCounts(); save();
    closeItemView();
});

// ── TIMELINE LIST ────────────────────────────────────────
function renderTimeline() {
    detScroll.innerHTML = '';
    S.timeline.forEach((ev, i) => {
        const div = document.createElement('div');
        div.className = 'det-list-item';
        const preview = (ev.text || '').replace(/\n/g, ' ').trim();
        div.innerHTML = `
          <div class="det-list-item-info">
            <div class="det-list-item-title">${esc(ev.title || 'Untitled')}</div>
            <div class="det-list-item-sub">${esc(preview || '—')}</div>
          </div>
          <span class="det-list-item-arrow">›</span>
        `;
        div.addEventListener('click', () => openItemView('timeline', i));
        detScroll.appendChild(div);
    });
}

// ── PROMISES VIEW (textarea + live [] detection) ───────
// Promises now use openItemView like timeline/characters.
// When section === 'promises', the textarea renders lines with [] in red.

// ── PROMISES LIST ────────────────────────────────────────
function renderPromises() {
    detScroll.innerHTML = '';
    S.promises.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'det-list-item';
        const preview = (p.text || '').replace(/\n/g, ' ').trim();
        div.innerHTML = `
          <div class="det-list-item-info">
            <div class="det-list-item-title">${esc(p.title || 'Untitled')}</div>
            <div class="det-list-item-sub">${esc(preview || '—')}</div>
          </div>
          <span class="det-list-item-arrow">›</span>
        `;
        div.addEventListener('click', () => openItemView('promises', i));
        detScroll.appendChild(div);
    });
}

// ── CHARACTERS LIST ──────────────────────────────────────
function renderCharacters() {
    detScroll.innerHTML = '';
    S.characters.forEach((ch, i) => {
        const div = document.createElement('div');
        div.className = 'det-list-item';
        const preview = (ch.text || '').replace(/\n/g, ' ').trim();
        div.innerHTML = `
          <div class="det-list-item-info">
            <div class="det-list-item-title">${esc(ch.title || 'Untitled')}</div>
            <div class="det-list-item-sub">${esc(preview || '—')}</div>
          </div>
          <span class="det-list-item-arrow">›</span>
        `;
        div.addEventListener('click', () => openItemView('characters', i));
        detScroll.appendChild(div);
    });
}
// ═══════════════════════════
// AI COMMANDS
// ═══════════════════════════
function renderAIC() {
    const list = document.getElementById('aic-list');
    list.innerHTML = '';
    S.aic.forEach((r, i) => {
        const div = document.createElement('div');
        div.className = 'aic-rule';
        div.innerHTML = `
      <div class="aic-dot ${r.on ? 'on' : ''}"></div>
      <input class="aic-input" value="${esc(r.text || '')}" placeholder="Write a rule…">
      <button class="aic-del">×</button>
    `;
        div.querySelector('.aic-dot').addEventListener('click', () => { S.aic[i].on = !S.aic[i].on; renderAIC(); save(); });
        div.querySelector('.aic-input').addEventListener('input', e => { S.aic[i].text = e.target.value; save(); });
        div.querySelector('.aic-del').addEventListener('click', () => { S.aic.splice(i, 1); renderAIC(); save(); });
        list.appendChild(div);
    });
}
document.getElementById('add-aic').addEventListener('click', () => {
    S.aic.push({ text: '', on: true }); renderAIC(); save();
});

// ═══════════════════════════
// COUNTS
// ═══════════════════════════
function updateCounts() {
    document.getElementById('c-ch').textContent = S.chapters.length;
    document.getElementById('c-tl').textContent = S.timeline.length;
    document.getElementById('c-pp').textContent = (S.promises && S.promises[0] ? S.promises[0].text.split('\n').filter(l => l.trim()).length : 0);
    document.getElementById('c-ch2').textContent = S.characters.length;
}

// ═══════════════════════════
// UTIL
// ═══════════════════════════
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ═══════════════════════════
// NOTES (mid-content list + note view)
// ═══════════════════════════
const midContent = document.getElementById('mid-content');
const noteView = document.getElementById('note-view');
const noteViewTitleInp = document.getElementById('note-view-title-inp');
const noteViewBody = document.getElementById('note-view-body');
let activeNoteIdx = null;

function openNoteView(i) {
    activeNoteIdx = i;
    const note = S.notes[i];
    noteViewTitleInp.value = note.title || '';
    noteViewBody.value = note.text || '';
    noteView.classList.add('open');
    noteViewBody.focus();
}

function closeNoteView() {
    noteView.classList.remove('open');
    activeNoteIdx = null;
    renderNotes();
}

noteViewTitleInp.addEventListener('input', () => {
    if (activeNoteIdx === null) return;
    S.notes[activeNoteIdx].title = noteViewTitleInp.value;
    save();
});

noteViewBody.addEventListener('input', () => {
    if (activeNoteIdx === null) return;
    S.notes[activeNoteIdx].text = noteViewBody.value;
    save();
});

document.getElementById('note-view-back').addEventListener('click', () => closeNoteView());

document.getElementById('note-view-del').addEventListener('click', () => {
    if (activeNoteIdx === null) return;
    S.notes.splice(activeNoteIdx, 1);
    save();
    closeNoteView();
});

function renderNotes() {
    midContent.querySelectorAll('.note-item').forEach(n => n.remove());
    (S.notes || []).forEach((note, i) => {
        const div = document.createElement('div');
        div.className = 'note-item';
        const preview = (note.text || '').replace(/\n/g, ' ').trim();
        div.innerHTML = `
          <div class="note-item-info">
            <div class="note-item-title">${esc(note.title || 'Untitled')}</div>
            <div class="note-item-preview">${esc(preview || '—')}</div>
          </div>
          <span class="note-item-arrow">›</span>
        `;
        div.addEventListener('click', () => openNoteView(i));
        midContent.appendChild(div);
    });
}

// ═══════════════════════════
// PROMISES OVERLAY (write-area sidebar)
// ═══════════════════════════
function renderPromisesOverlay() {
    let el = document.getElementById('promises-overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'promises-overlay';
        document.getElementById('editor-page').appendChild(el);
    }
    // collect all [] lines across all promise items
    const lines = [];
    (S.promises || []).forEach(p => {
        (p.text || '').split('\n').forEach(l => {
            if (l.startsWith('[]')) {
                const t = l.slice(2).trim();
                if (t) lines.push(t);
            }
        });
    });
    if (lines.length === 0) {
        el.style.display = 'none';
        return;
    }
    el.style.display = 'block';
    el.innerHTML = lines.map(l => `<div class="po-line">${esc(l)}</div>`).join('');
}

// ═══════════════════════════
// BOOT
// ═══════════════════════════
loadCh(); renderAIC(); updateCounts(); renderNotes(); renderPromisesOverlay();
