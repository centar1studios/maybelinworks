const COOKIE_NAME = "maybelin_admin";
const SESSION_DURATION = 60 * 60 * 8;

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
        const [key, ...valueParts] = cookie.trim().split("=");

        if (key === name) {
            return decodeURIComponent(valueParts.join("="));
        }
    }

    return null;
}

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

async function verifySignature(payload, signature, secret) {
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
}

function validAdminCredentials(username, password, env) {
    const validAdmin1 =
        username === env.ADMIN_USERNAME_1 &&
        password === env.ADMIN_PASSWORD_1;

    const validAdmin2 =
        username === env.ADMIN_USERNAME_2 &&
        password === env.ADMIN_PASSWORD_2;

    return validAdmin1 || validAdmin2;
}

function validAdminUsername(username, env) {
    return (
        username === env.ADMIN_USERNAME_1 ||
        username === env.ADMIN_USERNAME_2
    );
}

async function createSession(username, env) {
    const expires =
        Math.floor(Date.now() / 1000) + SESSION_DURATION;

    const sessionData = JSON.stringify({
        username,
        expires
    });

    const payload = base64UrlEncodeText(sessionData);

    const signature = await signPayload(
        payload,
        env.SESSION_SECRET
    );

    return `${payload}.${signature}`;
}

async function readSession(request, env) {
    const session = getCookie(
        request,
        COOKIE_NAME
    );

    if (!session || !env.SESSION_SECRET) {
        return null;
    }

    const [payload, signature] = session.split(".");

    if (!payload || !signature) {
        return null;
    }

    const signatureValid = await verifySignature(
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

    if (!validAdminUsername(data.username, env)) {
        return null;
    }

    return {
        username: data.username,
        expires: data.expires
    };
}

async function handleLogin(request, env) {
    if (request.method !== "POST") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    if (
        !env.ADMIN_USERNAME_1 ||
        !env.ADMIN_PASSWORD_1 ||
        !env.ADMIN_USERNAME_2 ||
        !env.ADMIN_PASSWORD_2 ||
        !env.SESSION_SECRET
    ) {
        console.error(
            "Missing admin authentication secrets."
        );

        return json({
            error: "Admin authentication is not configured."
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
