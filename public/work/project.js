"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const projectHero =
        document.getElementById("project-hero");

    const projectNumber =
        document.getElementById("project-number");

    const projectCategory =
        document.getElementById("project-category");

    const projectTitle =
        document.getElementById("project-title");

    const projectDescription =
        document.getElementById("project-description");

    const projectGallery =
        document.getElementById("project-gallery");

    const projectGallerySection =
        document.getElementById("project-gallery-section");

    const projectError =
        document.getElementById("project-error");

    const year =
        document.getElementById("year");

    if (year) {
        year.textContent =
            new Date().getFullYear();
    }

    function getProjectSlug() {
        const pathname =
            window.location.pathname;

        const match = pathname.match(
            /^\/work\/([a-z0-9-]+)\/?$/i
        );

        if (!match) {
            return null;
        }

        return match[1];
    }

    function getMediaUrl(r2Key) {
        if (!r2Key) {
            return "";
        }

        const encodedKey = r2Key
            .split("/")
            .map((part) =>
                encodeURIComponent(part)
            )
            .join("/");

        return `/media/${encodedKey}`;
    }

    function showError() {
        if (projectHero) {
            projectHero.hidden = true;
        }

        if (projectGallerySection) {
            projectGallerySection.hidden = true;
        }

        if (projectError) {
            projectError.hidden = false;
        }

        document.title =
            "Project Not Found | Maybelin Works";
    }

    function renderProject(project) {
        if (projectNumber) {
            projectNumber.textContent =
                `PROJECT ${String(
                    project.project_number
                ).padStart(2, "0")}`;
        }

        if (projectCategory) {
            projectCategory.textContent =
                project.category ||
                "PORTFOLIO";
        }

        if (projectTitle) {
            projectTitle.textContent =
                project.title ||
                "Untitled Project";
        }

        if (projectDescription) {
            projectDescription.textContent =
                project.description ||
                "";
        }

        document.title =
            `${project.title || "Project"} | Maybelin Works`;
    }

    function createGalleryImage(
        source,
        alt
    ) {
        const figure =
            document.createElement("figure");

        figure.className =
            "project-gallery_item";

        const image =
            document.createElement("img");

        image.className =
            "project-gallery_image";

        image.src = source;

        image.alt =
            alt || "";

        image.loading =
            "lazy";

        figure.appendChild(image);

        return figure;
    }

    function renderGallery(
        project,
        media
    ) {
        if (!projectGallery) {
            return;
        }

        projectGallery.replaceChildren();

        if (media.length > 0) {
            media.forEach((item) => {
                const source =
                    item.url ||
                    getMediaUrl(
                        item.r2_key
                    );

                if (!source) {
                    return;
                }

                const image =
                    createGalleryImage(
                        source,
                        item.alt_text ||
                        project.title
                    );

                projectGallery.appendChild(
                    image
                );
            });

            return;
        }

        if (project.cover_url) {
            const cover =
                createGalleryImage(
                    project.cover_url,
                    project.cover_alt ||
                    project.title
                );

            projectGallery.appendChild(
                cover
            );

            return;
        }

        const empty =
            document.createElement("p");

        empty.className =
            "project-loading";

        empty.textContent =
            "Project images coming soon.";

        projectGallery.appendChild(
            empty
        );
    }

    async function loadProject() {
        const slug =
            getProjectSlug();

        console.log(
            "Project pathname:",
            window.location.pathname
        );

        console.log(
            "Project slug:",
            slug
        );

        if (!slug) {
            showError();
            return;
        }

        try {
            const response = await fetch(
                `/api/projects/${encodeURIComponent(slug)}`,
                {
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (!response.ok) {
                console.error(
                    "Project request failed:",
                    response.status
                );

                showError();
                return;
            }

            const data =
                await response.json();

            console.log(
                "Project data:",
                data
            );

            if (!data.project) {
                showError();
                return;
            }

            renderProject(
                data.project
            );

            renderGallery(
                data.project,
                Array.isArray(data.media)
                    ? data.media
                    : []
            );
        } catch (error) {
            console.error(
                "Unable to load project:",
                error
            );

            showError();
        }
    }

    loadProject();
});