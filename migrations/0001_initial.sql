PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),

    hero_kicker TEXT NOT NULL DEFAULT 'Freelance Artist',

    hero_title TEXT NOT NULL DEFAULT
        'Work that not only looks good but does good.',

    hero_description TEXT NOT NULL DEFAULT
        'I am a branding and art direction specialist with over five years of experience dedicated to shaping compelling narratives.',

    primary_color TEXT NOT NULL DEFAULT '#B1125B',
    accent_green TEXT NOT NULL DEFAULT '#5F8F54',
    dark_plum TEXT NOT NULL DEFAULT '#4B1734',
    cream_color TEXT NOT NULL DEFAULT '#FFF7EF',

    display_font TEXT NOT NULL DEFAULT 'Cardo',
    body_font TEXT NOT NULL DEFAULT 'Hind',

    background_type TEXT NOT NULL DEFAULT 'video',
    background_url TEXT,
    background_overlay REAL NOT NULL DEFAULT 0.35,
    background_blur INTEGER NOT NULL DEFAULT 0,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    kicker TEXT,
    description TEXT,

    year INTEGER,
    role TEXT,

    sort_order INTEGER NOT NULL DEFAULT 0,

    is_published INTEGER NOT NULL DEFAULT 1
        CHECK (is_published IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    project_id INTEGER NOT NULL,
    r2_key TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_sort_order
ON projects(sort_order);

CREATE INDEX IF NOT EXISTS idx_projects_published
ON projects(is_published);

CREATE INDEX IF NOT EXISTS idx_project_media_project
ON project_media(project_id);

INSERT OR IGNORE INTO site_settings (
    id,
    hero_kicker,
    hero_title,
    hero_description,
    primary_color,
    accent_green,
    dark_plum,
    cream_color,
    display_font,
    body_font,
    background_type
)
VALUES (
    1,
    'Freelance Artist',
    'Work that not only looks good but does good.',
    'I am a branding and art direction specialist with over five years of experience dedicated to shaping compelling narratives. My approach is high-level, consistently delivering stylized solutions that perfectly capture a client''s desired vibe. As an advocate for feminine empowerment and social rights, I infuse purpose into every project, creating work that not only looks good but does good. When I''m not designing, you can find me journaling my thoughts, soaking in the peace of the beach, exploring art in museums, or expanding my mind through research into spiritualism and the healing power of plants.',
    '#B1125B',
    '#5F8F54',
    '#4B1734',
    '#FFF7EF',
    'Cardo',
    'Hind',
    'video'
);

INSERT OR IGNORE INTO projects (
    slug,
    title,
    kicker,
    description,
    year,
    role,
    sort_order,
    is_published
)
VALUES (
    'casa-guadalupe',
    'Casa Guadalupe',
    'Branding Identity',
    'Brand identity proposal for Casa Guadalupe.',
    2026,
    'Identity & Branding',
    1,
    1
);
