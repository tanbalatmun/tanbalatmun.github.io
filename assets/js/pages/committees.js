(function () {
  const { esc, i18n } = TM;
  const t = (k) => esc(i18n.t(k));
  const pick = (o) => esc(i18n.pick(o));

  // Overview: one big card per committee, each opening its own page.
  function render(content) {
    document.getElementById("committeeList").innerHTML = `
      <div class="ctiles">
        ${content.committees
          .map(
            (cm, i) => `
          <a class="ctile reveal reveal-d${(i % 3) + 1}" href="${esc(TM.committeeUrl(cm))}">
            <div class="ctile__badge">${esc(cm.code)}</div>
            <div class="ctile__body">
              <div class="ctile__name">${pick(cm.name)}</div>
              <div class="ctile__agenda"><small>${t("committees.agenda")}</small>${pick(cm.agenda)}</div>
              <div class="ctile__meta">
                <span><small>${t("committees.room")}</small>${esc(cm.room || "TBA")}</span>
                ${i18n.pick(cm.level) ? `<span><small>${t("committees.level")}</small>${pick(cm.level)}</span>` : ""}
              </div>
            </div>
            <span class="ctile__cta">${t("committees.open")}</span>
          </a>`
          )
          .join("")}
      </div>`;
  }

  TM.boot(render);
})();
