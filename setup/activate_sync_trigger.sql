-- 1. Create the Sync Function
CREATE OR REPLACE FUNCTION sync_role_permissions_fn()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE roles
    SET permissions = NEW.permissions
    WHERE authority_level = NEW.level;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach Trigger to the Master Grid table
DROP TRIGGER IF EXISTS trg_sync_role_permissions ON authority_levels;
CREATE TRIGGER trg_sync_role_permissions
AFTER INSERT OR UPDATE OF permissions ON authority_levels
FOR EACH ROW EXECUTE FUNCTION sync_role_permissions_fn();

-- 3. Initial Sync (Force match all current roles to the master levels)
UPDATE roles r
SET permissions = (SELECT permissions FROM authority_levels WHERE level = r.authority_level)
WHERE EXISTS (SELECT 1 FROM authority_levels WHERE level = r.authority_level);
