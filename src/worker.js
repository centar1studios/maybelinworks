"use strict";
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;
        if (pathname === "/api/health") {return Response.json({ok: true, site: "Maybelin Works"},{status: 200, headers: {"Cache-Control": "no-store"}});}
        if (pathname === "/admin" ||pathname === "/admin/") {return Response.redirect(`${url.origin}/admin/admin-dashboard.html`, 302);}
        if (pathname.startsWith("/media/")) {return handleMedia(request, env, pathname);}
        if (pathname.startsWith("/api/")) {return Response.json({error: "API route not found."},{status: 404, headers: {"Cache-Control": "no-store"}});}
        return env.ASSETS.fetch(request);}
    };

    async function handleMedia(request, env, pathname) {
    if (request.method !== "GET" &&request.method !== "HEAD") {
        return new Response("Method Not Allowed", {
            status: 405,headers: {
                "Allow": "GET, HEAD"}
            }
        );
    }

    if (!env.MEDIA) {
        console.error("MEDIA R2 binding is not configured.");
        return new Response("Media storage is unavailable.", {status: 500});
    }

    let key;
    try {
        key = decodeURIComponent(pathname.slice("/media/".length));
    } 

    catch {
        return new Response("Invalid media path.",{status: 400});
    }

    if (!key || key.includes("..") || key.startsWith("/")) {
        return new Response("Invalid media path.",{status: 400});
    }

    let object;
    try {
        object = await env.MEDIA.get(key);} catch (error) {
            console.error("Unable to retrieve R2 object:", error);
            return new Response("Unable to retrieve media.",{status: 500});
        }

    if (!object) {
        return new Response("Media not found.", {status: 404});
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    if (object.httpEtag) {
        headers.set("ETag", object.httpEtag);
    }

    if (!headers.has("Cache-Control")) {
        headers.set("Cache-Control", "public, max-age=3600");
    }

    headers.set("X-Content-Type-Options","nosniff");

    if (request.method === "HEAD") {
        return new Response(null, {status: 200, headers});
     }
    return new Response(object.body, {status: 200, headers});
}






