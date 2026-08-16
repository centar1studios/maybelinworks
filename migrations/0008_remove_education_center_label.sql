UPDATE project_media
SET alt_text = 'Casa Guadalupe brand presentation'
WHERE
    project_id = (
        SELECT id
        FROM projects
        WHERE slug = 'casa-guadalupe'
        LIMIT 1
    )
    AND r2_key = 'projects/casa-guadalupe/casa_pres1.png';
