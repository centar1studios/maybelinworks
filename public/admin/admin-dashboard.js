document.addEventListener("DOMContentLoaded", () => {
    /* ACCOUNT */

    const usernameElements = document.querySelectorAll(
        "[data-admin-username], [data-account-username]"
    );

    const avatar = document.querySelector("[data-user-avatar]");
    const logoutButtons = document.querySelectorAll("[data-logout]");
    const toast = document.querySelector("[data-admin-toast]");

    /* NAVIGATION */

    const navigationLinks = document.querySelectorAll(".admin-nav-link");

    /* HOMEPAGE */

    const heroKicker = document.querySelector("#hero-kicker");
    const heroTitle = document.querySelector("#hero-title");
    const heroDescription = document.querySelector("#hero-description");

    const saveSettingsButton = document.querySelector(
        "[data-save-settings]"
    );

    const homepageBadge = document.querySelector(
        "#homepage .coming-soon-badge"
    );

    let currentSettings = null;

    /* PROJECTS */

    const projectList = document.querySelector("[data-project-list]");
    const projectCount = document.querySelector("[data-project-count]");
    const projectSummary = document.querySelector("[data-project-summary]");

    const projectEditor = document.querySelector(
        "[data-project-editor]"
    );

    const projectEditorForm = document.querySelector(
        "[data-project-editor-form]"
    );

    const closeProjectButtons = document.querySelectorAll(
        "[data-close-project-editor]"
    );

    const saveProjectButton = document.querySelector(
        "[data-save-project]"
    );

    const projectId = document.querySelector("#project-id");
    const projectTitle = document.querySelector("#project-title");
    const projectKicker = document.querySelector("#project-kicker");
    const projectDescription = document.querySelector(
        "#project-description"
    );
    const projectYear = document.querySelector("#project-year");
    const projectRole = document.querySelector("#project-role");
    const projectVisible = document.querySelector("#project-visible");

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
        }, 3000);
    }

    /* USERNAME */

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

    /* SESSION */

    async function checkSession() {
        try {
            const response = await fetch("/api/admin/session", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(
                    "Unable to verify session."
                );
            }

            const data = await response.json();

            if (!data.authenticated) {
                window.location.href =
                    "../admin-login.html";

                return false;
            }

            setUsername(data.username);

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

            logoutButtons.forEach((button) => {
                button.disabled = false;
                button.textContent = "Log Out";
            });
        }
    }

    logoutButtons.forEach((button) => {
        button.addEventListener(
            "click",
            logout
        );
    });

    /* HOMEPAGE FORM */

    function setHomepageFormReady(ready) {
        if (heroKicker) {
            heroKicker.disabled = !ready;
        }

        if (heroTitle) {
            heroTitle.disabled = !ready;
        }

        /*
         * The public homepage does not currently show
         * the description, so this stays locked.
         */
        if (heroDescription) {
            heroDescription.disabled = true;
        }

        if (saveSettingsButton) {
            saveSettingsButton.disabled = !ready;

            if (ready) {
                saveSettingsButton.classList.remove(
                    "disabled-button"
                );

                saveSettingsButton.classList.add(
                    "primary-link-button"
                );

                saveSettingsButton.textContent =
                    "Save Homepage Changes";
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
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load homepage settings."
                );
            }

            const data = await response.json();

            if (!data.settings) {
                throw new Error(
                    "Homepage settings were not found."
                );
            }

            currentSettings = data.settings;

            if (heroKicker) {
                heroKicker.value =
                    currentSettings.hero_kicker || "";
            }

            if (heroTitle) {
                heroTitle.value =
                    currentSettings.hero_title || "";
            }

            if (heroDescription) {
                heroDescription.value = "";

                heroDescription.placeholder =
                    "This isn't shown on the homepage right now.";
            }

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
        const kicker =
            heroKicker?.value.trim() || "";

        const title =
            heroTitle?.value.trim() || "";

        if (!kicker) {
            showToast(
                "Add the small text above your heading before saving."
            );

            heroKicker?.focus();

            return false;
        }

        if (!title) {
            showToast(
                "Your main heading can't be empty."
            );

            heroTitle?.focus();

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

        if (!validateHomepageSettings()) {
            return;
        }

        const originalButtonText =
            saveSettingsButton.textContent;

        saveSettingsButton.disabled = true;
        saveSettingsButton.textContent =
            "Saving...";

        try {
            const response = await fetch(
                "/api/admin/settings",
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        hero_kicker:
                            heroKicker.value.trim(),

                        hero_title:
                            heroTitle.value.trim(),

                        hero_description:
                            currentSettings.hero_description
                    })
                }
            );

            if (response.status === 401) {
                showToast(
                    "Your login expired. Please sign in again."
                );

                window.setTimeout(() => {
                    window.location.href =
                        "../admin-login.html";
                }, 1200);

                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to save homepage changes."
                );
            }

            if (data.settings) {
                currentSettings = data.settings;
            }

            if (homepageBadge) {
                homepageBadge.textContent =
                    "Saved";
            }

            showToast(
                "Homepage changes saved!"
            );

            window.setTimeout(() => {
                if (homepageBadge) {
                    homepageBadge.textContent =
                        "Ready to Edit";
                }
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
            saveSettingsButton.disabled = false;
            saveSettingsButton.textContent =
                originalButtonText;
        }
    }

    saveSettingsButton?.addEventListener(
        "click",
        saveHomepageSettings
    );

    /* PROJECT PREVIEW */

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

    /* PROJECT SUMMARY */

    function updateProjectSummary() {
        if (projectCount) {
            projectCount.textContent =
                String(projects.length);
        }

        if (!projectSummary) {
            return;
        }

        const visibleProjects = projects.filter(
            project =>
                Number(project.is_published) === 1
        );

        if (visibleProjects.length === 0) {
            projectSummary.textContent =
                "No projects are currently visible";
            return;
        }

        const names = visibleProjects.map(
            project => project.title
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
            `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
    }

    /* RENDER PROJECTS */

    function renderProjects() {
        if (!projectList) {
            return;
        }

        projectList.replaceChildren();

        const sortedProjects = [...projects].sort(
            (a, b) => {
                const orderA =
                    Number(a.sort_order) || 0;

                const orderB =
                    Number(b.sort_order) || 0;

                if (orderA !== orderB) {
                    return orderA - orderB;
                }

                return Number(a.id) - Number(b.id);
            }
        );

        if (sortedProjects.length === 0) {
            const emptyCard =
                document.createElement("article");

            emptyCard.className =
                "project-admin-card project-loading-card";

            const message =
                document.createElement("div");

            message.className =
                "project-admin-content";

            const heading =
                document.createElement("h3");

            heading.textContent =
                "No Projects Found";

            const description =
                document.createElement("p");

            description.textContent =
                "There aren't any portfolio projects in the website database yet.";

            message.append(
                heading,
                description
            );

            emptyCard.appendChild(message);
            projectList.appendChild(emptyCard);

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

                card.dataset.projectSlug =
                    project.slug;

                const number =
                    document.createElement("div");

                number.className =
                    "project-admin-number";

                number.textContent =
                    String(index + 1)
                        .padStart(2, "0");

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

                const roleGroup =
                    document.createElement("div");

                const roleLabel =
                    document.createElement("span");

                roleLabel.textContent =
                    "My Role";

                const roleValue =
                    document.createElement("strong");

                roleValue.textContent =
                    project.role ||
                    "Not listed";

                roleGroup.append(
                    roleLabel,
                    roleValue
                );

                const visibilityGroup =
                    document.createElement("div");

                const visibilityLabel =
                    document.createElement("span");

                visibilityLabel.textContent =
                    "Website";

                const visibilityValue =
                    document.createElement("strong");

                visibilityValue.textContent =
                    Number(
                        project.is_published
                    ) === 1
                        ? "Visible"
                        : "Hidden";

                visibilityGroup.append(
                    visibilityLabel,
                    visibilityValue
                );

                meta.append(
                    roleGroup,
                    visibilityGroup
                );

                const editButton =
                    document.createElement("button");

                editButton.className =
                    "project-edit-button";

                editButton.type = "button";
                editButton.textContent =
                    "Edit Project";

                editButton.dataset.projectEdit =
                    project.slug;

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

                projectList.appendChild(card);
            }
        );

        updateProjectSummary();
    }

    /* LOAD PROJECTS */

    async function loadProjects() {
        if (!projectList) {
            return;
        }

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

            if (response.status === 401) {
                window.location.href =
                    "../admin-login.html";

                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Unable to load projects."
                );
            }

            const data = await response.json();

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

            projectList.innerHTML = `
                <article class="project-admin-card project-loading-card">
                    <div class="project-admin-content">
                        <p class="project-admin-type">Portfolio</p>
                        <h3>Couldn't Load Projects</h3>
                        <p>Refresh the page and try again.</p>
                    </div>
                </article>
            `;

            showToast(
                "We couldn't load your projects. Try refreshing the page."
            );
        }
    }

    /* OPEN PROJECT EDITOR */

    function openProjectEditor(slug) {
        const project = projects.find(
            item => item.slug === slug
        );

        if (!project || !projectEditor) {
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
            Number(project.is_published) === 1;

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
            projectEditor &&
            projectEditor.open
        ) {
            projectEditor.close();
        }

        editingProject = null;

        document.body.classList.remove(
            "editor-open"
        );
    }

    closeProjectButtons.forEach((button) => {
        button.addEventListener(
            "click",
            closeProjectEditor
        );
    });

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
            if (event.target === projectEditor) {
                closeProjectEditor();
            }
        }
    );

    /* VALIDATE PROJECT */

    function validateProject() {
        const title =
            projectTitle?.value.trim() || "";

        if (!title) {
            showToast(
                "Your project needs a name."
            );

            projectTitle?.focus();

            return false;
        }

        return true;
    }

    /* SAVE PROJECT */

    async function saveProject(event) {
        event.preventDefault();

        if (
            !editingProject ||
            !saveProjectButton
        ) {
            return;
        }

        if (!validateProject()) {
            return;
        }

        const originalButtonText =
            saveProjectButton.textContent;

        saveProjectButton.disabled = true;
        saveProjectButton.textContent =
            "Saving...";

        const yearValue =
            projectYear.value.trim();

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

                        is_published:
                            projectVisible.checked
                    })
                }
            );

            if (response.status === 401) {
                showToast(
                    "Your login expired. Please sign in again."
                );

                window.setTimeout(() => {
                    window.location.href =
                        "../admin-login.html";
                }, 1200);

                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to save project."
                );
            }

            if (data.project) {
                projects = projects.map(
                    project =>
                        project.id ===
                        data.project.id
                            ? data.project
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
                "Something went wrong while saving the project. Your changes are still here, so you can try again."
            );
        } finally {
            saveProjectButton.disabled = false;
            saveProjectButton.textContent =
                originalButtonText;
        }
    }

    projectEditorForm?.addEventListener(
        "submit",
        saveProject
    );

    /* NAVIGATION */

    navigationLinks.forEach((link) => {
        link.addEventListener(
            "click",
            () => {
                navigationLinks.forEach(
                    navLink => {
                        navLink.classList.remove(
                            "active"
                        );
                    }
                );

                link.classList.add(
                    "active"
                );
            }
        );
    });

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