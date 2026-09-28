(function () {
  const { esc, i18n } = TM;
  const t = (k) => esc(i18n.t(k));
  const pick = (o) => esc(i18n.pick(o));
  let timer = null;

  function countdown(startDate) {
    const el = document.getElementById("countdown");
    const target = new Date(startDate).getTime();
    clearInterval(timer);
    if (isNaN(target)) { el.innerHTML = ""; return; }

    const units = ["days", "hours", "minutes", "seconds"];
    el.innerHTML = `<div class="countdown" role="timer">${units
      .map(
        (u) => `<div class="countdown__cell"><span class="countdown__num" data-u="${u}">00</span>
                <span class="countdown__label">${t("hero.countdown." + u)}</span></div>`
      )
      .join("")}</div>`;

    const tick = () => {
      let diff = Math.max(0, target - Date.now());
      if (diff === 0) {
        clearInterval(timer);
        el.innerHTML = `<p class="countdown__done">${t("hero.started")}</p>`;
        return;
      }
      const parts = {
        days: Math.floor(diff / 864e5),
        hours: Math.floor((diff / 36e5) % 24),
        minutes: Math.floor((diff / 6e4) % 60),
        seconds: Math.floor((diff / 1e3) % 60),
      };
      for (const u of units) {
        el.querySelector(`[data-u="${u}"]`).textContent = String(parts[u]).padStart(2, "0");
      }
    };
    tick();
    timer = setInterval(tick, 1000);
  }

  const TIERS = ["main", "gold", "silver", "partner"];

  function sponsorCard(sp) {
    const url = TM.safeUrl(sp.website);
    const logo = TM.safeUrl(sp.logoUrl);
    const inner = logo
      ? `<img src="${esc(logo)}" alt="${esc(sp.name)}" loading="lazy">`
      : `<span class="sponsor__name">${esc(sp.name)}</span>`;
    return url
      ? `<a class="sponsor" href="${esc(url)}" target="_blank" rel="noopener" title="${esc(sp.name)} — ${t("sponsors.visit")}">${inner}</a>`
      : `<div class="sponsor" title="${esc(sp.name)}">${inner}</div>`;
  }

  function renderSponsors(content) {
    const list = (content.sponsors || []).filter((s) => s.name || s.logoUrl);
    const el = document.getElementById("sponsors");
    const groups = TIERS.map((tier) => ({ tier, items: list.filter((s) => (s.tier || "partner") === tier) })).filter((g) => g.items.length);
    el.innerHTML = `
      <div class="section__head section__head--center reveal">
        <span class="eyebrow">${t("sponsors.eyebrow")}</span>
        <h2>${t("sponsors.title")}</h2>
      </div>
      ${
        groups.length
          ? groups
              .map(
                (g) => `<div class="sponsors-tier reveal">
                  <div class="sponsors-tier__label">${t("sponsors.tier." + g.tier)}</div>
                  <div class="sponsors sponsors--${g.tier}">${g.items.map(sponsorCard).join("")}</div>
                </div>`
              )
              .join("")
          : `<p class="sponsors-empty reveal">${t("sponsors.empty")}</p>`
      }`;
  }

  function render(content) {
    const c = content.conference;

    document.getElementById("heroLogo").innerHTML = TM.logoHTML(content, "lg");
    document.getElementById("heroMeta").innerHTML = `<span>${pick(c.dateLabel)}</span><span>${pick(c.venue)}</span>`;
    document.getElementById("heroActions").innerHTML = `
      ${c.applicationsOpen ? `<a href="apply.html" class="btn btn--primary">${t("nav.apply")}</a>` : ""}
      <a href="committees.html" class="btn btn--ghost">${t("hero.explore")}</a>`;
    countdown(c.startDate);

    const days = content.schedule.length || 2;
    document.getElementById("facts").innerHTML = `
      <div class="facts">
        <div class="fact"><div class="fact__num">${days}</div><div class="fact__label">${t("home.facts.days")}</div></div>
        <div class="fact"><div class="fact__num">${content.committees.length}</div><div class="fact__label">${t("home.facts.committees")}</div></div>
        <div class="fact"><div class="fact__num">'${esc(String(c.year).slice(-2))}</div><div class="fact__label">${t("home.facts.edition")}</div></div>
      </div>`;

    const L = content.letter;
    document.getElementById("letter").innerHTML = `
      <div class="reveal">
        <span class="eyebrow">${t("home.letter.eyebrow")}</span>
        <h2>${t("home.letter.title")}</h2>
      </div>
      <div class="letter__body reveal reveal-d1">
        ${TM.paragraphs(i18n.pick(L.body))}
        ${
          L.author || i18n.pick(L.role)
            ? `<div class="letter__sign">
                 ${L.author ? `<div class="letter__name">${esc(L.author)}</div>` : ""}
                 <div class="letter__role">${pick(L.role)}</div>
               </div>`
            : ""
        }
      </div>`;

    document.getElementById("committeeCards").innerHTML = content.committees
      .map(
        (cm, i) => `
        <a class="card reveal reveal-d${(i % 3) + 1}" href="${esc(TM.committeeUrl(cm))}">
          <div class="card__code">${esc(cm.code)}</div>
          <div class="card__name">${pick(cm.name)}</div>
          <div class="card__agenda"><small>${t("committees.agenda")}</small>${pick(cm.agenda)}</div>
          <div class="card__more">${t("home.committees.more")}</div>
        </a>`
      )
      .join("");

    renderSponsors(content);

    document.getElementById("cta").innerHTML = `
      <div class="cta">
        <h2>${t("home.cta.title")}</h2>
        <p>${c.applicationsOpen ? t("home.cta.text") : t("home.cta.closed")}</p>
        ${c.applicationsOpen ? `<a href="apply.html" class="btn btn--primary">${t("nav.apply")}</a>` : ""}
      </div>`;
  }

  TM.boot(render);
})();
