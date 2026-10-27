/* Team page: everyone from content.team, grouped. */
(function () {
  const { esc, i18n } = TM;
  const t = (k) => esc(i18n.t(k));

  const GROUPS = ["secretariat", "academic", "boards", "organization", "advisors"];

  function card(m, featured) {
    return `
      <div class="member${featured ? " member--featured" : ""} reveal">
        ${TM.avatarHTML(m, "member__photo")}
        <div class="member__name">${esc(m.name)}</div>
        <div class="member__role">${esc(m.role || "")}</div>
      </div>`;
  }

  function render(content) {
    const team = (content.team || []).filter((m) => String(m.name || "").trim());
    const root = document.getElementById("teamRoot");

    if (!team.length) {
      root.innerHTML = `<p class="sponsors-empty reveal">${t("team.empty")}</p>`;
      return;
    }

    // Custom groups (typed in /admin) go after the Organization Team, in the order
    // they first appear; names are matched ignoring upper/lower case.
    const customNames = [];
    team.forEach((m) => {
      const name = String(m.groupName || "").trim();
      if (m.group === "custom" && name && !customNames.some((n) => n.toLowerCase() === name.toLowerCase())) customNames.push(name);
    });
    const sections = [];
    GROUPS.forEach((g) => {
      sections.push({ g, title: i18n.t("team.group." + g), members: team.filter((m) => (m.group || "organization") === g) });
      if (g === "organization") {
        customNames.forEach((name) =>
          sections.push({
            g: "custom",
            title: name,
            members: team.filter((m) => m.group === "custom" && String(m.groupName || "").trim().toLowerCase() === name.toLowerCase()),
          })
        );
      }
    });

    root.innerHTML = sections.map(({ g, title, members }) => {
      if (!members.length) return "";

      let body;
      if (g === "boards") {
        // one row per committee, in the committee order of the site
        const codes = content.committees.map((c) => c.code);
        const extra = [...new Set(members.map((m) => m.committee).filter((c) => !codes.includes(c)))];
        body = [...codes, ...extra]
          .map((code) => {
            const board = members.filter((m) => m.committee === code).sort((a, b) => TM.boardRank(a.role) - TM.boardRank(b.role));
            if (!board.length) return "";
            const cm = content.committees.find((c) => c.code === code);
            return `
              <div class="board reveal">
                <div class="board__head">
                  ${cm ? `<a href="${esc(TM.committeeUrl(cm))}">${esc(code)}</a>` : esc(code || "—")}
                  ${cm ? `<span>${esc(i18n.pick(cm.name))}</span>` : ""}
                </div>
                <div class="members members--board">${board.map((m) => card(m)).join("")}</div>
              </div>`;
          })
          .join("");
      } else {
        // the Secretary-General gets a larger card
        body = `<div class="members">${members
          .map((m) => card(m, g === "secretariat" && /^secretary-general$/i.test(String(m.role).trim())))
          .join("")}</div>`;
      }

      return `
        <section class="team-group">
          <h2 class="team-group__title reveal">${esc(title)}</h2>
          ${body}
        </section>`;
    }).join("");
  }

  TM.boot(render);
})();
