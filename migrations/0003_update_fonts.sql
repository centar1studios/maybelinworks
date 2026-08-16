UPDATE site_settings
SET
    display_font = 'Playfair Display',
    body_font = 'Lato',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;