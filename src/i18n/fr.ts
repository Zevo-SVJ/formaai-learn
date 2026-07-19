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
      "Dépose une leçon, un exercice ou une photo de tes notes. Forma AI lit, comprend et te réexplique le cours avec des mots qui parlent vraiment.",
    cta: "Essayer gratuitement",
    ctaHint: "Sans carte. Sans mur d'inscription.",
    menu: {
      upload: "Déposer une leçon",
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
  compare: {
    eyebrow: "La différence",
    title: "Forma face aux autres outils.",
    subtitle: "La plupart des outils donnent la réponse et s'en vont. Forma reste jusqu'à ce que tu comprennes vraiment.",
    recommended: "Recommandé",
    otherTitle: "Autres outils d'IA",
    typical: "Habituel",
    forma: [
      "Explique chaque réponse étape par étape",
      "S'adapte à ton niveau et à ta classe",
      "Crée tes fiches de révision",
      "Aide à comprendre, pas seulement à résoudre",
      "Garde tout ton historique d'apprentissage",
    ],
    other: [
      "Donne uniquement la réponse finale",
      "Même réponse pour tout le monde, sans adaptation",
      "Aucune fiche de révision ni aide mémoire",
      "Fait pour résoudre, pas pour enseigner",
      "Oublie ton travail dès que tu fermes l'onglet",
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
    subtitle:
      "La plupart des IA font tes devoirs à ta place. Forma AI fait l'inverse. Elle t'aide vraiment à comprendre la leçon.",
    items: [
      "Tu ouvres la leçon, rien ne rentre.",
      "Tu demandes à une IA. Elle te donne la réponse, pas l'idée.",
      "La semaine du contrôle arrive, et tu n'as toujours pas compris.",
    ],
  },
  solution: {
    eyebrow: "La solution",
    title: "Un tuteur qui lit vraiment ta leçon.",
    items: [
      {
        title: "Il lit ta leçon",
        body: "Reconnaissance de photos et d'écritures manuscrites. PDF et exercices aussi.",
      },
      {
        title: "Il t'apprend, il ne fait pas à ta place",
        body: "Explications structurées avec le pourquoi, les pièges et un exemple simple.",
      },
      {
        title: "Ancré dans ton document",
        body: "Chaque réponse est fondée sur ta leçon. Aucune information inventée.",
      },
    ],
  },
  how: {
    eyebrow: "Comment ça marche",
    title: "Trois étapes. Pas de blabla.",
    steps: [
      { t: "Dépose n'importe quoi", d: "Une photo, un PDF ou une capture de ton exercice." },
      { t: "Forma lit tout", d: "Détecte la matière, le niveau, le chapitre et les concepts clés." },
      { t: "Tu comprends enfin", d: "Une explication claire avec exemples et un chat qui connaît déjà ta leçon." },
    ],
  },
  subjects: {
    eyebrow: "Toutes les matières",
    title: "Des équations aux dissertations.",
    subtitle: "Forma couvre ce que tu étudies vraiment au collège et au lycée.",
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
        quote:
          "Photo de mon exo de physique, chaque étape est décortiquée et j'ai enfin compris.",
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
        quote:
          "Mon chapitre de chimie s'est enfin éclairé. L'exemple à la fin change tout.",
      },
      {
        name: "Julien Perrot",
        role: "Quatrième",
        quote:
          "Rapide, propre, et jamais condescendant. Je l'ouvre avant chaque devoir.",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Toutes les réponses.",
    items: [
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
    cta: "Commencer",
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
    terms: "En continuant, tu acceptes les conditions et la politique de confidentialité de Forma AI.",
    signInFailed: "Connexion impossible",
  },
  referral: {
    eyebrow: "Parrainage",
    title: "Invite 3 amis. Débloque premium.",
    body: "Partage ton code ci-dessous. Chaque ami qui s'inscrit avec compte.",
    unlockedEyebrow: "Premium débloqué",
    unlockedTitle: "Merci de faire tourner Forma.",
    unlockedBody: "Tu as débloqué les fonctionnalités premium. Continue à partager pour aider tes amis.",
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
      caption:
        "Forma t'aide à comprendre, à retenir et à progresser plus efficacement.",
    },
    insight2: {
      eyebrow: "Un tuteur privé",
      stat: "Disponible dès que tes devoirs s'ouvrent.",
      punch: "Pas un raccourci. Un professeur.",
      caption:
        "Forma lit ta vraie leçon avant de répondre. Chaque explication est ancrée dans ton propre document.",
    },
    loading: {
      title: "On prépare ta Forma",
      caption: "Tout est personnalisé à ta façon d'apprendre.",
      steps: [
        "Construction de ton profil d'apprentissage",
        "Alignement sur ton programme",
        "Préparation de ton tableau de bord",
        "Chargement de ta première session",
      ],
    },
  },
  home: {
    greeting: "Salut {{name}},",
    greetingAnon: "Content de te revoir,",
    subhead: "Qu'est-ce qu'on apprend aujourd'hui ?",
    upload: "Déposer une leçon",
    quickActions: "Accès rapide",
    quick: {
      photo: "Prendre une photo",
      pdf: "Déposer un PDF",
      paste: "Coller du texte",
      askDirect: "Poser une question",
    },
    favorites: "Enregistrés",
    favoritesEmpty: "Aucun favori pour le moment. Touche l'étoile d'une explication pour la sauver ici.",
    recent: "Leçons récentes",
    recentEmpty: "Tes leçons récentes apparaîtront ici.",
    seeAll: "Tout voir",
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
    askTitle: "Pose ta question sur cette leçon",
    askPlaceholder: "Demande ce que tu veux sur la leçon",
    quickActions: {
      simpler: "Explique plus simplement",
      example: "Donne un exemple",
      revision: "Fiche de révision",
      quiz: "Fais-moi un quiz",
      method: "Montre la méthode",
      summary: "Résume",
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
    scan: {
      title: "Analyse de ton document",
      caption: "Lecture de chaque question et préparation des réponses finales.",
      steps: [
        "Scan du document",
        "Détection de la matière et du niveau",
        "Extraction de chaque question",
        "Préparation des réponses finales",
        "Rédaction des explications",
      ],
    },
    empty: "Pose-lui n'importe quelle question sur la leçon. Forma l'a déjà lue.",
  },
  legal: {
    terms: {
      title: "Conditions d'utilisation",
      updated: "Dernière mise à jour : juillet 2026",
      draft:
        "Ceci est un modèle de départ. Remplace-le par ton texte juridique définitif avant le lancement.",
      sections: [
        {
          h: "Qui nous sommes",
          p: "Forma AI est un outil éducatif qui aide les élèves à comprendre leurs propres leçons.",
        },
        {
          h: "Comment utiliser Forma",
          p: "Forma est fait pour enseigner, pas pour passer tes évaluations à ta place. Tu es responsable de la façon dont tu l'utilises à l'école.",
        },
        {
          h: "Tes contenus",
          p: "Tu restes propriétaire de tout ce que tu déposes. Tu autorises Forma à traiter ton document dans le seul but de te renvoyer une explication.",
        },
        {
          h: "Disponibilité",
          p: "Nous faisons de notre mieux pour garder Forma disponible. Le service peut être interrompu pour maintenance ou amélioration.",
        },
        {
          h: "Modifications",
          p: "Nous pouvons faire évoluer ces conditions. Si c'est le cas, un message s'affichera dans le produit.",
        },
      ],
    },
    privacy: {
      title: "Politique de confidentialité",
      updated: "Dernière mise à jour : juillet 2026",
      draft:
        "Ceci est un modèle de départ. Remplace-le par ton texte définitif avant le lancement.",
      sections: [
        {
          h: "Ce que nous stockons",
          p: "Ton e-mail, les documents que tu déposes et les conversations que tu as avec Forma à leur sujet.",
        },
        {
          h: "Pourquoi",
          p: "Pour te renvoyer tes explications, ton historique et tes favoris sur tous tes appareils.",
        },
        {
          h: "Qui peut voir",
          p: "Uniquement toi. Notre équipe n'accède aux données que si un problème technique l'exige.",
        },
        {
          h: "Suppression",
          p: "Tu peux supprimer un document quand tu veux. Supprimer ton compte efface tes données.",
        },
        {
          h: "Contact",
          p: "Toute question sur la vie privée peut être envoyée à hello@forma.ai.",
        },
      ],
    },
    contact: {
      title: "Contact",
      subtitle: "Nous lisons chaque message.",
      email: "hello@forma.ai",
      form: {
        name: "Ton prénom",
        email: "Ton e-mail",
        message: "Qu'est-ce que tu veux nous dire ?",
        send: "Envoyer le message",
        sent: "Merci. On te répond très vite.",
      },
    },
  },
};
