import type { Dict } from "./en";

export const it: Dict = {
  common: {
    signIn: "Accedi",
    signOut: "Esci",
    back: "Indietro",
    continue: "Continua",
    getStarted: "Inizia",
    loading: "Caricamento",
    tryAgain: "Riprova",
    goHome: "Vai alla home",
    or: "o",
    search: "Cerca",
    save: "Salva",
    saved: "Salvato",
    remove: "Rimuovi",
    close: "Chiudi",
    home: "Home",
    library: "Libreria",
    favorites: "Preferiti",
    subject: "Materia",
    level: "Livello",
    chapter: "Argomento",
    minutesAgo: "min",
    hoursAgo: "h",
    daysAgo: "g",
    justNow: "proprio ora",
    settings: "Impostazioni",
    language: "Lingua",
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
    title: "Forma AI — L'assistente di studio con IA per studenti",
    description:
      "Forma AI aiuta gli studenti a capire lezioni ed esercizi con spiegazioni IA, soluzioni passo dopo passo e strumenti per studiare meglio.",
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
    lesson: "Equazioni di primo grado",
    l1: "Un'equazione di primo grado si scrive ax + b = c.",
    l2: "L'incognita x compare una volta, senza potenza.",
    k1: "Si isola x portando b dall'altra parte.",
    l3: "Attenzione al segno quando un termine cambia lato.",
    l4: "Il coefficiente a non può mai essere zero.",
    k2: "Poi si dividono entrambi i membri per a.",
    l5: "Il risultato è la soluzione dell'equazione.",
    l6: "Puoi sempre verificare sostituendo x.",
    k3: "Esempio: 2x + 3 = 11 dà x = 4.",
    l7: "Il metodo vale qualunque siano a, b e c.",
    answer: "x = 4",
    explanation: "Isola x da un lato e dividi per il suo coefficiente.",
    mistake: "Dimenticare di cambiare segno spostando un termine.",
    example: "2x + 3 = 11, quindi 2x = 8, quindi x = 4.",
  },
  nav: {
    how: "Come funziona",
    features: "Funzioni",
    reviews: "Recensioni",
    faq: "Domande",
  },
  hero: {
    title1: "Capisci ogni lezione.",
    title2: "Non solo la risposta.",
    subtitle:
      "Carica una lezione, un esercizio o una foto dei tuoi appunti. Forma legge, capisce e te lo rispiega con parole che hanno davvero senso.",
    cta: "Prova gratis",
    ctaHint: "Nessuna carta. Nessuna registrazione obbligatoria.",
    midTitle: "Capire, poi migliorare.",
    midBody: "Forma spiega le tue lezioni e segue i tuoi voti. Tutto in un posto solo.",
    menu: {
      upload: "Analizza la mia lezione",
      see: "Guarda come funziona",
      eyebrow: "Aggiungi una lezione",
      title: "Come vuoi aggiungerla?",
      image: "Scegli un'immagine",
      pdf: "Scegli un PDF",
      photo: "Scatta una foto",
      scan: "Scansiona un documento",
    },
  },
  progress: {
    nav: "Progressi",
  },
  consent: {
    body: "Forma usa la misurazione del traffico per capire cosa aiuta davvero gli studenti. Puoi rifiutare: l'app funziona esattamente allo stesso modo.",
    accept: "Accetta",
    decline: "Rifiuta",
    more: "Scopri di più",
  },
  errorPages: {
    notFound: {
      title: "Questa pagina non esiste",
      body: "Il link potrebbe essere vecchio, oppure l'indirizzo contiene un errore.",
      home: "Torna alla home",
    },
    crash: {
      title: "Non è andata come previsto",
      body: "Non hai perso nulla. Riprova e, se continua, torna alla home.",
      retry: "Riprova",
      home: "Torna alla home",
    },
  },
  errors: {
    network: "Connessione persa. Controlla la connessione e riprova.",
    rate: "Troppe richieste insieme. Aspetta un attimo e riprova.",
    permission: "Non hai accesso a questo contenuto.",
    notFound: "Non abbiamo trovato questo contenuto. Potrebbe essere stato eliminato.",
    server: "Forma ha un problema dalla sua parte. Riprova tra poco.",
    generic: "Non ha funzionato. Riprova tra poco.",
    badCredentials: "Email o password non corretti.",
    emailInUse: "Esiste già un account con questa email. Accedi.",
    emailNotConfirmed: "Conferma il tuo indirizzo email dalla tua casella di posta.",
    weakPassword: "Scegli una password di almeno 8 caratteri.",
  },
  resources: {
    title: "Risorse",
    subtitle: "I quiz, le schede e i mazzi che il tutor ha creato per te.",
    empty: "Ancora niente. Chiedi al tutor un quiz o una scheda di ripasso.",
    open: "Apri",
    created: "Pronto",
    quiz: "Quiz",
    sheet: "Scheda di ripasso",
    deck: "Carte",
    question: "Domanda {{current}} di {{total}}",
    check: "Verifica",
    next: "Avanti",
    again: "Ricomincia",
    score: "{{score}} su {{total}}",
    correct: "Corretto",
    wrong: "Non proprio",
    remove: "Elimina",
    otherDecks: "Mazzi di questa lezione",
    analysisDeck: "Dall'analisi",
    regenerate: "Un altro quiz?",
  },
  collections: {
    title: "Raccolte di analisi",
    subtitle: "Le lezioni che hai tenuto, pronte da riprendere.",
    empty: "Non hai ancora tenuto nulla. Salva un'analisi e ti aspetterà qui.",
    emptyCta: "Analizza una lezione",
    cards: "{{count}} carte",
    oneCard: "1 carta",
    answer: "Risposta",
    remove: "Rimuovi dalle raccolte",
    open: "Apri la raccolta",
    tabCards: "Carte salvate",
    cardsEmpty:
      "Nessuna carta tenuta da sola per ora. Apri una carta e tienila per ritrovarla qui.",
    allAnalyses: "Tutte le tue analisi",
  },
  libraryPage: {
    subtitle: "Tutte le lezioni che hai analizzato, in un unico posto.",
    empty: "Ancora niente. Analizza la tua prima lezione e la troverai qui.",
    emptyCta: "Analizza una lezione",
  },
  progressPage: {
    title: "I tuoi progressi",
    subtitle: "Segna ogni voto e guarda le tue medie salire.",
    add: "Aggiungi un voto",
    overall: "Media generale",
    trend: "Andamento",
    bySubject: "Per materia",
    recent: "Tutti i voti",
    entries: "voti",
    noData: "Nessun voto in questo periodo.",
    empty: "Aggiungi il tuo primo voto per vedere i tuoi progressi.",
    editGrade: "Modifica il voto",
    newGrade: "Nuovo voto",
    deleted: "Voto eliminato",
    saved: "Voto salvato",
    invalid: "Controlla i valori.",
    ranges: { week: "Settimana", month: "Mese", year: "Anno", all: "Tutto" },
    fields: {
      subject: "Materia",
      assignment: "Verifica",
      grade: "Voto",
      scale: "Scala",
      custom: "Altro",
      coef: "Peso",
      date: "Data",
      note: "Nota",
    },
  },

  social: {
    count: "Oltre 300.000",
    label: "studenti",
  },
  compact: {
    upload: "Carica una lezione",
    scan: "Scatta una foto",
  },
  upload: {
    fileTooLarge: "File troppo grande. Massimo {{max}} MB.",
    uploading: "Caricamento",
    reading: "Lettura",
    readingDoc: "Sto leggendo il tuo documento",
    analysisFailed: "L'analisi non è riuscita. Apri il documento per riprovare.",
    uploadFailed: "Caricamento non riuscito",
    dropHere: "Trascina qui la tua lezione",
    subtitle: "Lezione, compiti, screenshot, foto, PDF o scheda. Forma legge e ti spiega.",
    chooseFile: "Scegli un file",
    orDragDrop: "o trascina qui",
    photo: "Foto",
  },
  progressFeature: {
    title: "Guarda davvero come stai migliorando.",
    body: "Aggiungi un voto con la materia, il peso e la data. Forma trasforma i tuoi risultati in un quadro chiaro, per capire i tuoi progressi nel tempo.",
    chips: ["Voto", "Materia", "Peso", "Data", "Scala"],
    average: "Media generale",
    months: ["Set.", "Nov.", "Gen."],
    subjects: ["Matematica", "Fisica", "Storia"],
  },
  compare: {
    eyebrow: "La differenza",
    title: "Forma a confronto con gli altri strumenti.",
    subtitle:
      "La maggior parte ti dà la risposta e sparisce. Forma resta finché non hai capito davvero.",
    recommended: "Consigliato",
    otherTitle: "Altri strumenti di IA",
    typical: "Di solito",
    forma: [
      "Si adatta alla tua classe e al tuo livello",
      "Ti prepara il materiale di ripasso",
      "Conserva tutto il tuo percorso di studio",
    ],
  },
  liveCounters: {
    lessons: "lezioni analizzate",
    exercises: "esercizi risolti",
    students: "studenti attivi",
    live: "In diretta",
    updated: "Aggiornato poco fa",
  },

  problem: {
    eyebrow: "Il problema",
    title: "Avere la risposta non vuol dire aver capito.",
    subtitle: "Le altre IA fanno il lavoro al posto tuo. Forma ti insegna a farlo.",
    items: [
      "Apri la lezione. Non entra niente.",
      "Chiedi a un'IA. Ti dà la risposta, non l'idea.",
      "Arriva la verifica. Non hai ancora capito.",
    ],
  },
  how: {
    eyebrow: "Come funziona",
    title: "La tua lezione diventa carte.",
    swipeHint: "Scorri per esplorare",
    steps: [
      { t: "Carica la tua lezione", d: "Una foto, un PDF o uno screenshot. Anche scritta a mano." },
      {
        t: "Forma la legge davvero",
        d: "Riconosce la materia, il tuo livello e l'idea che conta.",
      },
      {
        t: "Ricevi le tue carte",
        d: "La spiegazione, il metodo, gli errori da evitare, un esempio. Una carta alla volta.",
      },
    ],
  },
  subjects: {
    eyebrow: "Tutte le materie",
    title: "Dalle equazioni ai temi.",
    subtitle: "Forma copre quello che studi davvero alle medie e alle superiori.",
    uploads: "caricamenti",
    scans: "scansioni",
    list: [
      "Matematica",
      "Fisica",
      "Chimica",
      "Biologia",
      "Francese",
      "Inglese",
      "Tedesco",
      "Spagnolo",
      "Storia",
      "Geografia",
      "Filosofia",
      "Economia",
      "Informatica",
      "Letteratura",
      "Tecnologia",
    ],
  },
  reviews: {
    eyebrow: "Studenti",
    title: "Amato da chi lo usa ogni giorno.",
    subtitle: "Studenti veri, lezioni vere, progressi veri.",
    items: [
      {
        name: "Léa Bernard",
        role: "4ª superiore · Scientifico",
        quote:
          "Ho finalmente capito come si scompone. Non perché mi ha dato la risposta, ma perché mi ha accompagnata passo dopo passo.",
      },
      {
        name: "Thomas Rivière",
        role: "3ª superiore",
        quote:
          "Fotografo i miei appunti di biologia e mi spiega le parti che ho perso in classe. È lo strumento di studio più tranquillo che abbia usato.",
      },
      {
        name: "Amina Youssef",
        role: "5ª superiore · Economia",
        quote:
          "Non sembra un aiuto per i compiti. Sembra qualcuno che ti spiega davvero il capitolo.",
      },
      {
        name: "Noah Peeters",
        role: "2ª superiore",
        quote:
          "Ho caricato una foto del mio esercizio di fisica. Ha spiegato ogni passaggio e finalmente l'ho capito.",
      },
      {
        name: "Chloé Martin",
        role: "4ª superiore · Letteratura",
        quote:
          "Lo uso per preparare i temi. Le spiegazioni sembrano di un insegnante privato, non di un bot.",
      },
      {
        name: "Marc Ovadia",
        role: "3ª superiore · Matematica",
        quote: "Mi ha corretto il metodo, non solo il risultato. Per me la differenza è tutta lì.",
      },
      {
        name: "Sara El Amrani",
        role: "5ª superiore",
        quote:
          "Il capitolo di chimica finalmente ha avuto senso. La parte con gli esempi mi ha convinta.",
      },
      {
        name: "Julien Perrot",
        role: "2ª superiore",
        quote:
          "Veloce, pulito e non ti tratta mai dall'alto in basso. Lo apro prima di ogni compito.",
      },
    ],
  },
  faq: {
    eyebrow: "Domande",
    title: "Tutto, spiegato.",
    items: [
      {
        q: "Devo pagare?",
        a: "Per iniziare no. Puoi caricare la tua prima lezione senza account e senza carta.",
      },
      {
        q: "Forma AI mi dà solo la risposta?",
        a: "No. Forma è fatto per insegnare. Scompone il concetto, spiega perché conta, segnala gli errori più comuni e propone un esempio semplice. Puoi sempre chiedergli di approfondire.",
      },
      {
        q: "Cosa posso caricare?",
        a: "Foto dei tuoi appunti, screenshot, PDF, schede e pagine scritte a mano. Se è un documento, Forma lo legge.",
      },
      {
        q: "Il mio lavoro resta privato?",
        a: "Sì. I tuoi documenti restano nel tuo account e li vedi solo tu.",
      },
      {
        q: "Quali materie copre?",
        a: "Qualsiasi materia delle medie o delle superiori. Matematica, scienze, storia, lingue e altro.",
      },
    ],
  },
  finalCta: {
    title: "Inizia a capire oggi.",
    subtitle: "Carica la tua prima lezione. Niente moduli, niente giri di parole.",
  },
  footer: {
    tagline: "Fatto per studenti che vogliono davvero imparare.",
    terms: "Condizioni",
    privacy: "Privacy",
    cookies: "Cookie",
    contact: "Contatti",
    rights: "Tutti i diritti riservati.",
  },
  auth: {
    welcome: "Bentornato",
    tagline: "Accedi per continuare con Forma.",
    createAccount: "Crea il tuo account",
    createTagline: "Ultimo passo, così salviamo i tuoi progressi.",
    tabSignup: "Crea un account",
    tabSignin: "Accedi",
    google: "Continua con Google",
    apple: "Continua con Apple",
    email: "Continua con l'email",
    emailPlaceholder: "tu@scuola.it",
    passwordPlaceholder: "Password (min. 8 caratteri)",
    referralPlaceholder: "Codice invito (facoltativo)",
    referralHint:
      "Un amico ti ha dato il suo codice? Inseriscilo per aiutarlo a sbloccare premium.",
    createCta: "Crea il mio account",
    signinCta: "Accedi",
    checkInbox: "Controlla la posta",
    checkInboxConfirm: "Conferma il tuo indirizzo email dalla tua casella di posta.",
    linkSent: "Ti abbiamo inviato un link magico a",
    terms: "Continuando accetti le condizioni e l'informativa privacy di Forma AI.",
    signInFailed: "Accesso non riuscito",
  },
  referral: {
    eyebrow: "Inviti",
    title: "Invita 3 amici. Sblocca premium.",
    body: "Condividi il tuo codice. Conta ogni amico che entra con quello.",
    unlockedEyebrow: "Premium sbloccato",
    unlockedTitle: "Grazie per aver fatto conoscere Forma.",
    unlockedBody:
      "Hai sbloccato le funzioni premium. Continua a condividere per aiutare i tuoi amici a studiare meglio.",
    yourCode: "Il tuo codice",
    copy: "Copia il codice",
    copied: "Codice copiato",
    copyFailed: "Non è stato possibile copiare il codice",
    share: "Condividi",
    shareBody: "Studia con Forma AI: usa il mio codice {{code}} per iniziare.",
    friends: "amici iscritti",
  },

  onboarding: {
    stepOf: "Passo {{current}} di {{total}}",
    next: "Avanti",
    skip: "Salta",
    finish: "Fine",
    intro: {
      title: "Prepariamo il tuo tutor.",
      subtitle: "Poche informazioni veloci, così Forma adatta le spiegazioni al tuo livello.",
      namePlaceholder: "Il tuo nome",
      cta: "Continua",
    },
    q1: {
      title: "Per cosa userai Forma?",
      subtitle: "Scegli quello che ti somiglia di più. Puoi cambiarlo dopo.",
      options: [
        { id: "understand", label: "Capire le lezioni" },
        { id: "revise", label: "Preparare una verifica" },
        { id: "homework", label: "Farmi aiutare con i compiti" },
        { id: "essays", label: "Scrivere temi migliori" },
      ],
    },
    q2: {
      title: "Che classe fai?",
      subtitle: "Così adattiamo il tono e la profondità.",
      options: [
        { id: "middle", label: "Scuole medie" },
        { id: "highJunior", label: "Superiori, primi anni" },
        { id: "highSenior", label: "Superiori, ultimo anno" },
        { id: "prep", label: "Preparazione all'università" },
      ],
    },
    q3: {
      title: "Dove vai a scuola?",
      subtitle: "Solo per adattare le materie al tuo programma.",
      searchPlaceholder: "Cerca un paese",
      noResults: "Nessun paese corrisponde",
    },
    q4: {
      title: "Quali materie ti stanno più a cuore?",
      subtitle: "Scegline fino a cinque. Serve solo a personalizzare la tua home.",
    },
    insight1: {
      eyebrow: "La verità",
      stat: "Il 96 % degli studenti ripassa soprattutto rileggendo gli appunti.",
      punch: "Tu farai di meglio.",
      caption: "Forma ti aiuta a capire, a ricordare e a migliorare in modo più efficace.",
    },
    insight2: {
      eyebrow: "Un tutor privato",
      stat: "C'è ogni volta che apri i compiti.",
      punch: "Non una scorciatoia. Un insegnante.",
      caption:
        "Forma legge la tua lezione prima di rispondere. Ogni spiegazione parte dal tuo documento.",
    },
    cards: {
      title: "Le tue spiegazioni sono carte",
      swipe: "Scorri di lato per sfogliarle",
      open: "Tocca una carta per leggerla tutta",
      keepCard: "Tieni una carta per ritrovarla più tardi",
      keepAll: "Oppure tieni tutta l'analisi in una volta",
      cta: "Ho capito",
      d1: "Per risolvere, isola l'incognita e dividi entrambi i lati.",
      d2: "Vale per ogni equazione di primo grado.",
      d3: "Se 2x + 3 = 11, allora x = 4.",
    },
    loading: {
      title: "Sto preparando il tuo Forma",
      caption: "Sto adattando tutto al tuo modo di studiare.",
      steps: [
        "Capisco i tuoi obiettivi",
        "Personalizzo la tua dashboard",
        "Preparo il tuo assistente",
        "Costruisco il tuo spazio di studio",
        "Ultimi dettagli",
      ],
    },
  },
  home: {
    greet: {
      morning: "Buongiorno, {{name}}",
      afternoon: "Buon pomeriggio, {{name}}",
      evening: "Buonasera, {{name}}",
      night: "Ancora sveglio, {{name}}?",
      back1: "Che bello rivederti, {{name}}",
      back2: "Bentornato, {{name}}",
      back3: "Bello averti di nuovo qui, {{name}}",
      away: "Era un po' che non ci vedevamo, {{name}}",
      milestone: "Siamo già a {{count}} lezioni insieme, {{name}}",
      idle: "Ti do una mano, {{name}}?",
    },
    greetAnon: {
      morning: "Buongiorno,",
      afternoon: "Buon pomeriggio,",
      evening: "Buonasera,",
      night: "Ancora sveglio?",
      back1: "Che bello rivederti,",
      back2: "Bentornato,",
      back3: "Bello averti di nuovo qui,",
      away: "Era un po' che non ci vedevamo,",
      milestone: "Siamo già a {{count}} lezioni insieme,",
      idle: "Ti do una mano?",
    },
    subhead: "Cosa impariamo oggi?",
    upload: "Carica una lezione",
    favorites: "Salvato per dopo",
    favoritesEmpty: "Ancora nessun preferito. Tocca la stella su una spiegazione per salvarla qui.",
    recent: "Lezioni recenti",
    recentEmpty: "Qui compariranno le tue lezioni recenti.",
    seeAll: "Vedi tutto",
    feedback: "Qualcosa non va o hai un'idea? Dillo a noi.",
    encourage: {
      title: "Un po' ogni giorno.",
      body: "Gli studenti che aprono Forma anche solo cinque minuti al giorno capiscono il doppio di quello che leggono.",
    },
  },
  doc: {
    reading: "Sto leggendo il documento",
    understanding: "Sto capendo la lezione",
    ready: "Pronto",
    failed: "Analisi non riuscita",
    retry: "Riprova",
    working: "In corso",
    workingHint:
      "Forma sta davvero leggendo il tuo documento. Di solito servono dai 5 ai 15 secondi.",
    stalled: "Sta impiegando più del previsto. L'analisi potrebbe essersi interrotta.",
    unreadable:
      "Forma non è riuscito a leggere questo documento. Prova con una foto più nitida, con buona luce e con tutta la pagina visibile.",
    askTitle: "Continua con il tuo tutor",
    askSubtitle:
      "Hai la risposta. Ora chiedi quello che vuoi, Forma te lo spiega passo dopo passo.",
    askCta: "Fai una domanda su questa analisi",
    askPlaceholder: "Chiedi quello che vuoi su questa analisi",
    deck: {
      progress: "{{current}} di {{total}}",
      next: "Scheda successiva",
      previous: "Scheda precedente",
      openCard: "Apri la carta",
      saveCard: "Tieni questa carta",
      cardSaved: "Tenuta",
      saveAnalysis: "Salva questa analisi",
      analysisSaved: "Analisi salvata",
    },
    quickActions: {
      simpler: "Spiega più semplice",
      example: "Fammi un esempio",
      revision: "Crea una scheda di ripasso",
      quiz: "Crea un quiz",
      method: "Mostrami il metodo",
      summary: "Riassumi",
      difficulty: {
        pick: "Che livello?",
        easy: "Facile",
        medium: "Medio",
        hard: "Difficile",
        expert: "Esperto",
      },
      prompts: {
        simpler:
          "Spiega la tua ultima risposta in modo più semplice, per chi è alle prime armi con l'argomento.",
        example: "Fai un esempio concreto e svolto che illustri la tua ultima risposta.",
        revision: "Crea una scheda di ripasso chiara a partire dalla tua ultima risposta.",
        quiz: "Genera un quiz di livello {{level}} con {{count}} domande sulla tua ultima risposta. Adatta la complessità e la profondità delle spiegazioni a quel livello. Falle una alla volta e aspetta la mia risposta ogni volta.",
      },
    },
    sections: {
      answer: "Risposta",
      explanation: "Spiegazione",
      method: "Metodo",
      commonMistakes: "Errori frequenti",
      details: "Per approfondire",
      why: "Perché conta",
      example: "Esempio semplice",
      analogy: "Analogia",
    },
    favoriteAdd: "Salva",
    favoriteRemove: "Salvato",
    favoriteToast: "Salvato nei tuoi preferiti",
    unfavoriteToast: "Rimosso dai preferiti",
    answersHint: "Le risposte finali, dritte al punto.",
    copyAll: "Copia le risposte",
    copied: "Risposte copiate",
    copyFailed: "Non è stato possibile copiare",
    scan: {
      title: "Sto analizzando il tuo documento",
      caption: "Leggo ogni domanda e preparo le risposte finali.",
      steps: [
        "Immagine rilevata",
        "Leggo gli esercizi",
        "Capisco le domande",
        "Preparo le risposte",
      ],
      stepsFile: [
        "Documento rilevato",
        "Leggo le pagine",
        "Capisco le domande",
        "Preparo le risposte",
      ],
      done: "È tutto pronto",
    },
    empty:
      "Chiedi quello che vuoi su ciò che hai caricato. Forma ha già analizzato tutto: esercizi, immagini, PDF e documenti.",
  },
  legal: {
    terms: {
      title: "Condizioni d'uso",
      updated: "Ultimo aggiornamento: luglio 2026",
      sections: [
        {
          h: "Chi siamo",
          p: "Forma AI è uno strumento educativo che aiuta gli studenti delle medie e delle superiori a capire le proprie lezioni. Usando Forma accetti queste condizioni.",
        },
        {
          h: "Cosa fa Forma, e cosa non fa",
          p: "Forma spiega i tuoi documenti per aiutarti a imparare. Non fa le verifiche al posto tuo e non sostituisce i tuoi insegnanti. Resti responsabile del rispetto delle regole della tua scuola.",
        },
        {
          h: "Il tuo account",
          p: "Devi avere almeno 15 anni, oppure il consenso di un genitore o di chi ne fa le veci. Le informazioni che fornisci devono essere corrette e sei responsabile della riservatezza delle tue credenziali. L'account è personale e non si condivide.",
        },
        {
          h: "Uso accettabile",
          p: "Ti impegni a non caricare contenuti illegali, d'odio o violenti, né documenti che contengano dati personali di altre persone senza il loro consenso. Non devi tentare di aggirare le nostre protezioni, sovraccaricare il servizio o estrarne i contenuti in modo automatizzato.",
        },
        {
          h: "I tuoi contenuti",
          p: "Tutto ciò che carichi resta tuo. Ci autorizzi soltanto a trattare il tuo documento per il tempo necessario a restituirti una spiegazione. Non rivendichiamo alcun diritto sulle tue lezioni e non le usiamo per altro.",
        },
        {
          h: "Proprietà intellettuale di Forma",
          p: "Il nome Forma AI, l'interfaccia, i testi e l'identità visiva ci appartengono. Il tuo account ti dà il diritto di usare il servizio, non di copiarlo o rivenderlo.",
        },
        {
          h: "Limiti del servizio",
          p: "Forma si basa sull'intelligenza artificiale: può sbagliare, leggere male un documento o dare una spiegazione incompleta. Verifica sempre una risposta importante prima di consegnarla. Forma è fornito senza garanzia di risultati scolastici.",
        },
        {
          h: "Disponibilità",
          p: "Facciamo del nostro meglio per mantenere Forma accessibile, ma il servizio può essere interrotto per manutenzione, aggiornamenti o motivi tecnici, senza preavviso.",
        },
        {
          h: "Sospensione e chiusura",
          p: "Possiamo sospendere un account che non rispetta queste condizioni, in particolare in caso di abuso. Da parte tua, puoi smettere di usare Forma e chiedere la cancellazione del tuo account quando vuoi.",
        },
        {
          h: "Modifiche alle condizioni",
          p: "Queste condizioni possono evolvere insieme al prodotto. In caso di modifiche importanti te lo comunicheremo nell'applicazione. Per qualsiasi domanda scrivi a zevo.flcs@gmail.com.",
        },
      ],
    },
    privacy: {
      title: "Informativa sulla privacy",
      updated: "Ultimo aggiornamento: luglio 2026",
      sections: [
        {
          h: "In breve",
          p: "Le tue lezioni sono tue. Raccogliamo il minimo necessario per far funzionare Forma, non vendiamo nulla a nessuno e nell'applicazione non c'è alcun tracciatore pubblicitario. La misurazione anonima del traffico si attiva solo se la accetti.",
        },
        {
          h: "Quali dati raccogliamo",
          p: "La tua email e l'identificativo dell'account con cui accedi. Il nome, il paese e il livello che indichi nell'introduzione. I documenti e le foto che carichi e il testo che ne viene estratto. Le tue conversazioni con il tutor. I voti che aggiungi nella sezione Progressi.",
        },
        {
          h: "Perché li raccogliamo",
          p: "Per analizzare i tuoi documenti e restituirti una spiegazione, per farti ritrovare la cronologia e i preferiti su tutti i tuoi dispositivi e per adattare il tono delle spiegazioni al tuo livello. Nient'altro.",
        },
        {
          h: "Come l'IA tratta i tuoi documenti",
          p: "Quando carichi un documento, il suo contenuto viene inviato al nostro fornitore di IA (Google Gemini, tramite il gateway Lovable AI) per il tempo necessario a produrre l'analisi. Questo trattamento serve solo a risponderti. I tuoi documenti non vengono usati per addestrare modelli.",
        },
        {
          h: "Base giuridica",
          p: "Trattiamo questi dati per erogare il servizio che richiedi creando un account. Puoi revocare il consenso in qualsiasi momento chiedendo la cancellazione dei tuoi documenti o del tuo account.",
        },
        {
          h: "Per quanto tempo li conserviamo",
          p: "I tuoi documenti e le tue conversazioni restano finché esiste il tuo account, così puoi ritrovarli. Per far cancellare un documento specifico o l'intero account, scrivi a zevo.flcs@gmail.com: trattiamo la richiesta entro 30 giorni e la cancellazione è definitiva.",
        },
        {
          h: "Chi può accedervi",
          p: "Tu. Ogni dato è legato al tuo account e isolato a livello di database da regole di sicurezza. Il nostro team vi accede solo se un problema tecnico lo richiede davvero.",
        },
        {
          h: "I tuoi diritti",
          p: "Hai diritto di accedere ai tuoi dati, rettificarli, cancellarli, riceverne una copia (portabilità) e opporti al trattamento. Per esercitarne uno, scrivi a zevo.flcs@gmail.com: rispondiamo entro 30 giorni.",
        },
        {
          h: "Sicurezza",
          p: "Le comunicazioni sono cifrate, l'accesso ai dati è limitato per account e i file sono raggiungibili solo tramite link firmati temporanei.",
        },
        {
          h: "Reclami",
          p: "Se una risposta non ti soddisfa, puoi rivolgerti all'autorità per la protezione dei dati del tuo paese. In Italia è il Garante per la protezione dei dati personali, su garanteprivacy.it.",
        },
      ],
    },
    cookies: {
      title: "Informativa sui cookie",
      updated: "Ultimo aggiornamento: luglio 2026",
      sections: [
        {
          h: "Cosa usiamo",
          p: "Forma usa solo cookie e memoria locale strettamente necessari al funzionamento. Nessun cookie pubblicitario, nessun tracciatore di terze parti.",
        },
        {
          h: "Restare connesso",
          p: "La tua sessione resta salvata sul dispositivo per non farti accedere a ogni visita. Senza di essa l'applicazione non può sapere che sei tu.",
        },
        {
          h: "Le tue preferenze",
          p: "Sul tuo dispositivo conserviamo anche la lingua scelta, se hai già fatto l'introduzione, e il nome e il paese che hai indicato, per personalizzare l'accoglienza.",
        },
        {
          h: "Misurazione del traffico",
          p: "Forma usa Google Analytics per contare le visite e capire quali funzioni vengono davvero usate. Si attiva solo se lo accetti quando te lo chiediamo, puoi rifiutare e l'app funziona allo stesso modo, e non vengono mai raccolti dati pubblicitari o di personalizzazione.",
        },
        {
          h: "Le tue scelte",
          p: "Puoi cancellare questi dati quando vuoi dalle impostazioni del browser. Poiché sono necessari al funzionamento, cancellarli ti disconnetterà e azzererà le tue preferenze.",
        },
      ],
    },
    contact: {
      title: "Contatti",
      subtitle: "Leggiamo ogni messaggio.",
      email: "zevo.flcs@gmail.com",
      form: {
        kinds: { general: "Parere generale", problem: "Un problema", idea: "Un'idea" },
        name: "Il tuo nome",
        email: "La tua email",
        message: "Cosa vuoi dirci?",
        send: "Invia il messaggio",
        sent: "Grazie. Ti rispondiamo molto presto.",
      },
    },
  },
};
