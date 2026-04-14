/**
 * i18n.js
 * Feedback Hub — Internationalisierung (DE / EN)
 * Muss VOR allen anderen Scripts geladen werden.
 *
 * Verwendung:
 *   I18n.t('key')            → übersetzten String zurückgeben
 *   I18n.setLang('en')       → Sprache wechseln + Seite neu laden
 *   I18n.apply()             → alle data-i18n Attribute im DOM aktualisieren
 */

var I18n = (function () {

  /* ═══════════════════════════════════════════════════════
     Translations
     ═══════════════════════════════════════════════════════ */

  var translations = {

    de: {

      /* ─── Navbar ──────────────────────────────────────── */
      'nav.inbox':            'Inbox',
      'nav.feedback':         'Feedback geben',
      'nav.history':          'Verlauf',
      'nav.department':       'Abteilung',
      'nav.admin':            'Admin',

      /* ─── Profil-Dropdown ─────────────────────────────── */
      'profile.logout':       'Abmelden',
      'profile.language':     'Sprache',

      /* ─── index.html ──────────────────────────────────── */
      'inbox.title':          'Inbox',
      'inbox.subtitle':       'Feedback das du erhalten hast',
      'inbox.avg_title':      'Durchschnittliche Bewertungen',
      'inbox.reviews':        'Bewertung',
      'inbox.anonymous':      'Anonym',
      'inbox.warning':        '⚠ Durchschnittswerte sind ein Richtwert und kein abschliessendes Urteil.',
      'inbox.strengths':      'Stärken',
      'inbox.improvements':   'Verbesserungsbereiche',
      'inbox.detail_hint':    'Klicken zum Aufklappen',
      'inbox.unread_badge':   'Neu',
      'inbox.areas_improve':  'Verbesserungsbereiche',

      /* ─── history.html ────────────────────────────────── */
      'history.title':              'Verlauf',
      'history.subtitle':           'Feedbacks die du gesendet hast',
      'history.count':              'gesendet',
      'history.toast_saved':        'Änderungen gespeichert',
      'history.edit_btn':           'Bearbeiten',
      'history.edit_title':         'Feedback Bearbeiten',
      'history.save_btn':           'Speichern',
      'history.recipient':          'An',
      'history.anonymous':          'Anonym',
      'history.public':             'Namentlich',
      'history.locked':             '🔒 Gesperrt',
      'history.status_edited':      'Bearbeitet',
      'history.editable':           'Noch bearbeitbar',
      'history.edit_ratings':       'Bewertungen bearbeiten',
      'history.edit_strenghts':     'Stärken bearbeiten',
      'history.edit_improvements':  'Verbesserungsvorschläge bearbeiten',
      'history.cancel':             'Abbrechen',
      'history.strenghts':          'Stärken',
      'history.improvements':       'Verbesserungsvorschläge',

      /* ─── feedback.html ───────────────────────────────── */
      'feedback.title':                   'Feedback',
      'feedback.subtitle':                'Feedback einreichen — wähle eine Person und bewerte sie in den vier Drivers.',
      'feedback.section_recipient':       'Empfänger',
      'feedback.recipient_label':         'Mitarbeiter aus dem Active Directory',
      'feedback.recipient_placeholder':   'Person auswählen…',
      'feedback.section_visibility':      'Sichtbarkeit',
      'feedback.visibility_intro':        'Wähle, ob dein Feedback namentlich oder anonym eingereicht wird.',
      'feedback.vis_public':              'Namentlich',
      'feedback.vis_public_sub':          'Dein Name ist für den Empfänger sichtbar.',
      'feedback.vis_private':             'Anonym',
      'feedback.vis_private_sub':         'Dein Name wird nicht angezeigt.',
      'feedback.anon_understood':         'Du hast ausgewaehlt, Feedback anonym einzureichen. Bitte stelle sicher, dass deine Kommentare keine persönlichen Identifikatoren, spezifischen Projektnamen oder Sprachhinweise enthalten, die deine Identität offenbaren könnten. Achte darauf, was du schreibst und welche Sprache du wählst, um echte Anonymität zu gewährleisten. Konzentriere dein Feedback auf Impact, Reliability, Collaboration und Learning, anstatt auf Einzelpersonen, Daten oder Orte zu verweisen.\n',
      'feedback.rate_limit':              'Du hast dieser Person bereits Feedback gegeben. Nächstes Feedback möglich in:',
      'feedback.section_drivers':         'Performance Drivers',
      'feedback.drivers_intro':           'Bewerte in mindestens 2 von 4 Bereichen. Nicht zutreffende Bereiche mit N/A markieren.',
      'feedback.validation_drivers':      'Mindestens 2 Drivers müssen bewertet werden.',
      'feedback.section_text':            'Freitext',
      'feedback.strengths_label':         'Stärken',
      'feedback.strengths_hint':          'optional',
      'feedback.strengths_placeholder':   'Beschreibe konkrete Stärken und positives Verhalten...',
      'feedback.improvements_label':      'Verbesserungsbereiche',
      'feedback.improvements_hint':       'optional',
      'feedback.improvements_placeholder':'Beschreibe Bereiche mit Entwicklungspotenzial…',
      'feedback.validation_text':         '⚠ Mindestens ein Feld muss mit 200+ Zeichen ausgefüllt werden.',
      'feedback.section_coc':             'Code of Conduct',
      'feedback.coc_intro':               'Mit dem Absenden bestätigst du die Einhaltung des folgenden Verhaltenskodex:',
      'feedback.coc_accept':              'Ich akzeptiere den',
      'feedback.coc_link':                'Code of Conduct',
      'feedback.submit_btn':              'Feedback absenden →',
      'feedback.submit_hint':             'Einmal abgesendet, ist das Feedback endgültig. Du hast 5 Minuten um Tippfehler zu korrigieren.',
      'feedback.toast_submitted':         'Feedback erfolgreich eingereicht',
      'feedback.anon_warning_text':       'Du hast ausgewählt, Feedback anonym einzureichen. Bitte stelle sicher, dass deine Kommentare keine persönlichen Identifikatoren, spezifischen Projektnamen oder Sprachhinweise enthalten, die deine Identität offenbaren könnten. Achte darauf, was du schreibst und welche Sprache du wählst, um echte Anonymität zu gewährleisten. Konzentriere dein Feedback auf Impact, Reliability, Collaboration und Learning, anstatt auf Einzelpersonen, Daten oder Orte zu verweisen.',
      'feedback.anon_confirm':            'Ich habe gelesen und verstanden',
      'feedback.rate_limit_text':         'Anonymes Feedback kann von einer Person pro Jahr genau 1x an dieselbe Person gesendet werden.',
      'feedback.section_rating':          'Bewertung',
      'feedback.text_intro':              'Mindestens eines der beiden Felder muss ausgefüllt werden (min. 200 Zeichen).',
      'feedback.char_min':                ' / 200 Zeichen min.',
      'feedback.coc.items': [
                                          'Respektvolle Sprache — Feedback muss professionell, höflich und respektvoll sein. Vermeide beleidigende, diskriminierende oder provokante Sprache. Konzentriere dich auf Beobachtungen und Verhaltensweisen, nicht auf Beleidigungen oder persönliche Angriffe.',
                                          'Keine Vergeltung — Feedback darf nie als Werkzeug für Bestrafung, Rache oder Bloßstellung eingesetzt werden. Die Plattform dient der Entwicklung und dem Wachstum, nicht der Vergeltung.',
                                          'Anonymitätsbewusstsein — Wenn du Feedback anonym einreichst, stelle sicher, dass deine Kommentare keine identifizierbaren Details wie Namen, Projekte, Orte oder Sprachhinweise enthalten, die deine Identität preisgeben könnten. Schreibe stets mit Blick auf den Datenschutz.',
                                          'Fokus auf Verhalten und Wirkung, nicht auf Persönlichkeit — Kommentare sollen aufzeigen, was jemand tut und welche Wirkung das hat, anstatt über Persönlichkeit, Motive oder Charaktereigenschaften zu spekulieren.',
                                          'Ehrlichkeit und Genauigkeit — Gib wahrheitsgemässes Feedback basierend auf deinen eigenen direkten Beobachtungen. Vermeide Übertreibungen, Annahmen oder Hörensagen. Konstruktives Feedback ist nur dann wertvoll, wenn es die Realität widerspiegelt.',
                                          'Vertraulichkeit und Datennutzung — Feedback ist ausschliesslich für den Empfänger und dessen direkten Vorgesetzten bestimmt. Teile es nicht ausserhalb der Plattform, besprich es nicht mit Kollegen und nutze es nicht für Klatsch oder die Beurteilung anderer.',
                                          'Nur konstruktive Kritik — Wenn du Verbesserungsbereiche ansprichst, verbinde deine Beobachtungen mit konkreten Vorschlägen oder Beispielen. Vermeide vage oder rein negative Aussagen.',
                                          'Einhaltung der Unternehmensrichtlinien — Jedes Feedback muss den HR-Richtlinien, ethischen Grundsätzen und rechtlichen Verpflichtungen des Unternehmens entsprechen. Vermeide Aussagen, die gegen diese Regeln verstossen könnten.',
                                          'Plattform-Etikette / Kein Bewertungsmissbrauch — Fülle dein Feedback gewissenhaft aus. Verfälsche Bewertungen nicht absichtlich nach oben oder unten, lasse Felder nicht absichtlich leer und hinterlasse keine nichtssagenden Kommentare. Bewertungen sollen eine ehrliche Einschätzung widerspiegeln.',
      ],

      /* ─── department.html ─────────────────────────────── */
      'dept.title':             'Abteilung',
      'dept.subtitle':          'Team-Feedback-Verlauf',
      'dept.role_badge':        'Abteilungsleiter',
      'dept.disclaimer':        'Durchschnittswerte sind ein Orientierungswert und kein abschliessendes Urteil. Individuelle Feedbacks sind aus Datenschutzgründen (DSG\u00a0/\u00a0DSGVO) nicht einsehbar.',
      'dept.drawer_disclaimer': 'Individuelle Feedbacks sind aus Datenschutzgründen nicht einsehbar.',
      'dept.low_warning':       'Zu wenig Bewertungen für aussagekräftige Durchschnittswerte.',
      'dept.no_feedback':       'Noch kein Feedback erhalten.',
      'dept.stat_reviews':      'Feedbacks',
      'dept.stat_avg':          'Ø Gesamt',
      'dept.section_drivers':   'Driver-Bewertungen',
      'dept.section_history':   'Feedback-Verlauf',
      'dept.from':              'Von',
      'dept.no_members':        'Keine Teammitglieder gefunden.',
      'dept.avg_hint_singular': 'Durchschnitt basiert auf <strong>{n}</strong> Bewertung. Diese Werte spiegeln möglicherweise nicht das vollständige Feedback wider.',
      'dept.avg_hint_plural':   'Durchschnitt basiert auf <strong>{n}</strong> Bewertungen. Diese Werte spiegeln möglicherweise nicht das vollständige Feedback wider.',
      'dept.no_ratings':        'Noch keine Bewertungen vorhanden.',
      'dept.anon_feedback':     'Anonymes Feedback',
      'dept.anonymous':         'Anonym',
      'dept.strengths_label':   'Stärken',
      'dept.improvements_label':'Verbesserungsbereiche',
      'dept.total_avg':         'Gesamt \u00D8',
      'dept.few_ratings':       'Wenige Bewertungen',
      'dept.avg_per_driver':    'Durchschnitt pro Driver',

      /* ─── admin.html ──────────────────────────────────── */
      'admin.title':            'Administration',
      'admin.role_badge':       'Admin',
      'admin.section_stats':    'Statistiken',
      'admin.section_activity': 'Aktivität',
      'admin.section_users':    'Benutzer',
      'admin.section_coc':      'CoC-Meldungen',
      'admin.total_feedback':   'Feedbacks Total',
      'admin.total_users':      'Benutzer',
      'admin.anonymous_rate':   'Anonym-Quote',
      'admin.avg_rating':       'Ø Bewertung',

      /* ─── Drivers (hardcoded in JS) ───────────────────── */
      'driver.impact':          'Impact & Results',
      'driver.ownership':       'Ownership & Reliability',
      'driver.collaboration':   'Collaboration & Social',
      'driver.growth':          'Growth & Learning',

      /* ─── Allgemein ───────────────────────────────────── */
      'common.na':              'N/A',
      'common.anonymous':       'Anonym',
      'common.public':          'Namentlich',
      'common.loading':         'Laden…',
      'common.error':           'Fehler',
      'common.save':            'Speichern',
      'common.cancel':          'Abbrechen',
      'common.close':           'Schliessen',
    },

    en: {

      /* ─── Navbar ──────────────────────────────────────── */
      'nav.inbox':            'Inbox',
      'nav.feedback':         'Give Feedback',
      'nav.history':          'History',
      'nav.department':       'Department',
      'nav.admin':            'Admin',

      /* ─── Profil-Dropdown ─────────────────────────────── */
      'profile.logout':       'Sign out',
      'profile.language':     'Language',

      /* ─── index.html ──────────────────────────────────── */
      'inbox.title':          'Inbox',
      'inbox.subtitle':       'Feedback you have received',
      'inbox.avg_title':      'Average Ratings',
      'inbox.reviews':        'Feedbacks',
      'inbox.anonymous':      'Anonymous',
      'inbox.warning':        '⚠ Averages are indicative and not a final assessment.',
      'inbox.strengths':      'Strengths',
      'inbox.improvements':   'Areas to Improve',
      'inbox.detail_hint':    'Click to expand',
      'inbox.unread_badge':   'New',
      'inbox.areas_improve':  'Areas to Improve',

      /* ─── history.html ────────────────────────────────── */
      'history.title':              'History',
      'history.subtitle':           'Feedback you have sent',
      'history.count':              'sent',
      'history.toast_saved':        'Changes saved',
      'history.edit_btn':           'Edit',
      'history.edit_title':         'Edit feedback',
      'history.save_btn':           'Save',
      'history.recipient':          'To',
      'history.anonymous':          'Anonymous',
      'history.public':             'Named',
      'history.locked':             '🔒 Locked',
      'history.status_edited':      'Edited',
      'history.editable':           'Still editable',
      'history.edit_ratings':       'Edit review',
      'history.edit_strenghts':     'Edit strenghts',
      'history.edit_improvements':  'Edit Areas to Improve',
      'history.cancel':             'Cancel',
      'history.strenghts':          'Strenghts',
      'history.improvements':       'Areas to Improve',

      /* ─── feedback.html ───────────────────────────────── */
      'feedback.title':                     'Feedback',
      'feedback.subtitle':                  'Submit feedback — select a person and rate them across the four drivers.',
      'feedback.section_recipient':         'Recipient',
      'feedback.recipient_label':           'Employee from Active Directory',
      'feedback.recipient_placeholder':     'Select a person…',
      'feedback.section_visibility':        'Visibility',
      'feedback.visibility_intro':          'Choose whether your feedback is submitted with your name or anonymously.',
      'feedback.vis_public':                'Named',
      'feedback.vis_public_sub':            'Your name is visible to the recipient.',
      'feedback.vis_private':               'Anonymous',
      'feedback.vis_private_sub':           'Your name will not be shown.',
      'feedback.anon_understood':           'You have chosen to submit feedback anonymously. Please ensure your comments do not contain personal identifiers, specific project names, or linguistic cues that could reveal your identity. Be mindful of what you write and the language you choose to ensure true anonymity. Focus your feedback on Impact, Reliability, Collaboration and Learning, rather than referencing specific individuals, dates or locations.',
      'feedback.rate_limit':                'You have already given feedback to this person. Next feedback possible in:',
      'feedback.section_drivers':           'Performance Drivers',
      'feedback.drivers_intro':             'Rate at least 2 of 4 areas. Mark areas that do not apply as N/A.',
      'feedback.validation_drivers':        'At least 2 drivers need to be reviewed',
      'feedback.section_text':              'Actionable Feedback',
      'feedback.strengths_label':           'Strengths',
      'feedback.strengths_hint':            'optional',
      'feedback.strengths_placeholder':     'Describe specific strengths and positive behaviour…',
      'feedback.improvements_label':        'Areas to Improve',
      'feedback.improvements_hint':         'optional',
      'feedback.improvements_placeholder':  'Describe areas with development potential…',
      'feedback.validation_text':           '⚠ At least one field must contain 200+ characters.',
      'feedback.section_coc':               'Code of Conduct',
      'feedback.coc_intro':                 'By submitting this feedback you confirm adherence to the following:',
      'feedback.coc_accept':                'I accept the',
      'feedback.coc_link':                  'Code of Conduct',
      'feedback.submit_btn':                'Submit Feedback →',
      'feedback.submit_hint':               'Once submitted, feedback is final. You have 5 minutes to correct typos.',
      'feedback.toast_submitted':           'Feedback successfully submitted',
      'feedback.anon_warning_text':         'You have chosen to submit feedback anonymously. Please ensure your comments do not contain personal identifiers, specific project names, or linguistic cues that could reveal your identity. Be mindful of what you write and the language you choose to ensure true anonymity. Focus your feedback on Impact, Reliability, Collaboration and Learning, rather than referencing specific individuals, dates or locations.',
      'feedback.anon_confirm':              'I have read and understood',
      'feedback.rate_limit_text':           'Anonymous feedback can be sent to the same person exactly once per year.',
      'feedback.section_rating':            'Rating',
      'feedback.text_intro':                'At least one of the two fields must be filled in (min. 200 characters).',
      'feedback.char_min':                  ' / 200 chars min.',
      'feedback.coc.items': [
                                            'Respectful Language Only — All feedback must be professional, courteous, and respectful. Avoid offensive, discriminatory, or inflammatory language. Focus on observations and behaviors, not insults or personal attacks.',
                                            'No Retaliation — Feedback must never be used as a tool for punishment, revenge, or embarrassment. The platform exists for growth and development, not for retribution.',
                                            'Anonymity Awareness — If submitting feedback anonymously, ensure your comments do not include identifiable details such as names, projects, locations, or language cues that could reveal your identity. Always write with privacy in mind.',
                                            'Focus on Behaviors and Impact, Not Personality — Comments should highlight what someone dös and the effect it has, rather than speculating about personality, motives, or character traits.',
                                            'Honesty and Accuracy — Provide truthful feedback based on your direct observations. Avoid exaggerations, assumptions, or hearsay. Constructive feedback is valuable only if it reflects reality.',
                                            'Confidentiality and Data Use — Feedback is intended only for the recipient and their direct manager. Do not share it outside the platform, discuss it with colleagues, or use it as material for gossip or evaluation of others.',
                                            'Constructive Criticism Only — When pointing out areas for improvement, pair your observations with actionable suggestions or specific examples. Avoid vague or purely negative statements.',
                                            'Compliance with Company Policies — All feedback must comply with the company\'s HR policies, ethics, and legal obligations. Avoid references or statements that could violate these rules.',
                                            'Platform Etiquette / Avoid Rating Abuse — Complete your feedback sincerely. Do not artificially inflate or deflate scores, leave empty ratings intentionally, or provide meaningless comments. Ratings should reflect honest evaluation.'
      ],

      /* ─── department.html ─────────────────────────────── */
      'dept.title':             'Department',
      'dept.subtitle':          'Team Feedback History',
      'dept.role_badge':        'Department Manager',
      'dept.disclaimer':        'Averages are indicative and not a final assessment. Individual feedback is not visible for privacy reasons (DSG\u00a0/\u00a0GDPR).',
      'dept.drawer_disclaimer': 'Individual feedback is not visible for privacy reasons.',
      'dept.low_warning':       'Not enough ratings for meaningful averages.',
      'dept.no_feedback':       'No feedback received yet.',
      'dept.stat_reviews':      'Feedbacks',
      'dept.stat_avg':          'Ø Overall',
      'dept.section_drivers':   'Driver Ratings',
      'dept.section_history':   'Feedback History',
      'dept.from':              'From',
      'dept.no_members':        'No team members found.',
      'dept.avg_hint_singular': 'Average based on <strong>{n}</strong> rating. These values may not reflect the complete feedback.',
      'dept.avg_hint_plural':   'Average based on <strong>{n}</strong> ratings. These values may not reflect the complete feedback.',
      'dept.no_ratings':        'No ratings available yet.',
      'dept.anon_feedback':     'Anonymous Feedback',
      'dept.anonymous':         'Anonymous',
      'dept.strengths_label':   'Strenghts',
      'dept.improvements_label':'Areas to Improve',
      'dept.total_avg':         'Overall \u00D8',
      'dept.few_ratings':       'Few Ratings',
      'dept.avg_per_driver':    'Average per Driver',

      /* ─── admin.html ──────────────────────────────────── */
      'admin.title':            'Administration',
      'admin.role_badge':       'Admin',
      'admin.section_stats':    'Statistics',
      'admin.section_activity': 'Activity',
      'admin.section_users':    'Users',
      'admin.section_coc':      'CoC Reports',
      'admin.total_feedback':   'Total Feedback',
      'admin.total_users':      'Users',
      'admin.anonymous_rate':   'Anonymous Rate',
      'admin.avg_rating':       'Ø Rating',

      /* ─── Drivers ─────────────────────────────────────── */
      'driver.impact':          'Impact & Results',
      'driver.ownership':       'Ownership & Reliability',
      'driver.collaboration':   'Collaboration & Social',
      'driver.growth':          'Growth & Learning',

      /* ─── Allgemein ───────────────────────────────────── */
      'common.na':              'N/A',
      'common.anonymous':       'Anonymous',
      'common.public':          'Named',
      'common.loading':         'Loading…',
      'common.error':           'Error',
      'common.save':            'Save',
      'common.cancel':          'Cancel',
      'common.close':           'Close',
    }
  };

  /* ═══════════════════════════════════════════════════════
     State
     ═══════════════════════════════════════════════════════ */

  var currentLang = localStorage.getItem('fh_lang') || 'de';

  /* ═══════════════════════════════════════════════════════
     Public API
     ═══════════════════════════════════════════════════════ */

  /**
   * Gibt den übersetzten String für einen Key zurück.
   */
  function t(key) {
    var lang = translations[currentLang];
    if (lang && lang[key] !== undefined) return lang[key];
    // Fallback auf Deutsch
    if (translations['de'] && translations['de'][key] !== undefined) return translations['de'][key];
    // Letzter Fallback: Key selbst (für Debugging sichtbar)
    return key;
  }

  /**
   * Sprache wechseln und Seite neu laden.
   */
  function setLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('fh_lang', lang);
    document.documentElement.lang = lang;
    window.location.reload();
  }

  /**
   * Alle data-i18n Attribute im DOM befüllen.
   * Wird bei DOMContentLoaded automatisch aufgerufen.
   */
  function apply() {
    // Texte
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    // Titles (Tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    // HTML lang-Attribut
    document.documentElement.lang = currentLang;
    // Aktiven Sprachumschalter markieren
    updateLangButtons();
  }

  /**
   * Aktive Sprache in allen Switcher-Buttons markieren.
   * Wird nach apply() und nach Navbar-Render aufgerufen.
   */
  function updateLangButtons() {
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang-btn') === currentLang;
      btn.classList.toggle('lang-btn-active', isActive);
    });
  }

  /**
   * Aktuelle Sprache zurückgeben.
   */
  function getLang() {
    return currentLang;
  }

  // Beim Laden sofort anwenden
  document.addEventListener('DOMContentLoaded', apply);

  return {
    t:               t,
    setLang:         setLang,
    apply:           apply,
    getLang:         getLang,
    updateLangButtons: updateLangButtons
  };

})();
