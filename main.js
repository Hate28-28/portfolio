(function () {
  "use strict";
  const S = window.SITE;
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
  const joinList = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);

  /* ---------- Text from content.js ---------- */
  $$("[data-bind]").forEach((el) => (el.textContent = S[el.dataset.bind] || ""));
  $$(".cv-link").forEach((a) => (a.href = S.cv));
  $$(".mail-link").forEach((a) => (a.href = `mailto:${S.email}`));
  $("#mail-big").textContent = S.email;
  $("#li-link").href = S.linkedin;
  $("#year").textContent = `© ${new Date().getFullYear()} ${S.name}`;

  const FALLBACK = ["#2BE38A", "#FF3BD4", "#22D3EE", "#FFB020", "#FF8A3D"];
  const areaColors = { ...(S.areaColors || {}) };
  let fb = 0;
  const colorFor = (a) => (areaColors[a] ||= FALLBACK[fb++ % FALLBACK.length]);
  const projects = [...S.projects].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const areas = [...new Set(projects.map((p) => p.area))];

  /* ---------- Current role badge ---------- */
  const today = new Date();
  const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const jobs = [...(S.experience || [])].sort((a, b) => String(b.start).localeCompare(String(a.start)));
  const job = jobs[0];
  if (job) {
    const now = $("#now");
    if (String(job.start) > ym) now.textContent = `Starting ${fmt(job.start)}: ${job.role}, ${job.org}`;
    else if (!job.end || String(job.end) >= ym) now.textContent = `Now: ${job.role}, ${job.org}`;
    if (now.textContent) now.hidden = false;
  }

  $("#proof").innerHTML = `<b>${projects.length} projects</b> across ${esc(joinList(areas.map((a) => (a === "AI" ? a : a.toLowerCase()))))}`;

  /* ---------- Projects ---------- */
  $("#count").textContent = `${projects.length} project${projects.length === 1 ? "" : "s"}, newest first`;
  $("#cards").innerHTML = projects
    .map(
      (p) => `<article class="card" style="--c:${colorFor(p.area)}">
        <div class="card-top caption-4"><span class="area">${esc(p.area)}</span><span class="date">${fmt(p.date)}</span></div>
        <h3 class="heading-6">${esc(p.title)}</h3>
        ${p.image ? `<img class="shot" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : ""}
        <p class="summary body-3">${esc(p.summary)}</p>
        ${p.link ? `<a class="card-link body-5" href="${esc(p.link)}" target="_blank" rel="noopener">Open project <i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>` : ""}
        ${p.tags && p.tags.length ? `<ul class="tags caption-4">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      </article>`
    )
    .join("");
  $("#cards").addEventListener("pointermove", (e) => {
    const c = e.target.closest(".card");
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", `${e.clientX - r.left}px`);
    c.style.setProperty("--my", `${e.clientY - r.top}px`);
  });

  /* ---------- About ---------- */
  $("#facts").innerHTML = (S.facts || []).map((f) => `<div class="body-6"><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("");
  const items = [
    ...(S.experience || []).map((x) => ({ t: x.role, o: x.org, s: x.start, e: x.end, c: "#2BE38A" })),
    ...(S.education || []).map((x) => ({ t: x.title, o: x.org, s: x.start, e: x.end, c: "#3A7BFF" })),
  ].sort((a, b) => String(b.s).localeCompare(String(a.s)));
  $("#timeline").innerHTML = items
    .map((x) => {
      const upcoming = String(x.s) > ym;
      const current = !upcoming && (!x.e || String(x.e) >= ym);
      return `<li style="--c:${x.c}"><span class="when caption-5">${fmt(x.s)} to ${fmt(x.e)}</span>${
        upcoming ? `<span class="badge caption-4">Upcoming</span>` : current ? `<span class="badge caption-4">Current</span>` : ""
      }<strong class="body-2">${esc(x.t)}</strong><span class="org body-6">${esc(x.o)}</span></li>`;
    })
    .join("");

  /* ---------- Skills ---------- */
  $("#skill-groups").innerHTML = (S.toolkit || [])
    .map((g) => `<div class="skill-group"><h3 class="title-3">${esc(g.group)}</h3><ul class="body-6">${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`)
    .join("");

  /* ---------- Contact ---------- */
  $("#phones").innerHTML = (S.phones || [])
    .map((p) => `<li class="body-3"><span class="caption-5">Phone, ${esc(p.label)}</span><a href="tel:${esc(p.value.replace(/\s/g, ""))}">${esc(p.value)}</a></li>`)
    .join("");
  $("#copy-email").addEventListener("click", async () => {
    const st = $("#copy-status");
    try { await navigator.clipboard.writeText(S.email); st.classList.remove("err"); st.textContent = `Copied ${S.email}`; }
    catch { st.classList.add("err"); st.textContent = "Copy failed in this browser. Select the address above instead."; }
    clearTimeout(st._t);
    st._t = setTimeout(() => (st.textContent = ""), 3000);
  });

  /* ---------- FAQ (written from content.js) ---------- */
  const edu = (S.education || [])[0];
  const fact = (l) => ((S.facts || []).find((f) => f.label === l) || {}).value;
  const tools = (S.toolkit || []).flatMap((g) => g.items);
  const FAQ = [
    edu && { q: "What are you studying?", a: `A ${edu.title} at ${edu.org}, from ${fmt(edu.start)} to ${fmt(edu.end)}.` },
    job && { q: "Where are you working?", a: `${String(job.start) > ym ? "I'm starting" : "I'm working"} as ${/^[aeiou]/i.test(job.role) ? "an" : "a"} ${job.role} at ${job.org}, from ${fmt(job.start)} to ${fmt(job.end)}.` },
    { q: "What have you built?", a: `${projects.length} projects: ${joinList(projects.map((p) => p.title))}.` },
    tools.length && { q: "Which tools do you use?", a: `${joinList(tools)}.` },
    fact("Based in") && { q: "Where are you based?", a: `${fact("Based in")}${fact("Also in") ? `, and also ${fact("Also in")}` : ""}.` },
    fact("Languages") && { q: "Which languages do you speak?", a: `${fact("Languages").replace(/, ([^,]*)$/, " and $1")}.` },
    { q: "How can I get your CV?", a: `<a href="${esc(S.cv)}" target="_blank" rel="noopener">Download it here</a>, or email me at <a href="mailto:${esc(S.email)}">${esc(S.email)}</a>.`, html: true },
  ].filter(Boolean);
  $("#faq-list").innerHTML = FAQ.map(
    (f) => `<details class="faq-item"><summary class="title-3">${esc(f.q)}<i class="ph ph-plus" aria-hidden="true"></i></summary><p class="answer body-3">${f.html ? f.a : esc(f.a)}</p></details>`
  ).join("");
  $("#faq-schema").textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") } })),
  });

  /* ---------- Tagline: words light up as you scroll ---------- */
  const tag = $("#tagline");
  tag.innerHTML = (S.tagline || S.headline).split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
  const words = $$("#tagline .w");
  if (reduced || !("IntersectionObserver" in window)) words.forEach((w) => w.classList.add("on"));
  else {
    const wo = new IntersectionObserver(
      (en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("on"); wo.unobserve(e.target); } }),
      { rootMargin: "0px 0px -40% 0px" }
    );
    words.forEach((w) => wo.observe(w));
  }

  /* ---------- Section reveals and nav highlight ---------- */
  const reveals = $$(".reveal");
  if (reduced || !("IntersectionObserver" in window)) reveals.forEach((r) => r.classList.add("in"));
  else {
    const ro = new IntersectionObserver(
      (en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    reveals.forEach((r) => ro.observe(r));
  }
  const navLinks = $$(".nav ul a");
  const no = new IntersectionObserver(
    (en) => en.forEach((e) => {
      if (e.isIntersecting) navLinks.forEach((a) => a.setAttribute("aria-current", String(a.dataset.nav === e.target.id)));
    }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  ["work", "about", "skills", "contact"].forEach((id) => no.observe(document.getElementById(id)));
  new IntersectionObserver(([e]) => { if (e.isIntersecting) navLinks.forEach((a) => a.removeAttribute("aria-current")); }, { threshold: 0.5 }).observe($("#top"));

  /* =========================================================
     INTERACTIVE CIRCUIT BACKGROUND
     Traces sit in two depth layers that shift with the mouse,
     a light follows the cursor, and small pulses of current
     run along the traces.
     ========================================================= */
  const cvs = $("#bg");
  const ctx = cvs.getContext("2d");
  const PULSE_COLORS = ["#3A7BFF", "#2BE38A", "#FF3B4E", "#FFB020"];
  let W = 0, H = 0, dpr = 1;
  let layers = [];
  const pointer = { x: innerWidth * 0.3, y: innerHeight * 0.4, tx: innerWidth * 0.3, ty: innerHeight * 0.4, active: false };
  const shift = { x: 0, y: 0 };
  let pulses = [];
  let lastPulse = 0;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const buildLayer = (count, depth, margin) => {
    const step = 28;
    const traces = [];
    const path = new Path2D();
    const vias = new Path2D();
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (let i = 0; i < count; i++) {
      let x = Math.round(rnd(-margin, W + margin) / step) * step;
      let y = Math.round(rnd(-margin, H + margin) / step) * step;
      const pts = [[x, y]];
      let d = pick(dirs.slice(0, 4));
      const segs = 2 + Math.floor(Math.random() * 3);
      for (let s = 0; s < segs; s++) {
        const len = step * (2 + Math.floor(Math.random() * 6));
        const k = d[0] && d[1] ? len * 0.7 : len;
        x += d[0] * k;
        y += d[1] * k;
        pts.push([x, y]);
        // turn by 45 degrees left or right, like real PCB routing
        const idx = dirs.findIndex((q) => q[0] === d[0] && q[1] === d[1]);
        const ring = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
        const ri = ring.findIndex((q) => q[0] === dirs[idx][0] && q[1] === dirs[idx][1]);
        d = ring[(ri + (Math.random() < 0.5 ? 1 : 7)) % 8];
      }
      path.moveTo(pts[0][0], pts[0][1]);
      pts.slice(1).forEach((p) => path.lineTo(p[0], p[1]));
      const end = pts[pts.length - 1];
      vias.moveTo(end[0] + 3.5, end[1]);
      vias.arc(end[0], end[1], 3.5, 0, Math.PI * 2);
      // cumulative lengths for pulses
      let total = 0;
      const lens = [0];
      for (let j = 1; j < pts.length; j++) { total += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); lens.push(total); }
      traces.push({ pts, lens, total });
    }
    return { traces, path, vias, depth };
  };

  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth;
    H = innerHeight;
    cvs.width = W * dpr;
    cvs.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const density = (W * H) / 16000;
    layers = [buildLayer(Math.round(density * 0.6), 14, 60), buildLayer(Math.round(density * 0.4), 34, 90)];
    pulses = [];
    if (reduced) draw(0);
  };

  const pointAlong = (t, d) => {
    let j = 1;
    while (j < t.lens.length && t.lens[j] < d) j++;
    const a = t.pts[j - 1], b = t.pts[Math.min(j, t.pts.length - 1)];
    const seg = t.lens[j] - t.lens[j - 1] || 1;
    const f = (d - t.lens[j - 1]) / seg;
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, W, H);
    // ease the cursor and the parallax shift
    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;
    let nx, ny;
    if (pointer.active) { nx = pointer.x / W - 0.5; ny = pointer.y / H - 0.5; }
    else { nx = Math.sin(time / 5200) * 0.25; ny = Math.cos(time / 6100) * 0.2; } // gentle drift on touch screens
    shift.x += (nx - shift.x) * 0.06;
    shift.y += (ny - shift.y) * 0.06;
    const lx = pointer.active ? pointer.x : W * (0.5 + nx), ly = pointer.active ? pointer.y : H * (0.45 + ny);

    layers.forEach((L, li) => {
      ctx.save();
      ctx.translate(-shift.x * L.depth * 2, -shift.y * L.depth * 2);
      // dim base traces
      ctx.lineWidth = li ? 1.6 : 1.2;
      ctx.lineJoin = "round";
      ctx.strokeStyle = li ? "rgba(70,82,96,.30)" : "rgba(70,82,96,.20)";
      ctx.stroke(L.path);
      ctx.fillStyle = li ? "rgba(90,104,120,.35)" : "rgba(90,104,120,.22)";
      ctx.fill(L.vias);
      // light that follows the cursor and brightens nearby traces
      const ox = lx + shift.x * L.depth * 2, oy = ly + shift.y * L.depth * 2;
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, li ? 260 : 200);
      g.addColorStop(0, li ? "rgba(58,123,255,.85)" : "rgba(43,227,138,.55)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = li ? 1.8 : 1.4;
      ctx.stroke(L.path);
      ctx.fillStyle = g;
      ctx.fill(L.vias);
      // current pulses on this layer
      pulses.filter((p) => p.layer === li).forEach((p) => {
        const [px, py] = pointAlong(p.t, p.d);
        const glow = ctx.createRadialGradient(px, py, 0, px, py, 14);
        glow.addColorStop(0, p.color);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = glow;
        ctx.fillRect(px - 14, py - 14, 28, 28);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      ctx.restore();
    });
  };

  let last = 0;
  const loop = (time) => {
    const dt = Math.min(50, time - last || 16);
    last = time;
    // start a new pulse every so often (more often near activity)
    if (time - lastPulse > 650 && pulses.length < 6) {
      lastPulse = time;
      const li = Math.random() < 0.65 ? 1 : 0;
      const t = pick(layers[li].traces);
      if (t && t.total > 80) pulses.push({ t, d: 0, layer: li, speed: rnd(0.12, 0.22), color: pick(PULSE_COLORS), alpha: 0 });
    }
    pulses.forEach((p) => {
      p.d += p.speed * dt;
      const f = p.d / p.t.total;
      p.alpha = f < 0.15 ? f / 0.15 : f > 0.85 ? (1 - f) / 0.15 : 1;
    });
    pulses = pulses.filter((p) => p.d < p.t.total);
    draw(time);
    requestAnimationFrame(loop);
  };

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    pointer.tx = e.clientX;
    pointer.ty = e.clientY;
    if (!pointer.active) { pointer.active = true; pointer.x = e.clientX; pointer.y = e.clientY; }
  }, { passive: true });
  document.addEventListener("pointerleave", () => (pointer.active = false));

  let rt;
  let lastW = innerWidth;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      // ignore phone address bar height changes
      if (innerWidth === lastW && Math.abs(innerHeight - H) < 140) return;
      lastW = innerWidth;
      resize();
    }, 150);
  });
  resize();
  if (!reduced) requestAnimationFrame(loop);
})();
