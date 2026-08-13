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

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
        }
    });
}

export async function onRequestGet(context) {
    try {
        const session = getCookie(
            context.request,
            "maybelin_admin"
        );

        if (!session || !context.env.SESSION_SECRET) {
            return json({
                authenticated: false
            });
        }

        const parts = session.split(":");

        if (parts.length !== 3) {
            return json({
                authenticated: false
            });
        }

        const [
            username,
            expiresText,
            suppliedSignature
        ] = parts;

        const expires = Number(expiresText);

        if (
            !Number.isFinite(expires) ||
            expires <= Math.floor(Date.now() / 1000)
        ) {
            return json({
                authenticated: false
            });
        }

        const validUsername =
            username === context.env.ADMIN_USERNAME_1 ||
            username === context.env.ADMIN_USERNAME_2;

        if (!validUsername) {
            return json({
                authenticated: false
            });
        }

        const payload = `${username}:${expires}`;

        const expectedSignature = await sign(
            payload,
            context.env.SESSION_SECRET
        );

        if (suppliedSignature !== expectedSignature) {
            return json({
                authenticated: false
            });
        }

        return json({
            authenticated: true,
            username
        });
    } catch (error) {
        console.error("Session check error:", error);

        return json({
            authenticated: false
        }, 500);
    }
}

export function onRequest() {
    return json({
        error: "Method not allowed."
    }, 405);
}