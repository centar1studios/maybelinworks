PRAGMA foreign_keys = ON;


/* FENIX */

INSERT INTO projects (
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
    'fenix',
    'Fenix',
    'Educational Publication',
    'Fenix is a travel-focused publication created during my final semester of college, documenting kid-friendly destinations across Arizona through the perspective of traveling with my daughter.'
        || char(10) || char(10) ||
    'Designed with other single mothers in mind, the publication combines personal storytelling with recommendations for families looking to explore Arizona together.'
        || char(10) || char(10) ||
    'One featured spread uses an Old English-inspired typeface recreated entirely by hand using sprinkles from my pantry, individually placed with tweezers.'
        || char(10) || char(10) ||
    'All design, typography, and photography were created by me.',
    NULL,
    'Editorial Design, Typography & Photography',
    1,
    1
)
ON CONFLICT(slug) DO UPDATE SET
    title = excluded.title,
    kicker = excluded.kicker,
    description = excluded.description,
    year = excluded.year,
    role = excluded.role,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    updated_at = CURRENT_TIMESTAMP;


/* CASA GUADALUPE */

INSERT INTO projects (
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
    'Casa Guadalupe Education Center',
    'Educational Branding',
    'Casa Guadalupe Education Center is a conceptual brand identity created to connect with parents between the ages of 25 and 35 and build a welcoming sense of community around education.'
        || char(10) || char(10) ||
    'The final visual direction was inspired by the colors and patterns of a zarape blanket I discovered while visiting Downtown Los Angeles with my family shortly before the COVID-19 shutdown.'
        || char(10) || char(10) ||
    'Growing up in Los Angeles, visits to Placita Olvera and yearly Mexican celebrations were an important part of my upbringing. The energy of the vendors, traditions, colors, and gathering spaces represented the sense of community I wanted to bring into Casa Guadalupe''s identity.'
        || char(10) || char(10) ||
    'The resulting branding uses vibrant color and pattern to create a visual language rooted in education, connection, warmth, and cultural memory.',
    2026,
    'Identity, Branding & Art Direction',
    2,
    1
)
ON CONFLICT(slug) DO UPDATE SET
    title = excluded.title,
    kicker = excluded.kicker,
    description = excluded.description,
    year = excluded.year,
    role = excluded.role,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    updated_at = CURRENT_TIMESTAMP;