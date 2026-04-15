/**
 * data.js
 * Feedback Hub — Mock-Daten (API-Response-Format)
 * Gleiche Struktur wie spätere Backend-API-Responses
 */

//TODO set drivers not in data.js find an other way

//TODO date in inboxfeed should be calculated with when it got postet and not directly from the api

var MockData = (function () {

  /* ═══════════════════════════════════════════════════════
     Current User (eingeloggter Benutzer)
     ═══════════════════════════════════════════════════════ */

  var currentUser = {
    id: 'max.muster',
    name: 'Max Muster',
    initials: 'MM',
    email: 'm.muster@firma.ch',
    role: 'admin'
  };

  /* ═══════════════════════════════════════════════════════
     Users (Active Directory)
     ═══════════════════════════════════════════════════════ */

  var users = [
    { id: 'maximilian.läpple', name: 'Maximilian Läpple',  initials: 'ML', email: 'm.läpple@company.ch',  department: 'IT',        role: 'admin',   active: true,  feedbackReceived: 12, feedbackGiven: 8  },
    { id: 'anna.keller',        name: 'Anna Keller',         initials: 'AK', email: 'a.keller@company.ch',   department: 'Marketing', role: 'manager', active: true,  feedbackReceived: 24, feedbackGiven: 15 },
    { id: 'markus.huber',       name: 'Markus Huber',        initials: 'MH', email: 'm.huber@company.ch',    department: 'Finance',   role: 'user',    active: true,  feedbackReceived: 6,  feedbackGiven: 3  },
    { id: 'thomas.ruefli',      name: 'Thomas Ruefli',       initials: 'TR', email: 't.ruefli@company.ch',   department: 'Sales',     role: 'manager', active: true,  feedbackReceived: 18, feedbackGiven: 11 },
    { id: 'patrick.weber',      name: 'Patrick Weber',       initials: 'PW', email: 'p.weber@company.ch',    department: 'HR',        role: 'user',    active: false, feedbackReceived: 2,  feedbackGiven: 0  },
    { id: 'max.mustermann',     name: 'Max Mustermann',      initials: 'MM', email: 'max.m@company.ch',      department: 'Engineering', role: 'user', active: true,  feedbackReceived: 5,  feedbackGiven: 4  },
    { id: 'jana.steiner',       name: 'Jana Steiner',        initials: 'JS', email: 'j.steiner@company.ch',  department: 'Operations', role: 'user', active: true,  feedbackReceived: 3,  feedbackGiven: 2  }
  ];

  /* ═══════════════════════════════════════════════════════
     Recipients (für Feedback-Formular Dropdown)
     ═══════════════════════════════════════════════════════ */

  var recipients = [
    { value: 'maximilian.läpple', label: 'Maximilian Läpple' },
    { value: 'max.mustermann',     label: 'Max Mustermann' },
    { value: 'anna.keller',        label: 'Anna Keller' },
    { value: 'markus.huber',       label: 'Markus Huber' },
    { value: 'thomas.ruefli',      label: 'Thomas Mueller' },
    { value: 'jana.steiner',       label: 'Jana Steiner' },
    { value: 'patrick.weber',      label: 'Patrick Weber' }
  ];

  /* ═══════════════════════════════════════════════════════
     Inbox — Erhaltene Feedbacks
     ═══════════════════════════════════════════════════════ */

  var inboxAverages = {
    totalReviews: 5,
    anonymousCount: 1,
    drivers: [
      { name: 'impact',        value: 4.2, stars: 4 },
      { name: 'ownership',     value: 3.8, stars: 4 },
      { name: 'collaboration', value: 4.6, stars: 5 },
      { name: 'growth',        value: 4.0, stars: 4 }
    ]
  };

  var inboxFeedbacks = [
    {
      id: 'fb-inbox-1',
      from: { name: 'Anna Keller', initials: 'AK', anonymous: false },
      stars: 5,
      preview: 'Sehr gute Kommunikation im letzten Projekt. Hat immer proaktiv informiert und war gut erreichbar. Weiter so.',
      date: 'heute',
      unread: true,
      drivers: [
        { name: 'impact',        rating: 5, na: false },
        { name: 'ownership',     rating: 4, na: false },
        { name: 'collaboration', rating: 5, na: false },
        { name: 'growth',        rating: null, na: true }
      ],
      strengths: 'Sehr gute Kommunikation im letzten Projekt. Hat immer proaktiv informiert und war gut erreichbar. Ihre Praesentationen waren klar strukturiert und ueberzeugend vorgetragen.',
      improvements: 'Könnte in grösseren Meetings etwas mehr Raum für andere Meinungen lassen. Manchmal werden Entscheidungen etwas zu schnell getroffen ohne alle Perspektiven einzuholen.'
    },
    {
      id: 'fb-inbox-2',
      from: { name: 'Markus Huber', initials: 'MH', anonymous: false },
      stars: 4,
      preview: 'Selbständiges Arbeiten hat sich stark verbessert. Könnte noch etwas mehr auf andere zugehen bei Fragen.',
      date: 'gestern',
      unread: true,
      link: null,
      drivers: [
        { name: 'impact',        rating: 4, na: false },
        { name: 'ownership',     rating: 5, na: false },
        { name: 'collaboration', rating: null, na: true },
        { name: 'growth',        rating: 4, na: false }
      ],
      strengths: 'Selbständiges Arbeiten hat sich stark verbessert. Zuverlässig und immer gut vorbereitet.',
      improvements: 'Könnte noch etwas mehr auf andere zugehen bei Fragen. Proaktiver Austausch würde dem Team helfen.'
    },
    {
      id: 'fb-inbox-3',
      from: { name: 'Anonymes Feedback', initials: null, anonymous: true },
      stars: 5,
      preview: 'Immer hilfsbereit und offen für neue Ansätze. Macht die Zusammenarbeit wirklich angenehm.',
      date: 'Mo, 17.03.',
      unread: true,
      link: null,
      drivers: [
        { name: 'impact',        rating: null, na: true },
        { name: 'ownership',     rating: 4, na: false },
        { name: 'collaboration', rating: 5, na: false },
        { name: 'growth',        rating: 5, na: false }
      ],
      strengths: 'Immer hilfsbereit und offen für neue Ansätze. Macht die Zusammenarbeit wirklich angenehm.',
      improvements: 'Mehr Fokus auf Impact-getriebene Resultate wäre wünschenswert.'
    }
  ];

  /* ═══════════════════════════════════════════════════════
     History — Gesendete Feedbacks
     ═══════════════════════════════════════════════════════ */

  var historyFeedbacks = [
    {
      id: 1,
      to: { name: 'Anna Keller', initials: 'AK' },
      submittedAt: 'LIVE_TIMER',
      dateLabel: 'Heute',
      visibility: 'named',
      edited: false,
      locked: false,
      avatarStyle: null,
      drivers: [
        { name: 'impact',        rating: 4, na: false },
        { name: 'ownership',     rating: 5, na: false },
        { name: 'collaboration', rating: null, na: true },
        { name: 'growth',        rating: 3, na: false }
      ],
      strengths: 'Sehr gute Kommunikation im letzten Projekt. Hat immer proaktiv informiert und war gut erreichbar. Ihre Präsentationen waren klar strukturiert und ueberzeugend vorgetragen.',
      improvements: 'Könnte in grösseren Meetings etwas mehr Raum für andere Meinungen lassen. Manchmal werden Entscheidungen etwas zu schnell getroffen ohne alle Perspektiven einzuholen.'
    },
    {
      id: 2,
      to: { name: 'Luca Schmid', initials: 'LS' },
      submittedAt: '2026-04-01T09:12:00',
      dateLabel: 'Heute, 09:12',
      visibility: 'named',
      edited: true,
      locked: true,
      avatarStyle: 'background: rgba(255, 107, 0, 0.12); color: var(--color-orange);',
      drivers: [
        { name: 'impact',        rating: 5, na: false },
        { name: 'ownership',     rating: 4, na: false },
        { name: 'collaboration', rating: 4, na: false },
        { name: 'growth',        rating: null, na: true }
      ],
      strengths: 'Zuverlässige Lieferung aller Arbeitspakete, immer pünktlich und in guter Qualität. Seine Code-Reviews sind besonders wertvoll für das Team.',
      improvements: 'Dokumentation könnte ausführlicher sein. Manchmal sind Zusammenhänge im Code nicht sofort nachvollziehbar für neue Teammitglieder.'
    },
    {
      id: 3,
      to: { name: 'Maria Fischer', initials: null },
      submittedAt: '2026-03-28T14:33:00',
      dateLabel: '28. März 2026',
      visibility: 'anon',
      edited: false,
      locked: true,
      avatarStyle: 'background: rgba(255, 255, 255, 0.04); color: var(--color-text-faint);',
      drivers: [
        { name: 'impact',        rating: 3, na: false },
        { name: 'ownership',     rating: 4, na: false },
        { name: 'collaboration', rating: null, na: true },
        { name: 'growth',        rating: null, na: true }
      ],
      strengths: 'Bringt immer neue Ideen ein und ist bereit, Verantwortung zu übernehmen. Ihre Arbeitsweise ist strukturiert und vorausschauend geplant.',
      improvements: 'Zeitmanagement bei parallelen Projekten könnte verbessert werden. Prioritäten sind manchmal nicht klar kommuniziert.'
    },
    {
      id: 4,
      to: { name: 'Thomas Huber', initials: 'TH' },
      submittedAt: '2026-03-15T11:05:00',
      dateLabel: '15. März 2026',
      visibility: 'named',
      edited: false,
      locked: true,
      avatarStyle: 'background: rgba(34, 197, 94, 0.12); color: var(--color-success);',
      drivers: [
        { name: 'impact',        rating: 5, na: false },
        { name: 'ownership',     rating: 5, na: false },
        { name: 'collaboration', rating: 4, na: false },
        { name: 'growth',        rating: 4, na: false }
      ],
      strengths: 'Hervorragender Teamplayer mit einem sehr guten technischen Verständnis. Löst komplexe Probleme selbständig und bringt das Team auf ein höheres Niveau.',
      improvements: 'Könnte seine Erkenntnisse noch besser mit dem Rest des Teams teilen. Wissenstransfer wäre ein wertvolles Ziel für die kommenden Monate.'
    }
  ];

  /* ═══════════════════════════════════════════════════════
     Feedback Form — Driver Definitions
     ═══════════════════════════════════════════════════════ */

  var driverDefinitions = [
    { key: 'impact',        number: '01', i18nKey: 'driver.impact',        prefix: 'imp' },
    { key: 'ownership',     number: '02', i18nKey: 'driver.ownership',     prefix: 'own' },
    { key: 'collaboration', number: '03', i18nKey: 'driver.collaboration', prefix: 'col' },
    { key: 'growth',        number: '04', i18nKey: 'driver.growth',        prefix: 'gro' }
  ];


  /* ═══════════════════════════════════════════════════════
     Admin — Dashboard
     ═══════════════════════════════════════════════════════ */

  var adminStats = {
    totalFeedbacks: 86,
    totalUsers: 35
  };

  var adminKpis = [
    { number: '86',                  label: 'Feedbacks gesamt',  trend: '+12 diesen Monat', trendType: 'up' },
    { number: '36', unit: '%',       label: 'Anonyme Quote',     trend: '31 von 86',        trendType: 'neutral' },
    { number: '3.7',                 label: '\u00D8 Bewertung',  trend: '+0.2 vs. Vormonat', trendType: 'up' },
    { number: '14',                  label: 'Bearbeitet',        trend: '16% aller Feedbacks', trendType: 'neutral' }
  ];

  //TODO both labels (Öffentlich / Anonym) need to switch language
  //Look for some ideas to solve this

  var adminChartActivity = {
    labels: ['Okt', 'Nov', 'Dez', 'Jan', 'Feb', 'Mär'],
    datasets: [
      { label: 'Öffentlich', data: [8, 11, 7, 10, 9, 10] },
      { label: 'Anonym',         data: [3, 5, 4, 6, 5, 8] }
    ]
  };

  var adminChartVisibility = {
    labels: ['Öffentlich', 'Anonym'],
    data: [55, 31]
  };

  var adminDriverAverages = [
    { name: 'impact',        value: 3.8, pct: 76 },
    { name: 'ownership',     value: 4.2, pct: 84 },
    { name: 'collaboration', value: 3.5, pct: 70 },
    { name: 'growth',        value: 3.2, pct: 64 }
  ];

  var adminDepartments = [
    { name: 'Engineering',  count: 28, pct: 100 },
    { name: 'Marketing',    count: 19, pct: 68 },
    { name: 'Sales',        count: 15, pct: 54 },
    { name: 'Operations',   count: 12, pct: 43 },
    { name: 'HR / Finance', count: 12, pct: 43 }
  ];

  var adminSystemStatus = [
    {
      dot: 'active',
      title: 'AD Sync',
      details: ['Letzter Sync: Heute, 02:00 UTC', 'Nächster Sync: Morgen, 02:00 UTC', '35 User synchronisiert']
    },
    {
      dot: 'active',
      title: 'E-Mail Benachrichtigungen',
      details: ['84 von 86 zugestellt', '2 ausstehend', 'Letzte: vor 3 Stunden']
    },
    {
      dot: 'warning',
      title: 'Retention Policy',
      details: ['Aufbewahrung: 3 Jahre (aktiv)', '2 User im 12-Mt. Countdown', '1 Feedback unter <span class="hl-badge">Legal Hold</span>']
    }
  ];

  /* ═══════════════════════════════════════════════════════
     Admin — Moderation
     ═══════════════════════════════════════════════════════ */

  var moderationStats = [
    { number: 3,  label: 'Offene Meldungen', color: '#E52620' },
    { number: 7,  label: 'In Prüfung',  color: '#FF6B00' },
    { number: 42, label: 'Erledigt',          color: '#22c55e' }
  ];

  var moderationReports = [
    {
      id: '#FB-0486',
      von: 'Anna Keller',    vonInitials: 'AK',
      an: 'Markus Huber',    anInitials: 'MH',
      datum: '28.03.2026',
      typ: 'Öffentlich',
      rating: '3.8',
      statusLabel: 'Gemeldet',
      statusClass: 'flagged',
      reason: 'Das Feedback enthält abwertende Formulierungen über meine persönliche Arbeitsweise, die ich als unangemessen und diskriminierend empfinde. Es überschreitet die Grenzen konstruktiver Kritik.',
      strengths: 'Anna bringt sehr viel Energie und Engagement in jedes Projekt. Sie kommuniziert proaktiv und sorgt dafür, dass alle Beteiligten gut informiert sind. Ihre Präsentationen sind klar strukturiert.',
      improvements: 'Manchmal werden Entscheidungen ohne ausreichende Rücksprache getroffen. Es wäre hilfreich, bei wichtigen Entscheidungen mehr Stimmen einzuholen und den Prozess transparenter zu gestalten.',
      drivers: 'Impact/Results: ★★★★☆ (3.8) | Ownership/Reliability: ★★★★☆ (4.0) | Collaboration/Social: ★★★☆☆ (3.2) | Growth/Learning: N/A'
    },
    {
      id: '#FB-0451',
      von: 'Thomas Bauer',   vonInitials: 'TB',
      an: 'Sandra Meier',    anInitials: 'SM',
      datum: '21.03.2026',
      typ: 'Öffentlich',
      rating: '2.5',
      statusLabel: 'In Prüfung',
      statusClass: 'pending',
      reason: 'Der Absender hat mehrfach ähnliche negative Bewertungen an mich gesendet. Ich vermute, dass dies gezielte Belästigung ist und nicht konstruktives Feedback.',
      strengths: 'Sandra zeigt Einsatz und ist immer pünktlich. Sie erledigt ihre Aufgaben zuverlässig.',
      improvements: 'Die Kommunikation mit Kollegen ist schwierig. Oft werden Meetings ohne Vorwarnung abgesagt und Deadlines nicht eingehalten. Es fehlt an Eigeninitiative.',
      drivers: 'Impact/Results: ★★☆☆☆ (2.0) | Ownership/Reliability: ★★★☆☆ (3.0) | Collaboration/Social: ★★☆☆☆ (2.5) | Growth/Learning: ★★★☆☆ (3.0)'
    },
    {
      id: '#FB-0412',
      von: 'Anonym',          vonInitials: '?',
      an: 'Lukas Weber',     anInitials: 'LW',
      datum: '14.03.2026',
      typ: 'Anonym',
      rating: '1.5',
      statusLabel: 'Erledigt',
      statusClass: 'resolved',
      reason: 'Das anonyme Feedback enthält Aussagen die trotz Anonymität auf eine bestimmte Person hindeuten. Ausserdem enthält es beleidigende Formulierungen.',
      strengths: '-',
      improvements: 'Die Arbeitsqualität lässt stark zu wünschen übrig. Aufgaben werden nicht zu Ende gebracht und das Team muss ständig nachfragen. Das ist für alle frustrierend.',
      drivers: 'Impact/Results: ★☆☆☆☆ (1.0) | Ownership/Reliability: ★★☆☆☆ (2.0) | Collaboration/Social: ★★☆☆☆ (2.0) | Growth/Learning: N/A'
    }
  ];

  /* ═══════════════════════════════════════════════════════
     Department — Team-Feedback-Verlauf (Manager-Ansicht)
     ═══════════════════════════════════════════════════════ */

  var departmentTeam = [
    {
      id: 'markus.huber',
      name: 'Markus Huber',
      initials: 'MH',
      role: 'user',
      department: 'IT',
      feedbacks: [
        {
          id: 'fb-mh-1',
          anonymous: false,
          fromName: 'Anna Keller',
          fromInitials: 'AK',
          date: '08.04.2026',
          drivers: [
            { name: 'impact',        rating: 4, na: false },
            { name: 'ownership',     rating: 5, na: false },
            { name: 'collaboration', rating: 3, na: false },
            { name: 'growth',        rating: null, na: true }
          ],
          strengths: 'Markus liefert konstant gute Ergebnisse und übernimmt zuverlässig Verantwortung für seine Aufgaben. Seine technische Kompetenz ist beeindruckend und er findet oft effiziente Lösungen.',
          improvements: 'Könnte in Team-Meetings aktiver kommunizieren und seine Ideen früher einbringen. Manchmal arbeitet er zu isoliert, statt früh Feedback von Kollegen einzuholen.'
        },
        {
          id: 'fb-mh-2',
          anonymous: true,
          fromName: null,
          fromInitials: null,
          date: '21.03.2026',
          drivers: [
            { name: 'impact',        rating: 3, na: false },
            { name: 'ownership',     rating: 4, na: false },
            { name: 'collaboration', rating: null, na: true },
            { name: 'growth',        rating: 4, na: false }
          ],
          strengths: 'Zeigt eine hohe Lernbereitschaft und entwickelt sich kontinuierlich weiter. Nimmt Feedback gut an und setzt es konsequent um.',
          improvements: 'Die Arbeitsgeschwindigkeit könnte bei komplexeren Aufgaben noch etwas gesteigert werden. Priorisierung zwischen mehreren Projekten fällt manchmal schwer.'
        },
        {
          id: 'fb-mh-3',
          anonymous: false,
          fromName: 'Thomas Ruefli',
          fromInitials: 'TR',
          date: '05.03.2026',
          drivers: [
            { name: 'impact',        rating: 5, na: false },
            { name: 'ownership',     rating: 4, na: false },
            { name: 'collaboration', rating: 4, na: false },
            { name: 'growth',        rating: 3, na: false }
          ],
          strengths: 'Exzellente Problemlösungsfähigkeiten. Hat beim letzten Sprint die kritischsten Bugs identifiziert und eigenstaendig geloest. Sehr zuverlaessig bei Deadlines.',
          improvements: 'Könnte mehr Initiative zeigen, Wissen mit Junior-Kollegen zu teilen. Dokumentation der eigenen Arbeit ist manchmal lückenhaft.'
        }
      ]
    },
    {
      id: 'jana.steiner',
      name: 'Jana Steiner',
      initials: 'JS',
      role: 'user',
      department: 'IT',
      feedbacks: [
        {
          id: 'fb-js-1',
          anonymous: true,
          fromName: null,
          fromInitials: null,
          date: '10.04.2026',
          drivers: [
            { name: 'impact',        rating: 2, na: false },
            { name: 'ownership',     rating: 3, na: false },
            { name: 'collaboration', rating: 2, na: false },
            { name: 'growth',        rating: null, na: true }
          ],
          strengths: 'Jana ist immer freundlich und offen im Umgang mit dem Team. Sie bringt eine positive Energie in den Arbeitsalltag.',
          improvements: 'Die Qualität der Arbeitsergebnisse muss sich deutlich verbessern. Aufgaben werden oft unvollständig abgegeben und erfordern umfangreiche Nacharbeit durch Kollegen.'
        },
        {
          id: 'fb-js-2',
          anonymous: false,
          fromName: 'Markus Huber',
          fromInitials: 'MH',
          date: '28.02.2026',
          drivers: [
            { name: 'impact',        rating: 3, na: false },
            { name: 'ownership',     rating: 3, na: false },
            { name: 'collaboration', rating: 4, na: false },
            { name: 'growth',        rating: 3, na: false }
          ],
          strengths: 'Gute Teamplayerin, die sich aktiv in Diskussionen einbringt. Hat sich in den letzten Monaten bei der Zusammenarbeit deutlich verbessert.',
          improvements: 'Sollte mehr Eigeninitiative bei der Lösung von Problemen zeigen, anstatt sofort nach Hilfe zu fragen. Zeitmanagement könnte strukturierter sein.'
        }
      ]
    },
    {
      id: 'max.mustermann',
      name: 'Max Mustermann',
      initials: 'MM',
      role: 'user',
      department: 'IT',
      feedbacks: [
        {
          id: 'fb-mm-1',
          anonymous: false,
          fromName: 'Jana Steiner',
          fromInitials: 'JS',
          date: '01.04.2026',
          drivers: [
            { name: 'impact',        rating: 5, na: false },
            { name: 'ownership',     rating: 5, na: false },
            { name: 'collaboration', rating: 4, na: false },
            { name: 'growth',        rating: 5, na: false }
          ],
          strengths: 'Max ist ein absoluter Leistungsträger. Seine Arbeit ist immer von hoechster Qualität, und er übernimmt proaktiv Verantwortung für schwierige Aufgaben. Inspiriert das Team mit seinem Einsatz.',
          improvements: 'Kännte manchmal etwas geduldiger mit weniger erfahrenen Kollegen sein. Bei Codereviews wäre ein etwas konstruktiverer Ton hilfreich.'
        }
      ]
    }
  ];

  /* ═══════════════════════════════════════════════════════
     Public API
     ═══════════════════════════════════════════════════════ */

  return {
    currentUser:          currentUser,
    users:                users,
    recipients:           recipients,
    inboxAverages:        inboxAverages,
    inboxFeedbacks:       inboxFeedbacks,
    historyFeedbacks:     historyFeedbacks,
    driverDefinitions:    driverDefinitions,
    adminStats:           adminStats,
    adminKpis:            adminKpis,
    adminChartActivity:   adminChartActivity,
    adminChartVisibility: adminChartVisibility,
    adminDriverAverages:  adminDriverAverages,
    adminDepartments:     adminDepartments,
    adminSystemStatus:    adminSystemStatus,
    moderationStats:      moderationStats,
    moderationReports:    moderationReports,
    departmentTeam:       departmentTeam
  };

})();
