PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    site_nav_works_label TEXT NOT NULL DEFAULT 'EXPLORE WORKS',
    site_nav_about_label TEXT NOT NULL DEFAULT 'ABOUT',
    hero_tagline_top TEXT NOT NULL DEFAULT 'Work that looks good',
    hero_tagline_bottom TEXT NOT NULL DEFAULT 'does good',
    hero_video_url TEXT,
    works_label TEXT NOT NULL DEFAULT 'SELECTED WORKS',
    works_title TEXT NOT NULL DEFAULT 'Projects & Creative Works',
    works_intro TEXT DEFAULT 'A taste of the best.',
    about_label TEXT NOT NULL DEFAULT 'ABOUT',
    about_title TEXT NOT NULL DEFAULT 'MAYBELIN GARCIA ROMERO',
    about_text TEXT,
    about_photo_key TEXT,
    about_photo_url TEXT,
    about_photo_alt TEXT DEFAULT 'Maybelin Garcia Romero',
    footer_brand TEXT NOT NULL DEFAULT 'Maybelin Works',
    footer_credit TEXT NOT NULL DEFAULT 'Website created by',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_content (
    id,
    site_nav_works_label,
    site_nav_about_label,
    hero_tagline_top,
    hero_tagline_bottom,
    hero_video_url,
    works_label,
    works_title,
    works_intro,
    about_label,
    about_title,
    about_text,
    about_photo_key,
    about_photo_url,
    about_photo_alt,
    footer_brand,
    footer_credit
)
VALUES (
    1,
    'EXPLORE WORKS',
    'ABOUT',
    'Work that looks good',
    'does good',
    'https://pub-cc011682079448388e2f0a3b4000b951.r2.dev/bkg_video_16-9.mp4',
    'SELECTED WORKS',
    'Projects & Creative Works',
    'A taste of the best.',
    'ABOUT',
    'MAYBELIN GARCIA ROMERO',
    'The artworks I share here take me back to a time when life was simpler, and I was just beginning to discover the curious, wandering young girl within me.

Growing up in LA, I was exposed to so many trends and cultures. Thanks to my parents, I visited museums, sunset beaches, amusement parks, taquerias, third spaces like public parks, and a lot of public art.

My works mirror who I was, who I am, and who I want to become. This often translates into bold, unapologetic work, using my artistic voice to talk about hard things like identity and bias.

I am a woman first, then an artist. This is often reflected in my typography designs, which are carefully nurtured to convey femininity.

As a mom to an 18-year-old, I value education. That is evident in my work through lived experiences.

I never gave myself the label of multidisciplinary artist, but as I evolve internally, I am more comfortable embracing that externally to share with others.',
    NULL,
    '/assets/may_photo.jpg',
    'Maybelin Garcia Romero',
    'Maybelin Works',
    'Website created by'
);

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    project_number INTEGER NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    cover_alt TEXT,
    project_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_published
ON projects (is_published);

CREATE INDEX IF NOT EXISTS idx_projects_sort
ON projects (sort_order);

INSERT OR IGNORE INTO projects (
    id,
    slug,
    project_number,
    category,
    title,
    description,
    cover_url,
    cover_alt,
    project_url,
    sort_order,
    is_published
)
VALUES (
    1,
    'fenix',
    1,
    'TRAVEL PUBLICATION',
    'Fenix Publication',
    'This spread is from a publication I called Fenix, created during my last semester of college. It was a blog-type publication for Arizona travel with my daughter, created so other single moms would be in the know about kid-friendly spots in Arizona. All design, typography, and photos by Maybelin Garcia Romero.',
    '/assets/fenix_pub/sugar.png',
    'Fenix Travel Publication',
    '/work/fenix/',
    1,
    1
);

INSERT OR IGNORE INTO projects (
    id,
    slug,
    project_number,
    category,
    title,
    description,
    cover_url,
    cover_alt,
    project_url,
    sort_order,
    is_published
)
VALUES (
    2,
    'casa-guadalupe',
    2,
    'BRANDING IDENTITY',
    'Casa Guadalupe Education Center Branding Identity',
    'Designed to engage 25-35-year-old parents with children. The selected pattern and colors allude to a zarape blanket discovered while traveling to Downtown Old Los Angeles. Growing up in LA and visiting Placita Olvera inspired the vibrant sense of culture and community reflected in the Casa Guadalupe identity.',
    '/assets/casa/casa_ryg.png',
    'Casa Guadalupe Branding Identity',
    '/work/casa-guadalupe/',
    2,
    1
);

CREATE TABLE IF NOT EXISTS project_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    r2_key TEXT NOT NULL UNIQUE,
    alt_text TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_media_project
ON project_media (project_id);

CREATE INDEX IF NOT EXISTS idx_project_media_sort
ON project_media (project_id, sort_order);