// Interface text for each puzzle language. French uses a non-breaking space ( )
// before ! ? : as French typography requires.

const n = " ";
const plural = (k, one, many) => (k === 1 ? one : many);

export const LANGS = {
  en: {
    name: "English",
    seed: "riffle-daily-",          // unchanged from the English-only version, so old puzzles stay the same
    storePrefix: "",                // English keeps the original storage keys
    shareName: "Riffle",
    example: { letters: "cdaotg", src: "010101", caption: "CAT and DOG, riffled." },
    t: {
      madeWith: "Made with ❤️ by",
      allApps: "All apps",
      settings: "Settings", appearance: "Appearance", system: "System", light: "Light", dark: "Dark",
      tagline: "Three words, shuffled like cards. Pull them apart.",
      howToPlay: "How to play", statistics: "Statistics", language: "Language", close: "Close",
      strip: "Letter strip", yourWords: "Your words", backspace: "Delete last letter",
      par: "Par", clear: "Clear", enter: "Enter", startOver: "Start over", share: "Share", play: "Play",
      wordsUsed: "Words used to solve", tapLetters: "tap letters",
      daily: (d) => `Daily #${d}`, practice: "Practice", backToDaily: "Back to daily",
      words: (k) => `${k} ${plural(k, "word", "words")}`,
      slot: (k) => `Word ${k}`,
      hint: "Hint", hintCount: (k, max) => `Hint (${k}/${max})`,
      noFree: (ch) => `No free ${ch} after that`,
      tooShort: (min) => `Words need ${min}+ letters`,
      loading: "Loading word list…", notWord: "Not in the word list",
      huge: "Huge!", nice: "Nice!", good: "Good.",
      left: (k) => `${k} ${plural(k, "letter", "letters")} left`,
      returned: "Letters returned",
      hintMsg: (len, ch) => `A hidden ${len}-letter word starts with the marked ${ch}`,
      used: "used", selected: "selected", putBack: (w) => `Put back ${w}`,
      verdict: (k) => k === 1 ? ["Impossible!", "One word. Unbelievable."]
        : k === 2 ? ["Under par!", "2 words. Better than the puzzle itself."]
        : k === 3 ? ["Perfect riffle", "Solved in 3 words, right on par."]
        : k === 4 ? ["Riffled", "4 words, one over par."]
        : ["Riffled", `${k} words. Can you get it in 3 tomorrow?`],
      hints: (k) => ` ${k} ${plural(k, "hint", "hints")}.`,
      riffled: "The riffled words:",
      practicePuzzle: "Practice puzzle", nextPractice: "Next practice",
      nextDaily: "A new daily puzzle arrives at midnight.",
      shareDaily: (d) => `#${d}`, sharePractice: "(practice)",
      shareWords: (k, par) => `${k} ${plural(k, "word", "words")} (par ${par})`,
      copied: "Copied to clipboard", cantShare: "Couldn't share. Select the text to copy it",
      solved: "Solved", atPar: "At or under par", streak: "Streak", best: "Best streak",
      help: `
        <h2>How to play</h2>
        <p>Three words were <b>riffled</b> together like a deck of cards. Each word kept its letters in order, but they got mixed in with each other.</p>
        %EXAMPLE%
        <ul>
          <li>Tap letters <b>left to right</b> to spell a word. You can skip as many letters as you like.</li>
          <li>Every word needs at least 3 letters. Any word counts, not just the hidden ones.</li>
          <li>Each letter can be used once. Clear the whole strip to win.</li>
          <li><b>Fewer words is better.</b> Par is 3. If you find a long word that wasn't hidden, you can finish under par.</li>
          <li>Short, easy words can leave you with letters you can't use. Tap × on a word to put its letters back.</li>
        </ul>
        <p>A new puzzle every day, in English or French. Typing on a keyboard works too.</p>`,
    },
  },

  fr: {
    name: "Français",
    seed: "riffle-daily-fr-",
    storePrefix: "fr:",
    shareName: "Riffle FR",
    example: { letters: "sreilz", src: "010101", caption: "SEL et RIZ, mélangés." },
    t: {
      madeWith: "Fait avec ❤️ par",
      allApps: "Toutes les applis",
      settings: "Réglages", appearance: "Apparence", system: "Système", light: "Clair", dark: "Sombre",
      tagline: "Trois mots, mélangés comme des cartes. Séparez-les.",
      howToPlay: "Comment jouer", statistics: "Statistiques", language: "Langue", close: "Fermer",
      strip: "Bande de lettres", yourWords: "Vos mots", backspace: "Effacer la dernière lettre",
      par: "Par", clear: "Effacer", enter: "Valider", startOver: "Recommencer", share: "Partager", play: "Jouer",
      wordsUsed: "Mots utilisés pour résoudre", tapLetters: "touchez les lettres",
      daily: (d) => `Défi n°${n}${d}`, practice: "Entraînement", backToDaily: "Retour au défi du jour",
      words: (k) => `${k} ${plural(k, "mot", "mots")}`,
      slot: (k) => `Mot ${k}`,
      hint: "Indice", hintCount: (k, max) => `Indice (${k}/${max})`,
      noFree: (ch) => `Pas de ${ch} libre plus loin`,
      tooShort: (min) => `Il faut au moins ${min} lettres`,
      loading: "Chargement du dictionnaire…", notWord: "Mot inconnu",
      huge: `Énorme${n}!`, nice: `Bravo${n}!`, good: "Bien.",
      left: (k) => `Il reste ${k} ${plural(k, "lettre", "lettres")}`,
      returned: "Lettres remises en place",
      hintMsg: (len, ch) => `Un mot caché de ${len} lettres commence par le ${ch} marqué`,
      used: "utilisée", selected: "sélectionnée", putBack: (w) => `Remettre ${w}`,
      verdict: (k) => k === 1 ? [`Impossible${n}!`, `Un seul mot. Incroyable.`]
        : k === 2 ? [`Sous le par${n}!`, "2 mots. Mieux que la grille elle-même."]
        : k === 3 ? ["Mélange parfait", "Résolu en 3 mots, pile au par."]
        : k === 4 ? ["Démêlé", "4 mots, un de plus que le par."]
        : ["Démêlé", `${k} mots. En 3 demain${n}?`],
      hints: (k) => ` ${k} ${plural(k, "indice", "indices")}.`,
      riffled: `Les mots mélangés${n}:`,
      practicePuzzle: "Entraînement", nextPractice: "Encore une",
      nextDaily: "Un nouveau défi chaque jour à minuit.",
      shareDaily: (d) => `n°${n}${d}`, sharePractice: "(entraînement)",
      shareWords: (k, par) => `${k} ${plural(k, "mot", "mots")} (par ${par})`,
      copied: "Copié dans le presse-papiers", cantShare: "Partage impossible. Sélectionnez le texte pour le copier",
      solved: "Résolus", atPar: "Au par ou mieux", streak: "Série", best: "Meilleure série",
      help: `
        <h2>Comment jouer</h2>
        <p>Trois mots ont été <b>mélangés</b> comme un jeu de cartes. Chaque mot a gardé ses lettres dans l'ordre, mais elles se sont intercalées avec celles des autres.</p>
        %EXAMPLE%
        <ul>
          <li>Touchez les lettres <b>de gauche à droite</b> pour former un mot. Vous pouvez en sauter autant que vous voulez.</li>
          <li>Chaque mot doit avoir au moins 3 lettres. Tous les mots comptent, pas seulement les mots cachés.</li>
          <li>Les accents ne comptent pas&nbsp;: E vaut aussi É, È ou Ê.</li>
          <li>Chaque lettre ne sert qu'une fois. Videz toute la bande pour gagner.</li>
          <li><b>Moins de mots, c'est mieux.</b> Le par est de 3. Avec un long mot qui n'était pas caché, vous pouvez finir sous le par.</li>
          <li>Les petits mots faciles peuvent laisser des lettres inutilisables. Touchez × sur un mot pour remettre ses lettres.</li>
        </ul>
        <p>Un nouveau défi chaque jour, en français ou en anglais. Le clavier fonctionne aussi.</p>`,
    },
  },
};
