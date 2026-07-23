-- ============================================================================
-- Add users.manager_user_id  (AD-Manager-Beziehung, self-referencing FK)
--
-- Kontext: Der AD-Sync (AdSyncService) setzt diese Spalte auf die DB-Id des
-- Managers eines Users — aber nur, wenn der Manager selbst im Sync-Scope
-- (Gruppe G_FeedbackHub) ist, sonst NULL. Die Team-/Department-Sichtbarkeit
-- basiert auf dieser Spalte (Manager sieht seine Direct Reports).
--
-- Dieses Projekt hat KEIN EF-Migrations-Setup — dieses Skript daher einmalig
-- MANUELL in pgAdmin (oder psql) gegen die Feedback-Hub-Datenbank ausführen,
-- BEVOR die neue Anwendungsversion startet. Idempotent (mehrfach ausführbar).
-- ============================================================================

-- 1. Spalte (nullable)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS manager_user_id uuid NULL;

-- 2. Self-Foreign-Key auf users.id, ON DELETE SET NULL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   information_schema.table_constraints
    WHERE  table_name      = 'users'
    AND    constraint_name = 'fk_users_manager_user'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT fk_users_manager_user
      FOREIGN KEY (manager_user_id)
      REFERENCES users (id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Index (Team-Abfragen filtern über manager_user_id)
CREATE INDEX IF NOT EXISTS ix_users_manager_user_id
  ON users (manager_user_id);
