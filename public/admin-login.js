document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#admin-login-form");
    const usernameInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password");
    const passwordToggle = document.querySelector("#password-toggle");
    const status = document.querySelector("#admin-login-status");
    const submitButton = form?.querySelector(".admin-login-submit");

    /* MESSAGE */

    function showMessage(message, success = false) {
        if (!status) {
            return;
        }

        status.textContent = message;
        status.classList.toggle("success", success);
    }

    /* CHECK IF ALREADY SIGNED IN */

    async function checkExistingLogin() {
        try {
            const response = await fetch("/api/admin/session", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            if (data.authenticated) {
                window.location.href =
                    "/admin/admin-dashboard.html";
            }
        } catch (error) {
            console.warn(
                "Unable to check existing login:",
                error
            );
        }
    }

    /* SHOW OR HIDE PASSWORD */

    passwordToggle?.addEventListener("click", () => {
        const passwordIsVisible =
            passwordInput.type === "text";

        passwordInput.type =
            passwordIsVisible
                ? "password"
                : "text";

        passwordToggle.textContent =
            passwordIsVisible
                ? "Show"
                : "Hide";

        passwordToggle.setAttribute(
            "aria-label",
            passwordIsVisible
                ? "Show password"
                : "Hide password"
        );
    });

    /* SIGN IN */

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;

        showMessage("");

        if (!username) {
            showMessage(
                "Please enter your username."
            );

            usernameInput.focus();

            return;
        }

        if (!password) {
            showMessage(
                "Please enter your password."
            );

            passwordInput.focus();

            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Signing In...";

        usernameInput.disabled = true;
        passwordInput.disabled = true;
        passwordToggle.disabled = true;

        try {
            const response = await fetch(
                "/api/admin/login",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (response.status === 401) {
                showMessage(
                    "That username or password doesn't look right."
                );

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "We couldn't sign you in."
                );
            }

            showMessage(
                "You're signed in! Opening your Website Manager...",
                true
            );

            window.setTimeout(() => {
                window.location.href =
                    "/admin/admin-dashboard.html";
            }, 500);
        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            showMessage(
                "We couldn't sign you in right now. Please try again."
            );
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Sign In";
            usernameInput.disabled = false;
            passwordInput.disabled = false;
            passwordToggle.disabled = false;
        }
    });

    /* START */
    checkExistingLogin();
});