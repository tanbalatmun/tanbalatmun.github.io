/*
 * Default site content. Organizers can change all of this from /admin —
 * this file is only the starting point (and the fallback if the database is empty).
 */
window.TM_DEFAULT_CONTENT = {
  conference: {
    name: "TanMUN",
    year: "2027",
    tagline: { en: "Future Starts Here" },
    startDate: "2027-01-20T09:00",   // countdown target (local time)
    endDate: "2027-01-21",
    dateLabel: { en: "20–21 January 2027" },
    venue: { en: "Our school campus" },
    instagram: "",
    applicationsOpen: true,
  },

  letter: {
    author: "",
    role: { en: "Secretary-General" },
    body: {
      en: "Distinguished delegates,\n\nIt is our greatest pleasure to welcome you to TanMUN'27. For two days, our school will turn into a forum where you debate the questions that will shape the world you are about to inherit — from human rights to the future of outer space.\n\nWhether this is your first conference or your tenth, we hope you leave with new friends, sharper arguments and the confidence to be heard.\n\nWe can't wait to see you in committee.",
    },
  },

  committees: [
    {
      id: "unoosa",
      code: "UNOOSA",
      name: { en: "United Nations Office for Outer Space Affairs" },
      agenda: {
        en: "Promoting Equitable Access to Space-Based Technologies while Mitigating the Risks of Orbital Weaponization and Space Debris",
      },
      description: {
        en: "UNOOSA promotes international cooperation in the peaceful use and exploration of space. Delegates will balance the right of every nation to benefit from satellites and space technology against a crowded, increasingly militarised orbit.",
      },
      level: { en: "Intermediate" },
      room: "TBA",
      guideUrl: "",
    },
    {
      id: "unhrc",
      code: "UNHRC",
      name: { en: "United Nations Human Rights Council" },
      agenda: { en: "To be announced" },
      description: {
        en: "The Human Rights Council is the UN's main body for protecting and promoting human rights around the world, addressing violations and making recommendations to member states.",
      },
      level: { en: "Beginner friendly" },
      room: "TBA",
      guideUrl: "",
    },
    {
      id: "hcc",
      code: "HCC",
      name: { en: "Historical Crisis Committee" },
      agenda: { en: "To be announced" },
      description: {
        en: "A fast-paced crisis committee set at a turning point in history. Delegates react to live updates, write directives and try to change the course of events — for better or worse.",
      },
      level: { en: "Advanced" },
      room: "TBA",
      guideUrl: "",
    },
  ],

  // tier: "main" | "gold" | "silver" | "partner"
  sponsors: [],

  // group: "secretariat" | "academic" | "boards" | "organization" | "advisors" | "custom"
  // groupName: the heading for a "custom" group (e.g. "Press Team")
  // committee: committee code (only for board members, e.g. "UNOOSA")
  team: [],

  schedule: [
    {
      label: { en: "Day 1" },
      date: { en: "Wednesday, 20 January" },
      items: [
        { time: "TBA", title: { en: "Registration" } },
        { time: "TBA", title: { en: "Opening Ceremony" } },
        { time: "TBA", title: { en: "Committee Session I" } },
        { time: "TBA", title: { en: "Lunch Break" } },
        { time: "TBA", title: { en: "Committee Session II" } },
      ],
    },
    {
      label: { en: "Day 2" },
      date: { en: "Thursday, 21 January" },
      items: [
        { time: "TBA", title: { en: "Committee Session III" } },
        { time: "TBA", title: { en: "Lunch Break" } },
        { time: "TBA", title: { en: "Committee Session IV" } },
        { time: "TBA", title: { en: "Closing Ceremony & Awards" } },
      ],
    },
  ],
};
