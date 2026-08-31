/* Front Facing JS */
document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const siteLogo = document.querySelector(".site-logo");
    const hero = document.getElementById("hero");
    const heroVideo = document.querySelector("video#hero_video");
    const worksPanel = document.getElementById("panel_works");
    const aboutPanel = document.getElementById("panel_about");
    const year = document.getElementById("year");

    /* panels*/
    const panels = {
        panel_works: worksPanel,
        panel_about: aboutPanel
    };

    const panelButtons = document.querySelectorAll(
        "[data-panel-open], [data-dialog-open]"
    );

    let currentPanel = null;
    let lastTrigger = null;

    if (year) {year.textContent = new Date().getFullYear();}

    function getPanelTarget(button) {
        if (button.dataset.panelOpen) {return button.dataset.panelOpen;}
        if (button.dataset.dialogOpen === "dialog_works") {return "panel_works";}
        if (button.dataset.dialogOpen === "dialog_about") {return "panel_about";}
        return null;
    }

    function getPanelHash(panelId) {
        if (panelId === "panel_works") {return "#works";}
        if (panelId === "panel_about") {return "#about";}
        return "";
    }

    function getPanelFromHash() {
        if (window.location.hash === "#works") {return "panel_works";}
        if (window.location.hash === "#about") {return "panel_about";}
        return null;
    }

    function updateButtons(panelId = null) {
        panelButtons.forEach((button) => {
            const target = getPanelTarget(button);
            button.setAttribute("aria-expanded", target === panelId ? "true" : "false");
            if (target) {button.setAttribute("aria-controls", target);}
        });
    }

    function hidePanels() {
        Object.values(panels).forEach((panel) => {
            if (!panel) {return;}
            panel.hidden = true;
            panel.setAttribute("aria-hidden", "true");
        });
    }

     function focusPanel(panel) {
        if (!panel) {return;}
        const titleId = panel.getAttribute("aria-labelledby");
        let focusTarget = null;
        if (titleId) {focusTarget = document.getElementById(titleId);}
        if (!focusTarget) {focusTarget = panel.querySelector("h1, h2, h3");}
        if (!focusTarget) {return;}
        focusTarget.setAttribute("tabindex", "-1");
        focusTarget.focus({preventScroll: true});
        panel.scrollTop = 0;
    }

    function openPanel(panelId, options = {}) {
        const {updateHistory = true, focus = true} = options;
        const panel = panels[panelId];
        if (!panel) {return;}

        hidePanels();

        panel.hidden = false;
        panel.setAttribute("aria-hidden", "false");
        currentPanel = panelId;

        body.classList.add("panel_open");
        body.style.overflow = "hidden";

        updateButtons(panelId);

        if (updateHistory) {const hash = getPanelHash(panelId);
            if (hash && window.location.hash !== hash) {window.history.pushState({panel: panelId},"",hash);}}
        if (focus) {window.requestAnimationFrame(() => {focusPanel(panel);});}
    }

     function closePanels(options = {}) {
        const {restoreFocus = false} = options;
        hidePanels();
        currentPanel = null;
        body.classList.remove("panel_open");
        body.style.overflow = "";
        updateButtons();

        if (
            restoreFocus &&
            lastTrigger &&
            document.contains(lastTrigger)
        ) {lastTrigger.focus();}
    }

     panelButtons.forEach((button) => {
        const target = getPanelTarget(button);
        if (!target) {return;}
        button.setAttribute("aria-controls", target);
        button.setAttribute("aria-expanded", "false");
        button.addEventListener("click", () => {lastTrigger = button; openPanel(target);});
    });

    window.addEventListener("popstate", () => {
        const panelId = getPanelFromHash();
        if (panelId) {
            openPanel(panelId, {updateHistory: false, focus: true});
            return;}
        closePanels({restoreFocus: false});
        if (siteLogo) {window.requestAnimationFrame(() => {siteLogo.focus();});}
    });

     const initialPanel = getPanelFromHash();

    if (initialPanel) {
        openPanel(initialPanel, {updateHistory: false, focus: false});
    } else {
        hidePanels();
        updateButtons();
    }

      if (heroVideo) {
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


        function updateVideoPlayback() {
            if (reduceMotion.matches) {heroVideo.pause(); return;}

            const playPromise = heroVideo.play();
            if (playPromise !== undefined && typeof playPromise.catch === "function") {playPromise.catch(() => { });
            }
        }

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {heroVideo.pause();} 
            else {updateVideoPlayback(); }
        });

        if (typeof reduceMotion.addEventListener === "function") {
            reduceMotion.addEventListener("change",updateVideoPlayback);} 
            else if (typeof reduceMotion.addListener === "function") {
                reduceMotion.addListener(updateVideoPlayback);}

        updateVideoPlayback();
    }

    const projectLinks = document.querySelectorAll(
        ".project_link"
    );

    projectLinks.forEach((link) => {
        link.addEventListener("click", () => { });

    });

      if (siteLogo) {
        siteLogo.addEventListener("click", () => {
            closePanels({restoreFocus: false});
        });
    }
});



