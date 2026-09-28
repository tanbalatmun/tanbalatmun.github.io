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

  const PAGES = [
    { href: "index.html", key: "nav.home", id: "home" },
    { href: "committees.html", key: "nav.committees", id: "committees" },
    { href: "details.html", key: "nav.details", id: "details" },
    { href: "index.html#sponsors", key: "nav.sponsors", id: "sponsors" },
  ];

  TM.committeeUrl = (cm) => `committee.html?c=${encodeURIComponent(cm.id)}`;

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
        <a class="nav__brand" href="index.html">${TM.esc(c.name)}<span>'${TM.esc(String(c.year).slice(-2))}</span></a>
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
          <div class="lang" role="group" aria-label="Language">
            <button type="button" data-lang="en">EN</button>
            <button type="button" data-lang="tr">TR</button>
          </div>
          <a href="apply.html" class="btn btn--primary btn--sm${page === "apply" ? " is-active" : ""}" data-i18n="nav.apply"></a>
        </nav>
      </header>`;

    // Committees dropdown: one entry per committee (re-drawn on language change)
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
    el.querySelectorAll("[data-lang]").forEach((b) =>
      b.addEventListener("click", () => TM.i18n.setLang(b.dataset.lang))
    );
    const syncLang = () =>
      el.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === TM.i18n.lang));
    syncLang();
    TM.i18n.onChange(syncLang);

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
