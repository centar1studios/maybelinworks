PRAGMA foreign_keys = ON;


/* MOVE ANY EXISTING WEBSITE MANAGER UPLOADS TO THE END */

UPDATE project_media
SET sort_order = sort_order + 1000
WHERE project_id IN (
    SELECT id
    FROM projects
    WHERE slug IN (
        'fenix',
        'casa-guadalupe'
    )
);


/* FENIX */

WITH fenix_media (
    r2_key,
    alt_text,
    sort_order
) AS (
    VALUES
        (
            'projects/fenix/page_01.png',
            'Fenix publication page 1',
            0
        ),
        (
            'projects/fenix/page_02.png',
            'Fenix publication page 2',
            1
        ),
        (
            'projects/fenix/page_03.png',
            'Fenix publication page 3',
            2
        ),
        (
            'projects/fenix/page_04.png',
            'Fenix publication page 4',
            3
        ),
        (
            'projects/fenix/page_05.png',
            'Fenix publication page 5',
            4
        ),
        (
            'projects/fenix/page_06.png',
            'Fenix publication page 6',
            5
        ),
        (
            'projects/fenix/page_07.png',
            'Fenix publication page 7',
            6
        ),
        (
            'projects/fenix/page_08.png',
            'Fenix publication page 8',
            7
        ),
        (
            'projects/fenix/page_09.png',
            'Fenix publication page 9',
            8
        ),
        (
            'projects/fenix/page_10.png',
            'Fenix publication page 10',
            9
        ),
        (
            'projects/fenix/page_11.png',
            'Fenix publication page 11',
            10
        ),
        (
            'projects/fenix/page_12.png',
            'Fenix publication page 12',
            11
        ),
        (
            'projects/fenix/page_13.png',
            'Fenix publication page 13',
            12
        ),
        (
            'projects/fenix/page_14.png',
            'Fenix publication page 14',
            13
        ),
        (
            'projects/fenix/page_15.png',
            'Fenix publication page 15',
            14
        ),
        (
            'projects/fenix/page_16.png',
            'Fenix publication page 16',
            15
        ),
        (
            'projects/fenix/page_17.png',
            'Fenix publication page 17',
            16
        ),
        (
            'projects/fenix/page_18.png',
            'Fenix publication page 18',
            17
        ),
        (
            'projects/fenix/page_19.png',
            'Fenix publication page 19',
            18
        ),
        (
            'projects/fenix/page_20.png',
            'Fenix publication page 20',
            19
        ),
        (
            'projects/fenix/page_21.png',
            'Fenix publication page 21',
            20
        ),
        (
            'projects/fenix/page_22.png',
            'Fenix publication page 22',
            21
        ),
        (
            'projects/fenix/page_23.png',
            'Fenix publication page 23',
            22
        ),
        (
            'projects/fenix/page_24.png',
            'Fenix publication page 24',
            23
        ),
        (
            'projects/fenix/fenix_pub_typeface1.jpg',
            'Custom typography study created for Fenix',
            24
        ),
        (
            'projects/fenix/fenix_pub_typeface2.jpg',
            'Custom typography detail created for Fenix',
            25
        ),
        (
            'projects/fenix/sugar.png',
            'Handmade sprinkle typography used in the Fenix publication',
            26
        ),
        (
            'projects/fenix/fenix_pub_photography1_final_pages.png',
            'Photography work created for the Fenix publication',
            27
        ),
        (
            'projects/fenix/fenix_pub_photography2_final_pages.png',
            'Additional photography work created for the Fenix publication',
            28
        ),
        (
            'projects/fenix/fenix_pub_dep1_final_pages.png',
            'Editorial development for the Fenix publication',
            29
        ),
        (
            'projects/fenix/fenix_pub_depa1_final_pages.png',
            'Additional editorial development for the Fenix publication',
            30
        ),
        (
            'projects/fenix/fenix_pub_moodboard.png',
            'Fenix publication moodboard and visual development',
            31
        )
)

INSERT INTO project_media (
    project_id,
    r2_key,
    alt_text,
    sort_order
)

SELECT
    projects.id,
    fenix_media.r2_key,
    fenix_media.alt_text,
    fenix_media.sort_order

FROM projects
CROSS JOIN fenix_media

WHERE
    projects.slug = 'fenix'

    AND NOT EXISTS (
        SELECT 1
        FROM project_media existing
        WHERE
            existing.project_id = projects.id
            AND existing.r2_key = fenix_media.r2_key
    );


/* CASA GUADALUPE */

WITH casa_media (
    r2_key,
    alt_text,
    sort_order
) AS (
    VALUES
        (
            'projects/casa-guadalupe/casa_pres1.png',
            'Casa Guadalupe brand presentation',
            0
        ),
        (
            'projects/casa-guadalupe/casa_red.png',
            'Casa Guadalupe red logo variation',
            1
        ),
        (
            'projects/casa-guadalupe/casa_ryg.png',
            'Casa Guadalupe colorful logo variation',
            2
        ),
        (
            'projects/casa-guadalupe/casa_pres2.png',
            'Casa Guadalupe visual identity presentation',
            3
        ),
        (
            'projects/casa-guadalupe/casa_pres3.png',
            'Casa Guadalupe branding presentation',
            4
        ),
        (
            'projects/casa-guadalupe/casa_bw.png',
            'Casa Guadalupe black and white logo variation',
            5
        ),
        (
            'projects/casa-guadalupe/casa_square.png',
            'Casa Guadalupe square logo design',
            6
        ),
        (
            'projects/casa-guadalupe/casa_pres4.png',
            'Casa Guadalupe brand application presentation',
            7
        ),
        (
            'projects/casa-guadalupe/casa_pres5.png',
            'Casa Guadalupe design system presentation',
            8
        ),
        (
            'projects/casa-guadalupe/casa_pres6.png',
            'Casa Guadalupe final brand presentation',
            9
        )
)

INSERT INTO project_media (
    project_id,
    r2_key,
    alt_text,
    sort_order
)

SELECT
    projects.id,
    casa_media.r2_key,
    casa_media.alt_text,
    casa_media.sort_order

FROM projects
CROSS JOIN casa_media

WHERE
    projects.slug = 'casa-guadalupe'

    AND NOT EXISTS (
        SELECT 1
        FROM project_media existing
        WHERE
            existing.project_id = projects.id
            AND existing.r2_key = casa_media.r2_key
    );
