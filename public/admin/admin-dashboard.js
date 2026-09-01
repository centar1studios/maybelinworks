"use strict";

document.addEventListener("DOMContentLoaded", () => {
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

    const GALLERY_LAYOUTS = {
        smart: {
            label: "Smart Gallery",
            description: "Best all-around choice. Wide artwork automatically gets more space while portrait and square work can sit side by side."
        },
        publication: {
            label: "Publication / Book",
            description: "Best for magazines, books and page-based work. Images are shown two at a time like page spreads."
        },
        full: {
            label: "Full Width",
            description: "Every image is stacked large, one after another. Great for branding decks and presentation boards."
        },
        grid: {
            label: "Classic Grid",
            description: "A consistent two-column image grid. Great for photography, artwork and collections with similarly sized pieces."
        },
        featured: {
            label: "Featured + Grid",
            description: "The first image gets a large featured position, then the rest continue in a two-column grid."
        }
    };

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
    const layoutDescription = document.querySelector("[data-layout-description]");

    const projectMediaSection = document.querySelector("[data-project-media-section]");
    const createProjectMediaNote = document.querySelector("[data-create-project-media-note]");
    const projectMediaFile = document.querySelector("#project-media-file");
    const projectMediaAlt = document.querySelector("#project-media-alt");
    const uploadProjectMediaButton = document.querySelector("[data-upload-project-media]");
    const projectMediaList = document.querySelector("[data-project-media-list]");
    const projectMediaCount = document.querySelector("[data-project-media-count]");

    let currentSettings = null;
    let projects = [];
    let editingProject = null;
    let editorMode = "edit";

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
        link.href = `https://fonts.googleapis.com/css2?family=${googleName}&display=swap`;

        document.head.appendChild(link);
        loadedFonts.add(fontName);
    }

    function fontStack(fontName, type) {
        return type === "display"
            ? `"${fontName}", Georgia, serif`
            : `"${fontName}", Arial, sans-serif`;
    }

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
        showToast("Your login expired. Please sign in again.");

        window.setTimeout(() => {
            window.location.href = "../admin-login.html";
        }, 1200);
    }

    function setUsername(username) {
        usernameElements.forEach((element) => {
            element.textContent = username;
        });

        if (avatar) {
            avatar.textContent = username.charAt(0).toUpperCase();
        }
    }

    async function checkSession() {
        try {
            const response = await fetch("/api/admin/session", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });

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
            const response = await fetch("/api/admin/logout", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            });

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

    function getMediaUrl(value) {
        const key = typeof value === "string"
            ? value
            : value?.r2_key;

        if (!key) {
            return "";
        }

        const encodedKey = key
            .split("/")
            .map((part) => encodeURIComponent(part))
            .join("/");

        return `/media/${encodedKey}`;
    }

    function makeSureFontExists(select, value) {
        if (!select || !value) {
            return;
        }

        const exists = Array.from(select.options)
            .some((option) => option.value === value);

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
            displayFontPreview.style.fontFamily = fontStack(
                heading,
                "display"
            );
        }

        if (bodyFontPreview) {
            bodyFontPreview.style.fontFamily = fontStack(
                regular,
                "body"
            );
        }
    }

    displayFont?.addEventListener("change", updateFontPreviews);
    bodyFont?.addEventListener("change", updateFontPreviews);

    function setSettingsReady(ready) {
        [
            heroKicker,
            heroTitle,
            displayFont,
            bodyFont
        ].forEach((element) => {
            if (element) {
                element.disabled = !ready;
            }
        });

        if (heroDescription) {
            heroDescription.disabled = true;
        }

        if (saveHomepageButton) {
            saveHomepageButton.disabled = !ready;

            saveHomepageButton.classList.toggle(
                "disabled-button",
                !ready
            );

            saveHomepageButton.classList.toggle(
                "primary-link-button",
                ready
            );
        }

        if (settingsStatus) {
            settingsStatus.textContent = ready
                ? "Ready to Edit"
                : "Loading...";
        }
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

    function populateSettings(settings) {
        currentSettings = settings;

        heroKicker.value = settings.hero_kicker || "";
        heroTitle.value = settings.hero_title || "";
        heroDescription.value = "";
        heroDescription.placeholder = "This isn't shown on the homepage right now.";

        const savedDisplayFont =
            settings.display_font || "Playfair Display";

        const savedBodyFont =
            settings.body_font || "Lato";

        makeSureFontExists(
            displayFont,
            savedDisplayFont
        );

        makeSureFontExists(
            bodyFont,
            savedBodyFont
        );

        displayFont.value = savedDisplayFont;
        bodyFont.value = savedBodyFont;

        updateFontPreviews();

        aboutKicker.value = settings.about_kicker || "";
        aboutTitle.value = settings.about_title || "";
        aboutBio.value = settings.about_bio || "";
        contactEmail.value = settings.contact_email || "";
        contactPhone.value = settings.contact_phone || "";
        instagramUrl.value = settings.instagram_url || "";

        setAboutPhotoPreview(
            settings.about_photo_key
        );
    }

    async function loadSettings() {
        setSettingsReady(false);
        setAboutReady(false);

        try {
            const response = await fetch("/api/settings", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(
                    "Unable to load website settings."
                );
            }

            const data = await response.json();

            if (!data.settings) {
                throw new Error(
                    "Website settings were not found."
                );
            }

            populateSettings(data.settings);
            setSettingsReady(true);
            setAboutReady(true);
        } catch (error) {
            console.error(
                "Settings failed to load:",
                error
            );

            if (settingsStatus) {
                settingsStatus.textContent = "Couldn't Load";
            }

            if (aboutStatus) {
                aboutStatus.textContent = "Couldn't Load";
            }

            showToast(
                "We couldn't load the website settings. Try refreshing the page."
            );
        }
    }

    async function saveSettingsPayload(
        payload,
        successMessage
    ) {
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
                data.error ||
                "Unable to save website settings."
            );
        }

        if (data.settings) {
            currentSettings = data.settings;
        }

        showToast(successMessage);

        return data.settings || currentSettings;
    }

    async function saveHomepage() {
        if (!currentSettings || !saveHomepageButton) {
            return;
        }

        if (!heroKicker.value.trim()) {
            showToast(
                "Add the small text above your heading before saving."
            );

            heroKicker.focus();
            return;
        }

        if (!heroTitle.value.trim()) {
            showToast("Your main heading can't be empty.");
            heroTitle.focus();
            return;
        }

        const originalText =
            saveHomepageButton.textContent;

        saveHomepageButton.disabled = true;
        saveHomepageButton.textContent = "Saving...";

        try {
            await saveSettingsPayload(
                {
                    hero_kicker: heroKicker.value.trim(),
                    hero_title: heroTitle.value.trim(),
                    hero_description: currentSettings.hero_description,
                    display_font: displayFont.value,
                    body_font: bodyFont.value
                },
                "Homepage and fonts saved!"
            );

            settingsStatus.textContent = "Saved";

            window.setTimeout(() => {
                settingsStatus.textContent =
                    "Ready to Edit";
            }, 1800);
        } catch (error) {
            console.error(
                "Unable to save homepage:",
                error
            );

            showToast(
                error.message ||
                "Something went wrong while saving."
            );
        } finally {
            saveHomepageButton.disabled = false;
            saveHomepageButton.textContent = originalText;
        }
    }

    saveHomepageButton?.addEventListener(
        "click",
        saveHomepage
    );

    async function saveAbout() {
        if (!currentSettings || !saveAboutButton) {
            return;
        }

        if (!aboutTitle.value.trim()) {
            showToast(
                "Your About Me section needs a heading."
            );

            aboutTitle.focus();
            return;
        }

        if (!aboutBio.value.trim()) {
            showToast(
                "Add your About Me biography before saving."
            );

            aboutBio.focus();
            return;
        }

        const originalText =
            saveAboutButton.textContent;

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
                aboutStatus.textContent =
                    "Ready to Edit";
            }, 1800);
        } catch (error) {
            console.error(
                "Unable to save About Me:",
                error
            );

            showToast(
                error.message ||
                "Something went wrong while saving About Me."
            );
        } finally {
            saveAboutButton.disabled = false;
            saveAboutButton.textContent = originalText;
        }
    }

    saveAboutButton?.addEventListener(
        "click",
        saveAbout
    );

    async function replaceAboutPhoto() {
        const file =
            aboutPhotoFile?.files?.[0];

        if (!file) {
            showToast(
                "Choose a new About Me photo first."
            );

            aboutPhotoFile?.focus();
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            showToast(
                "Photos must be 20 MB or smaller."
            );

            return;
        }

        const originalText =
            replaceAboutPhotoButton.textContent;

        replaceAboutPhotoButton.disabled = true;
        replaceAboutPhotoButton.textContent =
            "Uploading...";

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );

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

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to replace the photo."
                );
            }

            currentSettings = {
                ...currentSettings,
                about_photo_key:
                    data.about_photo_key
            };

            setAboutPhotoPreview(
                data.about_photo_key
            );

            aboutPhotoFile.value = "";

            showToast(
                "About Me photo replaced!"
            );
        } catch (error) {
            console.error(
                "Unable to replace About photo:",
                error
            );

            showToast(
                error.message ||
                "We couldn't replace that photo."
            );
        } finally {
            replaceAboutPhotoButton.disabled = false;
            replaceAboutPhotoButton.textContent =
                originalText;
        }
    }

    replaceAboutPhotoButton?.addEventListener(
        "click",
        replaceAboutPhoto
    );

    function sortedMedia(project) {
        if (!Array.isArray(project?.media)) {
            return [];
        }

        return [...project.media].sort(
            (a, b) => {
                const orderDifference =
                    (Number(a.sort_order) || 0) -
                    (Number(b.sort_order) || 0);

                return orderDifference ||
                    Number(a.id) -
                    Number(b.id);
            }
        );
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
            projectCount.textContent =
                String(projects.length);
        }

        const totalMedia = projects.reduce(
            (total, project) =>
                total + sortedMedia(project).length,
            0
        );

        if (mediaCount) {
            mediaCount.textContent =
                String(totalMedia);
        }

        if (mediaCountLarge) {
            mediaCountLarge.textContent =
                String(totalMedia);
        }

        if (!projectSummary) {
            return;
        }

        const visible = projects.filter(
            (project) =>
                Number(project.is_published) === 1
        );

        if (!visible.length) {
            projectSummary.textContent =
                "No projects are currently visible";

            return;
        }

        const names = visible.map(
            (project) => project.title
        );

        if (names.length === 1) {
            projectSummary.textContent =
                names[0];
        } else if (names.length === 2) {
            projectSummary.textContent =
                `${names[0]} and ${names[1]}`;
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

        const sortedProjects =
            [...projects].sort(
                (a, b) => {
                    const orderDifference =
                        (Number(a.sort_order) || 0) -
                        (Number(b.sort_order) || 0);

                    return orderDifference ||
                        Number(a.id) -
                        Number(b.id);
                }
            );

        if (!sortedProjects.length) {
            const empty =
                document.createElement("article");

            empty.className =
                "project-admin-card project-loading-card";

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

        sortedProjects.forEach(
            (project, index) => {
                const card =
                    document.createElement("article");

                card.className =
                    "project-admin-card";

                if (
                    Number(project.is_published) !== 1
                ) {
                    card.classList.add(
                        "project-is-hidden"
                    );
                }

                const number =
                    document.createElement("div");

                number.className =
                    "project-admin-number";

                number.textContent =
                    String(index + 1).padStart(
                        2,
                        "0"
                    );

                const content =
                    document.createElement("div");

                content.className =
                    "project-admin-content";

                const type =
                    document.createElement("p");

                type.className =
                    "project-admin-type";

                type.textContent =
                    project.kicker ||
                    "Portfolio Project";

                const title =
                    document.createElement("h3");

                title.textContent =
                    project.title ||
                    "Untitled Project";

                const description =
                    document.createElement("p");

                description.textContent =
                    makeProjectPreview(
                        project.description
                    );

                content.append(
                    type,
                    title,
                    description
                );

                const meta =
                    document.createElement("div");

                meta.className =
                    "project-admin-meta";

                const layout =
                    document.createElement("div");

                layout.innerHTML =
                    "<span>Layout</span><strong></strong>";

                layout.querySelector(
                    "strong"
                ).textContent =
                    GALLERY_LAYOUTS[
                        project.gallery_layout
                    ]?.label ||
                    "Smart Gallery";

                const images =
                    document.createElement("div");

                images.innerHTML =
                    "<span>Images</span><strong></strong>";

                images.querySelector(
                    "strong"
                ).textContent =
                    String(
                        sortedMedia(
                            project
                        ).length
                    );

                const visible =
                    document.createElement("div");

                visible.innerHTML =
                    "<span>Website</span><strong></strong>";

                visible.querySelector(
                    "strong"
                ).textContent =
                    Number(
                        project.is_published
                    ) === 1
                        ? "Visible"
                        : "Hidden";

                meta.append(
                    layout,
                    images,
                    visible
                );

                const editButton =
                    document.createElement("button");

                editButton.className =
                    "project-edit-button";

                editButton.type = "button";
                editButton.textContent =
                    "Edit Project";

                editButton.addEventListener(
                    "click",
                    () => {
                        openProjectEditor(
                            project.slug
                        );
                    }
                );

                card.append(
                    number,
                    content,
                    meta,
                    editButton
                );

                projectList.appendChild(
                    card
                );
            }
        );

        updateProjectSummary();
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
                throw new Error(
                    "Unable to load projects."
                );
            }

            const data =
                await response.json();

            projects = Array.isArray(
                data.projects
            )
                ? data.projects
                : [];

            renderProjects();
        } catch (error) {
            console.error(
                "Projects failed to load:",
                error
            );

            showToast(
                "We couldn't load your projects. Try refreshing the page."
            );
        }
    }

    function updateLayoutDescription() {
        const layout =
            projectLayout?.value ||
            "smart";

        const info =
            GALLERY_LAYOUTS[layout] ||
            GALLERY_LAYOUTS.smart;

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

    function setEditorMode(mode) {
        editorMode = mode;

        const creating =
            mode === "create";

        projectEditorKicker.textContent =
            creating
                ? "New Portfolio Project"
                : "Portfolio Project";

        projectEditorTitle.textContent =
            creating
                ? "Add a Project"
                : "Edit Project";

        projectEditorIntro.textContent =
            creating
                ? "Add the project details first. After it is created, you can upload its images without closing this window."
                : "Change project details and manage images from one place.";

        saveProjectButton.textContent =
            creating
                ? "Create Project"
                : "Save Project";

        projectMediaSection.hidden =
            creating;

        createProjectMediaNote.hidden =
            !creating;
    }

    function fillProjectFields(project) {
        projectId.value =
            project?.id
                ? String(project.id)
                : "";

        projectTitle.value =
            project?.title || "";

        projectKicker.value =
            project?.kicker || "";

        projectDescription.value =
            project?.description || "";

        projectYear.value =
            project?.year ?? "";

        projectRole.value =
            project?.role || "";

        projectLayout.value =
            project?.gallery_layout ||
            "smart";

        projectVisible.checked =
            Number(
                project?.is_published
            ) === 1;

        if (projectMediaFile) {
            projectMediaFile.value = "";
        }

        if (projectMediaAlt) {
            projectMediaAlt.value = "";
        }

        updateLayoutDescription();
    }

    function openProjectEditor(slug) {
        const project = projects.find(
            (item) =>
                item.slug === slug
        );

        if (
            !project ||
            !projectEditor
        ) {
            return;
        }

        editingProject = project;

        setEditorMode("edit");
        fillProjectFields(project);
        renderProjectMedia();

        if (!projectEditor.open) {
            projectEditor.showModal();
        }

        document.body.classList.add(
            "editor-open"
        );

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
            media: []
        });

        if (!projectEditor.open) {
            projectEditor.showModal();
        }

        document.body.classList.add(
            "editor-open"
        );

        window.setTimeout(() => {
            projectTitle.focus();
        }, 0);
    }

    addProjectButton?.addEventListener(
        "click",
        openNewProjectEditor
    );

    function closeProjectEditor() {
        if (projectEditor?.open) {
            projectEditor.close();
        }

        editingProject = null;
        editorMode = "edit";

        document.body.classList.remove(
            "editor-open"
        );
    }

    closeProjectButtons.forEach(
        (button) => {
            button.addEventListener(
                "click",
                closeProjectEditor
            );
        }
    );

    projectEditor?.addEventListener(
        "cancel",
        (event) => {
            event.preventDefault();
            closeProjectEditor();
        }
    );

    projectEditor?.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                projectEditor
            ) {
                closeProjectEditor();
            }
        }
    );

    function projectPayload() {
        const yearValue =
            projectYear.value.trim();

        return {
            title:
                projectTitle.value.trim(),

            kicker:
                projectKicker.value.trim() ||
                null,

            description:
                projectDescription.value.trim() ||
                null,

            year:
                yearValue
                    ? Number(yearValue)
                    : null,

            role:
                projectRole.value.trim() ||
                null,

            gallery_layout:
                projectLayout.value,

            is_published:
                projectVisible.checked
        };
    }

    async function saveProject(event) {
        event.preventDefault();

        if (!projectTitle.value.trim()) {
            showToast(
                "Your project needs a name."
            );

            projectTitle.focus();
            return;
        }

        const creating =
            editorMode === "create";

        const originalText =
            saveProjectButton.textContent;

        saveProjectButton.disabled = true;

        saveProjectButton.textContent =
            creating
                ? "Creating..."
                : "Saving...";

        try {
            const endpoint =
                creating
                    ? "/api/admin/projects"
                    : `/api/admin/projects/${editingProject.id}`;

            const response = await fetch(
                endpoint,
                {
                    method:
                        creating
                            ? "POST"
                            : "PUT",

                    credentials:
                        "include",

                    headers: {
                        "Accept":
                            "application/json",

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            projectPayload()
                        )
                }
            );

            if (response.status === 401) {
                handleExpiredLogin();
                return;
            }

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    (
                        creating
                            ? "Unable to create project."
                            : "Unable to save project."
                    )
                );
            }

            if (!data.project) {
                throw new Error(
                    "The project response was incomplete."
                );
            }

            if (creating) {
                editingProject =
                    data.project;

                projects.push(
                    data.project
                );

                renderProjects();

                setEditorMode("edit");

                fillProjectFields(
                    editingProject
                );

                renderProjectMedia();

                showToast(
                    "Project created! Now add images, then turn on visibility when you're ready."
                );
            } else {
                editingProject =
                    data.project;

                projects = projects.map(
                    (project) =>
                        project.id ===
                        data.project.id
                            ? data.project
                            : project
                );

                renderProjects();
                closeProjectEditor();

                showToast(
                    "Project changes saved!"
                );
            }
        } catch (error) {
            console.error(
                "Unable to save project:",
                error
            );

            showToast(
                error.message ||
                "Something went wrong while saving the project."
            );
        } finally {
            saveProjectButton.disabled =
                false;

            if (
                editorMode ===
                "create"
            ) {
                saveProjectButton.textContent =
                    "Create Project";
            } else {
                saveProjectButton.textContent =
                    "Save Project";
            }

            if (!projectEditor?.open) {
                saveProjectButton.textContent =
                    originalText;
            }
        }
    }

    projectEditorForm?.addEventListener(
        "submit",
        saveProject
    );

    function renderProjectMedia() {
        if (
            !projectMediaList ||
            !editingProject
        ) {
            return;
        }

        projectMediaList.replaceChildren();

        const media =
            sortedMedia(
                editingProject
            );

        if (projectMediaCount) {
            projectMediaCount.textContent =
                `${media.length} ${
                    media.length === 1
                        ? "Image"
                        : "Images"
                }`;
        }

        if (!media.length) {
            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "project-media-empty";

            empty.innerHTML = `
                <strong>No images yet</strong>
                <p>Upload the first image above.</p>
            `;

            projectMediaList.appendChild(
                empty
            );

            return;
        }

        media.forEach(
            (item, index) => {
                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "project-media-item";

                const preview =
                    document.createElement(
                        "div"
                    );

                preview.className =
                    "project-media-item-preview";

                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    getMediaUrl(item);

                image.alt =
                    item.alt_text ||
                    "Project image";

                image.loading =
                    "lazy";

                preview.appendChild(
                    image
                );

                const info =
                    document.createElement(
                        "div"
                    );

                info.className =
                    "project-media-item-info";

                const position =
                    document.createElement(
                        "strong"
                    );

                position.textContent =
                    `Image ${index + 1}`;

                const alt =
                    document.createElement(
                        "span"
                    );

                alt.textContent =
                    item.alt_text ||
                    "No image description";

                info.append(
                    position,
                    alt
                );

                const controls =
                    document.createElement(
                        "div"
                    );

                controls.className =
                    "project-media-controls";

                const up =
                    document.createElement(
                        "button"
                    );

                up.type =
                    "button";

                up.textContent =
                    "Move Up";

                up.disabled =
                    index === 0;

                up.addEventListener(
                    "click",
                    () => {
                        moveProjectMedia(
                            item.id,
                            -1
                        );
                    }
                );

                const down =
                    document.createElement(
                        "button"
                    );

                down.type =
                    "button";

                down.textContent =
                    "Move Down";

                down.disabled =
                    index ===
                    media.length - 1;

                down.addEventListener(
                    "click",
                    () => {
                        moveProjectMedia(
                            item.id,
                            1
                        );
                    }
                );

                const remove =
                    document.createElement(
                        "button"
                    );

                remove.type =
                    "button";

                remove.className =
                    "remove-media-button";

                remove.textContent =
                    "Remove";

                remove.addEventListener(
                    "click",
                    () => {
                        deleteProjectMedia(
                            item
                        );
                    }
                );

                controls.append(
                    up,
                    down,
                    remove
                );

                card.append(
                    preview,
                    info,
                    controls
                );

                projectMediaList.appendChild(
                    card
                );
            }
        );
    }

    function updateEditingProjectMedia(
        media
    ) {
        if (!editingProject) {
            return;
        }

        editingProject = {
            ...editingProject,
            media
        };

        projects = projects.map(
            (project) =>
                project.id ===
                editingProject.id
                    ? editingProject
                    : project
        );

        renderProjectMedia();
        renderProjects();
    }

    async function uploadProjectMedia() {
        if (
            !editingProject ||
            !uploadProjectMediaButton
        ) {
            return;
        }

        const file =
            projectMediaFile?.files?.[0];

        if (!file) {
            showToast(
                "Choose an image first."
            );

            projectMediaFile?.focus();
            return;
        }

        if (
            file.size >
            20 * 1024 * 1024
        ) {
            showToast(
                "Images must be 20 MB or smaller."
            );

            return;
        }

        const originalText =
            uploadProjectMediaButton.textContent;

        uploadProjectMediaButton.disabled =
            true;

        uploadProjectMediaButton.textContent =
            "Uploading...";

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );

        formData.append(
            "alt_text",
            projectMediaAlt?.value.trim() ||
            ""
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

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to upload image."
                );
            }

            updateEditingProjectMedia([
                ...sortedMedia(
                    editingProject
                ),
                data.media
            ]);

            projectMediaFile.value = "";
            projectMediaAlt.value = "";

            showToast(
                "Image uploaded!"
            );
        } catch (error) {
            console.error(
                "Unable to upload image:",
                error
            );

            showToast(
                error.message ||
                "We couldn't upload that image."
            );
        } finally {
            uploadProjectMediaButton.disabled =
                false;

            uploadProjectMediaButton.textContent =
                originalText;
        }
    }

    uploadProjectMediaButton?.addEventListener(
        "click",
        uploadProjectMedia
    );

    async function moveProjectMedia(
        mediaId,
        direction
    ) {
        if (!editingProject) {
            return;
        }

        const current =
            sortedMedia(
                editingProject
            );

        const index =
            current.findIndex(
                (media) =>
                    Number(media.id) ===
                    Number(mediaId)
            );

        if (index === -1) {
            return;
        }

        const newIndex =
            index + direction;

        if (
            newIndex < 0 ||
            newIndex >= current.length
        ) {
            return;
        }

        const reordered =
            [...current];

        [
            reordered[index],
            reordered[newIndex]
        ] = [
            reordered[newIndex],
            reordered[index]
        ];

        updateEditingProjectMedia(
            reordered.map(
                (media, order) => ({
                    ...media,
                    sort_order: order
                })
            )
        );

        try {
            const response = await fetch(
                `/api/admin/projects/${editingProject.id}/media/order`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Accept":
                            "application/json",

                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        media_ids:
                            reordered.map(
                                (media) =>
                                    media.id
                            )
                    })
                }
            );

            if (response.status === 401) {
                handleExpiredLogin();
                return;
            }

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to reorder images."
                );
            }

            if (
                Array.isArray(
                    data.media
                )
            ) {
                updateEditingProjectMedia(
                    data.media
                );
            }

            showToast(
                "Image order saved!"
            );
        } catch (error) {
            console.error(
                "Unable to reorder images:",
                error
            );

            updateEditingProjectMedia(
                current
            );

            showToast(
                "We couldn't save that image order."
            );
        }
    }

    async function deleteProjectMedia(
        media
    ) {
        if (
            !editingProject ||
            !media
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                "Remove this image from the project? This deletes the R2 file too."
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
                        "Accept":
                            "application/json"
                    }
                }
            );

            if (response.status === 401) {
                handleExpiredLogin();
                return;
            }

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to remove image."
                );
            }

            updateEditingProjectMedia(
                sortedMedia(
                    editingProject
                ).filter(
                    (item) =>
                        Number(item.id) !==
                        Number(media.id)
                )
            );

            showToast(
                "Image removed."
            );
        } catch (error) {
            console.error(
                "Unable to remove image:",
                error
            );

            showToast(
                error.message ||
                "We couldn't remove that image."
            );
        }
    }

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navigationLinks.forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");
        });
    });

    async function startDashboard() {
        const authenticated =
            await checkSession();

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