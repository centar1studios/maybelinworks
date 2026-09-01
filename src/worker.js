"use strict";
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;
            if (pathname === "/api/site" && request.method === "GET") {
            return handleGetSite(env);
        }

        if (pathname === "/api/health" && request.method === "GET") {
            return json({
                ok: true,
                site: "Maybelin Works"
            });
        }

         if (pathname === "/admin" || pathname === "/admin/"
        ) {
            return Response.redirect(
                `${url.origin}/admin/index.html`,
                302
            );
        }

        if (pathname.startsWith("/media/")) {
            return handleMedia(
                request,
                env,
                pathname
            );
        }

         if (pathname.startsWith("/api/")) {
            return json(
                {
                    error: "API route not found."
                }, 404
            );
        }
        return env.ASSETS.fetch(request);
    }
};

function json(
    data,
    status = 200
) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                "Content-Type":
                    "application/json; charset=utf-8",

                "Cache-Control":
                    "no-store",

                "X-Content-Type-Options":
                    "nosniff"
            }
        }
    );

}

async function handleGetSite(env) {
    if (!env.DB) {
        return json(
            {
                error: "Database binding is unavailable."
            }, 500
        );
    }
    try {
        const settings = await env.DB
            .prepare(`
                SELECT
                    site_nav_works_label,
                    site_nav_about_label,
                    hero_tagline_top,
                    hero_tagline_bottom,
                    hero_video_url,
                    works_label,
                    works_title,
                    works_intro,
                    about_label,
                    about_title,
                    about_text,
                    about_photo_url,
                    about_photo_alt,
                    footer_brand,
                    footer_credit,
                    updated_at
                FROM site_content
                WHERE id = 1
                LIMIT 1
            `)
            .first();

        if (!settings) {
            return json(
                {
                    error: "Site content was not found."
                },
                404
            );
        }

           const projectsResult = await env.DB
            .prepare(`
                SELECT
                    id,
                    slug,
                    project_number,
                    category,
                    title,
                    description,
                    cover_url,
                    cover_alt,
                    project_url,
                    sort_order
                FROM projects
                WHERE is_published = 1
                ORDER BY
                    sort_order ASC,
                    project_number ASC,
                    id ASC
            `)
            .all();

        return json({
            settings,
            projects:
                projectsResult.results || []
        });

    } catch (error) {
        console.error(
            "Unable to load frontend content:",
            error
        );

        return json(
            {
                error: "Unable to load site content."
            },
            500
        );
    }
}

async function handleMedia(
    request,
    env,
    pathname
) {
    if (
        request.method !== "GET" &&
        request.method !== "HEAD"
    ) {
        return new Response(
            "Method Not Allowed",
            {
                status: 405,
                headers: {
                    "Allow": "GET, HEAD"
                }
            }
        );
    }

    if (!env.MEDIA) {
        return new Response(
            "Media storage unavailable.",
            {
                status: 500
            }
        );
    }

    let key;

    try {
        key = decodeURIComponent(
            pathname.slice(
                "/media/".length
            )
        );

    } catch {
        return new Response(
            "Invalid media path.",
            {
                status: 400
            }
        );
    }


    if (!key || key.startsWith("/") || key.includes("..")
    ) {return new Response(
            "Invalid media path.",
            {
                status: 400
            }
        );
    }

    const object = await env.MEDIA.get(
        key
    );


    if (!object) {
        return new Response(
            "Media not found.",
            {
                status: 404
            }
        );

    }

    const headers =
        new Headers();
    object.writeHttpMetadata(
        headers
    );


    if (object.httpEtag) {
        headers.set(
            "ETag",
            object.httpEtag
        );
    }

    if (
        !headers.has(
            "Cache-Control"
        )
    ) {
        headers.set(
            "Cache-Control",
            "public, max-age=3600"
        );

    }

    headers.set(
        "X-Content-Type-Options",
        "nosniff"
    );

    if (
        request.method === "HEAD"
    ) {
        return new Response(
            null,
            {
                status: 200,
                headers
            }
        );
    }

    return new Response(
        object.body,
        {
            status: 200,
            headers
        }
    );
}



