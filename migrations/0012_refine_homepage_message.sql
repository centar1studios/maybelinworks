UPDATE site_settings
SET
    hero_title = 'Work that looks good
& does good',
    home_button_label = NULL,
    home_button_url = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;
