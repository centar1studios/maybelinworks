document.addEventListener("DOMContentLoaded", () => {
    /* FONT OPTIONS */

    const GOOGLE_FONTS = new Map([
        ["Playfair Display", "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700"],
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

    const GALLERY_LAYOUTS = {
        smart: {
            label: "Smart Gallery",
            description:
                "Best all-around choice. Wide artwork automatically gets more space while portrait and square work can sit side by side."
        },
        publication: {
            label: "Publication / Book",
            description:
                "Best for magazines, books and page-based work. Images are shown two at a time like page spreads."
        },
        full: {
            label: "Full Width",
            description:
                "Every image is stacked large, one after another. Great for branding decks and presentation boards."
        },
        grid: {
            label: "Classic Grid",
            description:
                "A consistent two-column image grid. Great for photography, artwork and collections with similarly sized pieces."
        },
        featured: {
            label: "Featured + Grid",
            description:
                "The first image gets a large featured position, then the rest continue in a two-column grid."
        }
    };

    const PAGE_LAYOUT_COLUMNS = 12;
    const PAGE_LAYOUT_ROW_HEIGHT = 36;

    const PAGE_LAYOUT_PRESETS = {
        canvas: {
            label: "Custom Layout",
            description:
                "Create a custom first section, then add more sections with their own layout types."
        },
        grid: {
            label: "Portfolio Grid",
            description:
                "Start with a two-column grid section, then add Book, Slides, Full Width or Custom sections."
        },
        book: {
            label: "Book / Zine Reader",
            description:
                "Start with a publication reader section with covers and page spreads."
        },
        slides: {
            label: "Presentation / Slides",
            description:
                "Start with a presentation section that shows one slide at a time."
        }
    };

    const SECTION_LAYOUT_TYPES = {
        custom: "Custom Arrangement",
        grid: "Portfolio Grid",
        book: "Publication / Book",
        slides: "Presentation / Slides",
        full: "Full Width"
    };

    const PRESET_SECTION_LAYOUTS = {
        canvas: "custom",
        grid: "grid",
        book: "book",
        slides: "slides"
    };

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

    function fontStack(fontName, type) {
        return type === "display"
            ? `"${fontName}", Georgia, serif`
            : `"${fontName}", Arial, sans-serif`;
    }


    /* ELEMENTS */

    const usernameElements = document.querySelectorAll(
        "[data-admin-username], [data-account-username]"
    );

    const avatar = document.querySelector("[data-user-avatar]");
    const logoutButtons = document.querySelectorAll("[data-logout]");
    const toast = document.querySelector("[data-admin-toast]");
    const navigationLinks = document.querySelectorAll(".admin-nav-link");

    const settingsStatus = document.querySelector("[data-settings-status]");
    const heroKicker = document.querySelector("#hero-kicker");
    const heroTitle = document.querySelector("#hero-title");
    const heroDescription = document.querySelector("#hero-description");
    const displayFont = document.querySelector("#display-font");
    const bodyFont = document.querySelector("#body-font");
    const displayFontPreview = document.querySelector("[data-display-font-preview]");
    const bodyFontPreview = document.querySelector("[data-body-font-preview]");
    const saveHomepageButton = document.querySelector("[data-save-homepage]");
    const saveColorButton = document.querySelector("[data-save-colors]");
    const colorFields = [
        {
            key: "dark_green",
            name: "Dark Green",
            fallback: "#2A3F38",
            picker: document.querySelector("#dark-green-color"),
            hex: document.querySelector("#dark-green-hex")
        },
        {
            key: "accent_green",
            name: "Lime Green",
            fallback: "#8DF688",
            picker: document.querySelector("#lime-green-color"),
            hex: document.querySelector("#lime-green-hex")
        },
        {
            key: "dark_plum",
            name: "Purple",
            fallback: "#562F54",
            picker: document.querySelector("#purple-color"),
            hex: document.querySelector("#purple-hex")
        },
        {
            key: "cream_color",
            name: "Charcoal",
            fallback: "#57585D",
            picker: document.querySelector("#charcoal-color"),
            hex: document.querySelector("#charcoal-hex")
        },
        {
            key: "primary_color",
            name: "Pink",
            fallback: "#F650BD",
            picker: document.querySelector("#pink-color"),
            hex: document.querySelector("#pink-hex")
        }
    ];
    const footerText = document.querySelector("#footer-text");
    const homeButtonLabel = document.querySelector("#home-button-label");
    const homeButtonUrl = document.querySelector("#home-button-url");
    const websiteLogoFile = document.querySelector("#website-logo-file");
    const websiteFaviconFile = document.querySelector("#website-favicon-file");
    const uploadLogoButton = document.querySelector("[data-upload-logo]");
    const uploadFaviconButton = document.querySelector("[data-upload-favicon]");
    const logoPreview = document.querySelector("[data-logo-preview]");
    const logoPreviewEmpty = document.querySelector("[data-logo-preview-empty]");
    const faviconPreview = document.querySelector("[data-favicon-preview]");
    const faviconPreviewEmpty = document.querySelector("[data-favicon-preview-empty]");

    const aboutStatus = document.querySelector("[data-about-status]");
    const aboutKicker = document.querySelector("#about-kicker");
    const aboutTitle = document.querySelector("#about-title");
    const aboutBio = document.querySelector("#about-bio");
    const contactEmail = document.querySelector("#contact-email");
    const contactPhone = document.querySelector("#contact-phone");
    const instagramUrl = document.querySelector("#instagram-url");
    const aboutPhotoFile = document.querySelector("#about-photo-file");
    const aboutPhotoPreview = document.querySelector("[data-about-photo-preview]");
    const aboutMediaPreview = document.querySelector("[data-about-media-preview]");
    const replaceAboutPhotoButton = document.querySelector("[data-replace-about-photo]");
    const saveAboutButton = document.querySelector("[data-save-about]");

    const projectList = document.querySelector("[data-project-list]");
    const projectCount = document.querySelector("[data-project-count]");
    const projectSummary = document.querySelector("[data-project-summary]");
    const mediaCount = document.querySelector("[data-media-count]");
    const mediaCountLarge = document.querySelector("[data-media-count-large]");
    const addProjectButton = document.querySelector("[data-add-project]");

    const projectEditor = document.querySelector("[data-project-editor]");
    const projectEditorForm = document.querySelector("[data-project-editor-form]");
    const closeProjectButtons = document.querySelectorAll("[data-close-project-editor]");
    const projectEditorKicker = document.querySelector("[data-project-editor-kicker]");
    const projectEditorTitle = document.querySelector("[data-project-editor-title]");
    const projectEditorIntro = document.querySelector("[data-project-editor-intro]");
    const saveProjectButton = document.querySelector("[data-save-project]");

    const projectId = document.querySelector("#project-id");
    const projectTitle = document.querySelector("#project-title");
    const projectKicker = document.querySelector("#project-kicker");
    const projectDescription = document.querySelector("#project-description");
    const projectYear = document.querySelector("#project-year");
    const projectRole = document.querySelector("#project-role");
    const projectLayout = document.querySelector("#project-layout");
    const projectVisible = document.querySelector("#project-visible");
    const projectCoverMedia = document.querySelector("#project-cover-media");
    const projectSocialTitle = document.querySelector("#project-social-title");
    const projectSocialDescription = document.querySelector("#project-social-description");
    const projectSocialMedia = document.querySelector("#project-social-media");
    const layoutDescription = document.querySelector("[data-layout-description]");

    const projectMediaSection = document.querySelector("[data-project-media-section]");
    const createProjectMediaNote = document.querySelector("[data-create-project-media-note]");
    const projectMediaFile = document.querySelector("#project-media-file");
    const projectMediaAlt = document.querySelector("#project-media-alt");
    const uploadProjectMediaButton = document.querySelector("[data-upload-project-media]");
    const projectMediaList = document.querySelector("[data-project-media-list]");
    const projectMediaCount = document.querySelector("[data-project-media-count]");

    const pageLayoutSection = document.querySelector("[data-page-layout-section]");
    const customLayoutEnabled = document.querySelector("#project-custom-layout-enabled");
    const pageLayoutStatus = document.querySelector("[data-page-layout-status]");
    const pageLayoutBuilder = document.querySelector("[data-page-layout-builder]");
    const pageLayoutPreset = document.querySelector("#project-page-preset");
    const pagePresetDescription = document.querySelector("[data-page-preset-description]");
    const applyPagePresetButton = document.querySelector("[data-apply-page-preset]");
    const pageLayoutCanvas = document.querySelector("[data-page-layout-canvas]");
    const pageLayoutInspector = document.querySelector("[data-page-layout-inspector]");
    const layoutInspectorTitle = document.querySelector("[data-layout-inspector-title]");
    const layoutTextField = document.querySelector("[data-layout-text-field]");
    const layoutBlockText = document.querySelector("#layout-block-text");
    const layoutFitField = document.querySelector("[data-layout-fit-field]");
    const layoutBlockFit = document.querySelector("#layout-block-fit");
    const layoutFocalFields = document.querySelector("[data-layout-focal-fields]");
    const layoutBlockFocalX = document.querySelector("#layout-block-focal-x");
    const layoutBlockFocalY = document.querySelector("#layout-block-focal-y");
    const layoutUseImageCropButton = document.querySelector("[data-layout-use-image-crop]");
    const layoutSectionTypeField = document.querySelector("[data-layout-section-type-field]");
    const layoutSectionType = document.querySelector("#layout-section-type");
    const layoutSectionStyleFields = document.querySelector("[data-layout-section-style-fields]");
    const layoutSectionBackground = document.querySelector("#layout-section-background");
    const layoutSectionWidth = document.querySelector("#layout-section-width");
    const layoutSectionAlign = document.querySelector("#layout-section-align");
    const layoutSectionSpacing = document.querySelector("#layout-section-spacing");
    const layoutSectionShowHeading = document.querySelector("#layout-section-show-heading");
    const layoutBlockSectionField = document.querySelector("[data-layout-block-section-field]");
    const layoutBlockSection = document.querySelector("#layout-block-section");
    const layoutBlockX = document.querySelector("#layout-block-x");
    const layoutBlockY = document.querySelector("#layout-block-y");
    const layoutBlockWidth = document.querySelector("#layout-block-width");
    const layoutBlockHeight = document.querySelector("#layout-block-height");
    const addLayoutHeadingButton = document.querySelector("[data-add-layout-heading]");
    const addLayoutTextButton = document.querySelector("[data-add-layout-text]");
    const addLayoutSpacerButton = document.querySelector("[data-add-layout-spacer]");
    const addLayoutMediaButton = document.querySelector("[data-add-layout-media]");
    const duplicateLayoutSectionButton = document.querySelector("[data-duplicate-layout-section]");
    const layoutUndoButton = document.querySelector("[data-layout-undo]");
    const layoutRedoButton = document.querySelector("[data-layout-redo]");
    const resetPageLayoutButton = document.querySelector("[data-reset-page-layout]");
    const removeLayoutBlockButton = document.querySelector("[data-remove-layout-block]");
    const previewProjectButton = document.querySelector("[data-preview-project]");

    if (pageLayoutSection && projectMediaSection) {
        projectMediaSection.before(pageLayoutSection);
    }

    let currentSettings = null;
    let projects = [];
    let editingProject = null;
    let editorMode = "edit";
    let editingPageLayout = {
        version: 1,
        preset: "canvas",
        blocks: []
    };
    let selectedLayoutBlockId = null;
    let pageLayoutDirty = false;
    let layoutHistory = [];
    let layoutHistoryIndex = -1;
    let restoringLayoutHistory = false;


    /* MESSAGES */

    function showToast(message) {
        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.classList.add("visible");

        window.setTimeout(() => {
            toast.classList.remove("visible");
        }, 3300);
    }

    function handleExpiredLogin() {
        showToast(
            "Your login expired. Please sign in again."
        );

        window.setTimeout(() => {
            window.location.href = "../admin-login.html";
        }, 1200);
    }


    /* SESSION */

    function setUsername(username) {
        usernameElements.forEach((element) => {
            element.textContent = username;
        });

        if (avatar) {
            avatar.textContent = username
                .charAt(0)
                .toUpperCase();
        }
    }

    async function checkSession() {
        try {
            const response = await fetch(
                "/api/admin/session",
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error("Unable to verify session.");
            }

            const data = await response.json();

            if (!data.authenticated) {
                window.location.href = "../admin-login.html";
                return false;
            }

            setUsername(data.username);
            return true;
        } catch (error) {
            console.error("Session check failed:", error);
            showToast("We couldn't verify your login. Please sign in again.");

            window.setTimeout(() => {
                window.location.href = "../admin-login.html";
            }, 1200);

            return false;
        }
    }

    async function logout() {
        logoutButtons.forEach((button) => {
            button.disabled = true;
            button.textContent = "Logging Out...";
        });

        try {
            const response = await fetch(
                "/api/admin/logout",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Unable to log out.");
            }

            window.location.href = "../admin-login.html";
        } catch (error) {
            console.error("Logout failed:", error);
            showToast("We couldn't log you out. Please try again.");

            logoutButtons.forEach((button) => {
                button.disabled = false;
                button.textContent = "Log Out";
            });
        }
    }

    logoutButtons.forEach((button) => {
        button.addEventListener("click", logout);
    });


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


    /* SETTINGS */

    function makeSureFontExists(select, value) {
        if (!select || !value) {
            return;
        }

        const exists = Array.from(select.options)
            .some(option => option.value === value);

        if (exists) {
            return;
        }

        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    }

    function updateFontPreviews() {
        const heading = displayFont?.value || "Playfair Display";
        const regular = bodyFont?.value || "Lato";

        loadGoogleFont(heading);
        loadGoogleFont(regular);

        if (displayFontPreview) {
            displayFontPreview.style.fontFamily =
                fontStack(heading, "display");
        }

        if (bodyFontPreview) {
            bodyFontPreview.style.fontFamily =
                fontStack(regular, "body");
        }
    }

    displayFont?.addEventListener("change", updateFontPreviews);
    bodyFont?.addEventListener("change", updateFontPreviews);

    function validHexCode(value) {
        return /^#[0-9A-F]{6}$/i.test(value);
    }

    function setColorFieldValue(field, value) {
        const normalized = validHexCode(value)
            ? value.toUpperCase()
            : field.fallback;

        if (field.picker) {
            field.picker.value = normalized;
        }

        if (field.hex) {
            field.hex.value = normalized;
            field.hex.setCustomValidity("");
        }
    }

    colorFields.forEach((field) => {
        field.picker?.addEventListener("input", () => {
            setColorFieldValue(field, field.picker.value);
        });

        field.hex?.addEventListener("input", () => {
            const value = field.hex.value.trim();
            const isValid = validHexCode(value);

            field.hex.setCustomValidity(
                isValid
                    ? ""
                    : "Enter a six-digit hex code such as #F650BD."
            );

            if (isValid && field.picker) {
                field.picker.value = value.toUpperCase();
            }
        });

        field.hex?.addEventListener("blur", () => {
            const value = field.hex.value.trim();

            if (validHexCode(value)) {
                setColorFieldValue(field, value);
            }
        });
    });

    function setSettingsReady(ready) {
        [
            heroKicker,
            heroTitle,
            displayFont,
            bodyFont,
            ...colorFields.flatMap(field => [field.picker, field.hex]),
            footerText,
            homeButtonLabel,
            homeButtonUrl,
            websiteLogoFile,
            websiteFaviconFile
        ].forEach((element) => {
            if (element) {
                element.disabled = !ready;
            }
        });

        if (heroDescription) {
            heroDescription.disabled = true;
        }

        [saveHomepageButton, saveColorButton].forEach((button) => {
            if (!button) {
                return;
            }

            button.disabled = !ready;
            button.classList.toggle("disabled-button", !ready);
            button.classList.toggle("primary-link-button", ready);
        });

        if (settingsStatus) {
            settingsStatus.textContent = ready
                ? "Ready to Edit"
                : "Loading...";
        }

        [uploadLogoButton, uploadFaviconButton].forEach(button => {
            if (button) {
                button.disabled = !ready;
            }
        });
    }

    function setAboutReady(ready) {
        [
            aboutKicker,
            aboutTitle,
            aboutBio,
            contactEmail,
            contactPhone,
            instagramUrl,
            aboutPhotoFile
        ].forEach((element) => {
            if (element) {
                element.disabled = !ready;
            }
        });

        if (saveAboutButton) {
            saveAboutButton.disabled = !ready;
            saveAboutButton.classList.toggle(
                "disabled-button",
                !ready
            );
            saveAboutButton.classList.toggle(
                "primary-link-button",
                ready
            );
        }

        if (replaceAboutPhotoButton) {
            replaceAboutPhotoButton.disabled = !ready;
        }

        if (aboutStatus) {
            aboutStatus.textContent = ready
                ? "Ready to Edit"
                : "Loading...";
        }
    }

    function setAboutPhotoPreview(key) {
        const source = key
            ? getMediaUrl(key)
            : "../assets/may_photo.jpg";

        if (aboutPhotoPreview) {
            aboutPhotoPreview.src = source;
        }

        if (aboutMediaPreview) {
            aboutMediaPreview.src = source;
        }
    }

    function setBrandingPreview(
        image,
        empty,
        key,
        fallbackSource = ""
    ) {
        if (!image || !empty) {
            return;
        }

        const source = key
            ? getMediaUrl(key)
            : fallbackSource;

        if (source) {
            image.src = source;
            image.hidden = false;
            empty.hidden = true;
        } else {
            image.removeAttribute("src");
            image.hidden = true;
            empty.hidden = false;
        }
    }

    function populateSettings(settings) {
        currentSettings = settings;

        if (heroKicker) {
            heroKicker.value = settings.hero_kicker || "";
        }

        if (heroTitle) {
            heroTitle.value = settings.hero_title || "";
        }

        if (heroDescription) {
            heroDescription.value = "";
            heroDescription.placeholder =
                "This isn't shown on the homepage right now.";
        }

        const savedDisplayFont = settings.display_font || "Playfair Display";
        const savedBodyFont = settings.body_font || "Lato";

        makeSureFontExists(displayFont, savedDisplayFont);
        makeSureFontExists(bodyFont, savedBodyFont);

        if (displayFont) {
            displayFont.value = savedDisplayFont;
        }

        if (bodyFont) {
            bodyFont.value = savedBodyFont;
        }

        colorFields.forEach((field) => {
            setColorFieldValue(
                field,
                settings[field.key] || field.fallback
            );
        });

        if (footerText) {
            footerText.value = settings.footer_text || "Maybelin Works";
        }

        if (homeButtonLabel) {
            homeButtonLabel.value = settings.home_button_label || "";
        }

        if (homeButtonUrl) {
            homeButtonUrl.value = settings.home_button_url || "";
        }

        setBrandingPreview(
            logoPreview,
            logoPreviewEmpty,
            settings.logo_key,
            "../assets/maygarcia_logo_lime.png"
        );
        setBrandingPreview(
            faviconPreview,
            faviconPreviewEmpty,
            settings.favicon_key,
            "../assets/favicon-32.png?v=20260816-19"
        );

        updateFontPreviews();

        if (aboutKicker) {
            aboutKicker.value = settings.about_kicker || "";
        }

        if (aboutTitle) {
            aboutTitle.value = settings.about_title || "";
        }

        if (aboutBio) {
            aboutBio.value = settings.about_bio || "";
        }

        if (contactEmail) {
            contactEmail.value = settings.contact_email || "";
        }

        if (contactPhone) {
            contactPhone.value = settings.contact_phone || "";
        }

        if (instagramUrl) {
            instagramUrl.value = settings.instagram_url || "";
        }

        setAboutPhotoPreview(settings.about_photo_key);
    }

    async function loadSettings() {
        setSettingsReady(false);
        setAboutReady(false);

        try {
            const response = await fetch(
                "/api/settings",
                {
                    method: "GET",
                    credentials: "include",
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
                throw new Error("Website settings were not found.");
            }

            populateSettings(data.settings);
            setSettingsReady(true);
            setAboutReady(true);
        } catch (error) {
            console.error("Settings failed to load:", error);

            if (settingsStatus) {
                settingsStatus.textContent = "Couldn't Load";
            }

            if (aboutStatus) {
                aboutStatus.textContent = "Couldn't Load";
            }

            showToast("We couldn't load the website settings. Try refreshing the page.");
        }
    }

    async function saveSettingsPayload(payload, successMessage) {
        const response = await fetch(
            "/api/admin/settings",
            {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        if (response.status === 401) {
            handleExpiredLogin();
            return null;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to save website settings."
            );
        }

        if (data.settings) {
            currentSettings = data.settings;
        }

        showToast(successMessage);
        return data.settings || currentSettings;
    }

    async function saveHomepage() {
        if (!currentSettings) {
            return;
        }

        if (!heroKicker.value.trim()) {
            showToast("Add the small text above your heading before saving.");
            heroKicker.focus();
            return;
        }

        if (!heroTitle.value.trim()) {
            showToast("Your main heading can't be empty.");
            heroTitle.focus();
            return;
        }

        const invalidColorField = colorFields.find(
            field => !validHexCode(field.hex?.value.trim() || "")
        );

        if (invalidColorField) {
            showToast(
                `${invalidColorField.name} needs a six-digit hex code, like ${invalidColorField.fallback}.`
            );
            invalidColorField.hex?.focus();
            return;
        }

        const colorPayload = Object.fromEntries(
            colorFields.map(field => [
                field.key,
                field.hex.value.trim().toUpperCase()
            ])
        );

        const saveButtons = [saveHomepageButton, saveColorButton]
            .filter(Boolean);
        const originalButtonText = saveButtons.map(button => {
            return button.textContent;
        });

        saveButtons.forEach((button) => {
            button.disabled = true;
            button.textContent = "Saving...";
        });

        try {
            await saveSettingsPayload(
                {
                    hero_kicker: heroKicker.value.trim(),
                    hero_title: heroTitle.value.trim(),
                    hero_description: currentSettings.hero_description,
                    display_font: displayFont.value,
                    body_font: bodyFont.value,
                    ...colorPayload,
                    footer_text: footerText?.value.trim() || "Maybelin Works",
                    home_button_label: homeButtonLabel?.value.trim() || null,
                    home_button_url: homeButtonUrl?.value.trim() || null
                },
                "Website settings saved!"
            );

            settingsStatus.textContent = "Saved";

            window.setTimeout(() => {
                settingsStatus.textContent = "Ready to Edit";
            }, 1800);
        } catch (error) {
            console.error("Unable to save homepage:", error);
            showToast(error.message || "Something went wrong while saving.");
        } finally {
            saveButtons.forEach((button, index) => {
                button.disabled = false;
                button.textContent = originalButtonText[index];
            });
        }
    }

    saveHomepageButton?.addEventListener("click", saveHomepage);
    saveColorButton?.addEventListener("click", saveHomepage);

    async function uploadBrandingAsset(type) {
        const isLogo = type === "logo";
        const fileInput = isLogo
            ? websiteLogoFile
            : websiteFaviconFile;
        const button = isLogo
            ? uploadLogoButton
            : uploadFaviconButton;
        const file = fileInput?.files?.[0];

        if (!file) {
            showToast(`Choose a ${isLogo ? "logo" : "tab logo"} first.`);
            fileInput?.focus();
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            showToast("Images must be 20 MB or smaller.");
            return;
        }

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Uploading...";
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(
                `/api/admin/branding/${type}`,
                {
                    method: "POST",
                    credentials: "include",
                    body: formData
                }
            );

            if (response.status === 401) {
                handleExpiredLogin();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to upload that image.");
            }

            const keyName = isLogo ? "logo_key" : "favicon_key";
            currentSettings = {
                ...currentSettings,
                [keyName]: data.key
            };
            setBrandingPreview(
                isLogo ? logoPreview : faviconPreview,
                isLogo ? logoPreviewEmpty : faviconPreviewEmpty,
                data.key
            );
            fileInput.value = "";
            showToast(`${isLogo ? "Logo" : "Tab logo"} updated!`);
        } catch (error) {
            console.error("Unable to upload branding image:", error);
            showToast(error.message || "Unable to upload that image.");
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    uploadLogoButton?.addEventListener("click", () => {
        uploadBrandingAsset("logo");
    });

    uploadFaviconButton?.addEventListener("click", () => {
        uploadBrandingAsset("favicon");
    });

    async function saveAbout() {
        if (!currentSettings || !saveAboutButton) {
            return;
        }

        if (!aboutTitle.value.trim()) {
            showToast("Your About Me section needs a heading.");
            aboutTitle.focus();
            return;
        }

        if (!aboutBio.value.trim()) {
            showToast("Add your About Me biography before saving.");
            aboutBio.focus();
            return;
        }

        const originalText = saveAboutButton.textContent;
        saveAboutButton.disabled = true;
        saveAboutButton.textContent = "Saving...";

        try {
            const settings = await saveSettingsPayload(
                {
                    about_kicker: aboutKicker.value.trim(),
                    about_title: aboutTitle.value.trim(),
                    about_bio: aboutBio.value.trim(),
                    contact_email: contactEmail.value.trim() || null,
                    contact_phone: contactPhone.value.trim() || null,
                    instagram_url: instagramUrl.value.trim() || null
                },
                "About Me changes saved!"
            );

            if (settings) {
                populateSettings(settings);
                setSettingsReady(true);
                setAboutReady(true);
            }

            aboutStatus.textContent = "Saved";

            window.setTimeout(() => {
                aboutStatus.textContent = "Ready to Edit";
            }, 1800);
        } catch (error) {
            console.error("Unable to save About Me:", error);
            showToast(error.message || "Something went wrong while saving About Me.");
        } finally {
            saveAboutButton.disabled = false;
            saveAboutButton.textContent = originalText;
        }
    }

    saveAboutButton?.addEventListener("click", saveAbout);

    async function replaceAboutPhoto() {
        const file = aboutPhotoFile?.files?.[0];

        if (!file) {
            showToast("Choose a new About Me photo first.");
            aboutPhotoFile?.focus();
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            showToast("Photos must be 20 MB or smaller.");
            return;
        }

        const originalText = replaceAboutPhotoButton.textContent;
        replaceAboutPhotoButton.disabled = true;
        replaceAboutPhotoButton.textContent = "Uploading...";

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(
                "/api/admin/about/photo",
                {
                    method: "POST",
                    credentials: "include",
                    body: formData
                }
            );

            if (response.status === 401) {
                handleExpiredLogin();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to replace the photo."
                );
            }

            currentSettings = {
                ...currentSettings,
                about_photo_key: data.about_photo_key
            };

            setAboutPhotoPreview(data.about_photo_key);
            aboutPhotoFile.value = "";
            showToast("About Me photo replaced!");
        } catch (error) {
            console.error("Unable to replace About photo:", error);
            showToast(error.message || "We couldn't replace that photo.");
        } finally {
            replaceAboutPhotoButton.disabled = false;
            replaceAboutPhotoButton.textContent = originalText;
        }
    }

    replaceAboutPhotoButton?.addEventListener(
        "click",
        replaceAboutPhoto
    );


    /* PROJECT HELPERS */

    function sortedMedia(project) {
        if (!Array.isArray(project?.media)) {
            return [];
        }

        return [...project.media].sort((a, b) => {
            const orderDifference =
                (Number(a.sort_order) || 0) -
                (Number(b.sort_order) || 0);

            return orderDifference ||
                Number(a.id) - Number(b.id);
        });
    }

    function makeProjectPreview(description) {
        if (!description) {
            return "No project description has been added yet.";
        }

        const cleaned = description
            .replace(/\s+/g, " ")
            .trim();

        if (cleaned.length <= 220) {
            return cleaned;
        }

        return `${cleaned.slice(0, 217)}...`;
    }

    function updateProjectSummary() {
        if (projectCount) {
            projectCount.textContent = String(projects.length);
        }

        const totalMedia = projects.reduce(
            (total, project) => total + sortedMedia(project).length,
            0
        );

        if (mediaCount) {
            mediaCount.textContent = String(totalMedia);
        }

        if (mediaCountLarge) {
            mediaCountLarge.textContent = String(totalMedia);
        }

        if (!projectSummary) {
            return;
        }

        const visible = projects.filter(
            project => Number(project.is_published) === 1
        );

        if (!visible.length) {
            projectSummary.textContent = "No projects are currently visible";
            return;
        }

        const names = visible.map(project => project.title);

        if (names.length === 1) {
            projectSummary.textContent = names[0];
        } else if (names.length === 2) {
            projectSummary.textContent = `${names[0]} and ${names[1]}`;
        } else {
            projectSummary.textContent =
                `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
        }
    }

    function renderProjects() {
        if (!projectList) {
            return;
        }

        projectList.replaceChildren();

        const sortedProjects = [...projects].sort((a, b) => {
            const orderDifference =
                (Number(a.sort_order) || 0) -
                (Number(b.sort_order) || 0);

            return orderDifference || Number(a.id) - Number(b.id);
        });

        if (!sortedProjects.length) {
            const empty = document.createElement("article");
            empty.className = "project-admin-card project-loading-card";
            empty.innerHTML = `
                <div class="project-admin-number">00</div>
                <div class="project-admin-content">
                    <p class="project-admin-type">Portfolio</p>
                    <h3>No Projects Yet</h3>
                    <p>Use “Add a Project” to create the first one.</p>
                </div>
            `;
            projectList.appendChild(empty);
            updateProjectSummary();
            return;
        }

        sortedProjects.forEach((project, index) => {
            const card = document.createElement("article");
            card.className = "project-admin-card";

            if (Number(project.is_published) !== 1) {
                card.classList.add("project-is-hidden");
            }

            const number = document.createElement("div");
            number.className = "project-admin-number";
            number.textContent = String(index + 1).padStart(2, "0");

            const content = document.createElement("div");
            content.className = "project-admin-content";

            const type = document.createElement("p");
            type.className = "project-admin-type";
            type.textContent = project.kicker || "Portfolio Project";

            const title = document.createElement("h3");
            title.textContent = project.title || "Untitled Project";

            const description = document.createElement("p");
            description.textContent = makeProjectPreview(project.description);

            content.append(type, title, description);

            const meta = document.createElement("div");
            meta.className = "project-admin-meta";

            const layout = document.createElement("div");
            layout.innerHTML = `<span>Layout</span><strong></strong>`;
            layout.querySelector("strong").textContent =
                GALLERY_LAYOUTS[project.gallery_layout]?.label || "Smart Gallery";

            const images = document.createElement("div");
            images.innerHTML = `<span>Images</span><strong></strong>`;
            images.querySelector("strong").textContent =
                String(sortedMedia(project).length);

            const visible = document.createElement("div");
            visible.innerHTML = `<span>Website</span><strong></strong>`;
            visible.querySelector("strong").textContent =
                Number(project.is_published) === 1
                    ? "Visible"
                    : "Hidden";

            meta.append(layout, images, visible);

            const editButton = document.createElement("button");
            editButton.className = "project-edit-button";
            editButton.type = "button";
            editButton.textContent = "Edit Project";
            editButton.addEventListener("click", () => {
                openProjectEditor(project.slug);
            });

            const actions = document.createElement("div");
            actions.className = "project-admin-actions";

            const moveUpButton = document.createElement("button");
            moveUpButton.type = "button";
            moveUpButton.textContent = "Move Up";
            moveUpButton.disabled = index === 0;
            moveUpButton.addEventListener("click", () => {
                moveProject(project.id, -1);
            });

            const moveDownButton = document.createElement("button");
            moveDownButton.type = "button";
            moveDownButton.textContent = "Move Down";
            moveDownButton.disabled = index === sortedProjects.length - 1;
            moveDownButton.addEventListener("click", () => {
                moveProject(project.id, 1);
            });

            const duplicateButton = document.createElement("button");
            duplicateButton.type = "button";
            duplicateButton.textContent = "Duplicate";
            duplicateButton.addEventListener("click", () => {
                duplicateProject(project.id, duplicateButton);
            });

            actions.append(
                moveUpButton,
                moveDownButton,
                duplicateButton,
                editButton
            );

            card.append(number, content, meta, actions);
            projectList.appendChild(card);
        });

        updateProjectSummary();
    }

    async function saveProjectOrder(orderedProjects) {
        const response = await fetch(
            "/api/admin/projects/order",
            {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    project_ids: orderedProjects.map(project => Number(project.id))
                })
            }
        );
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to reorder projects.");
        }
    }

    async function moveProject(projectIdValue, direction) {
        const ordered = [...projects].sort((a, b) =>
            (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) ||
            Number(a.id) - Number(b.id)
        );
        const index = ordered.findIndex(
            project => Number(project.id) === Number(projectIdValue)
        );
        const targetIndex = index + direction;

        if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
            return;
        }

        [ordered[index], ordered[targetIndex]] = [
            ordered[targetIndex],
            ordered[index]
        ];

        const previous = projects;
        projects = ordered.map((project, order) => ({
            ...project,
            sort_order: order
        }));
        renderProjects();

        try {
            await saveProjectOrder(projects);
            showToast("Project order updated!");
        } catch (error) {
            projects = previous;
            renderProjects();
            showToast(error.message || "Unable to reorder projects.");
        }
    }

    async function duplicateProject(projectIdValue, button) {
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Duplicating...";

        try {
            const response = await fetch(
                `/api/admin/projects/${projectIdValue}/duplicate`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to duplicate the project.");
            }

            projects.push(data.project);
            renderProjects();
            showToast("Project duplicated as a hidden copy.");
            openProjectEditor(data.project.slug);
        } catch (error) {
            showToast(error.message || "Unable to duplicate the project.");
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    async function loadProjects() {
        try {
            const response = await fetch(
                "/api/admin/projects",
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (response.status === 401) {
                handleExpiredLogin();
                return;
            }

            if (!response.ok) {
                throw new Error("Unable to load projects.");
            }

            const data = await response.json();
            projects = Array.isArray(data.projects)
                ? data.projects
                : [];

            renderProjects();
        } catch (error) {
            console.error("Projects failed to load:", error);

            if (projectList) {
                projectList.innerHTML = `
                    <article class="project-admin-card project-loading-card">
                        <div class="project-admin-number">!</div>
                        <div class="project-admin-content">
                            <p class="project-admin-type">Portfolio</p>
                            <h3>Projects Couldn't Load</h3>
                            <p>Refresh the page to try again.</p>
                        </div>
                    </article>
                `;
            }

            if (projectSummary) {
                projectSummary.textContent = "Projects couldn't load";
            }

            if (projectCount) {
                projectCount.textContent = "-";
            }

            if (mediaCount) {
                mediaCount.textContent = "-";
            }

            if (mediaCountLarge) {
                mediaCountLarge.textContent = "-";
            }

            showToast("We couldn't load your projects. Try refreshing the page.");
        }
    }


    /* GALLERY LAYOUT */

    function updateLayoutDescription() {
        const layout = projectLayout?.value || "smart";
        const info = GALLERY_LAYOUTS[layout] || GALLERY_LAYOUTS.smart;

        if (layoutDescription) {
            layoutDescription.innerHTML = `
                <strong>${info.label}</strong>
                <span>${info.description}</span>
            `;
        }
    }

    projectLayout?.addEventListener(
        "change",
        updateLayoutDescription
    );


    /* PROJECT PAGE EDITOR */

    function layoutNumber(value, fallback, min, max) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return fallback;
        }

        return Math.min(
            Math.max(Math.round(number), min),
            max
        );
    }

    function layoutPercent(value, fallback = 50) {
        const number = Number(value);

        return Number.isFinite(number)
            ? Math.min(Math.max(number, 0), 100)
            : fallback;
    }

    function newLayoutBlockId(type) {
        const suffix = typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

        return `${type}-${suffix}`;
    }

    function sectionLayoutForPreset(preset) {
        return PRESET_SECTION_LAYOUTS[preset] || "custom";
    }

    function sortedLayoutSections(blocks = editingPageLayout.blocks) {
        return blocks
            .filter(block => block.type === "heading")
            .sort((a, b) =>
                a.y - b.y ||
                a.x - b.x
            );
    }

    function normalizeLayoutSectionAssignments(blocks, preset) {
        const sections = sortedLayoutSections(blocks);
        const sectionIds = new Set(
            sections.map(section => section.id)
        );

        sections.forEach((section, index) => {
            if (!Object.prototype.hasOwnProperty.call(
                SECTION_LAYOUT_TYPES,
                section.section_layout
            )) {
                section.section_layout = index === 0
                    ? sectionLayoutForPreset(preset)
                    : "custom";
            }
        });

        blocks.forEach(block => {
            if (block.type === "heading") {
                delete block.section_id;
                return;
            }

            if (sectionIds.has(block.section_id)) {
                return;
            }

            const precedingSection = [...sections]
                .reverse()
                .find(section => section.y <= block.y);

            block.section_id = precedingSection?.id ||
                sections[0]?.id ||
                null;
        });

        return blocks;
    }

    function normalizeClientPageLayout(value, project) {
        if (
            !value ||
            value.version !== 1 ||
            !Array.isArray(value.blocks)
        ) {
            return {
                version: 1,
                preset: "canvas",
                blocks: []
            };
        }

        const preset = Object.prototype.hasOwnProperty.call(
            PAGE_LAYOUT_PRESETS,
            value.preset
        )
            ? value.preset
            : "canvas";

        const mediaIds = new Set(
            sortedMedia(project).map(
                media => Number(media.id)
            )
        );

        const allowedTypes = new Set([
            "media",
            "heading",
            "text",
            "spacer"
        ]);

        const blocks = value.blocks
            .filter(block =>
                block &&
                allowedTypes.has(block.type)
            )
            .map((block, index) => {
                const x = layoutNumber(
                    block.x,
                    0,
                    0,
                    PAGE_LAYOUT_COLUMNS - 1
                );

                const width = layoutNumber(
                    block.w,
                    PAGE_LAYOUT_COLUMNS,
                    1,
                    PAGE_LAYOUT_COLUMNS - x
                );

                const normalized = {
                    id: typeof block.id === "string" && block.id.trim()
                        ? block.id.trim().slice(0, 80)
                        : `block-${index + 1}`,
                    type: block.type,
                    x,
                    y: layoutNumber(block.y, 0, 0, 500),
                    w: width,
                    h: layoutNumber(block.h, 4, 1, 24)
                };

                if (block.type === "media") {
                    normalized.media_id = Number(block.media_id);
                    normalized.fit = block.fit === "cover"
                        ? "cover"
                        : "contain";

                    if (
                        Object.prototype.hasOwnProperty.call(block, "focal_x") &&
                        Number.isFinite(Number(block.focal_x))
                    ) {
                        normalized.focal_x = layoutPercent(block.focal_x);
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(block, "focal_y") &&
                        Number.isFinite(Number(block.focal_y))
                    ) {
                        normalized.focal_y = layoutPercent(block.focal_y);
                    }
                }

                if (
                    block.type === "heading" ||
                    block.type === "text"
                ) {
                    normalized.text = String(
                        block.text || (
                            block.type === "heading"
                                ? "New Section"
                                : "Add your text here."
                        )
                    ).slice(
                        0,
                        block.type === "heading" ? 160 : 1200
                    );
                }

                if (block.type === "heading") {
                    normalized.section_layout =
                        Object.prototype.hasOwnProperty.call(
                            SECTION_LAYOUT_TYPES,
                            block.section_layout
                        )
                            ? block.section_layout
                            : null;
                    normalized.section_background = [
                        "none", "soft", "dark", "purple"
                    ].includes(block.section_background)
                        ? block.section_background
                        : "none";
                    normalized.section_width = [
                        "narrow", "standard", "wide"
                    ].includes(block.section_width)
                        ? block.section_width
                        : "standard";
                    normalized.section_align = block.section_align === "center"
                        ? "center"
                        : "left";
                    normalized.section_spacing = [
                        "compact", "normal", "airy"
                    ].includes(block.section_spacing)
                        ? block.section_spacing
                        : "normal";
                    normalized.show_heading = block.show_heading !== false;
                } else {
                    normalized.section_id = typeof block.section_id === "string"
                        ? block.section_id.trim().slice(0, 80)
                        : null;
                }

                return normalized;
            })
            .filter(block =>
                block.type !== "media" ||
                mediaIds.has(block.media_id)
            );

        normalizeLayoutSectionAssignments(blocks, preset);

        return {
            version: 1,
            preset,
            blocks
        };
    }

    function suggestedPagePreset(project) {
        const suggestions = {
            publication: "book",
            full: "slides",
            grid: "grid"
        };

        return suggestions[project?.gallery_layout] || "canvas";
    }

    function updatePagePresetDescription() {
        const preset = PAGE_LAYOUT_PRESETS[
            pageLayoutPreset?.value
        ] || PAGE_LAYOUT_PRESETS.canvas;

        if (pagePresetDescription) {
            pagePresetDescription.textContent = preset.description;
        }
    }

    function galleryTemplate(project, requestedPreset = "canvas") {
        const preset = Object.prototype.hasOwnProperty.call(
            PAGE_LAYOUT_PRESETS,
            requestedPreset
        )
            ? requestedPreset
            : "canvas";

        const layout = project?.gallery_layout || projectLayout?.value || "smart";
        const media = sortedMedia(project);
        const headingByLayout = {
            smart: "Project Gallery",
            publication: "Publication",
            full: "Presentation",
            grid: "Gallery",
            featured: "Featured Work"
        };

        const headingByPreset = {
            grid: "Portfolio Grid",
            book: "Publication",
            slides: "Presentation"
        };

        const blocks = [{
            id: newLayoutBlockId("heading"),
            type: "heading",
            text: headingByPreset[preset] ||
                headingByLayout[layout] ||
                "Project Gallery",
            x: 0,
            y: 0,
            w: 12,
            h: 2,
            section_layout: sectionLayoutForPreset(preset),
            section_background: "none",
            section_width: "standard",
            section_align: "left",
            section_spacing: "normal",
            show_heading: true
        }];

        const sectionId = blocks[0].id;

        const addMediaBlock = (item, x, y, width, height) => {
            blocks.push({
                id: newLayoutBlockId("media"),
                type: "media",
                media_id: Number(item.id),
                fit: "contain",
                section_id: sectionId,
                x,
                y,
                w: width,
                h: height
            });
        };

        if (preset === "book") {
            let bookRow = 3;

            if (media[0]) {
                addMediaBlock(media[0], 3, bookRow, 6, 8);
                bookRow += 9;
            }

            const insidePages = media.slice(1, -1);

            insidePages.forEach((item, index) => {
                addMediaBlock(
                    item,
                    (index % 2) * 6,
                    bookRow + Math.floor(index / 2) * 9,
                    6,
                    8
                );
            });

            bookRow += Math.ceil(insidePages.length / 2) * 9;

            if (media.length > 1) {
                addMediaBlock(media.at(-1), 3, bookRow, 6, 8);
            }

            return {
                version: 1,
                preset,
                blocks
            };
        }

        if (preset === "slides") {
            media.forEach((item, index) => {
                addMediaBlock(item, 0, 3 + index * 8, 12, 7);
            });

            return {
                version: 1,
                preset,
                blocks
            };
        }

        if (preset === "grid") {
            media.forEach((item, index) => {
                addMediaBlock(
                    item,
                    (index % 2) * 6,
                    3 + Math.floor(index / 2) * 6,
                    6,
                    5
                );
            });

            return {
                version: 1,
                preset,
                blocks
            };
        }

        let row = 3;
        let pairIndex = 0;

        media.forEach((item, index) => {
            let x = 0;
            let width = 12;
            let height = 7;
            let y = row;

            if (layout === "full") {
                row += 8;
            } else if (layout === "featured" && index === 0) {
                row += 8;
            } else {
                const column = pairIndex % 2;
                height = layout === "publication" ? 7 : 5;
                width = 6;
                x = column * 6;
                y = row;
                pairIndex++;

                if (column === 1 || index === media.length - 1) {
                    row += height + 1;
                }
            }

            addMediaBlock(item, x, y, width, height);
        });

        return {
            version: 1,
            preset,
            blocks
        };
    }

    function currentLayoutBottom() {
        return editingPageLayout.blocks.reduce(
            (bottom, block) => Math.max(
                bottom,
                block.y + block.h
            ),
            0
        );
    }

    function layoutHistorySnapshot() {
        return JSON.stringify({
            enabled: Boolean(customLayoutEnabled?.checked),
            layout: editingPageLayout
        });
    }

    function updateLayoutHistoryButtons() {
        if (layoutUndoButton) {
            layoutUndoButton.disabled = layoutHistoryIndex <= 0;
        }

        if (layoutRedoButton) {
            layoutRedoButton.disabled =
                layoutHistoryIndex < 0 ||
                layoutHistoryIndex >= layoutHistory.length - 1;
        }
    }

    function resetLayoutHistory() {
        layoutHistory = [layoutHistorySnapshot()];
        layoutHistoryIndex = 0;
        updateLayoutHistoryButtons();
    }

    function recordLayoutHistory() {
        if (restoringLayoutHistory) {
            return;
        }

        const snapshot = layoutHistorySnapshot();

        if (layoutHistory[layoutHistoryIndex] === snapshot) {
            updateLayoutHistoryButtons();
            return;
        }

        layoutHistory = layoutHistory.slice(0, layoutHistoryIndex + 1);
        layoutHistory.push(snapshot);

        if (layoutHistory.length > 60) {
            layoutHistory.shift();
        }

        layoutHistoryIndex = layoutHistory.length - 1;
        updateLayoutHistoryButtons();
    }

    function restoreLayoutHistory(index) {
        if (index < 0 || index >= layoutHistory.length) {
            return;
        }

        restoringLayoutHistory = true;

        try {
            const state = JSON.parse(layoutHistory[index]);
            editingPageLayout = normalizeClientPageLayout(
                state.layout,
                editingProject || { media: [] }
            );
            customLayoutEnabled.checked = Boolean(state.enabled);
            selectedLayoutBlockId = null;
            layoutHistoryIndex = index;
            pageLayoutDirty = true;
            renderPageLayout();
            updateLayoutHistoryButtons();
        } finally {
            restoringLayoutHistory = false;
        }
    }

    function markPageLayoutDirty(recordHistory = true) {
        pageLayoutDirty = true;

        if (recordHistory) {
            recordLayoutHistory();
        }

        updatePageLayoutStatus();
    }

    function updatePageLayoutStatus() {
        const enabled = Boolean(customLayoutEnabled?.checked);

        if (pageLayoutBuilder) {
            pageLayoutBuilder.hidden = !enabled;
        }

        if (pageLayoutStatus) {
            const preset = PAGE_LAYOUT_PRESETS[
                editingPageLayout.preset
            ] || PAGE_LAYOUT_PRESETS.canvas;
            const sections = sortedLayoutSections();
            const sectionCount = sections.length;
            const layoutLabel = sectionCount > 1
                ? "Mixed Sections"
                : (
                    SECTION_LAYOUT_TYPES[
                        sections[0]?.section_layout
                    ] || preset.label
                );

            pageLayoutStatus.textContent = enabled
                ? (
                    pageLayoutDirty
                        ? "Unsaved Layout"
                        : (
                            layoutLabel
                        )
                )
                : "Gallery Layout";
        }
    }

    function selectedLayoutBlock() {
        return editingPageLayout.blocks.find(
            block => block.id === selectedLayoutBlockId
        ) || null;
    }

    function activeLayoutSectionId() {
        const selected = selectedLayoutBlock();

        if (selected?.type === "heading") {
            return selected.id;
        }

        if (selected?.section_id) {
            return selected.section_id;
        }

        return sortedLayoutSections().at(-1)?.id || null;
    }

    function sectionForLayoutBlock(block) {
        if (block.type === "heading") {
            return block;
        }

        return editingPageLayout.blocks.find(
            candidate =>
                candidate.type === "heading" &&
                candidate.id === block.section_id
        ) || null;
    }

    function mediaForLayoutBlock(block) {
        return sortedMedia(editingProject).find(
            media => Number(media.id) === Number(block.media_id)
        ) || null;
    }

    function layoutBlockLabel(block) {
        if (block.type === "media") {
            const media = mediaForLayoutBlock(block);
            return media?.alt_text || "Project image";
        }

        if (block.type === "heading") {
            const sectionType = SECTION_LAYOUT_TYPES[
                block.section_layout
            ] || SECTION_LAYOUT_TYPES.custom;

            return `${block.text || "Section heading"} • ${sectionType}`;
        }

        if (block.type === "text") {
            return "Text block";
        }

        return "Space";
    }

    function layoutBlockCanvasLabel(block) {
        const label = layoutBlockLabel(block);
        const section = sectionForLayoutBlock(block);

        if (block.type === "heading" || !section) {
            return label;
        }

        return `${label} • ${section.text || "Section"}`;
    }

    function positionLayoutElement(element, block) {
        element.style.left =
            `calc(${block.x} * (100% / ${PAGE_LAYOUT_COLUMNS}))`;
        element.style.top =
            `${block.y * PAGE_LAYOUT_ROW_HEIGHT}px`;
        element.style.width =
            `calc(${block.w} * (100% / ${PAGE_LAYOUT_COLUMNS}))`;
        element.style.height =
            `${block.h * PAGE_LAYOUT_ROW_HEIGHT}px`;
    }

    function updatePageLayoutCanvasHeight() {
        if (!pageLayoutCanvas) {
            return;
        }

        const rows = Math.max(
            12,
            currentLayoutBottom() + 2
        );

        pageLayoutCanvas.style.height =
            `${rows * PAGE_LAYOUT_ROW_HEIGHT}px`;
    }

    function renderLayoutInspector() {
        const block = selectedLayoutBlock();

        if (!pageLayoutInspector || !block) {
            if (pageLayoutInspector) {
                pageLayoutInspector.hidden = true;
            }
            return;
        }

        pageLayoutInspector.hidden = false;
        layoutInspectorTitle.textContent = layoutBlockLabel(block);

        const hasText =
            block.type === "heading" ||
            block.type === "text";

        layoutTextField.hidden = !hasText;
        layoutFitField.hidden = block.type !== "media";
        layoutFocalFields.hidden = block.type !== "media";
        layoutSectionTypeField.hidden = block.type !== "heading";
        layoutSectionStyleFields.hidden = block.type !== "heading";

        const sections = sortedLayoutSections();
        layoutBlockSectionField.hidden =
            block.type === "heading" ||
            !sections.length;

        if (hasText) {
            layoutBlockText.maxLength = block.type === "heading"
                ? 160
                : 1200;
            layoutBlockText.value = block.text || "";
        }

        if (block.type === "media") {
            layoutBlockFit.value = block.fit || "contain";
            const media = mediaForLayoutBlock(block);
            layoutBlockFocalX.value = String(layoutPercent(
                block.focal_x,
                layoutPercent(media?.focal_x)
            ));
            layoutBlockFocalY.value = String(layoutPercent(
                block.focal_y,
                layoutPercent(media?.focal_y)
            ));
        }

        if (block.type === "heading") {
            layoutSectionType.value =
                block.section_layout || "custom";
            layoutSectionBackground.value =
                block.section_background || "none";
            layoutSectionWidth.value = block.section_width || "standard";
            layoutSectionAlign.value = block.section_align || "left";
            layoutSectionSpacing.value = block.section_spacing || "normal";
            layoutSectionShowHeading.checked = block.show_heading !== false;
        } else if (sections.length) {
            layoutBlockSection.replaceChildren();

            sections.forEach((section, index) => {
                const option = document.createElement("option");
                option.value = section.id;
                option.textContent = section.text ||
                    `Section ${index + 1}`;
                layoutBlockSection.appendChild(option);
            });

            layoutBlockSection.value = sectionForLayoutBlock(block)?.id ||
                sections[0].id;
        }

        layoutBlockX.value = String(block.x + 1);
        layoutBlockY.value = String(block.y + 1);
        layoutBlockWidth.value = String(block.w);
        layoutBlockHeight.value = String(block.h);

        removeLayoutBlockButton.textContent = block.type === "media"
            ? "Hide Image from Layout"
            : "Remove Block";
    }

    function selectLayoutBlock(blockId) {
        selectedLayoutBlockId = blockId;

        pageLayoutCanvas
            ?.querySelectorAll("[data-layout-block-id]")
            .forEach(element => {
                element.classList.toggle(
                    "is-selected",
                    element.dataset.layoutBlockId === blockId
                );
            });

        renderLayoutInspector();
    }

    function startLayoutPointer(
        event,
        block,
        mode,
        blockElement
    ) {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        event.preventDefault();
        selectLayoutBlock(block.id);

        const pointerTarget = event.currentTarget;
        const canvasRect = pageLayoutCanvas.getBoundingClientRect();
        const columnWidth = canvasRect.width / PAGE_LAYOUT_COLUMNS;
        const startX = event.clientX;
        const startY = event.clientY;
        const initial = {
            x: block.x,
            y: block.y,
            w: block.w,
            h: block.h
        };

        pointerTarget.setPointerCapture(event.pointerId);

        const move = moveEvent => {
            moveEvent.preventDefault();

            const columnDelta = Math.round(
                (moveEvent.clientX - startX) / columnWidth
            );

            const rowDelta = Math.round(
                (moveEvent.clientY - startY) / PAGE_LAYOUT_ROW_HEIGHT
            );

            if (mode === "resize") {
                block.w = layoutNumber(
                    initial.w + columnDelta,
                    initial.w,
                    1,
                    PAGE_LAYOUT_COLUMNS - block.x
                );

                block.h = layoutNumber(
                    initial.h + rowDelta,
                    initial.h,
                    1,
                    24
                );
            } else {
                block.x = layoutNumber(
                    initial.x + columnDelta,
                    initial.x,
                    0,
                    PAGE_LAYOUT_COLUMNS - block.w
                );

                block.y = layoutNumber(
                    initial.y + rowDelta,
                    initial.y,
                    0,
                    500
                );
            }

            positionLayoutElement(blockElement, block);
            updatePageLayoutCanvasHeight();
            renderLayoutInspector();
            markPageLayoutDirty(false);
        };

        const finish = () => {
            pointerTarget.removeEventListener("pointermove", move);
            pointerTarget.removeEventListener("pointerup", finish);
            pointerTarget.removeEventListener("pointercancel", finish);
            recordLayoutHistory();
            renderPageLayout();
        };

        pointerTarget.addEventListener("pointermove", move);
        pointerTarget.addEventListener("pointerup", finish);
        pointerTarget.addEventListener("pointercancel", finish);
    }

    function moveLayoutBlockWithKeyboard(event, block) {
        const directions = {
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            ArrowUp: [0, -1],
            ArrowDown: [0, 1]
        };

        const direction = directions[event.key];

        if (!direction) {
            return;
        }

        event.preventDefault();

        if (event.shiftKey) {
            block.w = layoutNumber(
                block.w + direction[0],
                block.w,
                1,
                PAGE_LAYOUT_COLUMNS - block.x
            );

            block.h = layoutNumber(
                block.h + direction[1],
                block.h,
                1,
                24
            );
        } else {
            block.x = layoutNumber(
                block.x + direction[0],
                block.x,
                0,
                PAGE_LAYOUT_COLUMNS - block.w
            );

            block.y = layoutNumber(
                block.y + direction[1],
                block.y,
                0,
                500
            );
        }

        markPageLayoutDirty();
        renderPageLayout();

        window.setTimeout(() => {
            pageLayoutCanvas
                ?.querySelector(
                    `[data-layout-block-id="${block.id}"]`
                )
                ?.focus();
        }, 0);
    }

    function renderPageLayout() {
        updatePageLayoutStatus();

        if (!pageLayoutCanvas || !customLayoutEnabled?.checked) {
            renderLayoutInspector();
            return;
        }

        pageLayoutCanvas.replaceChildren();
        updatePageLayoutCanvasHeight();

        if (!editingPageLayout.blocks.length) {
            const empty = document.createElement("div");
            empty.className = "layout-canvas-empty";
            empty.innerHTML = `
                <strong>Your page is empty</strong>
                <span>Add a section, text, space or project images.</span>
            `;
            pageLayoutCanvas.appendChild(empty);
            renderLayoutInspector();
            return;
        }

        editingPageLayout.blocks.forEach(block => {
            const element = document.createElement("article");
            element.className = `layout-block layout-block-${block.type}`;
            element.dataset.layoutBlockId = block.id;
            element.tabIndex = 0;
            element.setAttribute(
                "aria-label",
                `${layoutBlockLabel(block)}. Drag to move. Use Shift and arrow keys to resize.`
            );

            positionLayoutElement(element, block);

            const content = document.createElement("div");
            content.className = "layout-block-content";

            if (block.type === "media") {
                const media = mediaForLayoutBlock(block);

                if (media) {
                    const image = document.createElement("img");
                    image.src = getMediaUrl(media);
                    image.alt = media.alt_text || "Project image";
                    image.loading = "lazy";
                    image.style.objectFit = block.fit || "contain";
                    image.style.objectPosition =
                        `${layoutPercent(block.focal_x, layoutPercent(media.focal_x))}% ` +
                        `${layoutPercent(block.focal_y, layoutPercent(media.focal_y))}%`;
                    content.appendChild(image);
                }
            } else if (block.type === "spacer") {
                content.textContent = "Space";
            } else {
                content.textContent = block.text || "";
            }

            const label = document.createElement("span");
            label.className = "layout-block-label";
            label.textContent = layoutBlockCanvasLabel(block);

            const resize = document.createElement("button");
            resize.type = "button";
            resize.className = "layout-resize-handle";
            resize.setAttribute(
                "aria-label",
                `Resize ${layoutBlockLabel(block)}`
            );

            element.append(content, label, resize);
            element.classList.toggle(
                "is-selected",
                block.id === selectedLayoutBlockId
            );

            element.addEventListener("click", () => {
                selectLayoutBlock(block.id);
            });

            element.addEventListener("pointerdown", event => {
                if (event.target.closest(".layout-resize-handle")) {
                    return;
                }

                startLayoutPointer(
                    event,
                    block,
                    "move",
                    element
                );
            });

            element.addEventListener("keydown", event => {
                moveLayoutBlockWithKeyboard(event, block);
            });

            resize.addEventListener("pointerdown", event => {
                event.stopPropagation();
                startLayoutPointer(
                    event,
                    block,
                    "resize",
                    element
                );
            });

            pageLayoutCanvas.appendChild(element);
        });

        renderLayoutInspector();
    }

    function addContentLayoutBlock(type) {
        const sectionId = activeLayoutSectionId();

        if (type !== "heading" && !sectionId) {
            showToast("Add a section before adding content.");
            return;
        }

        const block = {
            id: newLayoutBlockId(type),
            type,
            x: 0,
            y: currentLayoutBottom() + 1,
            w: 12,
            h: type === "text" ? 4 : 2
        };

        if (type === "heading") {
            block.text = "New Section";
            block.section_layout = "custom";
            block.section_background = "none";
            block.section_width = "standard";
            block.section_align = "left";
            block.section_spacing = "normal";
            block.show_heading = true;
        } else {
            block.section_id = sectionId;
        }

        if (type === "text") {
            block.text = "Add your text here.";
        }

        editingPageLayout.blocks.push(block);
        selectedLayoutBlockId = block.id;
        markPageLayoutDirty();
        renderPageLayout();

        if (type === "heading" || type === "text") {
            window.setTimeout(() => {
                layoutBlockText?.focus();
                layoutBlockText?.select();
            }, 0);
        }
    }

    function appendMediaLayoutBlocks(mediaItems) {
        if (!mediaItems.length) {
            return 0;
        }

        const sectionId = activeLayoutSectionId();

        if (!sectionId) {
            showToast("Add or select a section before adding images.");
            return 0;
        }

        const startRow = currentLayoutBottom() + 1;

        const activeSection = editingPageLayout.blocks.find(
            block => block.id === sectionId
        );

        const sectionLayout = activeSection?.section_layout || "custom";
        const fullWidth =
            sectionLayout === "slides" ||
            sectionLayout === "full";
        const tallPages = sectionLayout === "book";
        const width = fullWidth ? 12 : 6;
        const height = fullWidth ? 7 : (tallPages ? 8 : 5);
        const rowSpan = height + 1;

        mediaItems.forEach((media, index) => {
            const column = fullWidth ? 0 : index % 2;
            const rowIndex = fullWidth ? index : Math.floor(index / 2);

            editingPageLayout.blocks.push({
                id: newLayoutBlockId("media"),
                type: "media",
                media_id: Number(media.id),
                fit: "contain",
                section_id: sectionId,
                x: column * 6,
                y: startRow + rowIndex * rowSpan,
                w: width,
                h: height
            });
        });

        selectedLayoutBlockId =
            editingPageLayout.blocks.at(-1)?.id || null;
        markPageLayoutDirty();
        renderPageLayout();
        return mediaItems.length;
    }

    function addMissingMediaToLayout() {
        const usedMediaIds = new Set(
            editingPageLayout.blocks
                .filter(block => block.type === "media")
                .map(block => Number(block.media_id))
        );

        const missing = sortedMedia(editingProject).filter(
            media => !usedMediaIds.has(Number(media.id))
        );

        if (!appendMediaLayoutBlocks(missing)) {
            showToast("Every project image is already on the custom page.");
            return;
        }

        showToast(
            `${missing.length} ${missing.length === 1 ? "image was" : "images were"} added to the page.`
        );
    }

    function duplicateSelectedLayoutSection() {
        const selected = selectedLayoutBlock();
        const section = selected
            ? sectionForLayoutBlock(selected)
            : sortedLayoutSections().at(-1);

        if (!section) {
            showToast("Select or add a section first.");
            return;
        }

        const sectionBlocks = editingPageLayout.blocks.filter(block =>
            block.id === section.id || block.section_id === section.id
        );
        const top = Math.min(...sectionBlocks.map(block => block.y));
        const newTop = currentLayoutBottom() + 1;
        const idMap = new Map(
            sectionBlocks.map(block => [
                block.id,
                newLayoutBlockId(block.type)
            ])
        );
        const newSectionId = idMap.get(section.id);
        const copies = sectionBlocks.map(block => ({
            ...block,
            id: idMap.get(block.id),
            y: newTop + (block.y - top),
            ...(block.type === "heading"
                ? {
                    text: `${block.text || "Section"} Copy`
                }
                : {
                    section_id: newSectionId
                })
        }));

        editingPageLayout.blocks.push(...copies);
        selectedLayoutBlockId = newSectionId;
        markPageLayoutDirty();
        renderPageLayout();
        showToast("Section duplicated!");
    }

    function updateSelectedLayoutPosition(field, value) {
        const block = selectedLayoutBlock();

        if (!block) {
            return;
        }

        if (field === "x") {
            block.x = layoutNumber(
                Number(value) - 1,
                block.x,
                0,
                PAGE_LAYOUT_COLUMNS - block.w
            );
        }

        if (field === "y") {
            block.y = layoutNumber(
                Number(value) - 1,
                block.y,
                0,
                500
            );
        }

        if (field === "w") {
            block.w = layoutNumber(
                value,
                block.w,
                1,
                PAGE_LAYOUT_COLUMNS - block.x
            );
        }

        if (field === "h") {
            block.h = layoutNumber(
                value,
                block.h,
                1,
                24
            );
        }

        markPageLayoutDirty();
        renderPageLayout();
    }

    customLayoutEnabled?.addEventListener("change", () => {
        if (
            customLayoutEnabled.checked &&
            !editingPageLayout.blocks.length
        ) {
            const preset = suggestedPagePreset(
                editingProject || {
                    gallery_layout: projectLayout?.value
                }
            );

            if (pageLayoutPreset) {
                pageLayoutPreset.value = preset;
            }

            updatePagePresetDescription();
            editingPageLayout = galleryTemplate(
                editingProject || {
                    gallery_layout: projectLayout?.value,
                    media: []
                },
                preset
            );
        }

        selectedLayoutBlockId = null;
        markPageLayoutDirty();
        renderPageLayout();
    });

    addLayoutHeadingButton?.addEventListener("click", () => {
        addContentLayoutBlock("heading");
    });

    addLayoutTextButton?.addEventListener("click", () => {
        addContentLayoutBlock("text");
    });

    addLayoutSpacerButton?.addEventListener("click", () => {
        addContentLayoutBlock("spacer");
    });

    addLayoutMediaButton?.addEventListener(
        "click",
        addMissingMediaToLayout
    );

    duplicateLayoutSectionButton?.addEventListener(
        "click",
        duplicateSelectedLayoutSection
    );

    layoutUndoButton?.addEventListener("click", () => {
        restoreLayoutHistory(layoutHistoryIndex - 1);
    });

    layoutRedoButton?.addEventListener("click", () => {
        restoreLayoutHistory(layoutHistoryIndex + 1);
    });

    pageLayoutPreset?.addEventListener(
        "change",
        updatePagePresetDescription
    );

    applyPagePresetButton?.addEventListener("click", () => {
        const preset = pageLayoutPreset?.value || "canvas";
        const presetLabel = PAGE_LAYOUT_PRESETS[preset]?.label ||
            PAGE_LAYOUT_PRESETS.canvas.label;

        if (
            editingPageLayout.blocks.length &&
            !window.confirm(
                `Apply the ${presetLabel}? This rearranges the current project page.`
            )
        ) {
            return;
        }

        editingPageLayout = galleryTemplate(editingProject, preset);
        selectedLayoutBlockId = null;
        markPageLayoutDirty();
        renderPageLayout();
        showToast(`${presetLabel} is ready to edit.`);
    });

    resetPageLayoutButton?.addEventListener("click", () => {
        if (
            editingPageLayout.blocks.length &&
            !window.confirm(
                "Rebuild this page using the currently selected Page Type?"
            )
        ) {
            return;
        }

        editingPageLayout = galleryTemplate(
            editingProject,
            pageLayoutPreset?.value || editingPageLayout.preset
        );
        selectedLayoutBlockId = null;
        markPageLayoutDirty();
        renderPageLayout();
    });

    removeLayoutBlockButton?.addEventListener("click", () => {
        if (!selectedLayoutBlockId) {
            return;
        }

        editingPageLayout.blocks = editingPageLayout.blocks.filter(
            block => block.id !== selectedLayoutBlockId
        );
        normalizeLayoutSectionAssignments(
            editingPageLayout.blocks,
            editingPageLayout.preset
        );
        selectedLayoutBlockId = null;
        markPageLayoutDirty();
        renderPageLayout();
    });

    layoutBlockText?.addEventListener("input", () => {
        const block = selectedLayoutBlock();

        if (
            !block ||
            (block.type !== "heading" && block.type !== "text")
        ) {
            return;
        }

        block.text = layoutBlockText.value.slice(
            0,
            block.type === "heading" ? 160 : 1200
        );

        const selectedElement = Array.from(
            pageLayoutCanvas?.querySelectorAll("[data-layout-block-id]") || []
        ).find(
            element => element.dataset.layoutBlockId === block.id
        );

        const content = selectedElement?.querySelector(
            ".layout-block-content"
        );

        if (content) {
            content.textContent = block.text;
        }

        markPageLayoutDirty();
    });

    layoutBlockFit?.addEventListener("change", () => {
        const block = selectedLayoutBlock();

        if (!block || block.type !== "media") {
            return;
        }

        block.fit = layoutBlockFit.value === "cover"
            ? "cover"
            : "contain";
        markPageLayoutDirty();
        renderPageLayout();
    });

    [
        [layoutBlockFocalX, "focal_x"],
        [layoutBlockFocalY, "focal_y"]
    ].forEach(([input, field]) => {
        input?.addEventListener("input", () => {
            const block = selectedLayoutBlock();

            if (!block || block.type !== "media") {
                return;
            }

            block[field] = layoutPercent(input.value);
            markPageLayoutDirty(false);
            renderPageLayout();
        });

        input?.addEventListener("change", recordLayoutHistory);
    });

    layoutUseImageCropButton?.addEventListener("click", () => {
        const block = selectedLayoutBlock();

        if (!block || block.type !== "media") {
            return;
        }

        delete block.focal_x;
        delete block.focal_y;
        markPageLayoutDirty();
        renderPageLayout();
        showToast("This block now follows the image’s main crop.");
    });

    layoutSectionType?.addEventListener("change", () => {
        const block = selectedLayoutBlock();

        if (!block || block.type !== "heading") {
            return;
        }

        block.section_layout = Object.prototype.hasOwnProperty.call(
            SECTION_LAYOUT_TYPES,
            layoutSectionType.value
        )
            ? layoutSectionType.value
            : "custom";

        markPageLayoutDirty();
        renderPageLayout();
    });

    [
        [layoutSectionBackground, "section_background"],
        [layoutSectionWidth, "section_width"],
        [layoutSectionAlign, "section_align"],
        [layoutSectionSpacing, "section_spacing"]
    ].forEach(([input, field]) => {
        input?.addEventListener("change", () => {
            const block = selectedLayoutBlock();

            if (!block || block.type !== "heading") {
                return;
            }

            block[field] = input.value;
            markPageLayoutDirty();
            renderPageLayout();
        });
    });

    layoutSectionShowHeading?.addEventListener("change", () => {
        const block = selectedLayoutBlock();

        if (!block || block.type !== "heading") {
            return;
        }

        block.show_heading = layoutSectionShowHeading.checked;
        markPageLayoutDirty();
        renderPageLayout();
    });

    layoutBlockSection?.addEventListener("change", () => {
        const block = selectedLayoutBlock();
        const validSectionIds = new Set(
            sortedLayoutSections().map(section => section.id)
        );

        if (
            !block ||
            block.type === "heading" ||
            !validSectionIds.has(layoutBlockSection.value)
        ) {
            return;
        }

        block.section_id = layoutBlockSection.value;
        markPageLayoutDirty();
        renderPageLayout();
    });

    [
        [layoutBlockX, "x"],
        [layoutBlockY, "y"],
        [layoutBlockWidth, "w"],
        [layoutBlockHeight, "h"]
    ].forEach(([input, field]) => {
        input?.addEventListener("change", () => {
            updateSelectedLayoutPosition(field, input.value);
        });
    });


    /* PROJECT EDITOR */

    function setEditorMode(mode) {
        editorMode = mode;
        const creating = mode === "create";

        projectEditorKicker.textContent = creating
            ? "New Portfolio Project"
            : "Portfolio Project";

        projectEditorTitle.textContent = creating
            ? "Add a Project"
            : "Edit Project";

        projectEditorIntro.textContent = creating
            ? "Enter the project details below."
            : "Update project details, images and page layout.";

        saveProjectButton.textContent = creating
            ? "Create Project"
            : "Save Project";

        projectMediaSection.hidden = creating;
        pageLayoutSection.hidden = creating;
        createProjectMediaNote.hidden = !creating;
    }

    function fillProjectFields(project) {
        projectId.value = project?.id ? String(project.id) : "";
        projectTitle.value = project?.title || "";
        projectKicker.value = project?.kicker || "";
        projectDescription.value = project?.description || "";
        projectYear.value = project?.year ?? "";
        projectRole.value = project?.role || "";
        projectLayout.value = project?.gallery_layout || "smart";
        projectVisible.checked = Number(project?.is_published) === 1;
        projectSocialTitle.value = project?.social_title || "";
        projectSocialDescription.value = project?.social_description || "";
        updateProjectMediaSelectors(project);

        const savedPageLayout = normalizeClientPageLayout(
            project?.page_layout,
            project || { media: [] }
        );

        editingPageLayout = savedPageLayout;
        selectedLayoutBlockId = null;
        pageLayoutDirty = false;

        if (customLayoutEnabled) {
            customLayoutEnabled.checked = Boolean(
                project?.page_layout &&
                savedPageLayout.blocks.length
            );
        }

        resetLayoutHistory();

        if (pageLayoutPreset) {
            pageLayoutPreset.value = project?.page_layout
                ? savedPageLayout.preset
                : suggestedPagePreset(project);
        }

        updatePagePresetDescription();

        if (projectMediaFile) {
            projectMediaFile.value = "";
        }

        if (projectMediaAlt) {
            projectMediaAlt.value = "";
        }

        updateLayoutDescription();
        renderPageLayout();
    }

    function openProjectEditor(slug) {
        const project = projects.find(
            item => item.slug === slug
        );

        if (!project || !projectEditor) {
            return;
        }

        editingProject = project;
        setEditorMode("edit");
        fillProjectFields(project);
        renderProjectMedia();
        renderPageLayout();

        if (!projectEditor.open) {
            projectEditor.showModal();
        }

        document.body.classList.add("editor-open");

        window.setTimeout(() => {
            projectTitle.focus();
        }, 0);
    }

    function openNewProjectEditor() {
        editingProject = null;
        setEditorMode("create");
        fillProjectFields({
            gallery_layout: "smart",
            is_published: 0,
            media: [],
            page_layout: null
        });

        if (!projectEditor.open) {
            projectEditor.showModal();
        }

        document.body.classList.add("editor-open");

        window.setTimeout(() => {
            projectTitle.focus();
        }, 0);
    }

    addProjectButton?.addEventListener(
        "click",
        openNewProjectEditor
    );

    function closeProjectEditor() {
        if (
            pageLayoutDirty &&
            projectEditor?.open &&
            !window.confirm(
                "Leave without saving your page layout changes?"
            )
        ) {
            return;
        }

        if (projectEditor?.open) {
            projectEditor.close();
        }

        editingProject = null;
        editorMode = "edit";
        editingPageLayout = {
            version: 1,
            preset: "canvas",
            blocks: []
        };
        selectedLayoutBlockId = null;
        pageLayoutDirty = false;
        layoutHistory = [];
        layoutHistoryIndex = -1;
        updateLayoutHistoryButtons();
        document.body.classList.remove("editor-open");
    }

    closeProjectButtons.forEach((button) => {
        button.addEventListener("click", closeProjectEditor);
    });

    projectEditor?.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeProjectEditor();
    });

    projectEditor?.addEventListener("click", (event) => {
        if (event.target === projectEditor) {
            closeProjectEditor();
        }
    });

    function projectPayload() {
        const yearValue = projectYear.value.trim();

        return {
            title: projectTitle.value.trim(),
            kicker: projectKicker.value.trim() || null,
            description: projectDescription.value.trim() || null,
            year: yearValue ? Number(yearValue) : null,
            role: projectRole.value.trim() || null,
            gallery_layout: projectLayout.value,
            is_published: projectVisible.checked,
            cover_media_id: projectCoverMedia?.value
                ? Number(projectCoverMedia.value)
                : null,
            social_title: projectSocialTitle?.value.trim() || null,
            social_description: projectSocialDescription?.value.trim() || null,
            social_media_id: projectSocialMedia?.value
                ? Number(projectSocialMedia.value)
                : null,
            page_layout: customLayoutEnabled?.checked
                ? {
                    version: 1,
                    preset: editingPageLayout.preset || "canvas",
                    blocks: editingPageLayout.blocks
                }
                : null
        };
    }

    function previewProjectChanges() {
        if (!projectTitle.value.trim()) {
            showToast("Add a project name before previewing.");
            projectTitle.focus();
            return;
        }

        const payload = projectPayload();
        const previewProject = {
            ...(editingProject || {}),
            ...payload,
            id: editingProject?.id || "preview",
            slug: editingProject?.slug || "preview-project",
            media: sortedMedia(editingProject || { media: [] }),
            page_layout: payload.page_layout
        };

        sessionStorage.setItem(
            "maybelin-project-preview",
            JSON.stringify({
                created_at: Date.now(),
                project: previewProject
            })
        );

        const previewWindow = window.open(
            "../index.html?preview=1",
            "_blank"
        );

        if (!previewWindow) {
            showToast("Allow pop-ups to open the project preview.");
        }
    }

    previewProjectButton?.addEventListener(
        "click",
        previewProjectChanges
    );

    async function saveProject(event) {
        event.preventDefault();

        if (!projectTitle.value.trim()) {
            showToast("Your project needs a name.");
            projectTitle.focus();
            return;
        }

        const creating = editorMode === "create";
        const originalText = saveProjectButton.textContent;

        saveProjectButton.disabled = true;
        saveProjectButton.textContent = creating
            ? "Creating..."
            : "Saving...";

        try {
            const endpoint = creating
                ? "/api/admin/projects"
                : `/api/admin/projects/${editingProject.id}`;

            const response = await fetch(
                endpoint,
                {
                    method: creating ? "POST" : "PUT",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(projectPayload())
                }
            );

            if (response.status === 401) {
                handleExpiredLogin();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    (creating
                        ? "Unable to create project."
                        : "Unable to save project.")
                );
            }

            if (!data.project) {
                throw new Error("The project response was incomplete.");
            }

            if (creating) {
                editingProject = data.project;
                projects.push(data.project);
                renderProjects();

                setEditorMode("edit");
                fillProjectFields(editingProject);
                renderProjectMedia();
                renderPageLayout();

                showToast("Project created! Now add images, then turn on visibility when you're ready.");
            } else {
                editingProject = data.project;
                projects = projects.map(project =>
                    project.id === data.project.id
                        ? data.project
                        : project
                );

                renderProjects();
                pageLayoutDirty = false;
                closeProjectEditor();
                showToast("Project changes saved!");
            }
        } catch (error) {
            console.error("Unable to save project:", error);
            showToast(error.message || "Something went wrong while saving the project.");
        } finally {
            saveProjectButton.disabled = false;

            if (editorMode === "create") {
                saveProjectButton.textContent = "Create Project";
            } else {
                saveProjectButton.textContent = "Save Project";
            }

            if (!projectEditor?.open) {
                saveProjectButton.textContent = originalText;
            }
        }
    }

    projectEditorForm?.addEventListener(
        "submit",
        saveProject
    );


    /* PROJECT MEDIA */

    function updateProjectMediaSelectors(
        project = editingProject,
        preserveSelection = false
    ) {
        const media = sortedMedia(project);

        [projectCoverMedia, projectSocialMedia].forEach((select, index) => {
            if (!select) {
                return;
            }

            const selectedValue = preserveSelection
                ? select.value
                : (
                    index === 0
                        ? project?.cover_media_id
                        : project?.social_media_id
                );
            select.replaceChildren();

            const automatic = document.createElement("option");
            automatic.value = "";
            automatic.textContent = index === 0
                ? "First Image"
                : "Use Project Cover";
            select.appendChild(automatic);

            media.forEach((item, mediaIndex) => {
                const option = document.createElement("option");
                option.value = String(item.id);
                option.textContent = item.alt_text || `Image ${mediaIndex + 1}`;
                select.appendChild(option);
            });

            select.value = selectedValue ? String(selectedValue) : "";
        });
    }

    function createMediaDetailsField(labelText, input) {
        const field = document.createElement("label");
        field.className = "project-media-detail-field";
        const label = document.createElement("span");
        label.textContent = labelText;
        field.append(label, input);
        return field;
    }

    function buildMediaDetails(item, previewImage) {
        const details = document.createElement("details");
        details.className = "project-media-details";
        const summary = document.createElement("summary");
        summary.textContent = "Edit image details";
        const grid = document.createElement("div");
        grid.className = "project-media-details-grid";

        const altInput = document.createElement("input");
        altInput.type = "text";
        altInput.maxLength = 500;
        altInput.value = item.alt_text || "";
        const captionInput = document.createElement("textarea");
        captionInput.rows = 2;
        captionInput.maxLength = 1000;
        captionInput.value = item.caption || "";
        const creditInput = document.createElement("input");
        creditInput.type = "text";
        creditInput.maxLength = 500;
        creditInput.value = item.credit || "";
        const linkInput = document.createElement("input");
        linkInput.type = "url";
        linkInput.maxLength = 2000;
        linkInput.placeholder = "https://...";
        linkInput.value = item.external_url || "";
        const focalXInput = document.createElement("input");
        focalXInput.type = "range";
        focalXInput.min = "0";
        focalXInput.max = "100";
        focalXInput.value = String(layoutPercent(item.focal_x));
        const focalYInput = document.createElement("input");
        focalYInput.type = "range";
        focalYInput.min = "0";
        focalYInput.max = "100";
        focalYInput.value = String(layoutPercent(item.focal_y));

        const updatePreviewCrop = () => {
            previewImage.style.objectPosition =
                `${focalXInput.value}% ${focalYInput.value}%`;
        };
        focalXInput.addEventListener("input", updatePreviewCrop);
        focalYInput.addEventListener("input", updatePreviewCrop);

        grid.append(
            createMediaDetailsField("Accessibility Description", altInput),
            createMediaDetailsField("Caption", captionInput),
            createMediaDetailsField("Credit", creditInput),
            createMediaDetailsField("Optional Link", linkInput),
            createMediaDetailsField("Crop: Left / Right", focalXInput),
            createMediaDetailsField("Crop: Top / Bottom", focalYInput)
        );

        const save = document.createElement("button");
        save.type = "button";
        save.className = "media-detail-save-button";
        save.textContent = "Save Image Details";
        save.addEventListener("click", () => {
            updateProjectMediaDetails(
                item,
                {
                    alt_text: altInput.value,
                    caption: captionInput.value,
                    credit: creditInput.value,
                    external_url: linkInput.value,
                    focal_x: Number(focalXInput.value),
                    focal_y: Number(focalYInput.value)
                },
                save
            );
        });

        details.append(summary, grid, save);
        return details;
    }

    async function updateProjectMediaDetails(item, payload, button) {
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Saving...";

        try {
            const response = await fetch(
                `/api/admin/media/${item.id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to save image details.");
            }

            updateEditingProjectMedia(
                sortedMedia(editingProject).map(media =>
                    Number(media.id) === Number(data.media.id)
                        ? data.media
                        : media
                )
            );
            showToast("Image details saved!");
        } catch (error) {
            showToast(error.message || "Unable to save image details.");
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    function renderProjectMedia() {
        if (!projectMediaList || !editingProject) {
            return;
        }

        projectMediaList.replaceChildren();
        const media = sortedMedia(editingProject);

        if (projectMediaCount) {
            projectMediaCount.textContent =
                `${media.length} ${media.length === 1 ? "Image" : "Images"}`;
        }

        if (!media.length) {
            const empty = document.createElement("div");
            empty.className = "project-media-empty";
            empty.innerHTML = `
                <strong>No images yet</strong>
                <p>Upload the first image above.</p>
            `;
            projectMediaList.appendChild(empty);
            return;
        }

        media.forEach((item, index) => {
            const card = document.createElement("article");
            card.className = "project-media-item";

            const preview = document.createElement("div");
            preview.className = "project-media-item-preview";

            const image = document.createElement("img");
            image.src = getMediaUrl(item);
            image.alt = item.alt_text || "Project image";
            image.loading = "lazy";
            image.style.objectPosition =
                `${layoutPercent(item.focal_x)}% ${layoutPercent(item.focal_y)}%`;
            preview.appendChild(image);

            const info = document.createElement("div");
            info.className = "project-media-item-info";

            const position = document.createElement("strong");
            position.textContent = `Image ${index + 1}`;

            const alt = document.createElement("span");
            alt.textContent = item.alt_text || "No image description";

            info.append(position, alt, buildMediaDetails(item, image));

            const controls = document.createElement("div");
            controls.className = "project-media-controls";

            const up = document.createElement("button");
            up.type = "button";
            up.textContent = "Move Up";
            up.disabled = index === 0;
            up.addEventListener("click", () => {
                moveProjectMedia(item.id, -1);
            });

            const down = document.createElement("button");
            down.type = "button";
            down.textContent = "Move Down";
            down.disabled = index === media.length - 1;
            down.addEventListener("click", () => {
                moveProjectMedia(item.id, 1);
            });

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "remove-media-button";
            remove.textContent = "Remove";
            remove.addEventListener("click", () => {
                deleteProjectMedia(item);
            });

            controls.append(up, down, remove);
            card.append(preview, info, controls);
            projectMediaList.appendChild(card);
        });
    }

    function updateEditingProjectMedia(media) {
        if (!editingProject) {
            return;
        }

        const validMediaIds = new Set(
            media.map(item => Number(item.id))
        );

        const previousBlockCount = editingPageLayout.blocks.length;
        editingPageLayout.blocks = editingPageLayout.blocks.filter(
            block =>
                block.type !== "media" ||
                validMediaIds.has(Number(block.media_id))
        );

        if (
            customLayoutEnabled?.checked &&
            editingPageLayout.blocks.length !== previousBlockCount
        ) {
            markPageLayoutDirty();
        }

        editingProject = {
            ...editingProject,
            media
        };

        updateProjectMediaSelectors(editingProject, true);

        projects = projects.map(project =>
            project.id === editingProject.id
                ? editingProject
                : project
        );

        renderProjectMedia();
        renderPageLayout();
        renderProjects();
    }

    async function uploadProjectMedia() {
        if (!editingProject || !uploadProjectMediaButton) {
            return;
        }

        const file = projectMediaFile?.files?.[0];

        if (!file) {
            showToast("Choose an image first.");
            projectMediaFile?.focus();
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            showToast("Images must be 20 MB or smaller.");
            return;
        }

        const originalText = uploadProjectMediaButton.textContent;
        uploadProjectMediaButton.disabled = true;
        uploadProjectMediaButton.textContent = "Uploading...";

        const formData = new FormData();
        formData.append("file", file);
        formData.append(
            "alt_text",
            projectMediaAlt?.value.trim() || ""
        );

        try {
            const response = await fetch(
                `/api/admin/projects/${editingProject.id}/media`,
                {
                    method: "POST",
                    credentials: "include",
                    body: formData
                }
            );

            if (response.status === 401) {
                handleExpiredLogin();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to upload image."
                );
            }

            updateEditingProjectMedia([
                ...sortedMedia(editingProject),
                data.media
            ]);

            if (customLayoutEnabled?.checked) {
                appendMediaLayoutBlocks([data.media]);
            }

            projectMediaFile.value = "";
            projectMediaAlt.value = "";
            showToast("Image uploaded!");
        } catch (error) {
            console.error("Unable to upload image:", error);
            showToast(error.message || "We couldn't upload that image.");
        } finally {
            uploadProjectMediaButton.disabled = false;
            uploadProjectMediaButton.textContent = originalText;
        }
    }

    uploadProjectMediaButton?.addEventListener(
        "click",
        uploadProjectMedia
    );

    async function moveProjectMedia(mediaId, direction) {
        if (!editingProject) {
            return;
        }

        const current = sortedMedia(editingProject);
        const index = current.findIndex(
            media => Number(media.id) === Number(mediaId)
        );

        if (index === -1) {
            return;
        }

        const newIndex = index + direction;

        if (newIndex < 0 || newIndex >= current.length) {
            return;
        }

        const reordered = [...current];
        [
            reordered[index],
            reordered[newIndex]
        ] = [
            reordered[newIndex],
            reordered[index]
        ];

        updateEditingProjectMedia(
            reordered.map((media, order) => ({
                ...media,
                sort_order: order
            }))
        );

        try {
            const response = await fetch(
                `/api/admin/projects/${editingProject.id}/media/order`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        media_ids: reordered.map(media => media.id)
                    })
                }
            );

            if (response.status === 401) {
                handleExpiredLogin();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to reorder images."
                );
            }

            if (Array.isArray(data.media)) {
                updateEditingProjectMedia(data.media);
            }

            showToast("Image order saved!");
        } catch (error) {
            console.error("Unable to reorder images:", error);
            updateEditingProjectMedia(current);
            showToast("We couldn't save that image order.");
        }
    }

    async function deleteProjectMedia(media) {
        if (!editingProject || !media) {
            return;
        }

        const confirmed = window.confirm(
            "Remove this image from the project?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `/api/admin/media/${media.id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (response.status === 401) {
                handleExpiredLogin();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to remove image."
                );
            }

            updateEditingProjectMedia(
                sortedMedia(editingProject).filter(
                    item => Number(item.id) !== Number(media.id)
                )
            );

            showToast("Image removed.");
        } catch (error) {
            console.error("Unable to remove image:", error);
            showToast(error.message || "We couldn't remove that image.");
        }
    }


    /* NAVIGATION */

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navigationLinks.forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");
        });
    });


    /* START */

    async function startDashboard() {
        const authenticated = await checkSession();

        if (!authenticated) {
            return;
        }

        await Promise.all([
            loadSettings(),
            loadProjects()
        ]);
    }

    startDashboard();
});
