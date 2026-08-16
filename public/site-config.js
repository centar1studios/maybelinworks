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
        const displayFont = settings.display_font || "Playfair Display";
        const bodyFont = settings.body_font || "Lato";

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


    /* ELEMENTS */

    const projectsDialog = document.querySelector("[data-projects-dialog]");
    const openProjectsButton = document.querySelector("[data-open-projects]");
    const closeProjectsButton = document.querySelector("[data-close-projects]");
    const aboutDialog = document.querySelector("[data-about-dialog]");
    const openAboutButton = document.querySelector("[data-open-about]");
    const closeAboutButton = document.querySelector("[data-close-about]");

    const heroKicker = document.querySelector(".hero-kicker");
    const heroTitle = document.querySelector(".hero-title");
    const currentYear = document.querySelector("[data-current-year]");
    const publicProjectList = document.querySelector(".project-list");

    const aboutIntro = aboutDialog?.querySelector(".about-intro");
    const aboutTitle = aboutIntro?.querySelector("h2");
    const aboutPhoto = aboutDialog?.querySelector(".about-photo img");
    const aboutCopy = aboutDialog?.querySelector(".about-copy");
    const contactList = aboutDialog?.querySelector(".contact-list");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    /* FALLBACK PROJECTS */

    const staticProjectArticles = Array.from(
        document.querySelectorAll(
            ".project-list > .project"
        )
    );

    let availableProjectArticles = [
        ...staticProjectArticles
    ];

    let currentProjectIndex = 0;


    /* MEDIA URL */

    function getMediaUrl(value) {
        const key = typeof value === "string"
            ? value
            : value?.r2_key;

        if (!key) {
            return "";
        }

        const encodedKey = key
            .split("/")
            .map(part => encodeURIComponent(part))
            .join("/");

        return `/media/${encodedKey}`;
    }


    /* ABOUT ME */

    function ensureAboutKicker() {
        if (!aboutIntro || !aboutTitle) {
            return null;
        }

        let kicker = aboutIntro.querySelector(".about-kicker");

        if (!kicker) {
            kicker = document.createElement("p");
            kicker.className = "about-kicker";
            aboutIntro.insertBefore(kicker, aboutTitle);
        }

        return kicker;
    }

    function updateAboutBio(text) {
        if (!aboutCopy || !contactList || !text) {
            return;
        }

        Array.from(
            aboutCopy.querySelectorAll(":scope > p")
        ).forEach(paragraph => paragraph.remove());

        const paragraphs = text
            .split(/\n\s*\n/)
            .map(paragraph => paragraph.trim())
            .filter(Boolean);

        paragraphs.forEach(textContent => {
            const paragraph = document.createElement("p");
            paragraph.textContent = textContent;
            aboutCopy.insertBefore(paragraph, contactList);
        });
    }

    function findContactRow(label) {
        if (!contactList) {
            return null;
        }

        return Array.from(
            contactList.querySelectorAll(":scope > div")
        ).find(row =>
            row.querySelector("dt")
                ?.textContent
                .trim()
                .toLowerCase() === label.toLowerCase()
        ) || null;
    }

    function updateContactRow(label, value, href, displayText = value) {
        const row = findContactRow(label);

        if (!row) {
            return;
        }

        row.hidden = !value;

        const link = row.querySelector("a");

        if (!link || !value) {
            return;
        }

        link.href = href;
        link.textContent = displayText;
    }

    function instagramLabel(url) {
        if (!url) {
            return "";
        }

        try {
            const parsed = new URL(url);
            const parts = parsed.pathname
                .split("/")
                .filter(Boolean);

            return parts.length
                ? `@${parts.at(-1)}`
                : "Instagram";
        } catch {
            return "Instagram";
        }
    }

    function applyHeaderContacts(settings) {
        const emailLink = document.querySelector(
            '.site-nav a[href^="mailto:"]'
        );

        const phoneLink = document.querySelector(
            '.site-nav a[href^="tel:"]'
        );

        const instagramLink = document.querySelector(
            '.site-nav a[href*="instagram.com"]'
        );

        if (emailLink) {
            emailLink.hidden = !settings.contact_email;

            if (settings.contact_email) {
                emailLink.href = `mailto:${settings.contact_email}`;
            }
        }

        if (phoneLink) {
            phoneLink.hidden = !settings.contact_phone;

            if (settings.contact_phone) {
                const phoneHref = settings.contact_phone
                    .replace(/[^\d+]/g, "");

                phoneLink.href = `tel:${phoneHref}`;
            }
        }

        if (instagramLink) {
            instagramLink.hidden = !settings.instagram_url;

            if (settings.instagram_url) {
                instagramLink.href = settings.instagram_url;
            }
        }
    }

    function applyAboutSettings(settings) {
        const kicker = ensureAboutKicker();

        if (kicker && settings.about_kicker) {
            kicker.textContent = settings.about_kicker;
        }

        if (aboutTitle && settings.about_title) {
            aboutTitle.textContent = settings.about_title;
        }

        if (settings.about_bio) {
            updateAboutBio(settings.about_bio);
        }

        if (aboutPhoto && settings.about_photo_key) {
            aboutPhoto.src = getMediaUrl(settings.about_photo_key);
        }

        if (settings.contact_email) {
            updateContactRow(
                "Email",
                settings.contact_email,
                `mailto:${settings.contact_email}`,
                settings.contact_email
            );
        } else {
            updateContactRow("Email", null, "");
        }

        if (settings.instagram_url) {
            updateContactRow(
                "Instagram",
                settings.instagram_url,
                settings.instagram_url,
                instagramLabel(settings.instagram_url)
            );
        } else {
            updateContactRow("Instagram", null, "");
        }

        if (settings.contact_phone) {
            const phoneHref = settings.contact_phone
                .replace(/[^\d+]/g, "");

            updateContactRow(
                "Phone",
                settings.contact_phone,
                `tel:${phoneHref}`,
                settings.contact_phone
            );
        } else {
            updateContactRow("Phone", null, "");
        }

        applyHeaderContacts(settings);
    }


    /* PROJECT SWITCHER */

    let projectSwitcher = null;
    let previousProjectButton = null;
    let nextProjectButton = null;
    let projectCounter = null;

    if (publicProjectList) {
        projectSwitcher = document.createElement("div");
        projectSwitcher.className = "project-switcher";
        projectSwitcher.setAttribute(
            "aria-label",
            "Project navigation"
        );

        previousProjectButton = document.createElement("button");
        previousProjectButton.className = "project-switcher-button";
        previousProjectButton.type = "button";
        previousProjectButton.innerHTML = "&#8592; Previous Project";

        projectCounter = document.createElement("span");
        projectCounter.className = "project-switcher-count";
        projectCounter.setAttribute("aria-live", "polite");

        nextProjectButton = document.createElement("button");
        nextProjectButton.className = "project-switcher-button";
        nextProjectButton.type = "button";
        nextProjectButton.innerHTML = "Next Project &#8594;";

        projectSwitcher.append(
            previousProjectButton,
            projectCounter,
            nextProjectButton
        );

        if (projectsDialog) {
            projectsDialog.appendChild(projectSwitcher);
        } else {
            publicProjectList.insertAdjacentElement(
                "afterend",
                projectSwitcher
            );
        }
    }

    function normalizeProjectIndex(index) {
        const total = availableProjectArticles.length;

        if (!total) {
            return 0;
        }

        return ((index % total) + total) % total;
    }

    function getProjectTitle(article) {
        return article
            ?.querySelector(".project-info h3")
            ?.textContent
            .trim() || "project";
    }

    function updateProjectSwitcher() {
        if (!projectSwitcher) {
            return;
        }

        const total = availableProjectArticles.length;

        if (!total) {
            projectSwitcher.hidden = true;
            return;
        }

        projectSwitcher.hidden = false;
        projectCounter.textContent =
            `${currentProjectIndex + 1} / ${total}`;

        const multiple = total > 1;
        previousProjectButton.hidden = !multiple;
        nextProjectButton.hidden = !multiple;

        if (!multiple) {
            return;
        }

        const previousIndex = normalizeProjectIndex(
            currentProjectIndex - 1
        );

        const nextIndex = normalizeProjectIndex(
            currentProjectIndex + 1
        );

        previousProjectButton.setAttribute(
            "aria-label",
            `View previous project: ${getProjectTitle(
                availableProjectArticles[previousIndex]
            )}`
        );

        nextProjectButton.setAttribute(
            "aria-label",
            `View next project: ${getProjectTitle(
                availableProjectArticles[nextIndex]
            )}`
        );
    }

    function showProject(index, scrollToProject = true) {
        availableProjectArticles.forEach(article => {
            article.hidden = true;
            article.classList.remove("project-current");
        });

        if (!availableProjectArticles.length) {
            updateProjectSwitcher();
            return;
        }

        currentProjectIndex = normalizeProjectIndex(index);

        const currentArticle =
            availableProjectArticles[currentProjectIndex];

        currentArticle.hidden = false;
        currentArticle.classList.add("project-current");
        updateProjectSwitcher();

        if (scrollToProject && projectsDialog?.open) {
            currentArticle.scrollIntoView({
                behavior: "auto",
                block: "start"
            });
        }
    }

    function showPreviousProject() {
        if (availableProjectArticles.length > 1) {
            showProject(currentProjectIndex - 1);
        }
    }

    function showNextProject() {
        if (availableProjectArticles.length > 1) {
            showProject(currentProjectIndex + 1);
        }
    }

    previousProjectButton?.addEventListener(
        "click",
        showPreviousProject
    );

    nextProjectButton?.addEventListener(
        "click",
        showNextProject
    );


    /* LIGHTBOX */

    let currentImageIndex = 0;
    let previousFocus = null;

    const lightbox = document.createElement("dialog");
    lightbox.className = "portfolio-lightbox";
    lightbox.setAttribute(
        "aria-label",
        "Portfolio image viewer"
    );

    lightbox.innerHTML = `
        <div class="portfolio-lightbox-toolbar">
            <p class="portfolio-lightbox-count" data-lightbox-count aria-live="polite"></p>
            <button class="portfolio-lightbox-close" type="button" data-lightbox-close>Close</button>
        </div>

        <div class="portfolio-lightbox-stage">
            <button class="portfolio-lightbox-nav portfolio-lightbox-prev" type="button" data-lightbox-prev aria-label="View previous image">&#8592;</button>

            <figure class="portfolio-lightbox-figure">
                <img data-lightbox-image src="" alt="">
                <figcaption data-lightbox-caption></figcaption>
            </figure>

            <button class="portfolio-lightbox-nav portfolio-lightbox-next" type="button" data-lightbox-next aria-label="View next image">&#8594;</button>
        </div>
    `;

    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
    const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
    const lightboxCount = lightbox.querySelector("[data-lightbox-count]");
    const lightboxClose = lightbox.querySelector("[data-lightbox-close]");
    const lightboxPrevious = lightbox.querySelector("[data-lightbox-prev]");
    const lightboxNext = lightbox.querySelector("[data-lightbox-next]");

    function getVisibleGalleryImages() {
        const currentProject =
            availableProjectArticles[currentProjectIndex];

        if (!currentProject) {
            return [];
        }

        return Array.from(
            currentProject.querySelectorAll(".project-gallery img")
        );
    }

    function updateLightboxImage() {
        const images = getVisibleGalleryImages();
        const image = images[currentImageIndex];

        if (!image) {
            return;
        }

        const alt = image.alt || "Portfolio artwork";

        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = alt;
        lightboxCaption.textContent = alt;
        lightboxCount.textContent =
            `${currentImageIndex + 1} / ${images.length}`;

        const multiple = images.length > 1;
        lightboxPrevious.hidden = !multiple;
        lightboxNext.hidden = !multiple;
    }

    function openLightbox(image) {
        const images = getVisibleGalleryImages();
        const index = images.indexOf(image);

        if (index === -1) {
            return;
        }

        currentImageIndex = index;
        previousFocus = document.activeElement;
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
            typeof previousFocus.focus === "function"
        ) {
            previousFocus.focus();
        }

        updateDialogState();
    }

    function showPreviousImage() {
        const images = getVisibleGalleryImages();

        if (!images.length) {
            return;
        }

        currentImageIndex =
            (currentImageIndex - 1 + images.length) % images.length;

        updateLightboxImage();
    }

    function showNextImage() {
        const images = getVisibleGalleryImages();

        if (!images.length) {
            return;
        }

        currentImageIndex =
            (currentImageIndex + 1) % images.length;

        updateLightboxImage();
    }

    function prepareGalleryImage(image) {
        if (!image || image.dataset.zoomReady === "true") {
            return;
        }

        image.dataset.zoomReady = "true";
        image.classList.add("portfolio-zoomable");
        image.setAttribute("tabindex", "0");
        image.setAttribute("role", "button");

        const description = image.alt || "portfolio image";

        image.setAttribute(
            "aria-label",
            `View larger: ${description}`
        );

        image.addEventListener("click", () => {
            openLightbox(image);
        });

        image.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox(image);
            }
        });
    }

    staticProjectArticles.forEach(article => {
        article
            .querySelectorAll(".project-gallery img")
            .forEach(prepareGalleryImage);
    });


    /* DYNAMIC PROJECTS */

    function addMetaRow(meta, label, value) {
        if (!value) {
            return;
        }

        const row = document.createElement("div");
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");

        dt.textContent = label;
        dd.textContent = String(value);
        row.append(dt, dd);
        meta.appendChild(row);
    }

    function pageLayoutNumber(value, fallback, min, max) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return fallback;
        }

        return Math.min(
            Math.max(Math.round(number), min),
            max
        );
    }

    function createPagedProjectLayout(
        project,
        blocks,
        mediaById,
        preset
    ) {
        const mediaItems = blocks
            .filter(block => block.type === "media")
            .map(block => mediaById.get(Number(block.media_id)))
            .filter(Boolean);

        if (!mediaItems.length) {
            return null;
        }

        const isBook = preset === "book";
        const viewer = document.createElement("section");
        viewer.className = isBook
            ? "cms-paged-layout cms-book-reader"
            : "cms-paged-layout cms-slide-deck";
        viewer.tabIndex = 0;
        viewer.setAttribute(
            "aria-label",
            isBook
                ? `${project.title} publication reader`
                : `${project.title} presentation`
        );

        const headingBlock = blocks.find(
            block => block.type === "heading" && block.text
        );

        if (headingBlock) {
            const heading = document.createElement("h4");
            heading.className = "cms-paged-heading";
            heading.textContent = headingBlock.text;
            viewer.appendChild(heading);
        }

        const textBlocks = blocks.filter(
            block => block.type === "text" && block.text
        );

        if (textBlocks.length) {
            const intro = document.createElement("div");
            intro.className = "cms-paged-intro";

            textBlocks.forEach(block => {
                const paragraph = document.createElement("p");
                paragraph.textContent = block.text;
                intro.appendChild(paragraph);
            });

            viewer.appendChild(intro);
        }

        const stage = document.createElement("div");
        stage.className = isBook
            ? "cms-paged-stage cms-book-stage"
            : "cms-paged-stage cms-slide-stage";

        const groups = [];

        if (isBook) {
            groups.push({
                items: [mediaItems[0]],
                label: "Front Cover"
            });

            for (let index = 1; index < mediaItems.length - 1; index += 2) {
                const spread = mediaItems.slice(
                    index,
                    Math.min(index + 2, mediaItems.length - 1)
                );

                groups.push({
                    items: spread,
                    label: spread.length === 2
                        ? `Pages ${index + 1}–${index + 2}`
                        : `Page ${index + 1}`
                });
            }

            if (mediaItems.length > 1) {
                groups.push({
                    items: [mediaItems.at(-1)],
                    label: "Back Cover"
                });
            }
        } else {
            mediaItems.forEach((item, index) => {
                groups.push({
                    items: [item],
                    label: `Slide ${index + 1}`
                });
            });
        }

        const panels = groups.map((group, groupIndex) => {
            const panel = document.createElement("figure");
            panel.className = isBook ? "cms-book-spread" : "cms-slide";
            panel.hidden = groupIndex !== 0;
            panel.dataset.panelLabel = group.label;

            if (isBook && group.items.length === 1) {
                panel.classList.add("is-single-page");
            }

            group.items.forEach((item, itemIndex) => {
                const page = document.createElement("div");
                page.className = isBook ? "cms-book-page" : "cms-slide-page";

                const image = document.createElement("img");
                image.src = getMediaUrl(item);
                image.alt = item.alt_text ||
                    `${project.title} ${isBook ? "publication page" : "slide"}`;
                image.loading = groupIndex === 0 && itemIndex === 0
                    ? "eager"
                    : "lazy";
                image.decoding = "async";

                prepareGalleryImage(image);
                page.appendChild(image);
                panel.appendChild(page);
            });

            stage.appendChild(panel);
            return panel;
        });

        const navigation = document.createElement("div");
        navigation.className = "cms-paged-navigation";

        const previous = document.createElement("button");
        previous.type = "button";
        previous.textContent = isBook
            ? "← Previous Pages"
            : "← Previous Slide";

        const counter = document.createElement("span");
        counter.className = "cms-paged-counter";
        counter.setAttribute("aria-live", "polite");

        const next = document.createElement("button");
        next.type = "button";
        next.textContent = isBook ? "Next Pages →" : "Next Slide →";

        let activeIndex = 0;

        const updateViewer = nextIndex => {
            activeIndex = Math.min(
                Math.max(nextIndex, 0),
                panels.length - 1
            );

            panels.forEach((panel, index) => {
                panel.hidden = index !== activeIndex;
            });

            previous.disabled = activeIndex === 0;
            next.disabled = activeIndex === panels.length - 1;
            counter.textContent =
                `${groups[activeIndex].label} • ${activeIndex + 1} / ${panels.length}`;
        };

        previous.addEventListener("click", () => {
            updateViewer(activeIndex - 1);
        });

        next.addEventListener("click", () => {
            updateViewer(activeIndex + 1);
        });

        viewer.addEventListener("keydown", event => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                updateViewer(activeIndex - 1);
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                updateViewer(activeIndex + 1);
            }
        });

        navigation.append(previous, counter, next);
        viewer.append(stage, navigation);
        updateViewer(0);

        return viewer;
    }

    function createCustomProjectLayout(project, media) {
        const layout = project?.page_layout;

        if (
            !layout ||
            layout.version !== 1 ||
            !Array.isArray(layout.blocks) ||
            !layout.blocks.length
        ) {
            return null;
        }

        const mediaById = new Map(
            media.map(item => [
                Number(item.id),
                item
            ])
        );

        const allowedTypes = new Set([
            "media",
            "heading",
            "text",
            "spacer"
        ]);

        const blocks = layout.blocks
            .filter(block =>
                block &&
                allowedTypes.has(block.type)
            )
            .map((block, index) => {
                const x = pageLayoutNumber(
                    block.x,
                    0,
                    0,
                    11
                );

                return {
                    ...block,
                    x,
                    y: pageLayoutNumber(block.y, 0, 0, 500),
                    w: pageLayoutNumber(block.w, 12, 1, 12 - x),
                    h: pageLayoutNumber(block.h, 4, 1, 24),
                    sourceOrder: index
                };
            })
            .sort((a, b) =>
                a.y - b.y ||
                a.x - b.x ||
                a.sourceOrder - b.sourceOrder
            );

        const preset = ["book", "slides"].includes(layout.preset)
            ? layout.preset
            : "canvas";

        if (preset === "book" || preset === "slides") {
            return createPagedProjectLayout(
                project,
                blocks,
                mediaById,
                preset
            );
        }

        const canvas = document.createElement("div");
        canvas.className = "cms-layout-canvas";

        let renderedBlocks = 0;
        let bottomRow = 0;

        blocks.forEach((block, index) => {
            let element;

            if (block.type === "media") {
                const item = mediaById.get(
                    Number(block.media_id)
                );

                if (!item) {
                    return;
                }

                element = document.createElement("figure");
                element.className = "cms-layout-block cms-layout-media";
                element.dataset.mediaId = String(item.id);

                const image = document.createElement("img");
                image.src = getMediaUrl(item);
                image.alt = item.alt_text ||
                    `${project.title} project image`;
                image.loading = "lazy";
                image.decoding = "async";
                image.style.objectFit = block.fit === "cover"
                    ? "cover"
                    : "contain";

                prepareGalleryImage(image);
                element.appendChild(image);
            } else if (block.type === "heading") {
                element = document.createElement("section");
                element.className = "cms-layout-block cms-layout-heading";

                const heading = document.createElement("h4");
                heading.textContent = block.text || "Project Section";
                element.appendChild(heading);
            } else if (block.type === "text") {
                element = document.createElement("section");
                element.className = "cms-layout-block cms-layout-text";

                const text = document.createElement("p");
                text.textContent = block.text || "";
                element.appendChild(text);
            } else {
                element = document.createElement("div");
                element.className = "cms-layout-block cms-layout-spacer";
                element.setAttribute("aria-hidden", "true");
            }

            element.style.setProperty("--layout-x", String(block.x));
            element.style.setProperty("--layout-y", String(block.y));
            element.style.setProperty("--layout-w", String(block.w));
            element.style.setProperty("--layout-h", String(block.h));
            element.style.setProperty("--layout-order", String(index));
            element.style.left =
                `${(block.x / 12) * 100}%`;
            element.style.top =
                `${block.y * 3.5}rem`;
            element.style.width =
                `${(block.w / 12) * 100}%`;
            element.style.height =
                `${block.h * 3.5}rem`;
            element.style.order = String(index);

            canvas.appendChild(element);
            renderedBlocks++;
            bottomRow = Math.max(
                bottomRow,
                block.y + block.h
            );
        });

        if (!renderedBlocks) {
            return null;
        }

        canvas.style.setProperty(
            "--layout-rows",
            String(Math.max(bottomRow, 1))
        );
        canvas.style.minHeight =
            `${Math.max(bottomRow, 1) * 3.5}rem`;

        return canvas;
    }

    function createProjectGallery(project) {
        const gallery = document.createElement("div");
        const layout = project.gallery_layout || "smart";

        gallery.className =
            `project-gallery cms-project-gallery gallery-layout-${layout}`;

        const media = Array.isArray(project.media)
            ? [...project.media].sort((a, b) => {
                const orderDifference =
                    (Number(a.sort_order) || 0) -
                    (Number(b.sort_order) || 0);

                return orderDifference ||
                    Number(a.id) - Number(b.id);
            })
            : [];

        const customLayout = createCustomProjectLayout(
            project,
            media
        );

        if (customLayout) {
            gallery.classList.add("gallery-layout-custom");
            gallery.appendChild(customLayout);
            return gallery;
        }

        if (!media.length) {
            const empty = document.createElement("div");
            empty.className = "project-gallery-empty";

            const heading = document.createElement("strong");
            heading.textContent = "Project Gallery";

            const text = document.createElement("span");
            text.textContent =
                "No images have been added to this project yet.";

            empty.append(heading, text);
            gallery.appendChild(empty);
            return gallery;
        }

        const heading = document.createElement("p");
        heading.className = "gallery-heading cms-gallery-heading";
        heading.textContent = "Project Gallery";

        const grid = document.createElement("div");
        grid.className = "cms-gallery-grid";

        media.forEach((item, index) => {
            const figure = document.createElement("figure");
            figure.className = "cms-gallery-item";
            figure.dataset.mediaId = String(item.id);

            if (layout === "featured" && index === 0) {
                figure.classList.add("cms-gallery-featured");
            }

            const image = document.createElement("img");
            image.className = "cms-gallery-image";
            image.src = getMediaUrl(item);
            image.alt = item.alt_text ||
                `${project.title} project image`;
            image.loading = "lazy";
            image.decoding = "async";

            if (layout === "smart" || layout === "publication") {
                const updateSmartWidth = () => {
                    if (!image.naturalWidth || !image.naturalHeight) {
                        return;
                    }

                    const ratio =
                        image.naturalWidth / image.naturalHeight;

                    figure.classList.toggle(
                        "cms-gallery-wide",
                        ratio >= 1.2
                    );
                };

                image.addEventListener(
                    "load",
                    updateSmartWidth,
                    { once: true }
                );

                if (image.complete) {
                    updateSmartWidth();
                }
            }

            prepareGalleryImage(image);
            figure.appendChild(image);
            grid.appendChild(figure);
        });

        gallery.append(heading, grid);
        return gallery;
    }

    function createProjectArticle(project, displayNumber) {
        const article = document.createElement("article");
        article.className = "project cms-project";
        article.dataset.projectSlug = project.slug;

        const gallery = createProjectGallery(project);

        const info = document.createElement("div");
        info.className = "project-info";

        const number = document.createElement("p");
        number.className = "project-number";
        number.textContent =
            `Project ${String(displayNumber).padStart(2, "0")}`;

        const kicker = document.createElement("p");
        kicker.className = "project-kicker";
        kicker.textContent = project.kicker || "Portfolio Project";

        const title = document.createElement("h3");
        title.textContent = project.title || "Untitled Project";

        const description = document.createElement("div");
        description.className = "project-description";

        if (project.description) {
            project.description
                .split(/\n\s*\n/)
                .map(paragraph => paragraph.trim())
                .filter(Boolean)
                .forEach(text => {
                    const paragraph = document.createElement("p");
                    paragraph.textContent = text;
                    description.appendChild(paragraph);
                });
        }

        const meta = document.createElement("dl");
        meta.className = "project-meta";

        addMetaRow(meta, "Type", project.kicker);
        addMetaRow(meta, "Role", project.role);
        addMetaRow(meta, "Year", project.year);

        info.append(
            number,
            kicker,
            title,
            description,
            meta
        );

        article.append(gallery, info);
        return article;
    }


    /* LOAD SETTINGS */

    async function loadSiteSettings() {
        try {
            const response = await fetch(
                "/api/settings",
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load website settings.");
            }

            const data = await response.json();

            if (!data.settings) {
                return;
            }

            const settings = data.settings;

            if (heroKicker && settings.hero_kicker?.trim()) {
                heroKicker.textContent = settings.hero_kicker;
            }

            if (heroTitle && settings.hero_title?.trim()) {
                heroTitle.textContent = settings.hero_title;
            }

            applySiteFonts(settings);
            applyAboutSettings(settings);
        } catch (error) {
            console.warn(
                "Website settings couldn't be loaded. Using the static fallback settings.",
                error
            );
        }
    }


    /* LOAD PROJECTS */

    async function loadProjects() {
        if (!publicProjectList) {
            return;
        }

        try {
            const response = await fetch(
                "/api/projects",
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load portfolio projects.");
            }

            const data = await response.json();

            if (!Array.isArray(data.projects)) {
                throw new Error("Project data was not valid.");
            }

            const dynamicArticles = data.projects.map(
                (project, index) =>
                    createProjectArticle(project, index + 1)
            );

            publicProjectList.replaceChildren(
                ...dynamicArticles
            );

            availableProjectArticles = dynamicArticles;
            currentProjectIndex = 0;
            showProject(0, false);
        } catch (error) {
            availableProjectArticles = [
                ...staticProjectArticles
            ];

            currentProjectIndex = 0;
            showProject(0, false);

            console.warn(
                "Portfolio projects couldn't be loaded. Using the original static portfolio as a fallback.",
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

    openProjectsButton?.addEventListener("click", () => {
        showProject(0, false);
        projectsDialog.showModal();
        projectsDialog.scrollTop = 0;
        updateDialogState();
    });

    closeProjectsButton?.addEventListener("click", () => {
        projectsDialog.close();
        updateDialogState();
    });


    /* ABOUT DIALOG */

    openAboutButton?.addEventListener("click", () => {
        aboutDialog.showModal();
        updateDialogState();
    });

    closeAboutButton?.addEventListener("click", () => {
        aboutDialog.close();
        updateDialogState();
    });

    projectsDialog?.addEventListener("close", updateDialogState);
    aboutDialog?.addEventListener("close", updateDialogState);


    /* LIGHTBOX BUTTONS */

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrevious.addEventListener("click", showPreviousImage);
    lightboxNext.addEventListener("click", showNextImage);

    lightbox.addEventListener("click", event => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    lightbox.addEventListener("cancel", event => {
        event.preventDefault();
        closeLightbox();
    });

    lightbox.addEventListener("close", updateDialogState);


    /* KEYBOARD */

    document.addEventListener("keydown", event => {
        if (lightbox.open) {
            const images = getVisibleGalleryImages();

            if (!images.length) {
                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showPreviousImage();
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                showNextImage();
            }

            if (event.key === "Home") {
                event.preventDefault();
                currentImageIndex = 0;
                updateLightboxImage();
            }

            if (event.key === "End") {
                event.preventDefault();
                currentImageIndex = images.length - 1;
                updateLightboxImage();
            }

            return;
        }

        if (
            projectsDialog?.open &&
            availableProjectArticles.length > 1
        ) {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showPreviousProject();
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                showNextProject();
            }
        }
    });


    /* START */

    showProject(0, false);

    Promise.all([
        loadSiteSettings(),
        loadProjects()
    ]);
});
