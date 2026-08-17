import {
    handleGetMedia,
    handleUploadProjectMedia,
    handleDeleteProjectMedia,
    handleReorderProjectMedia,
    handleUploadAboutPhoto
} from "./media.js";

const COOKIE_NAME = "maybelin_admin";
const SESSION_DURATION = 60 * 60 * 8;

const ALLOWED_BACKGROUND_TYPES = [
    "solid",
    "gradient",
    "image",
    "video"
];

const ALLOWED_GALLERY_LAYOUTS = [
    "smart",
    "publication",
    "full",
    "grid",
    "featured"
];

const ALLOWED_PAGE_BLOCK_TYPES = [
    "media",
    "heading",
    "text",
    "spacer"
];

const ALLOWED_PAGE_LAYOUT_PRESETS = [
    "canvas",
    "grid",
    "book",
    "slides"
];

const ALLOWED_SECTION_LAYOUTS = [
    "custom",
    "grid",
    "book",
    "slides",
    "full"
];

const MAX_PAGE_LAYOUT_BLOCKS = 200;
const MAX_PAGE_LAYOUT_BYTES = 100 * 1024;


/* RESPONSE HELPERS */

function json(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            ...headers
        }
    });
}


/* SESSION HELPERS */

function base64UrlEncodeBytes(bytes) {
    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function base64UrlEncodeText(text) {
    return base64UrlEncodeBytes(
        new TextEncoder().encode(text)
    );
}

function base64UrlDecodeText(value) {
    let base64 = value
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    while (base64.length % 4 !== 0) {
        base64 += "=";
    }

    const binary = atob(base64);

    const bytes = Uint8Array.from(
        binary,
        character => character.charCodeAt(0)
    );

    return new TextDecoder().decode(bytes);
}

function getCookie(request, name) {
    const cookieHeader = request.headers.get("Cookie");

    if (!cookieHeader) {
        return null;
    }

    for (const cookie of cookieHeader.split(";")) {
        const [key, ...valueParts] = cookie
            .trim()
            .split("=");

        if (key === name) {
            return decodeURIComponent(
                valueParts.join("=")
            );
        }
    }

    return null;
}


/* SESSION SECURITY */

async function getHmacKey(secret) {
    return crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        {
            name: "HMAC",
            hash: "SHA-256"
        },
        false,
        ["sign", "verify"]
    );
}

async function signPayload(payload, secret) {
    const key = await getHmacKey(secret);

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(payload)
    );

    return base64UrlEncodeBytes(
        new Uint8Array(signature)
    );
}

async function verifySignature(
    payload,
    signature,
    secret
) {
    try {
        let base64 = signature
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        while (base64.length % 4 !== 0) {
            base64 += "=";
        }

        const binary = atob(base64);

        const signatureBytes = Uint8Array.from(
            binary,
            character => character.charCodeAt(0)
        );

        const key = await getHmacKey(secret);

        return crypto.subtle.verify(
            "HMAC",
            key,
            signatureBytes,
            new TextEncoder().encode(payload)
        );
    } catch {
        return false;
    }
}


/* ADMIN ACCOUNTS */

function validAdminCredentials(
    username,
    password,
    env
) {
    const validAdmin1 =
        Boolean(
            env.ADMIN_USERNAME_1 &&
            env.ADMIN_PASSWORD_1
        ) &&
        username === env.ADMIN_USERNAME_1 &&
        password === env.ADMIN_PASSWORD_1;

    const admin2Configured =
        Boolean(
            env.ADMIN_USERNAME_2 &&
            env.ADMIN_PASSWORD_2
        );

    const validAdmin2 =
        admin2Configured &&
        username === env.ADMIN_USERNAME_2 &&
        password === env.ADMIN_PASSWORD_2;

    return validAdmin1 || validAdmin2;
}

function validAdminUsername(username, env) {
    const validAdmin1 =
        Boolean(env.ADMIN_USERNAME_1) &&
        username === env.ADMIN_USERNAME_1;

    const admin2Configured =
        Boolean(
            env.ADMIN_USERNAME_2 &&
            env.ADMIN_PASSWORD_2
        );

    const validAdmin2 =
        admin2Configured &&
        username === env.ADMIN_USERNAME_2;

    return validAdmin1 || validAdmin2;
}


/* CREATE SESSION */

async function createSession(username, env) {
    const expires =
        Math.floor(Date.now() / 1000) +
        SESSION_DURATION;

    const sessionData = JSON.stringify({
        username,
        expires
    });

    const payload = base64UrlEncodeText(
        sessionData
    );

    const signature = await signPayload(
        payload,
        env.SESSION_SECRET
    );

    return `${payload}.${signature}`;
}


/* READ SESSION */

async function readSession(request, env) {
    const session = getCookie(
        request,
        COOKIE_NAME
    );

    if (!session || !env.SESSION_SECRET) {
        return null;
    }

    const [payload, signature] =
        session.split(".");

    if (!payload || !signature) {
        return null;
    }

    const signatureValid =
        await verifySignature(
            payload,
            signature,
            env.SESSION_SECRET
        );

    if (!signatureValid) {
        return null;
    }

    let data;

    try {
        data = JSON.parse(
            base64UrlDecodeText(payload)
        );
    } catch {
        return null;
    }

    if (
        !data.username ||
        !Number.isFinite(data.expires)
    ) {
        return null;
    }

    if (
        data.expires <=
        Math.floor(Date.now() / 1000)
    ) {
        return null;
    }

    if (
        !validAdminUsername(
            data.username,
            env
        )
    ) {
        return null;
    }

    return {
        username: data.username,
        expires: data.expires
    };
}

async function requireAdmin(request, env) {
    return readSession(request, env);
}


/* VALIDATION */

function validHexColor(value) {
    return /^#[0-9a-fA-F]{6}$/.test(value);
}

function cleanText(
    value,
    fallback,
    maxLength
) {
    if (typeof value !== "string") {
        return fallback;
    }

    const cleaned = value.trim();

    if (!cleaned) {
        return fallback;
    }

    return cleaned.slice(0, maxLength);
}

function cleanNullableText(
    value,
    fallback,
    maxLength
) {
    if (value === null) {
        return null;
    }

    if (typeof value !== "string") {
        return fallback;
    }

    const cleaned = value.trim();

    if (!cleaned) {
        return null;
    }

    return cleaned.slice(0, maxLength);
}

function cleanEmail(value, fallback) {
    const cleaned = cleanNullableText(
        value,
        fallback,
        320
    );

    if (cleaned === null) {
        return null;
    }

    if (
        typeof cleaned !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)
    ) {
        return fallback;
    }

    return cleaned;
}

function cleanHttpUrl(value, fallback) {
    const cleaned = cleanNullableText(
        value,
        fallback,
        2000
    );

    if (cleaned === null) {
        return null;
    }

    try {
        const url = new URL(cleaned);

        if (
            url.protocol !== "https:" &&
            url.protocol !== "http:"
        ) {
            return fallback;
        }

        return url.toString();
    } catch {
        return fallback;
    }
}

function clampNumber(
    value,
    fallback,
    min,
    max
) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return Math.min(
        Math.max(number, min),
        max
    );
}

function cleanYear(value, fallback) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const year = Number(value);

    if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > 2100
    ) {
        return fallback;
    }

    return year;
}

function cleanBoolean(value, fallback) {
    if (value === true || value === 1) {
        return 1;
    }

    if (value === false || value === 0) {
        return 0;
    }

    return fallback;
}

function cleanGalleryLayout(value, fallback = "smart") {
    return ALLOWED_GALLERY_LAYOUTS.includes(value)
        ? value
        : fallback;
}

function parsePageLayout(value) {
    if (!value) {
        return null;
    }

    try {
        const layout = typeof value === "string"
            ? JSON.parse(value)
            : value;

        if (
            !layout ||
            layout.version !== 1 ||
            !Array.isArray(layout.blocks)
        ) {
            return null;
        }

        return {
            ...layout,
            preset: ALLOWED_PAGE_LAYOUT_PRESETS.includes(
                layout.preset
            )
                ? layout.preset
                : "canvas"
        };
    } catch {
        return null;
    }
}

function projectResponse(project) {
    if (!project) {
        return project;
    }

    const {
        page_layout_json: pageLayoutJson,
        ...response
    } = project;

    return {
        ...response,
        page_layout: parsePageLayout(pageLayoutJson)
    };
}

function cleanPageLayout(value, allowedMediaIds) {
    if (value === null || value === false) {
        return {
            layout: null,
            json: null
        };
    }

    if (
        !value ||
        typeof value !== "object" ||
        !Array.isArray(value.blocks)
    ) {
        return {
            error: "The custom page layout is invalid."
        };
    }

    if (value.blocks.length > MAX_PAGE_LAYOUT_BLOCKS) {
        return {
            error: "The custom page layout has too many blocks."
        };
    }

    const preset = ALLOWED_PAGE_LAYOUT_PRESETS.includes(
        value.preset
    )
        ? value.preset
        : "canvas";

    const blockIds = new Set();
    const blocks = [];

    for (let index = 0; index < value.blocks.length; index++) {
        const block = value.blocks[index];

        if (
            !block ||
            typeof block !== "object" ||
            !ALLOWED_PAGE_BLOCK_TYPES.includes(block.type)
        ) {
            return {
                error: "The custom page layout contains an invalid block."
            };
        }

        let id = cleanText(
            block.id,
            `block-${index + 1}`,
            80
        );

        if (blockIds.has(id)) {
            id = `${id}-${index + 1}`.slice(0, 80);
        }

        blockIds.add(id);

        const x = Math.round(
            clampNumber(block.x, 0, 0, 11)
        );

        const y = Math.round(
            clampNumber(block.y, 0, 0, 500)
        );

        const width = Math.round(
            clampNumber(block.w, 12, 1, 12 - x)
        );

        const height = Math.round(
            clampNumber(block.h, 4, 1, 24)
        );

        const cleaned = {
            id,
            type: block.type,
            x,
            y,
            w: width,
            h: height
        };

        if (block.type === "media") {
            const mediaId = Number(block.media_id);

            if (
                !Number.isInteger(mediaId) ||
                mediaId <= 0 ||
                !allowedMediaIds.has(mediaId)
            ) {
                return {
                    error: "The custom page layout references an image that is no longer in this project."
                };
            }

            cleaned.media_id = mediaId;
            cleaned.fit = block.fit === "cover"
                ? "cover"
                : "contain";
        }

        if (
            block.type === "heading" ||
            block.type === "text"
        ) {
            const maxLength = block.type === "heading"
                ? 160
                : 1200;

            cleaned.text = cleanText(
                block.text,
                block.type === "heading"
                    ? "New Section"
                    : "Add your text here.",
                maxLength
            );
        }

        if (block.type === "heading") {
            cleaned.section_layout = ALLOWED_SECTION_LAYOUTS.includes(
                block.section_layout
            )
                ? block.section_layout
                : null;
        } else if (typeof block.section_id === "string") {
            cleaned.section_id = cleanText(
                block.section_id,
                "",
                80
            );
        }

        blocks.push(cleaned);
    }

    const presetSectionLayouts = {
        canvas: "custom",
        grid: "grid",
        book: "book",
        slides: "slides"
    };

    const sections = blocks
        .filter(block => block.type === "heading")
        .sort((a, b) =>
            a.y - b.y ||
            a.x - b.x
        );

    const sectionIds = new Set(
        sections.map(section => section.id)
    );

    sections.forEach((section, index) => {
        if (!ALLOWED_SECTION_LAYOUTS.includes(section.section_layout)) {
            section.section_layout = index === 0
                ? presetSectionLayouts[preset]
                : "custom";
        }
    });

    blocks.forEach(block => {
        if (block.type === "heading") {
            delete block.section_id;
            return;
        }

        if (sectionIds.has(block.section_id)) {
            return;
        }

        const precedingSection = [...sections]
            .reverse()
            .find(section => section.y <= block.y);

        block.section_id = precedingSection?.id ||
            sections[0]?.id ||
            null;
    });

    const layout = {
        version: 1,
        preset,
        blocks
    };

    const jsonValue = JSON.stringify(layout);
    const byteLength = new TextEncoder()
        .encode(jsonValue)
        .byteLength;

    if (byteLength > MAX_PAGE_LAYOUT_BYTES) {
        return {
            error: "The custom page layout is too large to save."
        };
    }

    return {
        layout,
        json: jsonValue
    };
}

function slugify(value) {
    return String(value || "project")
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "project";
}

async function uniqueProjectSlug(env, title) {
    const base = slugify(title);
    let candidate = base;
    let suffix = 2;

    while (true) {
        const existing = await env.DB
            .prepare(`
                SELECT id
                FROM projects
                WHERE slug = ?
                LIMIT 1
            `)
            .bind(candidate)
            .first();

        if (!existing) {
            return candidate;
        }

        candidate = `${base}-${suffix}`;
        suffix++;
    }
}


/* ADMIN LOGIN */

async function handleLogin(request, env) {
    if (request.method !== "POST") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    if (
        !env.ADMIN_USERNAME_1 ||
        !env.ADMIN_PASSWORD_1 ||
        !env.SESSION_SECRET
    ) {
        console.error(
            "Missing required admin authentication secrets."
        );

        return json({
            error: "Website login is not configured."
        }, 500);
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return json({
            error: "Invalid request."
        }, 400);
    }

    const username = String(
        body.username || ""
    ).trim();

    const password = String(
        body.password || ""
    );

    if (!username || !password) {
        return json({
            error: "Username and password are required."
        }, 400);
    }

    if (
        !validAdminCredentials(
            username,
            password,
            env
        )
    ) {
        return json({
            error: "Incorrect username or password."
        }, 401);
    }

    const session = await createSession(
        username,
        env
    );

    const cookie = [
        `${COOKIE_NAME}=${encodeURIComponent(session)}`,
        "HttpOnly",
        "Secure",
        "SameSite=Strict",
        "Path=/",
        `Max-Age=${SESSION_DURATION}`
    ].join("; ");

    return json(
        {
            success: true,
            username
        },
        200,
        {
            "Set-Cookie": cookie
        }
    );
}


/* ADMIN SESSION */

async function handleSession(request, env) {
    if (request.method !== "GET") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    const session = await readSession(
        request,
        env
    );

    if (!session) {
        return json({
            authenticated: false
        });
    }

    return json({
        authenticated: true,
        username: session.username
    });
}


/* ADMIN LOGOUT */

function handleLogout(request) {
    if (request.method !== "POST") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    const cookie = [
        `${COOKIE_NAME}=`,
        "HttpOnly",
        "Secure",
        "SameSite=Strict",
        "Path=/",
        "Max-Age=0"
    ].join("; ");

    return json(
        {
            success: true
        },
        200,
        {
            "Set-Cookie": cookie
        }
    );
}


/* SITE SETTINGS */

async function getSiteSettings(env) {
    return env.DB
        .prepare(`
            SELECT
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
                background_type,
                background_url,
                background_overlay,
                background_blur,
                about_kicker,
                about_title,
                about_bio,
                about_photo_key,
                contact_email,
                contact_phone,
                instagram_url,
                updated_at
            FROM site_settings
            WHERE id = 1
            LIMIT 1
        `)
        .first();
}

async function handleGetSettings(
    request,
    env
) {
    if (request.method !== "GET") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    if (!env.DB) {
        return json({
            error: "Database is not configured."
        }, 500);
    }

    try {
        const settings = await getSiteSettings(env);

        if (!settings) {
            return json({
                error: "Site settings were not found."
            }, 404);
        }

        return json({
            settings
        });
    } catch (error) {
        console.error(
            "Unable to load site settings:",
            error
        );

        return json({
            error: "Unable to load site settings."
        }, 500);
    }
}


/* UPDATE SITE SETTINGS */

async function handleUpdateSettings(
    request,
    env
) {
    if (request.method !== "PUT") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    const session = await requireAdmin(
        request,
        env
    );

    if (!session) {
        return json({
            error: "Unauthorized."
        }, 401);
    }

    if (!env.DB) {
        return json({
            error: "Database is not configured."
        }, 500);
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return json({
            error: "Invalid request."
        }, 400);
    }

    try {
        const current = await env.DB
            .prepare(`
                SELECT *
                FROM site_settings
                WHERE id = 1
                LIMIT 1
            `)
            .first();

        if (!current) {
            return json({
                error: "Site settings were not found."
            }, 404);
        }

        const heroKicker = cleanText(
            body.hero_kicker,
            current.hero_kicker,
            100
        );

        const heroTitle = cleanText(
            body.hero_title,
            current.hero_title,
            300
        );

        const heroDescription = cleanText(
            body.hero_description,
            current.hero_description,
            5000
        );

        const primaryColor =
            typeof body.primary_color === "string" &&
            validHexColor(body.primary_color)
                ? body.primary_color.toUpperCase()
                : current.primary_color;

        const accentGreen =
            typeof body.accent_green === "string" &&
            validHexColor(body.accent_green)
                ? body.accent_green.toUpperCase()
                : current.accent_green;

        const darkPlum =
            typeof body.dark_plum === "string" &&
            validHexColor(body.dark_plum)
                ? body.dark_plum.toUpperCase()
                : current.dark_plum;

        const creamColor =
            typeof body.cream_color === "string" &&
            validHexColor(body.cream_color)
                ? body.cream_color.toUpperCase()
                : current.cream_color;

        const displayFont = cleanText(
            body.display_font,
            current.display_font,
            100
        );

        const bodyFont = cleanText(
            body.body_font,
            current.body_font,
            100
        );

        const backgroundType =
            ALLOWED_BACKGROUND_TYPES.includes(
                body.background_type
            )
                ? body.background_type
                : current.background_type;

        const backgroundUrl = cleanNullableText(
            body.background_url,
            current.background_url,
            2000
        );

        const backgroundOverlay = clampNumber(
            body.background_overlay,
            current.background_overlay,
            0,
            1
        );

        const backgroundBlur = Math.round(
            clampNumber(
                body.background_blur,
                current.background_blur,
                0,
                50
            )
        );

        const aboutKicker = cleanText(
            body.about_kicker,
            current.about_kicker,
            150
        );

        const aboutTitle = cleanText(
            body.about_title,
            current.about_title,
            200
        );

        const aboutBio = cleanText(
            body.about_bio,
            current.about_bio,
            20000
        );

        const contactEmail = cleanEmail(
            body.contact_email,
            current.contact_email
        );

        const contactPhone = cleanNullableText(
            body.contact_phone,
            current.contact_phone,
            100
        );

        const instagramUrl = cleanHttpUrl(
            body.instagram_url,
            current.instagram_url
        );

        await env.DB
            .prepare(`
                UPDATE site_settings
                SET
                    hero_kicker = ?,
                    hero_title = ?,
                    hero_description = ?,
                    primary_color = ?,
                    accent_green = ?,
                    dark_plum = ?,
                    cream_color = ?,
                    display_font = ?,
                    body_font = ?,
                    background_type = ?,
                    background_url = ?,
                    background_overlay = ?,
                    background_blur = ?,
                    about_kicker = ?,
                    about_title = ?,
                    about_bio = ?,
                    contact_email = ?,
                    contact_phone = ?,
                    instagram_url = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
            `)
            .bind(
                heroKicker,
                heroTitle,
                heroDescription,
                primaryColor,
                accentGreen,
                darkPlum,
                creamColor,
                displayFont,
                bodyFont,
                backgroundType,
                backgroundUrl,
                backgroundOverlay,
                backgroundBlur,
                aboutKicker,
                aboutTitle,
                aboutBio,
                contactEmail,
                contactPhone,
                instagramUrl
            )
            .run();

        const updated = await getSiteSettings(env);

        return json({
            success: true,
            settings: updated
        });
    } catch (error) {
        console.error(
            "Unable to update site settings:",
            error
        );

        return json({
            error: "Unable to update site settings."
        }, 500);
    }
}


/* PROJECT QUERY */

async function getProjectsFromDatabase(
    env,
    publishedOnly = true
) {
    const whereClause = publishedOnly
        ? "WHERE is_published = 1"
        : "";

    const projectResult = await env.DB
        .prepare(`
            SELECT
                id,
                slug,
                title,
                kicker,
                description,
                year,
                role,
                gallery_layout,
                page_layout_json,
                sort_order,
                is_published,
                created_at,
                updated_at
            FROM projects
            ${whereClause}
            ORDER BY sort_order ASC, id ASC
        `)
        .all();

    const mediaWhereClause = publishedOnly
        ? "WHERE p.is_published = 1"
        : "";

    const mediaResult = await env.DB
        .prepare(`
            SELECT
                pm.id,
                pm.project_id,
                pm.r2_key,
                pm.alt_text,
                pm.sort_order
            FROM project_media AS pm
            INNER JOIN projects AS p
                ON p.id = pm.project_id
            ${mediaWhereClause}
            ORDER BY
                pm.project_id ASC,
                pm.sort_order ASC,
                pm.id ASC
        `)
        .all();

    const mediaByProject = new Map();

    for (const media of mediaResult.results) {
        if (!mediaByProject.has(media.project_id)) {
            mediaByProject.set(
                media.project_id,
                []
            );
        }

        mediaByProject
            .get(media.project_id)
            .push(media);
    }

    return projectResult.results.map(
        project => ({
            ...projectResponse(project),
            media:
                mediaByProject.get(project.id) || []
        })
    );
}


/* PUBLIC PROJECTS */

async function handleGetProjects(
    request,
    env
) {
    if (request.method !== "GET") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    if (!env.DB) {
        return json({
            error: "Database is not configured."
        }, 500);
    }

    try {
        const projects = await getProjectsFromDatabase(
            env,
            true
        );

        return json({
            projects
        });
    } catch (error) {
        console.error(
            "Unable to load projects:",
            error
        );

        return json({
            error: "Unable to load projects."
        }, 500);
    }
}


/* ADMIN PROJECTS */

async function handleGetAdminProjects(
    request,
    env
) {
    if (request.method !== "GET") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    const session = await requireAdmin(
        request,
        env
    );

    if (!session) {
        return json({
            error: "Unauthorized."
        }, 401);
    }

    if (!env.DB) {
        return json({
            error: "Database is not configured."
        }, 500);
    }

    try {
        const projects = await getProjectsFromDatabase(
            env,
            false
        );

        return json({
            projects
        });
    } catch (error) {
        console.error(
            "Unable to load admin projects:",
            error
        );

        return json({
            error: "Unable to load projects."
        }, 500);
    }
}


/* CREATE PROJECT */

async function handleCreateProject(
    request,
    env
) {
    if (request.method !== "POST") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    const session = await requireAdmin(
        request,
        env
    );

    if (!session) {
        return json({
            error: "Unauthorized."
        }, 401);
    }

    if (!env.DB) {
        return json({
            error: "Database is not configured."
        }, 500);
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return json({
            error: "Invalid request."
        }, 400);
    }

    const title = cleanText(
        body.title,
        "",
        200
    );

    if (!title) {
        return json({
            error: "Project name is required."
        }, 400);
    }

    const kicker = cleanNullableText(
        body.kicker,
        null,
        200
    );

    const description = cleanNullableText(
        body.description,
        null,
        10000
    );

    const year = cleanYear(
        body.year,
        null
    );

    const role = cleanNullableText(
        body.role,
        null,
        500
    );

    const galleryLayout = cleanGalleryLayout(
        body.gallery_layout,
        "smart"
    );

    const isPublished = cleanBoolean(
        body.is_published,
        0
    );

    try {
        const slug = await uniqueProjectSlug(
            env,
            title
        );

        const orderResult = await env.DB
            .prepare(`
                SELECT
                    COALESCE(MAX(sort_order), -1) + 1 AS next_order
                FROM projects
            `)
            .first();

        const sortOrder = Number(
            orderResult?.next_order
        ) || 0;

        const insertResult = await env.DB
            .prepare(`
                INSERT INTO projects (
                    slug,
                    title,
                    kicker,
                    description,
                    year,
                    role,
                    gallery_layout,
                    page_layout_json,
                    sort_order,
                    is_published
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
                slug,
                title,
                kicker,
                description,
                year,
                role,
                galleryLayout,
                sortOrder,
                isPublished
            )
            .run();

        const newId = Number(
            insertResult.meta?.last_row_id
        );

        const project = await env.DB
            .prepare(`
                SELECT
                    id,
                    slug,
                    title,
                    kicker,
                    description,
                    year,
                    role,
                    gallery_layout,
                    sort_order,
                    is_published,
                    created_at,
                    updated_at
                FROM projects
                WHERE id = ?
                LIMIT 1
            `)
            .bind(newId)
            .first();

        return json({
            success: true,
            project: {
                ...projectResponse(project),
                media: []
            }
        }, 201);
    } catch (error) {
        console.error(
            "Unable to create project:",
            error
        );

        return json({
            error: "Unable to create the project."
        }, 500);
    }
}


/* UPDATE PROJECT */

async function handleUpdateProject(
    request,
    env,
    projectId
) {
    if (request.method !== "PUT") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    const session = await requireAdmin(
        request,
        env
    );

    if (!session) {
        return json({
            error: "Unauthorized."
        }, 401);
    }

    if (!env.DB) {
        return json({
            error: "Database is not configured."
        }, 500);
    }

    const numericId = Number(projectId);

    if (
        !Number.isInteger(numericId) ||
        numericId <= 0
    ) {
        return json({
            error: "Invalid project."
        }, 400);
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return json({
            error: "Invalid request."
        }, 400);
    }

    try {
        const current = await env.DB
            .prepare(`
                SELECT *
                FROM projects
                WHERE id = ?
                LIMIT 1
            `)
            .bind(numericId)
            .first();

        if (!current) {
            return json({
                error: "Project not found."
            }, 404);
        }

        const title = cleanText(
            body.title,
            current.title,
            200
        );

        const kicker = cleanNullableText(
            body.kicker,
            current.kicker,
            200
        );

        const description = cleanNullableText(
            body.description,
            current.description,
            10000
        );

        const year = cleanYear(
            body.year,
            current.year
        );

        const role = cleanNullableText(
            body.role,
            current.role,
            500
        );

        const galleryLayout = cleanGalleryLayout(
            body.gallery_layout,
            current.gallery_layout || "smart"
        );

        const sortOrder = Math.round(
            clampNumber(
                body.sort_order,
                current.sort_order,
                0,
                1000
            )
        );

        const isPublished = cleanBoolean(
            body.is_published,
            current.is_published
        );

        let pageLayoutJson = current.page_layout_json || null;

        if (
            Object.prototype.hasOwnProperty.call(
                body,
                "page_layout"
            )
        ) {
            const mediaResult = await env.DB
                .prepare(`
                    SELECT id
                    FROM project_media
                    WHERE project_id = ?
                `)
                .bind(numericId)
                .all();

            const allowedMediaIds = new Set(
                mediaResult.results.map(
                    media => Number(media.id)
                )
            );

            const cleanedLayout = cleanPageLayout(
                body.page_layout,
                allowedMediaIds
            );

            if (cleanedLayout.error) {
                return json({
                    error: cleanedLayout.error
                }, 400);
            }

            pageLayoutJson = cleanedLayout.json;
        }

        await env.DB
            .prepare(`
                UPDATE projects
                SET
                    title = ?,
                    kicker = ?,
                    description = ?,
                    year = ?,
                    role = ?,
                    gallery_layout = ?,
                    page_layout_json = ?,
                    sort_order = ?,
                    is_published = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .bind(
                title,
                kicker,
                description,
                year,
                role,
                galleryLayout,
                pageLayoutJson,
                sortOrder,
                isPublished,
                numericId
            )
            .run();

        const updated = await env.DB
            .prepare(`
                SELECT
                    id,
                    slug,
                    title,
                    kicker,
                    description,
                    year,
                    role,
                    gallery_layout,
                    page_layout_json,
                    sort_order,
                    is_published,
                    created_at,
                    updated_at
                FROM projects
                WHERE id = ?
                LIMIT 1
            `)
            .bind(numericId)
            .first();

        const mediaResult = await env.DB
            .prepare(`
                SELECT
                    id,
                    project_id,
                    r2_key,
                    alt_text,
                    sort_order
                FROM project_media
                WHERE project_id = ?
                ORDER BY sort_order ASC, id ASC
            `)
            .bind(numericId)
            .all();

        return json({
            success: true,
            project: {
                ...projectResponse(updated),
                media: mediaResult.results
            }
        });
    } catch (error) {
        console.error(
            "Unable to update project:",
            error
        );

        return json({
            error: "Unable to save project."
        }, 500);
    }
}


/* ADMIN PAGES */

async function handleProtectedAdmin(
    request,
    env
) {
    const session = await readSession(
        request,
        env
    );

    const url = new URL(request.url);

    if (!session) {
        return Response.redirect(
            `${url.origin}/admin-login.html`,
            302
        );
    }

    if (
        url.pathname === "/admin" ||
        url.pathname === "/admin/"
    ) {
        return Response.redirect(
            `${url.origin}/admin/admin-dashboard.html`,
            302
        );
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);

    headers.set(
        "Cache-Control",
        "private, no-store, no-cache, must-revalidate"
    );
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");

    return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers
    });
}


/* ROUTES */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        /* PUBLIC MEDIA */

        if (url.pathname.startsWith("/media/")) {
            return handleGetMedia(
                request,
                env,
                url.pathname.slice("/media/".length)
            );
        }

        /* AUTH */

        if (url.pathname === "/api/admin/login") {
            return handleLogin(request, env);
        }

        if (url.pathname === "/api/admin/session") {
            return handleSession(request, env);
        }

        if (url.pathname === "/api/admin/logout") {
            return handleLogout(request);
        }

        /* SETTINGS */

        if (url.pathname === "/api/settings") {
            return handleGetSettings(request, env);
        }

        if (url.pathname === "/api/admin/settings") {
            return handleUpdateSettings(request, env);
        }

        /* ABOUT PHOTO */

        if (url.pathname === "/api/admin/about/photo") {
            const session = await requireAdmin(
                request,
                env
            );

            if (!session) {
                return json({
                    error: "Unauthorized."
                }, 401);
            }

            return handleUploadAboutPhoto(
                request,
                env,
                session.username
            );
        }

        /* PUBLIC PROJECTS */

        if (url.pathname === "/api/projects") {
            return handleGetProjects(request, env);
        }

        /* ADMIN PROJECT COLLECTION */

        if (url.pathname === "/api/admin/projects") {
            if (request.method === "POST") {
                return handleCreateProject(
                    request,
                    env
                );
            }

            return handleGetAdminProjects(
                request,
                env
            );
        }

        /* REORDER PROJECT IMAGES */

        const projectMediaOrderMatch =
            url.pathname.match(
                /^\/api\/admin\/projects\/(\d+)\/media\/order$/
            );

        if (projectMediaOrderMatch) {
            const session = await requireAdmin(
                request,
                env
            );

            if (!session) {
                return json({
                    error: "Unauthorized."
                }, 401);
            }

            return handleReorderProjectMedia(
                request,
                env,
                projectMediaOrderMatch[1]
            );
        }

        /* UPLOAD PROJECT IMAGE */

        const projectMediaMatch =
            url.pathname.match(
                /^\/api\/admin\/projects\/(\d+)\/media$/
            );

        if (projectMediaMatch) {
            const session = await requireAdmin(
                request,
                env
            );

            if (!session) {
                return json({
                    error: "Unauthorized."
                }, 401);
            }

            return handleUploadProjectMedia(
                request,
                env,
                projectMediaMatch[1],
                session.username
            );
        }

        /* DELETE PROJECT IMAGE */

        const mediaDeleteMatch =
            url.pathname.match(
                /^\/api\/admin\/media\/(\d+)$/
            );

        if (mediaDeleteMatch) {
            const session = await requireAdmin(
                request,
                env
            );

            if (!session) {
                return json({
                    error: "Unauthorized."
                }, 401);
            }

            return handleDeleteProjectMedia(
                request,
                env,
                mediaDeleteMatch[1]
            );
        }

        /* UPDATE PROJECT */

        const projectMatch =
            url.pathname.match(
                /^\/api\/admin\/projects\/(\d+)$/
            );

        if (projectMatch) {
            return handleUpdateProject(
                request,
                env,
                projectMatch[1]
            );
        }

        /* PROTECTED ADMIN PAGES */

        if (
            url.pathname === "/admin" ||
            url.pathname.startsWith("/admin/")
        ) {
            return handleProtectedAdmin(
                request,
                env
            );
        }

        return env.ASSETS.fetch(request);
    }
};
