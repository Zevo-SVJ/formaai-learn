import type { Dict } from "./en";

export const fr: Dict = {
  common: {
    signIn: "Connexion",
    signOut: "Déconnexion",
    back: "Retour",
    continue: "Continuer",
    getStarted: "Commencer",
    loading: "Chargement",
    tryAgain: "Réessayer",
    goHome: "Accueil",
    or: "ou",
    search: "Rechercher",
    save: "Enregistrer",
    saved: "Enregistré",
    remove: "Retirer",
    close: "Fermer",
    home: "Accueil",
    library: "Bibliothèque",
    favorites: "Favoris",
    subject: "Matière",
    level: "Niveau",
    chapter: "Chapitre",
    minutesAgo: "min",
    hoursAgo: "h",
    daysAgo: "j",
    justNow: "à l'instant",
    settings: "Paramètres",
    language: "Langue",
  },
  /**
   * What search engines and social cards show for the site.
   *
   * The server renders the English values, because the locale is only detected
   * in the browser: crawlers that do not run scripts, which is every social
   * crawler, will always read English. The active language is applied to the
   * head after hydration, for Google's rendered pass and for anyone who shares
   * from inside the app.
   */
  seo: {
    title: "Forma AI — L'IA qui explique tes cours et exercices",
    description:
      "Forma AI aide les étudiants à comprendre leurs cours et exercices avec des explications IA, des réponses étape par étape et des outils pour mieux réviser.",
  },
  /**
   * The lesson the landing demonstrations actually show.
   *
   * They used to draw grey bars. A bar is an illustration of a lesson, not a
   * lesson, and a demonstration that shows nothing real is a diagram. This is a
   * short course a student would recognise, so what is watched is the product
   * working on something rather than a shape standing in for it.
   */
  demo: {
    lesson: "Équations du premier degré",
    l1: "Une équation du premier degré s'écrit ax + b = c.",
    l2: "L'inconnue x apparaît une seule fois, sans puissance.",
    k1: "On isole x en passant b de l'autre côté.",
    l3: "Attention au signe quand un terme change de côté.",
    l4: "Le coefficient a ne doit jamais être nul.",
    k2: "On divise ensuite les deux membres par a.",
    l5: "Le résultat obtenu est la solution de l'équation.",
    l6: "On peut toujours vérifier en remplaçant x.",
    k3: "Exemple : 2x + 3 = 11 donne x = 4.",
    l7: "La méthode reste la même quels que soient a, b et c.",
    answer: "x = 4",
    explanation: "On isole x d'un côté, puis on divise par son coefficient.",
    mistake: "Oublier de changer le signe en faisant passer un terme.",
    example: "2x + 3 = 11, donc 2x = 8, donc x = 4.",
  },
  nav: {
    how: "Fonctionnement",
    features: "Fonctionnalités",
    reviews: "Avis",
    faq: "FAQ",
  },
  hero: {
    title1: "Comprends chaque leçon.",
    title2: "Pas seulement la réponse.",
    subtitle:
      "Dépose une leçon, un exercice ou une photo de tes notes. Forma lit, comprend et te réexplique le cours avec des mots qui parlent vraiment.",
    cta: "Essayer gratuitement",
    ctaHint: "Sans carte. Sans mur d'inscription.",
    midTitle: "Comprendre, puis progresser.",
    midBody: "Forma t'explique tes cours et suit tes notes. Tout au même endroit.",
    menu: {
      upload: "Analyser mon cours",
      see: "Voir comment ça marche",
      eyebrow: "Ajouter une leçon",
      title: "Comment veux-tu l'ajouter ?",
      image: "Choisir une image",
      pdf: "Choisir un PDF",
      photo: "Prendre une photo",
      scan: "Scanner un document",
    },
  },
  progress: {
    nav: "Progrès",
  },
  consent: {
    body: "Forma utilise la mesure d'audience pour comprendre ce qui aide vraiment les élèves. Tu peux refuser : l'application fonctionne exactement pareil.",
    accept: "Accepter",
    decline: "Refuser",
    more: "En savoir plus",
  },
  errorPages: {
    notFound: {
      title: "Cette page n'existe pas",
      body: "Le lien est peut-être ancien, ou l'adresse contient une erreur.",
      home: "Retour à l'accueil",
    },
    crash: {
      title: "Ça ne s'est pas passé comme prévu",
      body: "Rien n'est perdu. Réessaie, et si ça continue, reviens à l'accueil.",
      retry: "Réessayer",
      home: "Retour à l'accueil",
    },
  },
  errors: {
    network: "Connexion interrompue. Vérifie ta connexion, puis réessaie.",
    rate: "Beaucoup de demandes en même temps. Patiente un instant, puis réessaie.",
    permission: "Tu n'as pas accès à ce contenu.",
    notFound: "Ce contenu est introuvable. Il a peut-être été supprimé.",
    server: "Forma a un souci de son côté. Réessaie dans un instant.",
    generic: "Ça n'a pas fonctionné. Réessaie dans un instant.",
    badCredentials: "E-mail ou mot de passe incorrect.",
    emailInUse: "Un compte existe déjà avec cet e-mail. Connecte-toi.",
    emailNotConfirmed: "Confirme ton adresse e-mail depuis ta boîte de réception.",
    weakPassword: "Choisis un mot de passe d'au moins 8 caractères.",
  },
  resources: {
    title: "Ressources",
    subtitle: "Les quiz, fiches et decks que le tuteur a créés pour toi.",
    empty: "Rien de créé pour l'instant. Demande un quiz ou une fiche de révision au tuteur.",
    open: "Ouvrir",
    created: "Prêt",
    quiz: "Quiz",
    sheet: "Fiche de révision",
    deck: "Cartes",
    question: "Question {{current}} sur {{total}}",
    check: "Vérifier",
    next: "Suivante",
    again: "Recommencer",
    score: "{{score}} sur {{total}}",
    correct: "Correct",
    wrong: "Pas tout à fait",
    remove: "Supprimer",
    otherDecks: "Decks de cette leçon",
    analysisDeck: "Issu de l'analyse",
    regenerate: "Un autre quiz ?",
  },
  collections: {
    title: "Collections d'analyses",
    subtitle: "Les leçons que tu as gardées, prêtes à être reparcourues.",
    empty: "Rien de gardé pour l'instant. Enregistre une analyse et elle t'attendra ici.",
    emptyCta: "Analyser une leçon",
    cards: "{{count}} cartes",
    oneCard: "1 carte",
    answer: "Réponse",
    remove: "Retirer des collections",
    open: "Ouvrir la collection",
    tabCards: "Cartes enregistrées",
    cardsEmpty:
      "Aucune carte gardée seule pour l'instant. Ouvre une carte et garde-la pour la retrouver ici.",
    allAnalyses: "Toutes tes analyses",
  },
  libraryPage: {
    subtitle: "Toutes tes leçons analysées, au même endroit.",
    empty: "Rien d'enregistré pour l'instant. Analyse ta première leçon et elle apparaîtra ici.",
    emptyCta: "Analyser une leçon",
  },
  progressPage: {
    title: "Tes progrès",
    subtitle: "Suis chaque note et regarde tes moyennes évoluer.",
    add: "Ajouter une note",
    overall: "Moyenne générale",
    trend: "Tendance",
    bySubject: "Par matière",
    recent: "Toutes les notes",
    entries: "notes",
    noData: "Aucune note sur cette période.",
    empty: "Ajoute ta première note pour voir tes progrès.",
    editGrade: "Modifier la note",
    newGrade: "Nouvelle note",
    deleted: "Note supprimée",
    saved: "Note enregistrée",
    invalid: "Vérifie les valeurs.",
    ranges: { week: "Semaine", month: "Mois", year: "Année", all: "Tout" },
    fields: {
      subject: "Matière",
      assignment: "Devoir",
      grade: "Note",
      scale: "Barème",
      custom: "Perso",
      coef: "Coefficient",
      date: "Date",
      note: "Remarque",
    },
  },

  social: {
    count: "Utilisé par 300 000+",
    label: "élèves",
  },
  compact: {
    upload: "Déposer une leçon",
    scan: "Prendre en photo",
  },
  upload: {
    fileTooLarge: "Fichier trop lourd. Max {{max}} Mo.",
    uploading: "Envoi",
    reading: "Lecture",
    readingDoc: "Lecture du document",
    analysisFailed: "L'analyse a échoué. Ouvre le document pour réessayer.",
    uploadFailed: "Envoi impossible",
    dropHere: "Dépose ta leçon ici",
    subtitle: "Leçon, devoir, capture, photo, PDF ou fiche. Forma lit et t'explique.",
    chooseFile: "Choisir un fichier",
    orDragDrop: "ou glisse-dépose",
    photo: "Photo",
  },
  progressFeature: {
    title: "Vois vraiment comment tu progresses.",
    body: "Ajoute une note avec sa matière, son coefficient et sa date. Forma transforme tes résultats en tableau de bord clair, pour comprendre ta progression dans le temps.",
    chips: ["Note", "Matière", "Coefficient", "Date", "Barème"],
    average: "Moyenne générale",
    months: ["Sept.", "Nov.", "Janv."],
    subjects: ["Mathématiques", "Physique", "Histoire"],
  },
  compare: {
    // Two lines for the whole sequence: the movement makes the argument,
    // and these only mark which half is being watched.
    beats: ["Les autres s'arrêtent là.", "Forma continue.", "Longtemps après la réponse."],
    eyebrow: "La différence",
    title: "Forma face aux autres outils.",
    subtitle:
      "La plupart des outils donnent la réponse et s'en vont. Forma reste jusqu'à ce que tu comprennes vraiment.",
    recommended: "Recommandé",
    otherTitle: "Autres outils d'IA",
    typical: "Habituel",
    forma: [
      "S'adapte à ton niveau et à ta classe",
      "Crée tes fiches de révision",
      "Garde tout ton historique d'apprentissage",
    ],
  },
  liveCounters: {
    lessons: "leçons analysées",
    exercises: "exercices résolus",
    students: "élèves actifs",
    live: "En direct",
    updated: "Mis à jour à l'instant",
  },

  problem: {
    eyebrow: "Le problème",
    title: "Avoir la réponse ne veut pas dire comprendre.",
    subtitle: "Les autres IA font le travail à ta place. Forma t'apprend à le faire.",
    items: [
      "Tu relis. Rien ne reste.",
      "La réponse arrive. L'idée, non.",
      "Et le contrôle avance.",
      "Comprendre, c'était avant.",
    ],
  },
  how: {
    eyebrow: "Comment ça marche",
    title: "Ton cours devient des cartes.",
    swipeHint: "Glisse pour explorer",
    steps: [
      { t: "Dépose ton cours", d: "Photo, PDF ou capture. Même écrit à la main." },
      { t: "Forma le lit vraiment", d: "Il repère la matière, ton niveau et l'idée qui compte." },
      {
        t: "Tu reçois tes cartes",
        d: "L'explication, la méthode, les erreurs à éviter, un exemple. Une carte à la fois.",
      },
    ],
  },
  subjects: {
    eyebrow: "Toutes les matières",
    title: "Des équations aux dissertations.",
    subtitle: "Forma couvre ce que tu étudies vraiment au collège et au lycée.",
    uploads: "dépôts",
    scans: "scans",
    list: [
      "Mathématiques",
      "Physique",
      "Chimie",
      "SVT",
      "Français",
      "Anglais",
      "Allemand",
      "Espagnol",
      "Histoire",
      "Géographie",
      "Philosophie",
      "SES",
      "SNT et NSI",
      "Littérature",
      "Technologie",
    ],
  },
  reviews: {
    eyebrow: "Élèves",
    title: "Adopté par les élèves qui l'utilisent chaque jour.",
    subtitle: "De vrais élèves, de vraies leçons, de vrais progrès.",
    items: [
      {
        name: "Léa Bernard",
        role: "Première · Sciences",
        quote:
          "J'ai enfin compris comment factoriser. Pas parce qu'on m'a donné la réponse, mais parce qu'on m'a guidée étape par étape.",
      },
      {
        name: "Thomas Rivière",
        role: "Seconde",
        quote:
          "Je prends mes notes de SVT en photo et Forma m'explique tout ce que j'avais raté en cours. Super clair.",
      },
      {
        name: "Amina Youssef",
        role: "Terminale · SES",
        quote:
          "Ce n'est pas une aide aux devoirs. C'est quelqu'un qui t'explique vraiment le chapitre.",
      },
      {
        name: "Noah Peeters",
        role: "Troisième",
        quote: "Photo de mon exo de physique, chaque étape est décortiquée et j'ai enfin compris.",
      },
      {
        name: "Chloé Martin",
        role: "Première · Lettres",
        quote:
          "Je l'utilise pour préparer mes dissertations de français. On dirait un prof particulier, pas un bot.",
      },
      {
        name: "Marc Ovadia",
        role: "Seconde · Maths",
        quote:
          "Ça corrige ma méthode, pas seulement mon résultat. C'est ça qui fait la différence.",
      },
      {
        name: "Sara El Amrani",
        role: "Terminale",
        quote: "Mon chapitre de chimie s'est enfin éclairé. L'exemple à la fin change tout.",
      },
      {
        name: "Julien Perrot",
        role: "Quatrième",
        quote: "Rapide, propre, et jamais condescendant. Je l'ouvre avant chaque devoir.",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Toutes les réponses.",
    items: [
      {
        q: "Est-ce que je dois payer ?",
        a: "Non pour commencer. Tu déposes ta première leçon sans créer de compte et sans carte bancaire.",
      },
      {
        q: "Est-ce que Forma AI me donne juste la réponse ?",
        a: "Non. Forma est fait pour enseigner. Elle décompose la notion, explique pourquoi c'est important, pointe les erreurs classiques et te donne un exemple simple. Tu peux toujours lui demander d'aller plus loin.",
      },
      {
        q: "Qu'est-ce que je peux déposer ?",
        a: "Des photos de tes cahiers, des captures d'écran, des PDF, des fiches d'exercices et des pages manuscrites. Si c'est un document, Forma le lit.",
      },
      {
        q: "Mes documents sont-ils privés ?",
        a: "Oui. Tes documents sont stockés en privé dans ton compte et visibles uniquement par toi.",
      },
      {
        q: "Quelles matières sont couvertes ?",
        a: "Toutes les matières du collège et du lycée. Maths, sciences, histoire, langues et bien plus.",
      },
    ],
  },
  finalCta: {
    title: "Commence à comprendre dès aujourd'hui.",
    subtitle: "Dépose ta première leçon. Zéro formulaire, zéro blabla.",
  },
  footer: {
    tagline: "Fait pour les élèves qui veulent vraiment apprendre.",
    terms: "Conditions",
    privacy: "Confidentialité",
    cookies: "Cookies",
    contact: "Contact",
    rights: "Tous droits réservés.",
  },

  auth: {
    welcome: "Content de te revoir",
    tagline: "Connecte-toi pour continuer avec Forma.",
    createAccount: "Crée ton compte",
    createTagline: "Dernière étape — on garde tes progrès.",
    tabSignup: "Créer un compte",
    tabSignin: "Se connecter",
    google: "Continuer avec Google",
    apple: "Continuer avec Apple",
    email: "Continuer avec l'e-mail",
    emailPlaceholder: "toi@ecole.fr",
    passwordPlaceholder: "Mot de passe (8 caractères min.)",
    referralPlaceholder: "Code de parrainage (facultatif)",
    referralHint: "Un ami t'a partagé un code ? Ajoute-le pour l'aider à débloquer premium.",
    createCta: "Créer mon compte",
    signinCta: "Se connecter",
    checkInbox: "Regarde ta boîte mail",
    checkInboxConfirm: "Confirme ton adresse e-mail depuis ta boîte de réception.",
    linkSent: "On t'a envoyé un lien magique à",
    terms:
      "En continuant, tu acceptes les conditions et la politique de confidentialité de Forma AI.",
    signInFailed: "Connexion impossible",
  },
  referral: {
    eyebrow: "Parrainage",
    title: "Invite 3 amis. Débloque premium.",
    body: "Partage ton code ci-dessous. Chaque ami qui s'inscrit avec compte.",
    unlockedEyebrow: "Premium débloqué",
    unlockedTitle: "Merci de faire tourner Forma.",
    unlockedBody:
      "Tu as débloqué les fonctionnalités premium. Continue à partager pour aider tes amis.",
    yourCode: "Ton code",
    copy: "Copier le code",
    copied: "Code copié",
    copyFailed: "Impossible de copier le code",
    share: "Partager",
    shareBody: "Apprends avec Forma AI — utilise mon code {{code}} pour te lancer.",
    friends: "amis inscrits",
  },

  onboarding: {
    stepOf: "Étape {{current}} sur {{total}}",
    next: "Suivant",
    skip: "Passer",
    finish: "Terminer",
    intro: {
      title: "Préparons ton tuteur.",
      subtitle: "Quelques infos rapides pour que Forma adapte ses explications à ton niveau.",
      namePlaceholder: "Ton prénom",
      cta: "Continuer",
    },
    q1: {
      title: "Tu es là pour quoi ?",
      subtitle: "Choisis ce qui te ressemble le plus. Tu pourras changer plus tard.",
      options: [
        { id: "understand", label: "Comprendre mes leçons" },
        { id: "revise", label: "Réviser un contrôle" },
        { id: "homework", label: "Être aidé sur mes devoirs" },
        { id: "essays", label: "Mieux rédiger" },
      ],
    },
    q2: {
      title: "Tu es en quelle classe ?",
      subtitle: "Pour adapter le ton et la profondeur.",
      options: [
        { id: "middle", label: "Collège" },
        { id: "highJunior", label: "Seconde ou Première" },
        { id: "highSenior", label: "Terminale" },
        { id: "prep", label: "Prépa" },
      ],
    },
    q3: {
      title: "Où vas-tu à l'école ?",
      subtitle: "Pour adapter les matières à ton programme.",
      searchPlaceholder: "Recherche un pays",
      noResults: "Aucun pays trouvé",
    },
    q4: {
      title: "Quelles matières comptent le plus pour toi ?",
      subtitle: "Choisis jusqu'à cinq. Ça personnalise juste ton accueil.",
    },
    insight1: {
      eyebrow: "La vérité",
      stat: "96 % des élèves révisent surtout en relisant leurs notes.",
      punch: "Toi, tu vas faire mieux.",
      caption: "Forma t'aide à comprendre, à retenir et à progresser plus efficacement.",
    },
    insight2: {
      eyebrow: "Un tuteur privé",
      stat: "Disponible dès que tes devoirs s'ouvrent.",
      punch: "Pas un raccourci. Un professeur.",
      caption:
        "Forma lit ta vraie leçon avant de répondre. Chaque explication est ancrée dans ton propre document.",
    },
    cards: {
      title: "Tes explications sont des cartes",
      swipe: "Fais glisser sur le côté pour les parcourir",
      open: "Touche une carte pour la lire en entier",
      keepCard: "Garde une carte pour la retrouver plus tard",
      keepAll: "Ou garde toute l'analyse d'un coup",
      cta: "J'ai compris",
      d1: "Pour résoudre, isole l'inconnue puis divise des deux côtés.",
      d2: "Ça marche pour toute équation du premier degré.",
      d3: "Si 2x + 3 = 11, alors x = 4.",
    },
    loading: {
      title: "On prépare ta Forma",
      caption: "Tout est personnalisé à ta façon d'apprendre.",
      steps: [
        "Analyse de tes objectifs",
        "Personnalisation de ton tableau de bord",
        "Préparation de ton assistant",
        "Construction de ton espace de travail",
        "Derniers réglages",
      ],
    },
  },
  home: {
    greet: {
      morning: "Bonjour {{name}}",
      afternoon: "Bon après-midi {{name}}",
      evening: "Bonsoir {{name}}",
      night: "Encore là, {{name}} ?",
      back1: "Content de te revoir, {{name}}",
      back2: "Bon retour, {{name}}",
      back3: "Heureux de te retrouver, {{name}}",
      away: "Ça faisait un moment, {{name}}",
      milestone: "Déjà {{count}} leçons ensemble, {{name}}",
      idle: "Besoin d'un coup de main, {{name}} ?",
    },
    greetAnon: {
      morning: "Bonjour",
      afternoon: "Bon après-midi",
      evening: "Bonsoir",
      night: "Encore là ?",
      back1: "Content de te revoir",
      back2: "Bon retour",
      back3: "Heureux de te retrouver",
      away: "Ça faisait un moment",
      milestone: "Déjà {{count}} leçons ensemble",
      idle: "Besoin d'un coup de main ?",
    },
    subhead: "Qu'est-ce qu'on apprend aujourd'hui ?",
    upload: "Déposer une leçon",
    favorites: "Enregistrés",
    favoritesEmpty:
      "Aucun favori pour le moment. Touche l'étoile d'une explication pour la sauver ici.",
    recent: "Leçons récentes",
    recentEmpty: "Tes leçons récentes apparaîtront ici.",
    seeAll: "Tout voir",
    feedback: "Un problème, une idée ? Dis-le-nous.",
    encourage: {
      title: "Un peu chaque jour.",
      body: "Les élèves qui ouvrent Forma cinq minutes par jour retiennent deux fois plus de ce qu'ils lisent.",
    },
  },
  doc: {
    reading: "Lecture du document",
    understanding: "Compréhension de la leçon",
    ready: "Prêt",
    failed: "Analyse impossible",
    retry: "Réessayer",
    working: "En cours",
    workingHint: "Forma lit vraiment ton document. Ça prend d'habitude 5 à 15 secondes.",
    stalled: "Ça prend plus de temps que prévu. L'analyse a peut-être été interrompue.",
    unreadable:
      "Forma n'a pas réussi à lire ce document. Réessaie avec une photo plus nette, bien éclairée, avec toute la page visible.",
    askTitle: "Continue avec ton tuteur",
    askSubtitle: "Tu as la réponse. Pose maintenant ta question — Forma t'explique pas à pas.",
    askCta: "Poser une question sur cette analyse",
    askPlaceholder: "Pose ta question sur cette analyse",
    deck: {
      progress: "{{current}} sur {{total}}",
      next: "Carte suivante",
      previous: "Carte précédente",
      openCard: "Ouvrir la carte",
      saveCard: "Garder cette carte",
      cardSaved: "Gardée",
      saveAnalysis: "Enregistrer cette analyse",
      analysisSaved: "Analyse enregistrée",
    },
    quickActions: {
      simpler: "Explique plus simplement",
      example: "Donne un exemple",
      revision: "Fiche de révision",
      quiz: "Fais-moi un quiz",
      method: "Montre la méthode",
      summary: "Résume",
      difficulty: {
        pick: "Quel niveau ?",
        easy: "Facile",
        medium: "Moyen",
        hard: "Difficile",
        expert: "Expert",
      },
      prompts: {
        simpler:
          "Réexplique-moi ta dernière réponse plus simplement, comme à quelqu'un qui découvre le sujet.",
        example: "Donne un exemple concret et détaillé qui illustre ta dernière réponse.",
        revision: "Crée-moi une fiche de révision claire à partir de ta dernière réponse.",
        quiz: "Génère un quiz de niveau {{level}} avec {{count}} questions ciblées sur ta dernière réponse. Adapte la complexité et la profondeur des explications à ce niveau. Pose les questions une par une et attends ma réponse à chaque fois.",
      },
    },
    sections: {
      answer: "Réponse",
      explanation: "Explication",
      method: "Méthode",
      commonMistakes: "Erreurs fréquentes",
      details: "Pour aller plus loin",
      why: "Pourquoi c'est important",
      example: "Exemple simple",
      analogy: "Analogie",
    },
    favoriteAdd: "Enregistrer",
    favoriteRemove: "Enregistré",
    favoriteToast: "Ajouté à tes favoris",
    unfavoriteToast: "Retiré des favoris",
    answersHint: "Les réponses finales, droit au but.",
    copyAll: "Copier les réponses",
    copied: "Réponses copiées",
    copyFailed: "Impossible de copier les réponses",
    scan: {
      title: "Analyse de ton document",
      caption: "Lecture de chaque question et préparation des réponses finales.",
      steps: [
        "Image détectée",
        "Lecture des exercices",
        "Compréhension des questions",
        "Préparation des réponses finales",
      ],
      stepsFile: [
        "Document détecté",
        "Lecture des pages",
        "Compréhension des questions",
        "Préparation des réponses finales",
      ],
      done: "Tout est prêt",
    },
    empty:
      "Pose n'importe quelle question sur ce que tu as importé. Forma a déjà tout analysé — exercices, images, PDF et documents.",
  },
  legal: {
    terms: {
      title: "Conditions d'utilisation",
      updated: "Dernière mise à jour : juillet 2026",
      sections: [
        {
          h: "Qui nous sommes",
          p: "Forma AI est un outil éducatif qui aide les élèves du collège et du lycée à comprendre leurs propres cours. En utilisant Forma, tu acceptes les conditions ci-dessous.",
        },
        {
          h: "Ce que Forma fait, et ne fait pas",
          p: "Forma explique tes documents pour t'aider à apprendre. Ce n'est pas un service qui passe tes évaluations à ta place, et ce n'est pas un remplacement de tes professeurs. Tu restes responsable du respect des règles de ton établissement.",
        },
        {
          h: "Ton compte",
          p: "Tu dois avoir au moins 15 ans, ou l'accord d'un parent ou tuteur. Les informations que tu donnes doivent être exactes, et tu es responsable de la confidentialité de tes identifiants. Un compte est personnel et ne se partage pas.",
        },
        {
          h: "Usage acceptable",
          p: "Tu t'engages à ne pas déposer de contenu illégal, haineux ou violent, ni de documents contenant les données personnelles d'autres personnes sans leur accord. Tu ne dois pas tenter de contourner nos protections, surcharger le service, ni en extraire le contenu de façon automatisée.",
        },
        {
          h: "Tes contenus",
          p: "Tu restes propriétaire de tout ce que tu déposes. Tu nous accordes uniquement le droit de traiter ton document le temps nécessaire pour te renvoyer une explication. Nous ne revendiquons aucun droit sur tes cours et ne les utilisons pas à d'autres fins.",
        },
        {
          h: "Propriété intellectuelle de Forma",
          p: "Le nom Forma AI, son interface, ses textes et son identité visuelle nous appartiennent. Ton compte te donne le droit d'utiliser le service, pas de le copier ou de le revendre.",
        },
        {
          h: "Limites du service",
          p: "Forma s'appuie sur une intelligence artificielle : elle peut se tromper, mal lire un document ou proposer une explication incomplète. Vérifie toujours une réponse importante avant de la rendre. Forma est fourni sans garantie de résultat scolaire.",
        },
        {
          h: "Disponibilité",
          p: "Nous faisons de notre mieux pour garder Forma accessible, mais le service peut être interrompu pour maintenance, mise à jour ou raison technique, sans préavis.",
        },
        {
          h: "Suspension et fermeture",
          p: "Nous pouvons suspendre un compte qui ne respecte pas ces conditions, en particulier en cas d'usage abusif. De ton côté, tu peux arrêter d'utiliser Forma et demander la suppression de ton compte à tout moment.",
        },
        {
          h: "Évolution des conditions",
          p: "Ces conditions peuvent évoluer avec le produit. En cas de changement important, nous te préviendrons dans l'application. Pour toute question, écris-nous à zevo.flcs@gmail.com.",
        },
      ],
    },
    privacy: {
      title: "Politique de confidentialité",
      updated: "Dernière mise à jour : juillet 2026",
      sections: [
        {
          h: "En résumé",
          p: "Tes cours t'appartiennent. Nous collectons le minimum nécessaire pour faire fonctionner Forma, nous ne vendons rien à personne, et il n'y a aucun traceur publicitaire dans l'application. La mesure d'audience anonyme ne se déclenche que si tu l'acceptes.",
        },
        {
          h: "Les données que nous collectons",
          p: "Ton adresse e-mail et l'identifiant du compte utilisé pour te connecter. Le prénom, le pays et le niveau que tu indiques pendant l'introduction. Les documents et photos que tu déposes, ainsi que le texte qui en est extrait. Tes conversations avec le tuteur. Les notes que tu ajoutes dans la section Progrès.",
        },
        {
          h: "Pourquoi nous les collectons",
          p: "Pour analyser tes documents et te renvoyer une explication, pour retrouver ton historique et tes favoris sur tous tes appareils, et pour adapter le ton des explications à ton niveau. Rien de plus.",
        },
        {
          h: "Comment l'IA traite tes documents",
          p: "Quand tu déposes un document, son contenu est envoyé à notre fournisseur d'IA (Google Gemini, via la passerelle Lovable AI) le temps de produire l'analyse. Ce traitement sert uniquement à te répondre. Tes documents ne servent pas à entraîner des modèles.",
        },
        {
          h: "Base légale",
          p: "Nous traitons ces données pour exécuter le service que tu demandes en créant un compte. Tu peux retirer ton accord à tout moment en supprimant tes documents ou ton compte.",
        },
        {
          h: "Combien de temps nous les gardons",
          p: "Tes documents et conversations sont conservés tant que ton compte existe, pour que tu puisses les retrouver. Pour faire supprimer un document précis ou l'ensemble de ton compte, écris-nous à zevo.flcs@gmail.com : nous traitons la demande sous 30 jours, et la suppression est définitive.",
        },
        {
          h: "Qui peut y accéder",
          p: "Toi. Chaque donnée est rattachée à ton compte et isolée au niveau de la base par des règles de sécurité. Notre équipe n'y accède que si un problème technique l'exige réellement.",
        },
        {
          h: "Tes droits",
          p: "Tu disposes d'un droit d'accès à tes données, de rectification, de suppression, de portabilité (en recevoir une copie) et d'opposition au traitement. Pour exercer l'un de ces droits, écris à zevo.flcs@gmail.com : nous répondons sous 30 jours.",
        },
        {
          h: "Sécurité",
          p: "Les échanges sont chiffrés en transit, l'accès aux données est restreint par compte, et les fichiers ne sont accessibles que par des liens signés temporaires.",
        },
        {
          h: "Réclamation",
          p: "Si une réponse ne te convient pas, tu peux saisir la CNIL, l'autorité française de protection des données, sur cnil.fr.",
        },
      ],
    },
    cookies: {
      title: "Politique cookies",
      updated: "Dernière mise à jour : juillet 2026",
      sections: [
        {
          h: "Ce que nous utilisons",
          p: "Forma n'utilise que des cookies et un stockage local strictement nécessaires à son fonctionnement. Aucun cookie publicitaire, aucun traceur tiers.",
        },
        {
          h: "Rester connecté",
          p: "Ta session d'authentification est conservée sur ton appareil pour t'éviter de te reconnecter à chaque visite. Sans elle, l'application ne peut pas savoir que c'est bien toi.",
        },
        {
          h: "Tes préférences",
          p: "Nous gardons aussi sur ton appareil la langue choisie, le fait que l'introduction a déjà été faite, et le prénom et le pays que tu as indiqués, pour personnaliser l'accueil.",
        },
        {
          h: "Mesure d'audience",
          p: "Forma utilise Google Analytics pour compter les visites et voir quelles fonctionnalités servent vraiment. Il ne se lance que si tu l'acceptes quand on te le demande, tu peux refuser et l'application fonctionne pareil, et aucune donnée publicitaire ou de personnalisation n'est collectée.",
        },
        {
          h: "Tes choix",
          p: "Tu peux effacer ces données à tout moment depuis les réglages de ton navigateur. Comme elles sont nécessaires au fonctionnement, les effacer te déconnectera et remettra tes préférences à zéro.",
        },
      ],
    },
    contact: {
      title: "Contact",
      subtitle: "Nous lisons chaque message.",
      email: "zevo.flcs@gmail.com",
      form: {
        kinds: { general: "Avis général", problem: "Un problème", idea: "Une idée" },
        name: "Ton prénom",
        email: "Ton e-mail",
        message: "Qu'est-ce que tu veux nous dire ?",
        send: "Envoyer le message",
        sent: "Merci. On te répond très vite.",
      },
    },
  },
};
