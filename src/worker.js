const COOKIE_NAME = "maybelin_admin";
const SESSION_DURATION = 60 * 60 * 8;

const ALLOWED_BACKGROUND_TYPES = [
    "solid",
    "gradient",
    "image",
    "video"
];


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

    const payload =
        base64UrlEncodeText(sessionData);

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
        const settings = await env.DB
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
                    updated_at
                FROM site_settings
                WHERE id = 1
                LIMIT 1
            `)
            .first();

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

        const backgroundUrl =
            cleanNullableText(
                body.background_url,
                current.background_url,
                2000
            );

        const backgroundOverlay =
            clampNumber(
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
                backgroundBlur
            )
            .run();

        const updated = await env.DB
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
                    updated_at
                FROM site_settings
                WHERE id = 1
                LIMIT 1
            `)
            .first();

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


/* PROJECTS */

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
                    sort_order,
                    is_published,
                    created_at,
                    updated_at
                FROM projects
                WHERE is_published = 1
                ORDER BY sort_order ASC, id ASC
            `)
            .all();

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
                WHERE p.is_published = 1
                ORDER BY
                    pm.project_id ASC,
                    pm.sort_order ASC,
                    pm.id ASC
            `)
            .all();

        const mediaByProject = new Map();

        for (const media of mediaResult.results) {
            if (
                !mediaByProject.has(
                    media.project_id
                )
            ) {
                mediaByProject.set(
                    media.project_id,
                    []
                );
            }

            mediaByProject
                .get(media.project_id)
                .push(media);
        }

        const projects =
            projectResult.results.map(
                project => ({
                    ...project,
                    media:
                        mediaByProject.get(
                            project.id
                        ) || []
                })
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

    return env.ASSETS.fetch(request);
}


/* ROUTES */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (
            url.pathname ===
            "/api/admin/login"
        ) {
            return handleLogin(
                request,
                env
            );
        }

        if (
            url.pathname ===
            "/api/admin/session"
        ) {
            return handleSession(
                request,
                env
            );
        }

        if (
            url.pathname ===
            "/api/admin/logout"
        ) {
            return handleLogout(request);
        }

        if (
            url.pathname ===
            "/api/settings"
        ) {
            return handleGetSettings(
                request,
                env
            );
        }

        if (
            url.pathname ===
            "/api/admin/settings"
        ) {
            return handleUpdateSettings(
                request,
                env
            );
        }

        if (
            url.pathname ===
            "/api/projects"
        ) {
            return handleGetProjects(
                request,
                env
            );
        }

        if (
            url.pathname === "/admin" ||
            url.pathname.startsWith(
                "/admin/"
            )
        ) {
            return handleProtectedAdmin(
                request,
                env
            );
        }

        return env.ASSETS.fetch(request);
    }
};