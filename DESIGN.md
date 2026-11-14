# Bobby design foundation

* **Author:** ikodo0
* **Date:** 2026-11-13
* **Status:** first version, not reviewed

Bobby is the name of the project and of its mascot, a pixel-art duck. This
file is the single source for how Bobby looks and behaves. Build every
screen from the tokens and components listed here. If a screen needs something
this file does not cover, add it here first, then build it.

The values live in [`prototype/tokens.css`](prototype/tokens.css). A working
example of every component is in [`prototype/index.html`](prototype/index.html).

## 1. The one rule

**The world is pixel art. The interface is cloudy glass.**

| Layer | Style | What belongs to it |
|---|---|---|
| World | Pixel art, hard edges, no smoothing | The riverside city scene, Bobby the duck, topic pictures, icons, the cursor trail |
| Interface | Frosted glass, smooth type | Speech bubble, cards, buttons, sheets, forms, navigation |

The interface borrows three small things from the world so the two layers feel
related: stepped corners, a hard bottom edge on anything pressable, and pixel
icons. Nothing else crosses over. Glass never gets a pixel font for body text,
and the world never gets blur or rounded corners.

## 2. Decisions

These were chosen by the author on 2026-11-13.

| # | Question | Decision |
|---|---|---|
| 1 | Layer rule | Pixel world, glass interface |
| 2 | Glass density | Cloudy, about 82% opaque, so text is readable over any part of the scene |
| 3 | Grain | On glass panels only |
| 4 | Pixel in components | Pixel icons, stepped corners, hard bottom edge |
| 5 | Fonts | Pixel font for short headings, rounded sans for everything else |
| 6 | Palette | Taken from the scene and the duck; beak orange is the action colour |
| 7 | Main button | Pressable, with a hard bottom edge that shrinks when pressed |
| 8 | Parent area | Same colours and type sizes, but calm: rounded corners, thin lines, no pixel font, no pixel pictures, no scene. Behind Google sign-in. |
| 9 | Layout | Everything on a child screen gathers around Bobby at the bottom. On a phone it stacks; on a computer the event Bobby shows stands beside him. |
| 10 | Scene on phones | A separate portrait version (not drawn yet, see section 11) |
| 11 | Duck position | Centred, standing on the grass, with the one button directly under it |
| 12 | Duck speech | Bobby speaks first. The bubble is his subtitles. |
| 13 | Entry | Two large cards: "I'm a kid" and "I'm a grown-up" |
| 14 | Cursor trail | Child screens only |
| 15 | Token format | CSS variables |
| 16 | Languages | German and English |

One refinement made while building: the parent catalogue may widen to a grid of
up to three columns on a computer. A list of events in a 420 px column wastes a
laptop screen, and parents are the ones who use laptops.

## 3. Colour

All colours come from the two reference images, so the interface never fights
the scene.

| Token | Value | Source | Use |
|---|---|---|---|
| `--ink` | `#201010` | Duck outline | Text, icons, outlines |
| `--ink-muted` | `#5b4a44` | Outline, lightened | Secondary text |
| `--action` | `#f08000` | Beak | Main button, the one thing to tap next |
| `--action-edge` | `#b05800` | Beak, darkened | Bottom edge of the main button |
| `--bobby` | `#208040` | Duck head | Confirmation, selected state, links |
| `--bobby-edge` | `#105040` | Duck head shadow | Bottom edge of green buttons |
| `--like` | `#e84f7a` | Tulips in the scene | Heart only |
| `--sky` | `#3eadfd` | Sky | Picture backgrounds, info |
| `--water` | `#39acdc` | River | Picture backgrounds |
| `--grass` | `#6eaa38` | Grass | Picture backgrounds |
| `--cream` | `#f0e0b0` | Duck chest | Picture backgrounds, tags, quiet buttons |
| `--cream-edge` | `#d4c088` | Cream, darkened | Bottom edge of quiet buttons |
| `--surface` | `#f7f2e6` | Cream, lightened | Parent area background |
| `--surface-raised` | `#fffdf8` | | Parent cards |
| `--line` | `#e2d8c4` | | Dividers, input borders |
| `--glass` | `rgb(255 253 248 / 0.82)` | | Glass panels |
| `--glass-edge` | `rgb(32 16 16 / 0.14)` | | Bottom edge of glass |
| `--glass-line` | `rgb(255 255 255 / 0.9)` | | Top highlight of glass |
| `--scrim` | `rgb(32 16 16 / 0.5)` | | Behind sheets |

Rules:

* Text on orange is always `--ink`. White on this orange is too faint to read.
* Text on green and on ink is white.
* `--action` appears once per screen. A second orange button means the screen
  is asking for two things at once.
* `--like` is reserved for the heart. Do not use it for errors or decoration.
* Body text sits on glass, on `--surface` or on `--surface-raised`. Never place
  text directly on the scene.

## 4. Type

| Token | Font | Use |
|---|---|---|
| `--font-display` | Pixelify Sans 600–700 | Screen titles, the Bobby wordmark, numbers. Six words at most. |
| `--font-body` | Lexend 400–600 | Everything else |

| Token | Size / line height | Use |
|---|---|---|
| `--text-title` | 30 / 1.1 | One per screen |
| `--text-heading` | 22 / 1.2 | Card and section headings |
| `--text-speech` | 19 / 1.4 | What Bobby says |
| `--text-body` | 17 / 1.5 | Default |
| `--text-small` | 14 / 1.4 | Tags, captions. Nothing smaller than this. |

Rules:

* Children's screens use short words and short sentences. One idea per bubble.
* No text in capitals, no italics, no justified text. Left aligned, except in
  the speech bubble and on the entry screen.
* Every picture choice has a label of one or two words, and Bobby says it
  aloud. A child who cannot read still gets every option.
* Both fonts must be served from the project's own files before launch. The
  prototype loads them from Google Fonts for speed.

## 5. Space, size and shape

| Token | Value | Use |
|---|---|---|
| `--px` | 4px | One "pixel" of the interface. Corners, edges and icon grids are multiples of it. |
| `--space-1 … --space-8` | 4, 8, 12, 16, 24, 32, 48, 64 | All gaps and padding |
| `--tap` | 48px | Smallest touch target on parent screens |
| `--tap-kid` | 64px | Smallest touch target on child screens |
| `--column` | 420px | Width of child screens |
| `--wide` | 1040px | Largest width of the parent area |
| `--corner` | stepped, 2 × `--px` | Every glass panel and button |
| `--corner-small` | stepped, 1 × `--px` | Tags, chips, small controls |
| `--radius`, `--radius-small` | 14px, 8px | Parent screens only |

Corners are stepped, never round. A stepped corner is cut with `clip-path`, so
two side effects apply to every component:

* Anything drawn outside the box is cut off. Shadows and focus rings must be
  drawn inside it (`inset`).
* A tail or badge that sticks out must be a separate element next to the box.

## 6. Glass

One recipe, used for every panel that sits on the scene:

1. Fill `--glass`.
2. Blur what is behind by `--glass-blur` (18px) and raise saturation slightly.
3. A 2px white line on the top inside edge (`--glass-line`).
4. A hard edge of `--px` on the bottom inside (`--glass-edge`).
5. A layer of fine grain at 10% strength.
6. Stepped corners.

Rules:

* Keep glass small. Blur over a moving scene is redrawn every frame, and a
  cheap tablet will stutter if half the screen is glass.
* Never stack glass on glass. Inside a glass panel use `--surface-raised`.
* In the parent area there is no scene, so panels use `--surface-raised` with
  a `--line` border and the same stepped corners. No blur.
* If the browser cannot blur, the panel becomes 96% opaque.

## 7. Pressable things

Anything that reacts to a tap has a hard bottom edge. This is the only depth
effect in the system; there are no soft shadows.

| State | Appearance |
|---|---|
| Rest | Bottom edge `--edge` (6px) |
| Hover (mouse) | Moves up 1px |
| Pressed | Moves down 4px, edge shrinks to 2px |
| Selected | Green fill or green inset line, plus a tick. Never colour alone. |
| Focus (keyboard) | 4px ink line with a 2px white line inside it, both inset |
| Disabled | 50% opacity, no edge |

## 8. Motion

| Token | Value | Use |
|---|---|---|
| `--time-fast` | 120ms | Press, hover |
| `--time-base` | 220ms | Panels appearing, screen changes |
| `--time-slow` | 400ms | Sheets |
| `--ease-out` | `cubic-bezier(.2,.8,.2,1)` | Glass and type |
| `--ease-pixel` | `steps(4, end)` | Pixel elements, so they move in jumps like the art |

Rules:

* Animate position, scale and opacity only.
* The world moves on its own slow loops: clouds 18s, grass 3.2s,
  Bobby's bob 2.8s, all stepped. Interface motion and world motion are
  separate: the interface never moves the world, and the world does not react
  to the pointer.
* Nothing loops for attention, with one exception: the "Psst!" badge bobs slowly
  until Bobby is tapped. No rewards for coming back daily, no streaks.
* With "reduce motion" switched on, everything appears instantly and the
  cursor trail is off.

## 9. Layout

**Child screens.** The scene fills the screen. The top bar holds the wordmark,
the language switch and "again". Everything else gathers around Bobby at the
bottom of the screen, so the sky stays empty and the eye goes to the duck:

1. The speech bubble, directly above Bobby, with its tail pointing at him.
2. Bobby, centred, standing on the grass.
3. The buttons, directly under Bobby.
4. The event Bobby is showing. On a phone it sits above the bubble. From
   900px it stands to the right of Bobby, level with his feet, as if he were
   presenting it.

Bobby never moves. He is `--bobby-height` tall (24% of the screen height,
200px at most): a duck on the near bank, clearly smaller than the buildings
on the far one.

**Parent screens.** `--surface` background, no scene, no cursor trail. One
column on a phone; the catalogue becomes two columns from 640px and three from
960px, up to `--wide`.

Parents are adults doing a chore, so their screens drop the game look. They
keep the palette, the type sizes and the spacing, and change the rest:

| | Child screens | Parent screens |
|---|---|---|
| Corners | Stepped | Rounded: `--radius` for panels, `--radius-small` for controls |
| Edges | Hard bottom edge on anything pressable | A thin `--line` border; buttons are flat |
| Press feedback | The button sinks | The button darkens |
| Titles | Pixel font | Body font, weight 600 |
| Pictures | Pixel pictures | None; a text tag names the topic |
| Focus ring | Inside the box | Outside the box, 3px ink |

The parent area is built around what the parent came to do:

* **What the child chose comes first**, with one sentence naming the child's
  interests. These cards have a green border, the line "Chosen by your
  child" and the green registration button.
* **The invite lives in a side column** that stays in view on a computer and
  comes first on a phone: the link, "Copy link", "Show QR code", and one
  line of status (not opened yet, or the child has talked to Bobby).
* **A short note says what the parent sees**: only hearts, nothing the child
  said.
* **Every card lists the same four facts in labelled rows**: when, where,
  age, price. A parent comparing offers should never have to read a sentence.
* **The catalogue shows how many offers match** the search and filters.

**Parent sign-in.** The parent area is never shown without signing in. Choosing
"I'm a grown-up" leads through three screens:

1. **Sign in.** What the parent gets, in three lines, and the Google button.
   The button follows Google's rules: white, grey line, Google's logo, the
   words "Sign in with Google". While Google is open it reads "Continuing to
   Google…" and cannot be pressed twice. A cancelled sign-in shows one line
   of red text above the button.
2. **Consent.** Shown once after the first sign-in. It names the account,
   says what is stored and what is not, and has one checkbox: "I am the
   parent or guardian and I agree." The button stays disabled until it is
   ticked. "Cancel" signs the parent out again.
3. **Parent area.** The account and "Sign out" sit in the top bar.

A parent who is already signed in skips straight to step 3.

**Scene.** It always covers the screen and is pinned to the bottom edge. The
grass must reach at least 45% of Bobby's height above Bobby's feet, so the
legs and belly are in front of grass and never of water. The prototype scales
the placeholder image to guarantee this. The final scene should be drawn with
grass in its lower 30% so no scaling is needed.

## 10. Components

Each one exists in the prototype under the class shown.

| Component | Class | Notes |
|---|---|---|
| Scene | `.scene` | Fixed, behind everything, pixel scaling |
| Top bar | `.topbar` | Wordmark left, controls right |
| Wordmark | `.wordmark` | "Bobby" in the pixel font on a small glass plate |
| Glass panel | `.glass` | The recipe from section 6 |
| Speech bubble | `.bubble` | Glass panel with a stepped tail pointing at Bobby. Holds the "AI helper" tag and the spoken text. |
| AI tag | `.tag--ai` | Always visible while Bobby speaks. Bobby also says it in the first sentence. |
| Bobby | `.bobby` | The duck image. Pixel scaling. Never cropped, never recoloured. |
| Secret card | `.secret` | The one event Bobby is showing: topic picture, title, age and place. A small heart appears on it once liked. |
| All places | `.browse` | Child list of every offer: glass cards with pixel picture, title, age, place and a heart button |
| Heart | `.heart` | Toggle on the "all places" cards. Empty outline, or filled `--like` with a frame. |
| Reaction buttons | `.controls` | "What else?" (cream, arrow) and "Cool!" (orange, heart). Never more than two. |
| Main button | `.button` | Orange, one per screen |
| Quiet button | `.button--quiet` | Cream, for everything else |
| Green button | `.button--bobby` | Confirming actions in the parent area |
| Icon button | `.icon-button` | Square, `--tap` or larger, always has a spoken label |
| Status line | `.ear` | "I'm talking" or "I'm listening", above the buttons |
| Psst badge | `.sleep-badge` | Small glass plate above Bobby before the first tap: speaker picture and "Psst!" |
| Event card, parent | `.event--parent` | Adds institution, date, place, age, price and a registration button |
| Tag | `.tag` | Topic, age, institution. Not tappable. |
| Chip | `.chip` | Tappable filter. Selected is green with a tick. |
| Search field | `.field` | Label above, never placeholder-only |
| Sheet | `.sheet` | Opens over a scrim. Used for "show my grown-up" and for the privacy note. |
| QR block | `.qr` | Square code on white with a quiet margin |
| Role card | `.role` | Entry screen. Picture block on top, button below. |
| Google button | `.google` | Google's own sign-in button. Do not restyle it. |
| Consent box | `.check` | One checkbox with its sentence, in a bordered box so the whole line is tappable |
| Account | `.account` | Round initial and e-mail address; the address is hidden on a phone |
| Notice | `.notice` | One line of plain text for empty, loading and error states |
| Cursor trail | `.cursor-trail` | Child screens, mouse only. White squares at 80% opacity with grain, like chips of frosted glass. The system cursor is hidden while it runs; the newest trail square stays lit under a resting pointer. Values in `cursor-trail/cursor-trail.css`. |

**Conversation.** Bobby leads. A child who was told to open the app does not
know what to ask for, so Bobby never opens with a question about the child's
interests and never shows a menu of topics. He offers something, and the
child reacts.

| Phase | What happens | Under Bobby |
|---|---|---|
| Idle | Only Bobby, a "Psst!" badge and one button. Nothing is said: a browser plays no sound before the first tap. | Orange button with speaker and microphone pictures: "What does Bobby know?" |
| Hello | Bobby introduces himself, says he is a computer duck and not a person, and promises a secret place in Heilbronn. | "Show me!" |
| Secret | Bobby shows one event and pitches it in one or two short lines. | "What else?" and "Cool!" (with a heart) |
| End | Bobby wraps up. | "Again", and "Show my grown-up" if anything got a heart |

Rules:

* With Bobby, one event at a time. Never a list, never a carousel.
* A child who wants to look around alone can: "All places" in the top bar
  opens every offer as a plain list of cards with hearts. It is a side door.
  Bobby stays the main way in, and the conversation is kept for the way back.
* At most two buttons, and they are reactions ("cool", "what else"), not
  categories.
* "Cool!" is the heart. It saves the event for the parent, and Bobby says so
  the first time.
* A status line above the buttons shows "I'm talking" or "I'm listening".
* The first tap switches sound on and asks for the microphone. Tapping Bobby
  does the same as tapping the button.
* If the microphone is refused or missing, Bobby says "I can't hear you right
  now. Just tap." and the same buttons carry the conversation. Nothing else
  changes.

**Text.** The bubble is Bobby's subtitles: it shows only what Bobby is saying
aloud. Nothing on a child screen has to be read in order to continue.

**Icons.** Drawn on a 12 × 12 grid with a dark outline, in the palette of
section 3, and scaled by whole numbers only. Never mix them with a smooth icon
set on child screens. The parent area may use plain line icons for utility
actions such as copy and search.

## 11. Assets and data

The scene art, the duck sprites and the offer catalogue come from the team's
app on the `primary-source` branch and live in `prototype/public/`.

| Asset | File | State |
|---|---|---|
| Scene background | `assets/heilbronn-pixel-background.png`, 1672 × 941 | In use. Landscape only. |
| Clouds | `assets/heilbronn-pixel-clouds.png` | In use, drifts sideways |
| Foreground grass | `assets/heilbronn-pixel-grass.png` | In use, sways |
| Water | None | Still. The moving light stripes were removed; a drawn water layer is still needed. |
| Bobby | `assets/kiko-mallard.png`, `-blink.png`, `-speaking.png`, 1254 × 1254 each | In use: standing, a blink every six seconds, beak open while talking |
| Scene, portrait | Does not exist | A tall version for phones, same palette |
| Bobby asleep, listening | Do not exist | Two more sprites |
| Topic pictures | 12 × 12 placeholders drawn in code | Final pixel pictures, one per topic |

The sprite files are still named "kiko"; the duck is called Bobby everywhere
a person can see.

**Offers.** `public/data/offers.json` is written by the importer in
`prototype/ingestion/` (`npm run import:offers`), which reads the sources
listed in `prototype/config/offer-sources.json`. The page only reads the
file. It drops dates that are over, sorts by the next date, and shows:

* to the child: a shortened title (no age in brackets, no subtitle), the age
  and who runs it;
* to the parent: the full title, every topic, the next date and how many more
  there are, the place, the age, the price, "fully booked" or "waiting list"
  when known, and a button that opens the institution's own page.

Bobby reveals one offer per topic, skipping offers that are full or outside
the assumed age of 6 to 12. His line is built from the offer: its short title,
what the topic is about, and who runs it. He does not describe what happens
there, because the page cannot know that from a topic alone. In the product, a
language model should write this line from the offer's description.

If the file cannot be loaded, five invented offers are shown and the parent
area says so.

Rules for all pixel art:

* One pixel of the duck must be the same size on screen as one pixel of the
  scene.
* Scale by whole numbers where possible and always with pixel scaling switched
  on (`image-rendering: pixelated`).
* No JPEG. Compression smears the edges.
* Every image has a text alternative, except the scene, which is decoration.

### A living scene: what is still missing

Two layers move today (clouds and foreground grass). The full
list below is what a finished scene needs. The scene must look alive: clouds drift, water shimmers, grass and leaves
sway. One flat picture cannot do that. The scene has to arrive as separate
layers, each with its own loop, all drawn on the same pixel grid.

| Layer (back to front) | Motion | What to deliver |
|---|---|---|
| Sky | None | One PNG |
| Clouds, far and near | Drift sideways, far ones slower | Two PNGs that tile left to right without a seam |
| Hills and city | None | One PNG with transparent sky |
| Water | Shimmer, reflections wobble | Sprite sheet, 4 to 8 frames, or one tile that can slide sideways |
| Far bank and bridge | None | One PNG, transparent around it |
| Grass, back | Sways | Sprite sheet, 4 to 6 frames |
| Bobby | Idle, blink, talk, listen, sleep | One sprite sheet per state, 2 to 8 frames each, transparent |
| Grass and flowers, front | Sways, a little out of step with the back grass | Sprite sheet, 4 to 6 frames |
| Tree branch | Leaves sway | Sprite sheet, 4 frames |

Requirements for every layer:

* Drawn at a small native size (for example 480 by 270 for the landscape and
  270 by 480 for the portrait version) and enlarged by the browser. All layers
  share that size, so they line up without measuring.
* PNG with transparency. Sprite sheets are one row of equal frames.
* Loops must end where they begin. 6 to 10 frames per second is enough; pixel
  art looks wrong when it moves smoothly.
* Bobby's pixels are the same size as the scene's pixels.
* One still frame of everything, for people who switch motion off.

How it will be built, so the art fits: each layer is one element. Sprite
sheets are played by stepping the picture sideways one frame at a time, and
clouds slide by moving the element. Both are cheap for a phone, because the
browser only moves pictures and redraws nothing. A single video of the whole
scene is the alternative: one file and no assembly, but Bobby cannot be
separate from it, it cannot adapt to tall screens, and autoplay on phones is
less reliable.

## 12. Accessibility and children

* Text contrast is at least 4.5 to 1. The glass density was chosen for this.
* Everything works with a keyboard and shows where the focus is.
* Touch targets are `--tap-kid` on child screens, with `--space-2` between them.
* No meaning is carried by colour alone.
* The interface language is set on the page so screen readers and the speech
  voice pronounce it correctly.
* A child is never asked to type, sign in or give a name.
* The first thing Bobby says includes that it is a computer helper, not a
  person.
* Before the first heart, Bobby says who will see it: "Your grown-up only sees
  what you give a heart."

## 13. Who Bobby is, and how he talks

Bobby is a mallard from the Neckar who knows things. He looks like an
ordinary duck: no sunglasses, no costume. The cool is in how he talks. He
is cool, a little mysterious, and on the child's side. He has been everywhere
in Heilbronn and lets the child in on places most people do not know about.
The child should feel that Bobby knows something they do not, and want to
find out what.

| | Bobby, on child screens | Parent screens |
|---|---|---|
| Who speaks | Bobby, in the first person | The product, plainly |
| Address | "du" in German | "Sie" in German |
| Sentence length | Three to eight words | Normal |
| Tone | Dry, confident, playful. Short sentences. A joke now and then. | Clear and factual |

How Bobby talks:

* He starts. He never waits for the child to say what they want.
* He reveals, he does not sell. "Here you build a robot. It does what you
  say. Mostly." Not "Sign up for our robotics workshop!"
* He makes a concrete offer and asks for a reaction: "Cool or nah?"
* He takes "nah" well and moves on. No sulking, no second attempt.
* He says once, at the start, that he is a computer duck and not a person.
* He says who sees a heart: only the parent.

What Bobby never does:

* Praise the child for using the app, or ask them to come back.
* Pretend to be a friend who will miss them.
* Push after a "no", or make an offer sound scarce or urgent.
* Use slang that will be stale in a year. Cool comes from being brief and
  sure, not from the words.

The mystery is a hook to start the conversation. It must not turn into
pressure: Bobby is talking to children, and a child who says no three times
gets "Fair. I'll find something better", not a fourth pitch.

## 14. Not decided, not covered

* The front-end framework. Tokens are plain CSS variables and work in any.
* Native pixel size of the final scene and duck.
* Night version of the scene.
* The institution insight view (charts). It will follow the parent area rules.
* Sound design: tap sounds, Bobby's voice.

## 15. References studied

| Reference | What was taken |
|---|---|
| meet-olo.vercel.app | Phone-width column on every device, mascot in the centre of attention, one main button at the bottom, pressable button edge, glass cards |
| vs-goods.store | Pixel cursor trail, heavy blur behind navigation, pixel transitions |
| Toca Boca entry screen | Two large role cards with a picture and a button each |

Worth reading before extending this file:

* Apple's guidance on materials, for keeping text readable on blur.
* Duolingo's design guidelines, for mascot states and feedback aimed at
  children.
* NES.css and RetroUI, for more ways to draw pixel borders in CSS.
* shadcn/ui with Radix, for accessible component behaviour if the app is built
  in React.
* LiveKit Agents UI, for ready-made voice states.
* The NN/g article on children's websites and the UK Age Appropriate Design
  Code, both named in the challenge README.
* WCAG 2.2, for contrast and target size.
