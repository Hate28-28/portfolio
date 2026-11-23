(function () {
  const S = window.SITE;
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmt = (d) => {
    if (!d) return "Now";
    const [y, m] = String(d).split("-");
    return m ? `${MONTHS[+m - 1]} ${y}` : y;
  };

  /* ---------- Simple text bindings ---------- */
  document.querySelectorAll("[data-bind]").forEach((el) => {
    el.textContent = S[el.dataset.bind] || "";
  });

  /* Name split into lines for the reveal */
  const nameEl = $(".name");
  nameEl.setAttribute("aria-label", S.name);
  nameEl.innerHTML = S.name
    .split(" ")
    .map((w, i) => `<span class="line" aria-hidden="true"><span style="animation-delay:${1.1 + i * 0.12}s">${esc(w)}</span></span>`)
    .join("");
  [".headline", ".intro", ".actions"].forEach((sel, i) => {
    const el = $(sel);
    el.classList.add("fade-in");
    el.style.animationDelay = `${1.55 + i * 0.12}s`;
  });

  $("#cv-link").href = S.cv;
  const emailLink = $("#email-link");
  emailLink.href = `mailto:${S.email}`;
  emailLink.textContent = S.email;

  /* ---------- Work log ---------- */
  const FALLBACK = ["#2FD3A0", "#FF6FB5", "#3CC8F0", "#E8E04A", "#FF8A3D"];
  const areaColors = { ...(S.areaColors || {}) };
  let fb = 0;
  const colorFor = (area) => (areaColors[area] ||= FALLBACK[fb++ % FALLBACK.length]);

  const projects = [...S.projects].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const countEl = $("#project-count");
  const setCount = (n) => (countEl.textContent = `${n} project${n === 1 ? "" : "s"}`);
  setCount(projects.length);

  const areas = [...new Set(projects.map((p) => p.area))];
  $("#filters").innerHTML =
    `<button type="button" class="chip" aria-pressed="true" data-area="">All</button>` +
    areas
      .map(
        (a) =>
          `<button type="button" class="chip" aria-pressed="false" data-area="${esc(a)}" style="--c:${colorFor(a)}">${esc(a)}</button>`
      )
      .join("");

  const byYear = {};
  projects.forEach((p) => (byYear[String(p.date).slice(0, 4)] ||= []).push(p));

  $("#log").innerHTML = Object.keys(byYear)
    .sort((a, b) => b - a)
    .map(
      (year) => `
      <div class="year-group">
        <div class="year">${year}</div>
        <ul class="entries">
          ${byYear[year]
            .map((p, i) => {
              const id = `p-${year}-${i}`;
              return `
              <li class="entry" data-area="${esc(p.area)}" style="--c:${colorFor(p.area)}">
                <button class="entry-toggle" aria-expanded="false" aria-controls="${id}">
                  <span class="entry-title">${esc(p.title)}</span>
                  <span class="entry-meta"><span class="area">${esc(p.area)}</span><span class="date">${fmt(p.date)}</span></span>
                  <span class="plus" aria-hidden="true"></span>
                </button>
                <div class="entry-body" id="${id}"><div><div class="entry-inner">
                  <p>${esc(p.summary)}</p>
                  ${p.tags && p.tags.length ? `<ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
                  ${p.link ? `<a class="entry-link" href="${esc(p.link)}" target="_blank" rel="noopener">Open project</a>` : ""}
                </div></div></div>
              </li>`;
            })
            .join("")}
        </ul>
      </div>`
    )
    .join("");

  const setOpen = (btn, open) => {
    btn.setAttribute("aria-expanded", String(open));
    btn.parentElement.classList.toggle("open", open);
    document.getElementById(btn.getAttribute("aria-controls")).inert = !open;
  };
  document.querySelectorAll(".entry-toggle").forEach((btn) => {
    setOpen(btn, false);
    btn.addEventListener("click", () => setOpen(btn, btn.getAttribute("aria-expanded") !== "true"));
  });
  const first = document.querySelector(".entry-toggle");
  if (first) setOpen(first, true);

  // Area filter
  $("#filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const area = chip.dataset.area;
    document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    let shown = 0;
    document.querySelectorAll(".entry").forEach((en) => {
      const show = !area || en.dataset.area === area;
      en.hidden = !show;
      if (show) shown++;
    });
    document.querySelectorAll(".year-group").forEach((g) => {
      g.hidden = !g.querySelector(".entry:not([hidden])");
    });
    setCount(shown);
  });

  $("#facts").innerHTML = (S.facts || [])
    .map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)
    .join("");
  const timeline = (list, titleKey, subKey) =>
    [...(list || [])]
      .sort((a, b) => String(b.start).localeCompare(String(a.start)))
      .map(
        (x) => `<li><strong>${esc(x[titleKey])}</strong>${esc(x[subKey])}<br><span>${fmt(x.start)} to ${fmt(x.end)}</span></li>`
      )
      .join("");
  $("#experience").innerHTML = timeline(S.experience, "role", "org");
  $("#education").innerHTML = timeline(S.education, "title", "org");

  /* ---------- Toolkit ---------- */
  $("#parts").innerHTML = (S.toolkit || [])
    .map((g) => `<div><h3>${esc(g.group)}</h3><ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`)
    .join("");

  /* ---------- Contact ---------- */
  const links = [
    { label: "LinkedIn", value: "View profile", href: S.linkedin, ext: true },
    ...(S.phones || []).map((p) => ({ label: `Phone, ${p.label}`, value: p.value, href: `tel:${p.value.replace(/\s/g, "")}` })),
  ];
  $("#contact-list").innerHTML = links
    .map(
      (l) =>
        `<li><span>${esc(l.label)}</span><a href="${esc(l.href)}"${l.ext ? ' target="_blank" rel="noopener"' : ""}>${esc(l.value)}</a></li>`
    )
    .join("");
  $("#year").textContent = `© ${new Date().getFullYear()} ${S.name}`;

  $("#copy-email").addEventListener("click", async () => {
    const status = $("#copy-status");
    try {
      await navigator.clipboard.writeText(S.email);
      status.textContent = "Email copied.";
    } catch {
      status.textContent = "Copy didn't work here. Select the address above instead.";
    }
    clearTimeout(status._t);
    status._t = setTimeout(() => (status.textContent = ""), 2500);
  });

  /* ---------- Circuit traces (the one load animation) ---------- */
  const svg = document.querySelector(".traces");
  const hero = document.querySelector(".hero");
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  function drawTraces() {
    seed = 7;
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const ns = "http://www.w3.org/2000/svg";
    svg.innerHTML = "";
    const step = 28; // snap to the via grid
    const snap = (v) => Math.round(v / step) * step;
    // Keep traces out of the text: on wide screens they stay right of the
    // name; on narrow screens they stay above it.
    const narrow = w < 760;
    const heroTop = hero.getBoundingClientRect().top;
    const textTop = nameEl.getBoundingClientRect().top - heroTop;
    const textRight = Math.max(
      ...[nameEl, $(".headline"), $(".intro")].map((el) => el.getBoundingClientRect().right)
    );
    const xMin = narrow ? 0 : Math.min(textRight + 40, w * 0.72);
    const yMax = narrow ? Math.max(textTop - 40, h * 0.25) : h - 40;
    const clampX = (x) => Math.max(xMin + 20, Math.min(w - 20, x));
    const count = narrow ? 7 : Math.max(8, Math.round(w / 110));
    // Traces enter from the right edge and the top, bend 45°, and stop on a pad.
    for (let i = 0; i < count; i++) {
      const fromTop = i % 3 === 0;
      let pts;
      if (fromTop) {
        const x0 = snap(xMin + 30 + rand() * (w - xMin - 60));
        const y1 = snap(yMax * (0.15 + rand() * 0.35));
        const d = snap(30 + rand() * 90) * (rand() > 0.5 ? 1 : -1);
        const xe = clampX(x0 + d);
        const y2 = y1 + Math.abs(xe - x0);
        const y3 = Math.min(snap(y2 + 30 + rand() * yMax * 0.3), yMax);
        pts = [[x0, 0], [x0, y1], [xe, y2], [xe, Math.max(y3, y2 + 14)]];
      } else {
        const y0 = snap(yMax * (0.08 + rand() * 0.84));
        const x1 = snap(w - (w - xMin) * (0.08 + rand() * 0.3));
        const d = snap(30 + rand() * 90) * (rand() > 0.5 ? 1 : -1);
        const x2 = clampX(x1 - Math.abs(d));
        const ye = Math.max(20, Math.min(yMax, y0 + d));
        const x3 = clampX(snap(x2 - (40 + rand() * (w - xMin) * 0.4)));
        pts = [[w, y0], [x1, y0], [x2, ye], [x3, ye]];
      }
      const delay = 0.1 + i * 0.06;
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", "M" + pts.map((p) => p.join(" ")).join(" L"));
      path.setAttribute("pathLength", "1");
      path.style.animationDelay = `${delay}s`;
      svg.appendChild(path);

      const end = pts[pts.length - 1];
      const pad = document.createElementNS(ns, "circle");
      pad.setAttribute("cx", end[0]);
      pad.setAttribute("cy", end[1]);
      pad.setAttribute("r", 7);
      pad.style.animationDelay = `${delay + 1.45}s`;
      svg.appendChild(pad);

    }
  }
  drawTraces();
  let rt;
  let lastW = hero.clientWidth;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (hero.clientWidth === lastW) return; // ignore mobile URL-bar height changes
      lastW = hero.clientWidth;
      drawTraces();
    }, 200);
  });
})();
