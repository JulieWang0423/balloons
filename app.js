import { firebaseConfig, BLOCKLIST, COOLDOWN_SECONDS } from "./config.js";

const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
const LIVE = !!(firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("PASTE"));
const COLORS = ["#f3e3c3", "#efc9c0", "#f5dc9a", "#c9d9bf", "#f2cfae", "#d9d2e6", "#bfd8dc"];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = id => document.getElementById(id);

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const norm = s => s.toLowerCase().replace(/[\s.\-_*·,，。!！?？]/g, "");
const blocked = s => { const n = norm(s); return BLOCKLIST.some(w => n.includes(norm(w))); };

// ---------- answers ----------
const byId = new Map();
let answers = [];
let queue = [];
const myIds = new Set(store.get("lingxi-mine", []));
function addAnswer(a) {
  if (byId.has(a.id) || blocked(a.text)) return false;
  byId.set(a.id, a); answers.push(a); return true;
}
function removeAnswer(id) {
  if (!byId.has(id)) return;
  byId.delete(id);
  answers = answers.filter(a => a.id !== id);
  queue = queue.filter(a => a.id !== id);
  sky.querySelectorAll(".balloon").forEach(el => {
    if (el.dataset.id === id) { el.classList.add("gone"); setTimeout(() => el.remove(), 900); }
  });
}
function nextAnswer() {
  if (!answers.length) return null;
  if (!queue.length) queue = answers.slice().sort(() => Math.random() - .5);
  return queue.pop();
}

// ---------- sky ----------
const sky = $("sky");
const maxActive = () => Math.max(6, Math.min(14, Math.round(innerWidth / 55)));
const lanes = () => Math.max(3, Math.floor(innerWidth / 120));
let laneTurn = 0;

function spawn(a, opts = {}) {
  if (!a) return;
  const el = document.createElement("div");
  el.className = "balloon" + (a.mine ? " mine" : "") + (opts.fresh ? " new" : "");
  el.dataset.id = a.id;
  const w = (innerWidth < 360 ? 88 : 96) + Math.round(Math.random() * 28);
  const n = lanes();
  const x = opts.x != null ? opts.x : ((laneTurn++ % n) + 0.15 + Math.random() * 0.7) / n * innerWidth - w / 2;
  el.style.left = Math.max(4, Math.min(innerWidth - w - 4, x)) + "px";
  el.style.setProperty("--w", w + "px");
  el.style.setProperty("--c", COLORS[Math.floor(Math.random() * COLORS.length)]);
  el.style.setProperty("--dur", (opts.fast ? 22 : 30 + Math.random() * 14) + "s");
  el.style.setProperty("--sway", (4 + Math.random() * 3) + "s");
  if (opts.delay) el.style.setProperty("--delay", opts.delay + "s");
  el.style.setProperty("--y", (12 + Math.random() * 45) + "%");
  el.innerHTML = '<div class="sway"><button class="body" type="button"><span></span></button><div class="knot"></div>' +
    '<svg class="string" width="20" height="70" viewBox="0 0 20 70"><path d="M10 0 C 2 18, 18 34, 8 52 S 12 66, 10 70" fill="none" stroke="rgba(70,80,90,.45)" stroke-width="1"/></svg></div>';
  el.querySelector("span").textContent = a.text;
  el.querySelector(".body").addEventListener("click", () => openCard(a, el));
  el.addEventListener("animationend", e => { if (e.animationName === "rise") el.remove(); });
  sky.appendChild(el);
}
function populate() {
  const k = Math.min(maxActive(), answers.length);
  for (let i = 0; i < k; i++) spawn(nextAnswer(), { delay: -(i / k) * 34 * 0.9 });
}
if (!reduced) setInterval(() => {
  if (document.hidden) return;
  if (sky.querySelectorAll(".balloon:not(.gone)").length < Math.min(maxActive(), answers.length)) spawn(nextAnswer());
}, 3200);

// ---------- clouds + grain ----------
const cv = $("clouds"), cx = cv.getContext("2d");
let clouds = [];
function makeCloud(x) {
  const s = (innerWidth < 500 ? 0.5 : 0.6) + Math.random() * 1.0;
  const puffs = Array.from({ length: 6 + Math.floor(Math.random() * 4) }, (_, i) => ({
    dx: (i - 3) * 26 * s + Math.random() * 10, dy: -Math.random() * 22 * s, r: (22 + Math.random() * 20) * s
  }));
  return { x, y: 40 + Math.random() * innerHeight * 0.6, v: 0.06 + Math.random() * 0.12, puffs, s };
}
function sizeClouds() {
  const dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!clouds.length) for (let i = 0; i < 7; i++) clouds.push(makeCloud(Math.random() * innerWidth));
}
function drawClouds() {
  cx.clearRect(0, 0, innerWidth, innerHeight);
  for (const c of clouds) {
    if (!reduced) c.x += c.v;
    if (c.x - 160 * c.s > innerWidth) Object.assign(c, makeCloud(-160 * c.s));
    for (const p of c.puffs) {
      const g = cx.createRadialGradient(c.x + p.dx, c.y + p.dy - p.r * .3, p.r * .2, c.x + p.dx, c.y + p.dy, p.r);
      g.addColorStop(0, "rgba(255,253,246,.95)"); g.addColorStop(.7, "rgba(250,248,240,.8)"); g.addColorStop(1, "rgba(245,245,240,0)");
      cx.fillStyle = g; cx.beginPath(); cx.arc(c.x + p.dx, c.y + p.dy, p.r, 0, Math.PI * 2); cx.fill();
    }
    cx.fillStyle = "rgba(255,252,244,.7)";
    cx.beginPath(); cx.ellipse(c.x, c.y + 6 * c.s, 95 * c.s, 14 * c.s, 0, 0, Math.PI * 2); cx.fill();
  }
  if (!reduced) requestAnimationFrame(drawClouds);
}
sizeClouds(); drawClouds();
addEventListener("resize", sizeClouds);
(() => {
  const g = document.createElement("canvas"); g.width = g.height = 180;
  const gc = g.getContext("2d"), img = gc.createImageData(180, 180);
  for (let i = 0; i < img.data.length; i += 4) { const v = 120 + Math.random() * 135; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  gc.putImageData(img, 0, 0);
  $("grain").style.backgroundImage = `url(${g.toDataURL()})`;
})();

// ---------- input ----------
const form = $("ask"), input = $("answer"), send = $("send"), count = $("count");
input.addEventListener("input", () => {
  count.textContent = input.value.length ? input.value.length + " / 60" : "";
  send.disabled = !input.value.trim();
});
input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });

// keep the card above the on-screen keyboard
if (window.visualViewport) {
  const vv = window.visualViewport;
  const fit = () => {
    const kb = Math.max(0, innerHeight - vv.height - vv.offsetTop);
    form.style.bottom = `calc(env(safe-area-inset-bottom) + 16px + ${kb}px)`;
  };
  vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit);
}

let sendAnswer = async () => {};
form.addEventListener("submit", async e => {
  e.preventDefault();
  const text = input.value.trim().slice(0, 60);
  if (!text) return;
  if (blocked(text)) { toast("这句话飞不起来，换个说法吧"); return; }
  const last = store.get("lingxi-last", 0);
  const wait = Math.ceil((last + COOLDOWN_SECONDS * 1000 - Date.now()) / 1000);
  if (wait > 0) { toast(`等 ${wait} 秒再放下一个`); return; }
  send.disabled = true;
  const a = { id: "local-" + Date.now(), text, t: Date.now(), mine: true };
  try {
    a.id = await sendAnswer(a);
  } catch (err) {
    console.error(err); toast("没发出去，检查网络再试一次"); send.disabled = false; return;
  }
  store.set("lingxi-last", Date.now());
  myIds.add(a.id); store.set("lingxi-mine", [...myIds].slice(-20));
  addAnswer(a);
  input.value = ""; input.dispatchEvent(new Event("input")); input.blur();
  spawn(a, { x: innerWidth / 2 - 55, fast: true });
  toast("你的气球飞上去了");
});

// ---------- modal / toast ----------
const modal = $("modal");
let paused = null;
function openCard(a, el) {
  $("mtext").textContent = a.text;
  $("mwhen").textContent = ago(a.t) + (a.mine ? "，你的气球" : "，来自一位观众");
  paused = el; el.style.animationPlayState = "paused";
  modal.classList.add("open"); $("mclose").focus();
}
function closeCard() { modal.classList.remove("open"); if (paused) paused.style.animationPlayState = "running"; paused = null; }
$("mclose").addEventListener("click", closeCard);
modal.addEventListener("click", e => { if (e.target === modal) closeCard(); });
addEventListener("keydown", e => { if (e.key === "Escape") closeCard(); });
function ago(t) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "刚刚"; if (m < 60) return m + " 分钟前";
  const h = Math.round(m / 60); return h < 24 ? h + " 小时前" : Math.round(h / 24) + " 天前";
}
let tt;
function toast(s) { const el = $("toast"); el.textContent = s; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 2000); }
function status(s) { const el = $("demo"); el.textContent = s; el.hidden = !s; }

// ---------- data source ----------
if (LIVE) {
  const { initializeApp } = await import(FB + "firebase-app.js");
  const fs = await import(FB + "firebase-firestore.js");
  const db = fs.getFirestore(initializeApp(firebaseConfig));
  const col = fs.collection(db, "answers");
  sendAnswer = async a => {
    const ref = fs.doc(col);
    myIds.add(ref.id);
    await fs.setDoc(ref, { text: a.text, createdAt: fs.serverTimestamp() });
    return ref.id;
  };
  let first = true;
  fs.onSnapshot(fs.query(col, fs.orderBy("createdAt", "desc"), fs.limit(80)), snap => {
    status("");
    for (const ch of snap.docChanges()) {
      const id = ch.doc.id;
      if (ch.type === "removed") { removeAnswer(id); continue; }
      const d = ch.doc.data({ serverTimestamps: "estimate" });
      const t = d.createdAt && d.createdAt.toMillis ? d.createdAt.toMillis() : Date.now();
      if (ch.type === "modified") { const a = byId.get(id); if (a) a.t = t; continue; }
      const a = { id, text: String(d.text || ""), t, mine: myIds.has(id) };
      if (addAnswer(a) && !first && !a.mine) spawn(a, { fresh: true, fast: true });
    }
    if (first) { first = false; populate(); }
  }, err => { console.error(err); status("暂时连不上，稍后刷新一下"); });
} else {
  status("演示模式：答案只存在这台设备上，其他观众为模拟");
  const SAMPLES = ["我妈妈做的番茄炒蛋", "一张全家福", "我家猫", "那封一直没寄出去的信", "一把吉他",
    "my grandmother's ring", "今天剧场里的掌声", "一本还没读完的书", "北京冬天的第一场雪",
    "a polaroid of my best friends", "我自己的日记", "一首歌，循环到那边", "my dog's old collar",
    "一张回家的车票", "和你的最后一张合照", "a jar of ocean air"];
  const now = Date.now();
  SAMPLES.forEach((text, i) => addAnswer({ id: "s" + i, text, t: now - (i + 1) * 97000 }));
  store.get("lingxi-demo", []).forEach(a => addAnswer({ ...a, mine: true }));
  sendAnswer = async a => { store.set("lingxi-demo", [...store.get("lingxi-demo", []), { id: a.id, text: a.text, t: a.t }].slice(-50)); return a.id; };
  populate();
  const MORE = ["奶奶的老收音机", "a letter from my 10-year-old self", "一碗热汤面", "我的第一双舞鞋",
    "the smell of rain", "一个拥抱", "my favorite sweater", "家门口那棵树的一片叶子", "一张没用完的电影票"];
  let mi = 0;
  if (!reduced) setInterval(() => {
    if (document.hidden) return;
    const a = { id: "m" + mi + "-" + Date.now(), text: MORE[mi++ % MORE.length], t: Date.now() };
    if (addAnswer(a)) spawn(a, { fresh: true, fast: true });
  }, 14000);
}
