# Riffle

A daily word game. Three words were riffled together like a deck of cards, so each
word's letters are still in order but interleaved with the others:

    G R S E A D T L O L U B O P L Y E E   =   GREATLY + SLOPE + DOUBLE

Tap letters left to right (skipping any you like) to pull out a word of 3+ letters.
Each letter can be used once. Clear the strip in as few words as possible: par is 3,
and a long word that wasn't hidden can put you under par. The share result is a
colour barcode showing which word each letter went into, without spoiling the letters.

## Files

    index.html, style.css, app.js   the whole app (no build step, no dependencies)
    answers.json                    secret-word pool: common 5-7 letter words (NGSL 1.2 lemmas)
    dict.txt                        accepted guesses: ENABLE word list, 3+ letters (public domain)
    build/build.py                  regenerates both from build/enable1.txt and ../words/data/en

Daily puzzles are generated in the browser from a seed (`riffle-daily-<n>`), where
#1 is 16 Nov 2026 local time. The generator picks three distinct words totalling
15-18 letters and interleaves them so no word shows more than 2 letters in a row and
no hidden word appears as a plain substring. Progress and stats live in localStorage.

## Run locally

    python3 -m http.server 4174 --directory /path/to/mco.dev/static

Then open http://localhost:4174/riffle/.
