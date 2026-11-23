(function () {
  document.documentElement.classList.add("js");
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
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const RGB = ["#4C6FFF", "#9B6BFF", "#FF4FA3", "#FF5A47", "#FFB020", "#18C3A0"];

  /* ---------- Text bindings ---------- */
  document.querySelectorAll("[data-bind]").forEach((el) => {
    el.textContent = S[el.dataset.bind] || "";
  });
  $("#cv-link").href = S.cv;
  const emailLink = $("#email-link");
  emailLink.href = `mailto:${S.email}`;
  emailLink.textContent = S.email;

  /* ---------- Click sounds (made in the browser, no audio files) ---------- */
  const VOLUME = 0.22; // overall loudness: 0 = silent, 1 = loud
  let soundOn = true;
  try { soundOn = localStorage.getItem("sound") !== "off"; } catch {}
  let ctx = null;
  let noise = null;
  const audio = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      noise = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  // kind: "key" = deep mechanical thock, "click" = light tick
  const play = (kind) => {
    if (!soundOn) return;
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const out = ac.createGain();
    out.gain.value = VOLUME * (kind === "key" ? 1 : 0.7);
    out.connect(ac.destination);

    // the "click" of the switch: a short filtered noise burst
    const src = ac.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = kind === "key" ? 2400 : 3800;
    bp.Q.value = 0.9;
    const ng = ac.createGain();
    ng.gain.setValueAtTime(kind === "key" ? 0.9 : 0.6, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    src.connect(bp).connect(ng).connect(out);
    src.start(t);

    // the "thock" body: a quick falling low tone
    const osc = ac.createOscillator();
    osc.type = "sine";
    const f = kind === "key" ? 170 : 420;
    osc.frequency.setValueAtTime(f * (0.95 + Math.random() * 0.1), t);
    osc.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.07);
    const og = ac.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(kind === "key" ? 0.7 : 0.25, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "key" ? 0.09 : 0.05));
    osc.connect(og).connect(out);
    osc.start(t);
    osc.stop(t + 0.12);
  };

  const setToggle = (btn, on) => {
    btn.setAttribute("aria-pressed", String(on));
    btn.querySelector(".state").textContent = on ? "On" : "Off";
  };
  const soundBtn = $("#sound-toggle");
  setToggle(soundBtn, soundOn);
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    setToggle(soundBtn, soundOn);
    try { localStorage.setItem("sound", soundOn ? "on" : "off"); } catch {}
    if (soundOn) play("click");
  });
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest("#sound-toggle, #music-toggle")) return;
    if (e.target.closest(".key, .mini-key")) play("key");
    else if (e.target.closest("a, button, .card")) play("click");
  });

  /* ---------- Background music: a slow, quiet ambient loop made live ---------- */
  const MUSIC_VOLUME = 0.12; // 0 = silent, 1 = loud
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12); // MIDI note to frequency
  // Am9, Fmaj7, Cmaj7, Em7 (MIDI notes)
  const CHORDS = [
    [45, 57, 60, 64, 71],
    [41, 57, 60, 64, 65],
    [48, 55, 59, 64, 67],
    [40, 55, 59, 62, 67],
  ];
  const MELODY = [69, 71, 72, 74, 76, 79, 81]; // A minor, gentle upper notes
  const BAR = 8; // seconds per chord
  let music = null;

  const makeReverb = (ac) => {
    const len = ac.sampleRate * 4;
    const buf = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const c = ac.createConvolver();
    c.buffer = buf;
    return c;
  };

  const startMusic = () => {
    const ac = audio();
    if (!ac || music) return;
    const master = ac.createGain();
    master.gain.setValueAtTime(0.0001, ac.currentTime);
    master.gain.exponentialRampToValueAtTime(MUSIC_VOLUME, ac.currentTime + 3);
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    const verb = makeReverb(ac);
    const wet = ac.createGain();
    wet.gain.value = 0.7;
    lp.connect(master);
    lp.connect(verb).connect(wet).connect(master);
    master.connect(ac.destination);

    const pad = (notes, t) => {
      notes.forEach((m, n) => {
        [-6, 6].forEach((cents) => {
          const o = ac.createOscillator();
          o.type = n === 0 ? "sine" : "triangle";
          o.frequency.value = hz(m);
          o.detune.value = cents;
          const g = ac.createGain();
          const peak = (n === 0 ? 0.09 : 0.035);
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(peak, t + 2.5);
          g.gain.setValueAtTime(peak, t + BAR - 1);
          g.gain.exponentialRampToValueAtTime(0.0001, t + BAR + 2);
          o.connect(g).connect(lp);
          o.start(t);
          o.stop(t + BAR + 2.2);
        });
      });
    };
    const pluck = (m, t) => {
      const o = ac.createOscillator();
      o.type = "sine";
      o.frequency.value = hz(m);
      const o2 = ac.createOscillator();
      o2.type = "sine";
      o2.frequency.value = hz(m) * 2;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
      const g2 = ac.createGain();
      g2.gain.value = 0.25;
      o.connect(g).connect(lp);
      o2.connect(g2).connect(g);
      o.start(t); o2.start(t);
      o.stop(t + 3); o2.stop(t + 3);
    };

    let bar = 0;
    let next = ac.currentTime + 0.1;
    const schedule = () => {
      while (next < ac.currentTime + BAR) {
        pad(CHORDS[bar % CHORDS.length], next);
        // a few unhurried notes per chord, sometimes none
        const count = Math.floor(Math.random() * 3) + (bar % 2);
        for (let i = 0; i < count; i++) {
          pluck(MELODY[Math.floor(Math.random() * MELODY.length)], next + 1 + Math.random() * (BAR - 2));
        }
        next += BAR;
        bar++;
      }
    };
    schedule();
    music = { master, timer: setInterval(schedule, 2000) };
  };

  const stopMusic = () => {
    if (!music || !ctx) return;
    const { master, timer } = music;
    clearInterval(timer);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
    setTimeout(() => master.disconnect(), 1700);
    music = null;
  };

  const musicBtn = $("#music-toggle");
  musicBtn.addEventListener("click", () => {
    const on = musicBtn.getAttribute("aria-pressed") !== "true";
    setToggle(musicBtn, on);
    on ? startMusic() : stopMusic();
  });
  document.addEventListener("visibilitychange", () => {
    if (!ctx || !music) return;
    document.hidden ? ctx.suspend() : ctx.resume();
  });

  /* ---------- Keyboard name ---------- */
  const kb = $("#keyboard");
  kb.setAttribute("aria-label", S.name);
  let idx = 0;
  kb.innerHTML = S.name
    .toUpperCase()
    .split(/\s+/)
    .map(
      (word) =>
        `<span class="row" aria-hidden="true">${[...word]
          .map((ch) => {
            const i = idx++;
            return `<span class="key" data-k="${esc(ch)}" style="--i:${i};--c:${RGB[i % RGB.length]}"><span class="glow"></span><span class="cap">${esc(ch)}</span></span>`;
          })
          .join("")}</span>`
    )
    .join("");
  const keys = [...kb.querySelectorAll(".key")];

  const press = (key) => {
    key.classList.add("down", "lit");
    clearTimeout(key._t);
    key._t = setTimeout(() => {
      key.classList.remove("down");
      if (kb.classList.contains("wave")) key.classList.remove("lit");
    }, 140);
  };

  if (reduced) {
    keys.forEach((k) => k.classList.add("in"));
    kb.classList.add("ready", "wave");
  } else {
    // Type the name out, one key at a time
    keys.forEach((k, i) => {
      setTimeout(() => {
        k.classList.add("in");
        setTimeout(() => press(k), 160);
      }, 250 + i * 70);
    });
    setTimeout(() => {
      kb.classList.add("ready", "wave");
      keys.forEach((k) => k.classList.remove("lit"));
    }, 250 + keys.length * 70 + 700);
  }

  keys.forEach((k) => {
    k.addEventListener("pointerdown", () => press(k));
  });
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    if (e.target.closest("input, textarea, [contenteditable]")) return;
    const hits = keys.filter((k) => k.dataset.k === e.key.toUpperCase());
    hits.forEach(press);
    if (hits.length) play("key");
  });

  /* ---------- Nav highlight ---------- */
  const navLinks = [...document.querySelectorAll(".nav ul a")];
  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${en.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  ["work", "about", "toolkit", "contact"].forEach((id) => sectionObs.observe(document.getElementById(id)));
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting) navLinks.forEach((a) => a.classList.remove("active"));
  }, { threshold: 0.6 }).observe($(".hero"));

  /* ---------- Work log ---------- */
  const FALLBACK = ["#18C3A0", "#FF4FA3", "#3CC8F0", "#E0B400", "#FF8A3D"];
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
      .map((a) => `<button type="button" class="chip" aria-pressed="false" data-area="${esc(a)}" style="--c:${colorFor(a)}">${esc(a)}</button>`)
      .join("");

  const cardsEl = $("#cards");
  cardsEl.innerHTML = projects
    .map(
      (p) => `
      <article class="card" data-area="${esc(p.area)}" style="--c:${colorFor(p.area)}">
        <div class="card-meta"><span class="area">${esc(p.area)}</span><span class="date">${fmt(p.date)}</span></div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.summary)}</p>
        ${p.link ? `<a class="card-link" href="${esc(p.link)}" target="_blank" rel="noopener">Open project</a>` : ""}
        ${p.tags && p.tags.length ? `<ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      </article>`
    )
    .join("");
  const cards = [...cardsEl.querySelectorAll(".card")];

  const layout = () => {
    const visible = cards.filter((c) => !c.hidden);
    cards.forEach((c) => c.classList.remove("lead"));
    if (visible.length) visible[0].classList.add("lead");
    return visible;
  };
  const reveal = (list) => {
    list.forEach((c, i) => {
      c.classList.remove("shown");
      c.style.setProperty("--d", `${i * 0.08}s`);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => list.forEach((c) => c.classList.add("shown"))));
  };
  layout();

  if (reduced || !("IntersectionObserver" in window)) {
    cards.forEach((c) => c.classList.add("shown"));
  } else {
    const obs = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          reveal(cards.filter((c) => !c.hidden));
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(cardsEl);
  }

  $("#filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const area = chip.dataset.area;
    document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    cards.forEach((c) => (c.hidden = !!area && c.dataset.area !== area));
    const visible = layout();
    setCount(visible.length);
    reveal(visible);
  });

  // Cursor light on cards
  cardsEl.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });

  /* ---------- About ---------- */
  $("#facts").innerHTML = (S.facts || [])
    .map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)
    .join("");
  const timeline = (list, titleKey, subKey, color) =>
    [...(list || [])]
      .sort((a, b) => String(b.start).localeCompare(String(a.start)))
      .map(
        (x) =>
          `<li style="--c:${color}"><strong>${esc(x[titleKey])}</strong><span class="org">${esc(x[subKey])}</span><span class="when">${fmt(x.start)} to ${fmt(x.end)}</span></li>`
      )
      .join("");
  $("#experience").innerHTML = timeline(S.experience, "role", "org", "#FF4FA3");
  $("#education").innerHTML = timeline(S.education, "title", "org", "#4C6FFF");

  /* ---------- Toolkit ---------- */
  const KIT = ["#4C6FFF", "#9B6BFF", "#18C3A0", "#FFB020", "#FF4FA3", "#FF5A47"];
  $("#kit").innerHTML = (S.toolkit || [])
    .map(
      (g, i) =>
        `<div style="--c:${KIT[i % KIT.length]}"><h3>${esc(g.group)}</h3><ul class="mini-keys">${g.items
          .map((it) => `<li class="mini-key">${esc(it)}</li>`)
          .join("")}</ul></div>`
    )
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
})();
