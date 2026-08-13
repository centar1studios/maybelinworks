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

function base64UrlEncode(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function sign(value, secret) {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        {
            name: "HMAC",
            hash: "SHA-256"
        },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(value)
    );

    return base64UrlEncode(signature);
}

export async function onRequestPost(context) {
    try {
        const {
            ADMIN_USERNAME_1,
            ADMIN_PASSWORD_1,
            ADMIN_USERNAME_2,
            ADMIN_PASSWORD_2,
            SESSION_SECRET
        } = context.env;

        if (
            !ADMIN_USERNAME_1 ||
            !ADMIN_PASSWORD_1 ||
            !ADMIN_USERNAME_2 ||
            !ADMIN_PASSWORD_2 ||
            !SESSION_SECRET
        ) {
            console.error("Admin authentication secrets are missing.");

            return json({
                error: "Admin authentication is not configured."
            }, 500);
        }

        let body;

        try {
            body = await context.request.json();
        } catch {
            return json({
                error: "Invalid request."
            }, 400);
        }

        const username = String(body.username || "").trim();
        const password = String(body.password || "");

        if (!username || !password) {
            return json({
                error: "Username and password are required."
            }, 400);
        }

        const validAdmin1 =
            username === ADMIN_USERNAME_1 &&
            password === ADMIN_PASSWORD_1;

        const validAdmin2 =
            username === ADMIN_USERNAME_2 &&
            password === ADMIN_PASSWORD_2;

        if (!validAdmin1 && !validAdmin2) {
            return json({
                error: "Incorrect username or password."
            }, 401);
        }

        const expires =
            Math.floor(Date.now() / 1000) + SESSION_DURATION;

        const payload = `${username}:${expires}`;

        const signature = await sign(
            payload,
            SESSION_SECRET
        );

        const session = `${payload}:${signature}`;

        const cookie = [
            `maybelin_admin=${encodeURIComponent(session)}`,
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
    } catch (error) {
        console.error("Admin login error:", error);

        return json({
            error: "Unable to sign in."
        }, 500);
    }
}

export function onRequest() {
    return json({
        error: "Method not allowed."
    }, 405);
}