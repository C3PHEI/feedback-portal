/**
 * i18n.js
 * Feedback Hub — Internationalisierung (DE / EN)
 * muss VOR allen anderen Scripts geladen werden.
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
      'inbox.avg_title':      'Durchschnittliche Feedbacks',
      'inbox.reviews':        'Feedback',
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
      'history.edit_ratings':       'Feedback bearbeiten',
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
      'feedback.anon_understood':         'Du hast ausgewählt, Feedback anonym einzureichen. Bitte stelle sicher, dass deine Kommentare keine persönlichen Identifikatoren, spezifischen Projektnamen oder Sprachhinweise enthalten, die deine Identität offenbaren könnten.',
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
      'feedback.anon_warning_text':       'Du hast ausgewählt, Feedback anonym einzureichen. Bitte stelle sicher, dass deine Kommentare keine persönlichen Identifikatoren, spezifischen Projektnamen oder Sprachhinweise enthalten, die deine Identität offenbaren könnten. Achte darauf, was du schreibst und welche Sprache du wählst, um echte Anonymität zu gewährleisten.',
      'feedback.anon_confirm':            'Ich habe gelesen und verstanden',
      'feedback.rate_limit_text':         'Anonymes Feedback kann von einer Person pro Jahr genau 1x an dieselbe Person gesendet werden.',
      'feedback.section_rating':          'Feedbacks',
      'feedback.text_intro':              'Mindestens eines der beiden Felder muss ausgefüllt werden (min. 200 Zeichen).',
      'feedback.char_min':                ' / 200 Zeichen min.',
      'feedback.coc.items': [
        'Respektvolle Sprache — Feedback muss professionell, höflich und respektvoll sein. Vermeide beleidigende, diskriminierende oder provokante Sprache. Konzentriere dich auf Beobachtungen und Verhaltensweisen, nicht auf Beleidigungen oder persönliche Angriffe.',
        'Keine Vergeltung — Feedback darf nie als Werkzeug für Bestrafung, Rache oder Bloßstellung eingesetzt werden. Die Plattform dient der Entwicklung und dem Wachstum, nicht der Vergeltung.',
        'Anonymitätsbewusstsein — Wenn du Feedback anonym einreichst, stelle sicher, dass deine Kommentare keine identifizierbaren Details wie Namen, Projekte, Orte oder Sprachhinweise enthalten, die deine Identität preisgeben könnten.',
        'Fokus auf Verhalten und Wirkung, nicht auf Persönlichkeit — Kommentare sollen aufzeigen, was jemand tut und welche Wirkung das hat, anstatt über Persönlichkeit, Motive oder Charaktereigenschaften zu spekulieren.',
        'Ehrlichkeit und Genauigkeit — Gib wahrheitsgemässes Feedback basierend auf deinen eigenen direkten Beobachtungen. Vermeide Übertreibungen, Annahmen oder Hörensagen.',
        'Vertraulichkeit und Datennutzung — Feedback ist ausschliesslich für den Empfänger und dessen direkten Vorgesetzten bestimmt. Teile es nicht ausserhalb der Plattform.',
        'Nur konstruktive Kritik — Wenn du Verbesserungsbereiche ansprichst, verbinde deine Beobachtungen mit konkreten Vorschlägen oder Beispielen.',
        'Einhaltung der Unternehmensrichtlinien — Jedes Feedback muss den HR-Richtlinien, ethischen Grundsätzen und rechtlichen Verpflichtungen des Unternehmens entsprechen.',
        'Plattform-Etikette / Kein Feedbacksmissbrauch — Fülle dein Feedback gewissenhaft aus. Verfälsche Feedbacks nicht absichtlich nach oben oder unten, lasse Felder nicht absichtlich leer und hinterlasse keine nichtssagenden Kommentare.',
      ],

      /* ─── department.html ─────────────────────────────── */
      'dept.title':             'Abteilung',
      'dept.subtitle':          'Team-Feedback-Verlauf',
      'dept.role_badge':        'Abteilungsleiter',
      'dept.disclaimer':        'Durchschnittswerte sind ein Orientierungswert und kein abschliessendes Urteil. Individuelle Feedbacks sind aus Datenschutzgründen (DSG\u00a0/\u00a0DSGVO) nicht einsehbar.',
      'dept.drawer_disclaimer': 'Individuelle Feedbacks sind aus Datenschutzgründen nicht einsehbar.',
      'dept.low_warning':       'Zu wenig Feedbacks für aussagekräftige Durchschnittswerte.',
      'dept.no_feedback':       'Noch kein Feedback erhalten.',
      'dept.stat_reviews':      'Feedbacks',
      'dept.stat_avg':          'Ø Gesamt',
      'dept.section_drivers':   'Driver-Bewertungen',
      'dept.section_history':   'Feedback-Verlauf',
      'dept.from':              'Von',
      'dept.no_members':        'Keine Teammitglieder gefunden.',
      'dept.avg_hint_singular': 'Durchschnitt basiert auf <strong>{n}</strong> Feedback. Diese Werte spiegeln möglicherweise nicht das vollständige Feedback wider.',
      'dept.avg_hint_plural':   'Durchschnitt basiert auf <strong>{n}</strong> Feedbacks. Diese Werte spiegeln möglicherweise nicht das vollständige Feedback wider.',
      'dept.no_ratings':        'Noch keine Feedbacks vorhanden.',
      'dept.anon_feedback':     'Anonymes Feedback',
      'dept.anonymous':         'Anonym',
      'dept.strengths_label':   'Stärken',
      'dept.improvements_label':'Verbesserungsbereiche',
      'dept.total_avg':         'Gesamt \u00D8',
      'dept.few_ratings':       'Wenige Feedbacks',
      'dept.avg_per_driver':    'Durchschnitt pro Driver',

      /* ─── admin.html — Basis ──────────────────────────── */
      'admin.title':            'Administration',
      'admin.page_title':       'Admin',
      'admin.subtitle':         'Verwaltung, Moderation und Benachrichtigungen',
      'admin.role_badge':       'Admin',
      'admin.role_badge_full':  'Administrator',
      'admin.section_stats':    'Statistiken',
      'admin.section_activity': 'Aktivität',
      'admin.section_users':    'Benutzer',
      'admin.section_coc':      'CoC-Meldungen',
      'admin.total_feedback':   'Feedbacks Total',
      'admin.total_users':      'Benutzer',
      'admin.anonymous_rate':   'Anonym-Quote',
      'admin.avg_rating':       'Ø Feedback',

      /* ─── admin.html — Tabs ───────────────────────────── */
      'admin.tab_dashboard':    'Dashboard',
      'admin.tab_moderation':   'Feedbackmoderation',
      'admin.tab_users':        'Benutzerverwaltung',

      /* ─── admin.html — Dashboard-Karten ──────────────── */
      'admin.chart_activity_title':       'Feedback-Aktivität',
      'admin.chart_visibility_title':     'Sichtbarkeit',
      'admin.driver_avg_title':           'Ø Bewertung pro Driver',
      'admin.driver_note':                '⚠ Durchschnitte sind Richtwerte — keine abschliessende Beurteilung.',
      'admin.dept_feedback_title':        'Feedbacks pro Abteilung',
      'admin.system_status_title':        'System Status',
      'admin.privacy_notice':             '🔒 Dieses Dashboard zeigt ausschliesslich aggregierte Daten. Individuelle Feedbacks werden aus Datenschutzgründen nicht angezeigt (DSG\u00a0/\u00a0DSGVO).',

      /* ─── admin.html — Moderation-Tab ────────────────── */
      'admin.privacy_hint':              'Individuelle Feedbacks werden aus Datenschutzgründen nicht angezeigt (DSG / DSGVO).',
      'admin.mod_search_placeholder':    'Feedback-ID, Benutzer oder Schlagwort suchen...',
      'admin.filter_all':                'Alle',
      'admin.filter_open':               'Offene Meldung',
      'admin.filter_review':             'In Prüfung',
      'admin.filter_resolved':           'Erledigt',
      'admin.col_id':                    'ID',
      'admin.col_from':                  'Von',
      'admin.col_to':                    'An',
      'admin.col_date':                  'Datum',
      'admin.col_type':                  'Typ',
      'admin.col_rating':                'Bewertung',
      'admin.col_status':                'Status',

      /* ─── admin.html — Benutzer-Tab ───────────────────── */
      'admin.user_search_placeholder':   'Benutzer suchen (Name, E-Mail, Abteilung)...',
      'admin.filter_admins':             'Admins',
      'admin.filter_managers':           'Manager',
      'admin.filter_users':              'Benutzer',
      'admin.filter_inactive':           'Inaktiv',
      'admin.col_user':                  'Benutzer',
      'admin.col_dept':                  'Abteilung',
      'admin.col_role':                  'Rolle',
      'admin.col_feedback_col':          'Feedback (Erhalten/Bekommen)',
      'admin.col_actions':               'Aktionen',

      /* ─── admin.html — Deactivate Modal ──────────────── */
      'admin.deactivate_title':          'Benutzer deaktivieren',
      'admin.deactivate_overview':       'Übersicht',
      'admin.deactivate_role_label':     'Rolle',
      'admin.deactivate_dept_label':     'Abteilung',
      'admin.deactivate_feedbacks':      'Feedbacks gesendet / erhalten',
      'admin.deactivate_what_happens':   'Was passiert bei der Deaktivierung?',
      'admin.deactivate_detail_1':       '1. Zugriff — Login wird <span class="hl-danger">gesperrt</span> — kein Feedback senden oder empfangen möglich.',
      'admin.deactivate_detail_2':       '2. Datenaufbewahrung — Bestehende Feedbacks bleiben <span class="hl-orange">12 Monate</span> nach Deaktivierung erhalten und werden danach <span class="hl-orange">gelöscht oder anonymisiert</span>.',
      'admin.deactivate_detail_3':       '3. Legal Hold — Feedbacks mit dem Tag <span class="hl-badge">Legal Hold</span> sind von der automatischen Löschung <span class="hl-orange">ausgenommen</span>, bis der Tag manuell entfernt wird.',
      'admin.deactivate_detail_4':       '4. Reaktivierung — <span class="hl-green">Jederzeit möglich.</span> Der Retention-Countdown wird zurückgesetzt.',
      'admin.deactivate_detail_5':       '5. AD-Sync — Status wird beim nächsten Sync <span class="hl-orange">automatisch aktualisiert</span>, falls der Benutzer in Active Directory wieder aktiv ist.',
      'admin.deactivate_confirm_btn':    '🚫 Deaktivieren',

      /* ─── admin.html — Report Modal ──────────────────── */
      'admin.report_modal_title':        'Meldung prüfen',
      'admin.report_from':               'Von',
      'admin.report_to':                 'An (Empfänger)',
      'admin.report_date':               'Datum',
      'admin.report_type':               'Typ',
      'admin.report_reason':             'Meldegrund',
      'admin.report_drivers':            'Driver-Bewertungen',
      'admin.report_strengths':          'Stärken',
      'admin.report_improvements':       'Verbesserungsbereiche',
      'admin.report_action_review':      '🔍 In Prüfung setzen',
      'admin.report_action_resolve':     '✅ Erledigen',
      'admin.report_action_dismiss':     '✕ Ablehnen',

      /* ─── admin.js — Rollen & Buttons ────────────────── */
      'admin.role_manager':              'Manager',
      'admin.role_user':                 'Benutzer',
      'admin.btn_deactivate':            'Deaktivieren',
      'admin.btn_activate':              'Aktivieren',
      'admin.btn_legal_hold':            'Rechtliche Sicherung',
      'admin.expand_more':               'Mehr anzeigen \u2193',
      'admin.expand_less':               'Weniger anzeigen \u2191',

      /* ─── admin.js — Toast-Meldungen ─────────────────── */
      'admin.toast_deactivated':         'wurde deaktiviert',
      'admin.toast_review':              'Status auf «In Prüfung» gesetzt',
      'admin.toast_resolved':            'Meldung erledigt',
      'admin.toast_dismissed':           'Meldung abgelehnt',

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
      'history.edit_title':         'Edit Feedback',
      'history.save_btn':           'Save',
      'history.recipient':          'To',
      'history.anonymous':          'Anonymous',
      'history.public':             'Named',
      'history.locked':             '🔒 Locked',
      'history.status_edited':      'Edited',
      'history.editable':           'Still editable',
      'history.edit_ratings':       'Edit ratings',
      'history.edit_strenghts':     'Edit strengths',
      'history.edit_improvements':  'Edit areas to improve',
      'history.cancel':             'Cancel',
      'history.strenghts':          'Strengths',
      'history.improvements':       'Areas to Improve',

      /* ─── feedback.html ───────────────────────────────── */
      'feedback.title':                   'Feedback',
      'feedback.subtitle':                'Submit feedback — choose a person and rate them across the four drivers.',
      'feedback.section_recipient':       'Recipient',
      'feedback.recipient_label':         'Employee from Active Directory',
      'feedback.recipient_placeholder':   'Select a person…',
      'feedback.section_visibility':      'Visibility',
      'feedback.visibility_intro':        'Choose whether your feedback is submitted with your name or anonymously.',
      'feedback.vis_public':              'Named',
      'feedback.vis_public_sub':          'Your name is visible to the recipient.',
      'feedback.vis_private':             'Anonymous',
      'feedback.vis_private_sub':         'Your name will not be shown.',
      'feedback.anon_understood':         'You have chosen to submit feedback anonymously. Please ensure your comments contain no personal identifiers, specific project names, or language cues that could reveal your identity.',
      'feedback.rate_limit':              'You have already given this person feedback. Next feedback possible in:',
      'feedback.section_drivers':         'Performance Drivers',
      'feedback.drivers_intro':           'Rate at least 2 out of 4 areas. Mark non-applicable areas as N/A.',
      'feedback.validation_drivers':      'At least 2 drivers must be rated.',
      'feedback.section_text':            'Free Text',
      'feedback.strengths_label':         'Strengths',
      'feedback.strengths_hint':          'optional',
      'feedback.strengths_placeholder':   'Describe specific strengths and positive behaviours...',
      'feedback.improvements_label':      'Areas to Improve',
      'feedback.improvements_hint':       'optional',
      'feedback.improvements_placeholder':'Describe areas with room for development…',
      'feedback.validation_text':         '⚠ At least one field must be filled in with 200+ characters.',
      'feedback.section_coc':             'Code of Conduct',
      'feedback.coc_intro':               'By submitting you confirm compliance with the following code of conduct:',
      'feedback.coc_accept':              'I accept the',
      'feedback.coc_link':                'Code of Conduct',
      'feedback.submit_btn':              'Submit Feedback →',
      'feedback.submit_hint':             'Once submitted, feedback is final. You have 5 minutes to correct typos.',
      'feedback.toast_submitted':         'Feedback submitted successfully',
      'feedback.anon_warning_text':       'You have chosen to submit feedback anonymously. Please ensure your comments contain no personal identifiers, specific project names, or language cues that could reveal your identity. Write with privacy in mind.',
      'feedback.anon_confirm':            'I have read and understood',
      'feedback.rate_limit_text':         'Anonymous feedback can be sent by one person to the same person exactly once per year.',
      'feedback.section_rating':          'Rating',
      'feedback.text_intro':              'At least one of the two fields must be filled in (min. 200 characters).',
      'feedback.char_min':                ' / 200 chars min.',
      'feedback.coc.items': [
        'Respectful Language Only — All feedback must be professional, courteous, and respectful. Avoid offensive, discriminatory, or inflammatory language. Focus on observations and behaviors, not insults or personal attacks.',
        'No Retaliation — Feedback must never be used as a tool for punishment, revenge, or embarrassment. The platform exists for growth and development, not for retribution.',
        'Anonymity Awareness — If submitting feedback anonymously, ensure your comments do not include identifiable details such as names, projects, locations, or language cues that could reveal your identity.',
        'Focus on Behaviors and Impact, Not Personality — Comments should highlight what someone does and the effect it has, rather than speculating about personality, motives, or character traits.',
        'Honesty and Accuracy — Provide truthful feedback based on your direct observations. Avoid exaggerations, assumptions, or hearsay.',
        'Confidentiality and Data Use — Feedback is intended only for the recipient and their direct manager. Do not share it outside the platform.',
        'Constructive Criticism Only — When pointing out areas for improvement, pair your observations with actionable suggestions or specific examples.',
        'Compliance with Company Policies — All feedback must comply with the company\'s HR policies, ethics, and legal obligations.',
        'Platform Etiquette / Avoid Rating Abuse — Complete your feedback sincerely. Do not artificially inflate or deflate scores, leave empty ratings intentionally, or provide meaningless comments.',
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
      'dept.strengths_label':   'Strengths',
      'dept.improvements_label':'Areas to Improve',
      'dept.total_avg':         'Overall \u00D8',
      'dept.few_ratings':       'Few Ratings',
      'dept.avg_per_driver':    'Average per Driver',

      /* ─── admin.html — Basis ──────────────────────────── */
      'admin.title':            'Administration',
      'admin.page_title':       'Admin',
      'admin.subtitle':         'Management, Moderation and Notifications',
      'admin.role_badge':       'Admin',
      'admin.role_badge_full':  'Administrator',
      'admin.section_stats':    'Statistics',
      'admin.section_activity': 'Activity',
      'admin.section_users':    'Users',
      'admin.section_coc':      'CoC Reports',
      'admin.total_feedback':   'Total Feedback',
      'admin.total_users':      'Users',
      'admin.anonymous_rate':   'Anonymous Rate',
      'admin.avg_rating':       'Ø Rating',

      /* ─── admin.html — Tabs ───────────────────────────── */
      'admin.tab_dashboard':    'Dashboard',
      'admin.tab_moderation':   'Feedback Moderation',
      'admin.tab_users':        'User Management',

      /* ─── admin.html — Dashboard-Karten ──────────────── */
      'admin.chart_activity_title':     'Feedback Activity',
      'admin.chart_visibility_title':   'Visibility',
      'admin.driver_avg_title':         'Ø Rating per Driver',
      'admin.driver_note':              '⚠ Averages are indicative — not a final assessment.',
      'admin.dept_feedback_title':      'Feedback per Department',
      'admin.system_status_title':      'System Status',
      'admin.privacy_notice':           '🔒 This dashboard shows aggregated data only. Individual feedback is not displayed for privacy reasons (DSG\u00a0/\u00a0GDPR).',

      /* ─── admin.html — Moderation-Tab ────────────────── */
      'admin.privacy_hint':              'Individual feedback is not displayed for privacy reasons (DSG / GDPR).',
      'admin.mod_search_placeholder':    'Search by feedback ID, user or keyword...',
      'admin.filter_all':                'All',
      'admin.filter_open':               'Open Report',
      'admin.filter_review':             'Under Review',
      'admin.filter_resolved':           'Resolved',
      'admin.col_id':                    'ID',
      'admin.col_from':                  'From',
      'admin.col_to':                    'To',
      'admin.col_date':                  'Date',
      'admin.col_type':                  'Type',
      'admin.col_rating':                'Rating',
      'admin.col_status':                'Status',

      /* ─── admin.html — Benutzer-Tab ───────────────────── */
      'admin.user_search_placeholder':   'Search users (name, email, department)...',
      'admin.filter_admins':             'Admins',
      'admin.filter_managers':           'Managers',
      'admin.filter_users':              'Users',
      'admin.filter_inactive':           'Inactive',
      'admin.col_user':                  'User',
      'admin.col_dept':                  'Department',
      'admin.col_role':                  'Role',
      'admin.col_feedback_col':          'Feedback (Received/Sent)',
      'admin.col_actions':               'Actions',

      /* ─── admin.html — Deactivate Modal ──────────────── */
      'admin.deactivate_title':          'Deactivate User',
      'admin.deactivate_overview':       'Overview',
      'admin.deactivate_role_label':     'Role',
      'admin.deactivate_dept_label':     'Department',
      'admin.deactivate_feedbacks':      'Feedback sent / received',
      'admin.deactivate_what_happens':   'What happens when deactivated?',
      'admin.deactivate_detail_1':       '1. Access — Login is <span class="hl-danger">blocked</span> — no sending or receiving feedback possible.',
      'admin.deactivate_detail_2':       '2. Data Retention — Existing feedback is retained for <span class="hl-orange">12 months</span> after deactivation, then <span class="hl-orange">deleted or anonymised</span>.',
      'admin.deactivate_detail_3':       '3. Legal Hold — Feedback tagged <span class="hl-badge">Legal Hold</span> is <span class="hl-orange">exempt</span> from automatic deletion until the tag is manually removed.',
      'admin.deactivate_detail_4':       '4. Reactivation — <span class="hl-green">Possible at any time.</span> The retention countdown resets.',
      'admin.deactivate_detail_5':       '5. AD-Sync — Status is <span class="hl-orange">automatically updated</span> on the next sync if the user is active again in Active Directory.',
      'admin.deactivate_confirm_btn':    '🚫 Deactivate',

      /* ─── admin.html — Report Modal ──────────────────── */
      'admin.report_modal_title':        'Review Report',
      'admin.report_from':               'From',
      'admin.report_to':                 'To (Recipient)',
      'admin.report_date':               'Date',
      'admin.report_type':               'Type',
      'admin.report_reason':             'Reason for Report',
      'admin.report_drivers':            'Driver Ratings',
      'admin.report_strengths':          'Strengths',
      'admin.report_improvements':       'Areas to Improve',
      'admin.report_action_review':      '🔍 Set to Under Review',
      'admin.report_action_resolve':     '✅ Resolve',
      'admin.report_action_dismiss':     '✕ Dismiss',

      /* ─── admin.js — Rollen & Buttons ────────────────── */
      'admin.role_manager':              'Manager',
      'admin.role_user':                 'User',
      'admin.btn_deactivate':            'Deactivate',
      'admin.btn_activate':              'Activate',
      'admin.btn_legal_hold':            'Legal Hold',
      'admin.expand_more':               'Show more \u2193',
      'admin.expand_less':               'Show less \u2191',

      /* ─── admin.js — Toast-Meldungen ─────────────────── */
      'admin.toast_deactivated':         'has been deactivated',
      'admin.toast_review':              'Status set to «Under Review»',
      'admin.toast_resolved':            'Report resolved',
      'admin.toast_dismissed':           'Report dismissed',

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
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    // NEU: HTML-Inhalt (für Keys mit Inline-Spans)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    document.documentElement.lang = currentLang;
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
