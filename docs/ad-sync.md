# AD-Sync (Entra ID → Feedback Hub)

Täglicher Hintergrund-Job, der Benutzer, Rollen und Team-Zugehörigkeit aus
Entra ID (Microsoft Graph) in die Feedback-Hub-Datenbank spiegelt. Das AD ist
damit Single Source of Truth; das Auto-Provisioning beim Login
(`MeController`) ist nur noch Fallback.

## Voraussetzung: DB-Migration

Vor dem ersten Start der neuen Version **einmalig** das SQL-Skript ausführen
(manuell in pgAdmin / psql — es gibt kein EF-Migrations-Setup):

```
db/2026-07-23_add_users_manager_user_id.sql
```

Es legt `users.manager_user_id` an (uuid NULL, Self-FK auf `users.id`,
`ON DELETE SET NULL`, Index).

## Konfiguration (`appsettings.json`)

`appsettings.json` ist gitignored — die Sektion muss auf dem Server ergänzt
werden. `TenantId`/`ClientId` werden aus der bestehenden `AzureAd`-Sektion
wiederverwendet, falls unter `AdSync` nicht gesetzt.

```jsonc
"AdSync": {
  "Enabled": true,                                     // false = Job startet nicht (Dev-Default)
  "RunAtHour": 3,                                       // täglicher Lauf, Server-Lokalzeit (Default 3 = 03:00)
  "ClientSecret": "<app-registration client secret>",  // Pflicht
  "UserGroupId": "14a1923a-50c6-4012-8f2a-71b0e7b0b533",// G_FeedbackHub (Scope)
  "AdminGroupId": "<object id of G_FeedbackHub_Admin>"  // Admin-Rolle
  // optional: "TenantId", "ClientId"  (sonst Fallback auf AzureAd:*)
}
```

Benötigte **Application**-Berechtigungen der App-Registration (Admin-Consent):
`GroupMember.Read.All` (Gruppenmitglieder) und `User.Read.All`
(Manager-Beziehung `GET /users/{id}/manager`).

## Regeln

- **Scope:** Mitglieder von `G_FeedbackHub`. Konten ohne `mail` (Fallback
  `userPrincipalName`) **oder** `displayName` werden übersprungen.
- **Rollen** (Sync überschreibt die DB), Priorität `admin` > `manager` > `user`:
  - `admin` = Mitglied in `G_FeedbackHub_Admin`.
  - `manager` = wird von ≥ 1 Hub-Mitglied als Manager referenziert (AD-Attribut
    `manager`). Es gibt **keine** Manager-Gruppe.
  - `user` = sonst.
- **`is_department_manager`** = hat ≥ 1 Direct Report im Hub.
- **`manager_user_id`** = DB-Id des Managers, aber nur wenn dieser selbst im
  Scope ist, sonst `NULL`.
- **Department:** AD-Attribut `department` wird gemappt (unbekannte Namen
  werden angelegt). Nur noch Anzeige-Info — **nicht** mehr Basis der
  Team-Sichtbarkeit.
- **Lifecycle:** neu → anlegen; bestehend (Match `oid` ↔ `ad_object_id`) →
  Attribute überschreiben; fehlend oder `accountEnabled=false` →
  `is_active=false` + `deactivated_at=now`; Rückkehrer → reaktivieren.
- **Sicherungen:** leere Scope-Gruppe → Abbruch (keine Massen-Deaktivierung);
  bliebe kein aktiver Admin übrig → gesamter Lauf verworfen; E-Mail mit anderem
  `oid` → überspringen + Warning.

## Team-Sichtbarkeit

Der Team-/Department-Tab basiert auf `manager_user_id`, **nicht** mehr auf dem
gemeinsamen Department: Ein Manager sieht genau die aktiven User mit
`manager_user_id == eigene Id`. Zugriff auf fremde User-Feedbacks → `Forbidden`.

## Ausführung & Endpoints

- Läuft als `BackgroundService` täglich um `AdSync:RunAtHour`
  (zusätzlich ein Lauf kurz nach dem Start). `AdSync:Enabled=false` → Job
  startet nicht.
- `POST /api/admin/sync/run` (nur `admin`) — Sync sofort ausführen; liefert den
  Ergebnis-Record (`created/updated/reactivated/deactivated/skipped/error`),
  bei Fehler HTTP 502.
- `GET /api/admin/sync/status` — Ergebnis des letzten Laufs.
- `GET /api/admin/sync/logs` — Verlauf der letzten Läufe (RAM).

Pro Lauf wird eine Zusammenfassung geloggt, Warnings für übersprungene Konten
und der Grund bei einem Abbruch.
