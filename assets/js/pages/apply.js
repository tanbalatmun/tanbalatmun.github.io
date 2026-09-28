(function () {
  const { esc, i18n } = TM;
  const t = (k) => esc(i18n.t(k));
  const MIN_WORDS = 75;
  const MAX_WORDS = 200;
  const LEVELS = ["beginner", "intermediate", "advanced", "native"];

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

        <div class="form-section">
          <h3><span class="step">3</span><span data-i18n="apply.section.letter"></span></h3>
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

  function setError(name, key) {
    const field = document.querySelector(`[data-field="${name}"]`);
    field.classList.toggle("has-error", Boolean(key));
    field.dataset.err = key || "";
    field.querySelector(".field__error").textContent = key ? i18n.t(key) : "";
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

    const words = countWords(v.motivation);
    if (words < MIN_WORDS || words > MAX_WORDS) fail("motivation", "apply.error.words");

    return ok ? { v, choices } : null;
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
        return;
      }
      const { v, choices } = result;
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
