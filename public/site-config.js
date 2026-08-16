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

    const projectsToolbar = projectsDialog?.querySelector(
        ".dialog-toolbar"
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

    /* PROJECTS */

    const publicProjectList = document.querySelector(
        ".project-list"
    );

    const staticProjectArticles = Array.from(
        document.querySelectorAll(
            ".project-list > .project"
        )
    );

    const projectArticlesBySlug = new Map();

    let availableProjectArticles = [
        ...staticProjectArticles
    ];

    let currentProjectIndex = 0;

    /* CONNECT STATIC PROJECTS TO DATABASE SLUGS */

    staticProjectArticles.forEach((article) => {
        const title = article
            .querySelector(".project-info h3")
            ?.textContent
            .trim()
            .toLowerCase();

        if (title === "fenix") {
            article.dataset.projectSlug =
                "fenix";

            projectArticlesBySlug.set(
                "fenix",
                article
            );
        }

        if (
            title &&
            title.includes("casa guadalupe")
        ) {
            article.dataset.projectSlug =
                "casa-guadalupe";

            projectArticlesBySlug.set(
                "casa-guadalupe",
                article
            );
        }
    });

    /* PROJECT SWITCHER */

    let projectSwitcher = null;
    let previousProjectButton = null;
    let nextProjectButton = null;
    let projectCounter = null;

    if (
        projectsToolbar &&
        closeProjectsButton
    ) {
        projectSwitcher =
            document.createElement("div");

        projectSwitcher.className =
            "project-switcher";

        projectSwitcher.setAttribute(
            "aria-label",
            "Project navigation"
        );

        previousProjectButton =
            document.createElement("button");

        previousProjectButton.className =
            "project-switcher-button";

        previousProjectButton.type =
            "button";

        previousProjectButton.innerHTML =
            "&#8592; Previous Project";

        nextProjectButton =
            document.createElement("button");

        nextProjectButton.className =
            "project-switcher-button";

        nextProjectButton.type =
            "button";

        nextProjectButton.innerHTML =
            "Next Project &#8594;";

        projectCounter =
            document.createElement("span");

        projectCounter.className =
            "project-switcher-count";

        projectCounter.setAttribute(
            "aria-live",
            "polite"
        );

        projectSwitcher.append(
            previousProjectButton,
            projectCounter,
            nextProjectButton
        );

        projectsToolbar.insertBefore(
            projectSwitcher,
            closeProjectsButton
        );
    }

    /* PROJECT INDEX */

    function normalizeProjectIndex(index) {
        const total =
            availableProjectArticles.length;

        if (total === 0) {
            return 0;
        }

        return (
            (index % total) +
            total
        ) % total;
    }

    /* PROJECT TITLE */

    function getProjectTitle(article) {
        return (
            article
                ?.querySelector(
                    ".project-info h3"
                )
                ?.textContent
                .trim() ||
            "project"
        );
    }

    /* UPDATE SWITCHER */

    function updateProjectSwitcher() {
        const total =
            availableProjectArticles.length;

        if (!projectSwitcher) {
            return;
        }

        if (total === 0) {
            projectSwitcher.hidden = true;
            return;
        }

        projectSwitcher.hidden = false;

        if (projectCounter) {
            projectCounter.textContent =
                `${currentProjectIndex + 1} / ${total}`;
        }

        const multipleProjects =
            total > 1;

        if (previousProjectButton) {
            previousProjectButton.hidden =
                !multipleProjects;

            if (multipleProjects) {
                const previousIndex =
                    normalizeProjectIndex(
                        currentProjectIndex - 1
                    );

                const previousTitle =
                    getProjectTitle(
                        availableProjectArticles[
                            previousIndex
                        ]
                    );

                previousProjectButton.setAttribute(
                    "aria-label",
                    `View previous project: ${previousTitle}`
                );
            }
        }

        if (nextProjectButton) {
            nextProjectButton.hidden =
                !multipleProjects;

            if (multipleProjects) {
                const nextIndex =
                    normalizeProjectIndex(
                        currentProjectIndex + 1
                    );

                const nextTitle =
                    getProjectTitle(
                        availableProjectArticles[
                            nextIndex
                        ]
                    );

                nextProjectButton.setAttribute(
                    "aria-label",
                    `View next project: ${nextTitle}`
                );
            }
        }
    }

    /* SHOW PROJECT */

    function showProject(
        index,
        scrollToProject = true
    ) {
        const total =
            availableProjectArticles.length;

        staticProjectArticles.forEach(
            (article) => {
                article.hidden = true;

                article.classList.remove(
                    "project-current"
                );
            }
        );

        if (total === 0) {
            updateProjectSwitcher();
            return;
        }

        currentProjectIndex =
            normalizeProjectIndex(index);

        const currentArticle =
            availableProjectArticles[
                currentProjectIndex
            ];

        currentArticle.hidden = false;

        currentArticle.classList.add(
            "project-current"
        );

        updateProjectSwitcher();

        if (
            scrollToProject &&
            projectsDialog?.open
        ) {
            currentArticle.scrollIntoView({
                behavior: "auto",
                block: "start"
            });
        }
    }

    /* PREVIOUS PROJECT */

    function showPreviousProject() {
        if (
            availableProjectArticles.length <=
            1
        ) {
            return;
        }

        showProject(
            currentProjectIndex - 1
        );
    }

    /* NEXT PROJECT */

    function showNextProject() {
        if (
            availableProjectArticles.length <=
            1
        ) {
            return;
        }

        showProject(
            currentProjectIndex + 1
        );
    }

    previousProjectButton?.addEventListener(
        "click",
        showPreviousProject
    );

    nextProjectButton?.addEventListener(
        "click",
        showNextProject
    );

    /*
     * Start with only the first static project
     * visible while the database loads.
     */
    showProject(0, false);

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

            const data =
                await response.json();

            if (!data.settings) {
                return;
            }

            const settings =
                data.settings;

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
            meta.querySelectorAll(
                ":scope > div"
            )
        );

        return (
            rows.find((row) => {
                const heading = row
                    .querySelector("dt")
                    ?.textContent
                    .trim()
                    .toLowerCase();

                return (
                    heading ===
                    label.toLowerCase()
                );
            }) || null
        );
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
                document.createElement(
                    "div"
                );

            row.dataset.dynamicMeta =
                "true";

            const term =
                document.createElement(
                    "dt"
                );

            const description =
                document.createElement(
                    "dd"
                );

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
            .map((paragraph) =>
                paragraph.trim()
            )
            .filter(Boolean);

        paragraphs.forEach((text) => {
            const paragraph =
                document.createElement(
                    "p"
                );

            paragraph.textContent =
                text;

            container.appendChild(
                paragraph
            );
        });
    }

    /* APPLY PROJECT DATA */

    function applyProjectData(
        article,
        project,
        displayNumber
    ) {
        if (!article) {
            return;
        }

        const number =
            article.querySelector(
                ".project-number"
            );

        const kicker =
            article.querySelector(
                ".project-kicker"
            );

        const title =
            article.querySelector(
                ".project-info h3"
            );

        const description =
            article.querySelector(
                ".project-description"
            );

        const meta =
            article.querySelector(
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

    /* LOAD PROJECTS */

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

            const data =
                await response.json();

            if (
                !Array.isArray(
                    data.projects
                )
            ) {
                return;
            }

            const publishedArticles = [];

            data.projects.forEach(
                (project, index) => {
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
                        index + 1
                    );

                    /*
                     * Keep the project order
                     * synced with D1.
                     */
                    publicProjectList.appendChild(
                        article
                    );

                    publishedArticles.push(
                        article
                    );
                }
            );

            availableProjectArticles =
                publishedArticles;

            currentProjectIndex = 0;

            showProject(
                currentProjectIndex,
                false
            );
        } catch (error) {
            /*
             * If D1 cannot be reached,
             * keep the static portfolio usable.
             */
            availableProjectArticles = [
                ...staticProjectArticles
            ];

            currentProjectIndex = 0;

            showProject(
                currentProjectIndex,
                false
            );

            console.warn(
                "Portfolio projects couldn't be loaded. Using the default project information.",
                error
            );
        }
    }

    /* IMAGE LIGHTBOX */

    const allGalleryImages =
        Array.from(
            document.querySelectorAll(
                ".project-gallery img"
            )
        );

    let currentImageIndex = 0;
    let previousFocus = null;

    function getVisibleGalleryImages() {
        const currentProject =
            availableProjectArticles[
                currentProjectIndex
            ];

        if (!currentProject) {
            return [];
        }

        return Array.from(
            currentProject.querySelectorAll(
                ".project-gallery img"
            )
        );
    }

    const lightbox =
        document.createElement(
            "dialog"
        );

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
                data-lightbox-close
            >
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

    document.body.appendChild(
        lightbox
    );

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

    /* OPEN PROJECTS */

    if (
        openProjectsButton &&
        projectsDialog
    ) {
        openProjectsButton.addEventListener(
            "click",
            () => {
                /*
                 * Read More always begins
                 * with the first project.
                 */
                showProject(0, false);

                projectsDialog.showModal();

                projectsDialog.scrollTop = 0;

                updateDialogState();
            }
        );
    }

    /* CLOSE PROJECTS */

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

    /* OPEN ABOUT */

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

    /* CLOSE ABOUT */

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
            ) %
            galleryImages.length;

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
            ) %
            galleryImages.length;

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
                    openLightbox(
                        image
                    );
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

    /* KEYBOARD NAVIGATION */

    document.addEventListener(
        "keydown",
        (event) => {
            /*
             * When an image is open,
             * arrows change images.
             */
            if (lightbox.open) {
                const galleryImages =
                    getVisibleGalleryImages();

                if (
                    galleryImages.length ===
                    0
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
                        galleryImages.length -
                        1;

                    updateLightboxImage();
                }

                return;
            }

            /*
             * When the Projects viewer is open,
             * arrows change projects.
             */
            if (
                projectsDialog?.open &&
                availableProjectArticles.length >
                    1
            ) {
                if (
                    event.key ===
                    "ArrowLeft"
                ) {
                    event.preventDefault();

                    showPreviousProject();
                }

                if (
                    event.key ===
                    "ArrowRight"
                ) {
                    event.preventDefault();

                    showNextProject();
                }
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