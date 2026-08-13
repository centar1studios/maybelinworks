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

export async function onRequestGet(context) {
    const session = getCookie(
        context.request,
        "maybelin_admin"
    );

    if (!session || !context.env.SESSION_SECRET) {
        return Response.json({
            authenticated: false
        });
    }

    const parts = session.split(":");

    if (parts.length !== 3) {
        return Response.json({
            authenticated: false
        });
    }

    const [username, expiresText, suppliedSignature] = parts;
    const expires = Number(expiresText);

    if (
        username !== context.env.ADMIN_USERNAME ||
        !Number.isFinite(expires) ||
        expires <= Math.floor(Date.now() / 1000)
    ) {
        return Response.json({
            authenticated: false
        });
    }

    const payload = `${username}:${expires}`;

    const expectedSignature = await sign(
        payload,
        context.env.SESSION_SECRET
    );

    if (expectedSignature !== suppliedSignature) {
        return Response.json({
            authenticated: false
        });
    }

    return Response.json({
        authenticated: true,
        username
    });
}