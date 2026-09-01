"use strict";

document.addEventListener(
    "DOMContentLoaded",
    async () => {
          const body =
            document.body;

        const siteLogo =
            document.querySelector(
                ".site-logo"
            );

        const heroVideo =
            document.querySelector(
                "video#hero_video"
            );

        const worksPanel =
            document.getElementById(
                "panel_works"
            );

        const aboutPanel =
            document.getElementById(
                "panel_about"
            );

        const projectGrid =
            document.getElementById(
                "featured"
            );

            await loadSiteContent();

             const panels = {

            panel_works:
                worksPanel,

            panel_about:
                aboutPanel

        };

        const panelButtons =
            document.querySelectorAll(
                "[data-panel-open], [data-dialog-open]"
            );

        let lastTrigger =
            null;

            function getPanelTarget(
            button
        ) {

            if (
                button.dataset.panelOpen
            ) {
                return button.dataset.panelOpen;
            }

            if (
                button.dataset.dialogOpen ===
                "dialog_works"
            ) {
                return "panel_works";
            }

            if (
                button.dataset.dialogOpen ===
                "dialog_about"
            ) {
                return "panel_about";
            }
            return null;
        }

         function getPanelHash(
            panelId
        ) {
            if (
                panelId ===
                "panel_works"
            ) {
                return "#works";
            }

            if (
                panelId ===
                "panel_about"
            ) {
                return "#about";
            }
            return "";
        }

        function getPanelFromHash() {
            if (
                window.location.hash ===
                "#works"
            ) {
                return "panel_works";
            }

            if (
                window.location.hash ===
                "#about"
            ) {
                return "panel_about";
            }

            return null;
        }

        function updateButtons(
            panelId = null
        ) {
            panelButtons.forEach(
                button => {
                    const target =
                        getPanelTarget(
                            button
                        );

                    button.setAttribute(
                        "aria-expanded",
                        target === panelId
                            ? "true"
                            : "false"
                    );

                    if (target) {
                        button.setAttribute(
                            "aria-controls",
                            target
                        );
                    }
                }
            );
        }

        function hidePanels() {
            Object .values(panels) .forEach(
                    panel => {
                        if (!panel) {
                            return;
                        }
                        panel.hidden = true;
                        panel.setAttribute(
                            "aria-hidden",
                            "true"
                        );
                    }
                );
        }

        function focusPanel(
            panel
        ) {
            if (!panel) {
                return;
            }

            const titleId =
                panel.getAttribute(
                    "aria-labelledby"
                );

            let focusTarget =
                titleId
                    ? document.getElementById(
                        titleId
                    )
                    : null;

            if (!focusTarget) {
                focusTarget =
                    panel.querySelector(
                        "h1, h2, h3"
                    );
            }
            if (!focusTarget) {
                return;
            }

            focusTarget.setAttribute(
                "tabindex",
                "-1"
            );

            focusTarget.focus({
                preventScroll: true
            });
            panel.scrollTop = 0;
        }

         function openPanel(
            panelId,
            options = {}
        ) {
            const {
                updateHistory = true,
                focus = true
            } = options;

            const panel =
                panels[panelId];

            if (!panel) {
                return;
            }

            hidePanels();

            panel.hidden = false;
            panel.setAttribute(
                "aria-hidden",
                "false"
            );

            body.classList.add(
                "panel_open"
            );

            body.style.overflow =
                "hidden";

            updateButtons(
                panelId
            );

            if (updateHistory) {
                const hash =
                    getPanelHash(
                        panelId
                    );

                if (
                    hash &&
                    window.location.hash !==
                        hash
                ) {

                    history.pushState(
                        {
                            panel:
                                panelId
                        },
                        "",
                        hash
                    );
                }
            }

            if (focus) {
                requestAnimationFrame(
                    () => {
                        focusPanel(
                            panel
                        );
                    }
                );
            }
        }

         function closePanels(
            options = {}
        ) {
            const {
                restoreFocus = false
            } = options;

            hidePanels();
            body.classList.remove(
                "panel_open"
            );
            body.style.overflow =
                "";
            updateButtons();
            if (
                restoreFocus &&
                lastTrigger &&
                document.contains(
                    lastTrigger
                )
            ) {

                lastTrigger.focus();
            }
        }

         panelButtons.forEach(
            button => {
                const target =
                    getPanelTarget(
                        button
                    );

                if (!target) {
                    return;
                }

                button.setAttribute(
                    "aria-controls",
                    target
                );

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

                button.addEventListener(
                    "click",
                    () => {
                        lastTrigger =
                            button;
                        openPanel(
                            target
                        );

                    }
                );
            }
        );

         window.addEventListener(
            "popstate",
            () => {
                const panel =
                    getPanelFromHash();
                if (panel) {
                    openPanel(
                        panel,
                        {
                            updateHistory:
                                false,
                            focus:
                                true
                        }
                    );
                    return;
                }
                closePanels();
            }
        );

         const initialPanel =
            getPanelFromHash();
        if (initialPanel) {
            openPanel(
                initialPanel,
                {
                    updateHistory:
                        false,
                    focus:
                        false
                }
            );
        } else {
            hidePanels();
            updateButtons();
        }
         if (siteLogo) {
            siteLogo.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    closePanels();
                    history.pushState(
                        {},
                        "",
                        window.location.pathname
                    );
                }
            );
        }

         if (heroVideo) {
            const reduceMotion =
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                );

            function updateVideoPlayback() {
                if (
                    reduceMotion.matches
                ) {
                    heroVideo.pause();
                    return;
                }

                const promise =
                    heroVideo.play();

                if (
                    promise &&
                    typeof promise.catch ===
                        "function"
                ) {
                    promise.catch(
                        () => {}
                    );
                }
            }

            document.addEventListener(
                "visibilitychange",
                () => {
                    if (
                        document.hidden
                    ) {
                        heroVideo.pause();
                    } else {
                        updateVideoPlayback();
                    }
                }
            );

            reduceMotion
                .addEventListener?.(
                    "change",
                    updateVideoPlayback
                );
            updateVideoPlayback();

            async function loadSiteContent() {

            try {

                const response =
                    await fetch(
                        "/api/site",
                        {
                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        `Site API returned ${response.status}`
                    );
                }

                const data =
                    await response.json();

                if (data.settings) {

                    applySettings(
                        data.settings
                    );
                }

                if (
                    Array.isArray(
                        data.projects
                    )
                ) {
                    renderProjects(
                        data.projects
                    );
                }

            } catch (error) {
                console.error(
                    "Unable to load CMS content:",
                    error
                );
            }
        }

        function applySettings(
            settings
        ) {
            setText(
                '[data-cms="site-nav_works-label"]',
                settings.site_nav_works_label
            );

            setText(
                '[data-cms="site-nav_about-label"]',
                settings.site_nav_about_label
            );

            setText(
                '[data-cms="hero_tagline-top"]',
                settings.hero_tagline_top
            );

            setText(
                '[data-cms="hero_tagline-bottom"]',
                settings.hero_tagline_bottom
            );

            setText(
                '[data-cms="hero_works-label"]',
                settings.works_label
            );

            setText(
                '[data-cms="works_title"]',
                settings.works_title
            );

            setText(
                '[data-cms="works_intro"]',
                settings.works_intro
            );

            setText(
                '[data-cms="hero_about-label"]',
                settings.about_label
            );

            setText(
                '[data-cms="about_title"]',
                settings.about_title
            );


            /* About Photo */
            const aboutPhoto =
                document.getElementById(
                    "about_photo"
                );

            if (
                aboutPhoto &&
                settings.about_photo_url
            ) {
                aboutPhoto.src =
                    settings.about_photo_url;

                aboutPhoto.alt =
                    settings.about_photo_alt ||
                   "";
            }

            /* About Text */
            const aboutText =
                document.querySelector(
                    ".about_text"
                );

            if (
                aboutText &&
                settings.about_text
            ) {
                aboutText.replaceChildren();
                const paragraphs =
                    settings.about_text
                        .split(/\n\s*\n/)
                        .map(
                            paragraph =>
                                paragraph.trim()
                        )
                        .filter(Boolean);

                paragraphs.forEach(
                    paragraph => {
                        const p =
                            document.createElement(
                                "p"
                            );

                        p.textContent =
                            paragraph;

                        aboutText.appendChild(
                            p
                        );
                    }
                );
            }

            /* Hero Video */
            if (
                heroVideo &&
                settings.hero_video_url
            ) {
                const source =
                    heroVideo.querySelector(
                        "source"
                    );

                if (source) {
                    source.src =
                        settings.hero_video_url;
                    heroVideo.load();
                }
            }


            /* Footer */
            const footerBrand =
                document.querySelector(
                    '[data-cms="footer_brand"]'
                );

            if (footerBrand) {
                footerBrand.replaceChildren();

                footerBrand.append(
                    "© "
                );

                const yearSpan =
                    document.createElement(
                        "span"
                    );

                yearSpan.id =
                    "year";

                yearSpan.textContent =
                    new Date()
                        .getFullYear();

                footerBrand.appendChild(
                    yearSpan
                );

                footerBrand.append(
                    ` ${settings.footer_brand || "Maybelin Works"}`
                );
            }

            setText(
                '[data-cms="footer_credit"]',
                settings.footer_credit
            );
        }

        function setText(
            selector,
            value
        ) {
            if (
                typeof value !==
                "string"
            ) {
                return;
            }
            document
                .querySelectorAll(
                    selector
                )
                .forEach(
                    element => {
                        element.textContent =
                            value;
                    }
                );
        }
        
         function renderProjects(
            projects
        ) {
            if (!projectGrid) {
                return;
            }

            if (
                projects.length === 0
            ) {
                return;
            }

            projectGrid.replaceChildren();
            projects.forEach(
                project => {
                    projectGrid.appendChild(
                        createProjectCard(
                            project
                        )
                    );
                }
            );
        }

        function createProjectCard(
            project
        ) {
            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "project";

            const link =
                document.createElement(
                    "a"
                );

            link.className =
                "project_link";

            link.href =
                project.project_url ||
                `/work/${project.slug}/`;

            /* Cover */
            const image =
                document.createElement(
                    "img"
                );

            image.className =
                "project_cover";

            image.src =
                project.cover_url ||
                "";

            image.alt =
                project.cover_alt ||
                project.title ||
                "";

            image.loading =
                "lazy";

            /* Content */
            const content =
                document.createElement(
                    "div"
                );

            content.className =
                "project_content";

            /* Meta */
            const meta =
                document.createElement(
                    "div"
                );

            meta.className =
                "project_meta";

            const number =
                document.createElement(
                    "span"
                );

            number.textContent =
                `PROJECT ${String(
                    project.project_number
                ).padStart(2, "0")}`;

            const category =
                document.createElement(
                    "span"
                );

            category.textContent =
                project.category ||
                "";

            meta.append(
                number,
                category
            );

            /* Title */
            const title =
                document.createElement(
                    "h3"
                );

            title.className =
                "project_title";

            title.textContent =
                project.title ||
                "";

            /* Description */
            const description =
                document.createElement(
                    "p"
                );

            description.className =
                "project_desc";

            description.textContent =
                project.description ||
                "";

            /* Button */
            const button =
                document.createElement(
                    "span"
                );

            button.className =
                "project_button";

            button.textContent =
                "EXPLORE PROJECT";

            content.append(
                meta,
                title,
                description,
                button
            );

            link.append(
                image,
                content
            );

            article.appendChild(
                link
            );

            return article;
        }
    }
);


