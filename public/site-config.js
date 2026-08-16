document.addEventListener("DOMContentLoaded", () => {
    /* DIALOGS */

    const projectsDialog = document.querySelector("[data-projects-dialog]");
    const openProjectsButton = document.querySelector("[data-open-projects]");
    const closeProjectsButton = document.querySelector("[data-close-projects]");

    const aboutDialog = document.querySelector("[data-about-dialog]");
    const openAboutButton = document.querySelector("[data-open-about]");
    const closeAboutButton = document.querySelector("[data-close-about]");

    /* HOMEPAGE */

    const heroKicker = document.querySelector(".hero-kicker");
    const heroTitle = document.querySelector(".hero-title");
    const currentYear = document.querySelector("[data-current-year]");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    /* LOAD SAVED HOMEPAGE TEXT */

    async function loadSiteSettings() {
        try {
            const response = await fetch("/api/settings", {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error("Unable to load website settings.");
            }

            const data = await response.json();

            if (!data.settings) {
                return;
            }

            const settings = data.settings;

            if (
                heroKicker &&
                typeof settings.hero_kicker === "string" &&
                settings.hero_kicker.trim()
            ) {
                heroKicker.textContent = settings.hero_kicker;
            }

            if (
                heroTitle &&
                typeof settings.hero_title === "string" &&
                settings.hero_title.trim()
            ) {
                heroTitle.textContent = settings.hero_title;
            }
        } catch (error) {
            /*
             * Keep the text already written in index.html if
             * the settings cannot be loaded.
             */
            console.warn(
                "Website settings couldn't be loaded. Using the default homepage text.",
                error
            );
        }
    }

    /* IMAGE LIGHTBOX */

    const galleryImages = Array.from(
        document.querySelectorAll(".project-gallery img")
    );

    let currentImageIndex = 0;
    let previousFocus = null;

    const lightbox = document.createElement("dialog");

    lightbox.className = "portfolio-lightbox";
    lightbox.setAttribute("aria-label", "Portfolio image viewer");

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

    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
    const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
    const lightboxCount = lightbox.querySelector("[data-lightbox-count]");
    const lightboxClose = lightbox.querySelector("[data-lightbox-close]");
    const lightboxPrevious = lightbox.querySelector("[data-lightbox-prev]");
    const lightboxNext = lightbox.querySelector("[data-lightbox-next]");

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

    /* PROJECTS */

    if (openProjectsButton && projectsDialog) {
        openProjectsButton.addEventListener("click", () => {
            projectsDialog.showModal();
            updateDialogState();
        });
    }

    if (closeProjectsButton && projectsDialog) {
        closeProjectsButton.addEventListener("click", () => {
            projectsDialog.close();
            updateDialogState();
        });
    }

    /* ABOUT */

    if (openAboutButton && aboutDialog) {
        openAboutButton.addEventListener("click", () => {
            aboutDialog.showModal();
            updateDialogState();
        });
    }

    if (closeAboutButton && aboutDialog) {
        closeAboutButton.addEventListener("click", () => {
            aboutDialog.close();
            updateDialogState();
        });
    }

    projectsDialog?.addEventListener("close", updateDialogState);
    aboutDialog?.addEventListener("close", updateDialogState);

    /* IMAGE DETAILS */

    function updateLightboxImage() {
        const image = galleryImages[currentImageIndex];

        if (!image) {
            return;
        }

        const imageSource = image.currentSrc || image.src;
        const imageAlt = image.alt || "Portfolio artwork";

        lightboxImage.src = imageSource;
        lightboxImage.alt = imageAlt;

        lightboxCaption.textContent = imageAlt;

        lightboxCount.textContent =
            `${currentImageIndex + 1} / ${galleryImages.length}`;

        const hasMultipleImages = galleryImages.length > 1;

        lightboxPrevious.hidden = !hasMultipleImages;
        lightboxNext.hidden = !hasMultipleImages;
    }

    /* OPEN IMAGE */

    function openLightbox(index) {
        if (!galleryImages[index]) {
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

    /* CLOSE IMAGE */

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

    /* PREVIOUS IMAGE */

    function showPreviousImage() {
        if (galleryImages.length === 0) {
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
        if (galleryImages.length === 0) {
            return;
        }

        currentImageIndex =
            (currentImageIndex + 1) %
            galleryImages.length;

        updateLightboxImage();
    }

    /* MAKE IMAGES CLICKABLE */

    galleryImages.forEach((image, index) => {
        image.classList.add("portfolio-zoomable");

        image.setAttribute("tabindex", "0");
        image.setAttribute("role", "button");

        const imageDescription =
            image.alt ||
            "portfolio image";

        image.setAttribute(
            "aria-label",
            `View larger: ${imageDescription}`
        );

        image.addEventListener("click", () => {
            openLightbox(index);
        });

        image.addEventListener("keydown", (event) => {
            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                openLightbox(index);
            }
        });
    });

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

    /* CLICK BACKGROUND TO CLOSE */

    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    /* ESCAPE */

    lightbox.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeLightbox();
    });

    /* KEYBOARD NAVIGATION */

    document.addEventListener("keydown", (event) => {
        if (!lightbox.open) {
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

            currentImageIndex =
                galleryImages.length - 1;

            updateLightboxImage();
        }
    });

    lightbox.addEventListener(
        "close",
        updateDialogState
    );

    /* START */

    loadSiteSettings();
});