PRAGMA foreign_keys = ON;


/* PROJECT VIDEO SUPPORT */

ALTER TABLE project_media
ADD COLUMN media_type TEXT NOT NULL DEFAULT 'image'
    CHECK (media_type IN ('image', 'video'));

ALTER TABLE project_media
ADD COLUMN mime_type TEXT;

UPDATE project_media
SET mime_type = CASE
    WHEN LOWER(r2_key) LIKE '%.jpg' OR LOWER(r2_key) LIKE '%.jpeg'
        THEN 'image/jpeg'
    WHEN LOWER(r2_key) LIKE '%.png'
        THEN 'image/png'
    WHEN LOWER(r2_key) LIKE '%.webp'
        THEN 'image/webp'
    WHEN LOWER(r2_key) LIKE '%.avif'
        THEN 'image/avif'
    ELSE mime_type
END
WHERE mime_type IS NULL;
