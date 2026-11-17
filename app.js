// Riffle: three words riffled together like cards. Pull them apart in as few words as you can.
import { LANGS } from "./i18n.js";

const PAR = 3;
const MIN_LEN = 3;
const EPOCH = new Date(2026, 10, 16); // Daily #1 (local midnight)
const SQUARES = ["🟦", "🟥", "🟨", "🟩", "🟪", "🟧"];
const $ = (id) => document.getElementById(id);

// ---------- storage (never required to work) ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem("riffle:" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("riffle:" + k, JSON.stringify(v)); } catch {} },
};

// ---------- seeded randomness ----------
function hashStr(s) { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; }
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function dayNumber(d = new Date()) {
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((local - EPOCH) / 86400000) + 1;
}

// Letters only: drop accents and split ligatures (é -> e, œ -> oe). A no-op for English.
function plain(s) {
  return s.toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Pick three words and riffle them so no word shows more than 2 letters in a row.
function makePuzzle(answers, seedStr) {
  const rnd = mulberry32(hashStr(seedStr));
  const pick = () => answers[Math.floor(rnd() * answers.length)];
  for (let attempt = 0; attempt < 500; attempt++) {
    const display = [pick(), pick(), pick()];
    const words = display.map(plain);
    const total = words.reduce((n, w) => n + w.length, 0);
    if (new Set(words).size < 3 || total < 15 || total > 18) continue;
    for (let tries = 0; tries < 60; tries++) {
      const pos = [0, 0, 0], strip = [];
      let last = -1, run = 0, ok = true;
      while (strip.length < total) {
        const live = [0, 1, 2].filter((i) => pos[i] < words[i].length && !(i === last && run >= 2));
        if (!live.length) { ok = false; break; }
        // weight by letters remaining so words finish around the same time
        const weights = live.map((i) => words[i].length - pos[i]);
        let r = rnd() * weights.reduce((a, b) => a + b, 0), k = 0;
        while (r >= weights[k]) r -= weights[k++];
        const i = live[k];
        strip.push({ ch: words[i][pos[i]], src: i });
        pos[i]++; run = i === last ? run + 1 : 1; last = i;
      }
      if (!ok) continue;
      const s = strip.map((t) => t.ch).join("");
      if (words.some((w) => s.includes(w))) continue;
      if (strip[0].src === strip[1].src && strip[1].src === strip[2]?.src) continue;
      return { words, display, strip };
    }
  }
  throw new Error("could not build puzzle");
}

// ---------- per-language data ----------
const data = {};   // lang -> { answers, dict (Set, once loaded) }
async function loadLang(code) {
  if (!data[code]) {
    data[code] = { answers: await (await fetch(`data/${code}/answers.json`)).json(), dict: null };
    fetch(`data/${code}/dict.txt`).then((r) => r.text()).then((t) => {
      data[code].dict = new Set(t.split("\n"));
      if (code === lang && $("msg").textContent === T.loading) setMsg("");
    });
  }
  return data[code];
}

// ---------- state ----------
let lang = LANGS[store.get("lang", "en")] ? store.get("lang", "en") : "en";
let L = LANGS[lang], T = L.t;
let mode = "daily";          // "daily" | "practice"
let day = dayNumber();
let puzzle, key;              // key = storage key for this puzzle's progress
let found = [];               // [{ word, idx: [tile indices] }]
let sel = [];                 // selected tile indices
let hints = [];               // secret word indices revealed
let solved = false;
let flipNext = new Set();

const k = (name) => L.storePrefix + name;   // storage key in the current language
function owner(i) { return found.findIndex((f) => f.idx.includes(i)); }
function colorOf(n) { return "c" + (n % SQUARES.length); }
const up = (s) => s.toLocaleUpperCase(lang);

function load(newMode, seed) {
  const answers = data[lang].answers;
  mode = newMode;
  if (mode === "daily") { day = dayNumber(); key = k("day:" + day); puzzle = makePuzzle(answers, L.seed + day); }
  else { key = k("practice"); puzzle = makePuzzle(answers, seed); }
  const saved = store.get(key, null);
  const valid = saved && (mode === "daily" || saved.seed === seed);
  found = valid ? saved.found : [];
  hints = valid ? saved.hints || [] : [];
  solved = valid ? !!saved.solved : false;
  if (mode === "practice") store.set(key, { seed, found, hints, solved });
  sel = [];
  setMsg("");
  render();
}

function save() {
  const prev = store.get(key, {});
  store.set(key, { ...prev, found, hints, solved });
}

// ---------- static text ----------
function applyLang() {
  document.documentElement.lang = lang;
  $("lang").value = lang;
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = T[el.dataset.i18n];
  for (const el of document.querySelectorAll("[data-i18n-aria]")) el.setAttribute("aria-label", T[el.dataset.i18nAria]);
  $("word").dataset.placeholder = T.tapLetters;
  const ex = L.example;
  const tiles = [...ex.letters].map((ch, i) => `<span class="t c${ex.src[i]}">${ch}</span>`).join("");
  $("help-body").innerHTML = T.help.replace("%EXAMPLE%",
    `<div class="example" aria-hidden="true">${tiles}</div><p class="caption">${ex.caption}</p>`);
}

async function switchLang(code) {
  if (!LANGS[code] || code === lang) return;
  await loadLang(code);
  lang = code; L = LANGS[code]; T = L.t;
  store.set("lang", code);
  applyLang();
  load("daily");
}

// ---------- rendering ----------
function render() {
  const strip = $("strip");
  const last = sel.length ? sel[sel.length - 1] : -1;
  strip.replaceChildren(...puzzle.strip.map((t, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "t"; b.textContent = t.ch; b.dataset.i = i;
    const o = owner(i);
    if (o >= 0) { b.classList.add("used", colorOf(o)); b.disabled = true; if (flipNext.has(i)) { b.classList.add("flip"); b.style.animationDelay = `${flipNext.size > 1 ? [...flipNext].indexOf(i) * 60 : 0}ms`; } }
    else if (sel.includes(i)) b.classList.add("sel");
    else if (i < last) b.classList.add("behind");
    const h = hints.find((w) => firstTile(w) === i);
    if (h !== undefined) { b.classList.add("hint"); b.dataset.len = puzzle.words[h].length; }
    b.setAttribute("aria-label", `${up(t.ch)}${o >= 0 ? ", " + T.used : sel.includes(i) ? ", " + T.selected : ""}`);
    return b;
  }));
  flipNext = new Set();

  $("label").textContent = mode === "daily" ? T.daily(day) : T.practice;
  $("btn-mode").textContent = mode === "daily" ? T.practice : T.backToDaily;
  $("word").textContent = sel.map((i) => puzzle.strip[i].ch).join("");
  $("count").textContent = T.words(found.length);

  $("found").replaceChildren(...found.map((f, n) => {
    const li = document.createElement("li");
    li.className = colorOf(n);
    li.append(f.word);
    if (!solved) {
      const x = document.createElement("button");
      x.type = "button"; x.textContent = "×"; x.setAttribute("aria-label", T.putBack(f.word));
      x.onclick = () => removeWord(n);
      li.append(x);
    }
    return li;
  }));

  const playing = !solved;
  for (const id of ["btn-clear", "btn-back", "btn-enter"]) $(id).disabled = !playing || !sel.length;
  $("btn-hint").disabled = !playing || hints.length >= PAR;
  $("btn-hint").textContent = hints.length ? T.hintCount(hints.length, PAR) : T.hint;
  $("btn-reset").disabled = !playing || !found.length;
  $("done").hidden = !solved;
  document.querySelector(".entry").hidden = solved;
  document.querySelector(".controls").hidden = solved;
  $("btn-hint").hidden = $("btn-reset").hidden = solved;
  if (solved) renderDone();
}

function firstTile(w) { return puzzle.strip.findIndex((t) => t.src === w); }

function setMsg(text, bad = false) {
  $("msg").textContent = text;
  if (bad) { const w = $("word"); w.classList.remove("shake"); void w.offsetWidth; w.classList.add("shake"); }
}

// ---------- play ----------
function tap(i) {
  if (solved || owner(i) >= 0) return;
  const at = sel.indexOf(i);
  if (at >= 0) sel = sel.slice(0, at);            // tap a selected tile: back up to before it
  else {
    sel = sel.filter((j) => j < i);               // tap an earlier tile: re-pick from there
    sel.push(i);
  }
  setMsg("");
  render();
}

function typeLetter(ch) {
  if (solved) return;
  const from = sel.length ? sel[sel.length - 1] + 1 : 0;
  for (let i = from; i < puzzle.strip.length; i++) {
    if (puzzle.strip[i].ch === ch && owner(i) < 0) { sel.push(i); setMsg(""); render(); return; }
  }
  setMsg(T.noFree(up(ch)), true);
}

function backspace() { if (sel.length) { sel.pop(); setMsg(""); render(); } }
function clearSel() { sel = []; setMsg(""); render(); }

function submit() {
  if (solved || !sel.length) return;
  const word = sel.map((i) => puzzle.strip[i].ch).join("");
  if (word.length < MIN_LEN) return setMsg(T.tooShort(MIN_LEN), true);
  const dict = data[lang].dict;
  if (!dict) return setMsg(T.loading);
  if (!dict.has(word)) return setMsg(T.notWord, true);
  found.push({ word, idx: [...sel] });
  flipNext = new Set(sel);
  sel = [];
  const left = puzzle.strip.length - found.reduce((n, f) => n + f.idx.length, 0);
  if (left === 0) finish();
  else setMsg(praise(word, left));
  save();
  render();
  if (solved) setTimeout(() => $("done").scrollIntoView({ behavior: "smooth", block: "center" }), 500);
}

function praise(word, left) {
  const n = word.length;
  const tag = n >= 8 ? T.huge : n >= 6 ? T.nice : n >= 5 ? T.good : "";
  return `${tag} ${T.left(left)}`.trim();
}

function removeWord(n) {
  if (solved) return;
  found.splice(n, 1);
  sel = [];
  setMsg(T.returned);
  save(); render();
}

function reset() {
  if (solved || !found.length) return;
  found = []; sel = []; setMsg(""); save(); render();
}

function hint() {
  if (solved || hints.length >= PAR) return;
  // Prefer a hidden word the player hasn't already pulled out exactly.
  const exact = (w) => found.some((f) => f.idx.length === puzzle.words[w].length && f.idx.every((i) => puzzle.strip[i].src === w));
  const order = [0, 1, 2].filter((w) => !hints.includes(w)).sort((a, b) => exact(a) - exact(b) || firstTile(a) - firstTile(b));
  const w = order[0];
  hints.push(w);
  setMsg(T.hintMsg(puzzle.words[w].length, up(puzzle.words[w][0])));
  save(); render();
}

// ---------- finishing ----------
function finish() {
  solved = true;
  if (mode === "daily") {
    const s = store.get(k("stats"), { played: 0, streak: 0, best: 0, last: 0, dist: {} });
    if (s.last !== day) {
      s.played++;
      s.streak = s.last === day - 1 ? s.streak + 1 : 1;
      s.best = Math.max(s.best, s.streak);
      s.last = day;
      const n = Math.min(found.length, 6);
      s.dist[n] = (s.dist[n] || 0) + 1;
      store.set(k("stats"), s);
    }
  }
}

function shareText() {
  const n = found.length;
  const bar = puzzle.strip.map((_, i) => SQUARES[owner(i) % SQUARES.length]).join("");
  const label = `${L.shareName} ${mode === "daily" ? T.shareDaily(day) : T.sharePractice}`;
  const h = hints.length ? ` · 💡${hints.length}` : "";
  return `${label} · ${T.shareWords(n, PAR)}${h}\n${bar}\nmco.dev/riffle`;
}

function renderDone() {
  const [title, sub] = T.verdict(found.length);
  $("done-title").textContent = title;
  $("done-sub").textContent = sub + (hints.length ? T.hints(hints.length) : "");
  const mine = new Set(found.map((f) => f.word));
  $("secret").replaceChildren(
    Object.assign(document.createElement("p"), { textContent: T.riffled, style: "width:100%;font-size:.85rem" }),
    ...puzzle.display.map((w, i) => Object.assign(document.createElement("span"), { textContent: (mine.has(puzzle.words[i]) ? "✓ " : "") + w })),
  );
  $("share-text").textContent = shareText();
  $("btn-next").textContent = mode === "daily" ? T.practicePuzzle : T.nextPractice;
  $("next-daily").textContent = mode === "daily" ? T.nextDaily : "";
}

async function share() {
  const text = shareText();
  try {
    if (navigator.share && matchMedia("(pointer: coarse)").matches) { await navigator.share({ text }); return; }
    await navigator.clipboard.writeText(text);
    toast(T.copied);
  } catch (e) { if (e?.name !== "AbortError") toast(T.cantShare); }
}

let toastTimer;
function toast(text) {
  const t = $("toast"); t.textContent = text; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

function newPractice() { load("practice", "p-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)); }

// ---------- stats ----------
function renderStats() {
  const s = store.get(k("stats"), { played: 0, streak: 0, best: 0, last: 0, dist: {} });
  const par = Object.entries(s.dist).filter(([n]) => +n <= PAR).reduce((a, [, v]) => a + v, 0);
  $("stat-row").innerHTML = [
    [s.played, T.solved], [s.played ? Math.round((par / s.played) * 100) + "%" : "–", T.atPar],
    [s.last >= day - 1 ? s.streak : 0, T.streak], [s.best, T.best],
  ].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join("");
  const max = Math.max(1, ...Object.values(s.dist));
  const today = mode === "daily" && solved ? Math.min(found.length, 6) : 0;
  $("dist").innerHTML = [1, 2, 3, 4, 5, 6].map((n) => {
    const v = s.dist[n] || 0;
    return `<div class="r"><span>${n === 6 ? "6+" : n}</span><div class="bar${n === today ? " on" : ""}" style="width:${8 + (92 * v) / max}%">${v}</div></div>`;
  }).join("");
}

// ---------- wiring ----------
$("strip").addEventListener("click", (e) => { const b = e.target.closest(".t"); if (b) tap(+b.dataset.i); });
$("btn-enter").onclick = submit;
$("btn-back").onclick = backspace;
$("btn-clear").onclick = clearSel;
$("btn-hint").onclick = hint;
$("btn-reset").onclick = reset;
$("btn-share").onclick = share;
$("btn-next").onclick = newPractice;
$("btn-mode").onclick = () => {
  if (mode === "daily") { const p = store.get(k("practice"), null); p && !p.solved ? load("practice", p.seed) : newPractice(); }
  else load("daily");
};
$("lang").addEventListener("change", (e) => { switchLang(e.target.value); e.target.blur(); });
$("btn-help").onclick = () => $("help").showModal();
$("btn-stats").onclick = () => { renderStats(); $("stats").showModal(); };
for (const d of document.querySelectorAll("dialog")) d.addEventListener("click", (e) => { if (e.target === d) d.close(); });

document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector("dialog[open]")) return;
  if (e.target instanceof HTMLSelectElement) return;
  if (e.key === "Enter") { e.preventDefault(); submit(); }
  else if (e.key === "Backspace") { e.preventDefault(); backspace(); }
  else if (e.key === "Escape") clearSel();
  else if (/^\p{L}$/u.test(e.key)) {
    const ch = plain(e.key);                       // é typed on a French keyboard counts as e
    if (/^[a-z]$/.test(ch)) typeLetter(ch);
  }
});

// The day can roll over while the tab stays open.
document.addEventListener("visibilitychange", () => { if (!document.hidden && mode === "daily" && dayNumber() !== day) load("daily"); });

await loadLang(lang);
applyLang();
load("daily");
if (!store.get("seenHelp", false)) { store.set("seenHelp", true); $("help").showModal(); }
