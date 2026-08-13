document.addEventListener("DOMContentLoaded", () => {
    console.log("site-config.js loaded!");

    const projectsDialog = document.querySelector("[data-projects-dialog]");
    const openProjectsButton = document.querySelector("[data-open-projects]");
    const closeProjectsButton = document.querySelector("[data-close-projects]");

    const aboutDialog = document.querySelector("[data-about-dialog]");
    const openAboutButton = document.querySelector("[data-open-about]");
    const closeAboutButton = document.querySelector("[data-close-about]");

    const currentYear = document.querySelector("[data-current-year]");

    console.log("Projects button:", openProjectsButton);
    console.log("Projects dialog:", projectsDialog);

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    if (openProjectsButton && projectsDialog) {
        openProjectsButton.addEventListener("click", () => {
            console.log("Read More clicked!");

            projectsDialog.showModal();
            document.body.classList.add("dialog-open");
        });
    }

    if (closeProjectsButton && projectsDialog) {
        closeProjectsButton.addEventListener("click", () => {
            projectsDialog.close();
            document.body.classList.remove("dialog-open");
        });
    }

    if (openAboutButton && aboutDialog) {
        openAboutButton.addEventListener("click", () => {
            aboutDialog.showModal();
            document.body.classList.add("dialog-open");
        });
    }

    if (closeAboutButton && aboutDialog) {
        closeAboutButton.addEventListener("click", () => {
            aboutDialog.close();
            document.body.classList.remove("dialog-open");
        });
    }

    projectsDialog?.addEventListener("close", () => {
        document.body.classList.remove("dialog-open");
    });

    aboutDialog?.addEventListener("close", () => {
        document.body.classList.remove("dialog-open");
    });
});
