/*
 * Interface text (buttons, labels, headings).
 * Conference content (agendas, schedule…) lives in the database / defaults.js.
 * Mark an element with data-i18n="key" to fill in its text automatically.
 */
(function () {
  const STRINGS = {
    en: {
      "nav.home": "Home",
      "nav.committees": "Committees",
      "nav.details": "Details",
      "nav.apply": "Apply Now",
      "nav.sponsors": "Sponsors",
      "nav.team": "Team",
      "team.eyebrow": "Our team",
      "team.title": "Meet the team",
      "team.lead": "The students and advisors working behind the scenes to make TanMUN happen.",
      "team.empty": "Our team will be announced soon.",
      "team.group.secretariat": "Secretariat",
      "team.group.academic": "Academic Team",
      "team.group.boards": "Committee Boards",
      "team.group.organization": "Organization Team",
      "team.group.advisors": "Advisors",
      "nav.allCommittees": "All committees",
      "sponsors.eyebrow": "Our sponsors",
      "sponsors.title": "Made possible by",
      "sponsors.empty": "Our sponsors will be announced soon.",
      "sponsors.tier.main": "Main sponsor",
      "sponsors.tier.gold": "Gold sponsors",
      "sponsors.tier.silver": "Silver sponsors",
      "sponsors.tier.partner": "Partners",
      "sponsors.visit": "Visit website",
      "committee.back": "All committees",
      "committee.chairs": "Committee board",
      "committee.apply": "Apply for this committee",
      "committee.prev": "Previous",
      "committee.next": "Next",
      "committee.notFound": "This committee could not be found.",
      "committees.open": "View committee",
      "hero.countdown.days": "Days",
      "hero.countdown.hours": "Hours",
      "hero.countdown.minutes": "Minutes",
      "hero.countdown.seconds": "Seconds",
      "hero.started": "The conference has begun — good luck, delegates!",
      "hero.explore": "Explore committees",
      "home.facts.days": "Days of debate",
      "home.facts.committees": "Committees",
      "home.facts.edition": "Edition",
      "home.letter.eyebrow": "Welcome letter",
      "home.letter.title": "A word from the Secretariat",
      "home.committees.eyebrow": "Committees",
      "home.committees.title": "Choose your chamber",
      "home.committees.all": "See all committees",
      "home.committees.more": "Learn more",
      "home.cta.title": "Your seat is waiting.",
      "home.cta.text": "Applications are open to all students of our school. It only takes a few minutes.",
      "home.cta.closed": "Applications are currently closed. Follow us for updates.",
      "committees.eyebrow": "Committees",
      "committees.title": "Committees & Agendas",
      "committees.lead": "Three committees, three very different challenges. Read the agendas, download the study guides and pick the room where you want to make your mark.",
      "committees.agenda": "Agenda item",
      "committees.room": "Classroom",
      "committees.level": "Level",
      "committees.guide": "Download study guide",
      "committees.guideSoon": "Study guide coming soon",
      "details.eyebrow": "Conference details",
      "details.title": "Where & when",
      "details.date": "Date",
      "details.venue": "Venue",
      "details.committees": "Committees",
      "details.rooms.title": "Committee classrooms",
      "details.rooms.committee": "Committee",
      "details.rooms.room": "Classroom",
      "details.rooms.note": "Classrooms may change between semesters — always check this page before the conference.",
      "details.schedule.title": "Schedule",
      "details.schedule.note": "Exact times will be announced soon.",
      "apply.eyebrow": "Delegate application",
      "apply.title": "Apply to TanMUN",
      "apply.lead": "Fill in the form below. Your committee preferences and motivation letter help us place you in the committee where you will shine.",
      "apply.closed.title": "Applications are closed",
      "apply.closed.text": "Applications for this conference are not open right now. Follow our Instagram for announcements.",
      "apply.section.you": "About you",
      "apply.section.committees": "Committee preferences",
      "apply.section.letter": "Motivation letter",
      "apply.fullName": "Full name",
      "apply.phone": "Phone number",
      "apply.email": "Email",
      "apply.level": "English level",
      "apply.level.placeholder": "Select your level",
      "apply.level.beginner": "Beginner",
      "apply.level.intermediate": "Intermediate",
      "apply.level.advanced": "Advanced",
      "apply.level.native": "Native / Fluent",
      "apply.choice1": "1st choice",
      "apply.choice2": "2nd choice",
      "apply.choice3": "3rd choice",
      "apply.choice.placeholder": "Select a committee",
      "apply.motivation": "Why do you want to join TanMUN, and why these committees?",
      "apply.words": "words",
      "apply.wordsHint": "Between 75 and 200 words",
      "apply.submit": "Submit application",
      "apply.sending": "Sending…",
      "apply.success.title": "Application received!",
      "apply.success.text": "Thank you for applying to TanMUN. The secretariat will review your application and contact you via email or phone.",
      "apply.success.again": "Submit another application",
      "apply.error.required": "Please fill in this field.",
      "apply.error.email": "Please enter a valid email address.",
      "apply.error.phone": "Please enter a valid phone number.",
      "apply.error.words": "Your letter must be between 75 and 200 words.",
      "apply.error.choices": "Please choose a different committee for each preference.",
      "apply.error.submit": "Something went wrong while sending your application. Please try again.",
      "footer.rights": "All rights reserved.",
      "footer.organizers": "Organizers",
      "demo.banner": "Demo mode — data is saved only in this browser.",
    },
  };

  // The site is English-only. Content objects may still carry old { en, tr }
  // pairs from the database; pick() always uses the English one.
  const lang = "en";

  const listeners = [];

  window.TM = window.TM || {};
  TM.i18n = {
    get lang() { return lang; },
    t(key) { return STRINGS.en[key] || key; },
    // Text fields are stored as { en: "..." } objects (or plain strings).
    pick(obj) {
      if (obj == null) return "";
      if (typeof obj === "string") return obj;
      return obj.en || "";
    },
    onChange(fn) { listeners.push(fn); },
    apply(root) {
      document.documentElement.lang = lang;
      (root || document).querySelectorAll("[data-i18n]").forEach((el) => {
        el.textContent = TM.i18n.t(el.dataset.i18n);
      });
      (root || document).querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        el.placeholder = TM.i18n.t(el.dataset.i18nPlaceholder);
      });
    },
  };
})();
