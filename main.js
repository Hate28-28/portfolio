(function () {
  "use strict";
  const S = window.SITE;
  const root = document.documentElement;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmt = (d) => {
    if (!d) return "Now";
    const [y, m] = String(d).split("-");
    return m ? `${MONTHS[+m - 1]} ${y}` : y;
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  document.querySelectorAll("[data-bind]").forEach((el) => (el.textContent = S[el.dataset.bind] || ""));
  $$(".cv-link").forEach((a) => (a.href = S.cv));
  $$(".mail-link").forEach((a) => (a.href = `mailto:${S.email}`));
  $("#year").textContent = `© ${new Date().getFullYear()} ${S.name}`;

  /* =========================================================
     SOUND (generated in the browser, no audio files)
     ========================================================= */
  const VOLUME = 0.22; // 0 = silent, 1 = loud
  let soundOn = true;
  try { soundOn = localStorage.getItem("sound") !== "off"; } catch {}
  let ctx = null, noise = null;
  const audio = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  const out = (ac, v) => {
    const g = ac.createGain();
    g.gain.value = VOLUME * v;
    g.connect(ac.destination);
    return g;
  };
  // "key" = deep click, "click" = light tick, "seat" = part clicking into a slot
  const play = (kind = "click") => {
    if (!soundOn) return;
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const o = out(ac, kind === "click" ? 0.7 : 1);
    const src = ac.createBufferSource();
    src.buffer = noise;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = kind === "click" ? 3800 : kind === "seat" ? 1900 : 2400;
    const ng = ac.createGain();
    ng.gain.setValueAtTime(0.9, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    src.connect(bp).connect(ng).connect(o);
    src.start(t, Math.random());
    src.stop(t + 0.05);
    const osc = ac.createOscillator();
    const f = kind === "click" ? 420 : kind === "seat" ? 120 : 170;
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.08);
    const og = ac.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(kind === "click" ? 0.25 : 0.7, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    osc.connect(og).connect(o);
    osc.start(t);
    osc.stop(t + 0.12);
    if (kind === "seat") setTimeout(() => play("key"), 70);
  };
  const fanWhoosh = () => {
    if (!soundOn) return;
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const src = ac.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(120, t);
    lp.frequency.exponentialRampToValueAtTime(900, t + 1.6);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    src.connect(lp).connect(g).connect(out(ac, 1));
    src.start(t);
    src.stop(t + 2.7);
  };
  const beep = () => {
    if (!soundOn) return;
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    osc.type = "square";
    osc.frequency.value = 988;
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2200;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.setValueAtTime(0.12, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(lp).connect(g).connect(out(ac, 1));
    osc.start(t);
    osc.stop(t + 0.2);
  };

  const soundBtn = $("#sound-toggle");
  const setSound = (on) => {
    soundOn = on;
    soundBtn.setAttribute("aria-pressed", String(on));
    soundBtn.querySelector(".state").textContent = on ? "On" : "Off";
    try { localStorage.setItem("sound", on ? "on" : "off"); } catch {}
  };
  setSound(soundOn);
  soundBtn.addEventListener("click", () => {
    setSound(!soundOn);
    if (soundOn) play("click");
  });
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest("#sound-toggle, .part, .big-power, .jack")) return;
    if (e.target.closest("a, button, [role=button], [role=tab]")) play("click");
  });

  /* =========================================================
     PROJECTS -> PARTS
     ========================================================= */
  const FALLBACK = ["#2BE38A", "#FF3BD4", "#22D3EE", "#FFB020", "#FF8A3D"];
  const areaColors = { ...(S.areaColors || {}) };
  let fb = 0;
  const colorFor = (a) => (areaColors[a] ||= FALLBACK[fb++ % FALLBACK.length]);

  const SLOTS = [
    { id: "cpu", kind: "cpu", label: "CPU socket" },
    { id: "gpu", kind: "gpu", label: "PCIe x16 slot 1" },
    { id: "ramA2", kind: "ram", label: "DIMM_A2", x: 446 },
    { id: "ramB2", kind: "ram", label: "DIMM_B2", x: 506 },
    { id: "ramA1", kind: "ram", label: "DIMM_A1", x: 420 },
    { id: "ramB1", kind: "ram", label: "DIMM_B1", x: 480 },
    { id: "m2a", kind: "ssd", label: "M.2_1", x: 160, y: 262 },
    { id: "m2b", kind: "ssd", label: "M.2_2", x: 160, y: 566 },
    { id: "x1", kind: "module", label: "PCIe x1 slot" },
    { id: "x16b", kind: "card", label: "PCIe x16 slot 2" },
  ];
  const projects = [...S.projects].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const taken = new Map(); // slot id -> project
  const placed = [];
  const tryPlace = (p, kind) => {
    const slot = SLOTS.find((s) => (!kind || s.kind === kind) && !taken.has(s.id));
    if (!slot) return false;
    taken.set(slot.id, p);
    placed.push({ p, slot, color: colorFor(p.area), i: placed.length });
    return true;
  };
  projects.filter((p) => p.part).forEach((p) => tryPlace(p, p.part) || tryPlace(p, "card") || tryPlace(p, "ram") || tryPlace(p, "ssd") || tryPlace(p));
  projects.filter((p) => !p.part).forEach((p) => tryPlace(p, "ram") || tryPlace(p, "ssd") || tryPlace(p));
  const unplaced = projects.filter((p) => !placed.some((x) => x.p === p));
  // keep display order newest first
  placed.sort((a, b) => String(b.p.date).localeCompare(String(a.p.date)));
  placed.forEach((x, i) => (x.i = i));
  const bySlot = (id) => placed.find((x) => x.slot.id === id);

  /* =========================================================
     DRAW THE BOARD
     ========================================================= */
  const svg = $("#board");
  const B = [];
  const add = (s) => B.push(s);
  const silk = (x, y, t, o = {}) =>
    `<text class="silk" x="${x}" y="${y}" font-size="${o.s || 7}" text-anchor="${o.a || "start"}"${o.r ? ` transform="rotate(${o.r} ${x} ${y})"` : ""}${o.cls ? ` data-c="${o.cls}"` : ""}>${esc(t)}</text>`;
  const rect = (x, y, w, h, cls, extra = "") => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
  const route = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1;
    const sx = Math.sign(dx) || 1, sy = Math.sign(dy) || 1;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    if (adx >= ady) {
      const b = ady, a = (adx - b) / 2;
      return `M${x1} ${y1}H${x1 + sx * a}L${x1 + sx * (a + b)} ${y2}H${x2}`;
    }
    const b = adx, a = (ady - b) / 2;
    return `M${x1} ${y1}V${y1 + sy * a}L${x2} ${y1 + sy * (a + b)}V${y2}`;
  };

  add(`<defs>
    <pattern id="weave" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#0D1013"/><path d="M0 2.5h5M2.5 0v5" stroke="#11161B" stroke-width=".5"/></pattern>
    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B444F"/><stop offset=".5" stop-color="#262D35"/><stop offset="1" stop-color="#181D23"/></linearGradient>
    <linearGradient id="metal-h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2E353E"/><stop offset=".5" stop-color="#46505C"/><stop offset="1" stop-color="#232930"/></linearGradient>
    <linearGradient id="ihs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9DEE4"/><stop offset=".45" stop-color="#9AA1AA"/><stop offset=".55" stop-color="#B8BEC6"/><stop offset="1" stop-color="#7E858E"/></linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBCB72"/><stop offset="1" stop-color="#A57C2C"/></linearGradient>
    <linearGradient id="shroud" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1D232A"/><stop offset="1" stop-color="#0F1317"/></linearGradient>
    <radialGradient id="hub"><stop offset="0" stop-color="#3A424C"/><stop offset="1" stop-color="#15191E"/></radialGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="14" stdDeviation="10" flood-color="#000" flood-opacity=".75"/></filter>
  </defs>`);

  // PCB
  add(`<rect class="pcb" x="0" y="0" width="600" height="760" rx="12" fill="url(#weave)"/>`);
  [[24, 24], [576, 24], [24, 736], [330, 330], [576, 470], [24, 470]].forEach(([x, y]) =>
    add(`<circle cx="${x}" cy="${y}" r="9" fill="#050607" stroke="url(#gold)" stroke-width="3"/>`)
  );

  // Copper traces (buses). group links them to parts for the current animation.
  const BUSES = [
    [548, 170, 344, 140, 4, "cpu"],
    [128, 104, 196, 112, 3, "io"],
    [344, 92, 413, 84, 3, "ram"],
    [236, 214, 236, 375, 5, "gpu"],
    [204, 214, 204, 262, 2, "ssd"],
    [560, 300, 500, 520, 3, "chip"],
    [470, 520, 372, 566, 3, "ssd"],
    [420, 600, 210, 512, 3, "module"],
    [430, 628, 330, 616, 3, "card"],
    [570, 560, 578, 560, 1, "chip"],
    [150, 584, 160, 640, 2, "audio"],
  ];
  const traceD = [];
  BUSES.forEach(([x1, y1, x2, y2, n, g]) => {
    const horiz = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
    for (let k = 0; k < n; k++) {
      const o = (k - (n - 1) / 2) * 6;
      const d = horiz ? route(x1, y1 + o, x2, y2 + o) : route(x1 + o, y1, x2 + o, y2);
      traceD.push({ d, g });
    }
  });
  add(`<g class="traces">${traceD.map((t) => `<path d="${t.d}"/>`).join("")}</g>`);
  add(`<g class="flows">${traceD.map((t, i) => `<path class="flow" data-g="${t.g}" pathLength="100" style="--d:${(i % 5) * -0.21}s" d="${t.d}"/>`).join("")}</g>`);

  // Rear I/O shroud and ports (contact links)
  add(`<path class="shroud" d="M0 8H128V300L110 332H0Z" fill="url(#metal)"/>
       <path class="rgb" d="M124 30V292" style="--i:0"/>
       ${silk(64, 318, "MY", { s: 14, a: "middle" })}`);
  const phone = (S.phones || []).map((p) => p.value);
  const PORTS = [
    { y: 36, h: 16, label: "USB-C", probe: `USB-C: email ${S.email}`, href: `mailto:${S.email}`, shape: "usbc" },
    { y: 66, h: 40, label: "LAN", probe: "Ethernet: LinkedIn profile", href: S.linkedin, shape: "rj45", ext: true },
    { y: 120, h: 20, label: "HDMI", probe: phone[0] ? `HDMI: call Malaysia ${phone[0]}` : "HDMI", href: phone[0] ? `tel:${phone[0].replace(/\s/g, "")}` : null, shape: "hdmi" },
    { y: 154, h: 20, label: "DP", probe: phone[1] ? `DisplayPort: call Saudi Arabia ${phone[1]}` : "DisplayPort", href: phone[1] ? `tel:${phone[1].replace(/\s/g, "")}` : null, shape: "dp" },
    { y: 190, h: 36, label: "USB", probe: "USB: download my CV", href: S.cv, shape: "usba", ext: true },
  ];
  PORTS.forEach((p) => {
    let body = "";
    const x = -30;
    if (p.shape === "usbc") body = `<rect x="${x}" y="${p.y}" width="56" height="${p.h}" rx="8" class="port-metal"/><rect x="${x + 10}" y="${p.y + 6}" width="36" height="4" rx="2" class="port-hole"/>`;
    if (p.shape === "rj45") body = `<rect x="${x}" y="${p.y}" width="58" height="${p.h}" rx="3" class="port-metal"/><path d="M${x + 8} ${p.y + 8}h40v18h-10v6h-20v-6h-10z" class="port-hole"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${x + 11 + i * 4.4}" y="${p.y + 9}" width="2" height="6" fill="url(#gold)"/>`).join("")}<circle cx="${x + 6}" cy="${p.y + 36}" r="2" class="port-led"/>`;
    if (p.shape === "hdmi") body = `<rect x="${x}" y="${p.y}" width="56" height="${p.h}" rx="2" class="port-metal"/><path d="M${x + 8} ${p.y + 5}h40l-4 10h-32z" class="port-hole"/>`;
    if (p.shape === "dp") body = `<rect x="${x}" y="${p.y}" width="56" height="${p.h}" rx="2" class="port-metal"/><path d="M${x + 8} ${p.y + 5}h40v10h-34l-6-5z" class="port-hole"/>`;
    if (p.shape === "usba") body = `<rect x="${x}" y="${p.y}" width="56" height="${p.h}" rx="2" class="port-metal"/><rect x="${x + 8}" y="${p.y + 5}" width="40" height="10" class="port-hole blue"/><rect x="${x + 8}" y="${p.y + 21}" width="40" height="10" class="port-hole blue"/>`;
    const lab = silk(34, p.y + p.h / 2 + 2.5, p.label, { s: 6.5 });
    add(
      p.href
        ? `<a class="port" href="${esc(p.href)}"${p.ext ? ' target="_blank" rel="noopener"' : ""} data-probe="${esc(p.probe)}" aria-label="${esc(p.probe)}">${body}${lab}</a>`
        : `<g class="port">${body}${lab}</g>`
    );
  });
  // Audio jacks toggle sounds
  add(`<g class="jack" role="button" tabindex="0" aria-label="Audio jacks: turn sounds on or off" data-probe="Audio jacks: turn sounds on or off">
    <rect x="-30" y="240" width="56" height="50" rx="3" class="port-metal"/>
    <circle cx="-14" cy="254" r="7" fill="#2BE38A"/><circle cx="8" cy="254" r="7" fill="#FF6FB5"/><circle cx="-14" cy="276" r="7" fill="#4C9BFF"/><circle cx="8" cy="276" r="7" fill="#C9CED6"/>
    ${[[-14, 254], [8, 254], [-14, 276], [8, 276]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.8" fill="#0A0C0F"/>`).join("")}
    ${silk(34, 268, "AUDIO", { s: 6.5 })}
  </g>`);

  // VRM heatsinks
  const fins = (x, y, w, h, vertical) => {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#metal)" class="hs"/>`;
    if (vertical) for (let i = x + 6; i < x + w - 4; i += 6) s += `<path d="M${i} ${y + 4}V${y + h - 4}" class="fin"/>`;
    else for (let i = y + 6; i < y + h - 4; i += 6) s += `<path d="M${x + 4} ${i}H${x + w - 4}" class="fin"/>`;
    return s;
  };
  add(fins(158, 14, 244, 40, true));
  add(fins(134, 64, 50, 186, false));
  add(silk(280, 66, "VRM 16+2", { s: 6, a: "middle" }));
  // capacitors
  for (let i = 0; i < 9; i++) add(`<circle cx="${196 + i * 18}" cy="62" r="5" class="cap"/>`);
  // CPU 8-pin and fan header
  add(`<rect x="412" y="12" width="44" height="24" rx="2" class="conn"/>${[0, 1, 2, 3].map((i) => `<rect x="${416 + i * 10}" y="15" width="7" height="7" class="pin"/><rect x="${416 + i * 10}" y="25" width="7" height="7" class="pin"/>`).join("")}${silk(412, 46, "CPU_8P", { s: 6 })}`);
  add(`<rect x="470" y="16" width="34" height="10" rx="1" class="conn"/>${[0, 1, 2, 3].map((i) => `<rect x="${473 + i * 8}" y="18" width="5" height="6" class="pin"/>`).join("")}${silk(470, 36, "CPU_FAN", { s: 6 })}`);

  // CPU socket
  add(`<rect x="196" y="66" width="148" height="148" rx="6" class="socket"/>
       <path d="M188 74V206M352 74V206" class="arm"/>`);
  const cpuEmpty = () => {
    let s = "";
    for (let r = 0; r < 12; r++) for (let c = 0; c < 12; c++) s += `<circle cx="${214 + c * 9.4}" cy="${84 + r * 9.4}" r="1.3" fill="url(#gold)"/>`;
    return s;
  };

  // DIMM slots
  SLOTS.filter((s) => s.kind === "ram").forEach((s) =>
    add(`<rect x="${s.x}" y="60" width="12" height="270" rx="2" class="slot"/><rect x="${s.x - 1}" y="56" width="14" height="8" rx="1" class="latch"/><rect x="${s.x - 1}" y="326" width="14" height="8" rx="1" class="latch"/>${silk(s.x + 6, 344, s.label.replace("DIMM_", ""), { s: 6, a: "middle" })}`)
  );
  add(silk(466, 354, "DDR5 DIMM", { s: 6, a: "middle" }));

  // 24-pin ATX + debug LEDs
  add(`<rect x="548" y="108" width="38" height="190" rx="3" class="conn"/>`);
  for (let r = 0; r < 12; r++) add(`<rect x="553" y="${114 + r * 15.5}" width="11" height="11" class="pin"/><rect x="570" y="${114 + r * 15.5}" width="11" height="11" class="pin"/>`);
  add(silk(567, 102, "ATX_24P", { s: 6, a: "middle" }));
  ["cpu", "dram", "vga", "boot"].forEach((l, i) => add(`<rect x="572" y="${304 + i * 9}" width="12" height="5" rx="1" class="qled" data-led="${l}"/>${silk(568, 309 + i * 9, l.toUpperCase(), { s: 5, a: "end" })}`));

  // M.2 slots (empty look)
  SLOTS.filter((s) => s.kind === "ssd").forEach((s) =>
    add(`<rect x="${s.x}" y="${s.y + 8}" width="14" height="18" rx="1" class="conn"/><circle cx="${s.x + 232}" cy="${s.y + 17}" r="4" fill="url(#gold)"/>${silk(s.x + 120, s.y + 44, s.label, { s: 6, a: "middle" })}`)
  );

  // PCIe slots
  add(`<rect x="40" y="375" width="480" height="17" rx="2" class="slot pcie"/><rect x="520" y="372" width="12" height="23" rx="2" class="latch"/>${silk(44, 405, "PCIEX16_1", { s: 6 })}`);
  add(`<rect x="40" y="505" width="80" height="13" rx="2" class="slot pcie"/>${silk(44, 530, "PCIEX1_1", { s: 6 })}`);
  add(`<rect x="160" y="615" width="250" height="17" rx="2" class="slot pcie"/><rect x="410" y="612" width="10" height="23" rx="2" class="latch"/>${silk(164, 645, "PCIEX16_2", { s: 6 })}`);

  // Chipset heatsink
  add(`<rect x="420" y="520" width="150" height="120" rx="12" fill="url(#metal)" class="hs"/>
       <rect x="426" y="526" width="138" height="108" rx="9" class="rgb-outline" style="--i:3"/>
       ${silk(495, 584, "MY", { s: 30, a: "middle", cls: "logo" })}
       ${silk(495, 604, "CHIPSET", { s: 6, a: "middle" })}`);
  // SATA ports
  for (let i = 0; i < 4; i++) add(`<path d="M578 ${528 + i * 26}h20v18h-20v-5h6v-8h-6z" class="conn"/>`);
  add(silk(588, 640, "SATA", { s: 5.5, a: "middle" }));

  // Audio section with its light line
  add(`<path class="rgb" d="M0 570H150V760" style="--i:6"/>`);
  [[36, 600, 9], [66, 600, 9], [36, 632, 9], [98, 632, 7], [120, 600, 7]].forEach(([x, y, r]) => add(`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#gold)" stroke="#6E5320"/><circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="#7A5B22"/>`));
  add(`<rect x="30" y="670" width="52" height="52" rx="3" class="chip"/>${silk(56, 700, "AUDIO", { s: 6, a: "middle" })}${silk(56, 740, "HD AUDIO", { s: 6, a: "middle" })}`);

  // Board name, CMOS, POST display, power button
  add(silk(168, 690, S.name.toUpperCase(), { s: 25, cls: "name" }));
  const d = new Date();
  add(silk(170, 708, `IT EDITION   REV ${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`, { s: 7 }));
  add(`<g class="cmos" role="button" tabindex="0" aria-label="CMOS battery: clear CMOS and reboot" data-probe="CMOS battery: click to clear CMOS and reboot">
        <circle cx="462" cy="702" r="22" fill="url(#ihs)"/><circle cx="462" cy="702" r="16" fill="none" stroke="#7E858E"/>
        <text x="462" y="707" text-anchor="middle" class="engrave" font-size="13">+</text>
        ${silk(462, 738, "CLR_CMOS", { s: 5.5, a: "middle" })}</g>`);
  add(`<g class="seg-wrap"><rect x="500" y="690" width="44" height="28" rx="3" fill="#0A0204" stroke="#2A0A10"/>
       <text x="522" y="711" text-anchor="middle" class="seg ghost">88</text><text x="522" y="711" text-anchor="middle" class="seg code" id="seg-code"></text>
       ${silk(522, 728, "DEBUG", { s: 5.5, a: "middle" })}</g>`);
  add(`<g class="pwr" role="button" tabindex="0" aria-label="Power button" data-probe="Power button">
        <circle cx="574" cy="704" r="15" class="pwr-btn"/>
        <path d="M574 696v8M567.5 699.5a9 9 0 1 0 13 0" class="pwr-icon"/>
        ${silk(574, 732, "PWR", { s: 6, a: "middle" })}</g>`);

  /* ---------- Installed parts (the projects) ---------- */
  const partAttrs = (x, ex, ey, extra = "") =>
    `class="part" data-id="${x.i}" data-kind="${x.slot.kind}" style="--c:${x.color};--ex:${ex}px;--ey:${ey}px" role="button" tabindex="0" aria-label="${esc(`${x.slot.label}: ${x.p.title}`)}" data-probe="${esc(`${x.slot.label}: ${x.p.title}`)}" ${extra}`;
  const callout = (x, cx, cy, tx, ty, anchor = "start") =>
    `<g class="callout"><path d="M${cx} ${cy}L${tx} ${ty}H${tx + (anchor === "end" ? -10 : 10)}"/><text x="${tx + (anchor === "end" ? -14 : 14)}" y="${ty + 4}" text-anchor="${anchor}">${esc(x.p.title)}</text></g>`;
  const abbr = (a) => (a.length > 9 ? a.split(/\s+/).map((w) => w[0]).join("") : a).toUpperCase();
  const short = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  // CPU
  const cpu = bySlot("cpu");
  if (cpu) {
    add(`<g ${partAttrs(cpu, 0, -34)} data-groups="cpu io">
      <rect class="hit" x="196" y="66" width="148" height="148" rx="6"/>
      <g class="body"><rect x="212" y="82" width="116" height="116" rx="7" fill="#11633A"/><rect x="220" y="90" width="100" height="100" rx="6" fill="url(#ihs)"/>
      <path d="M214 196l8-8" stroke="url(#gold)" stroke-width="3"/>
      <text x="270" y="126" text-anchor="middle" class="engrave" font-size="15">MY</text>
      <text x="270" y="144" text-anchor="middle" class="engrave" font-size="7">${esc(cpu.p.area.toUpperCase())}</text>
      <text x="270" y="158" text-anchor="middle" class="engrave" font-size="6.5">${esc(fmt(cpu.p.date).toUpperCase())}</text></g>
      <rect class="ring" x="192" y="62" width="156" height="156" rx="8"/>
      ${callout(cpu, 270, 78, 300, -6)}
    </g>`);
  } else add(cpuEmpty());

  // RAM sticks
  SLOTS.filter((s) => s.kind === "ram").forEach((s, n) => {
    const r = bySlot(s.id);
    if (!r) return;
    add(`<g ${partAttrs(r, n % 2 ? 8 : -8, -30)} data-groups="ram">
      <rect class="hit" x="${s.x - 6}" y="52" width="24" height="286"/>
      <g class="body"><rect x="${s.x - 4}" y="62" width="20" height="266" rx="3" fill="url(#metal-h)" stroke="#39424D"/>
      <rect x="${s.x + 4}" y="68" width="4" height="254" rx="2" class="rgb-fill" style="--i:${n + 1}"/>
      <text x="${s.x + 2}" y="${300}" class="engrave light" font-size="6.5" transform="rotate(-90 ${s.x + 2} 300)">${esc(short(r.p.title.toUpperCase(), 34))}</text></g>
      <rect class="ring" x="${s.x - 8}" y="56" width="28" height="278" rx="4"/>
      ${callout(r, s.x + 6, 60, s.x + 40 + n * 6, -6 + n * 12)}
    </g>`);
  });

  // M.2 drives
  SLOTS.filter((s) => s.kind === "ssd").forEach((s, n) => {
    const m = bySlot(s.id);
    if (!m) return;
    add(`<g ${partAttrs(m, 0, -24)} data-groups="ssd">
      <rect class="hit" x="${s.x}" y="${s.y}" width="244" height="34"/>
      <g class="body"><rect x="${s.x + 10}" y="${s.y + 4}" width="226" height="26" rx="4" fill="url(#metal-h)" stroke="#3A434E"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${s.x + 120 + i * 14} ${s.y + 8}l-10 18" stroke="#1B2026" stroke-width="3"/>`).join("")}
      <rect x="${s.x + 14}" y="${s.y + 25}" width="114" height="2" rx="1" class="rgb-fill" style="--i:${n + 4}"/>
      <text x="${s.x + 18}" y="${s.y + 19}" class="engrave light" font-size="7.5">${esc(short(m.p.title.toUpperCase(), 26))}</text></g>
      <rect class="ring" x="${s.x + 4}" y="${s.y}" width="238" height="34" rx="6"/>
      ${callout(m, s.x + 220, s.y + 4, 470 + n * 10, s.y - 30, "start")}
    </g>`);
  });

  // GPU
  const gpu = bySlot("gpu");
  if (gpu) {
    const fan = (cx, cy, id) => {
      let blades = "";
      for (let i = 0; i < 9; i++) blades += `<path d="M0 -7C16 -10 30 -26 24 -44C11 -38 2 -22 0 -7Z" transform="rotate(${i * 40})"/>`;
      return `<g transform="translate(${cx} ${cy})"><circle r="56" class="fan-ring"/><circle r="51" class="fan-in"/>
        <g class="blades" id="${id}">${blades}</g><circle r="13" fill="url(#hub)" stroke="#3A424C"/>
        <text y="3.5" text-anchor="middle" class="engrave light" font-size="8">MY</text></g>`;
    };
    add(`<g ${partAttrs(gpu, 0, -44)} data-groups="gpu">
      <rect class="hit" x="12" y="342" width="536" height="132" rx="12"/>
      <g class="body"><rect x="12" y="342" width="536" height="132" rx="14" fill="url(#shroud)" stroke="#2C333C"/>
      <path d="M26 356H90L104 342M470 474L484 460H534" class="cut"/>
      ${fan(166, 408, "fan1")}${fan(374, 408, "fan2")}
      <path d="M24 466H536" class="rgb" style="--i:2"/>
      <text x="508" y="384" text-anchor="middle" class="engrave light" font-size="9">${esc(abbr(gpu.p.area))}</text>
      ${[0, 1, 2, 3, 4].map((i) => `<path d="M${486 + i * 9} 398V448" stroke="#0B0E11" stroke-width="4" stroke-linecap="round"/>`).join("")}</g>
      <rect class="ring" x="8" y="338" width="544" height="140" rx="16"/>
      ${callout(gpu, 520, 350, 560, 300, "start")}
    </g>`);
  }

  // Expansion module (dev board look)
  const mod = bySlot("x1");
  if (mod) {
    add(`<g ${partAttrs(mod, -6, -30)} data-groups="module">
      <rect class="hit" x="28" y="482" width="196" height="76" rx="6"/>
      <g class="body"><rect x="28" y="482" width="196" height="76" rx="6" fill="#00838A" stroke="#0B676C"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="${78 + i * 8.5}" y="487" width="5" height="5" fill="#111" stroke="url(#gold)" stroke-width="1"/><rect x="${78 + i * 8.5}" y="548" width="5" height="5" fill="#111" stroke="url(#gold)" stroke-width="1"/>`).join("")}
      <rect x="20" y="498" width="34" height="26" rx="2" fill="url(#ihs)"/>
      <rect x="120" y="506" width="56" height="22" rx="2" fill="#15181C"/>
      <text x="148" y="520" text-anchor="middle" class="engrave light" font-size="6">MCU</text>
      <text x="66" y="542" class="silk-w" font-size="6.5">${esc(short(mod.p.title.toUpperCase(), 30))}</text>
      <circle cx="200" cy="518" r="3" class="led-g"/></g>
      <rect class="ring" x="24" y="478" width="204" height="84" rx="8"/>
      ${callout(mod, 210, 552, 236, 578)}
    </g>`);
  }

  // Lower expansion card
  const card = bySlot("x16b");
  if (card) {
    add(`<g ${partAttrs(card, 0, -30)} data-groups="card">
      <rect class="hit" x="150" y="598" width="266" height="52" rx="8"/>
      <g class="body"><rect x="150" y="598" width="266" height="52" rx="8" fill="url(#shroud)" stroke="#2C333C"/>
      <path d="M162 640H404" class="rgb" style="--i:5"/>
      <text x="164" y="622" class="engrave light" font-size="8">${esc(short(card.p.title.toUpperCase(), 36))}</text></g>
      <rect class="ring" x="146" y="594" width="274" height="60" rx="10"/>
      ${callout(card, 300, 600, 300, 560)}
    </g>`);
  }

  // darkness overlay while powered off
  add(`<rect class="dark" x="-40" y="-14" width="680" height="792" pointer-events="none"/>`);
  svg.insertAdjacentHTML("beforeend", B.join(""));

  /* =========================================================
     FANS (speed follows how fast you move the mouse)
     ========================================================= */
  const fans = ["#fan1", "#fan2"].map((id) => svg.querySelector(id)).filter(Boolean).map((el) => {
    const a = el.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 900, iterations: Infinity });
    a.playbackRate = 0;
    return a;
  });
  let fanTarget = 0, fanNow = 0, load = 0, lastMove = { x: 0, y: 0, t: performance.now() };
  addEventListener("pointermove", (e) => {
    const now = performance.now();
    const dt = Math.max(16, now - lastMove.t);
    const v = Math.hypot(e.clientX - lastMove.x, e.clientY - lastMove.y) / dt;
    load = Math.min(1, load + v * 0.04);
    lastMove = { x: e.clientX, y: e.clientY, t: now };
  }, { passive: true });
  const tempEl = $("#temp"), rpmEl = $("#rpm");
  let lastUi = 0;
  const tick = (t) => {
    load *= 0.985;
    const target = powered ? 1 + load * 3 : 0;
    fanNow += (target - fanNow) * 0.04;
    if (!reduced) fans.forEach((a) => (a.playbackRate = fanNow));
    if (t - lastUi > 250) {
      lastUi = t;
      rpmEl.textContent = powered ? Math.round(fanNow * 1150) : 0;
      tempEl.textContent = powered ? Math.round(34 + load * 38) : "--";
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  /* =========================================================
     INSPECTOR + PART SELECTION
     ========================================================= */
  const inspector = $("#inspector");
  const partEls = $$(".part");
  const list = $("#parts-list");
  list.innerHTML =
    placed
      .map(
        (x) => `<li><button type="button" data-id="${x.i}" style="--c:${x.color}"><span class="sl caption-5">${esc(x.slot.label)}</span><span class="tt body-5">${esc(x.p.title)}</span></button></li>`
      )
      .join("") +
    unplaced.map((p) => `<li><span class="row"><span class="sl caption-5">No free slot</span><span class="tt body-5">${esc(p.title)}</span></span></li>`).join("");
  let selected = -1;
  const flowOn = (groups, on, cls = "hot") =>
    svg.querySelectorAll(".flow").forEach((f) => groups.includes(f.dataset.g) && f.classList.toggle(cls, on));

  const showPart = (i, { sound = true } = {}) => {
    const x = placed.find((q) => q.i === +i);
    if (!x) return;
    selected = x.i;
    partEls.forEach((el) => el.classList.toggle("sel", +el.dataset.id === x.i));
    list.querySelectorAll("button").forEach((b) => b.setAttribute("aria-current", String(+b.dataset.id === x.i)));
    const el = partEls.find((e) => +e.dataset.id === x.i);
    if (el && !reduced) {
      el.classList.remove("seat");
      void el.getBBox();
      el.classList.add("seat");
    }
    if (sound) play("seat");
    const p = x.p;
    inspector.style.setProperty("--c", x.color);
    inspector.innerHTML = `
      <div class="spec" key="${x.i}">
        <p class="slot-name caption-4">Seated in ${esc(x.slot.label)}</p>
        <h2 class="heading-4">${esc(p.title)}</h2>
        <p class="meta body-6"><span class="area">${esc(p.area)}</span><span class="date">${fmt(p.date)}</span></p>
        ${p.image ? `<img class="shot" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : ""}
        <p class="summary body-3">${esc(p.summary)}</p>
        ${p.tags && p.tags.length ? `<ul class="tags caption-4">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        ${p.link ? `<a class="open body-5" href="${esc(p.link)}" target="_blank" rel="noopener">Open project <i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>` : ""}
        <div class="stepper caption-5">
          <button type="button" class="btn btn-quiet button-sm" data-step="-1"><i class="ph ph-arrow-left" aria-hidden="true"></i>Previous part</button>
          <span>${x.i + 1} of ${placed.length}</span>
          <button type="button" class="btn btn-quiet button-sm" data-step="1">Next part<i class="ph ph-arrow-right" aria-hidden="true"></i></button>
        </div>
      </div>`;
  };
  inspector.addEventListener("click", (e) => {
    const b = e.target.closest("[data-step]");
    if (!b || selected < 0) return;
    showPart((selected + +b.dataset.step + placed.length) % placed.length);
  });
  list.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-id]");
    if (b) {
      showPart(b.dataset.id);
      if (matchMedia("(max-width: 900px)").matches) inspector.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    }
  });

  partEls.forEach((el) => {
    const groups = (el.dataset.groups || "").split(" ");
    const on = () => powered && flowOn(groups, true);
    const off = () => flowOn(groups, false);
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focus", on);
    el.addEventListener("blur", off);
    el.addEventListener("click", () => {
      if (!powered) return powerOn();
      showPart(el.dataset.id);
      if (matchMedia("(max-width: 900px)").matches) inspector.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
    });
  });

  /* =========================================================
     PROBE (follows the cursor over the board)
     ========================================================= */
  const probe = $("#probe");
  svg.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const t = e.target.closest("[data-probe]");
    if (!t) { probe.classList.remove("show"); return; }
    probe.textContent = t.dataset.probe;
    probe.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
    probe.classList.add("show");
  });
  svg.addEventListener("pointerleave", () => probe.classList.remove("show"));

  /* =========================================================
     POWER ON / BOOT SEQUENCE
     ========================================================= */
  let powered = false, booting = false;
  const ledEls = (l) => $$(`[data-led="${l}"]`);
  const setLed = (l, on) => ledEls(l).forEach((e) => e.classList.toggle("on", on));
  const segEl = svg.querySelector("#seg-code"), postEl = $("#post-code");
  const setCode = (c) => { segEl.textContent = c; postEl.textContent = c; };
  setCode("--");

  const bootLog = (lines) => {
    inspector.style.removeProperty("--c");
    inspector.innerHTML = `<pre class="log" aria-label="Boot log"></pre>`;
    const pre = inspector.querySelector(".log");
    return lines.reduce((pr, line, i) => pr.then(() => { pre.textContent += (i ? "\n" : "") + line; return wait(reduced ? 0 : 170); }), Promise.resolve());
  };

  const powerOn = async () => {
    if (powered || booting) return;
    booting = true;
    root.classList.add("booting");
    play("key");
    fanWhoosh();
    const ram = placed.filter((x) => x.slot.kind === "ram").length;
    const lines = [
      "Power good",
      `CPU: ${cpu ? cpu.p.title : "socket empty"}`,
      `Memory: ${ram} module${ram === 1 ? "" : "s"} in dual channel`,
      `Graphics: ${gpu ? gpu.p.title : "none"}`,
      `Storage: ${placed.filter((x) => x.slot.kind === "ssd").length} M.2 drive(s)`,
      `${placed.length} projects detected`,
      "Booting...",
    ];
    const log = bootLog(lines);
    const codes = ["00", "19", "32", "4F", "60", "79", "99", "A2", "B4", "A0"];
    const ledsSeq = async () => {
      for (const l of ["cpu", "dram", "vga", "boot"]) {
        setLed(l, true);
        await wait(reduced ? 0 : 380);
        setLed(l, false);
      }
    };
    const codeSeq = async () => {
      for (const c of codes) { setCode(c); await wait(reduced ? 0 : 160); }
    };
    // current runs through every bus, in order
    const groups = ["cpu", "io", "ram", "gpu", "ssd", "chip", "module", "card", "audio"];
    groups.forEach((g, i) => setTimeout(() => flowOn([g], true, "boot"), reduced ? 0 : i * 140));
    root.classList.add("powered");
    powered = true;
    await Promise.all([ledsSeq(), codeSeq(), log]);
    const pre = inspector.querySelector(".log");
    if (pre) { pre.insertAdjacentHTML("beforeend", `\n<span class="ok">System ready</span>`); await wait(reduced ? 0 : 650); }
    setTimeout(() => flowOn(groups, false, "boot"), reduced ? 0 : 900);
    beep();
    root.classList.remove("booting");
    booting = false;
    if (placed.length) showPart(selected >= 0 ? selected : 0, { sound: false });
  };

  const powerOff = () => {
    powered = false;
    root.classList.remove("powered");
    setCode("--");
    partEls.forEach((e) => e.classList.remove("sel"));
  };
  const reboot = async () => {
    if (booting) return;
    powerOff();
    inspector.innerHTML = `<pre class="log">CMOS cleared. Restarting...</pre>`;
    await wait(reduced ? 0 : 1100);
    powerOn();
  };

  const pwr = svg.querySelector(".pwr");
  pwr.addEventListener("click", () => (powered ? reboot() : powerOn()));
  pwr.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pwr.click(); } });
  const cmos = svg.querySelector(".cmos");
  cmos.addEventListener("click", () => { play("key"); reboot(); });
  cmos.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cmos.click(); } });
  const jack = svg.querySelector(".jack");
  jack.addEventListener("click", () => { setSound(!soundOn); play("key"); });
  jack.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); jack.click(); } });

  // Board views
  const modeBtn = (id, cls) => {
    const b = $(id);
    b.addEventListener("click", () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      root.classList.toggle(cls, on);
      if (on && !powered) powerOn();
      if (cls === "xray") flowOn(["cpu", "io", "ram", "gpu", "ssd", "chip", "module", "card", "audio"], on, "xr");
    });
  };
  modeBtn("#mode-explode", "exploded");
  modeBtn("#mode-xray", "xray");

  /* =========================================================
     INTRO (press and hold the power button)
     ========================================================= */
  const intro = $("#intro");
  const big = $("#big-power");
  let holdT = null, introDone = false;
  const HOLD = 900;
  const finishIntro = (fast) => {
    if (introDone) return;
    introDone = true;
    document.body.classList.remove("intro-on");
    intro.classList.add("leaving");
    setTimeout(() => intro.remove(), reduced || fast ? 0 : 600);
    setTimeout(powerOn, reduced || fast ? 0 : 400);
    try { sessionStorage.setItem("introSeen", "1"); } catch {}
  };
  const startHold = (e) => {
    if (e) e.preventDefault();
    if (introDone) return;
    audio();
    big.classList.add("holding");
    holdT = setTimeout(() => finishIntro(false), reduced ? 0 : HOLD);
  };
  const stopHold = () => {
    if (introDone) return;
    clearTimeout(holdT);
    big.classList.remove("holding");
  };
  big.addEventListener("pointerdown", startHold);
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => big.addEventListener(ev, stopHold));
  big.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); finishIntro(false); } });
  big.addEventListener("click", (e) => { if (e.detail === 0) finishIntro(false); }); // keyboard-triggered click
  $("#intro-skip").addEventListener("click", () => finishIntro(true));
  let seen = false;
  try { seen = sessionStorage.getItem("introSeen") === "1"; } catch {}
  if (seen || location.hash) {
    finishIntro(true);
  }

  /* =========================================================
     UEFI SETUP
     ========================================================= */
  const tabs = $$('[role="tab"]');
  const HELP = {
    "t-main": "Who runs this machine, and where to find him.",
    "t-boot": "The order things happen in. Newest first.",
    "t-drivers": "Languages and tools installed and in use.",
    "t-exit": "Get in touch, grab the CV, or restart the board.",
  };
  const help = $("#uefi-help");
  const selectTab = (t, focus) => {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
    });
    help.innerHTML = `<h3 class="caption-4">Item help</h3><p class="body-6">${esc(HELP[t.id])}</p>`;
    if (focus) t.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        selectTab(tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length], true);
        play("click");
      }
    });
  });

  const today = new Date();
  $("#p-main").innerHTML = `
    <p class="about body-3">${esc(S.about)}</p>
    <dl class="info caption-2">
      ${(S.facts || []).map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("")}
      <div><dt>Projects installed</dt><dd>${projects.length}</dd></div>
      <div><dt>Firmware date</dt><dd>${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}</dd></div>
    </dl>`;
  const bootItems = [
    ...(S.experience || []).map((x) => ({ t: x.role, o: x.org, s: x.start, e: x.end, k: "Experience" })),
    ...(S.education || []).map((x) => ({ t: x.title, o: x.org, s: x.start, e: x.end, k: "Education" })),
  ].sort((a, b) => String(b.s).localeCompare(String(a.s)));
  $("#p-boot").innerHTML = `<h3 class="title-2">Boot priority</h3><ol class="boot-list">${bootItems
    .map((b, i) => `<li><span class="num caption-3">#${i + 1}</span><div><strong class="body-2">${esc(b.t)}</strong><span class="o body-6">${esc(b.o)}</span><span class="when caption-5">${esc(b.k)}, ${fmt(b.s)} to ${fmt(b.e)}</span></div></li>`)
    .join("")}</ol>`;
  $("#p-drivers").innerHTML = (S.toolkit || [])
    .map((g) => `<div class="drv"><h3 class="title-3">${esc(g.group)}</h3><ul>${g.items.map((it) => `<li class="body-6"><span>${esc(it)}</span><span class="ok caption-4">Loaded</span></li>`).join("")}</ul></div>`)
    .join("");
  $("#p-exit").innerHTML = `
    <div class="exit-grid">
      <div>
        <h3 class="title-2">Get in touch</h3>
        <p class="mail heading-5"><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></p>
        <div class="exit-actions">
          <button type="button" class="btn btn-primary button-sm" id="copy-email"><i class="ph ph-copy" aria-hidden="true"></i>Copy email</button>
          <a class="btn btn-quiet button-sm" href="${esc(S.cv)}" target="_blank" rel="noopener"><i class="ph ph-download-simple" aria-hidden="true"></i>Download CV</a>
          <a class="btn btn-quiet button-sm" href="${esc(S.linkedin)}" target="_blank" rel="noopener"><i class="ph ph-linkedin-logo" aria-hidden="true"></i>LinkedIn</a>
        </div>
        <p class="copy-status caption-2" id="copy-status" role="status"></p>
        <ul class="phones caption-2">${(S.phones || []).map((p) => `<li><span>${esc(p.label)}</span><a href="tel:${esc(p.value.replace(/\s/g, ""))}">${esc(p.value)}</a></li>`).join("")}</ul>
      </div>
      <div class="exit-reboot">
        <h3 class="title-2">Save changes and reboot</h3>
        <p class="body-6">Takes you back to the board and runs the boot sequence again.</p>
        <button type="button" class="btn btn-quiet button-sm" id="save-reboot"><i class="ph ph-arrow-counter-clockwise" aria-hidden="true"></i>Save and reboot <kbd>F10</kbd></button>
      </div>
    </div>`;
  selectTab(tabs[0]);

  $("#copy-email").addEventListener("click", async () => {
    const st = $("#copy-status");
    try { await navigator.clipboard.writeText(S.email); st.classList.remove("err"); st.textContent = `Copied ${S.email}`; }
    catch { st.classList.add("err"); st.textContent = "Copy failed in this browser. Select the address above instead."; }
    clearTimeout(st._t);
    st._t = setTimeout(() => (st.textContent = ""), 2500);
  });
  const saveReboot = () => {
    $("#top").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    setTimeout(reboot, reduced ? 0 : 500);
  };
  $("#save-reboot").addEventListener("click", saveReboot);

  const clock = $("#clock");
  const tickClock = () => {
    const n = new Date();
    clock.textContent = `${n.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}  ${n.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
  };
  tickClock();
  setInterval(tickClock, 1000);

  /* =========================================================
     PROOF LINE, WORK AREAS, TAGLINE, FAQ, REVEALS, NAV
     ========================================================= */
  const areaList = [...new Set(projects.map((p) => p.area))];
  const joinList = (arr) => (arr.length < 2 ? arr.join("") : `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`);
  $("#proof").innerHTML = `<b>${projects.length} projects</b> across ${esc(joinList(areaList.map((a) => a.toLowerCase().replace(/^ai$/, "AI"))))}`;

  $("#work-sub").textContent = "Each area links to its parts on the board above.";
  $("#areas").innerHTML = areaList
    .map((a) => {
      const items = placed.filter((x) => x.p.area === a);
      const n = projects.filter((p) => p.area === a).length;
      return `<article class="area-card" style="--c:${colorFor(a)}">
        <span class="led" aria-hidden="true"></span>
        <h3 class="title-1">${esc(a)}</h3>
        <p class="count caption-2">${n} project${n === 1 ? "" : "s"}</p>
        <ul>${items
          .map((x) => `<li><button type="button" class="body-5" data-goto="${x.i}"><span>${esc(x.p.title)}</span><span class="caption-5 go">View on board <i class="ph ph-arrow-up" aria-hidden="true"></i></span></button></li>`)
          .join("")}</ul>
      </article>`;
    })
    .join("");
  $("#areas").addEventListener("click", (e) => {
    const b = e.target.closest("[data-goto]");
    if (!b) return;
    $("#top").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    setTimeout(() => (powered ? showPart(b.dataset.goto) : powerOn().then(() => showPart(b.dataset.goto))), reduced ? 0 : 450);
  });

  // Tagline: words light up one at a time as they cross a line in the viewport
  const tag = $("#tagline");
  tag.innerHTML = (S.tagline || S.headline)
    .split(/\s+/)
    .map((w) => `<span class="w">${esc(w)}</span>`)
    .join(" ");
  const words = [...tag.querySelectorAll(".w")];
  if (reduced || !("IntersectionObserver" in window)) words.forEach((w) => w.classList.add("on"));
  else {
    const wo = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("on"); wo.unobserve(en.target); }
      }),
      { rootMargin: "0px 0px -42% 0px" }
    );
    words.forEach((w) => wo.observe(w));
  }

  // FAQ, written from content.js so it stays accurate
  const edu = (S.education || [])[0];
  const job = [...(S.experience || [])].sort((a, b) => String(b.start).localeCompare(String(a.start)))[0];
  const fact = (label) => ((S.facts || []).find((f) => f.label === label) || {}).value;
  const allTools = (S.toolkit || []).flatMap((g) => g.items);
  const FAQ = [
    edu && { q: "What are you studying?", a: `A ${edu.title} at ${edu.org}, from ${fmt(edu.start)} to ${fmt(edu.end)}.` },
    job && { q: "Where are you working?", a: `I'm ${/^[aeiou]/i.test(job.role) ? "an" : "a"} ${job.role} at ${job.org}, from ${fmt(job.start)} to ${fmt(job.end)}.` },
    { q: "What have you built so far?", a: `${projects.length} projects: ${joinList(projects.map((p) => p.title))}. Each one is a part on the board at the top of this page.` },
    allTools.length && { q: "Which tools and languages do you use?", a: `${joinList(allTools)}.` },
    fact("Based in") && { q: "Where are you based?", a: `${fact("Based in")}${fact("Also in") ? `, and also ${fact("Also in")}` : ""}.` },
    fact("Languages") && { q: "Which languages do you speak?", a: `${fact("Languages").replace(/, ([^,]*)$/, " and $1")}.` },
    { q: "How can I contact you?", a: `Email me at <a href="mailto:${esc(S.email)}">${esc(S.email)}</a>${(S.phones || []).length ? `, or call ${S.phones.map((p) => `<a href="tel:${esc(p.value.replace(/\s/g, ""))}">${esc(p.value)}</a> (${esc(p.label)})`).join(" or ")}` : ""}.`, html: true },
    { q: "Can I get your CV?", a: `Yes. <a href="${esc(S.cv)}" target="_blank" rel="noopener">Download it here</a>. It's also plugged into the USB port on the board.`, html: true },
  ].filter(Boolean);
  $("#faq-list").innerHTML = FAQ.map(
    (f) => `<details class="faq-item"><summary class="title-3">${esc(f.q)}<i class="ph ph-plus" aria-hidden="true"></i></summary><p class="answer body-3">${f.html ? f.a : esc(f.a)}</p></details>`
  ).join("");
  const strip = (h) => h.replace(/<[^>]+>/g, "");
  $("#faq-schema").textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })),
  });

  // Sections rise into place once
  const reveals = $$(".reveal");
  if (reduced || !("IntersectionObserver" in window)) reveals.forEach((r) => r.classList.add("in"));
  else {
    const ro = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } }),
      { threshold: 0.12 }
    );
    reveals.forEach((r) => ro.observe(r));
  }

  // Current section in the nav
  const navLinks = $$(".nav a");
  const navTargets = ["top", "work", "setup", "faq"].map((id) => document.getElementById(id));
  const no = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.setAttribute("aria-current", String(a.dataset.nav === en.target.id)));
    }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  navTargets.forEach((t) => t && no.observe(t));
  navLinks[0].setAttribute("aria-current", "true");

  /* ---------- Shut down: the ending ---------- */
  const shut = $("#shutdown");
  const powerDownSound = () => {
    if (!soundOn) return;
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const o = ac.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 0.6);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
    o.connect(g).connect(out(ac, 1));
    o.start(t);
    o.stop(t + 0.7);
  };
  let lastFocus = null;
  $("#shutdown-btn").addEventListener("click", () => {
    lastFocus = document.activeElement;
    powerDownSound();
    powerOff();
    shut.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => shut.classList.add("on")));
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#power-again").focus(), reduced ? 0 : 900);
  });
  const closeShut = () => {
    shut.classList.remove("on");
    document.body.style.overflow = "";
    setTimeout(() => (shut.hidden = true), reduced ? 0 : 700);
  };
  $("#power-again").addEventListener("click", () => {
    closeShut();
    $("#top").scrollIntoView({ behavior: "auto" });
    setTimeout(powerOn, reduced ? 0 : 400);
  });
  shut.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeShut(); if (lastFocus) lastFocus.focus(); }
  });

  // Keyboard shortcuts
  addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    if (e.key === "Delete") {
      e.preventDefault();
      $("#setup").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      tabs.find((t) => t.getAttribute("aria-selected") === "true").focus({ preventScroll: true });
      play("key");
    } else if (e.key === "F10") {
      e.preventDefault();
      saveReboot();
    }
  });
  $("#setup-link").addEventListener("click", () => setTimeout(() => tabs[0].focus({ preventScroll: true }), 400));
})();
