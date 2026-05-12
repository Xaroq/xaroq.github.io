const toggleBtn = document.getElementById("theme-toggle");
const htmlElement = document.documentElement;
const latestVersionElement = document.getElementById("latest-version");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const siteShell = document.querySelector(".site-shell");
const heroPanel = document.querySelector(".hero-panel");
const releaseStrip = document.querySelector(".release-strip");

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    htmlElement.classList.toggle("dark");

    const isDark = htmlElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

if (
  localStorage.getItem("theme") === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  htmlElement.classList.add("dark");
} else {
  htmlElement.classList.remove("dark");
}

async function fetchLatestVersion() {
  if (!latestVersionElement) return;

  if (releaseStrip) {
    releaseStrip.classList.add("is-loading");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5000);

  const releaseSources = [
    {
      label: "macOS",
      fallback: "EDGE",
      url: "https://api.github.com/repos/Xaroq/xaroq-browser/releases/latest",
    },
  ];

  try {
    const results = await Promise.allSettled(
      releaseSources.map(async (source) => {
        const response = await fetch(source.url, {
          signal: controller.signal,
          headers: {
            Accept: "application/vnd.github+json",
          },
        });

        if (!response.ok) {
          throw new Error(`GitHub API request failed with ${response.status}`);
        }

        const data = await response.json();
        const version = data && data.tag_name ? data.tag_name.toUpperCase() : source.fallback;
        return `${source.label} ${version}`;
      })
    );
    const versions = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    latestVersionElement.textContent = versions.length
      ? versions.join(" | ")
      : "macOS EDGE";
    pulseReleaseStrip("is-live");
  } catch (error) {
    console.error("Error fetching version:", error);
    latestVersionElement.textContent = "macOS EDGE";
    pulseReleaseStrip("is-fallback");
  } finally {
    if (releaseStrip) {
      releaseStrip.classList.remove("is-loading");
    }
    window.clearTimeout(timeoutId);
  }
}

fetchLatestVersion();

function initPageTransitions() {
  if (!siteShell) return;

  if (reducedMotionQuery.matches) {
    document.body.classList.add("page-ready");
    return;
  }

  window.requestAnimationFrame(() => {
    document.body.classList.add("page-ready");
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      link.target === "_blank" ||
      link.hasAttribute("download") ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const url = new URL(link.href, window.location.href);
    const isHashOnly =
      url.origin === window.location.origin &&
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash;

    if (
      url.origin !== window.location.origin ||
      isHashOnly ||
      url.href === window.location.href
    ) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("is-page-leaving");

    window.setTimeout(() => {
      window.location.href = url.href;
    }, 240);
  });

  window.addEventListener("pageshow", () => {
    document.body.classList.remove("is-page-leaving");
    document.body.classList.add("page-ready");
  });
}

initPageTransitions();

function pulseReleaseStrip(stateClass) {
  if (!releaseStrip || reducedMotionQuery.matches) return;

  releaseStrip.classList.remove("is-live", "is-fallback", "is-pulsing");
  if (stateClass) {
    releaseStrip.classList.add(stateClass);
  }

  window.requestAnimationFrame(() => {
    releaseStrip.classList.add("is-pulsing");
  });

  window.setTimeout(() => {
    releaseStrip.classList.remove("is-pulsing");
  }, 1400);
}

function initHeroDepthMotion() {
  if (!heroPanel || reducedMotionQuery.matches) return;

  let animationFrameId = 0;

  const setHeroVars = (clientX, clientY) => {
    const rect = heroPanel.getBoundingClientRect();
    const relativeX = (clientX - rect.left) / rect.width;
    const relativeY = (clientY - rect.top) / rect.height;
    const clampedX = Math.max(0, Math.min(1, relativeX));
    const clampedY = Math.max(0, Math.min(1, relativeY));
    const centeredX = (clampedX - 0.5) * 2;
    const centeredY = (clampedY - 0.5) * 2;

    heroPanel.style.setProperty("--pointer-x", `${(clampedX * 100).toFixed(2)}%`);
    heroPanel.style.setProperty("--pointer-y", `${(clampedY * 100).toFixed(2)}%`);
    heroPanel.style.setProperty("--hero-tilt-x", `${(-centeredY * 5).toFixed(2)}deg`);
    heroPanel.style.setProperty("--hero-tilt-y", `${(centeredX * 7).toFixed(2)}deg`);
    heroPanel.style.setProperty("--hero-shift-x", `${(centeredX * 18).toFixed(2)}px`);
    heroPanel.style.setProperty("--hero-shift-y", `${(centeredY * 14).toFixed(2)}px`);
    heroPanel.style.setProperty("--hero-glow-opacity", `${(0.22 + Math.abs(centeredX) * 0.12).toFixed(2)}`);
  };

  const resetHeroVars = () => {
    heroPanel.style.setProperty("--pointer-x", "50%");
    heroPanel.style.setProperty("--pointer-y", "50%");
    heroPanel.style.setProperty("--hero-tilt-x", "0deg");
    heroPanel.style.setProperty("--hero-tilt-y", "0deg");
    heroPanel.style.setProperty("--hero-shift-x", "0px");
    heroPanel.style.setProperty("--hero-shift-y", "0px");
    heroPanel.style.setProperty("--hero-glow-opacity", "0.22");
  };

  const updateScrollProgress = () => {
    const rect = heroPanel.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const rawProgress = 1 - rect.top / Math.max(viewportHeight, 1);
    const clamped = Math.max(0, Math.min(1, rawProgress));
    heroPanel.style.setProperty("--hero-scroll-progress", clamped.toFixed(3));
    animationFrameId = 0;
  };

  resetHeroVars();
  updateScrollProgress();

  heroPanel.addEventListener("pointermove", (event) => {
    setHeroVars(event.clientX, event.clientY);
  });

  heroPanel.addEventListener("pointerleave", resetHeroVars);

  window.addEventListener(
    "scroll",
    () => {
      if (animationFrameId) return;
      animationFrameId = window.requestAnimationFrame(updateScrollProgress);
    },
    { passive: true }
  );

  window.addEventListener("resize", updateScrollProgress);
}

function initInteractiveCards() {
  const cards = document.querySelectorAll(
    ".interactive-card, .stat-card, .meta-card, .platform-card"
  );
  if (!cards.length || reducedMotionQuery.matches) return;

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const rotateY = ((offsetX / rect.width) - 0.5) * 8;
      const rotateX = (0.5 - (offsetY / rect.height)) * 6;

      card.style.setProperty("--spotlight-x", `${offsetX.toFixed(2)}px`);
      card.style.setProperty("--spotlight-y", `${offsetY.toFixed(2)}px`);
      card.style.setProperty("--card-rotate-x", `${rotateX.toFixed(2)}deg`);
      card.style.setProperty("--card-rotate-y", `${rotateY.toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--card-rotate-x");
      card.style.removeProperty("--card-rotate-y");
    });
  });
}

function initRevealAnimations() {
  const revealTargets = document.querySelectorAll(
    ".hero-panel, .content-section, .info-panel, .meta-card, .stat-card, .project-card, .platform-card, .legal-block"
  );

  if (!revealTargets.length) return;

  if (reducedMotionQuery.matches) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealTargets.forEach((element, index) => {
    element.classList.add("motion-reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index * 45, 280)}ms`);
    observer.observe(element);
  });
}

initRevealAnimations();
initHeroDepthMotion();
initInteractiveCards();
