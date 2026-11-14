# "Hello, Heilbronners" — opening film for the Bobby pitch

* **Length:** about 45 seconds, 16:9, 1080p
* **Place in the pitch:** slide 2, directly after "Meet Bobby"
* **Job:** make the room believe Bobby is alive and a Heilbronner
* **Look:** pixel art, the same as the app
* **Tools:** the first frame of every shot is already made (folder
  `video-frames/`). Grok turns each frame into video. Any editor (CapCut,
  DaVinci Resolve) adds voice, sound and text.

## The idea

Bobby shows us his life. He greets the city, shows where he was born, his
family, his morning flight and his favourite window. Then he tells us what
bothers him, and what he has decided to do about it. The last picture is
Bobby on the grass with Heilbronn behind him: the first screen of the app.

Everything is told by Bobby himself, in the first person. Nobody explains him.

## Script

Bobby is dry, calm and a little proud of his city. About 90 words.

| # | Time | Frame | Picture | Bobby says |
|---|---|---|---|---|
| 1 | 0–6 s | `frame-1.png` | The ducks of Heilbronn on the Neckar bank. Bobby is the one looking at us. | "Hello, Heilbronners. I'm Bobby. This is my river." |
| 2 | 6–12 s | `frame-2.png` | Under the bridge. Bobby next to an old nest with eggshells. | "I was born right here. Under the bridge. Nice place. A bit loud." |
| 3 | 12–18 s | `frame-3.png` | On the water with the other ducks. People's legs walk past on the path. | "That's my family. They don't talk much. And you walk past us every day." |
| 4 | 18–26 s | `frame-4.png` | Bobby flying over the city. | "Every morning I fly my round. The glass house. The old tower. The hill with the grapes." |
| 5 | 26–33 s | `frame-5.png` | Bobby on a window ledge, looking in at children building a robot. | "This is my favourite window. In there, kids build robots. I watch every week." |
| 6 | 33–39 s | `frame-6.png` | Three children with backpacks walk past Bobby without seeing him. | "But most kids walk right past. They don't know what's in there." |
| 7 | 39–47 s | `frame-7.png` | Bobby lands on the grass, folds his wings and stands. Heilbronn behind him. Hold two seconds. | "So I've decided to tell them." Pause. "Psst. Want to know a secret?" |

## The frames

All seven were generated with ChatGPT (through Codex) from two references in
this repository: the app's scene and the Bobby sprite. They are 1672 × 941.

| File | Note |
|---|---|
| `frame-1.png` | Same view as the app. Twelve ducks; Bobby in the centre. |
| `frame-2.png` | The nest under the bridge, city through the arch. |
| `frame-3.png` | Bobby on the water, legs on the path. |
| `frame-4.png` | Flight over the city. |
| `frame-5.png` | The window, daylight. `frame-5-dusk.png` is an evening version, not used. |
| `frame-6.png` | Children walking past. |
| `frame-7.png` | Landing. He is larger here than in the app. |

To redo a frame, give ChatGPT `ref-scene.png` and `ref-bobby.png` and say:
"Pixel art in exactly the style of the first image, the duck exactly as in the
second image, no text", then describe the picture.

## Movement in Grok

Upload the frame, choose image-to-video and paste the prompt. Put this line at
the start of every prompt:

> Keep the pixel-art style exactly: hard pixels, no smoothing, no blur, no new
> details. Movement in small steps like a retro video game. Camera does not
> move unless said. No text, no speech.

| Shot | Prompt for Grok |
|---|---|
| 1 | The ducks on the water paddle slowly, small ripples around them. The ducks on the grass peck and shift their weight. The duck in the centre looks at the viewer, blinks and tilts his head. Clouds drift slowly to the right. |
| 2 | The duck looks down at the nest, then lifts his head and looks at the viewer. The water on the right ripples, light reflections move on the stone arch, the ivy sways slightly. |
| 3 | The duck in the centre floats and looks at the viewer; ripples spread around him. The other ducks dip their heads into the water and come up again. The legs on the path walk from left to right. |
| 4 | The duck flaps his wings steadily and flies to the right. The city below slides slowly to the left. Clouds drift past. Camera flies with the duck. |
| 5 | The duck on the ledge turns his head from one child to the next. Inside, the children move their hands over the robot; the robot's eyes blink blue. The duck's reflection in the glass moves with him. |
| 6 | The three children walk along the path from left to right and leave the picture on the right. The duck stays where he is and turns his head to follow them. Grass moves in the wind. |
| 7 | The duck touches down on the grass, folds his wings against his body, shakes once, then stands completely still facing the viewer. Clouds drift slowly, the water ripples. |

What to expect: video models tend to soften pixel art. If a clip comes out
blurry, generate it again; if it stays blurry, lower the "motion" setting or
make the clip shorter. Shots 4 and 7 have the most movement, so plan three or
four takes for those and two for the others. Check your plan's clip length
first: with six-second clips every shot is one clip, and shots 4 and 7 get
their extra seconds from a held last picture.

**The last picture.** After shot 7, cut to a recording of the app's first
screen (or the still `ref-scene.png` with the Bobby sprite on it) and hold it
for two seconds. In `frame-7.png` Bobby is bigger than in the app; a hard cut
on the moment he stands still hides that.

## Voice

* One English voice, male, low to middle pitch, dry and calm with a small
  smile in it. Not a cartoon duck voice.
* A teammate with a good microphone, or a text-to-speech voice. Description
  for a voice generator: "Male, forties, warm low voice, dry deadpan humour,
  unhurried, close microphone, British or neutral English."
* Slow pace. A full second of silence before "Psst."
* Mute any speech Grok generates. Bobby's beak does not move; the voice sits
  over the pictures.
* Use the same voice for Bobby in the live demo if you can.

## Sound

| Shot | Sound |
|---|---|
| 1 | Water, a few quacks, far city sound. No music yet. |
| 2 | Echo under the bridge, water dripping, a tram or cars overhead on "A bit loud." |
| 3 | Water, quacks, footsteps. |
| 4 | Wings and wind. Music starts here: light chiptune or plucked melody, quiet. |
| 5 | Music lower. Muffled children's voices and a small motor sound through the glass. |
| 6 | Footsteps and children chatting, fading as they leave. Music thins out. |
| 7 | Wings, a soft landing. Music stops on the landing. One quiet quack before "Psst." Silence after the last word. |

Music stays well under the voice. Free libraries such as Freesound or Pixabay
have all of these sounds.

## Text on the video

| Shot | Text | Where |
|---|---|---|
| 1 | *Heilbronn, 7:40* | Upper left |
| 2 | *Bobby's first home* | Upper left |
| 4 | *Bobby's morning round* | Upper left |
| 7 | *Bobby* | Upper left, where the wordmark sits in the app |
| All | Subtitles of what Bobby says | Bottom centre, two lines at most |

Style, from the design system: every text sits on a cream plate (`#fffdf8`)
with a darker bottom edge and square corners, never straight on the picture.
Labels and the wordmark in Pixelify Sans, subtitles in Lexend. No capitals.
Text pops in; it does not fade. The subtitles matter: if the hall sound fails,
the film still works.

## Brightness and colour

The frames already share one palette, so little is needed.

| Shot | Change |
|---|---|
| 1 | Cut in from black. No fade. |
| 2 | Lift the shadows under the bridge a little so Bobby and the nest read on a projector. |
| 5 | If the room looks dull next to the sky, raise the warmth inside slightly. |
| All | After Grok, compare every clip with its frame. If a clip came out paler or darker, bring saturation and brightness back to the frame's level. |
| All | Where a label sits on a busy area, the cream plate is enough; do not darken the picture. |

## If time runs out

* Cut shot 3. The film is about 40 seconds and still complete.
* Use the frames as stills with a slow zoom in the editor instead of
  generated movement. With pixel art this still looks deliberate.
