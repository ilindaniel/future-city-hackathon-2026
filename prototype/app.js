/*
 * Bobby prototype. Click-through only: no speech, no server, sample events.
 * It exists to show every component from DESIGN.md in a working flow.
 *
 * Plain script (not a module) so the page also opens straight from a file.
 */
(function () {
  "use strict";

  /* ---------- Pixel icons: 12 x 12 grids, one character per pixel ---------- */

  const ICON_COLOURS = {
    k: "var(--ink)",
    o: "var(--action)",
    g: "var(--bobby)",
    w: "var(--surface-raised)",
    b: "var(--sky)",
    p: "var(--like)",
    c: "var(--cream)",
  };

  const ICONS = {
    game: [
      "............",
      "............",
      "..kkkkkkkk..",
      ".kbbbbbbbbk.",
      "kbbkbbbbobbk",
      "kbkkkbbbbbok",
      "kbbkbbbbobbk",
      "kbbbbbbbbbbk",
      "kbbkkkkkkbbk",
      ".kk......kk.",
      "............",
      "............",
    ],
    robot: [
      ".....kk.....",
      ".....kk.....",
      "..kkkkkkkk..",
      "..kwwwwwwk..",
      "..kwkwwkwk..",
      "..kwwwwwwk..",
      "..kwkkkkwk..",
      "..kkkkkkkk..",
      ".kggggggggk.",
      ".kgkggggkgk.",
      ".kggggggggk.",
      "..kk....kk..",
    ],
    code: [
      "............",
      ".kkkkkkkkkk.",
      ".kwwwwwwwwk.",
      ".kwgwwwwwwk.",
      ".kwwgwwwwwk.",
      ".kwgwwgggwk.",
      ".kwwwwwwwwk.",
      ".kkkkkkkkkk.",
      "....kkkk....",
      "..kkkkkkkk..",
      "............",
      "............",
    ],
    build: [
      "............",
      "....kkkk....",
      "....kppk....",
      "....kppk....",
      "....kkkk....",
      ".kkkkkkkkkk.",
      ".kbbbkkgggk.",
      ".kbbbkkgggk.",
      ".kbbbkkgggk.",
      ".kkkkkkkkkk.",
      "............",
      "............",
    ],
    alone: [
      "....kkkk....",
      "...kcccck...",
      "...kcccck...",
      "....kkkk....",
      "...kkkkkk...",
      "..kbbbbbbk..",
      "..kbbbbbbk..",
      "..kbbbbbbk..",
      "..kbbbbbbk..",
      "...kkkkkk...",
      "...kk..kk...",
      "...kk..kk...",
    ],
    friends: [
      "............",
      ".kkk....kkk.",
      "kccck..kccck",
      "kccck..kccck",
      ".kkk....kkk.",
      "kkkkk..kkkkk",
      "kbbbk..kgggk",
      "kbbbk..kgggk",
      "kbbbk..kgggk",
      "kkkkk..kkkkk",
      ".k.k....k.k.",
      "............",
    ],
    house: [
      ".....kk.....",
      "....kook....",
      "...kooook...",
      "..kooooook..",
      ".kooooooook.",
      "kkkkkkkkkkkk",
      ".kwwwwwwwwk.",
      ".kwwkkkwwwk.",
      ".kwwkgkwwwk.",
      ".kwwkgkwwwk.",
      ".kkkkkkkkkk.",
      "............",
    ],
    unsure: [
      "...kkkkkk...",
      "..kooooook..",
      "..kookkook..",
      "..kkk.kook..",
      ".....kook...",
      "....kook....",
      "....kook....",
      "....kkkk....",
      "............",
      "....kkkk....",
      "....kook....",
      "....kkkk....",
    ],
    heart: [
      "............",
      "..kk....kk..",
      ".kppk..kppk.",
      "kppppkkppppk",
      "kppppppppppk",
      "kppppppppppk",
      ".kppppppppk.",
      "..kppppppk..",
      "...kppppk...",
      "....kppk....",
      ".....kk.....",
      "............",
    ],
    heartEmpty: [
      "............",
      "..kk....kk..",
      ".kwwk..kwwk.",
      "kwwwwkkwwwwk",
      "kwwwwwwwwwwk",
      "kwwwwwwwwwwk",
      ".kwwwwwwwwk.",
      "..kwwwwwwk..",
      "...kwwwwk...",
      "....kwwk....",
      ".....kk.....",
      "............",
    ],
    mic: [
      "....kkkk....",
      "...kwwwwk...",
      "...kwwwwk...",
      "...kwwwwk...",
      ".k.kwwwwk.k.",
      ".k.kwwwwk.k.",
      ".k..kkkk..k.",
      "..k......k..",
      "...kkkkkk...",
      ".....kk.....",
      ".....kk.....",
      "...kkkkkk...",
    ],
    next: [
      "............",
      "......k.....",
      "......kk....",
      "kkkkkkkok...",
      "kooooooook..",
      "koooooooook.",
      "kooooooook..",
      "kkkkkkkok...",
      "......kk....",
      "......k.....",
      "............",
      "............",
    ],
    ai: [
      "..k..k..k...",
      ".kkkkkkkkk..",
      "kkbbbbbbbkk.",
      ".kbwwbwwbk..",
      "kkbwkbwkbkk.",
      ".kbbbbbbbk..",
      "kkbwbbbwbkk.",
      ".kbbwwwbbk..",
      "kkbbbbbbbkk.",
      ".kkkkkkkkk..",
      "..k..k..k...",
      "............",
    ],
    speaker: [
      "............",
      ".....kk.....",
      "....kwk..k..",
      "kkkkwwk...k.",
      "kwwwwwk.k.k.",
      "kwwwwwk.k.k.",
      "kwwwwwk.k.k.",
      "kkkkwwk...k.",
      "....kwk..k..",
      ".....kk.....",
      "............",
      "............",
    ],
  };

  /** Builds an inline SVG for a named icon. Each grid cell becomes one square. */
  function iconSvg(name, size) {
    const rows = ICONS[name] || ICONS.unsure;
    let squares = "";
    rows.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        const colour = ICON_COLOURS[cell.toLowerCase()];
        if (colour) squares += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colour}"/>`;
      });
    });
    const sizeClass = size ? ` icon--${size}` : "";
    return `<svg class="icon${sizeClass}" viewBox="0 0 12 12" aria-hidden="true">${squares}</svg>`;
  }

  /* ---------- Text in both languages ---------- */

  const TEXT = {
    de: {
      "entry.title": "Wer bist du?",
      "entry.kid": "Ich bin ein Kind",
      "entry.adult": "Ich bin erwachsen",
      "kid.aiTag": "KI-Helfer",
      "kid.badge": "Psst!",
      "kid.all": "Alle Orte",
      "browse.title": "Alle geheimen Orte",
      "browse.back": "Zu Bobby",
      "like.add": "Herz geben",
      "like.remove": "Herz zurücknehmen",
      "kid.wake": "Was weiß Bobby?",
      "kid.wakeHint": "Tippe Bobby an. Dann gehen Ton und Mikrofon an.",
      "kid.hello": "Psst! Ich bin Bobby, die Computer-Ente. Kein Mensch, aber ich weiß Sachen. In Heilbronn gibt es geheime Orte für Kinder. Willst du einen sehen?",
      "kid.noMic": "Ich höre dich gerade nicht. Macht nichts. Tipp einfach.",
      "kid.show": "Zeig her!",
      "kid.next": "Was noch?",
      "kid.cool": "Cool!",
      "kid.saved": "Gemerkt",
      "kid.liked": "Merk ich mir. Das sehen nur deine Eltern. Noch eins?",
      "kid.endLiked": "Das waren meine Geheimnisse für heute. Zeig deinen Eltern, was ein Herz hat.",
      "kid.endNone": "Nichts dabei? Okay. Ich höre mich um und finde was Besseres.",
      "kid.share": "Meinen Eltern zeigen",
      "kid.pitch": "Psst. Kennst du „{title}“? Da geht es um {about}. Bei {provider}. Cool oder nee?",
      "about.gaming": "Spiele, die du selbst baust",
      "about.robotics": "Roboter",
      "about.coding": "Programmieren",
      "about.ai": "künstliche Intelligenz",
      "about.making": "Bauen und Tüfteln",
      "topic.ai": "KI",
      "topic.robotics": "Robotik",
      "topic.coding": "Coding",
      "topic.gaming": "Gaming",
      "topic.making": "Bauen",
      "label.age": "Jahre",
      "label.ageFrom": "ab {n} Jahren",
      "label.allAges": "jedes Alter",
      "label.clock": " Uhr",
      "label.moreDates": "weitere Termine",
      "label.free": "kostenlos",
      "label.priceUnknown": "siehe Anbieter",
      "avail.full": "Ausgebucht",
      "avail.waitlist": "Warteliste",
      "parent.sample": "Beispieldaten. Die echten Angebote konnten nicht geladen werden.",
      "parent.dataNote": "Stand {date}. Quelle: die Webseiten von aim, experimenta und Haus der Familie.",
      "ear.listening": "Ich höre zu",
      "ear.speaking": "Ich spreche",
      "kid.restart": "Nochmal",
      "share.title": "Zeig das deinen Eltern",
      "share.text": "Deine Eltern sehen nur, was ein Herz hat. Was du sagst, merke ich mir nicht.",
      "share.close": "Fertig",
      "parent.back": "Zurück",
      "auth.title": "Für Eltern",
      "auth.lead": "Melden Sie sich an, um zu sehen, was Ihrem Kind gefällt.",
      "auth.point1": "Sie laden Ihr Kind mit einem Link ein.",
      "auth.point2": "Ihr Kind spricht mit Bobby und markiert Angebote mit einem Herz.",
      "auth.point3": "Sie sehen diese Angebote hier und melden Ihr Kind selbst an.",
      "auth.google": "Mit Google anmelden",
      "auth.googleBusy": "Weiter zu Google …",
      "auth.error": "Die Anmeldung wurde abgebrochen. Bitte versuchen Sie es noch einmal.",
      "auth.note": "Ihr Kind braucht kein Konto und kein Passwort.",
      "auth.cancel": "Abbrechen",
      "auth.signOut": "Abmelden",
      "auth.signedInAs": "Angemeldet als",
      "consent.title": "Einverständnis",
      "consent.storedTitle": "Das speichern wir",
      "consent.stored": "Die Angebote, die Ihr Kind mit einem Herz markiert, und ein allgemeines Interesse, zum Beispiel „Coding“.",
      "consent.notStoredTitle": "Das speichern wir nicht",
      "consent.notStored": "Was Ihr Kind sagt, Tonaufnahmen, den Namen oder das Alter Ihres Kindes.",
      "consent.check": "Ich bin erziehungsberechtigt und damit einverstanden.",
      "consent.continue": "Weiter",
      "parent.inviteLink": "Einladungslink",
      "parent.showQr": "QR-Code zeigen",
      "parent.statusWaiting": "Ihr Kind hat den Link noch nicht geöffnet.",
      "parent.statusUsed": "Ihr Kind hat mit Bobby gesprochen.",
      "parent.noteTitle": "Was Sie hier sehen",
      "parent.noteText": "Nur die Angebote, denen Ihr Kind ein Herz gegeben hat. Was Ihr Kind sagt, wird nicht gespeichert.",
      "parent.likedSummary": "Ihr Kind interessiert sich für",
      "parent.count": "Angebote",
      "parent.likedBadge": "Von Ihrem Kind gewählt",
      "fact.when": "Wann",
      "fact.where": "Wo",
      "fact.age": "Alter",
      "fact.price": "Preis",
      "inviteQr.title": "Mit dem Gerät Ihres Kindes scannen",
      "inviteQr.text": "Der Code öffnet Bobby für Ihr Kind. Es braucht kein Konto.",
      "parent.inviteTitle": "Einladung für Ihr Kind",
      "parent.inviteText": "Ihr Kind öffnet den Link und spricht mit Bobby. Sie sehen nur, was es mit einem Herz markiert.",
      "parent.copy": "Link kopieren",
      "parent.copied": "Kopiert",
      "parent.likedTitle": "Das gefällt Ihrem Kind",
      "parent.theme": "Interesse",
      "parent.noLikes": "Noch keine Herzen. Sobald Ihr Kind etwas markiert, erscheint es hier.",
      "parent.allTitle": "Alle Angebote",
      "parent.search": "Angebote suchen",
      "parent.noResults": "Dazu gibt es gerade kein Angebot.",
      "parent.register": "Zur Anmeldung",
      "filter.all": "Alle",
      language: "EN",
      languageLabel: "Switch to English",
    },
    en: {
      "entry.title": "Who are you?",
      "entry.kid": "I'm a kid",
      "entry.adult": "I'm a grown-up",
      "kid.aiTag": "AI helper",
      "kid.badge": "Psst!",
      "kid.all": "All places",
      "browse.title": "All the secret places",
      "browse.back": "Back to Bobby",
      "like.add": "Give a heart",
      "like.remove": "Take the heart back",
      "kid.wake": "What does Bobby know?",
      "kid.wakeHint": "Tap Bobby. That turns on sound and the microphone.",
      "kid.hello": "Psst! I'm Bobby, the computer duck. Not a person, but I know things. Heilbronn has secret places for kids. Want to see one?",
      "kid.noMic": "I can't hear you right now. No problem. Just tap.",
      "kid.show": "Show me!",
      "kid.next": "What else?",
      "kid.cool": "Cool!",
      "kid.saved": "Saved",
      "kid.liked": "Noted. Only your grown-up sees that. One more?",
      "kid.endLiked": "Those were my secrets for today. Show your grown-up the ones with a heart.",
      "kid.endNone": "Nothing for you? Fair. I'll ask around and find something better.",
      "kid.share": "Show my grown-up",
      "kid.pitch": "Psst. Ever heard of “{title}”? It's about {about}. At {provider}. Cool or nah?",
      "about.gaming": "games you build yourself",
      "about.robotics": "robots",
      "about.coding": "coding",
      "about.ai": "artificial intelligence",
      "about.making": "building and tinkering",
      "topic.ai": "AI",
      "topic.robotics": "Robotics",
      "topic.coding": "Coding",
      "topic.gaming": "Gaming",
      "topic.making": "Making",
      "label.age": "years",
      "label.ageFrom": "{n}+ years",
      "label.allAges": "all ages",
      "label.clock": "",
      "label.moreDates": "more dates",
      "label.free": "free",
      "label.priceUnknown": "see provider",
      "avail.full": "Fully booked",
      "avail.waitlist": "Waiting list",
      "parent.sample": "Sample data. The real offers could not be loaded.",
      "parent.dataNote": "As of {date}. Source: the websites of aim, experimenta and Haus der Familie.",
      "ear.listening": "I'm listening",
      "ear.speaking": "I'm talking",
      "kid.restart": "Again",
      "share.title": "Show this to your grown-up",
      "share.text": "Your grown-up only sees what has a heart. I don't keep what you say.",
      "share.close": "Done",
      "parent.back": "Back",
      "auth.title": "For parents",
      "auth.lead": "Sign in to see what your child likes.",
      "auth.point1": "You invite your child with a link.",
      "auth.point2": "Your child talks to Bobby and marks offers with a heart.",
      "auth.point3": "You see those offers here and register your child yourself.",
      "auth.google": "Sign in with Google",
      "auth.googleBusy": "Continuing to Google…",
      "auth.error": "Sign-in was cancelled. Please try again.",
      "auth.note": "Your child needs no account and no password.",
      "auth.cancel": "Cancel",
      "auth.signOut": "Sign out",
      "auth.signedInAs": "Signed in as",
      "consent.title": "Your consent",
      "consent.storedTitle": "What we store",
      "consent.stored": "The offers your child marks with a heart, and one general interest such as “coding”.",
      "consent.notStoredTitle": "What we do not store",
      "consent.notStored": "What your child says, audio recordings, your child's name or age.",
      "consent.check": "I am the parent or guardian and I agree.",
      "consent.continue": "Continue",
      "parent.inviteLink": "Invite link",
      "parent.showQr": "Show QR code",
      "parent.statusWaiting": "Your child has not opened the link yet.",
      "parent.statusUsed": "Your child has talked to Bobby.",
      "parent.noteTitle": "What you see here",
      "parent.noteText": "Only the offers your child gave a heart. What your child says is not stored.",
      "parent.likedSummary": "Your child is interested in",
      "parent.count": "offers",
      "parent.likedBadge": "Chosen by your child",
      "fact.when": "When",
      "fact.where": "Where",
      "fact.age": "Age",
      "fact.price": "Price",
      "inviteQr.title": "Scan with your child's device",
      "inviteQr.text": "The code opens Bobby for your child. No account needed.",
      "parent.inviteTitle": "Invite your child",
      "parent.inviteText": "Your child opens the link and talks to Bobby. You only see what they mark with a heart.",
      "parent.copy": "Copy link",
      "parent.copied": "Copied",
      "parent.likedTitle": "Your child likes these",
      "parent.theme": "Interest",
      "parent.noLikes": "No hearts yet. Events your child marks will appear here.",
      "parent.allTitle": "All offers",
      "parent.search": "Search offers",
      "parent.noResults": "There is no offer for this right now.",
      "parent.register": "Go to registration",
      "filter.all": "All",
      language: "DE",
      languageLabel: "Auf Deutsch wechseln",
    },
  };

  /* ---------- Offers ----------
   * The catalogue is public/data/offers.json, written by the importer in
   * ingestion/ (npm run import:offers). The page only reads it.
   */

  const CATALOGUE_URL = "public/data/offers.json";

  // How each importer topic looks. The order is also the order of Bobby's secrets.
  const TOPICS = {
    gaming: { icon: "game", colour: "var(--sky)" },
    robotics: { icon: "robot", colour: "var(--cream)" },
    coding: { icon: "code", colour: "var(--grass)" },
    ai: { icon: "ai", colour: "var(--cream)" },
    making: { icon: "build", colour: "var(--water)" },
  };

  const PROVIDER_NAMES = { aim: "aim", experimenta: "experimenta", hdf: "Haus der Familie", ipai: "IPAI" };

  const daysFromNow = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  const sample = (n, provider, title, topic, min, max, days, time, place) => ({
    id: `sample:${n}`, provider, sourceUrl: "#", title, description: "", topics: [topic],
    age: { min, max }, schedule: [{ date: daysFromNow(days), startTime: time, endTime: null }],
    location: { name: place }, price: { type: "free" }, availability: "available",
  });

  // Invented offers in the importer's format. Shown only if the real catalogue
  // cannot be loaded, for example when the page is opened straight from a file.
  const SAMPLE_OFFERS = [
    sample(1, "aim", "Baue dein eigenes Spiel", "gaming", 8, 12, 3, "10:00", "Bildungscampus"),
    sample(2, "experimenta", "Roboter-Werkstatt", "robotics", 6, 10, 4, "14:00", "experimenta Heilbronn"),
    sample(3, "hdf", "Erste Schritte mit Scratch", "coding", 8, 12, 6, "16:00", "Haus der Familie"),
    sample(4, "ipai", "KI zum Ausprobieren", "ai", 10, 14, 8, "15:00", "IPAI"),
    sample(5, "experimenta", "Tüfteln und Löten", "making", 6, 10, 10, "13:00", "experimenta Heilbronn"),
  ];

  // Bobby only reveals offers a child of this age could attend. The age band is
  // an assumption until the product knows more about who is talking.
  const CHILD_AGE = { min: 6, max: 12 };

  let offers = []; // upcoming offers, soonest first
  let secrets = []; // the ones Bobby reveals, one per topic
  let catalogue = { real: false, generatedAt: null };

  /**
   * Drops dates that are over and offers with no date left. Same rule as
   * filterUpcomingOffers in ingestion/offers.ts: dates are compared as
   * Europe/Berlin wall-clock time, and an event counts until its end time.
   */
  function upcomingOffers(list, now) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(now);
    const part = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const today = `${part.year}-${part.month}-${part.day}`;
    const clock = `${part.hour}:${part.minute}`;

    return list.flatMap((offer) => {
      const schedule = offer.schedule.filter((entry) => {
        if (entry.date !== today) return entry.date > today;
        const lastKnownTime = entry.endTime ?? entry.startTime;
        return lastKnownTime === null || lastKnownTime >= clock;
      });
      return schedule.length ? [{ ...offer, schedule }] : [];
    });
  }

  /** Takes a catalogue into use: sorts it, picks Bobby's secrets, redraws. */
  function useCatalogue(list, meta) {
    const startOf = (offer) => `${offer.schedule[0].date} ${offer.schedule[0].startTime ?? ""}`;
    offers = upcomingOffers(list, new Date())
      .map((offer) => ({ ...offer, schedule: [...offer.schedule].sort((a, b) => a.date.localeCompare(b.date)) }))
      .sort((a, b) => startOf(a).localeCompare(startOf(b)));
    catalogue = meta;

    // One secret per topic. Bobby does not tease a place that is already full.
    const open = offers.filter(
      (offer) =>
        offer.availability !== "full" &&
        (offer.age.min === null || offer.age.min <= CHILD_AGE.max) &&
        (offer.age.max === null || offer.age.max >= CHILD_AGE.min)
    );
    secrets = Object.keys(TOPICS)
      .map((topic) => open.find((offer) => offer.topics[0] === topic) || open.find((offer) => offer.topics.includes(topic)))
      .filter((offer, index, all) => offer && all.indexOf(offer) === index);

    state.liked = new Set();
    applyDemo();
  }

  function loadCatalogue() {
    return fetch(CATALOGUE_URL)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data) => {
        if (!upcomingOffers(data.offers, new Date()).length) throw new Error("no upcoming offers");
        useCatalogue(data.offers, { real: true, generatedAt: data.generatedAt });
      })
      .catch(() => {
        // Keep the sample catalogue. The parent area says that it is sample data.
      })
      .then(render);
  }

  /* ---------- How an offer is put into words ---------- */

  const topicOf = (offer) => TOPICS[offer.topics[0]] || TOPICS.coding;
  const providerOf = (offer) => PROVIDER_NAMES[offer.provider] || offer.provider;
  const topicNames = (list) => [...new Set(list.flatMap((offer) => offer.topics))].map((topic) => t("topic." + topic));

  /**
   * A title short enough to say aloud and to fit a child's card: without the
   * age in brackets and without the subtitle after a colon or dash.
   */
  function shortTitle(offer) {
    return offer.title
      .replace(/\s*\([^)]*\)\s*$/, "")
      .split(/:\s| [–-] /)[0]
      .trim();
  }

  /** What Bobby says. Lines about an offer name it, its topic and who runs it. */
  function line(key, offer) {
    if (!offer) return t(key);
    return t(key)
      .replace("{title}", shortTitle(offer))
      .replace("{about}", t("about." + offer.topics[0]))
      .replace("{provider}", providerOf(offer));
  }

  function ageText(offer) {
    const { min, max } = offer.age;
    if (min !== null && max !== null) return `${min}–${max} ${t("label.age")}`;
    if (min !== null) return t("label.ageFrom").replace("{n}", min);
    return t("label.allAges");
  }

  function dateText(isoDate, options) {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Intl.DateTimeFormat(state.language, { timeZone: "UTC", ...options }).format(
      new Date(Date.UTC(year, month - 1, day))
    );
  }

  /** The next date, and how many more there are. */
  function whenText(offer) {
    const [next, ...later] = offer.schedule;
    const day = dateText(next.date, { weekday: "short", day: "numeric", month: "short" });
    const time = next.startTime ? `, ${next.startTime}${t("label.clock")}` : "";
    const more = later.length ? ` · +${later.length} ${t("label.moreDates")}` : "";
    return day + time + more;
  }

  function priceText(offer) {
    if (offer.price.type === "free") return t("label.free");
    if (offer.price.type === "paid") {
      return new Intl.NumberFormat(state.language, { style: "currency", currency: "EUR" }).format(
        offer.price.amountCents / 100
      );
    }
    return t("label.priceUnknown");
  }

  /** "Fully booked" or "Waiting list" as a tag; nothing when places are free or unknown. */
  function availabilityTag(offer) {
    if (offer.availability === "full") return `<span class="tag tag--alert">${t("avail.full")}</span>`;
    if (offer.availability === "waitlist") return `<span class="tag tag--alert">${t("avail.waitlist")}</span>`;
    return "";
  }

  /* ---------- Anonymous usage counts ----------
   * Same hook as the app on primary-source: if the Umami script is on the
   * page, these events show which topics children react to. No names, no text
   * the child said, no offer the child liked is tied to a person.
   */
  function track(name, data) {
    if (window.umami && typeof window.umami.track === "function") window.umami.track(name, data);
  }

  const state = {
    language: "de",
    screen: "entry",
    // Where the conversation with Bobby is:
    // idle (not tapped yet) -> hello -> secret (one event at a time) -> end
    phase: "idle",
    secret: 0, // index into `secrets` while phase is "secret"
    said: null, // text key of the last thing Bobby said; shown in the bubble
    saidAbout: null, // the offer that line is about, if any
    talking: false, // Bobby is speaking right now
    micAllowed: null, // null until asked; false means taps carry the conversation
    liked: new Set(),
    // Parent sign-in: signedOut -> signingIn -> needsConsent -> signedIn
    auth: "signedOut",
    authError: false,
    profile: null, // { name, email } from Google once signed in
    filter: "all",
    query: "",
  };

  let stopCursorTrail = null;

  const $ = (selector) => document.querySelector(selector);
  const t = (key) => TEXT[state.language][key] ?? key;

  /* ---------- Rendering ---------- */

  function renderStaticText() {
    document.documentElement.lang = state.language;
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll('[data-action="language"]').forEach((button) => {
      button.textContent = t("language");
      button.setAttribute("aria-label", t("languageLabel"));
    });
  }

  function renderIcons() {
    document.querySelectorAll("[data-icon]").forEach((node) => {
      node.innerHTML = iconSvg(node.dataset.icon, node.dataset.iconSize);
    });
  }

  const picture = (offer) =>
    `<div class="event__picture" style="background:${topicOf(offer).colour}">${iconSvg(topicOf(offer).icon)}</div>`;

  const childTags = (offer) =>
    `<div class="event__tags"><span class="tag">${ageText(offer)}</span><span class="tag">${providerOf(offer)}</span></div>`;

  /** The one offer Bobby is showing right now. */
  function secretCard(offer) {
    const liked = state.liked.has(offer.id);
    return `${picture(offer)}
      <div>
        <h3 class="event__title">${shortTitle(offer)}</h3>
        ${childTags(offer)}
      </div>
      <div class="secret__mark" ${liked ? "" : "hidden"}>${iconSvg("heart", "small")}</div>`;
  }

  /** Parent card. Offers the child chose are marked and get the main button. */
  function parentCard(offer, chosen) {
    const fact = (label, value) => `<div><dt>${t(label)}</dt><dd>${value}</dd></div>`;
    const tags = offer.topics.map((topic) => `<span class="tag">${t("topic." + topic)}</span>`).join("");
    const link = offer.sourceUrl === "#" ? 'href="#"' : `href="${offer.sourceUrl}" target="_blank" rel="noopener"`;
    return `<article class="event event--parent panel ${chosen ? "event--chosen" : ""}">
      <div>
        ${chosen ? `<p class="event__badge">♥ ${t("parent.likedBadge")}</p>` : ""}
        <h3 class="event__title">${offer.title}</h3>
        <div class="event__tags">${tags}${availabilityTag(offer)}</div>
      </div>
      <dl class="event__facts">
        ${fact("fact.when", whenText(offer))}
        ${fact("fact.where", offer.location.name)}
        ${fact("fact.age", ageText(offer))}
        ${fact("fact.price", priceText(offer))}
      </dl>
      <a class="button ${chosen ? "button--bobby" : "button--quiet"} button--small" ${link}
        data-register="${offer.provider}">${t("parent.register")} · ${providerOf(offer)}</a>
    </article>`;
  }

  /** Child card for the "all places" list: picture, title, heart. */
  function browseCard(offer) {
    const liked = state.liked.has(offer.id);
    return `<article class="event glass">
      ${picture(offer)}
      <div>
        <h3 class="event__title">${shortTitle(offer)}</h3>
        ${childTags(offer)}
      </div>
      <button class="heart" type="button" data-like="${offer.id}" aria-pressed="${liked}"
        aria-label="${t(liked ? "like.remove" : "like.add")}: ${offer.title}">
        ${iconSvg(liked ? "heart" : "heartEmpty")}</button>
    </article>`;
  }

  function renderBrowse() {
    $("#browse-list").innerHTML = offers.map(browseCard).join("");
    $("#browse-share").hidden = state.liked.size === 0;
  }

  function renderKid() {
    const { phase } = state;
    const event = secrets[state.secret];
    // Bobby's beak moves while he talks (the "speaking" sprite).
    $("#bobby").classList.toggle("is-talking", state.talking);

    // Before the first tap there is only Bobby, a "Psst!" and one button.
    $("#sleep-badge").hidden = phase !== "idle";
    $("#bobby-button").setAttribute("aria-label", phase === "idle" ? t("kid.wakeHint") : "Bobby");

    // The bubble is Bobby's subtitles.
    $("#bubble").hidden = phase === "idle";
    $("#bubble-text").textContent = state.said ? line(state.said, state.saidAbout) : "";

    const secret = $("#secret");
    secret.hidden = phase !== "secret";
    if (phase === "secret") secret.innerHTML = secretCard(event);

    $("#controls").innerHTML = controlsFor(phase, event);
  }

  /** The buttons under Bobby. There is never more than one decision on screen. */
  function controlsFor(phase, event) {
    const button = (action, label, look, icons = "") =>
      `<button class="button ${look}" type="button" data-action="${action}">${icons}<span>${t(label)}</span></button>`;

    if (phase === "idle") {
      const icons = `<span class="button__icons">${iconSvg("speaker", "small")}${iconSvg("mic", "small")}</span>`;
      return button("wake", "kid.wake", "button--block", icons);
    }

    let buttons = "";
    if (phase === "hello") {
      buttons = button("next", "kid.show", "");
    } else if (phase === "secret") {
      const liked = state.liked.has(event.id);
      buttons =
        button("next", "kid.next", "button--quiet", iconSvg("next", "small")) +
        button("cool", liked ? "kid.saved" : "kid.cool", liked ? "button--bobby" : "", iconSvg("heart", "small"));
    } else if (phase === "end") {
      buttons =
        button("restart", "kid.restart", "button--quiet") +
        (state.liked.size ? button("share", "kid.share", "button--bobby") : "");
    }

    return earChip() + buttons;
  }

  /**
   * Small status line: Bobby is talking, or Bobby is listening. While Bobby
   * listens it is a button, because the prototype cannot hear: a tap on it
   * stands in for the child saying something.
   */
  function earChip() {
    if (state.talking) {
      return `<p class="ear">${iconSvg("speaker", "small")}<span>${t("ear.speaking")}</span></p>`;
    }
    if (state.micAllowed && state.phase !== "end") {
      return `<button class="ear ear--listening" type="button" data-action="next">
        <span class="mic__bars" aria-hidden="true"><i></i><i></i><i></i></span><span>${t("ear.listening")}</span></button>`;
    }
    return "";
  }

  /* ---------- Bobby's voice and ears ---------- */

  let speechTimer = null;

  /**
   * Bobby says a line: it appears in the bubble and is read aloud by the
   * browser's built-in voice. `then` runs once when the line is finished.
   * Browsers only allow sound after a tap, which is why nothing is said
   * before the child taps Bobby.
   */
  function say(key, then, about = null) {
    hush();
    state.said = key;
    state.saidAbout = about;
    state.talking = true;
    const text = line(key, about);
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(speechTimer);
      state.talking = false;
      if (then) then();
      if (state.screen === "kid") renderKid();
    };
    if ("speechSynthesis" in window) {
      const line = new SpeechSynthesisUtterance(text);
      line.lang = state.language === "de" ? "de-DE" : "en-US";
      line.pitch = 1.2;
      line.onend = done;
      window.speechSynthesis.speak(line);
    }
    // Safety net: some browsers never report the end, or have no voice at all.
    speechTimer = setTimeout(done, 1500 + text.length * 80);
  }

  function hush() {
    clearTimeout(speechTimer);
    state.talking = false;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  /** Asks for the microphone. Resolves to true when the child can be heard. */
  function askForMicrophone() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.resolve(false);
    return navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop()); // the prototype does not record
        return true;
      })
      .catch(() => false);
  }

  /** The first tap: sound goes on, the microphone is asked for, Bobby opens the conversation. */
  function wakeBobby() {
    state.phase = "hello";
    const microphone = askForMicrophone();
    say("kid.hello", () => {
      microphone.then((allowed) => {
        state.micAllowed = allowed;
        if (!allowed && state.screen === "kid" && state.phase === "hello") say("kid.noMic");
        else if (state.screen === "kid") renderKid();
      });
    });
  }

  /** Bobby reveals the next secret, or wraps up when there are none left. */
  function nextSecret() {
    if (state.phase === "secret" && !state.liked.has(secrets[state.secret].id)) {
      track("secret_skipped", { topic: secrets[state.secret].topics[0] });
    }
    state.secret = state.phase === "secret" ? state.secret + 1 : 0;
    if (state.secret < secrets.length) {
      state.phase = "secret";
      say("kid.pitch", null, secrets[state.secret]);
      track("secret_shown", { topic: secrets[state.secret].topics[0] });
    } else {
      state.phase = "end";
      say(state.liked.size ? "kid.endLiked" : "kid.endNone");
    }
  }

  /** The child likes what Bobby is showing. */
  function likeSecret() {
    const { id, topics } = secrets[state.secret];
    if (state.liked.has(id)) {
      state.liked.delete(id);
    } else {
      state.liked.add(id);
      say("kid.liked");
      track("secret_liked", { topic: topics[0] });
    }
  }

  function resetKid() {
    hush();
    state.phase = "idle";
    state.secret = 0;
    state.said = null;
    state.saidAbout = null;
    state.micAllowed = null;
  }

  function renderParent() {
    const liked = offers.filter((offer) => state.liked.has(offer.id));
    $("#liked").innerHTML = liked.length
      ? liked.map((offer) => parentCard(offer, true)).join("")
      : `<p class="notice panel">${t("parent.noLikes")}</p>`;

    const summary = $("#liked-summary");
    summary.hidden = liked.length === 0;
    summary.textContent = `${t("parent.likedSummary")} ${topicNames(liked).join(", ")}.`;

    $("#invite-status").textContent = t(liked.length ? "parent.statusUsed" : "parent.statusWaiting");

    const present = Object.keys(TOPICS).filter((topic) => offers.some((offer) => offer.topics.includes(topic)));
    $("#filters").innerHTML = ["all", ...present]
      .map(
        (filter) => `<button class="chip" type="button" data-filter="${filter}"
          aria-pressed="${state.filter === filter}">${t(filter === "all" ? "filter.all" : "topic." + filter)}</button>`
      )
      .join("");

    const query = state.query.trim().toLowerCase();
    const shown = offers.filter((offer) => {
      const inTopic = state.filter === "all" || offer.topics.includes(state.filter);
      const haystack = [offer.title, offer.description, offer.location.name, providerOf(offer), ...topicNames([offer])]
        .join(" ")
        .toLowerCase();
      return inTopic && haystack.includes(query);
    });
    $("#result-count").textContent = `${shown.length} ${t("parent.count")}`;
    $("#catalogue").innerHTML = shown.length
      ? shown.map((offer) => parentCard(offer, false)).join("")
      : `<p class="notice panel">${t("parent.noResults")}</p>`;

    // Say where the offers come from, or admit that they are samples.
    $("#data-note").textContent = catalogue.real
      ? t("parent.dataNote").replace("{date}", dateText(catalogue.generatedAt.slice(0, 10), { dateStyle: "long" }))
      : t("parent.sample");
  }

  const SCREENS = ["entry", "kid", "browse", "signin", "consent", "parent"];

  /* ---------- Parent sign-in ---------- */

  /**
   * Stand-in for Google sign-in. It waits a moment and returns a made-up
   * profile, so the screens and states can be designed and clicked through.
   *
   * To make it real, replace the body with Google Identity Services: load
   * https://accounts.google.com/gsi/client, request an ID token for the
   * project's OAuth client ID, send the token to the server to be verified,
   * and resolve with the name and e-mail the server returns. Reject when the
   * parent closes the Google window; the caller already shows the error.
   */
  function signInWithGoogle() {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ name: "Alex Beispiel", email: "alex.beispiel@example.com" }), 900);
    });
  }

  /** Which parent screen the current sign-in state leads to. */
  function parentScreen() {
    if (state.auth === "signedIn") return "parent";
    if (state.auth === "needsConsent") return "consent";
    return "signin";
  }

  function startGoogleSignIn() {
    state.auth = "signingIn";
    state.authError = false;
    render();
    signInWithGoogle()
      .then((profile) => {
        state.profile = profile;
        state.auth = "needsConsent";
      })
      .catch(() => {
        state.auth = "signedOut";
        state.authError = true;
      })
      .then(() => {
        if (["signin", "consent"].includes(state.screen)) state.screen = parentScreen();
        render();
      });
  }

  function signOut() {
    state.auth = "signedOut";
    state.authError = false;
    state.profile = null;
    state.screen = "entry";
  }

  function renderAuth() {
    const busy = state.auth === "signingIn";
    const google = $("#google-button");
    google.disabled = busy;
    google.setAttribute("aria-busy", String(busy));
    $("#google-label").textContent = t(busy ? "auth.googleBusy" : "auth.google");

    const error = $("#auth-error");
    error.hidden = !state.authError;
    error.textContent = t("auth.error");

    if (state.profile) {
      const initial = state.profile.name.charAt(0);
      $("#consent-avatar").textContent = initial;
      $("#account-avatar").textContent = initial;
      $("#consent-account").textContent = `${t("auth.signedInAs")} ${state.profile.email}`;
      $("#account-name").textContent = state.profile.email;
    }
    $("#consent-button").disabled = !$("#consent-check").checked;
  }

  function render() {
    renderStaticText();
    renderIcons();
    SCREENS.forEach((name) => {
      $("#screen-" + name).hidden = state.screen !== name;
    });
    // Parent screens are calm: no scene and no cursor trail (DESIGN.md, section 9).
    const calm = ["signin", "consent", "parent"].includes(state.screen);
    document.body.dataset.world = calm ? "calm" : "pixel";
    if (state.screen === "kid") renderKid();
    if (state.screen === "browse") renderBrowse();
    if (calm) renderAuth();
    if (state.screen === "parent") renderParent();
    updateCursorTrail();
    placeScene();
  }

  /* ---------- Keep Bobby's feet on the grass ---------- */

  // Width and height of the scene art, in its own pixels.
  const SCENE_RATIO = 1672 / 941;
  // Share of the scene, measured from its bottom edge, that is grass at the
  // point where Bobby stands.
  const GRASS_SHARE = 0.25;
  // The grass must start this far above Bobby's feet, as a share of Bobby's
  // height, so the legs and belly are in front of grass and not of water.
  const GRASS_OVERLAP = 0.45;

  /**
   * The scene is pinned to the bottom of the screen. On the child screen this
   * sets its height so the grass reaches above Bobby's feet, however much
   * room the controls under Bobby take. Elsewhere the size from the
   * stylesheet applies.
   */
  function placeScene() {
    const scene = $(".scene");
    if (state.screen !== "kid") {
      scene.style.removeProperty("--scene-height");
      return;
    }
    const feet = $(".stage").getBoundingClientRect().bottom;
    const bobbyHeight = $("#bobby").getBoundingClientRect().height;
    const grassNeeded = window.innerHeight - feet + bobbyHeight * GRASS_OVERLAP;
    const coverHeight = Math.max(window.innerHeight, window.innerWidth / SCENE_RATIO);
    const height = Math.max(grassNeeded / GRASS_SHARE, coverHeight);
    scene.style.setProperty("--scene-height", `${Math.ceil(height)}px`);
  }

  window.addEventListener("resize", placeScene);

  /* ---------- Cursor trail: child screens only ---------- */

  function updateCursorTrail() {
    const onChildScreen = () => ["kid", "browse"].includes(state.screen);
    const wanted = onChildScreen();
    if (wanted && !stopCursorTrail) {
      stopCursorTrail = () => {}; // placeholder while the module loads
      import("../cursor-trail/cursor-trail.js")
        .then((module) => {
          if (onChildScreen()) stopCursorTrail = module.initCursorTrail();
          else stopCursorTrail = null;
        })
        .catch(() => {
          // Opened straight from a file: browsers block module loading there.
          // The trail is decoration, so the prototype carries on without it.
          stopCursorTrail = null;
        });
    } else if (!wanted && stopCursorTrail) {
      stopCursorTrail();
      stopCursorTrail = null;
    }
  }

  /* ---------- A fake QR code so the sheet has the right shape ---------- */

  function renderQr() {
    const size = 21;
    let squares = "";
    const finder = (x, y) => x < 7 && y < 7;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const corner = finder(x, y) || finder(size - 1 - x, y) || finder(x, size - 1 - y);
        let on;
        if (corner) {
          const cx = x < 7 ? x : size - 1 - x;
          const cy = y < 7 ? y : size - 1 - y;
          const ring = Math.max(Math.abs(cx - 3), Math.abs(cy - 3));
          on = ring !== 2;
        } else {
          on = (x * 7 + y * 13 + ((x * y) % 5)) % 3 === 0;
        }
        if (on) squares += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
      }
    }
    $("#qr").innerHTML = `<svg viewBox="0 0 ${size} ${size}" fill="var(--ink)">${squares}</svg>`;
  }

  /* ---------- Events ---------- */

  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;

    if (target.dataset.go) {
      state.screen = target.dataset.go === "parent" ? parentScreen() : target.dataset.go;
      resetKid();
    } else if (target.dataset.action === "browse") {
      hush(); // Bobby stops talking; the conversation is kept for the way back
      state.screen = "browse";
      track("all_places_opened");
    } else if (target.dataset.action === "browse-back") {
      state.screen = "kid";
    } else if (target.dataset.like) {
      const id = target.dataset.like;
      if (state.liked.has(id)) state.liked.delete(id);
      else {
        state.liked.add(id);
        track("offer_liked", { topic: offers.find((offer) => offer.id === id).topics[0] });
      }
    } else if (target.dataset.action === "google") {
      return startGoogleSignIn();
    } else if (target.dataset.action === "consent") {
      if (!$("#consent-check").checked) return;
      state.auth = "signedIn";
      state.screen = "parent";
      track("parent_signed_in");
    } else if (target.dataset.action === "signout") {
      $("#consent-check").checked = false;
      signOut();
    } else if (target.dataset.filter) {
      state.filter = target.dataset.filter;
    } else if (target.dataset.action === "wake" || target.id === "bobby-button") {
      if (state.phase !== "idle") return;
      wakeBobby();
      track("bobby_woken");
    } else if (target.dataset.action === "next") {
      nextSecret();
    } else if (target.dataset.action === "cool") {
      likeSecret();
    } else if (target.dataset.action === "language") {
      state.language = state.language === "de" ? "en" : "de";
    } else if (target.dataset.action === "restart") {
      resetKid();
    } else if (target.dataset.action === "share" || target.dataset.action === "invite-qr") {
      // One sheet, two uses: the child shows hearts to a parent, or the parent
      // shows the invite to the child. The parent's version is calm.
      const forParent = target.dataset.action === "invite-qr";
      const sheet = $("#share-sheet");
      sheet.classList.toggle("calm", forParent);
      $("#share-title").textContent = t(forParent ? "inviteQr.title" : "share.title");
      $("#share-text").textContent = t(forParent ? "inviteQr.text" : "share.text");
      renderQr();
      sheet.showModal();
      return;
    } else if (target.dataset.action === "close-sheet") {
      $("#share-sheet").close();
      return;
    } else if (target.dataset.action === "copy") {
      target.textContent = t("parent.copied");
      return;
    } else if (target.hasAttribute("data-register")) {
      // A real offer opens the institution's own page in a new tab.
      track("registration_opened", { provider: target.dataset.register });
      if (target.getAttribute("href") === "#") event.preventDefault();
      return;
    } else {
      return;
    }
    render();
  });

  $("#consent-check").addEventListener("change", renderAuth);

  $("#search").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderParent();
    // renderParent rebuilds the chips, not the field, so typing keeps its focus.
  });

  // Lets a link such as index.html#kid open a screen directly (used for review screenshots).
  const start = location.hash.replace("#", "").split("-");
  if (SCREENS.includes(start[0])) state.screen = start[0];
  const demoProfile = { name: "Alex Beispiel", email: "alex.beispiel@example.com" };
  if (start[0] === "parent") {
    state.auth = "signedIn";
    state.profile = demoProfile;
  }
  if (start[0] === "consent") {
    state.auth = "needsConsent";
    state.profile = demoProfile;
  }
  if (start[0] === "signin" && start[1] === "error") state.authError = true;
  if (start[1] === "hello") {
    state.phase = "hello";
    state.said = "kid.hello";
    state.micAllowed = true;
  }
  if (start[1] === "secret") {
    state.phase = "secret";
    state.micAllowed = true;
  }
  if (start[1] === "end") {
    state.phase = "end";
    state.said = "kid.endLiked";
  }

  /** Review links such as #parent-liked need some hearts; they are set per catalogue. */
  function applyDemo() {
    const like = (...indexes) => indexes.forEach((index) => offers[index] && state.liked.add(offers[index].id));
    if (start[1] === "secret" && secrets[0]) {
      state.said = "kid.pitch";
      state.saidAbout = secrets[0];
    }
    if (start[1] === "end") like(0);
    if (start[0] === "parent" && start[1] === "liked") like(0, 2);
  }

  useCatalogue(SAMPLE_OFFERS, { real: false, generatedAt: null });
  render();
  loadCatalogue();
})();
