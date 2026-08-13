document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#admin-login-form");
    const usernameInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password");
    const passwordToggle = document.querySelector("#password-toggle");
    const status = document.querySelector("#admin-login-status");
    const submitButton = form?.querySelector(".admin-login-submit");

    passwordToggle?.addEventListener("click", () => {
        const passwordVisible = passwordInput.type === "text";

        passwordInput.type = passwordVisible ? "password" : "text";
        passwordToggle.textContent = passwordVisible ? "Show" : "Hide";

        passwordToggle.setAttribute(
            "aria-label",
            passwordVisible ? "Show password" : "Hide password"
        );
    });

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        status.textContent = "";
        status.classList.remove("success");

        submitButton.disabled = true;
        submitButton.textContent = "Signing In...";

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username: usernameInput.value.trim(),
                    password: passwordInput.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to sign in."
                );
            }

            status.textContent = "Login successful!";
            status.classList.add("success");

            window.location.href =
                "/admin/admin-dashboard.html";
        } catch (error) {
            console.error("Login error:", error);

            status.textContent =
                error.message || "Unable to sign in.";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Sign In";
        }
    });
});
