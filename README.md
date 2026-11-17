# Riffle

A daily word game in English and French. Three words were riffled together like a deck of cards, so each
word's letters are still in order but interleaved with the others:

    G R S E A D T L O L U B O P L Y E E   =   GREATLY + SLOPE + DOUBLE

Tap letters left to right (skipping any you like) to pull out a word of 3+ letters.
Each letter can be used once. Clear the strip in as few words as possible: par is 3,
and a long word that wasn't hidden can put you under par. The share result is a
colour barcode showing which word each letter went into, without spoiling the letters.

## Languages

English (the default) and French, picked from the EN/FR menu in the header. The choice
sets the puzzle words, the accepted guesses and the interface text, and is remembered.
Each language has its own daily puzzle, progress and stats. In French, accents are
ignored (É, È and Ê are all E; Œ is OE), as in French Scrabble.

| | Accepted guesses | Secret words |
|---|---|---|
| English | ENABLE word list (public domain), 172,727 words | NGSL 1.2 lemmas, 5-7 letters (1,332) |
| French | npm `an-array-of-french-words` 2.0.0 (MIT, derived from the Letterpress word list), 318,800 words | Éduscol frequency list, 5-7 letters (744) |

To add a language: add its sources under `build/<lang>/`, a `build("<lang>", ...)` line
in `build/build.py`, and an entry in `i18n.js`.

## Files

    index.html, style.css, app.js   the whole app (no build step, no dependencies)
    i18n.js                         interface text and per-language settings
    data/<lang>/answers.json        secret-word pool, most common first (French keeps accents for display)
    data/<lang>/dict.txt            accepted guesses, 3+ letters, a-z only
    build/build.py                  regenerates data/ from build/<lang>/ and ../words/data/<lang>

Daily puzzles are generated in the browser from a seed (`riffle-daily-<n>` in English,
`riffle-daily-fr-<n>` in French), where #1 is 16 Nov 2026 local time. The generator
picks three distinct words totalling 15-18 letters and interleaves them so no word
shows more than 2 letters in a row and no hidden word appears as a plain substring.
Progress and stats live in localStorage (French keys are prefixed `fr:`).

## Run locally

    python3 -m http.server 4174 --directory /path/to/mco.dev/static

Then open http://localhost:4174/riffle/.
