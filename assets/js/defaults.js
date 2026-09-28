/*
 * Default site content. Organizers can change all of this from /admin —
 * this file is only the starting point (and the fallback if the database is empty).
 * Every text shown to visitors has an English (en) and Turkish (tr) version.
 */
window.TM_DEFAULT_CONTENT = {
  conference: {
    name: "TanMUN",
    year: "2027",
    tagline: { en: "Future Starts Here", tr: "Gelecek Burada Başlar" },
    startDate: "2027-01-20T09:00",   // countdown target (local time)
    endDate: "2027-01-21",
    dateLabel: { en: "20–21 January 2027", tr: "20–21 Ocak 2027" },
    venue: { en: "Our school campus", tr: "Okul kampüsümüz" },
    instagram: "",
    applicationsOpen: true,
  },

  letter: {
    author: "",
    role: { en: "Secretary-General", tr: "Genel Sekreter" },
    body: {
      en: "Distinguished delegates,\n\nIt is our greatest pleasure to welcome you to TanMUN'27. For two days, our school will turn into a forum where you debate the questions that will shape the world you are about to inherit — from human rights to the future of outer space.\n\nWhether this is your first conference or your tenth, we hope you leave with new friends, sharper arguments and the confidence to be heard.\n\nWe can't wait to see you in committee.",
      tr: "Değerli delegeler,\n\nSizi TanMUN'27'ye davet etmekten büyük mutluluk duyuyoruz. İki gün boyunca okulumuz, insan haklarından uzayın geleceğine kadar miras alacağınız dünyayı şekillendirecek soruları tartışacağınız bir foruma dönüşecek.\n\nİster ilk konferansınız ister onuncusu olsun, yeni arkadaşlıklar, daha güçlü argümanlar ve sesinizi duyurma özgüveniyle ayrılmanızı umuyoruz.\n\nSizi komitelerde görmek için sabırsızlanıyoruz.",
    },
  },

  committees: [
    {
      id: "unoosa",
      code: "UNOOSA",
      name: { en: "United Nations Office for Outer Space Affairs", tr: "Birleşmiş Milletler Uzay İşleri Ofisi" },
      agenda: {
        en: "Promoting Equitable Access to Space-Based Technologies while Mitigating the Risks of Orbital Weaponization and Space Debris",
        tr: "Uzay Tabanlı Teknolojilere Eşit Erişimin Teşvik Edilmesi ile Yörünge Silahlanması ve Uzay Enkazı Risklerinin Azaltılması",
      },
      description: {
        en: "UNOOSA promotes international cooperation in the peaceful use and exploration of space. Delegates will balance the right of every nation to benefit from satellites and space technology against a crowded, increasingly militarised orbit.",
        tr: "UNOOSA, uzayın barışçıl kullanımı ve keşfinde uluslararası iş birliğini teşvik eder. Delegeler, her ülkenin uydu ve uzay teknolojilerinden yararlanma hakkı ile giderek kalabalıklaşan ve silahlanan yörünge arasında denge kuracak.",
      },
      level: { en: "Intermediate", tr: "Orta" },
      room: "TBA",
      guideUrl: "",
      chairs: [],
    },
    {
      id: "unhrc",
      code: "UNHRC",
      name: { en: "United Nations Human Rights Council", tr: "Birleşmiş Milletler İnsan Hakları Konseyi" },
      agenda: { en: "To be announced", tr: "Yakında açıklanacak" },
      description: {
        en: "The Human Rights Council is the UN's main body for protecting and promoting human rights around the world, addressing violations and making recommendations to member states.",
        tr: "İnsan Hakları Konseyi, dünya genelinde insan haklarını korumak ve geliştirmekle görevli temel BM organıdır; ihlalleri ele alır ve üye devletlere tavsiyelerde bulunur.",
      },
      level: { en: "Beginner friendly", tr: "Başlangıç dostu" },
      room: "TBA",
      guideUrl: "",
      chairs: [],
    },
    {
      id: "hcc",
      code: "HCC",
      name: { en: "Historical Crisis Committee", tr: "Tarihi Kriz Komitesi" },
      agenda: { en: "To be announced", tr: "Yakında açıklanacak" },
      description: {
        en: "A fast-paced crisis committee set at a turning point in history. Delegates react to live updates, write directives and try to change the course of events — for better or worse.",
        tr: "Tarihin bir dönüm noktasında geçen, hızlı tempolu bir kriz komitesi. Delegeler anlık gelişmelere tepki verir, direktifler yazar ve olayların seyrini değiştirmeye çalışır.",
      },
      level: { en: "Advanced", tr: "İleri" },
      room: "TBA",
      guideUrl: "",
      chairs: [],
    },
  ],

  // tier: "main" | "gold" | "silver" | "partner"
  sponsors: [],

  schedule: [
    {
      label: { en: "Day 1", tr: "1. Gün" },
      date: { en: "Wednesday, 20 January", tr: "20 Ocak Çarşamba" },
      items: [
        { time: "TBA", title: { en: "Registration", tr: "Kayıt" } },
        { time: "TBA", title: { en: "Opening Ceremony", tr: "Açılış Töreni" } },
        { time: "TBA", title: { en: "Committee Session I", tr: "Komite Oturumu I" } },
        { time: "TBA", title: { en: "Lunch Break", tr: "Öğle Arası" } },
        { time: "TBA", title: { en: "Committee Session II", tr: "Komite Oturumu II" } },
      ],
    },
    {
      label: { en: "Day 2", tr: "2. Gün" },
      date: { en: "Thursday, 21 January", tr: "21 Ocak Perşembe" },
      items: [
        { time: "TBA", title: { en: "Committee Session III", tr: "Komite Oturumu III" } },
        { time: "TBA", title: { en: "Lunch Break", tr: "Öğle Arası" } },
        { time: "TBA", title: { en: "Committee Session IV", tr: "Komite Oturumu IV" } },
        { time: "TBA", title: { en: "Closing Ceremony & Awards", tr: "Kapanış Töreni ve Ödüller" } },
      ],
    },
  ],
};
