PRAGMA foreign_keys = ON;


/* BRANDING + HOMEPAGE */

ALTER TABLE site_settings
ADD COLUMN logo_key TEXT;

ALTER TABLE site_settings
ADD COLUMN favicon_key TEXT;

ALTER TABLE site_settings
ADD COLUMN footer_text TEXT NOT NULL DEFAULT 'Maybelin Works';

ALTER TABLE site_settings
ADD COLUMN home_button_label TEXT;

ALTER TABLE site_settings
ADD COLUMN home_button_url TEXT;

ALTER TABLE site_settings
ADD COLUMN color_palette TEXT NOT NULL DEFAULT 'signature';


/* PROJECT PRESENTATION + SOCIAL SHARING */

ALTER TABLE projects
ADD COLUMN cover_media_id INTEGER;

ALTER TABLE projects
ADD COLUMN social_title TEXT;

ALTER TABLE projects
ADD COLUMN social_description TEXT;

ALTER TABLE projects
ADD COLUMN social_media_id INTEGER;


/* IMAGE DETAILS */

ALTER TABLE project_media
ADD COLUMN caption TEXT;

ALTER TABLE project_media
ADD COLUMN credit TEXT;

ALTER TABLE project_media
ADD COLUMN external_url TEXT;

ALTER TABLE project_media
ADD COLUMN focal_x REAL NOT NULL DEFAULT 50;

ALTER TABLE project_media
ADD COLUMN focal_y REAL NOT NULL DEFAULT 50;
