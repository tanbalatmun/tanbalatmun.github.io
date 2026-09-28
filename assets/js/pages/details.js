(function () {
  const { esc, i18n } = TM;
  const t = (k) => esc(i18n.t(k));
  const pick = (o) => esc(i18n.pick(o));
  let activeDay = 0;

  const ICON = {
    date: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    venue: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="1.8"><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    committees: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  };

  function renderSchedule(content) {
    const days = content.schedule;
    const el = document.getElementById("schedule");
    if (!days.length) { el.innerHTML = `<p class="muted">${t("details.schedule.note")}</p>`; return; }
    if (activeDay >= days.length) activeDay = 0;
    const day = days[activeDay];
    const allTba = days.every((d) => d.items.every((it) => !it.time || /^tba$/i.test(it.time.trim())));

    el.innerHTML = `
      ${
        days.length > 1
          ? `<div class="tabs" role="tablist">${days
              .map(
                (d, i) => `<button role="tab" aria-selected="${i === activeDay}" class="${i === activeDay ? "is-active" : ""}" data-day="${i}">
                  ${pick(d.label)}<small>${pick(d.date)}</small></button>`
              )
              .join("")}</div>`
          : `<p class="muted">${pick(day.date)}</p>`
      }
      <ol class="timeline">
        ${day.items
          .map((it) => `<li><span class="timeline__time">${esc(it.time || "TBA")}</span><span class="timeline__title">${pick(it.title)}</span></li>`)
          .join("")}
      </ol>
      ${allTba ? `<p class="note">${t("details.schedule.note")}</p>` : ""}`;

    el.querySelectorAll("[data-day]").forEach((b) =>
      b.addEventListener("click", () => {
        activeDay = Number(b.dataset.day);
        renderSchedule(content);
      })
    );
  }

  function render(content) {
    const c = content.conference;
    document.getElementById("info").innerHTML = `
      <div class="info reveal"><div class="info__icon">${ICON.date}</div>
        <div class="info__label">${t("details.date")}</div><div class="info__value">${pick(c.dateLabel)}</div></div>
      <div class="info reveal reveal-d1"><div class="info__icon">${ICON.venue}</div>
        <div class="info__label">${t("details.venue")}</div><div class="info__value">${pick(c.venue)}</div></div>
      <div class="info reveal reveal-d2"><div class="info__icon">${ICON.committees}</div>
        <div class="info__label">${t("details.committees")}</div>
        <div class="info__value">${content.committees.map((cm) => esc(cm.code)).join(" · ")}</div></div>`;

    document.getElementById("rooms").innerHTML = `
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>${t("details.rooms.committee")}</th><th>${t("details.rooms.room")}</th></tr></thead>
          <tbody>
            ${content.committees
              .map(
                (cm) => `<tr>
                  <td>${esc(cm.code)}<small>${pick(cm.name)}</small></td>
                  <td class="room">${esc(cm.room || "TBA")}</td></tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;

    renderSchedule(content);
  }

  TM.boot(render);
})();
