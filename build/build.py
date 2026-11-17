"""Build Riffle's data files, one folder per language.

data/<lang>/dict.txt      accepted guesses, 3+ letters, lowercase a-z only
data/<lang>/answers.json  secret-word pool: common 5-7 letter words, most common first.
                          French entries keep their accents for display; the game
                          strips accents (and splits œ/æ) to get the letters.

Sources
  en  guesses: build/en/enable1.txt (ENABLE, public domain)
      answers: NGSL 1.2 lemmas, from ../words/data/en/words.json
  fr  guesses: build/fr/an-array-of-french-words.json (npm an-array-of-french-words 2.0.0,
               MIT, derived from the Letterpress word list)
      answers: Eduscol frequency list, from ../words/data/fr/words.json
"""
import json, pathlib, unicodedata

here = pathlib.Path(__file__).parent
root = here.parent
words_app = root.parent / "words" / "data"


def plain(s):
    s = s.lower().replace("œ", "oe").replace("æ", "ae")
    return "".join(c for c in unicodedata.normalize("NFD", s) if not unicodedata.combining(c))


def good(w):
    return w.isascii() and w.isalpha() and len(w) >= 3


def build(lang, guesses):
    ok = sorted({plain(w) for w in guesses if good(plain(w))})
    out = root / "data" / lang
    out.mkdir(parents=True, exist_ok=True)
    (out / "dict.txt").write_text("\n".join(ok) + "\n")
    okset = set(ok)
    block = set((here / lang / "blocklist.txt").read_text().split())
    answers, seen = [], set()
    for entry in json.loads((words_app / lang / "words.json").read_text()):
        w = entry[0].lower()
        p = plain(w)
        if 5 <= len(p) <= 7 and p.isalpha() and p in okset and p not in block and p not in seen:
            seen.add(p)
            answers.append(w)
    (out / "answers.json").write_text(json.dumps(answers, ensure_ascii=False, separators=(",", ":")))
    print(f"{lang}: {len(ok)} dictionary words, {len(answers)} answers")


build("en", (here / "en" / "enable1.txt").read_text().split())
build("fr", json.loads((here / "fr" / "an-array-of-french-words.json").read_text()))
