const MAX_MEDIA_SIZE = 20 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/avif", "avif"]
]);

function json(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store"
            }
        }
    );
}

function validId(value) {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

function cleanAltText(value) {
    if (typeof value !== "string") {
        return null;
    }

    const cleaned = value.trim();

    if (!cleaned) {
        return null;
    }

    return cleaned.slice(0, 500);
}

function safeProjectSlug(slug) {
    return (
        String(slug || "project")
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, "-")
            .replace(/^-+|-+$/g, "") ||
        "project"
    );
}

function mediaUrl(r2Key) {
    const encodedKey = r2Key
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/");

    return `/media/${encodedKey}`;
}

function mediaResponse(media) {
    return {
        ...media,
        url: mediaUrl(media.r2_key)
    };
}

function decodeMediaKey(rawKey) {
    try {
        return rawKey
            .split("/")
            .map((part) => decodeURIComponent(part))
            .join("/");
    } catch {
        return null;
    }
}

function validateImageFile(file) {
    if (
        !file ||
        typeof file !== "object" ||
        typeof file.stream !== "function"
    ) {
        return {
            error: "Choose an image to upload."
        };
    }

    if (!file.size || file.size <= 0) {
        return {
            error: "That image appears to be empty."
        };
    }

    if (file.size > MAX_MEDIA_SIZE) {
        return {
            error: "Images must be 20 MB or smaller."
        };
    }

    const extension = ALLOWED_IMAGE_TYPES.get(file.type);

    if (!extension) {
        return {
            error: "Please upload a JPG, PNG, WebP, or AVIF image."
        };
    }

    return {
        extension
    };
}

async function getProject(env, projectId) {
    return env.DB
        .prepare(`
            SELECT
                id,
                slug,
                title
            FROM projects
            WHERE id = ?
            LIMIT 1
        `)
        .bind(projectId)
        .first();
}

async function getProjectMedia(env, projectId) {
    const result = await env.DB
        .prepare(`
            SELECT
                id,
                project_id,
                r2_key,
                alt_text,
                sort_order,
                created_at
            FROM project_media
            WHERE project_id = ?
            ORDER BY
                sort_order ASC,
                id ASC
        `)
        .bind(projectId)
        .all();

    return result.results.map(mediaResponse);
}

export async function handleGetMedia(request, env, rawKey) {
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
            "Media storage is not configured.",
            {
                status: 500
            }
        );
    }

    const key = decodeMediaKey(rawKey);

    if (
        !key ||
        (
            !key.startsWith("projects/") &&
            !key.startsWith("site/")
        )
    ) {
        return new Response(
            "Not Found",
            {
                status: 404
            }
        );
    }

    try {
        const object =
            request.method === "HEAD"
                ? await env.MEDIA.head(key)
                : await env.MEDIA.get(key);

        if (!object) {
            return new Response(
                "Not Found",
                {
                    status: 404
                }
            );
        }

        const headers = new Headers();

        object.writeHttpMetadata(headers);

        if (object.httpEtag) {
            headers.set(
                "ETag",
                object.httpEtag
            );
        }

        headers.set(
            "Cache-Control",
            "public, max-age=31536000, immutable"
        );

        headers.set(
            "X-Content-Type-Options",
            "nosniff"
        );

        headers.set(
            "Content-Disposition",
            "inline"
        );

        return new Response(
            request.method === "HEAD"
                ? null
                : object.body,
            {
                status: 200,
                headers
            }
        );
    } catch (error) {
        console.error(
            "Unable to load media:",
            error
        );

        return new Response(
            "Unable to load media.",
            {
                status: 500
            }
        );
    }
}

export async function handleUploadProjectMedia(
    request,
    env,
    projectId,
    username
) {
    if (request.method !== "POST") {
        return json(
            {
                error: "Method not allowed."
            },
            405
        );
    }

    if (!env.DB || !env.MEDIA) {
        return json(
            {
                error: "Media storage is not configured."
            },
            500
        );
    }

    const numericProjectId = validId(projectId);

    if (!numericProjectId) {
        return json(
            {
                error: "Invalid project."
            },
            400
        );
    }

    let formData;

    try {
        formData = await request.formData();
    } catch {
        return json(
            {
                error: "Invalid upload."
            },
            400
        );
    }

    const file = formData.get("file");
    const validation = validateImageFile(file);

    if (validation.error) {
        return json(
            {
                error: validation.error
            },
            400
        );
    }

    const altText = cleanAltText(
        formData.get("alt_text")
    );

    let project;

    try {
        project = await getProject(
            env,
            numericProjectId
        );
    } catch (error) {
        console.error(
            "Unable to find project:",
            error
        );

        return json(
            {
                error: "Unable to find that project."
            },
            500
        );
    }

    if (!project) {
        return json(
            {
                error: "Project not found."
            },
            404
        );
    }

    const slug = safeProjectSlug(project.slug);

    const key =
        `projects/${slug}/${crypto.randomUUID()}.${validation.extension}`;

    let nextOrder = 0;

    try {
        const orderResult = await env.DB
            .prepare(`
                SELECT
                    COALESCE(MAX(sort_order), -1) + 1 AS next_order
                FROM project_media
                WHERE project_id = ?
            `)
            .bind(numericProjectId)
            .first();

        nextOrder = Number(
            orderResult?.next_order
        ) || 0;
    } catch (error) {
        console.error(
            "Unable to determine media order:",
            error
        );

        return json(
            {
                error: "Unable to prepare the image upload."
            },
            500
        );
    }

    try {
        await env.MEDIA.put(
            key,
            file.stream(),
            {
                httpMetadata: {
                    contentType: file.type,
                    cacheControl:
                        "public, max-age=31536000, immutable"
                },
                customMetadata: {
                    projectId: String(numericProjectId),
                    originalName: String(
                        file.name || "image"
                    ).slice(0, 200),
                    uploadedBy: String(
                        username || "admin"
                    ).slice(0, 100)
                }
            }
        );

        await env.DB
            .prepare(`
                INSERT INTO project_media (
                    project_id,
                    r2_key,
                    alt_text,
                    sort_order
                )
                VALUES (?, ?, ?, ?)
            `)
            .bind(
                numericProjectId,
                key,
                altText,
                nextOrder
            )
            .run();

        const media = await env.DB
            .prepare(`
                SELECT
                    id,
                    project_id,
                    r2_key,
                    alt_text,
                    sort_order,
                    created_at
                FROM project_media
                WHERE r2_key = ?
                ORDER BY id DESC
                LIMIT 1
            `)
            .bind(key)
            .first();

        return json(
            {
                success: true,
                media: mediaResponse(media)
            },
            201
        );
    } catch (error) {
        console.error(
            "Unable to upload project media:",
            error
        );

        try {
            await env.MEDIA.delete(key);
        } catch (cleanupError) {
            console.error(
                "Unable to clean up failed upload:",
                cleanupError
            );
        }

        return json(
            {
                error: "Unable to upload the image."
            },
            500
        );
    }
}

export async function handleUploadAboutPhoto(
    request,
    env,
    username
) {
    if (request.method !== "POST") {
        return json(
            {
                error: "Method not allowed."
            },
            405
        );
    }

    if (!env.DB || !env.MEDIA) {
        return json(
            {
                error: "Media storage is not configured."
            },
            500
        );
    }

    let formData;

    try {
        formData = await request.formData();
    } catch {
        return json(
            {
                error: "Invalid upload."
            },
            400
        );
    }

    const file = formData.get("file");
    const validation = validateImageFile(file);

    if (validation.error) {
        return json(
            {
                error: validation.error
            },
            400
        );
    }

    let current;

    try {
        current = await env.DB
            .prepare(`
                SELECT about_photo_key
                FROM site_settings
                WHERE id = 1
                LIMIT 1
            `)
            .first();
    } catch (error) {
        console.error(
            "Unable to load current About photo:",
            error
        );

        return json(
            {
                error: "Unable to prepare the photo upload."
            },
            500
        );
    }

    const oldKey =
        current?.about_photo_key || null;

    const newKey =
        `site/about/${crypto.randomUUID()}.${validation.extension}`;

    try {
        await env.MEDIA.put(
            newKey,
            file.stream(),
            {
                httpMetadata: {
                    contentType: file.type,
                    cacheControl:
                        "public, max-age=31536000, immutable"
                },
                customMetadata: {
                    originalName: String(
                        file.name || "about-photo"
                    ).slice(0, 200),
                    uploadedBy: String(
                        username || "admin"
                    ).slice(0, 100),
                    usage: "about-photo"
                }
            }
        );

        try {
            await env.DB
                .prepare(`
                    UPDATE site_settings
                    SET
                        about_photo_key = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = 1
                `)
                .bind(newKey)
                .run();
        } catch (databaseError) {
            await env.MEDIA.delete(newKey);
            throw databaseError;
        }

        if (
            oldKey &&
            oldKey !== newKey &&
            oldKey.startsWith("site/about/")
        ) {
            try {
                await env.MEDIA.delete(oldKey);
            } catch (deleteError) {
                console.warn(
                    "New About photo saved, but the previous R2 object could not be removed:",
                    deleteError
                );
            }
        }

        return json(
            {
                success: true,
                about_photo_key: newKey,
                url: mediaUrl(newKey)
            },
            201
        );
    } catch (error) {
        console.error(
            "Unable to upload About photo:",
            error
        );

        return json(
            {
                error: "Unable to replace the About photo."
            },
            500
        );
    }
}

export async function handleDeleteProjectMedia(
    request,
    env,
    mediaId
) {
    if (request.method !== "DELETE") {
        return json(
            {
                error: "Method not allowed."
            },
            405
        );
    }

    if (!env.DB || !env.MEDIA) {
        return json(
            {
                error: "Media storage is not configured."
            },
            500
        );
    }

    const numericMediaId = validId(mediaId);

    if (!numericMediaId) {
        return json(
            {
                error: "Invalid image."
            },
            400
        );
    }

    let media;

    try {
        media = await env.DB
            .prepare(`
                SELECT
                    id,
                    project_id,
                    r2_key
                FROM project_media
                WHERE id = ?
                LIMIT 1
            `)
            .bind(numericMediaId)
            .first();
    } catch (error) {
        console.error(
            "Unable to find media:",
            error
        );

        return json(
            {
                error: "Unable to find that image."
            },
            500
        );
    }

    if (!media) {
        return json(
            {
                error: "Image not found."
            },
            404
        );
    }

    try {
        await env.MEDIA.delete(media.r2_key);

        await env.DB
            .prepare(`
                DELETE FROM project_media
                WHERE id = ?
            `)
            .bind(numericMediaId)
            .run();

        return json({
            success: true,
            media_id: numericMediaId
        });
    } catch (error) {
        console.error(
            "Unable to delete media:",
            error
        );

        return json(
            {
                error: "Unable to remove the image."
            },
            500
        );
    }
}

export async function handleReorderProjectMedia(
    request,
    env,
    projectId
) {
    if (request.method !== "PUT") {
        return json(
            {
                error: "Method not allowed."
            },
            405
        );
    }

    if (!env.DB) {
        return json(
            {
                error: "Database is not configured."
            },
            500
        );
    }

    const numericProjectId = validId(projectId);

    if (!numericProjectId) {
        return json(
            {
                error: "Invalid project."
            },
            400
        );
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return json(
            {
                error: "Invalid request."
            },
            400
        );
    }

    if (!Array.isArray(body.media_ids)) {
        return json(
            {
                error: "Image order is required."
            },
            400
        );
    }

    const mediaIds = body.media_ids.map(
        (value) => Number(value)
    );

    if (
        mediaIds.some(
            (id) =>
                !Number.isInteger(id) ||
                id <= 0
        )
    ) {
        return json(
            {
                error: "Invalid image order."
            },
            400
        );
    }

    if (
        new Set(mediaIds).size !==
        mediaIds.length
    ) {
        return json(
            {
                error: "An image was listed more than once."
            },
            400
        );
    }

    try {
        const currentMedia = await env.DB
            .prepare(`
                SELECT id
                FROM project_media
                WHERE project_id = ?
                ORDER BY
                    sort_order ASC,
                    id ASC
            `)
            .bind(numericProjectId)
            .all();

        const existingIds =
            currentMedia.results.map(
                (media) => Number(media.id)
            );

        if (
            existingIds.length !==
            mediaIds.length
        ) {
            return json(
                {
                    error: "The image list changed. Refresh and try again."
                },
                409
            );
        }

        const existingSet =
            new Set(existingIds);

        if (
            !mediaIds.every(
                (id) => existingSet.has(id)
            )
        ) {
            return json(
                {
                    error: "One or more images do not belong to this project."
                },
                400
            );
        }

        if (mediaIds.length > 0) {
            const statements = mediaIds.map(
                (id, index) =>
                    env.DB
                        .prepare(`
                            UPDATE project_media
                            SET sort_order = ?
                            WHERE
                                id = ?
                                AND project_id = ?
                        `)
                        .bind(
                            index,
                            id,
                            numericProjectId
                        )
            );

            await env.DB.batch(statements);
        }

        const media = await getProjectMedia(
            env,
            numericProjectId
        );

        return json({
            success: true,
            media
        });
    } catch (error) {
        console.error(
            "Unable to reorder media:",
            error
        );

        return json(
            {
                error: "Unable to save the image order."
            },
            500
        );
    }
}