/*
 * Organizer panel: login, application results and the website content editor.
 */
(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];
  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const LEVEL_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", native: "Native / Fluent" };
  const TEAM_GROUPS = [
    ["secretariat", "Secretariat"],
    ["academic", "Academic Team"],
    ["boards", "Committee Board"],
    ["organization", "Organization Team"],
    ["advisors", "Advisors"],
    ["custom", "Custom group…"],
  ];
  // Typing one of these roles picks the matching group automatically.
  const ROLE_GROUP = {
    "secretary-general": "secretariat",
    "deputy secretary-general": "secretariat",
    "under-secretary-general": "secretariat",
    "academic assistant": "academic",
    "head of academics": "academic",
    "guest chair": "boards",
    "chair": "boards",
    "co-chair": "boards",
    "vice-chair": "boards",
    "admin": "organization",
    "head of admin": "organization",
    "pr": "organization",
    "head of pr": "organization",
    "logistics": "organization",
    "design": "organization",
    "faculty advisor": "advisors",
  };
  const ROLE_SUGGESTIONS = [
    "Secretary-General", "Deputy Secretary-General", "Under-Secretary-General",
    "Academic Assistant", "Guest Chair", "Chair", "Co-Chair",
    "Head of Admin", "Admin", "Head of PR", "PR", "Logistics", "Design", "Faculty Advisor",
  ];
  const countWords = (s) => (String(s || "").trim().match(/\S+/g) || []).length;

  let content = null;     // last saved content
  let draft = null;       // content being edited
  let dirty = false;
  let apps = [];
  let openRow = null;

  // ---------- toast ----------
  let toastTimer;
  function toast(msg, type) {
    const el = $("#toast");
    el.textContent = msg;
    el.className = "toast is-visible" + (type ? " toast--" + type : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.className = "toast"), 3200);
  }

  // ---------- login ----------
  async function start() {
    document.body.classList.add("is-ready");
    $("#modeBadge").textContent = TM.data.live ? "Live database" : "Demo mode (this browser only)";
    $("#modeBadge").classList.toggle("mode--demo", !TM.data.live);
    if (await TM.data.isSignedIn()) showDashboard();
    else showLogin();
  }

  function showLogin() {
    $("#dashView").hidden = true;
    $("#loginView").hidden = false;
    $("#password").focus();
  }

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#loginBtn");
    btn.disabled = true;
    btn.textContent = "Checking…";
    $("#loginError").hidden = true;
    let ok = false;
    try {
      ok = await TM.data.signIn($("#password").value);
    } catch (err) {
      console.error(err);
    }
    btn.disabled = false;
    btn.textContent = "Enter";
    if (ok) {
      $("#password").value = "";
      showDashboard();
    } else {
      const code = TM.data.lastAuthError;
      const MESSAGES = {
        invalid_credentials: "Wrong password.",
        email_not_confirmed: "The organizer user isn't confirmed yet. In Supabase → Authentication → Users, confirm it.",
        email_provider_disabled: "Email login is turned off in Supabase → Authentication → Sign In / Providers.",
        over_request_rate_limit: "Too many attempts. Wait a minute and try again.",
      };
      $("#loginError").textContent = MESSAGES[code] || (code ? "Login failed: " + code : "Wrong password.");
      $("#loginError").hidden = false;
      $("#password").select();
    }
  });

  $("#logoutBtn").addEventListener("click", async () => {
    if (dirty && !confirm("You have unsaved content changes. Log out anyway?")) return;
    await TM.data.signOut();
    dirty = false;
    showLogin();
  });

  async function showDashboard() {
    $("#loginView").hidden = true;
    $("#dashView").hidden = false;
    content = await TM.data.getContent();
    draft = clone(content);
    renderEditor();
    fillCommitteeFilter();
    await loadApps();
  }

  // ---------- tabs ----------
  $$(".dash__tabs button").forEach((b) =>
    b.addEventListener("click", () => {
      $$(".dash__tabs button").forEach((x) => x.classList.toggle("is-active", x === b));
      $$("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== b.dataset.tab));
      window.scrollTo(0, 0);
    })
  );

  window.addEventListener("beforeunload", (e) => {
    if (dirty) { e.preventDefault(); e.returnValue = ""; }
  });

  // =====================================================
  //  Applications
  // =====================================================
  async function loadApps() {
    try {
      apps = await TM.data.listApplications();
    } catch (err) {
      console.error(err);
      toast("Could not load applications: " + (err.message || err), "error");
      apps = [];
    }
    $("#appCount").textContent = apps.length;
    renderStats();
    renderApps();
  }

  function fillCommitteeFilter() {
    const sel = $("#filterCommittee");
    const cur = sel.value;
    sel.innerHTML =
      `<option value="">All committees (1st choice)</option>` +
      content.committees.map((c) => `<option value="${esc(c.code)}">1st choice: ${esc(c.code)}</option>`).join("");
    sel.value = cur;
  }

  function renderStats() {
    const byFirst = {};
    content.committees.forEach((c) => (byFirst[c.code] = 0));
    apps.forEach((a) => { if (a.choice_1) byFirst[a.choice_1] = (byFirst[a.choice_1] || 0) + 1; });
    $("#stats").innerHTML = `
      <div class="stat stat--main"><div class="stat__num">${apps.length}</div><div class="stat__label">Total applications</div></div>
      ${Object.entries(byFirst)
        .map(([code, n]) => `<div class="stat"><div class="stat__num">${n}</div><div class="stat__label">${esc(code)} as 1st choice</div></div>`)
        .join("")}`;
  }

  function filtered() {
    const q = $("#search").value.trim().toLowerCase();
    const com = $("#filterCommittee").value;
    const lvl = $("#filterLevel").value;
    return apps.filter(
      (a) =>
        (!com || a.choice_1 === com) &&
        (!lvl || a.language_level === lvl) &&
        (!q || [a.full_name, a.email, a.phone, a.motivation].some((v) => String(v || "").toLowerCase().includes(q)))
    );
  }

  const fmtDate = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  function renderApps() {
    const list = filtered();
    const el = $("#appsTable");
    if (!apps.length) {
      el.innerHTML = `<div class="empty">No applications yet. They will appear here as soon as someone applies.</div>`;
      return;
    }
    if (!list.length) {
      el.innerHTML = `<div class="empty">No applications match your filters.</div>`;
      return;
    }
    el.innerHTML = `
      <table class="atable">
        <thead><tr>
          <th>#</th><th>Submitted</th><th>Name</th><th>Contact</th><th>Level</th>
          <th>1st</th><th>2nd</th><th>3rd</th><th>Letter</th><th></th>
        </tr></thead>
        <tbody>
          ${list
            .map(
              (a) => `
            <tr class="arow${openRow === a.id ? " is-open" : ""}" data-id="${esc(a.id)}">
              <td class="muted">${esc(a.id)}</td>
              <td class="nowrap">${esc(fmtDate(a.created_at))}</td>
              <td class="strong">${esc(a.full_name)}</td>
              <td><a href="mailto:${esc(a.email)}">${esc(a.email)}</a><br><a href="tel:${esc(String(a.phone).replace(/[^\d+]/g, ""))}" class="muted">${esc(a.phone)}</a></td>
              <td><span class="tag tag--${esc(a.language_level)}">${esc(LEVEL_LABEL[a.language_level] || a.language_level)}</span></td>
              <td><span class="chip">${esc(a.choice_1 || "—")}</span></td>
              <td><span class="chip chip--2">${esc(a.choice_2 || "—")}</span></td>
              <td><span class="chip chip--3">${esc(a.choice_3 || "—")}</span></td>
              <td><button class="linkbtn" data-toggle="${esc(a.id)}">${countWords(a.motivation)} words ${openRow === a.id ? "▴" : "▾"}</button></td>
              <td><button class="iconbtn" data-delete="${esc(a.id)}" title="Delete application" aria-label="Delete application">✕</button></td>
            </tr>
            ${
              openRow === a.id
                ? `<tr class="adetail"><td colspan="10"><div class="letterbox">${esc(a.motivation)}</div></td></tr>`
                : ""
            }`
            )
            .join("")}
        </tbody>
      </table>`;
  }

  $("#appsTable").addEventListener("click", async (e) => {
    const tog = e.target.closest("[data-toggle]");
    if (tog) {
      const id = Number(tog.dataset.toggle);
      openRow = openRow === id ? null : id;
      renderApps();
      return;
    }
    const del = e.target.closest("[data-delete]");
    if (del) {
      const id = Number(del.dataset.delete);
      const a = apps.find((x) => x.id === id);
      if (!confirm(`Delete the application from ${a ? a.full_name : "#" + id}? This cannot be undone.`)) return;
      try {
        await TM.data.deleteApplication(id);
        toast("Application deleted");
        await loadApps();
      } catch (err) {
        toast("Delete failed: " + (err.message || err), "error");
      }
    }
  });

  ["#search", "#filterCommittee", "#filterLevel"].forEach((s) => $(s).addEventListener("input", renderApps));
  $("#refreshBtn").addEventListener("click", async () => { await loadApps(); toast("Applications refreshed"); });

  // ---------- export ----------
  const XLSX_CDN = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = XLSX_CDN;
      s.onload = () => resolve(window.XLSX);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  $("#exportBtn").addEventListener("click", async () => {
    const rows = filtered().map((a) => ({
      "#": a.id,
      Submitted: new Date(a.created_at).toLocaleString("en-GB"),
      "Full name": a.full_name,
      Phone: a.phone,
      Email: a.email,
      "English level": LEVEL_LABEL[a.language_level] || a.language_level,
      "1st choice": a.choice_1 || "",
      "2nd choice": a.choice_2 || "",
      "3rd choice": a.choice_3 || "",
      Words: countWords(a.motivation),
      "Motivation letter": a.motivation,
    }));
    if (!rows.length) return toast("Nothing to export", "error");
    const stamp = new Date().toISOString().slice(0, 10);
    try {
      const XLSX = await loadXlsx();
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [6, 18, 24, 16, 28, 14, 10, 10, 10, 8, 80].map((w) => ({ wch: w }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Applications");
      XLSX.writeFile(wb, `tanmun-applications-${stamp}.xlsx`);
    } catch (err) {
      // Offline fallback: CSV with BOM so Excel shows Turkish characters correctly
      const head = Object.keys(rows[0]);
      const cell = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
      const csv = [head.map(cell).join(","), ...rows.map((r) => head.map((h) => cell(r[h])).join(","))].join("\r\n");
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `tanmun-applications-${stamp}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  });

  // =====================================================
  //  Content editor
  // =====================================================
  function getPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }
  function setPath(obj, path, value) {
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce((o, k) => (o[k] == null ? (o[k] = {}) : o[k]), obj);
    target[last] = value;
  }

  // Field builders — each input carries data-path pointing into `draft`.
  function text(path, label, opts = {}) {
    const v = getPath(draft, path);
    const tag = opts.area
      ? `<textarea data-path="${path}" rows="${opts.rows || 4}">${esc(v)}</textarea>`
      : `<input data-path="${path}" type="${opts.type || "text"}" value="${esc(v)}" placeholder="${esc(opts.placeholder || "")}">`;
    return `<label class="efield${opts.wide ? " efield--wide" : ""}"><span>${esc(label)}</span>${tag}${
      opts.hint ? `<small>${esc(opts.hint)}</small>` : ""
    }</label>`;
  }
  // Text stored as { en: "..." }
  function bi(path, label, opts = {}) {
    return `<div class="bi bi--single">${text(path + ".en", label, opts)}</div>`;
  }
  function select(path, label, options) {
    const v = getPath(draft, path);
    return `<label class="efield"><span>${esc(label)}</span><select data-path="${path}">${options
      .map(([val, text]) => `<option value="${esc(val)}" ${val === v ? "selected" : ""}>${esc(text)}</option>`)
      .join("")}</select></label>`;
  }
  function check(path, label) {
    return `<label class="echeck"><input type="checkbox" data-path="${path}" ${getPath(draft, path) ? "checked" : ""}><span>${esc(label)}</span></label>`;
  }

  function block(title, desc, body, extra) {
    return `<section class="eblock">
      <header><div><h2>${esc(title)}</h2>${desc ? `<p class="muted">${esc(desc)}</p>` : ""}</div>${extra || ""}</header>
      ${body}
    </section>`;
  }

  function renderEditor() {
    const scroll = window.scrollY;
    const html = [];

    html.push(
      block(
        "General",
        "Conference name, dates and whether applications are open.",
        `<div class="egrid">
          ${text("conference.name", "Conference name")}
          ${text("conference.year", "Year (shown in the logo)")}
          ${text("conference.startDate", "Countdown target (start date & time)", { type: "datetime-local" })}
          ${text("conference.endDate", "Last day", { type: "date" })}
          ${text("conference.instagram", "Instagram link", { placeholder: "https://www.instagram.com/…", wide: true })}
        </div>
        ${bi("conference.dateLabel", "Date as shown on the site")}
        ${bi("conference.venue", "Venue")}
        ${bi("conference.tagline", "Tagline (above the logo)")}
        <div class="eswitch">${check("conference.applicationsOpen", "Applications are open (show the application form)")}</div>`
      )
    );

    html.push(
      block(
        "Welcome letter",
        "Shown on the home page. Leave an empty line between paragraphs.",
        `<div class="egrid">${text("letter.author", "Author name", { placeholder: "e.g. Secretary-General's name" })}</div>
         ${bi("letter.role", "Author role")}
         ${bi("letter.body", "Letter", { area: true, rows: 10 })}`
      )
    );

    html.push(
      block(
        "Committees",
        "These also become the choices in the application form (first three are used).",
        draft.committees
          .map(
            (c, i) => `
          <div class="eitem">
            <div class="eitem__head">
              <strong>${esc(c.code || "New committee")}</strong>
              <div class="eitem__btns">
                <button class="iconbtn" data-action="move-committee" data-i="${i}" data-dir="-1" ${i === 0 ? "disabled" : ""} title="Move up">↑</button>
                <button class="iconbtn" data-action="move-committee" data-i="${i}" data-dir="1" ${i === draft.committees.length - 1 ? "disabled" : ""} title="Move down">↓</button>
                <button class="iconbtn iconbtn--danger" data-action="remove-committee" data-i="${i}" title="Remove committee">✕</button>
              </div>
            </div>
            <div class="egrid">
              ${text(`committees.${i}.code`, "Short name (e.g. UNHRC)")}
              ${text(`committees.${i}.room`, "Classroom", { placeholder: "e.g. B-204" })}
            </div>
            ${bi(`committees.${i}.name`, "Full name")}
            ${bi(`committees.${i}.agenda`, "Agenda item", { area: true, rows: 2 })}
            ${bi(`committees.${i}.description`, "Description", { area: true, rows: 3 })}
            ${bi(`committees.${i}.level`, "Difficulty level")}
            <div class="guide">
              ${text(`committees.${i}.guideUrl`, "Study guide link (PDF)", { placeholder: "https://… (Google Drive, or upload below)", wide: true })}
              <label class="btn btn--ghost btn--sm upload${TM.data.live ? "" : " is-disabled"}" title="${
                TM.data.live ? "Upload a PDF" : "Uploading needs the live database — paste a link instead"
              }">
                Upload PDF<input type="file" accept="application/pdf" data-upload="${i}" ${TM.data.live ? "" : "disabled"} hidden>
              </label>
            </div>
            <p class="esub__note muted">Committee board (Guest Chair, Chair, Co-Chair): add them in the <b>Team</b> section below with group "Committee Board" and committee ${esc(c.code || "…")}.</p>
          </div>`
          )
          .join("") + `<button class="btn btn--ghost btn--sm" data-action="add-committee">+ Add committee</button>`
      )
    );

    const committeeOpts = [["", "Choose committee"], ...draft.committees.map((c) => [c.code, c.code])];
    html.push(
      block(
        "Team",
        "Shown on the Team page. Board members (group Committee Board) also appear on their committee page. People without a name are hidden.",
        `<datalist id="roleList">${ROLE_SUGGESTIONS.map((r) => `<option value="${esc(r)}">`).join("")}</datalist>` +
        `<datalist id="customGroupList">${[
          ...new Map(
            draft.team
              .filter((m) => m.group === "custom" && String(m.groupName || "").trim())
              .map((m) => [m.groupName.trim().toLowerCase(), m.groupName.trim()])
              .reverse() // keep the first spelling used
          ).values(),
        ]
          .map((g) => `<option value="${esc(g)}">`)
          .join("")}</datalist>` +
        draft.team
          .map((m, i) => {
            const photo = /^https?:\/\//i.test(m.photoUrl || "") ? m.photoUrl : "";
            const initials = String(m.name || "").trim().split(/\s+/).map((w) => w[0] || "").slice(0, 2).join("").toUpperCase();
            return `
          <div class="eitem emember">
            <div class="emember__photo">${photo ? `<img src="${esc(photo)}" alt="">` : `<span>${esc(initials || "?")}</span>`}</div>
            <div class="esponsor__fields">
              <div class="eitem__head">
                <strong>${esc(m.name || "New member")}${m.role ? ` <span class="muted">· ${esc(m.role)}</span>` : ""}</strong>
                <div class="eitem__btns">
                  <button class="iconbtn" data-action="move-member" data-i="${i}" data-dir="-1" ${i === 0 ? "disabled" : ""} title="Move up">↑</button>
                  <button class="iconbtn" data-action="move-member" data-i="${i}" data-dir="1" ${i === draft.team.length - 1 ? "disabled" : ""} title="Move down">↓</button>
                  <button class="iconbtn iconbtn--danger" data-action="remove-member" data-i="${i}" title="Remove">✕</button>
                </div>
              </div>
              <div class="egrid">
                ${text(`team.${i}.name`, "Full name")}
                <label class="efield"><span>Role</span><input data-path="team.${i}.role" list="roleList" value="${esc(m.role || "")}" placeholder="e.g. Chair"></label>
                ${select(`team.${i}.group`, "Group", TEAM_GROUPS)}
                ${m.group === "boards" ? select(`team.${i}.committee`, "Committee", committeeOpts) : ""}
                ${
                  m.group === "custom"
                    ? `<label class="efield"><span>Group name</span><input data-path="team.${i}.groupName" list="customGroupList" value="${esc(m.groupName || "")}" placeholder="e.g. Press Team"></label>`
                    : ""
                }
              </div>
              <div class="guide">
                ${text(`team.${i}.photoUrl`, "Photo link (optional)", { placeholder: "https://... (or upload)", wide: true })}
                <label class="btn btn--ghost btn--sm upload${TM.data.live ? "" : " is-disabled"}" title="${
                  TM.data.live ? "Upload a photo" : "Uploading needs the live database. Paste a link instead."
                }">
                  Upload photo<input type="file" accept="image/png,image/jpeg,image/webp" data-upload-photo="${i}" ${TM.data.live ? "" : "disabled"} hidden>
                </label>
              </div>
            </div>
          </div>`;
          })
          .join("") +
        `<div class="ebtns">
           <button class="btn btn--ghost btn--sm" data-action="add-member">+ Add team member</button>
           <button class="btn btn--ghost btn--sm" data-action="add-team-template" title="Adds empty SG, DG, USG, Academic Assistant, a Chair and Co-Chair for every committee, Admin and PR">+ Add standard roles</button>
         </div>`
      )
    );

    const TIER_OPTS = [["main", "Main sponsor"], ["gold", "Gold"], ["silver", "Silver"], ["partner", "Partner"]];
    html.push(
      block(
        "Sponsors",
        "Shown in the Our Sponsors section of the home page, grouped by level. Logos look best as PNG or SVG.",
        draft.sponsors
          .map((sp, i) => {
            const logo = /^https?:\/\//i.test(sp.logoUrl || "") ? sp.logoUrl : "";
            return `
          <div class="eitem esponsor">
            <div class="esponsor__logo">${logo ? `<img src="${esc(logo)}" alt="">` : `<span>Logo</span>`}</div>
            <div class="esponsor__fields">
              <div class="eitem__head">
                <strong>${esc(sp.name || "New sponsor")}</strong>
                <div class="eitem__btns">
                  <button class="iconbtn" data-action="move-sponsor" data-i="${i}" data-dir="-1" ${i === 0 ? "disabled" : ""} title="Move up">↑</button>
                  <button class="iconbtn" data-action="move-sponsor" data-i="${i}" data-dir="1" ${i === draft.sponsors.length - 1 ? "disabled" : ""} title="Move down">↓</button>
                  <button class="iconbtn iconbtn--danger" data-action="remove-sponsor" data-i="${i}" title="Remove sponsor">✕</button>
                </div>
              </div>
              <div class="egrid">
                ${text(`sponsors.${i}.name`, "Sponsor name")}
                ${select(`sponsors.${i}.tier`, "Level", TIER_OPTS)}
                ${text(`sponsors.${i}.website`, "Website (optional)", { placeholder: "https://...", wide: true })}
              </div>
              <div class="guide">
                ${text(`sponsors.${i}.logoUrl`, "Logo link", { placeholder: "https://... (or upload)", wide: true })}
                <label class="btn btn--ghost btn--sm upload${TM.data.live ? "" : " is-disabled"}" title="${
                  TM.data.live ? "Upload a logo image" : "Uploading needs the live database. Paste a link instead."
                }">
                  Upload logo<input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" data-upload-logo="${i}" ${TM.data.live ? "" : "disabled"} hidden>
                </label>
              </div>
            </div>
          </div>`;
          })
          .join("") + `<button class="btn btn--ghost btn--sm" data-action="add-sponsor">+ Add sponsor</button>`
      )
    );

    html.push(
      block(
        "Schedule",
        "One tab per day on the Details page. Write TBA for times that aren't announced yet.",
        draft.schedule
          .map(
            (d, di) => `
          <div class="eitem">
            <div class="eitem__head">
              <strong>${esc(d.label && d.label.en) || "Day " + (di + 1)}</strong>
              <div class="eitem__btns">
                <button class="iconbtn iconbtn--danger" data-action="remove-day" data-i="${di}" title="Remove day">✕</button>
              </div>
            </div>
            ${bi(`schedule.${di}.label`, "Tab title")}
            ${bi(`schedule.${di}.date`, "Date")}
            <div class="eslots">
              ${d.items
                .map(
                  (it, ii) => `
                <div class="eslot eslot--2">
                  ${text(`schedule.${di}.items.${ii}.time`, "Time", { placeholder: "09:00" })}
                  ${text(`schedule.${di}.items.${ii}.title.en`, "Event")}
                  <div class="eslot__btns">
                    <button class="iconbtn" data-action="move-item" data-d="${di}" data-i="${ii}" data-dir="-1" ${ii === 0 ? "disabled" : ""} title="Move up">↑</button>
                    <button class="iconbtn" data-action="move-item" data-d="${di}" data-i="${ii}" data-dir="1" ${ii === d.items.length - 1 ? "disabled" : ""} title="Move down">↓</button>
                    <button class="iconbtn iconbtn--danger" data-action="remove-item" data-d="${di}" data-i="${ii}" title="Remove">✕</button>
                  </div>
                </div>`
                )
                .join("")}
              <button class="btn btn--ghost btn--sm" data-action="add-item" data-d="${di}">+ Add event</button>
            </div>
          </div>`
          )
          .join("") + `<button class="btn btn--ghost btn--sm" data-action="add-day">+ Add day</button>`
      )
    );

    html.push(
      block(
        "Start a new conference year",
        "Resets all content to the template in defaults.js. Applications are NOT deleted — export and delete them separately.",
        `<button class="btn btn--ghost btn--sm iconbtn--danger" data-action="load-defaults">Load template content</button>`
      )
    );

    $("#editor").innerHTML = html.join("");
    window.scrollTo(0, scroll);
  }

  function markDirty(v) {
    dirty = v;
    $("#saveBtn").textContent = v ? "Save changes •" : "Save changes";
    $("#saveBtn").classList.toggle("is-dirty", v);
  }

  $("#editor").addEventListener("input", (e) => {
    const path = e.target.dataset.path;
    if (!path) return;
    setPath(draft, path, e.target.type === "checkbox" ? e.target.checked : e.target.value);
    markDirty(true);
    const roleMatch = path.match(/^team\.(\d+)\.role$/);
    if (roleMatch) {
      const g = ROLE_GROUP[e.target.value.trim().toLowerCase()];
      const m = draft.team[Number(roleMatch[1])];
      if (g && m.group !== g) {
        m.group = g;
        renderEditor();
        const again = $(`[data-path="${path}"]`);
        if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
      }
      return;
    }
    if (/^team\.\d+\.group$/.test(path)) { renderEditor(); return; }
    // live logo preview while typing a link
    if (/^sponsors\.\d+\.logoUrl$/.test(path)) {
      const box = e.target.closest(".esponsor").querySelector(".esponsor__logo");
      const v = e.target.value.trim();
      box.innerHTML = /^https?:\/\//i.test(v) ? `<img src="${esc(v)}" alt="">` : "<span>Logo</span>";
    }
  });

  $("#editor").addEventListener("change", async (e) => {
    const pi = e.target.dataset.uploadPhoto;
    if (pi !== undefined && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) return toast("Photo is larger than 5 MB", "error");
      toast("Uploading " + file.name + "...");
      try {
        draft.team[pi].photoUrl = await TM.data.uploadPhoto(file, draft.team[pi].name || "member");
        markDirty(true);
        renderEditor();
        toast("Uploaded. Press Save to publish", "success");
      } catch (err) {
        toast("Upload failed: " + (err.message || err), "error");
      }
      return;
    }
    const li = e.target.dataset.uploadLogo;
    if (li !== undefined && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) return toast("Logo is larger than 5 MB", "error");
      toast("Uploading " + file.name + "...");
      try {
        draft.sponsors[li].logoUrl = await TM.data.uploadLogo(file, draft.sponsors[li].name || "sponsor");
        markDirty(true);
        renderEditor();
        toast("Uploaded. Press Save to publish", "success");
      } catch (err) {
        toast("Upload failed: " + (err.message || err), "error");
      }
      return;
    }
    const i = e.target.dataset.upload;
    if (i === undefined || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 20 * 1024 * 1024) return toast("File is larger than 20 MB", "error");
    toast("Uploading " + file.name + "…");
    try {
      const url = await TM.data.uploadGuide(file, draft.committees[i].code.toLowerCase() || "guide");
      draft.committees[i].guideUrl = url;
      markDirty(true);
      renderEditor();
      toast("Uploaded — press Save to publish", "success");
    } catch (err) {
      toast("Upload failed: " + (err.message || err), "error");
    }
  });

  $("#editor").addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const i = Number(b.dataset.i);
    const d = Number(b.dataset.d);
    const dir = Number(b.dataset.dir);
    const swap = (arr, a, c) => { [arr[a], arr[c]] = [arr[c], arr[a]]; };
    const blank = () => ({ en: "" });

    switch (b.dataset.action) {
      case "add-committee":
        draft.committees.push({ id: "", code: "", name: blank(), agenda: blank(), description: blank(), level: blank(), room: "TBA", guideUrl: "" });
        break;
      case "remove-committee":
        if (!confirm(`Remove ${draft.committees[i].code || "this committee"}?`)) return;
        draft.committees.splice(i, 1);
        break;
      case "move-committee":
        swap(draft.committees, i, i + dir);
        break;
      case "add-member":
        draft.team.push({ name: "", role: "", group: "organization", committee: "", photoUrl: "" });
        break;
      case "remove-member":
        if (!confirm(`Remove ${draft.team[i].name || "this team member"}?`)) return;
        draft.team.splice(i, 1);
        break;
      case "move-member":
        swap(draft.team, i, i + dir);
        break;
      case "add-team-template": {
        const p = (role, group, committee = "") => ({ name: "", role, group, committee, photoUrl: "" });
        draft.team.push(
          p("Secretary-General", "secretariat"),
          p("Deputy Secretary-General", "secretariat"),
          p("Under-Secretary-General", "secretariat"),
          p("Academic Assistant", "academic"),
          ...draft.committees.flatMap((c) => [p("Chair", "boards", c.code), p("Co-Chair", "boards", c.code)]),
          p("Head of Admin", "organization"),
          p("Head of PR", "organization")
        );
        toast("Added empty roles. Fill in the names, then Save.");
        break;
      }
      case "add-sponsor":
        draft.sponsors.push({ name: "", tier: "gold", website: "", logoUrl: "" });
        break;
      case "remove-sponsor":
        if (!confirm(`Remove ${draft.sponsors[i].name || "this sponsor"}?`)) return;
        draft.sponsors.splice(i, 1);
        break;
      case "move-sponsor":
        swap(draft.sponsors, i, i + dir);
        break;
      case "add-day":
        draft.schedule.push({ label: { en: `Day ${draft.schedule.length + 1}` }, date: blank(), items: [] });
        break;
      case "remove-day":
        if (!confirm("Remove this day and all its events?")) return;
        draft.schedule.splice(i, 1);
        break;
      case "add-item":
        draft.schedule[d].items.push({ time: "TBA", title: blank() });
        break;
      case "remove-item":
        draft.schedule[d].items.splice(i, 1);
        break;
      case "move-item":
        swap(draft.schedule[d].items, i, i + dir);
        break;
      case "load-defaults":
        if (!confirm("Replace ALL website content with the template? (You still need to press Save.)")) return;
        draft = TM.data.defaultContent();
        break;
      default:
        return;
    }
    markDirty(true);
    renderEditor();
  });

  function validateDraft() {
    const codes = draft.committees.map((c) => String(c.code || "").trim());
    if (codes.some((c) => !c)) return "Every committee needs a short name.";
    if (new Set(codes.map((c) => c.toUpperCase())).size !== codes.length) return "Two committees have the same short name.";
    if (draft.sponsors.some((sp) => !String(sp.name || "").trim())) return "Every sponsor needs a name.";
    const noCommittee = draft.team.find((m) => m.name && m.group === "boards" && !m.committee);
    if (noCommittee) return `Choose a committee for ${noCommittee.name} (Committee Board).`;
    const noGroupName = draft.team.find((m) => m.name && m.group === "custom" && !String(m.groupName || "").trim());
    if (noGroupName) return `Type a group name for ${noGroupName.name} (Custom group).`;
    if (draft.conference.startDate && isNaN(new Date(draft.conference.startDate))) return "The countdown date is not valid.";
    return null;
  }

  $("#saveBtn").addEventListener("click", async () => {
    const problem = validateDraft();
    if (problem) return toast(problem, "error");
    draft.committees.forEach((c) => {
      c.code = c.code.trim();
      c.id = c.code.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    });
    const btn = $("#saveBtn");
    btn.disabled = true;
    try {
      await TM.data.saveContent(draft);
      content = clone(draft);
      markDirty(false);
      fillCommitteeFilter();
      renderStats();
      toast("Saved — the website is updated", "success");
    } catch (err) {
      console.error(err);
      toast("Save failed: " + (err.message || err), "error");
    }
    btn.disabled = false;
  });

  $("#resetBtn").addEventListener("click", () => {
    if (dirty && !confirm("Discard all unsaved changes?")) return;
    draft = clone(content);
    markDirty(false);
    renderEditor();
  });

  start();
})();
