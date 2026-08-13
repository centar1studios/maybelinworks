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

    const cookies = cookieHeader.split(";");

    for (const cookie of cookies) {
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

async function validSession(request, env) {
    const session = getCookie(request, "maybelin_admin");

    if (!session || !env.SESSION_SECRET) {
        return false;
    }

    const parts = session.split(":");

    if (parts.length !== 3) {
        return false;
    }

    const [username, expiresText, suppliedSignature] = parts;

    const expires = Number(expiresText);

    if (!Number.isFinite(expires)) {
        return false;
    }

    if (expires <= Math.floor(Date.now() / 1000)) {
        return false;
    }

    if (username !== env.ADMIN_USERNAME) {
        return false;
    }

    const payload = `${username}:${expires}`;

    const expectedSignature = await sign(
        payload,
        env.SESSION_SECRET
    );

    return expectedSignature === suppliedSignature;
}

export async function onRequest(context) {
    const url = new URL(context.request.url);

    const protectedAdminPage =
        url.pathname === "/admin" ||
        url.pathname.startsWith("/admin/");

    if (!protectedAdminPage) {
        return context.next();
    }

    const authenticated = await validSession(
        context.request,
        context.env
    );

    if (!authenticated) {
        return Response.redirect(
            `${url.origin}/admin-login.html`,
            302
        );
    }

    return context.next();
}