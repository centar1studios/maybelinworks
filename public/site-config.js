document.addEventListener("DOMContentLoaded", () => {
    /* FONTS */

    const GOOGLE_FONTS = new Map([
        ["Playfair Display", "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400"],
        ["Cormorant Garamond", "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400"],
        ["DM Serif Display", "DM+Serif+Display:ital@0;1"],
        ["Libre Baskerville", "Libre+Baskerville:ital,wght@0,400;0,700;1,400"],
        ["Cardo", "Cardo:ital,wght@0,400;0,700;1,400"],
        ["Lato", "Lato:wght@300;400;700;900"],
        ["Inter", "Inter:wght@300;400;500;600;700;800"],
        ["Montserrat", "Montserrat:wght@300;400;500;600;700;800"],
        ["Nunito", "Nunito:wght@300;400;500;600;700;800"],
        ["Source Sans 3", "Source+Sans+3:wght@300;400;500;600;700;800"],
        ["Hind", "Hind:wght@300;400;500;600;700"]
    ]);

    const loadedFonts = new Set([
        "Playfair Display",
        "Lato"
    ]);

    function loadGoogleFont(fontName) {
        if (!fontName || loadedFonts.has(fontName)) {
            return;
        }

        const googleName = GOOGLE_FONTS.get(fontName);

        if (!googleName) {
            return;
        }

        const link = document.createElement("link");

        link.rel = "stylesheet";
        link.href =
            `https://fonts.googleapis.com/css2?family=${googleName}&display=swap`;

        document.head.appendChild(link);

        loadedFonts.add(fontName);
    }

    function applySiteFonts(settings) {
        const displayFont =
            settings.display_font ||
            "Playfair Display";

        const bodyFont =
            settings.body_font ||
            "Lato";

        loadGoogleFont(displayFont);
        loadGoogleFont(bodyFont);

        document.documentElement.style.setProperty(
            "--font-display",
            `"${displayFont}", Georgia, serif`
        );

        document.documentElement.style.setProperty(
            "--font-body",
            `"${bodyFont}", Arial, sans-serif`
        );
    }


    /* DIALOGS */

    const projectsDialog =
        document.querySelector(
            "[data-projects-dialog]"
        );

    const openProjectsButton =
        document.querySelector(
            "[data-open-projects]"
        );

    const closeProjectsButton =
        document.querySelector(
            "[data-close-projects]"
        );

    const aboutDialog =
        document.querySelector(
            "[data-about-dialog]"
        );

    const openAboutButton =
        document.querySelector(
            "[data-open-about]"
        );

    const closeAboutButton =
        document.querySelector(
            "[data-close-about]"
        );

    const projectsToolbar =
        projectsDialog?.querySelector(
            ".dialog-toolbar"
        );


    /* HOMEPAGE */

    const heroKicker =
        document.querySelector(
            ".hero-kicker"
        );

    const heroTitle =
        document.querySelector(
            ".hero-title"
        );

    const currentYear =
        document.querySelector(
            "[data-current-year]"
        );

    if (currentYear) {
        currentYear.textContent =
            new Date().getFullYear();
    }


    /* PROJECTS */

    const publicProjectList =
        document.querySelector(
            ".project-list"
        );

    const staticProjectArticles =
        Array.from(
            document.querySelectorAll(
                ".project-list > .project"
            )
        );

    const projectArticlesBySlug =
        new Map();

    let availableProjectArticles = [
        ...staticProjectArticles
    ];

    let currentProjectIndex = 0;


    /* CONNECT PROJECTS */

    staticProjectArticles.forEach(
        (article) => {
            const title =
                article
                    .querySelector(
                        ".project-info h3"
                    )
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
                title?.includes(
                    "casa guadalupe"
                )
            ) {
                article.dataset.projectSlug =
                    "casa-guadalupe";

                projectArticlesBySlug.set(
                    "casa-guadalupe",
                    article
                );
            }
        }
    );


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
            document.createElement(
                "div"
            );

        projectSwitcher.className =
            "project-switcher";

        projectSwitcher.setAttribute(
            "aria-label",
            "Project navigation"
        );

        previousProjectButton =
            document.createElement(
                "button"
            );

        previousProjectButton.className =
            "project-switcher-button";

        previousProjectButton.type =
            "button";

        previousProjectButton.innerHTML =
            "&#8592; Previous Project";

        projectCounter =
            document.createElement(
                "span"
            );

        projectCounter.className =
            "project-switcher-count";

        projectCounter.setAttribute(
            "aria-live",
            "polite"
        );

        nextProjectButton =
            document.createElement(
                "button"
            );

        nextProjectButton.className =
            "project-switcher-button";

        nextProjectButton.type =
            "button";

        nextProjectButton.innerHTML =
            "Next Project &#8594;";

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

    function normalizeProjectIndex(index) {
        const total =
            availableProjectArticles.length;

        if (!total) {
            return 0;
        }

        return (
            (index % total) +
            total
        ) % total;
    }

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

    function updateProjectSwitcher() {
        if (!projectSwitcher) {
            return;
        }

        const total =
            availableProjectArticles.length;

        if (!total) {
            projectSwitcher.hidden =
                true;

            return;
        }

        projectSwitcher.hidden =
            false;

        projectCounter.textContent =
            `${currentProjectIndex + 1} / ${total}`;

        const multiple =
            total > 1;

        previousProjectButton.hidden =
            !multiple;

        nextProjectButton.hidden =
            !multiple;

        if (!multiple) {
            return;
        }

        const previousIndex =
            normalizeProjectIndex(
                currentProjectIndex - 1
            );

        const nextIndex =
            normalizeProjectIndex(
                currentProjectIndex + 1
            );

        previousProjectButton.setAttribute(
            "aria-label",
            `View previous project: ${getProjectTitle(
                availableProjectArticles[
                    previousIndex
                ]
            )}`
        );

        nextProjectButton.setAttribute(
            "aria-label",
            `View next project: ${getProjectTitle(
                availableProjectArticles[
                    nextIndex
                ]
            )}`
        );
    }

    function showProject(
        index,
        scrollToProject = true
    ) {
        staticProjectArticles.forEach(
            (article) => {
                article.hidden =
                    true;

                article.classList.remove(
                    "project-current"
                );
            }
        );

        if (
            !availableProjectArticles.length
        ) {
            updateProjectSwitcher();
            return;
        }

        currentProjectIndex =
            normalizeProjectIndex(
                index
            );

        const currentArticle =
            availableProjectArticles[
                currentProjectIndex
            ];

        currentArticle.hidden =
            false;

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

    function showPreviousProject() {
        if (
            availableProjectArticles.length >
            1
        ) {
            showProject(
                currentProjectIndex - 1
            );
        }
    }

    function showNextProject() {
        if (
            availableProjectArticles.length >
            1
        ) {
            showProject(
                currentProjectIndex + 1
            );
        }
    }

    previousProjectButton
        ?.addEventListener(
            "click",
            showPreviousProject
        );

    nextProjectButton
        ?.addEventListener(
            "click",
            showNextProject
        );

    showProject(
        0,
        false
    );


    /* MEDIA URL */

    function getMediaUrl(media) {
        if (media?.url) {
            return media.url;
        }

        if (!media?.r2_key) {
            return "";
        }

        const encodedKey =
            media.r2_key
                .split("/")
                .map(
                    part =>
                        encodeURIComponent(
                            part
                        )
                )
                .join("/");

        return `/media/${encodedKey}`;
    }


    /* PROJECT META */

    function findMetaRow(
        meta,
        label
    ) {
        if (!meta) {
            return null;
        }

        return (
            Array.from(
                meta.querySelectorAll(
                    ":scope > div"
                )
            ).find(
                row =>
                    row
                        .querySelector(
                            "dt"
                        )
                        ?.textContent
                        .trim()
                        .toLowerCase() ===
                    label.toLowerCase()
            ) ||
            null
        );
    }

    function setProjectMeta(
        meta,
        label,
        value
    ) {
        if (!meta) {
            return;
        }

        let row =
            findMetaRow(
                meta,
                label
            );

        if (!value) {
            if (
                row?.dataset
                    .dynamicMeta ===
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

            const dt =
                document.createElement(
                    "dt"
                );

            const dd =
                document.createElement(
                    "dd"
                );

            dt.textContent =
                label;

            row.append(
                dt,
                dd
            );

            meta.appendChild(
                row
            );
        }

        const dd =
            row.querySelector(
                "dd"
            );

        if (dd) {
            dd.textContent =
                String(value);
        }
    }

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

        description
            .split(/\n\s*\n/)
            .map(
                paragraph =>
                    paragraph.trim()
            )
            .filter(Boolean)
            .forEach(
                text => {
                    const paragraph =
                        document.createElement(
                            "p"
                        );

                    paragraph.textContent =
                        text;

                    container.appendChild(
                        paragraph
                    );
                }
            );
    }


    /* LIGHTBOX */

    let currentImageIndex = 0;
    let previousFocus = null;

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

    function updateLightboxImage() {
        const images =
            getVisibleGalleryImages();

        const image =
            images[
                currentImageIndex
            ];

        if (!image) {
            return;
        }

        const alt =
            image.alt ||
            "Portfolio artwork";

        lightboxImage.src =
            image.currentSrc ||
            image.src;

        lightboxImage.alt =
            alt;

        lightboxCaption.textContent =
            alt;

        lightboxCount.textContent =
            `${currentImageIndex + 1} / ${images.length}`;

        const multiple =
            images.length > 1;

        lightboxPrevious.hidden =
            !multiple;

        lightboxNext.hidden =
            !multiple;
    }

    function openLightbox(image) {
        const images =
            getVisibleGalleryImages();

        const index =
            images.indexOf(
                image
            );

        if (index === -1) {
            return;
        }

        currentImageIndex =
            index;

        previousFocus =
            document.activeElement;

        updateLightboxImage();

        if (!lightbox.open) {
            lightbox.showModal();
        }

        updateDialogState();

        lightboxClose.focus();
    }

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

    function showPreviousImage() {
        const images =
            getVisibleGalleryImages();

        if (!images.length) {
            return;
        }

        currentImageIndex =
            (
                currentImageIndex -
                1 +
                images.length
            ) %
            images.length;

        updateLightboxImage();
    }

    function showNextImage() {
        const images =
            getVisibleGalleryImages();

        if (!images.length) {
            return;
        }

        currentImageIndex =
            (
                currentImageIndex +
                1
            ) %
            images.length;

        updateLightboxImage();
    }

    function prepareGalleryImage(
        image
    ) {
        if (
            !image ||
            image.dataset.zoomReady ===
                "true"
        ) {
            return;
        }

        image.dataset.zoomReady =
            "true";

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

        const description =
            image.alt ||
            "portfolio image";

        image.setAttribute(
            "aria-label",
            `View larger: ${description}`
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
            event => {
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

    document
        .querySelectorAll(
            ".project-gallery img"
        )
        .forEach(
            prepareGalleryImage
        );


    /* DYNAMIC PROJECT GALLERY */

    function syncProjectGallery(
        article,
        project
    ) {
        const gallery =
            article?.querySelector(
                ".project-gallery"
            );

        if (!gallery) {
            return;
        }

        const media =
            Array.isArray(
                project.media
            )
                ? [
                    ...project.media
                ].sort(
                    (a, b) => {
                        const difference =
                            (
                                Number(
                                    a.sort_order
                                ) || 0
                            ) -
                            (
                                Number(
                                    b.sort_order
                                ) || 0
                            );

                        return (
                            difference ||
                            Number(a.id) -
                            Number(b.id)
                        );
                    }
                )
                : [];

        /*
         * The API loaded successfully, so D1 is now
         * the source of truth for this project's gallery.
         */
        gallery.replaceChildren();

        gallery.classList.add(
            "managed-project-gallery"
        );

        if (!media.length) {
            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "project-gallery-empty";

            const heading =
                document.createElement(
                    "strong"
                );

            heading.textContent =
                "No project images right now.";

            const text =
                document.createElement(
                    "span"
                );

            text.textContent =
                "This project is still available, but its gallery is currently empty.";

            empty.append(
                heading,
                text
            );

            gallery.appendChild(
                empty
            );

            return;
        }

        const heading =
            document.createElement(
                "p"
            );

        heading.className =
            "gallery-heading managed-gallery-heading";

        heading.textContent =
            "Project Gallery";

        const grid =
            document.createElement(
                "div"
            );

        grid.className =
            "managed-gallery-grid";

        media.forEach(
            item => {
                const figure =
                    document.createElement(
                        "figure"
                    );

                figure.className =
                    "managed-gallery-item";

                figure.dataset.mediaId =
                    String(item.id);

                const image =
                    document.createElement(
                        "img"
                    );

                image.className =
                    "managed-gallery-image";

                image.src =
                    getMediaUrl(
                        item
                    );

                image.alt =
                    item.alt_text ||
                    `${project.title} project image`;

                image.loading =
                    "lazy";

                image.decoding =
                    "async";

                /*
                 * Wide artwork spans both gallery columns.
                 * Portrait and square artwork sits two-across.
                 */
                const updateWidth =
                    () => {
                        if (
                            !image.naturalWidth ||
                            !image.naturalHeight
                        ) {
                            return;
                        }

                        const ratio =
                            image.naturalWidth /
                            image.naturalHeight;

                        figure.classList.toggle(
                            "managed-gallery-wide",
                            ratio >= 1.2
                        );
                    };

                image.addEventListener(
                    "load",
                    updateWidth,
                    {
                        once: true
                    }
                );

                if (image.complete) {
                    updateWidth();
                }

                prepareGalleryImage(
                    image
                );

                figure.appendChild(
                    image
                );

                grid.appendChild(
                    figure
                );
            }
        );

        gallery.append(
            heading,
            grid
        );
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
                ).padStart(
                    2,
                    "0"
                )}`;
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

        syncProjectGallery(
            article,
            project
        );
    }


    /* LOAD SETTINGS */

    async function loadSiteSettings() {
        try {
            const response =
                await fetch(
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

            if (
                heroKicker &&
                data.settings
                    .hero_kicker
                    ?.trim()
            ) {
                heroKicker.textContent =
                    data.settings
                        .hero_kicker;
            }

            if (
                heroTitle &&
                data.settings
                    .hero_title
                    ?.trim()
            ) {
                heroTitle.textContent =
                    data.settings
                        .hero_title;
            }

            applySiteFonts(
                data.settings
            );
        } catch (error) {
            console.warn(
                "Website settings couldn't be loaded. Using the default settings.",
                error
            );
        }
    }


    /* LOAD PROJECTS */

    async function loadProjects() {
        if (
            !publicProjectList ||
            !projectArticlesBySlug.size
        ) {
            return;
        }

        try {
            const response =
                await fetch(
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

            const publishedArticles =
                [];

            data.projects.forEach(
                (
                    project,
                    index
                ) => {
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

            currentProjectIndex =
                0;

            showProject(
                0,
                false
            );
        } catch (error) {
            /*
             * API failure means we leave the original
             * hardcoded HTML galleries untouched.
             */
            availableProjectArticles = [
                ...staticProjectArticles
            ];

            currentProjectIndex =
                0;

            showProject(
                0,
                false
            );

            console.warn(
                "Portfolio projects couldn't be loaded. Using the default project information.",
                error
            );
        }
    }


    /* DIALOG STATE */

    function updateDialogState() {
        const anyOpen =
            projectsDialog?.open ||
            aboutDialog?.open ||
            lightbox.open;

        document.body.classList.toggle(
            "dialog-open",
            Boolean(anyOpen)
        );
    }


    /* PROJECT DIALOG */

    openProjectsButton
        ?.addEventListener(
            "click",
            () => {
                showProject(
                    0,
                    false
                );

                projectsDialog.showModal();

                projectsDialog.scrollTop =
                    0;

                updateDialogState();
            }
        );

    closeProjectsButton
        ?.addEventListener(
            "click",
            () => {
                projectsDialog.close();

                updateDialogState();
            }
        );


    /* ABOUT DIALOG */

    openAboutButton
        ?.addEventListener(
            "click",
            () => {
                aboutDialog.showModal();

                updateDialogState();
            }
        );

    closeAboutButton
        ?.addEventListener(
            "click",
            () => {
                aboutDialog.close();

                updateDialogState();
            }
        );

    projectsDialog
        ?.addEventListener(
            "close",
            updateDialogState
        );

    aboutDialog
        ?.addEventListener(
            "close",
            updateDialogState
        );


    /* LIGHTBOX */

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

    lightbox.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                lightbox
            ) {
                closeLightbox();
            }
        }
    );

    lightbox.addEventListener(
        "cancel",
        event => {
            event.preventDefault();

            closeLightbox();
        }
    );

    lightbox.addEventListener(
        "close",
        updateDialogState
    );


    /* KEYBOARD */

    document.addEventListener(
        "keydown",
        event => {
            if (lightbox.open) {
                const images =
                    getVisibleGalleryImages();

                if (!images.length) {
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

                    currentImageIndex =
                        0;

                    updateLightboxImage();
                }

                if (
                    event.key ===
                    "End"
                ) {
                    event.preventDefault();

                    currentImageIndex =
                        images.length -
                        1;

                    updateLightboxImage();
                }

                return;
            }

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


    /* START */

    Promise.all([
        loadSiteSettings(),
        loadProjects()
    ]);
});