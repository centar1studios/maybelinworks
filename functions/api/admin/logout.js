export function onRequestPost() {
    const cookie = [
        "maybelin_admin=",
        "HttpOnly",
        "Secure",
        "SameSite=Strict",
        "Path=/",
        "Max-Age=0"
    ].join("; ");

    return new Response(
        JSON.stringify({
            success: true
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
                "Set-Cookie": cookie
            }
        }
    );
}

export function onRequest() {
    return new Response(
        JSON.stringify({
            error: "Method not allowed."
        }),
        {
            status: 405,
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}