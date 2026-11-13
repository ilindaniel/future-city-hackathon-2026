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
      "kid.restart": "Nochmal",
      "kid.share": "Meinen Eltern zeigen",
      "kid.wake": "Bobby wecken",
      "kid.asleep": "Bobby schläft. Tippe, um Ton und Mikrofon einzuschalten.",
      "kid.hello": "Hallo! Ich bin Bobby. Ich bin ein Computer-Helfer, kein Mensch. Was machst du gern?",
      "kid.noMic": "Ich kann dich nicht hören. Tippe auf ein Bild. Was magst du?",
      "kid.q2": "Schön! Mit wem möchtest du das machen?",
      "kid.found": "Schau mal, was ich gefunden habe! Gib ein Herz, wenn dir etwas gefällt.",
      "kid.liked": "Gute Wahl! Deine Eltern sehen nur, was ein Herz hat.",
      "mic.idle": "Tippen und sprechen",
      "mic.listening": "Ich höre zu. Tippe, wenn du fertig bist",
      "mic.thinking": "Ich überlege",
      "mic.speaking": "Ich spreche",
      "choice.game": "Spiele",
      "choice.robot": "Roboter",
      "choice.code": "Coden",
      "choice.build": "Bauen",
      "choice.alone": "Allein",
      "choice.friends": "Freunde",
      "choice.house": "Familie",
      "choice.unsure": "Weiß nicht",
      "share.title": "Zeig das deinen Eltern",
      "share.text": "Deine Eltern sehen nur, was ein Herz hat. Was du sagst, merke ich mir nicht.",
      "share.close": "Fertig",
      "parent.back": "Zurück",
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
      "parent.sample": "Beispieldaten. Die Angebote in diesem Prototyp sind erfunden.",
      "filter.all": "Alle",
      "topic.game": "Gaming",
      "topic.robot": "KI",
      "topic.code": "Coding",
      "topic.build": "Bauen",
      "label.age": "Jahre",
      "label.free": "kostenlos",
      "like.add": "Herz geben",
      "like.remove": "Herz entfernen",
      language: "EN",
      languageLabel: "Switch to English",
    },
    en: {
      "entry.title": "Who are you?",
      "entry.kid": "I'm a kid",
      "entry.adult": "I'm a grown-up",
      "kid.aiTag": "AI helper",
      "kid.restart": "Again",
      "kid.share": "Show my grown-up",
      "kid.wake": "Wake Bobby",
      "kid.asleep": "Bobby is asleep. Tap to turn on sound and microphone.",
      "kid.hello": "Hi! I'm Bobby. I'm a computer helper, not a person. What do you like doing?",
      "kid.noMic": "I can't hear you. Tap a picture. What do you like?",
      "kid.q2": "Nice! Who do you want to do it with?",
      "kid.found": "Look what I found! Give a heart to the ones you like.",
      "kid.liked": "Good pick! Your grown-up only sees what has a heart.",
      "mic.idle": "Tap and talk",
      "mic.listening": "I'm listening. Tap when you're done",
      "mic.thinking": "Let me think",
      "mic.speaking": "I'm talking",
      "choice.game": "Games",
      "choice.robot": "Robots",
      "choice.code": "Coding",
      "choice.build": "Building",
      "choice.alone": "Alone",
      "choice.friends": "Friends",
      "choice.house": "Family",
      "choice.unsure": "Not sure",
      "share.title": "Show this to your grown-up",
      "share.text": "Your grown-up only sees what has a heart. I don't keep what you say.",
      "share.close": "Done",
      "parent.back": "Back",
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
      "parent.sample": "Sample data. The offers in this prototype are invented.",
      "filter.all": "All",
      "topic.game": "Gaming",
      "topic.robot": "AI",
      "topic.code": "Coding",
      "topic.build": "Making",
      "label.age": "years",
      "label.free": "free",
      "like.add": "Give a heart",
      "like.remove": "Take the heart back",
      language: "DE",
      languageLabel: "Auf Deutsch wechseln",
    },
  };

  /* ---------- Sample events (invented; the real ones come from the aggregator) ---------- */

  const EVENTS = [
    { id: 1, topic: "game", colour: "var(--sky)", age: "8–12", place: "aim", when: { de: "Samstag, 10 Uhr", en: "Saturday, 10 am" }, title: { de: "Baue dein eigenes Spiel", en: "Build your own game" } },
    { id: 2, topic: "robot", colour: "var(--cream)", age: "6–10", place: "experimenta", when: { de: "Sonntag, 14 Uhr", en: "Sunday, 2 pm" }, title: { de: "Roboter-Werkstatt", en: "Robot workshop" } },
    { id: 3, topic: "code", colour: "var(--grass)", age: "8–12", place: "Haus der Familie", when: { de: "Mittwoch, 16 Uhr", en: "Wednesday, 4 pm" }, title: { de: "Erste Schritte mit Scratch", en: "First steps with Scratch" } },
    { id: 4, topic: "robot", colour: "var(--water)", age: "10–14", place: "IPAI", when: { de: "Freitag, 15 Uhr", en: "Friday, 3 pm" }, title: { de: "KI zum Ausprobieren", en: "Try out AI" } },
    { id: 5, topic: "build", colour: "var(--cream)", age: "6–10", place: "experimenta", when: { de: "Samstag, 13 Uhr", en: "Saturday, 1 pm" }, title: { de: "Tüfteln und Löten", en: "Tinker and solder" } },
    { id: 6, topic: "code", colour: "var(--sky)", age: "6–12", place: "Haus der Familie", when: { de: "Sonntag, 11 Uhr", en: "Sunday, 11 am" }, title: { de: "Coding-Nachmittag für Familien", en: "Family coding afternoon" } },
  ];

  const QUESTIONS = [
    { text: "kid.noMic", choices: ["game", "robot", "code", "build"] },
    { text: "kid.q2", choices: ["alone", "friends", "house", "unsure"] },
  ];


  /* ---------- State ---------- */

  const state = {
    language: "de",
    screen: "entry",
    // Where the conversation with Bobby is:
    // asleep -> speaking -> listening -> thinking -> results
    phase: "asleep",
    said: null, // text key of the last thing Bobby said; shown in the bubble
    micBlocked: false, // no microphone: picture choices carry the conversation
    step: 0, // index into QUESTIONS, used only when micBlocked
    topic: null, // what the child likes; picked by picture or (in the real app) heard
    liked: new Set(),
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

  function eventsForChild() {
    const matching = EVENTS.filter((event) => event.topic === state.topic);
    const others = EVENTS.filter((event) => event.topic !== state.topic);
    return [...matching, ...others].slice(0, 4);
  }

  function heartButton(event) {
    const liked = state.liked.has(event.id);
    return `<button class="heart" type="button" data-like="${event.id}" aria-pressed="${liked}"
      aria-label="${t(liked ? "like.remove" : "like.add")}: ${event.title[state.language]}">
      ${iconSvg(liked ? "heart" : "heartEmpty")}</button>`;
  }

  function childCard(event) {
    return `<article class="event glass">
      <div class="event__picture" style="background:${event.colour}">${iconSvg(event.topic)}</div>
      <div>
        <h3 class="event__title">${event.title[state.language]}</h3>
        <div class="event__tags">
          <span class="tag">${event.age} ${t("label.age")}</span>
          <span class="tag">${event.place}</span>
        </div>
      </div>
      ${heartButton(event)}
    </article>`;
  }

  function parentCard(event) {
    return `<article class="event event--parent panel">
      <div class="event__picture" style="background:${event.colour}">${iconSvg(event.topic)}</div>
      <div>
        <h3 class="event__title">${event.title[state.language]}</h3>
        <div class="event__tags">
          <span class="tag">${t("topic." + event.topic)}</span>
          <span class="tag">${event.age} ${t("label.age")}</span>
        </div>
      </div>
      <div class="event__facts">
        <span>${event.place} · ${event.when[state.language]} · ${t("label.free")}</span>
      </div>
      <a class="button button--quiet button--small" href="#" data-register>${t("parent.register")}</a>
    </article>`;
  }

  function renderKid() {
    const asleep = state.phase === "asleep";
    const results = state.phase === "results";

    // The bubble is Bobby's subtitles. Bobby says nothing while asleep.
    $("#bubble").hidden = asleep;
    $("#sleep-badge").hidden = !asleep;
    $("#bubble-text").textContent = state.said ? t(state.said) : "";
    $("#bobby-button").setAttribute("aria-label", asleep ? t("kid.asleep") : "Bobby");

    // Picture choices appear only when Bobby cannot hear the child.
    const showChoices = state.micBlocked && !asleep && !results;
    $("#choices").hidden = !showChoices;
    if (showChoices) {
      $("#choices").innerHTML = QUESTIONS[state.step].choices
        .map(
          (choice) => `<button class="choice glass" type="button" data-choice="${choice}">
            ${iconSvg(choice)}<span>${t("choice." + choice)}</span></button>`
        )
        .join("");
    }

    $("#results").hidden = !results;
    if (results) $("#kid-events").innerHTML = eventsForChild().map(childCard).join("");

    // One button under Bobby. What it shows depends on the phase.
    const mic = $("#mic");
    mic.hidden = showChoices;
    const look = { asleep: "idle", speaking: "speaking", listening: "listening", thinking: "thinking", results: "idle" };
    mic.dataset.state = look[state.phase];
    $("#mic-icons").innerHTML = asleep
      ? iconSvg("speaker", "small") + iconSvg("mic", "small")
      : iconSvg(state.phase === "speaking" ? "speaker" : "mic", "small");
    const label = { asleep: "kid.wake", speaking: "mic.speaking", listening: "mic.listening", thinking: "mic.thinking", results: "mic.idle" };
    $("#mic-label").textContent = t(label[state.phase]);
  }

  /* ---------- Bobby's voice and ears ---------- */

  let speechTimer = null;

  /**
   * Bobby says a line: it appears in the bubble and is read aloud by the
   * browser's built-in voice. `then` runs once when the line is finished.
   * Browsers only allow sound after a tap, which is why Bobby starts asleep.
   */
  function say(key, then) {
    state.said = key;
    hush();
    const text = t(key);
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(speechTimer);
      if (then) then();
    };
    if ("speechSynthesis" in window) {
      const line = new SpeechSynthesisUtterance(text);
      line.lang = state.language === "de" ? "de-DE" : "en-US";
      line.pitch = 1.3;
      line.onend = done;
      window.speechSynthesis.speak(line);
    }
    // Safety net: some browsers never report the end, or have no voice at all.
    speechTimer = setTimeout(done, 1500 + text.length * 80);
  }

  function hush() {
    clearTimeout(speechTimer);
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

  /** The first tap: switches sound on, asks for the microphone, Bobby greets. */
  function wakeBobby() {
    state.phase = "speaking";
    const microphone = askForMicrophone();
    say("kid.hello", () => {
      microphone.then((allowed) => {
        if (state.screen !== "kid" || state.phase !== "speaking") return;
        if (allowed) {
          state.phase = "listening";
          render();
        } else {
          state.micBlocked = true;
          say("kid.noMic", () => {});
          render();
        }
      });
    });
  }

  function showResults() {
    state.phase = "results";
    say("kid.found", () => {});
    render();
  }

  function resetKid() {
    hush();
    state.phase = "asleep";
    state.said = null;
    state.micBlocked = false;
    state.step = 0;
    state.topic = null;
  }

  function renderParent() {
    const liked = EVENTS.filter((event) => state.liked.has(event.id));
    $("#liked").innerHTML = liked.length
      ? liked.map(parentCard).join("")
      : `<p class="notice panel">${t("parent.noLikes")}</p>`;

    const topics = [...new Set(liked.map((event) => t("topic." + event.topic)))];
    const theme = $("#theme");
    theme.hidden = topics.length === 0;
    theme.textContent = `${t("parent.theme")}: ${topics.join(", ")}`;

    const filters = ["all", ...new Set(EVENTS.map((event) => event.topic))];
    $("#filters").innerHTML = filters
      .map(
        (filter) => `<button class="chip" type="button" data-filter="${filter}"
          aria-pressed="${state.filter === filter}">${t(filter === "all" ? "filter.all" : "topic." + filter)}</button>`
      )
      .join("");

    const query = state.query.trim().toLowerCase();
    const shown = EVENTS.filter((event) => {
      const inTopic = state.filter === "all" || event.topic === state.filter;
      const haystack = `${event.title[state.language]} ${event.place} ${t("topic." + event.topic)}`.toLowerCase();
      return inTopic && haystack.includes(query);
    });
    $("#catalogue").innerHTML = shown.length
      ? shown.map(parentCard).join("")
      : `<p class="notice panel">${t("parent.noResults")}</p>`;
  }

  function render() {
    renderStaticText();
    renderIcons();
    ["entry", "kid", "parent"].forEach((name) => {
      $("#screen-" + name).hidden = state.screen !== name;
    });
    // The parent area is calm: no scene and no cursor trail (DESIGN.md, section 9).
    document.body.dataset.world = state.screen === "parent" ? "calm" : "pixel";
    if (state.screen === "kid") renderKid();
    if (state.screen === "parent") renderParent();
    updateCursorTrail();
    placeScene();
  }

  /* ---------- Keep Bobby's feet on the grass ---------- */

  // Share of the scene image, measured from its bottom edge, that is grass
  // at the point where Bobby stands. Measured on the placeholder image.
  const GRASS_SHARE = 0.24;
  // The grass must start this far above Bobby's feet, as a share of Bobby's
  // height, so the legs and belly are in front of grass and not of water.
  const GRASS_OVERLAP = 0.45;

  /**
   * The scene is pinned to the bottom of the screen. This scales it so the
   * grass reaches above Bobby's feet, however much room the controls under
   * Bobby take. On other screens the size from tokens.css applies.
   */
  function placeScene() {
    const scene = $(".scene");
    if (state.screen !== "kid") {
      scene.style.backgroundSize = "";
      return;
    }
    const feet = $(".stage").getBoundingClientRect().bottom;
    const bobbyHeight = $(".bobby").getBoundingClientRect().height;
    const grassNeeded = window.innerHeight - feet + bobbyHeight * GRASS_OVERLAP;
    const coverHeight = Math.max(window.innerHeight, (window.innerWidth * 9) / 16);
    const height = Math.max(grassNeeded / GRASS_SHARE, coverHeight);
    scene.style.backgroundSize = `auto ${Math.ceil(height)}px`;
  }

  window.addEventListener("resize", placeScene);

  /* ---------- Cursor trail: child screens only ---------- */

  function updateCursorTrail() {
    const wanted = state.screen === "kid";
    if (wanted && !stopCursorTrail) {
      stopCursorTrail = () => {}; // placeholder while the module loads
      import("../cursor-trail/cursor-trail.js")
        .then((module) => {
          if (state.screen === "kid") stopCursorTrail = module.initCursorTrail();
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
      state.screen = target.dataset.go;
      resetKid();
    } else if (target.dataset.choice) {
      if (state.step === 0) state.topic = target.dataset.choice;
      state.step += 1;
      if (state.step >= QUESTIONS.length) return showResults();
      say(QUESTIONS[state.step].text, () => {});
    } else if (target.dataset.like) {
      const id = Number(target.dataset.like);
      if (state.liked.has(id)) state.liked.delete(id);
      else {
        state.liked.add(id);
        if (state.screen === "kid" && state.said !== "kid.liked") say("kid.liked", () => {});
      }
    } else if (target.dataset.filter) {
      state.filter = target.dataset.filter;
    } else if (target.id === "mic" || target.id === "bobby-button") {
      if (state.phase === "asleep") {
        wakeBobby();
      } else if (state.phase === "listening") {
        // The real app notices when the child stops talking. Here a tap stands in for it.
        state.phase = "thinking";
        state.topic = state.topic || "game";
        setTimeout(() => state.screen === "kid" && state.phase === "thinking" && showResults(), 1200);
      } else if (state.phase === "results" && !state.micBlocked) {
        hush();
        state.phase = "listening";
      } else {
        return;
      }
    } else if (target.dataset.action === "language") {
      state.language = state.language === "de" ? "en" : "de";
    } else if (target.dataset.action === "restart") {
      resetKid();
    } else if (target.dataset.action === "share") {
      renderQr();
      $("#share-sheet").showModal();
      return;
    } else if (target.dataset.action === "close-sheet") {
      $("#share-sheet").close();
      return;
    } else if (target.dataset.action === "copy") {
      target.textContent = t("parent.copied");
      return;
    } else if (target.hasAttribute("data-register")) {
      event.preventDefault(); // would open the institution's registration page
      return;
    } else {
      return;
    }
    render();
  });

  $("#search").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderParent();
    // renderParent rebuilds the chips, not the field, so typing keeps its focus.
  });

  // Lets a link such as index.html#kid open a screen directly (used for review screenshots).
  const start = location.hash.replace("#", "").split("-");
  if (["entry", "kid", "parent"].includes(start[0])) state.screen = start[0];
  if (start[1] === "results") {
    state.topic = "game";
    state.phase = "results";
    state.said = "kid.liked";
    state.liked.add(1);
  }
  if (start[1] === "listening") {
    state.phase = "listening";
    state.said = "kid.hello";
  }
  if (start[1] === "nomic") {
    state.phase = "speaking";
    state.said = "kid.noMic";
    state.micBlocked = true;
  }
  if (start[0] === "parent" && start[1] === "liked") {
    state.liked.add(1);
    state.liked.add(3);
  }

  render();
})();
