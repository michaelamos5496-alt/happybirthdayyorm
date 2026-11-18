# Happy Birthday, Yorm

A personal digital birthday card for Yorm Aggor. It's one page built with HTML, CSS and vanilla JavaScript, with no build step.

```
index.html
css/style.css
js/main.js
assets/images/yorm-portrait.jpg   ← the photograph
assets/audio/                      ← optional: birthday-soundtrack.mp3
assets/icons/favicon.svg
```

## How it flows
1. **The envelope:** "A little something for someone special." A white envelope with a black wax seal (gold "Y"). Tapping **Open your wish** (or the envelope) breaks the seal, lifts the flap, raises the card and fades through soft white light.
2. **Hello:** "Happy birthday, *Yorm.*", with her name in gold script.
3. **The portrait:** her photo as a mounted print, with a slow parallax.
4. **The letter:** the first half of the message on a sheet of paper.
5. **Her own story:** the "beautiful story of your own" line inside camera-viewfinder corners.
6. **The wishes:** happiness, good health, peace of mind… as a numbered list (I–VI).
7. **Always:** "Never stop being the wonderful person you are."
8. **More life:** confetti, then a sealed "One more thing" note she taps open. **Read it again** goes back to the envelope.

Add `?card` to the address (e.g. `localhost:8000/?card`) to skip the envelope while editing.

## Preview
```bash
python3 -m http.server 8000
```
Then open <http://localhost:8000>.

## Change the photograph
Replace `assets/images/yorm-portrait.jpg` with another photo, keeping the same filename. A portrait (4:5) shape works best. The current photo is the portrait from aggoryorm.com.

## Add music (optional)
The soundtrack is "The Birthday Song", saved as `assets/audio/birthday-soundtrack.mp3`. A small **Play music** button then appears in the corner. Music only starts when the visitor taps it. Without the file, the button stays hidden.

## Edit the words
All the text is in `index.html`, grouped under numbered comments, one per scene.

## Share it
The card is a static site. Drag this folder onto <https://app.netlify.com/drop>, or run `npx vercel` here, to get a single link you can send. `noindex` keeps it out of search engines.

