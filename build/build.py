"""Build Riffle's data files.

dict.txt    every ENABLE word of 3+ letters (accepted guesses)
answers.json  common 5-7 letter words (NGSL 1.2 lemmas, via ../words) used as secret words
"""
import json, pathlib, re

here = pathlib.Path(__file__).parent
root = here.parent
enable = [w.strip() for w in (here / "enable1.txt").read_text().split() if len(w.strip()) >= 3]
(root / "dict.txt").write_text("\n".join(enable) + "\n")
ok = set(enable)

ngsl = json.loads((root.parent / "words/data/en/words.json").read_text())
block = set((here / "blocklist.txt").read_text().split())
answers = []
for entry in ngsl:
    w = entry[0].lower()
    if re.fullmatch(r"[a-z]{5,7}", w) and w in ok and w not in block and w not in answers:
        answers.append(w)
(root / "answers.json").write_text(json.dumps(answers, separators=(",", ":")))
print(len(enable), "dictionary words;", len(answers), "answers")
