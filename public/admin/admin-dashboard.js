document.addEventListener("DOMContentLoaded", () => {
    const usernameElements = document.querySelectorAll(
        "[data-admin-username], [data-account-username]"
    );

    const avatar = document.querySelector("[data-user-avatar]");
    const logoutButtons = document.querySelectorAll("[data-logout]");
    const toast = document.querySelector("[data-admin-toast]");
    const navigationLinks = document.querySelectorAll(".admin-nav-link");

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
                return;
            }

            setUsername(data.username);
        } catch (error) {
            console.error("Session check failed:", error);

            showToast(
                "Your admin session could not be verified."
            );

            window.setTimeout(() => {
                window.location.href = "../admin-login.html";
            }, 1000);
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

            showToast(
                "Unable to log out. Please try again."
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

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navigationLinks.forEach((navLink) => {
                navLink.classList.remove("active");
            });

            link.classList.add("active");
        });
    });

    checkSession();
});
