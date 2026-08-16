PRAGMA foreign_keys = ON;


/* PROJECT LAYOUTS */

ALTER TABLE projects
ADD COLUMN gallery_layout TEXT NOT NULL DEFAULT 'smart'
CHECK (
    gallery_layout IN (
        'smart',
        'publication',
        'full',
        'grid',
        'featured'
    )
);

UPDATE projects
SET gallery_layout = 'publication'
WHERE slug = 'fenix';

UPDATE projects
SET gallery_layout = 'featured'
WHERE slug = 'casa-guadalupe';


/* ABOUT + CONTACT SETTINGS */

ALTER TABLE site_settings
ADD COLUMN about_kicker TEXT NOT NULL DEFAULT 'Artist / Designer / Mother';

ALTER TABLE site_settings
ADD COLUMN about_title TEXT NOT NULL DEFAULT 'About Me';

ALTER TABLE site_settings
ADD COLUMN about_bio TEXT;

ALTER TABLE site_settings
ADD COLUMN about_photo_key TEXT;

ALTER TABLE site_settings
ADD COLUMN contact_email TEXT;

ALTER TABLE site_settings
ADD COLUMN contact_phone TEXT;

ALTER TABLE site_settings
ADD COLUMN instagram_url TEXT;
