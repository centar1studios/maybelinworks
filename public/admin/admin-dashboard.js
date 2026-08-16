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

    /* HOMEPAGE SETTINGS */

    const heroKicker = document.querySelector("#hero-kicker");
    const heroTitle = document.querySelector("#hero-title");
    const heroDescription = document.querySelector("#hero-description");
    const saveSettingsButton = document.querySelector("[data-save-settings]");
    const homepageBadge = document.querySelector(
        "#homepage .coming-soon-badge"
    );

    let currentSettings = null;

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

            showToast(
                "We couldn't verify your login. Please sign in again."
            );

            window.setTimeout(() => {
                window.location.href = "../admin-login.html";
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
        button.addEventListener("click", logout);
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
         * The public homepage does not currently show a
         * description, so we leave this field locked for now.
         */
        if (heroDescription) {
            heroDescription.disabled = true;
        }

        if (saveSettingsButton) {
            saveSettingsButton.disabled = !ready;

            if (ready) {
                saveSettingsButton.classList.remove("disabled-button");
                saveSettingsButton.classList.add("primary-link-button");
                saveSettingsButton.textContent = "Save Homepage Changes";
            }
        }

        if (homepageBadge) {
            homepageBadge.textContent = ready
                ? "Ready to Edit"
                : "Loading...";
        }
    }

    /* LOAD HOMEPAGE SETTINGS */

    async function loadHomepageSettings() {
        setHomepageFormReady(false);

        try {
            const response = await fetch("/api/settings", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            });

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
        const kicker = heroKicker?.value.trim() || "";
        const title = heroTitle?.value.trim() || "";

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
        saveSettingsButton.textContent = "Saving...";

        try {
            const response = await fetch(
                "/api/admin/settings",
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        hero_kicker:
                            heroKicker.value.trim(),

                        hero_title:
                            heroTitle.value.trim(),

                        /*
                         * Keep the existing description because
                         * the public homepage isn't using it yet.
                         */
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
                homepageBadge.textContent = "Saved";
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
                "Something went wrong while saving. Your changes haven't been lost, so you can try again."
            );
        } finally {
            saveSettingsButton.disabled = false;
            saveSettingsButton.textContent =
                originalButtonText;
        }
    }

    if (saveSettingsButton) {
        saveSettingsButton.addEventListener(
            "click",
            saveHomepageSettings
        );
    }

    /* NAVIGATION */
    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navigationLinks.forEach((navLink) => {
                navLink.classList.remove("active");
            });
            link.classList.add("active");
        });
    });

    /* START */
    async function startDashboard() {
        const authenticated = await checkSession();
        if (!authenticated) {return;}
        await loadHomepageSettings();
    }

    startDashboard();
});