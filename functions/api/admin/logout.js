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

export function onRequestPost() {
    const cookie = [
        "maybelin_admin=",
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

export function onRequest() {
    return json({
        error: "Method not allowed."
    }, 405);
}