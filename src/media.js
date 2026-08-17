const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/avif", "avif"]
]);

const ALLOWED_VIDEO_TYPES = new Map([
    ["video/mp4", "mp4"],
    ["video/webm", "webm"]
]);


/* RESPONSE */

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
        }
    });
}


/* HELPERS */

function validId(value) {
    const id = Number(value);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
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

function cleanOptionalText(value, maxLength) {
    if (typeof value !== "string") {
        return null;
    }

    const cleaned = value.trim();

    return cleaned
        ? cleaned.slice(0, maxLength)
        : null;
}

function cleanHttpUrl(value) {
    const cleaned = cleanOptionalText(value, 2000);

    if (!cleaned) {
        return null;
    }

    try {
        const url = new URL(cleaned);

        return url.protocol === "http:" || url.protocol === "https:"
            ? url.toString()
            : null;
    } catch {
        return null;
    }
}

function cleanFocalPoint(value, fallback = 50) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return Math.min(Math.max(number, 0), 100);
}

function safeProjectSlug(slug) {
    return String(slug || "project")
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "project";
}

function mediaUrl(r2Key) {
    const encodedKey = r2Key
        .split("/")
        .map(part => encodeURIComponent(part))
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
            .map(part => decodeURIComponent(part))
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

    if (file.size > MAX_IMAGE_SIZE) {
        return {
            error: "Images must be 20 MB or smaller."
        };
    }

    const extension = ALLOWED_IMAGE_TYPES.get(
        file.type
    );

    if (!extension) {
        return {
            error: "Please upload a JPG, PNG, WebP, or AVIF image."
        };
    }

    return {
        extension
    };
}

function validateProjectMediaFile(file) {
    if (
        !file ||
        typeof file !== "object" ||
        typeof file.stream !== "function"
    ) {
        return {
            error: "Choose an image or video to upload."
        };
    }

    if (!file.size || file.size <= 0) {
        return {
            error: "That file appears to be empty."
        };
    }

    const imageExtension = ALLOWED_IMAGE_TYPES.get(file.type);

    if (imageExtension) {
        if (file.size > MAX_IMAGE_SIZE) {
            return {
                error: "Images must be 20 MB or smaller."
            };
        }

        return {
            extension: imageExtension,
            mediaType: "image",
            mimeType: file.type
        };
    }

    const videoExtension = ALLOWED_VIDEO_TYPES.get(file.type);

    if (videoExtension) {
        if (file.size > MAX_VIDEO_SIZE) {
            return {
                error: "Videos must be 50 MB or smaller."
            };
        }

        return {
            extension: videoExtension,
            mediaType: "video",
            mimeType: file.type
        };
    }

    return {
        error: "Please upload a JPG, PNG, WebP, AVIF, MP4, or WebM file."
    };
}


/* PROJECT LOOKUP */

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


/* PROJECT MEDIA */

async function getProjectMedia(
    env,
    projectId
) {
    const result = await env.DB
        .prepare(`
            SELECT
                id,
                project_id,
                r2_key,
                media_type,
                mime_type,
                alt_text,
                caption,
                credit,
                external_url,
                focal_x,
                focal_y,
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

    return result.results.map(
        mediaResponse
    );
}


/* SERVE MEDIA */

export async function handleGetMedia(
    request,
    env,
    rawKey
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
        const object = request.method === "HEAD"
            ? await env.MEDIA.head(key)
            : await env.MEDIA.get(key, {
                range: request.headers
            });

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

        headers.set(
            "ETag",
            object.httpEtag
        );

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

        headers.set("Accept-Ranges", "bytes");

        let status = 200;

        if (
            request.method === "GET" &&
            request.headers.has("Range") &&
            object.range
        ) {
            let offset = 0;
            let length = object.size;

            if (
                "offset" in object.range &&
                Number.isFinite(object.range.offset)
            ) {
                offset = Number(object.range.offset);
                length = Number(object.range.length) ||
                    Math.max(object.size - offset, 0);
            } else if (
                "suffix" in object.range &&
                Number.isFinite(object.range.suffix)
            ) {
                length = Math.min(
                    Number(object.range.suffix),
                    object.size
                );
                offset = Math.max(object.size - length, 0);
            }

            headers.set(
                "Content-Range",
                `bytes ${offset}-${offset + length - 1}/${object.size}`
            );
            headers.set("Content-Length", String(length));
            status = 206;
        } else {
            headers.set("Content-Length", String(object.size));
        }

        return new Response(
            request.method === "HEAD"
                ? null
                : object.body,
            {
                status,
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


/* UPLOAD PROJECT MEDIA */

export async function handleUploadProjectMedia(
    request,
    env,
    projectId,
    username
) {
    if (request.method !== "POST") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    if (!env.DB || !env.MEDIA) {
        return json({
            error: "Media storage is not configured."
        }, 500);
    }

    const numericProjectId = validId(
        projectId
    );

    if (!numericProjectId) {
        return json({
            error: "Invalid project."
        }, 400);
    }

    let formData;

    try {
        formData = await request.formData();
    } catch {
        return json({
            error: "Invalid upload."
        }, 400);
    }

    const file = formData.get("file");
    const validation = validateProjectMediaFile(file);

    if (validation.error) {
        return json({
            error: validation.error
        }, 400);
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

        return json({
            error: "Unable to find that project."
        }, 500);
    }

    if (!project) {
        return json({
            error: "Project not found."
        }, 404);
    }

    const slug = safeProjectSlug(
        project.slug
    );

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

        return json({
            error: "Unable to prepare the media upload."
        }, 500);
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
                    projectId: String(
                        numericProjectId
                    ),
                    originalName: String(
                        file.name || validation.mediaType
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
                    media_type,
                    mime_type,
                    alt_text,
                    sort_order
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `)
            .bind(
                numericProjectId,
                key,
                validation.mediaType,
                validation.mimeType,
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
                    media_type,
                    mime_type,
                    alt_text,
                    caption,
                    credit,
                    external_url,
                    focal_x,
                    focal_y,
                    sort_order,
                    created_at
                FROM project_media
                WHERE r2_key = ?
                ORDER BY id DESC
                LIMIT 1
            `)
            .bind(key)
            .first();

        return json({
            success: true,
            media: mediaResponse(media)
        }, 201);
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

        return json({
            error: "Unable to upload the media file."
        }, 500);
    }
}


/* UPDATE PROJECT MEDIA DETAILS */

export async function handleUpdateProjectMedia(
    request,
    env,
    mediaId
) {
    if (request.method !== "PUT") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    if (!env.DB) {
        return json({
            error: "Database is not configured."
        }, 500);
    }

    const numericMediaId = validId(mediaId);

    if (!numericMediaId) {
        return json({
            error: "Invalid media item."
        }, 400);
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return json({
            error: "Invalid request."
        }, 400);
    }

    try {
        const current = await env.DB
            .prepare(`
                SELECT *
                FROM project_media
                WHERE id = ?
                LIMIT 1
            `)
            .bind(numericMediaId)
            .first();

        if (!current) {
            return json({
                error: "Media item not found."
            }, 404);
        }

        const altText = Object.prototype.hasOwnProperty.call(
            body,
            "alt_text"
        )
            ? cleanAltText(body.alt_text)
            : current.alt_text;
        const caption = Object.prototype.hasOwnProperty.call(
            body,
            "caption"
        )
            ? cleanOptionalText(body.caption, 1000)
            : current.caption;
        const credit = Object.prototype.hasOwnProperty.call(
            body,
            "credit"
        )
            ? cleanOptionalText(body.credit, 500)
            : current.credit;
        const externalUrl = Object.prototype.hasOwnProperty.call(
            body,
            "external_url"
        )
            ? cleanHttpUrl(body.external_url)
            : current.external_url;
        const focalX = cleanFocalPoint(
            body.focal_x,
            current.focal_x
        );
        const focalY = cleanFocalPoint(
            body.focal_y,
            current.focal_y
        );

        await env.DB
            .prepare(`
                UPDATE project_media
                SET
                    alt_text = ?,
                    caption = ?,
                    credit = ?,
                    external_url = ?,
                    focal_x = ?,
                    focal_y = ?
                WHERE id = ?
            `)
            .bind(
                altText,
                caption,
                credit,
                externalUrl,
                focalX,
                focalY,
                numericMediaId
            )
            .run();

        const media = await env.DB
            .prepare(`
                SELECT
                    id,
                    project_id,
                    r2_key,
                    media_type,
                    mime_type,
                    alt_text,
                    caption,
                    credit,
                    external_url,
                    focal_x,
                    focal_y,
                    sort_order,
                    created_at
                FROM project_media
                WHERE id = ?
                LIMIT 1
            `)
            .bind(numericMediaId)
            .first();

        return json({
            success: true,
            media: mediaResponse(media)
        });
    } catch (error) {
        console.error(
            "Unable to update media details:",
            error
        );

        return json({
            error: "Unable to save the media details."
        }, 500);
    }
}


/* ABOUT PHOTO */

export async function handleUploadAboutPhoto(
    request,
    env,
    username
) {
    if (request.method !== "POST") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    if (!env.DB || !env.MEDIA) {
        return json({
            error: "Media storage is not configured."
        }, 500);
    }

    let formData;

    try {
        formData = await request.formData();
    } catch {
        return json({
            error: "Invalid upload."
        }, 400);
    }

    const file = formData.get("file");
    const validation = validateImageFile(file);

    if (validation.error) {
        return json({
            error: validation.error
        }, 400);
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

        return json({
            error: "Unable to prepare the photo upload."
        }, 500);
    }

    const oldKey = current?.about_photo_key || null;
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

        return json({
            success: true,
            about_photo_key: newKey,
            url: mediaUrl(newKey)
        }, 201);
    } catch (error) {
        console.error(
            "Unable to upload About photo:",
            error
        );

        return json({
            error: "Unable to replace the About photo."
        }, 500);
    }
}


/* BRANDING ASSETS */

export async function handleUploadSiteAsset(
    request,
    env,
    username,
    assetType
) {
    if (request.method !== "POST") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    if (!env.DB || !env.MEDIA) {
        return json({
            error: "Media storage is not configured."
        }, 500);
    }

    const assetConfig = {
        logo: {
            column: "logo_key",
            folder: "logo",
            label: "website logo"
        },
        favicon: {
            column: "favicon_key",
            folder: "favicon",
            label: "tab logo"
        }
    }[assetType];

    if (!assetConfig) {
        return json({
            error: "Invalid branding asset."
        }, 400);
    }

    let formData;

    try {
        formData = await request.formData();
    } catch {
        return json({
            error: "Invalid upload."
        }, 400);
    }

    const file = formData.get("file");
    const validation = validateImageFile(file);

    if (validation.error) {
        return json({
            error: validation.error
        }, 400);
    }

    try {
        const current = await env.DB
            .prepare(`
                SELECT ${assetConfig.column} AS asset_key
                FROM site_settings
                WHERE id = 1
                LIMIT 1
            `)
            .first();
        const oldKey = current?.asset_key || null;
        const newKey = `site/${assetConfig.folder}/${
            crypto.randomUUID()
        }.${validation.extension}`;

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
                        file.name || assetConfig.folder
                    ).slice(0, 200),
                    uploadedBy: String(
                        username || "admin"
                    ).slice(0, 100),
                    usage: assetType
                }
            }
        );

        try {
            await env.DB
                .prepare(`
                    UPDATE site_settings
                    SET
                        ${assetConfig.column} = ?,
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
            oldKey.startsWith(`site/${assetConfig.folder}/`)
        ) {
            try {
                await env.MEDIA.delete(oldKey);
            } catch (deleteError) {
                console.warn(
                    `New ${assetConfig.label} saved, but the previous object could not be removed:`,
                    deleteError
                );
            }
        }

        return json({
            success: true,
            asset_type: assetType,
            key: newKey,
            url: mediaUrl(newKey)
        }, 201);
    } catch (error) {
        console.error(
            `Unable to upload ${assetConfig.label}:`,
            error
        );

        return json({
            error: `Unable to replace the ${assetConfig.label}.`
        }, 500);
    }
}


/* DELETE PROJECT MEDIA */

export async function handleDeleteProjectMedia(
    request,
    env,
    mediaId
) {
    if (request.method !== "DELETE") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    if (!env.DB || !env.MEDIA) {
        return json({
            error: "Media storage is not configured."
        }, 500);
    }

    const numericMediaId = validId(
        mediaId
    );

    if (!numericMediaId) {
        return json({
            error: "Invalid media item."
        }, 400);
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

        return json({
            error: "Unable to find that media item."
        }, 500);
    }

    if (!media) {
        return json({
            error: "Media item not found."
        }, 404);
    }

    try {
        await env.DB
            .prepare(`
                DELETE FROM project_media
                WHERE id = ?
            `)
            .bind(numericMediaId)
            .run();

        const remainingReferences = await env.DB
            .prepare(`
                SELECT COUNT(*) AS reference_count
                FROM project_media
                WHERE r2_key = ?
            `)
            .bind(media.r2_key)
            .first();

        if (Number(remainingReferences?.reference_count) === 0) {
            await env.MEDIA.delete(media.r2_key);
        }

        return json({
            success: true,
            media_id: numericMediaId
        });
    } catch (error) {
        console.error(
            "Unable to delete media:",
            error
        );

        return json({
            error: "Unable to remove the media item."
        }, 500);
    }
}


/* REORDER PROJECT MEDIA */

export async function handleReorderProjectMedia(
    request,
    env,
    projectId
) {
    if (request.method !== "PUT") {
        return json({
            error: "Method not allowed."
        }, 405);
    }

    if (!env.DB) {
        return json({
            error: "Database is not configured."
        }, 500);
    }

    const numericProjectId = validId(
        projectId
    );

    if (!numericProjectId) {
        return json({
            error: "Invalid project."
        }, 400);
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return json({
            error: "Invalid request."
        }, 400);
    }

    if (!Array.isArray(body.media_ids)) {
        return json({
            error: "Media order is required."
        }, 400);
    }

    const mediaIds = body.media_ids.map(
        value => Number(value)
    );

    if (
        mediaIds.some(
            id =>
                !Number.isInteger(id) ||
                id <= 0
        )
    ) {
        return json({
            error: "Invalid media order."
        }, 400);
    }

    if (
        new Set(mediaIds).size !==
        mediaIds.length
    ) {
        return json({
            error: "A media item was listed more than once."
        }, 400);
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

        const existingIds = currentMedia.results.map(
            media => Number(media.id)
        );

        if (
            existingIds.length !==
            mediaIds.length
        ) {
            return json({
                error: "The media list changed. Refresh and try again."
            }, 409);
        }

        const existingSet = new Set(
            existingIds
        );

        if (
            !mediaIds.every(
                id => existingSet.has(id)
            )
        ) {
            return json({
                error: "One or more media items do not belong to this project."
            }, 400);
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

        return json({
            error: "Unable to save the media order."
        }, 500);
    }
}
