(function () {
  const { esc, i18n } = TM;
  const t = (k) => esc(i18n.t(k));
  const MIN_WORDS = 75;
  const MAX_WORDS = 200;
  const LEVELS = ["beginner", "intermediate", "advanced", "native"];
  const MAX_EXPERIENCES = 10;
  const AWARD_SUGGESTIONS = ["Best Delegate", "Outstanding Delegate", "Honourable Mention", "Best Position Paper", "Verbal Commendation"];

  const countWords = (s) => (String(s).trim().match(/\S+/g) || []).length;

  function formHTML(content) {
    const n = Math.min(3, content.committees.length);
    const choiceSelects = Array.from({ length: n }, (_, i) => `
      <div class="field" data-field="choice_${i + 1}">
        <label for="choice_${i + 1}" data-i18n="apply.choice${i + 1}"></label>
        <select id="choice_${i + 1}" name="choice_${i + 1}" class="choice" required></select>
        <span class="field__error"></span>
      </div>`).join("");

    return `
      <form class="form-card" id="applyForm" novalidate>
        <div class="form-section">
          <h3><span class="step">1</span><span data-i18n="apply.section.you"></span></h3>
          <div class="grid-2">
            <div class="field" data-field="full_name" style="grid-column:1/-1">
              <label for="full_name" data-i18n="apply.fullName"></label>
              <input id="full_name" name="full_name" autocomplete="name" maxlength="120" required>
              <span class="field__error"></span>
            </div>
            <div class="field" data-field="phone">
              <label for="phone" data-i18n="apply.phone"></label>
              <input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="25" placeholder="05XX XXX XX XX" required>
              <span class="field__error"></span>
            </div>
            <div class="field" data-field="email">
              <label for="email" data-i18n="apply.email"></label>
              <input id="email" name="email" type="email" autocomplete="email" maxlength="200" required>
              <span class="field__error"></span>
            </div>
            <div class="field" data-field="language_level" style="grid-column:1/-1">
              <label for="language_level" data-i18n="apply.level"></label>
              <select id="language_level" name="language_level" required>
                <option value="" data-i18n="apply.level.placeholder"></option>
                ${LEVELS.map((l) => `<option value="${l}" data-i18n="apply.level.${l}"></option>`).join("")}
              </select>
              <span class="field__error"></span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3><span class="step">2</span><span data-i18n="apply.section.committees"></span></h3>
          <div class="grid-3">${choiceSelects}</div>
          <p class="form-error" id="choicesError" hidden></p>
        </div>

        <div class="form-section exp" data-field="experience">
          <h3><span class="step">3</span><span data-i18n="apply.section.experience"></span></h3>
          <p class="exp__hint" data-i18n="apply.exp.hint"></p>
          <datalist id="awardList">${AWARD_SUGGESTIONS.map((a) => `<option value="${esc(a)}">`).join("")}</datalist>
          <div class="exp__list" id="expList"></div>
          <div class="exp__actions">
            <button type="button" class="btn btn--ghost btn--sm exp__add" id="addExp">+ <span data-i18n="apply.exp.add"></span></button>
            <label class="exp__none"><input type="checkbox" id="noExp"><span data-i18n="apply.exp.none"></span></label>
          </div>
          <p class="exp__welcome" id="firstTimerNote" hidden data-i18n="apply.exp.welcome"></p>
          <p class="exp__welcome exp__welcome--veteran" id="veteranNote" hidden aria-live="polite"></p>
          <span class="field__error"></span>
        </div>

        <div class="form-section">
          <h3><span class="step">4</span><span data-i18n="apply.section.letter"></span></h3>
          <div class="field" data-field="motivation">
            <label for="motivation" data-i18n="apply.motivation"></label>
            <textarea id="motivation" name="motivation" required></textarea>
            <div class="wordcount" id="wordcount">
              <div class="wordcount__bar"><div class="wordcount__fill"></div></div>
              <span><span class="wordcount__num">0</span> / ${MAX_WORDS} <span data-i18n="apply.words"></span>
              · <span data-i18n="apply.wordsHint"></span></span>
            </div>
            <span class="field__error"></span>
          </div>
        </div>

        <!-- spam trap: real people never see or fill this -->
        <div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>

        <div class="form-actions">
          <button type="submit" class="btn btn--primary" id="submitBtn" data-i18n="apply.submit"></button>
          <span class="form-error" id="submitError" hidden></span>
        </div>
      </form>`;
  }

  function fillChoices(content) {
    const selects = [...document.querySelectorAll("select.choice")];
    selects.forEach((sel) => {
      const current = sel.value;
      sel.innerHTML =
        `<option value="">${t("apply.choice.placeholder")}</option>` +
        content.committees.map((cm) => `<option value="${esc(cm.code)}">${esc(cm.code)} — ${esc(i18n.pick(cm.name))}</option>`).join("");
      sel.value = current;
    });
    syncChoices();
  }

  // A committee picked in one slot is greyed out in the others.
  function syncChoices() {
    const selects = [...document.querySelectorAll("select.choice")];
    const taken = selects.map((s) => s.value);
    selects.forEach((sel, i) => {
      [...sel.options].forEach((opt) => {
        opt.disabled = opt.value !== "" && taken.some((v, j) => j !== i && v === opt.value);
      });
    });
  }

  function updateWordCount() {
    const n = countWords(document.getElementById("motivation").value);
    const wc = document.getElementById("wordcount");
    wc.querySelector(".wordcount__num").textContent = n;
    wc.querySelector(".wordcount__fill").style.width = Math.min(100, (n / MAX_WORDS) * 100) + "%";
    wc.classList.toggle("is-ok", n >= MIN_WORDS && n <= MAX_WORDS);
    wc.classList.toggle("is-over", n > MAX_WORDS);
  }

  // ---------- MUN experience ----------
  function expItemHTML() {
    const thisYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => thisYear + 1 - i);
    return `
      <div class="exp__item">
        <div class="exp__head">
          <strong><span data-i18n="apply.exp.item"></span> <span class="exp__num"></span></strong>
          <button type="button" class="iconbtn exp__remove" data-i18n-title="apply.exp.remove" aria-label="Remove">✕</button>
        </div>
        <div class="grid-2">
          <div class="field exp__f" data-exp="conference">
            <label><span data-i18n="apply.exp.conference"></span></label>
            <input class="exp__conference" maxlength="120" data-i18n-placeholder="apply.exp.conferencePlaceholder">
            <span class="field__error"></span>
          </div>
          <div class="field exp__f" data-exp="year">
            <label><span data-i18n="apply.exp.year"></span></label>
            <select class="exp__year">
              <option value="" data-i18n="apply.exp.yearPlaceholder"></option>
              ${years.map((y) => `<option value="${y}">${y}</option>`).join("")}
            </select>
            <span class="field__error"></span>
          </div>
          <div class="field exp__f" style="grid-column:1/-1">
            <label><span data-i18n="apply.exp.award"></span></label>
            <input class="exp__award" maxlength="80" list="awardList" data-i18n-placeholder="apply.exp.awardPlaceholder">
          </div>
          <div class="field exp__f" style="grid-column:1/-1">
            <label><span data-i18n="apply.exp.details"></span></label>
            <textarea class="exp__details" rows="2" maxlength="300" data-i18n-placeholder="apply.exp.detailsPlaceholder"></textarea>
          </div>
        </div>
      </div>`;
  }

  function renumberExp() {
    const items = [...document.querySelectorAll("#expList .exp__item")];
    items.forEach((it, i) => (it.querySelector(".exp__num").textContent = i + 1));
    document.getElementById("addExp").disabled = items.length >= MAX_EXPERIENCES || document.getElementById("noExp").checked;
    updateVeteranNote();
  }

  function addExperience() {
    const list = document.getElementById("expList");
    if (list.children.length >= MAX_EXPERIENCES) return;
    const noExp = document.getElementById("noExp");
    if (noExp.checked) { noExp.checked = false; syncNoExp(); }
    const wrap = document.createElement("div");
    wrap.innerHTML = expItemHTML();
    const item = wrap.firstElementChild;
    list.appendChild(item);
    i18n.apply(item);
    item.querySelectorAll("[data-i18n-title]").forEach((el) => (el.title = i18n.t(el.dataset.i18nTitle)));
    renumberExp();
    setError("experience", null);
    item.querySelector(".exp__conference").focus();
  }

  // Little easter egg: ticking "No experience" turns into an excited first-timer line.
  const FIRST_TIMER_LINES = [
    "I'm a first-timer and I'm excited! 🎉",
    "First conference, big dreams! 🚀",
    "Everyone starts somewhere, and this is my start! ✨",
    "New delegate, ready to make history! 🌍",
    "Day one of my MUN story! 📜",
  ];
  let lastLine = -1;

  // ...and a growing cheer for experienced delegates, by number of experiences.
  const VETERAN_TIERS = [
    [5, "A true MUN veteran! 🏆 Chairing next year, maybe?"],
    [3, "A seasoned delegate! The chairs will be glad to see you. 🎖️"],
    [2, "Two conferences? You're getting the hang of this! 💼"],
    [1, "One conference down. Welcome back to the floor! 🙌"],
  ];
  let lastVeteranText = "";

  function updateVeteranNote() {
    const note = document.getElementById("veteranNote");
    const items = [...document.querySelectorAll("#expList .exp__item")];
    const none = document.getElementById("noExp").checked;
    if (none || !items.length) {
      note.hidden = true;
      lastVeteranText = "";
      return;
    }
    let text = VETERAN_TIERS.find(([min]) => items.length >= min)[1];
    if (items.some((it) => it.querySelector(".exp__award").value.trim())) text += " …and with an award too! 🥇";
    note.hidden = false;
    if (text !== lastVeteranText) {
      note.textContent = text;
      note.classList.remove("is-pop"); void note.offsetWidth; note.classList.add("is-pop");
      lastVeteranText = text;
    }
  }

  // "No experience" hides the list (kept, so unticking brings it back).
  function syncNoExp() {
    const none = document.getElementById("noExp").checked;
    document.getElementById("expList").hidden = none;
    document.querySelector(".exp").classList.toggle("is-none", none);
    const label = document.querySelector(".exp__none span");
    const note = document.getElementById("firstTimerNote");
    if (none) {
      let i;
      do { i = Math.floor(Math.random() * FIRST_TIMER_LINES.length); } while (i === lastLine && FIRST_TIMER_LINES.length > 1);
      lastLine = i;
      label.textContent = FIRST_TIMER_LINES[i];
      const box = document.querySelector(".exp__none");
      box.classList.remove("is-pop"); void box.offsetWidth; box.classList.add("is-pop");
    } else {
      label.textContent = i18n.t("apply.exp.none");
    }
    note.hidden = !none;
    renumberExp();
    if (none) setError("experience", null);
  }

  function readExperience() {
    if (document.getElementById("noExp").checked) return { none: true, list: [] };
    const list = [...document.querySelectorAll("#expList .exp__item")].map((it) => ({
      conference: it.querySelector(".exp__conference").value.trim(),
      year: Number(it.querySelector(".exp__year").value) || null,
      award: it.querySelector(".exp__award").value.trim(),
      details: it.querySelector(".exp__details").value.trim(),
    }));
    return { none: false, list };
  }

  function setError(name, key) {
    const field = document.querySelector(`[data-field="${name}"]`);
    field.classList.toggle("has-error", Boolean(key));
    field.dataset.err = key || "";
    // the section's own message (not one inside an experience box)
    (field.querySelector(":scope > .field__error") || field.querySelector(".field__error")).textContent = key ? i18n.t(key) : "";
  }

  function validate(form) {
    const v = Object.fromEntries(new FormData(form));
    let ok = true;
    const fail = (name, key) => { setError(name, key); ok = false; };
    form.querySelectorAll("[data-field]").forEach((f) => setError(f.dataset.field, null));

    if (v.full_name.trim().length < 2) fail("full_name", "apply.error.required");
    const digits = v.phone.replace(/\D/g, "");
    if (!v.phone.trim()) fail("phone", "apply.error.required");
    else if (digits.length < 7 || digits.length > 15 || !/^[+\d\s()-]+$/.test(v.phone.trim())) fail("phone", "apply.error.phone");
    if (!v.email.trim()) fail("email", "apply.error.required");
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email.trim())) fail("email", "apply.error.email");
    if (!LEVELS.includes(v.language_level)) fail("language_level", "apply.error.required");

    const choices = [...form.querySelectorAll("select.choice")].map((s) => s.value);
    choices.forEach((c, i) => { if (!c) fail(`choice_${i + 1}`, "apply.error.required"); });
    const choicesErr = document.getElementById("choicesError");
    const dup = choices.filter(Boolean).length !== new Set(choices.filter(Boolean)).size;
    choicesErr.hidden = !dup;
    choicesErr.textContent = dup ? i18n.t("apply.error.choices") : "";
    if (dup) ok = false;

    const exp = readExperience();
    document.querySelectorAll("#expList .exp__f.has-error").forEach((f) => {
      f.classList.remove("has-error");
      f.querySelector(".field__error").textContent = "";
    });
    if (!exp.none) {
      if (!exp.list.length) fail("experience", "apply.error.exp");
      [...document.querySelectorAll("#expList .exp__item")].forEach((it, i) => {
        const bad = (sel) => {
          const f = it.querySelector(`[data-exp="${sel}"]`);
          f.classList.add("has-error");
          f.querySelector(".field__error").textContent = i18n.t("apply.error.required");
          ok = false;
        };
        if (exp.list[i].conference.length < 2) bad("conference");
        if (!exp.list[i].year) bad("year");
      });
    }

    const words = countWords(v.motivation);
    if (words < MIN_WORDS || words > MAX_WORDS) fail("motivation", "apply.error.words");

    return ok ? { v, choices, exp } : null;
  }

  function showSuccess(root, content) {
    root.innerHTML = `
      <div class="form-card success">
        <div class="success__icon"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#fff" stroke-width="2.4"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></div>
        <h2 data-i18n="apply.success.title"></h2>
        <p data-i18n="apply.success.text"></p>
        <button class="btn btn--ghost" id="again" data-i18n="apply.success.again"></button>
      </div>`;
    i18n.apply(root);
    root.querySelector("#again").addEventListener("click", () => render(content));
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function render(content) {
    const root = document.getElementById("applyRoot");

    if (!content.conference.applicationsOpen) {
      root.innerHTML = `
        <div class="form-card success">
          <h2 data-i18n="apply.closed.title"></h2>
          <p data-i18n="apply.closed.text"></p>
        </div>`;
      i18n.apply(root);
      return;
    }

    root.innerHTML = formHTML(content);
    i18n.apply(root);
    fillChoices(content);
    // Coming from a committee page ("Apply for this committee") → preselect 1st choice
    const first = new URLSearchParams(location.search).get("first");
    if (first && content.committees.some((cm) => cm.code === first)) {
      document.getElementById("choice_1").value = first;
      syncChoices();
    }

    const form = document.getElementById("applyForm");
    form.querySelectorAll("select.choice").forEach((s) => s.addEventListener("change", syncChoices));
    form.motivation.addEventListener("input", updateWordCount);
    document.getElementById("addExp").addEventListener("click", addExperience);
    document.getElementById("noExp").addEventListener("change", syncNoExp);
    document.getElementById("expList").addEventListener("click", (e) => {
      const rm = e.target.closest(".exp__remove");
      if (!rm) return;
      rm.closest(".exp__item").remove();
      renumberExp();
    });
    document.getElementById("expList").addEventListener("input", (e) => {
      const f = e.target.closest(".exp__f.has-error");
      if (f) { f.classList.remove("has-error"); f.querySelector(".field__error").textContent = ""; }
      if (e.target.classList.contains("exp__award")) updateVeteranNote();
    });
    renumberExp();
    form.addEventListener("input", (e) => {
      const f = e.target.closest("[data-field]");
      if (f && f.classList.contains("has-error")) setError(f.dataset.field, null);
    });
    updateWordCount();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errBox = document.getElementById("submitError");
      errBox.hidden = true;
      const result = validate(form);
      if (!result) {
        const firstBad = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstBad) firstBad.focus();
        else if (form.querySelector('[data-field="experience"].has-error')) document.getElementById("addExp").focus();
        return;
      }
      const { v, choices, exp } = result;
      if (v.website) { showSuccess(root, content); return; } // bot

      const btn = document.getElementById("submitBtn");
      btn.disabled = true;
      btn.textContent = i18n.t("apply.sending");
      try {
        await TM.data.submitApplication({
          full_name: v.full_name.trim(),
          phone: v.phone.trim(),
          email: v.email.trim().toLowerCase(),
          language_level: v.language_level,
          choice_1: choices[0] || null,
          choice_2: choices[1] || null,
          choice_3: choices[2] || null,
          motivation: v.motivation.trim(),
          no_experience: exp.none,
          experience: exp.list,
        });
        showSuccess(root, content);
      } catch (err) {
        console.error(err);
        errBox.textContent = i18n.t("apply.error.submit");
        errBox.hidden = false;
        btn.disabled = false;
        btn.textContent = i18n.t("apply.submit");
      }
    });
  }

  // On language switch: keep what the user typed, only refresh translated bits.
  function onLangChange(content) {
    if (document.getElementById("applyForm")) {
      fillChoices(content);
      document.querySelectorAll("#applyForm [data-field].has-error").forEach((f) => setError(f.dataset.field, f.dataset.err));
      const choicesErr = document.getElementById("choicesError");
      if (!choicesErr.hidden) choicesErr.textContent = i18n.t("apply.error.choices");
    }
  }

  TM.boot(render, onLangChange);
})();
