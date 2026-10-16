/* ============================================================
   数据区 —— 芯片为主，机型为辅
   sc = GB6 单核 | mc = GB6 多核 | att = 安兔兔（万分）
   bv = B站对应视频号 | est:true = 外站参考预估值（稿件没跑过）
   ============================================================ */
const VIDEO = "https://www.bilibili.com/video/";

/* BV → 视频标题（卡片底部直接显示标题，不写「来源」） */
const VIDEOS = {
  BV1jWhE6tEdQ:"影像旗舰｜小米15Ultra，为什么掉价这么快？",
  BV1hStb6zEFh:"2026年骁龙8sGen3还能打吗？IQOO Z9 Turbo体验报告",
  BV11uj86iEm4:"三年后再看红米Note12turbo｜一台改变中端市场的手机",
  BV1PDoMB6EUv:"遥遥领先还是高价低配？首发3599的华为MatePad Air柔光版实际体验怎么样？",
  BV1s3Ka62ECe:"5年后再看小米11：很多人的第一台小米，也是最后一台",
  BV1UP396bESi:"2026年｜iPhoneXR还值的买吗？7年后告诉你真实答案",
  BV1gsLm6xEHV:"9年前的小屏传奇，索尼XZ1C如今体验究竟怎么样？",
  BV1UTQeBTEbc:"全网热销70W+，首发价899的红米平板SE有什么魅力？",
  BV1x1J26oEEZ:"曾经的千元机之光？2026年再看华为畅享9 Plus",
  BV1gE5j6KEDx:"110元的坚果Pro2，锤子巅峰之作体验如何？",
  BV1jY95BvETd:"230元，9年前的iPad5在2026年体验如何？",
  BV1k6wyzDEZn:"9年前卖15999的8848体验究竟有多烂？",
  BV1Z47L6DE3s:"10年后再看格力手机，董明珠对标苹果的梦想实现了吗？",
  BV1WpcDzeEEq:"10年前16999的三星W2017，花100体验还值吗？",
  BV1EbA6ziEHa:"当年的“两元神机”OPPO A5，在 2026 年还能再战吗？",
};

const CHIPS = [
  { soc:"骁龙 8 至尊版", brand:"Qualcomm", devices:[
    { n:"小米 15 Ultra", sc:2871, mc:9217, att:330, bv:"BV1jWhE6tEdQ" },
    { n:"一加 Ace 6",    sc:2830, mc:8661, bv:null },
  ]},
  { soc:"Apple A18 Pro", brand:"Apple", devices:[
    { n:"iPhone 16 Pro", sc:3392, mc:8601, bv:null },
  ]},
  { soc:"骁龙 8 Gen 3", brand:"Qualcomm", devices:[
    { n:"小米 14", sc:2095, mc:6661, bv:null },
  ]},
  { soc:"骁龙 8 Gen 2", brand:"Qualcomm", devices:[
    { n:"一加 Ace 3", sc:1566, mc:4791, bv:null },
  ]},
  { soc:"骁龙 8s Gen 3", brand:"Qualcomm", devices:[
    { n:"iQOO Z9 Turbo", sc:1575, mc:4072, att:172, bv:"BV1hStb6zEFh" },
  ]},
  { soc:"骁龙 7+ Gen 2", brand:"Qualcomm", devices:[
    { n:"红米 Note 12 Turbo", sc:1134, mc:3882, att:113, bv:"BV11uj86iEm4" },
  ]},
  { soc:"骁龙 888", brand:"Qualcomm", devices:[
    { n:"华为 MatePad Air 2024", sc:1195, mc:3704, att:84,  bv:"BV1PDoMB6EUv" },
    { n:"小米 11",               sc:1158, mc:3661, att:113, bv:"BV1s3Ka62ECe" },
  ]},
  { soc:"骁龙 8 Gen 1", brand:"Qualcomm", devices:[
    { n:"三星 Galaxy S22", sc:1010, mc:3180, att:100, bv:null },
  ]},
  { soc:"Apple A12", brand:"Apple", devices:[
    { n:"iPhone XR", sc:1276, mc:2093, bv:"BV1UP396bESi" },
  ]},
  { soc:"骁龙 835", brand:"Qualcomm", devices:[
    { n:"索尼 XZ1C", sc:412, mc:1353, bv:"BV1gsLm6xEHV" },
  ]},
  { soc:"骁龙 680", brand:"Qualcomm", devices:[
    { n:"红米 Pad SE", sc:367, mc:1258, att:36, bv:"BV1UTQeBTEbc" },
  ]},
  { soc:"麒麟 710", brand:"HiSilicon", devices:[
    { n:"华为畅享 9 Plus", sc:354, mc:1144, bv:"BV1x1J26oEEZ" },
  ]},
  { soc:"骁龙 660", brand:"Qualcomm", devices:[
    { n:"坚果 Pro 2", sc:295, mc:1068, bv:"BV1gE5j6KEDx" },
  ]},
  { soc:"Apple A9", brand:"Apple", devices:[
    { n:"iPad 5 / iPad 2017", sc:616, mc:1023, bv:"BV1jY95BvETd" },
  ]},

  /* ↓ 稿件里没跑分，分数为外站多源 GB6 参考预估值，页面统一标「预估」 */
  { soc:"骁龙 820", brand:"Qualcomm", devices:[
    { n:"8848 M4",    sc:340, mc:780, est:true, bv:"BV1k6wyzDEZn" },
    { n:"格力 色界",  sc:340, mc:780, est:true, bv:"BV1Z47L6DE3s" },
    { n:"三星 W2017", sc:340, mc:780, est:true, bv:"BV1WpcDzeEEq" },
  ]},
  { soc:"骁龙 450", brand:"Qualcomm", devices:[
    { n:"OPPO A5", sc:168, mc:762, est:true, bv:"BV1EbA6ziEHa" },
  ]},
];

/* ============================================================
   Geekbench 7（2026-07-23 发布的新版基准）
   ⚠️ GB7 换了参考机（i7-12700 → Ryzen 7 7700）并重构了多核算力，
      Primate Labs 明确要求不得与 GB6 分数横向比较。
      所以这批数据单独成表、不参与上方榜单排序 —— 别把它并进 CHIPS。
   ============================================================ */
const GB7 = [
  { soc:"Apple A19", brand:"Apple", dev:"iPhone 17", sc:3069, mc:8359 },
  { soc:"Apple A18 Pro", brand:"Apple", dev:"iPhone 16 Pro", sc:2858, mc:7732 },
  { soc:"Apple A13", brand:"Apple", sc:1575, mc:3150 },
];

/* ============================================================
   渲染
   ============================================================ */
const $ = s => document.querySelector(s);
const nf = n => n == null ? null : n.toLocaleString("en-US");
const esc = s => s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));

const params = new URLSearchParams(location.search);
let sortKey = params.get("sort") === "mc" ? "mc" : "sc";
let query = "";

/* 芯片代表分 = 该芯片下机型最高值 */
function summarize(c){
  const sc = Math.max(...c.devices.map(d => d.sc || 0));
  const mc = Math.max(...c.devices.map(d => d.mc || 0));
  const att = Math.max(...c.devices.map(d => d.att || 0)) || null;
  const est = c.devices.every(d => d.est);
  const rep = c.devices.reduce((a, b) => (b.mc || 0) > (a.mc || 0) ? b : a, c.devices[0]);
  return { ...c, sc, mc, att, est, bv: rep.bv };
}

function tierOf(mc){
  if (mc >= 8000) return { t:1, label:"旗舰" };
  if (mc >= 3000) return { t:2, label:"高端" };
  if (mc >= 1000) return { t:3, label:"中端" };
  return { t:4, label:"入门" };
}

/* 刻度轴满量程：向上取到好看的整数 */
function niceMax(v){
  if (!v) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  const s = [1,1.2,1.5,2,2.5,3,4,5,6,8,10].find(x => x >= n - 1e-9) || 10;
  return s * mag;
}

/* 搜索匹配：芯片名 / 品牌 / 机型名 / 视频标题 */
function haystack(c){
  return (c.soc + " " + c.brand + " " +
    c.devices.map(d => d.n + " " + (d.bv ? (VIDEOS[d.bv] || "") : "")).join(" ")
  ).toLowerCase();
}
const hitChip = c => !query || haystack(c).includes(query);

function barHTML(kind, score, max, est){
  const pct = score == null ? 0 : Math.max(score / max * 100, 1.2);
  const val = score == null ? "—" : (est ? "≈" : "") + nf(score);
  return `
    <div class="bar ${kind} ${score == null ? "dim" : ""}">
      <span class="lbl">${kind === "mc" ? "多核" : "单核"}</span>
      <div class="track"><div class="fill ${kind}${est ? " est" : ""}" style="width:${pct}%"></div></div>
      <span class="val">${val}</span>
    </div>`;
}

function nameHTML(d){
  return d.bv
    ? `<a class="dn" href="${VIDEO}${d.bv}" target="_blank" rel="noopener">${d.n}<span class="a2">↗</span></a>`
    : `<span class="dn">${d.n}</span>`;
}

function devHTML(d, label){
  const att = d.att == null ? "" : `<span class="att">安兔兔 ${d.att} 万</span>`;
  const tags = [];
  if (!d.bv)  tags.push(`<span class="tag off">暂无视频</span>`);
  const nums = label ? label : `多核 ${nf(d.mc)} · 单核 ${nf(d.sc)}`;
  return `
    <div class="dev">
      <span class="sq"></span>
      ${nameHTML(d)}
      ${att}
      ${tags.join("")}
      <span class="nums">${nums}</span>
    </div>`;
}

function chipHTML(c, idx, maxV){
  const cls = ["row"];
  if (idx < 3) cls.push("top" + (idx + 1));
  const tier = tierOf(c.mc);
  const mark = c.est ? `<span class="mark">预估</span>` : "";
  const foot = c.bv
    ? `<div class="foot"><a class="vt" href="${VIDEO}${c.bv}" target="_blank" rel="noopener"><span class="pl">▶</span>${VIDEOS[c.bv] || ""}<span class="arw">↗</span></a></div>`
    : "";
  return `
    <div class="${cls.join(" ")}">
      <div class="rank">${String(idx + 1).padStart(2, "0")}</div>
      <div class="body">
        <div class="head">
          <span class="name">${c.soc}</span>
          <span class="chip">${c.brand}</span>
          <span class="tier t${tier.t}">${tier.label}</span>
          ${mark}
        </div>
        <div class="bars">
          ${barHTML("mc", c.mc, maxV, c.est)}
          ${barHTML("sc", c.sc, maxV, c.est)}
        </div>
        <div class="devs">${c.devices.map(d => devHTML(d)).join("")}</div>
        ${foot}
      </div>
    </div>`;
}

function render(){
  const chips = CHIPS.map(summarize);
  const sorted = [...chips].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
  const maxSc = Math.max(...chips.map(c => c.sc || 0), 1);
  const maxMc = Math.max(...chips.map(c => c.mc || 0), 1);
  /* 条长与刻度共用同一量程，保证两者对齐 */
  const axisMax = niceMax(sortKey === "mc" ? maxMc : maxSc);

  /* 保留榜单名次，搜索只做筛选不重排名 */
  const main = sorted.map((c, i) => ({ c, i })).filter(x => hitChip(x.c));

  $("#list").innerHTML = main.length
    ? main.map(x => chipHTML(x.c, x.i, axisMax)).join("")
    : `<div class="empty">没找到跟 <b>${esc(query)}</b> 相关的芯片或机型</div>`;

  document.body.dataset.sort = sortKey;

  const top = sorted[0];
  const devCount = chips.reduce((s, c) => s + c.devices.length, 0);
  const estCount = chips.filter(c => c.est).length;
  const rows = [
    ["收录芯片", chips.length, "颗"],
    ["覆盖机型", devCount, "台"],
    ["其中预估", estCount, "颗"],
    ["当前榜首", top.soc, ""]
  ];
  if (query){
    rows.push(["搜索命中", main.length, "颗"]);
  }
  $("#stats").innerHTML = rows.map(([k, v, u], i) => `
    <div class="stat${query && i === rows.length - 1 ? " hit" : ""}"><div class="k">${k}</div>
      <div class="v">${v}${u ? `<small>${u}</small>` : ""}</div>
    </div>`).join("");
}

/* ---------- 搜索 ---------- */
const qEl = $("#q"), clrEl = $("#clr");
qEl.addEventListener("input", () => {
  query = qEl.value.trim().toLowerCase();
  clrEl.hidden = !qEl.value;
  render();
});
clrEl.addEventListener("click", () => {
  qEl.value = ""; query = ""; clrEl.hidden = true; qEl.focus(); render();
});
const initQ = params.get("q");
if (initQ){ qEl.value = initQ; query = initQ.trim().toLowerCase(); clrEl.hidden = false; }

/* Geekbench 7 表：只输出芯片 / 单核 / 多核，不给条、不排名次，
   避免任何人把它跟上方 GB6 的条长做视觉比较 */
function renderGb7(){
  const head = `<div class="gb7-head"><span>芯片</span><span>单核</span><span>多核</span></div>`;
  const rows = GB7.map(c => `
    <div class="gb7-row">
      <div class="nm">${c.soc}${c.dev ? `<span class="dv">${c.dev}</span>` : ""}<span class="chip">${c.brand}</span></div>
      <div class="num">${nf(c.sc)}</div>
      <div class="num">${nf(c.mc)}</div>
    </div>`).join("");
  $("#gb7").innerHTML = head + rows;
}

/* ---------- 排序 ---------- */
$("#seg").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  sortKey = b.dataset.k;
  document.querySelectorAll("#seg button").forEach(x => x.classList.toggle("on", x === b));
  render();
});

/* ---------- 风格切换 ---------- */
const THEMES = ["tech", "pop"];
const THEME_KEY = "chipTheme_v2";   /* 换 key，强制老访客落到新默认 */
function applyTheme(t){
  if (!THEMES.includes(t)) t = "tech";
  document.body.dataset.theme = t;
  document.querySelectorAll("#themes button").forEach(b => b.classList.toggle("on", b.dataset.t === t));
  try { localStorage.setItem(THEME_KEY, t); } catch(e){}
}
$("#themes").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (b) applyTheme(b.dataset.t);
});

let initTheme = params.get("theme");
if (!THEMES.includes(initTheme)){
  try { initTheme = localStorage.getItem(THEME_KEY); } catch(e){}
}
applyTheme(initTheme);
document.querySelectorAll("#seg button").forEach(b => b.classList.toggle("on", b.dataset.k === sortKey));
render();
renderGb7();
