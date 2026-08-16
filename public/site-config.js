document.addEventListener("DOMContentLoaded", () => {
    /* DIALOGS */

    const projectsDialog = document.querySelector(
        "[data-projects-dialog]"
    );

    const openProjectsButton = document.querySelector(
        "[data-open-projects]"
    );

    const closeProjectsButton = document.querySelector(
        "[data-close-projects]"
    );

    const aboutDialog = document.querySelector(
        "[data-about-dialog]"
    );

    const openAboutButton = document.querySelector(
        "[data-open-about]"
    );

    const closeAboutButton = document.querySelector(
        "[data-close-about]"
    );

    /* HOMEPAGE */

    const heroKicker = document.querySelector(
        ".hero-kicker"
    );

    const heroTitle = document.querySelector(
        ".hero-title"
    );

    const currentYear = document.querySelector(
        "[data-current-year]"
    );

    if (currentYear) {
        currentYear.textContent =
            new Date().getFullYear();
    }

    /* PUBLIC PROJECTS */

    const publicProjectList =
        document.querySelector(".project-list");

    const staticProjectArticles = Array.from(
        document.querySelectorAll(
            ".project-list > .project"
        )
    );

    const projectArticlesBySlug =
        new Map();

    staticProjectArticles.forEach((article) => {
        const title = article
            .querySelector(".project-info h3")
            ?.textContent
            .trim()
            .toLowerCase();

        if (title === "fenix") {
            projectArticlesBySlug.set(
                "fenix",
                article
            );
        }

        if (
            title &&
            title.includes(
                "casa guadalupe"
            )
        ) {
            projectArticlesBySlug.set(
                "casa-guadalupe",
                article
            );
        }
    });

    /* LOAD HOMEPAGE SETTINGS */

    async function loadSiteSettings() {
        try {
            const response = await fetch(
                "/api/settings",
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load website settings."
                );
            }

            const data = await response.json();

            if (!data.settings) {
                return;
            }

            const settings = data.settings;

            if (
                heroKicker &&
                typeof settings.hero_kicker ===
                    "string" &&
                settings.hero_kicker.trim()
            ) {
                heroKicker.textContent =
                    settings.hero_kicker;
            }

            if (
                heroTitle &&
                typeof settings.hero_title ===
                    "string" &&
                settings.hero_title.trim()
            ) {
                heroTitle.textContent =
                    settings.hero_title;
            }
        } catch (error) {
            console.warn(
                "Website settings couldn't be loaded. Using the default homepage text.",
                error
            );
        }
    }

    /* FIND PROJECT META */

    function findMetaRow(meta, label) {
        if (!meta) {
            return null;
        }

        const rows = Array.from(
            meta.querySelectorAll(":scope > div")
        );

        return rows.find((row) => {
            const heading = row
                .querySelector("dt")
                ?.textContent
                .trim()
                .toLowerCase();

            return heading ===
                label.toLowerCase();
        }) || null;
    }

    /* UPDATE PROJECT META */

    function setProjectMeta(
        meta,
        label,
        value
    ) {
        if (!meta) {
            return;
        }

        let row = findMetaRow(
            meta,
            label
        );

        if (!value) {
            if (
                row &&
                row.dataset.dynamicMeta ===
                    "true"
            ) {
                row.remove();
            }

            return;
        }

        if (!row) {
            row =
                document.createElement("div");

            row.dataset.dynamicMeta =
                "true";

            const term =
                document.createElement("dt");

            const description =
                document.createElement("dd");

            term.textContent = label;

            row.append(
                term,
                description
            );

            meta.appendChild(row);
        }

        const description =
            row.querySelector("dd");

        if (description) {
            description.textContent =
                String(value);
        }
    }

    /* PROJECT PARAGRAPHS */

    function updateProjectDescription(
        container,
        description
    ) {
        if (!container) {
            return;
        }

        container.replaceChildren();

        if (!description) {
            return;
        }

        const paragraphs = description
            .split(/\n\s*\n/)
            .map(paragraph =>
                paragraph.trim()
            )
            .filter(Boolean);

        paragraphs.forEach((text) => {
            const paragraph =
                document.createElement("p");

            paragraph.textContent = text;

            container.appendChild(
                paragraph
            );
        });
    }

    /* APPLY PROJECT */

    function applyProjectData(
        article,
        project,
        displayNumber
    ) {
        if (!article) {
            return;
        }

        article.hidden = false;

        const number = article.querySelector(
            ".project-number"
        );

        const kicker = article.querySelector(
            ".project-kicker"
        );

        const title = article.querySelector(
            ".project-info h3"
        );

        const description =
            article.querySelector(
                ".project-description"
            );

        const meta = article.querySelector(
            ".project-meta"
        );

        if (number) {
            number.textContent =
                `Project ${String(
                    displayNumber
                ).padStart(2, "0")}`;
        }

        if (kicker) {
            kicker.textContent =
                project.kicker ||
                "Portfolio Project";
        }

        if (title) {
            title.textContent =
                project.title ||
                "Untitled Project";
        }

        updateProjectDescription(
            description,
            project.description
        );

        setProjectMeta(
            meta,
            "Type",
            project.kicker
        );

        setProjectMeta(
            meta,
            "Role",
            project.role
        );

        setProjectMeta(
            meta,
            "Year",
            project.year
        );
    }

    /* LOAD PUBLIC PROJECTS */

    async function loadProjects() {
        if (
            !publicProjectList ||
            projectArticlesBySlug.size === 0
        ) {
            return;
        }

        try {
            const response = await fetch(
                "/api/projects",
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load portfolio projects."
                );
            }

            const data = await response.json();

            if (
                !Array.isArray(
                    data.projects
                )
            ) {
                return;
            }

            /*
             * The public API only returns projects
             * marked as visible.
             */
            projectArticlesBySlug.forEach(
                (article) => {
                    article.hidden = true;
                }
            );

            let displayNumber = 1;

            data.projects.forEach(
                (project) => {
                    const article =
                        projectArticlesBySlug.get(
                            project.slug
                        );

                    if (!article) {
                        return;
                    }

                    applyProjectData(
                        article,
                        project,
                        displayNumber
                    );

                    /*
                     * This also keeps the public
                     * order synced with D1.
                     */
                    publicProjectList.appendChild(
                        article
                    );

                    displayNumber += 1;
                }
            );
        } catch (error) {
            /*
             * Leave the original project text visible
             * if the database cannot be reached.
             */
            projectArticlesBySlug.forEach(
                (article) => {
                    article.hidden = false;
                }
            );

            console.warn(
                "Portfolio projects couldn't be loaded. Using the default project information.",
                error
            );
        }
    }

    /* IMAGE LIGHTBOX */

    const allGalleryImages = Array.from(
        document.querySelectorAll(
            ".project-gallery img"
        )
    );

    let currentImageIndex = 0;
    let previousFocus = null;

    function getVisibleGalleryImages() {
        return allGalleryImages.filter(
            (image) => {
                const project =
                    image.closest(".project");

                return !project?.hidden;
            }
        );
    }

    const lightbox =
        document.createElement("dialog");

    lightbox.className =
        "portfolio-lightbox";

    lightbox.setAttribute(
        "aria-label",
        "Portfolio image viewer"
    );

    lightbox.innerHTML = `
        <div class="portfolio-lightbox-toolbar">
            <p
                class="portfolio-lightbox-count"
                data-lightbox-count
                aria-live="polite"
            ></p>

            <button
                class="portfolio-lightbox-close"
                type="button"
                data-lightbox-close>
                Close
            </button>
        </div>

        <div class="portfolio-lightbox-stage">
            <button
                class="portfolio-lightbox-nav portfolio-lightbox-prev"
                type="button"
                data-lightbox-prev
                aria-label="View previous image"
            >
                &#8592;
            </button>

            <figure class="portfolio-lightbox-figure">
                <img
                    data-lightbox-image
                    src=""
                    alt=""
                >

                <figcaption
                    data-lightbox-caption
                ></figcaption>
            </figure>

            <button
                class="portfolio-lightbox-nav portfolio-lightbox-next"
                type="button"
                data-lightbox-next
                aria-label="View next image"
            >
                &#8594;
            </button>
        </div>
    `;

    document.body.appendChild(lightbox);

    const lightboxImage =
        lightbox.querySelector(
            "[data-lightbox-image]"
        );

    const lightboxCaption =
        lightbox.querySelector(
            "[data-lightbox-caption]"
        );

    const lightboxCount =
        lightbox.querySelector(
            "[data-lightbox-count]"
        );

    const lightboxClose =
        lightbox.querySelector(
            "[data-lightbox-close]"
        );

    const lightboxPrevious =
        lightbox.querySelector(
            "[data-lightbox-prev]"
        );

    const lightboxNext =
        lightbox.querySelector(
            "[data-lightbox-next]"
        );

    /* BODY SCROLL */

    function updateDialogState() {
        const anyDialogOpen =
            projectsDialog?.open ||
            aboutDialog?.open ||
            lightbox.open;

        document.body.classList.toggle(
            "dialog-open",
            Boolean(anyDialogOpen)
        );
    }

    /* PROJECT DIALOG */

    if (
        openProjectsButton &&
        projectsDialog
    ) {
        openProjectsButton.addEventListener(
            "click",
            () => {
                projectsDialog.showModal();
                updateDialogState();
            }
        );
    }

    if (
        closeProjectsButton &&
        projectsDialog
    ) {
        closeProjectsButton.addEventListener(
            "click",
            () => {
                projectsDialog.close();
                updateDialogState();
            }
        );
    }

    /* ABOUT DIALOG */

    if (
        openAboutButton &&
        aboutDialog
    ) {
        openAboutButton.addEventListener(
            "click",
            () => {
                aboutDialog.showModal();
                updateDialogState();
            }
        );
    }

    if (
        closeAboutButton &&
        aboutDialog
    ) {
        closeAboutButton.addEventListener(
            "click",
            () => {
                aboutDialog.close();
                updateDialogState();
            }
        );
    }

    projectsDialog?.addEventListener(
        "close",
        updateDialogState
    );

    aboutDialog?.addEventListener(
        "close",
        updateDialogState
    );

    /* IMAGE DETAILS */

    function updateLightboxImage() {
        const galleryImages =
            getVisibleGalleryImages();

        const image =
            galleryImages[
                currentImageIndex
            ];

        if (!image) {
            return;
        }

        const imageSource =
            image.currentSrc ||
            image.src;

        const imageAlt =
            image.alt ||
            "Portfolio artwork";

        lightboxImage.src =
            imageSource;

        lightboxImage.alt =
            imageAlt;

        lightboxCaption.textContent =
            imageAlt;

        lightboxCount.textContent =
            `${currentImageIndex + 1} / ${galleryImages.length}`;

        const hasMultipleImages =
            galleryImages.length > 1;

        lightboxPrevious.hidden =
            !hasMultipleImages;

        lightboxNext.hidden =
            !hasMultipleImages;
    }

    /* OPEN IMAGE */

    function openLightbox(image) {
        const galleryImages =
            getVisibleGalleryImages();

        const imageIndex =
            galleryImages.indexOf(
                image
            );

        if (imageIndex === -1) {
            return;
        }

        currentImageIndex =
            imageIndex;

        previousFocus =
            document.activeElement;

        updateLightboxImage();

        if (!lightbox.open) {
            lightbox.showModal();
        }

        updateDialogState();

        lightboxClose.focus();
    }

    /* CLOSE IMAGE */

    function closeLightbox() {
        if (!lightbox.open) {
            return;
        }

        lightbox.close();

        if (
            previousFocus &&
            typeof previousFocus.focus ===
                "function"
        ) {
            previousFocus.focus();
        }

        updateDialogState();
    }

    /* PREVIOUS IMAGE */

    function showPreviousImage() {
        const galleryImages =
            getVisibleGalleryImages();

        if (
            galleryImages.length === 0
        ) {
            return;
        }

        currentImageIndex =
            (
                currentImageIndex -
                1 +
                galleryImages.length
            ) % galleryImages.length;

        updateLightboxImage();
    }

    /* NEXT IMAGE */

    function showNextImage() {
        const galleryImages =
            getVisibleGalleryImages();

        if (
            galleryImages.length === 0
        ) {
            return;
        }

        currentImageIndex =
            (
                currentImageIndex +
                1
            ) % galleryImages.length;

        updateLightboxImage();
    }

    /* MAKE IMAGES CLICKABLE */

    allGalleryImages.forEach(
        (image) => {
            image.classList.add(
                "portfolio-zoomable"
            );

            image.setAttribute(
                "tabindex",
                "0"
            );

            image.setAttribute(
                "role",
                "button"
            );

            const imageDescription =
                image.alt ||
                "portfolio image";

            image.setAttribute(
                "aria-label",
                `View larger: ${imageDescription}`
            );

            image.addEventListener(
                "click",
                () => {
                    openLightbox(image);
                }
            );

            image.addEventListener(
                "keydown",
                (event) => {
                    if (
                        event.key ===
                            "Enter" ||
                        event.key ===
                            " "
                    ) {
                        event.preventDefault();

                        openLightbox(
                            image
                        );
                    }
                }
            );
        }
    );

    /* LIGHTBOX BUTTONS */

    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );

    lightboxPrevious.addEventListener(
        "click",
        showPreviousImage
    );

    lightboxNext.addEventListener(
        "click",
        showNextImage
    );

    /* CLICK BACKGROUND */

    lightbox.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                lightbox
            ) {
                closeLightbox();
            }
        }
    );

    /* ESCAPE */

    lightbox.addEventListener(
        "cancel",
        (event) => {
            event.preventDefault();
            closeLightbox();
        }
    );

    /* KEYBOARD */

    document.addEventListener(
        "keydown",
        (event) => {
            if (!lightbox.open) {
                return;
            }

            const galleryImages =
                getVisibleGalleryImages();

            if (
                galleryImages.length === 0
            ) {
                return;
            }

            if (
                event.key ===
                "ArrowLeft"
            ) {
                event.preventDefault();
                showPreviousImage();
            }

            if (
                event.key ===
                "ArrowRight"
            ) {
                event.preventDefault();
                showNextImage();
            }

            if (
                event.key ===
                "Home"
            ) {
                event.preventDefault();

                currentImageIndex = 0;

                updateLightboxImage();
            }

            if (
                event.key ===
                "End"
            ) {
                event.preventDefault();

                currentImageIndex =
                    galleryImages.length - 1;

                updateLightboxImage();
            }
        }
    );

    lightbox.addEventListener(
        "close",
        updateDialogState
    );

    /* START */

    Promise.all([
        loadSiteSettings(),
        loadProjects()
    ]);
});