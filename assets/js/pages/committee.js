/* A single committee's own page: committee.html?c=<id> */
(function () {
  const { esc, i18n } = TM;
  const t = (k) => esc(i18n.t(k));
  const pick = (o) => esc(i18n.pick(o));

  const DOWNLOAD =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16"/></svg>';

  function render(content) {
    const root = document.getElementById("committeeRoot");
    const id = new URLSearchParams(location.search).get("c");
    const list = content.committees;
    const idx = list.findIndex((cm) => cm.id === id);

    if (idx === -1) {
      root.innerHTML = `
        <section class="page-head"><div class="wrap">
          <h1>${t("committee.notFound")}</h1>
          <a class="btn btn--ghost" href="committees.html">← ${t("committee.back")}</a>
        </div></section>`;
      return;
    }

    const cm = list[idx];
    const prev = list[(idx - 1 + list.length) % list.length];
    const next = list[(idx + 1) % list.length];
    const guide = TM.safeUrl(cm.guideUrl);
    // Board members are managed in the Team section (group "boards", committee = this code).
    const chairs = TM.teamFor(content, cm.code);
    document.title = `${cm.code} — ${content.conference.name}'${String(content.conference.year).slice(-2)}`;

    root.innerHTML = `
      <section class="chero">
        <div class="wrap">
          <a class="chero__back" href="committees.html">← ${t("committee.back")}</a>
          <div class="chero__grid">
            <div class="chero__badge reveal">${esc(cm.code)}</div>
            <div class="reveal reveal-d1">
              <span class="eyebrow">${t("committees.eyebrow")}</span>
              <h1>${esc(cm.code)}</h1>
              <p class="lead">${pick(cm.name)}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section--tight">
        <div class="wrap cpage">
          <div class="cpage__main">
            <div class="committee__agenda reveal">
              <small>${t("committees.agenda")}</small>
              <p>${pick(cm.agenda)}</p>
            </div>
            <div class="reveal">${TM.paragraphs(i18n.pick(cm.description))}</div>
            ${
              chairs.length
                ? `<div class="reveal">
                    <h3 class="cpage__h">${t("committee.chairs")}</h3>
                    <div class="chairs">
                      ${chairs
                        .map(
                          (ch) => `<div class="chair">
                            ${TM.avatarHTML(ch, "chair__avatar")}
                            <div><div class="chair__name">${esc(ch.name)}</div><div class="chair__role">${pick(ch.role)}</div></div>
                          </div>`
                        )
                        .join("")}
                    </div>
                  </div>`
                : ""
            }
          </div>

          <aside class="cpage__side reveal reveal-d1">
            <div class="cfacts">
              <div><small>${t("committees.room")}</small>${esc(cm.room || "TBA")}</div>
              ${i18n.pick(cm.level) ? `<div><small>${t("committees.level")}</small>${pick(cm.level)}</div>` : ""}
            </div>
            ${
              guide
                ? `<a class="btn btn--primary" href="${esc(guide)}" target="_blank" rel="noopener">${DOWNLOAD}${t("committees.guide")}</a>`
                : `<button class="btn btn--ghost" disabled>${t("committees.guideSoon")}</button>`
            }
            ${
              content.conference.applicationsOpen
                ? `<a class="btn btn--ghost" href="apply.html?first=${encodeURIComponent(cm.code)}">${t("committee.apply")}</a>`
                : ""
            }
          </aside>
        </div>
      </section>

      ${
        list.length > 1
          ? `<section class="section--tight">
              <div class="wrap cnav">
                <a href="${esc(TM.committeeUrl(prev))}" class="cnav__link"><small>← ${t("committee.prev")}</small>${esc(prev.code)}</a>
                <a href="${esc(TM.committeeUrl(next))}" class="cnav__link cnav__link--next"><small>${t("committee.next")} →</small>${esc(next.code)}</a>
              </div>
            </section>`
          : ""
      }`;
  }

  TM.boot(render);
})();
