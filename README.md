

Readable Artifacts : pg_restore -f readable_backup.sql nightly_backup.sql

----------------------------------------------------------------


UPDATE medical_shops
SET 
  latitude = NULL, 
  longitude = NULL,
  is_verified = false,
  photo_url = NULL,
  photo_url_2 = NULL;



-- 1. Delete all data from transactional tables
TRUNCATE TABLE visits RESTART IDENTITY CASCADE;
TRUNCATE TABLE route_assignments RESTART IDENTITY CASCADE;
TRUNCATE TABLE targets RESTART IDENTITY CASCADE;