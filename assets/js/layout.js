/*
 * Shared pieces of every public page: header, footer, starfield background,
 * scroll animations and small helpers.
 * Each page has <div id="site-header"></div> and <div id="site-footer"></div>.
 */
(function () {
  window.TM = window.TM || {};
  const t = (k) => TM.i18n.t(k);

  TM.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  // Plain text with blank lines -> paragraphs
  TM.paragraphs = function (text) {
    return String(text || "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${TM.esc(p).replace(/\n/g, "<br>")}</p>`)
      .join("");
  };

  // Recreation of the TanMUN wordmark so the year can change every edition.
  TM.logoHTML = function (content, size) {
    const c = content.conference;
    return `
      <span class="logo logo--${size || "md"}" aria-label="${TM.esc(c.name)} ${TM.esc(c.year)}">
        <span class="logo__tag">${TM.esc(TM.i18n.pick(c.tagline))}</span>
        <span class="logo__word"><span class="logo__tan">tan</span><span class="logo__mun">MUN</span></span>
        <span class="logo__year">${TM.esc(c.year)}</span>
      </span>`;
  };

  // Official TanMUN'27 mark (tan + bar + MUN '27), from the 2027 logo PDF; see assets/img/logo-mark.svg
  const LOGO_MARK = `<svg class="brand-mark" aria-hidden="true" focusable="false" viewBox="29.4 39 64.8 67.2"><path class="fg" fill-rule="nonzero" d="M61.9 59.25C58.31 60.87 54.56 62.55 51.34 64.84C48.43 66.91 45.35 70.68 48.14 74.2C51.17 78.02 57.44 76.57 60.22 73.18C61.86 71.18 61.98 68.4 62.07 65.92C62.15 63.79 62.09 61.6 62.02 59.48C62.02 59.35 62.02 59.34 61.9 59.25M43.3 75.95C43.36 77.57 43.26 79.2 43.3 80.82C39.96 81.3 36.04 80.7 34.47 77.36C33.93 76.21 33.73 74.77 33.66 73.51C33.38 68.42 33.52 62.37 33.66 57.24C33.66 57.06 33.69 56.92 33.77 56.76L30.19 57.73L30.19 53.34L33.66 52.2L33.66 39.73L38.43 39.73L38.43 50.57L49.11 47.1L49.16 48.07C55 45.97 62.72 46.61 65.64 52.84L69.32 51.59L69.32 47.09L74.09 47.09L74.09 50.67L75.01 49.81C81.35 44.27 93.14 46.66 93.39 56.14L93.39 80.81L88.62 80.81L88.62 57.77C88.62 55.31 86.62 52.14 84.16 51.5C79.17 50.2 74.17 53.6 74.09 58.85L74.09 80.81L69.32 80.81L69.32 56.31L66.5 57.18L66.5 80.81L61.73 80.81L61.73 76.91L59.49 78.73C54.5 81.88 46.65 81.44 43.5 75.95C43.44 75.9 43.37 75.93 43.31 75.93C43.29 75.42 43.07 75.26 42.9 74.76C40.41 67.49 44.72 63.1 50.47 59.62C53.73 57.65 57.37 56.09 60.98 54.89C58.42 48.84 50.63 51.13 46.4 53.91L45.79 52.84L38.49 55.21L38.43 71.86C38.6 74.21 39.11 76.49 41.96 76.25C42.43 76.21 42.96 75.93 43.31 75.92"/><path class="fg" fill-rule="nonzero" d="M74.1 83.66L74.02 92.62L71.53 92.6L71.58 87.66L69.84 92.59L67.76 92.57L66.1 87.57L66.05 92.55L63.56 92.53L63.64 83.57L66.65 83.6L68.84 89.44L71.09 83.64L74.09 83.67L74.1 83.66"/><path class="fg" fill-rule="nonzero" d="M77.96 83.69L77.91 88.89C77.91 89.37 78.01 89.75 78.24 90.01C78.46 90.27 78.8 90.41 79.26 90.41C79.72 90.41 80.06 90.28 80.3 90.02C80.54 89.76 80.66 89.39 80.66 88.91L80.71 83.71L83.2 83.73L83.15 88.93C83.15 89.75 82.96 90.45 82.61 91.03C82.26 91.61 81.78 92.04 81.18 92.32C80.58 92.61 79.92 92.75 79.19 92.74C78.46 92.73 77.81 92.58 77.24 92.28C76.67 91.98 76.23 91.54 75.91 90.97C75.59 90.39 75.43 89.69 75.44 88.86L75.49 83.66L77.97 83.68L77.96 83.69"/><path class="fg" fill-rule="nonzero" d="M92.78 92.79L90.29 92.77L87.02 87.73L86.97 92.74L84.48 92.72L84.56 83.76L87.05 83.78L90.32 88.88L90.37 83.81L92.86 83.83L92.78 92.79"/><path class="pink" fill-rule="nonzero" d="M30.18 83.39H61.34V85.59H30.18Z"/><text class="fg" x="80.99" y="100.4" font-family="Poppins, sans-serif" font-weight="800" font-size="8.22">‘27</text></svg>`;

  const PAGES = [
    { href: "index.html", key: "nav.home", id: "home" },
    { href: "committees.html", key: "nav.committees", id: "committees" },
    { href: "details.html", key: "nav.details", id: "details" },
    { href: "team.html", key: "nav.team", id: "team" },
    { href: "index.html#sponsors", key: "nav.sponsors", id: "sponsors" },
  ];

  TM.committeeUrl = (cm) => `committee.html?c=${encodeURIComponent(cm.id)}`;

  // Board roles in display order; anything else sorts after them.
  // Matched on how the role starts, so "Under-Secretary-General · DSG" still counts as a USG.
  // Unknown roles go between the board and the crisis team.
  const BOARD_ORDER = ["under-secretary-general", "guest chair", "chair", "co-chair", "vice-chair", "rapporteur", "", "crisis"];
  const rank = (role) => {
    const r = String(role || "").trim().toLowerCase();
    if (r.startsWith("crisis")) return BOARD_ORDER.indexOf("crisis");
    const i = BOARD_ORDER.findIndex((o) => o && (r === o || r.startsWith(o + " ") || r.startsWith(o + " ·")));
    return i === -1 ? BOARD_ORDER.indexOf("") : i;
  };

  // Members of one committee's board, in role order.
  TM.teamFor = function (content, code) {
    return (content.team || [])
      .filter((m) => m.name && m.group === "boards" && m.committee === code)
      .sort((a, b) => rank(a.role) - rank(b.role));
  };
  TM.boardRank = rank;

  // Round photo, or initials if there's no photo.
  TM.avatarHTML = function (m, cls) {
    const photo = TM.safeUrl(m.photoUrl);
    if (photo) return `<div class="${cls} has-photo"><img src="${TM.esc(photo)}" alt="" loading="lazy"></div>`;
    const initials = String(m.name || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    return `<div class="${cls}">${TM.esc(initials)}</div>`;
  };

  const ICONS = {
    instagram:
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  };

  function renderHeader(content) {
    const page = document.body.dataset.page;
    const el = document.getElementById("site-header");
    if (!el) return;
    const c = content.conference;
    el.innerHTML = `
      ${TM.data.live ? "" : `<div class="demo-banner" data-i18n="demo.banner"></div>`}
      <header class="nav" id="nav">
        <a class="nav__brand" href="index.html" aria-label="${TM.esc(c.name)} ${TM.esc(c.year)}, home">${LOGO_MARK}</a>
        <button class="nav__toggle" id="navToggle" aria-label="Menu" aria-expanded="false" aria-controls="navMenu">
          <span></span><span></span><span></span>
        </button>
        <nav class="nav__menu" id="navMenu">
          ${PAGES.map((p) =>
            p.id === "committees"
              ? `<div class="nav__drop" id="navDrop">
                   <a href="${p.href}" class="nav__link nav__link--drop${page === "committees" || page === "committee" ? " is-active" : ""}"
                      aria-haspopup="true" aria-expanded="false" data-i18n="${p.key}"></a>
                   <div class="nav__sub" id="navSub"></div>
                 </div>`
              : `<a href="${p.href}" class="nav__link${page === p.id ? " is-active" : ""}" data-i18n="${p.key}"></a>`
          ).join("")}
          <a href="apply.html" class="btn btn--primary btn--sm${page === "apply" ? " is-active" : ""}" data-i18n="nav.apply"></a>
        </nav>
      </header>`;

    // Committees dropdown: one entry per committee
    const sub = el.querySelector("#navSub");
    const current = new URLSearchParams(location.search).get("c");
    const drawSub = () => {
      sub.innerHTML =
        content.committees
          .map(
            (cm) => `<a href="${TM.esc(TM.committeeUrl(cm))}" class="nav__subitem${page === "committee" && current === cm.id ? " is-active" : ""}">
              <b>${TM.esc(cm.code)}</b><span>${TM.esc(TM.i18n.pick(cm.name))}</span></a>`
          )
          .join("") + `<a href="committees.html" class="nav__subitem nav__subitem--all">${TM.esc(t("nav.allCommittees"))} →</a>`;
    };
    drawSub();
    TM.i18n.onChange(drawSub);
    const drop = el.querySelector("#navDrop");
    const dropLink = drop.querySelector(".nav__link--drop");
    // On touch / mobile the first tap opens the list instead of navigating
    dropLink.addEventListener("click", (e) => {
      const touch = window.matchMedia("(hover: none), (max-width: 860px)").matches;
      if (touch && !drop.classList.contains("is-open")) {
        e.preventDefault();
        drop.classList.add("is-open");
        dropLink.setAttribute("aria-expanded", "true");
      }
    });
    document.addEventListener("click", (e) => {
      if (!drop.contains(e.target)) { drop.classList.remove("is-open"); dropLink.setAttribute("aria-expanded", "false"); }
    });

    const toggle = el.querySelector("#navToggle");
    const menu = el.querySelector("#navMenu");
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    const nav = el.querySelector("#nav");
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function renderFooter(content) {
    const el = document.getElementById("site-footer");
    if (!el) return;
    const c = content.conference;
    const draw = () => {
      el.innerHTML = `
        <footer class="footer">
          <div class="footer__logo">${TM.logoHTML(content, "sm")}</div>
          <nav class="footer__links">
            ${PAGES.map((p) => `<a href="${p.href}">${TM.esc(t(p.key))}</a>`).join("")}
            <a href="apply.html">${TM.esc(t("nav.apply"))}</a>
          </nav>
          ${
            TM.safeUrl(c.instagram)
              ? `<a class="footer__social" href="${TM.esc(TM.safeUrl(c.instagram))}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>`
              : ""
          }
          <p class="footer__copy">© ${TM.esc(c.year)} ${TM.esc(c.name)}. ${TM.esc(t("footer.rights"))}
            · <a href="admin/">${TM.esc(t("footer.organizers"))}</a></p>
        </footer>`;
    };
    draw();
    TM.i18n.onChange(draw);
  }

  // ---- starfield ----
  function starfield() {
    const canvas = document.createElement("canvas");
    canvas.className = "starfield";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars = [];
    let w, h, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 5200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.6 + 0.2,
        s: Math.random() * 0.02 + 0.004,
        p: Math.random() * Math.PI * 2,
        v: Math.random() * 0.06 + 0.01,
      }));
    }

    function frame(time) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = reduce ? 1 : 0.6 + 0.4 * Math.sin(time * s.s * 0.1 + s.p);
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = s.r > 1.1 ? "#cfe0ff" : "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduce) {
          s.y -= s.v;
          if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w; }
        }
      }
      if (!reduce) requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", () => { resize(); if (reduce) frame(0); });
    requestAnimationFrame(frame);
  }

  // ---- reveal-on-scroll ----
  TM.reveal = function (root) {
    const els = (root || document).querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((e) => io.observe(e));
  };

  /*
   * Boot a public page. `render(content)` draws the page body; it is
   * called again whenever the language changes.
   */
  TM.safeUrl = (u) => (/^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : "");

  // style="background-image: …" for a committee background, or "" if there is none.
  // Quotes/backslashes/newlines are percent-encoded so a link can't break out of url().
  TM.bgStyle = (u) => {
    const url = TM.safeUrl(u);
    if (!url) return "";
    const css = `url("${url.replace(/["\\\n\r]/g, (ch) => encodeURIComponent(ch))}")`;
    return ` style="background-image:${TM.esc(css)}"`;
  };

  // Pass `onLangChange` to update the page yourself instead of a full re-render
  // (used by the application form so typed answers aren't lost).
  TM.boot = async function (render, onLangChange) {
    starfield();
    const content = await TM.data.getContent();
    renderHeader(content);
    renderFooter(content);
    render(content);
    TM.i18n.apply();
    TM.reveal();
    TM.i18n.onChange(() => {
      if (onLangChange) onLangChange(content);
      else render(content);
      TM.i18n.apply();
      // re-rendered sections shouldn't fade in a second time
      document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible"));
    });
    document.body.classList.add("is-ready");
  };
})();
