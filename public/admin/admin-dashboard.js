document.addEventListener("DOMContentLoaded", () => {
    /* FONTS */

    const GOOGLE_FONTS = new Map([
        [
            "Playfair Display",
            "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400"
        ],
        [
            "Cormorant Garamond",
            "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400"
        ],
        [
            "DM Serif Display",
            "DM+Serif+Display:ital@0;1"
        ],
        [
            "Libre Baskerville",
            "Libre+Baskerville:ital,wght@0,400;0,700;1,400"
        ],
        [
            "Cardo",
            "Cardo:ital,wght@0,400;0,700;1,400"
        ],
        [
            "Lato",
            "Lato:wght@300;400;700;900"
        ],
        [
            "Inter",
            "Inter:wght@300;400;500;600;700;800"
        ],
        [
            "Montserrat",
            "Montserrat:wght@300;400;500;600;700;800"
        ],
        [
            "Nunito",
            "Nunito:wght@300;400;500;600;700;800"
        ],
        [
            "Source Sans 3",
            "Source+Sans+3:wght@300;400;500;600;700;800"
        ],
        [
            "Hind",
            "Hind:wght@300;400;500;600;700"
        ]
    ]);

    const loadedFonts = new Set([
        "Playfair Display",
        "Lato"
    ]);

    function loadGoogleFont(fontName) {
        if (
            !fontName ||
            loadedFonts.has(fontName)
        ) {
            return;
        }

        const googleName =
            GOOGLE_FONTS.get(fontName);

        if (!googleName) {
            return;
        }

        const link =
            document.createElement("link");

        link.rel = "stylesheet";
        link.href =
            `https://fonts.googleapis.com/css2?family=${googleName}&display=swap`;

        document.head.appendChild(link);
        loadedFonts.add(fontName);
    }

    function fontStack(fontName, type) {
        if (type === "display") {
            return `"${fontName}", Georgia, serif`;
        }

        return `"${fontName}", Arial, sans-serif`;
    }


    /* ACCOUNT */

    const usernameElements =
        document.querySelectorAll(
            "[data-admin-username], [data-account-username]"
        );

    const avatar =
        document.querySelector(
            "[data-user-avatar]"
        );

    const logoutButtons =
        document.querySelectorAll(
            "[data-logout]"
        );

    const toast =
        document.querySelector(
            "[data-admin-toast]"
        );


    /* NAVIGATION */

    const navigationLinks =
        document.querySelectorAll(
            ".admin-nav-link"
        );


    /* HOMEPAGE */

    const heroKicker =
        document.querySelector(
            "#hero-kicker"
        );

    const heroTitle =
        document.querySelector(
            "#hero-title"
        );

    const heroDescription =
        document.querySelector(
            "#hero-description"
        );

    const displayFont =
        document.querySelector(
            "#display-font"
        );

    const bodyFont =
        document.querySelector(
            "#body-font"
        );

    const displayFontPreview =
        document.querySelector(
            "[data-display-font-preview]"
        );

    const bodyFontPreview =
        document.querySelector(
            "[data-body-font-preview]"
        );

    const saveSettingsButton =
        document.querySelector(
            "[data-save-settings]"
        );

    const homepageBadge =
        document.querySelector(
            "#homepage .coming-soon-badge"
        );

    let currentSettings = null;


    /* PROJECTS */

    const projectList =
        document.querySelector(
            "[data-project-list]"
        );

    const projectCount =
        document.querySelector(
            "[data-project-count]"
        );

    const projectSummary =
        document.querySelector(
            "[data-project-summary]"
        );

    const mediaCount =
        document.querySelector(
            "[data-media-count]"
        );

    const mediaCountLarge =
        document.querySelector(
            "[data-media-count-large]"
        );

    const projectEditor =
        document.querySelector(
            "[data-project-editor]"
        );

    const projectEditorForm =
        document.querySelector(
            "[data-project-editor-form]"
        );

    const closeProjectButtons =
        document.querySelectorAll(
            "[data-close-project-editor]"
        );

    const saveProjectButton =
        document.querySelector(
            "[data-save-project]"
        );

    const projectId =
        document.querySelector(
            "#project-id"
        );

    const projectTitle =
        document.querySelector(
            "#project-title"
        );

    const projectKicker =
        document.querySelector(
            "#project-kicker"
        );

    const projectDescription =
        document.querySelector(
            "#project-description"
        );

    const projectYear =
        document.querySelector(
            "#project-year"
        );

    const projectRole =
        document.querySelector(
            "#project-role"
        );

    const projectVisible =
        document.querySelector(
            "#project-visible"
        );


    /* PROJECT MEDIA */

    const projectMediaFile =
        document.querySelector(
            "#project-media-file"
        );

    const projectMediaAlt =
        document.querySelector(
            "#project-media-alt"
        );

    const uploadProjectMediaButton =
        document.querySelector(
            "[data-upload-project-media]"
        );

    const projectMediaList =
        document.querySelector(
            "[data-project-media-list]"
        );

    const projectMediaCount =
        document.querySelector(
            "[data-project-media-count]"
        );

    let projects = [];
    let editingProject = null;


    /* MESSAGES */

    function showToast(message) {
        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.classList.add("visible");

        window.setTimeout(() => {
            toast.classList.remove("visible");
        }, 3200);
    }


    /* LOGIN EXPIRED */

    function handleExpiredLogin() {
        showToast(
            "Your login expired. Please sign in again."
        );

        window.setTimeout(() => {
            window.location.href =
                "../admin-login.html";
        }, 1200);
    }


    /* USERNAME */

    function setUsername(username) {
        usernameElements.forEach(
            (element) => {
                element.textContent =
                    username;
            }
        );

        if (avatar) {
            avatar.textContent =
                username
                    .charAt(0)
                    .toUpperCase();
        }
    }


    /* SESSION */

    async function checkSession() {
        try {
            const response = await fetch(
                "/api/admin/session",
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept":
                            "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to verify session."
                );
            }

            const data =
                await response.json();

            if (!data.authenticated) {
                window.location.href =
                    "../admin-login.html";

                return false;
            }

            setUsername(
                data.username
            );

            return true;
        } catch (error) {
            console.error(
                "Session check failed:",
                error
            );

            showToast(
                "We couldn't verify your login. Please sign in again."
            );

            window.setTimeout(() => {
                window.location.href =
                    "../admin-login.html";
            }, 1200);

            return false;
        }
    }


    /* LOG OUT */

    async function logout() {
        logoutButtons.forEach(
            (button) => {
                button.disabled = true;
                button.textContent =
                    "Logging Out...";
            }
        );

        try {
            const response = await fetch(
                "/api/admin/logout",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to log out."
                );
            }

            window.location.href =
                "../admin-login.html";
        } catch (error) {
            console.error(
                "Logout failed:",
                error
            );

            showToast(
                "We couldn't log you out. Please try again."
            );

            logoutButtons.forEach(
                (button) => {
                    button.disabled = false;
                    button.textContent =
                        "Log Out";
                }
            );
        }
    }

    logoutButtons.forEach(
        (button) => {
            button.addEventListener(
                "click",
                logout
            );
        }
    );


    /* FONT SELECT */

    function makeSureFontExists(
        select,
        value
    ) {
        if (
            !select ||
            !value
        ) {
            return;
        }

        const exists =
            Array.from(
                select.options
            ).some(
                option =>
                    option.value === value
            );

        if (exists) {
            return;
        }

        const option =
            document.createElement(
                "option"
            );

        option.value = value;
        option.textContent = value;

        select.appendChild(option);
    }

    function updateFontPreviews() {
        const heading =
            displayFont?.value ||
            "Playfair Display";

        const regular =
            bodyFont?.value ||
            "Lato";

        loadGoogleFont(heading);
        loadGoogleFont(regular);

        if (displayFontPreview) {
            displayFontPreview.style.fontFamily =
                fontStack(
                    heading,
                    "display"
                );
        }

        if (bodyFontPreview) {
            bodyFontPreview.style.fontFamily =
                fontStack(
                    regular,
                    "body"
                );
        }
    }

    displayFont?.addEventListener(
        "change",
        updateFontPreviews
    );

    bodyFont?.addEventListener(
        "change",
        updateFontPreviews
    );


    /* HOMEPAGE READY */

    function setHomepageFormReady(
        ready
    ) {
        if (heroKicker) {
            heroKicker.disabled =
                !ready;
        }

        if (heroTitle) {
            heroTitle.disabled =
                !ready;
        }

        if (heroDescription) {
            heroDescription.disabled =
                true;
        }

        if (displayFont) {
            displayFont.disabled =
                !ready;
        }

        if (bodyFont) {
            bodyFont.disabled =
                !ready;
        }

        if (saveSettingsButton) {
            saveSettingsButton.disabled =
                !ready;

            if (ready) {
                saveSettingsButton
                    .classList
                    .remove(
                        "disabled-button"
                    );

                saveSettingsButton
                    .classList
                    .add(
                        "primary-link-button"
                    );
            }
        }

        if (homepageBadge) {
            homepageBadge.textContent =
                ready
                    ? "Ready to Edit"
                    : "Loading...";
        }
    }


    /* LOAD HOMEPAGE */

    async function loadHomepageSettings() {
        setHomepageFormReady(false);

        try {
            const response = await fetch(
                "/api/settings",
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept":
                            "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load homepage settings."
                );
            }

            const data =
                await response.json();

            if (!data.settings) {
                throw new Error(
                    "Homepage settings were not found."
                );
            }

            currentSettings =
                data.settings;

            heroKicker.value =
                currentSettings.hero_kicker ||
                "";

            heroTitle.value =
                currentSettings.hero_title ||
                "";

            heroDescription.value =
                "";

            heroDescription.placeholder =
                "This isn't shown on the homepage right now.";

            const savedDisplayFont =
                currentSettings.display_font ||
                "Playfair Display";

            const savedBodyFont =
                currentSettings.body_font ||
                "Lato";

            makeSureFontExists(
                displayFont,
                savedDisplayFont
            );

            makeSureFontExists(
                bodyFont,
                savedBodyFont
            );

            displayFont.value =
                savedDisplayFont;

            bodyFont.value =
                savedBodyFont;

            updateFontPreviews();
            setHomepageFormReady(true);
        } catch (error) {
            console.error(
                "Homepage settings failed to load:",
                error
            );

            if (homepageBadge) {
                homepageBadge.textContent =
                    "Couldn't Load";
            }

            showToast(
                "We couldn't load the homepage settings. Try refreshing the page."
            );
        }
    }


    /* VALIDATE HOMEPAGE */

    function validateHomepageSettings() {
        if (
            !heroKicker.value.trim()
        ) {
            showToast(
                "Add the small text above your heading before saving."
            );

            heroKicker.focus();

            return false;
        }

        if (
            !heroTitle.value.trim()
        ) {
            showToast(
                "Your main heading can't be empty."
            );

            heroTitle.focus();

            return false;
        }

        return true;
    }


    /* SAVE HOMEPAGE */

    async function saveHomepageSettings() {
        if (
            !currentSettings ||
            !saveSettingsButton
        ) {
            return;
        }

        if (
            !validateHomepageSettings()
        ) {
            return;
        }

        const originalText =
            saveSettingsButton.textContent;

        saveSettingsButton.disabled =
            true;

        saveSettingsButton.textContent =
            "Saving...";

        try {
            const response = await fetch(
                "/api/admin/settings",
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
                        hero_kicker:
                            heroKicker
                                .value
                                .trim(),

                        hero_title:
                            heroTitle
                                .value
                                .trim(),

                        hero_description:
                            currentSettings
                                .hero_description,

                        display_font:
                            displayFont.value,

                        body_font:
                            bodyFont.value
                    })
                }
            );

            if (
                response.status === 401
            ) {
                handleExpiredLogin();
                return;
            }

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to save homepage changes."
                );
            }

            if (data.settings) {
                currentSettings =
                    data.settings;
            }

            homepageBadge.textContent =
                "Saved";

            showToast(
                "Homepage and fonts saved!"
            );

            window.setTimeout(() => {
                homepageBadge.textContent =
                    "Ready to Edit";
            }, 2000);
        } catch (error) {
            console.error(
                "Unable to save homepage:",
                error
            );

            showToast(
                "Something went wrong while saving. Your changes are still here, so you can try again."
            );
        } finally {
            saveSettingsButton.disabled =
                false;

            saveSettingsButton.textContent =
                originalText;
        }
    }

    saveSettingsButton?.addEventListener(
        "click",
        saveHomepageSettings
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
                        encodeURIComponent(part)
                )
                .join("/");

        return `/media/${encodedKey}`;
    }


    /* SORT MEDIA */

    function sortedMedia(project) {
        if (
            !Array.isArray(
                project?.media
            )
        ) {
            return [];
        }

        return [
            ...project.media
        ].sort(
            (a, b) => {
                const orderA =
                    Number(
                        a.sort_order
                    ) || 0;

                const orderB =
                    Number(
                        b.sort_order
                    ) || 0;

                if (
                    orderA !== orderB
                ) {
                    return (
                        orderA -
                        orderB
                    );
                }

                return (
                    Number(a.id) -
                    Number(b.id)
                );
            }
        );
    }


    /* PROJECT PREVIEW */

    function makeProjectPreview(
        description
    ) {
        if (!description) {
            return "No project description has been added yet.";
        }

        const cleaned =
            description
                .replace(/\s+/g, " ")
                .trim();

        if (
            cleaned.length <= 220
        ) {
            return cleaned;
        }

        return (
            `${cleaned.slice(
                0,
                217
            )}...`
        );
    }


    /* PROJECT SUMMARY */

    function updateProjectSummary() {
        const visibleProjects =
            projects.filter(
                project =>
                    Number(
                        project.is_published
                    ) === 1
            );

        if (projectCount) {
            projectCount.textContent =
                String(
                    projects.length
                );
        }

        const totalMedia =
            projects.reduce(
                (total, project) =>
                    total +
                    (
                        Array.isArray(
                            project.media
                        )
                            ? project.media.length
                            : 0
                    ),
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

        if (
            visibleProjects.length === 0
        ) {
            projectSummary.textContent =
                "No projects are currently visible";

            return;
        }

        const names =
            visibleProjects.map(
                project =>
                    project.title
            );

        if (names.length === 1) {
            projectSummary.textContent =
                names[0];

            return;
        }

        if (names.length === 2) {
            projectSummary.textContent =
                `${names[0]} and ${names[1]}`;

            return;
        }

        projectSummary.textContent =
            `${names
                .slice(0, -1)
                .join(", ")}, and ${names.at(-1)}`;
    }


    /* RENDER PROJECTS */

    function renderProjects() {
        if (!projectList) {
            return;
        }

        projectList.replaceChildren();

        const sortedProjects = [
            ...projects
        ].sort(
            (a, b) => {
                const orderA =
                    Number(
                        a.sort_order
                    ) || 0;

                const orderB =
                    Number(
                        b.sort_order
                    ) || 0;

                if (
                    orderA !== orderB
                ) {
                    return (
                        orderA -
                        orderB
                    );
                }

                return (
                    Number(a.id) -
                    Number(b.id)
                );
            }
        );

        if (
            sortedProjects.length === 0
        ) {
            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "project-admin-card";

            const content =
                document.createElement(
                    "div"
                );

            content.className =
                "project-admin-content";

            const heading =
                document.createElement(
                    "h3"
                );

            heading.textContent =
                "No Projects Found";

            content.appendChild(
                heading
            );

            card.appendChild(
                content
            );

            projectList.appendChild(
                card
            );

            updateProjectSummary();

            return;
        }

        sortedProjects.forEach(
            (project, index) => {
                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "project-admin-card";

                if (
                    Number(
                        project.is_published
                    ) !== 1
                ) {
                    card.classList.add(
                        "project-is-hidden"
                    );
                }

                const number =
                    document.createElement(
                        "div"
                    );

                number.className =
                    "project-admin-number";

                number.textContent =
                    String(
                        index + 1
                    ).padStart(
                        2,
                        "0"
                    );

                const content =
                    document.createElement(
                        "div"
                    );

                content.className =
                    "project-admin-content";

                const type =
                    document.createElement(
                        "p"
                    );

                type.className =
                    "project-admin-type";

                type.textContent =
                    project.kicker ||
                    "Portfolio Project";

                const title =
                    document.createElement(
                        "h3"
                    );

                title.textContent =
                    project.title ||
                    "Untitled Project";

                const description =
                    document.createElement(
                        "p"
                    );

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
                    document.createElement(
                        "div"
                    );

                meta.className =
                    "project-admin-meta";

                const role =
                    document.createElement(
                        "div"
                    );

                role.innerHTML = `
                    <span>My Role</span>
                    <strong></strong>
                `;

                role.querySelector(
                    "strong"
                ).textContent =
                    project.role ||
                    "Not listed";

                const images =
                    document.createElement(
                        "div"
                    );

                images.innerHTML = `
                    <span>Uploads</span>
                    <strong></strong>
                `;

                images.querySelector(
                    "strong"
                ).textContent =
                    `${sortedMedia(project).length} Images`;

                const visible =
                    document.createElement(
                        "div"
                    );

                visible.innerHTML = `
                    <span>Website</span>
                    <strong></strong>
                `;

                visible.querySelector(
                    "strong"
                ).textContent =
                    Number(
                        project.is_published
                    ) === 1
                        ? "Visible"
                        : "Hidden";

                meta.append(
                    role,
                    images,
                    visible
                );

                const editButton =
                    document.createElement(
                        "button"
                    );

                editButton.className =
                    "project-edit-button";

                editButton.type =
                    "button";

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


    /* LOAD PROJECTS */

    async function loadProjects() {
        try {
            const response = await fetch(
                "/api/admin/projects",
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept":
                            "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (
                response.status === 401
            ) {
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

            projects =
                Array.isArray(
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


    /* RENDER PROJECT MEDIA */

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

        if (
            media.length === 0
        ) {
            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "project-media-empty";

            const title =
                document.createElement(
                    "strong"
                );

            title.textContent =
                "No Website Manager uploads yet";

            const text =
                document.createElement(
                    "p"
                );

            text.textContent =
                "Upload an image above and it will appear here.";

            empty.append(
                title,
                text
            );

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

                up.type = "button";
                up.textContent = "Move Up";
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

                down.type = "button";
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

                remove.type = "button";
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


    /* UPDATE PROJECT MEDIA */

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

        projects =
            projects.map(
                project =>
                    project.id ===
                    editingProject.id
                        ? editingProject
                        : project
            );

        renderProjectMedia();
        renderProjects();
    }


    /* UPLOAD IMAGE */

    async function uploadProjectMedia() {
        if (
            !editingProject ||
            !uploadProjectMediaButton
        ) {
            return;
        }

        const file =
            projectMediaFile
                ?.files?.[0];

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
            uploadProjectMediaButton
                .textContent;

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
            projectMediaAlt
                ?.value
                .trim() ||
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

            if (
                response.status === 401
            ) {
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

            const currentMedia =
                sortedMedia(
                    editingProject
                );

            updateEditingProjectMedia([
                ...currentMedia,
                data.media
            ]);

            projectMediaFile.value =
                "";

            projectMediaAlt.value =
                "";

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

    uploadProjectMediaButton
        ?.addEventListener(
            "click",
            uploadProjectMedia
        );


    /* MOVE IMAGE */

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
                media =>
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

        const reordered = [
            ...current
        ];

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
                                media =>
                                    media.id
                            )
                    })
                }
            );

            if (
                response.status === 401
            ) {
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


    /* DELETE IMAGE */

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
                "Remove this uploaded image from the project?"
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

            if (
                response.status === 401
            ) {
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
                    item =>
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


    /* OPEN PROJECT EDITOR */

    function openProjectEditor(slug) {
        const project =
            projects.find(
                item =>
                    item.slug === slug
            );

        if (
            !project ||
            !projectEditor
        ) {
            return;
        }

        editingProject = project;

        projectId.value =
            String(project.id);

        projectTitle.value =
            project.title || "";

        projectKicker.value =
            project.kicker || "";

        projectDescription.value =
            project.description || "";

        projectYear.value =
            project.year ?? "";

        projectRole.value =
            project.role || "";

        projectVisible.checked =
            Number(
                project.is_published
            ) === 1;

        if (projectMediaFile) {
            projectMediaFile.value =
                "";
        }

        if (projectMediaAlt) {
            projectMediaAlt.value =
                "";
        }

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


    /* CLOSE PROJECT EDITOR */

    function closeProjectEditor() {
        if (
            projectEditor?.open
        ) {
            projectEditor.close();
        }

        editingProject = null;

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


    /* SAVE PROJECT */

    async function saveProject(event) {
        event.preventDefault();

        if (
            !editingProject ||
            !saveProjectButton
        ) {
            return;
        }

        if (
            !projectTitle.value.trim()
        ) {
            showToast(
                "Your project needs a name."
            );

            projectTitle.focus();

            return;
        }

        const originalText =
            saveProjectButton
                .textContent;

        saveProjectButton.disabled =
            true;

        saveProjectButton.textContent =
            "Saving...";

        const yearValue =
            projectYear
                .value
                .trim();

        try {
            const response = await fetch(
                `/api/admin/projects/${editingProject.id}`,
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
                        title:
                            projectTitle
                                .value
                                .trim(),

                        kicker:
                            projectKicker
                                .value
                                .trim() ||
                            null,

                        description:
                            projectDescription
                                .value
                                .trim() ||
                            null,

                        year:
                            yearValue
                                ? Number(
                                    yearValue
                                )
                                : null,

                        role:
                            projectRole
                                .value
                                .trim() ||
                            null,

                        is_published:
                            projectVisible.checked
                    })
                }
            );

            if (
                response.status === 401
            ) {
                handleExpiredLogin();
                return;
            }

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to save project."
                );
            }

            if (data.project) {
                const updatedProject = {
                    ...data.project
                };

                projects =
                    projects.map(
                        project =>
                            project.id ===
                            updatedProject.id
                                ? updatedProject
                                : project
                    );
            }

            renderProjects();
            closeProjectEditor();

            showToast(
                "Project changes saved!"
            );
        } catch (error) {
            console.error(
                "Unable to save project:",
                error
            );

            showToast(
                "Something went wrong while saving the project. Your changes are still here."
            );
        } finally {
            saveProjectButton.disabled =
                false;

            saveProjectButton.textContent =
                originalText;
        }
    }

    projectEditorForm?.addEventListener(
        "submit",
        saveProject
    );


    /* NAVIGATION */

    navigationLinks.forEach(
        (link) => {
            link.addEventListener(
                "click",
                () => {
                    navigationLinks.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    link.classList.add(
                        "active"
                    );
                }
            );
        }
    );


    /* START */

    async function startDashboard() {
        const authenticated =
            await checkSession();

        if (!authenticated) {
            return;
        }

        await Promise.all([
            loadHomepageSettings(),
            loadProjects()
        ]);
    }

    startDashboard();
});