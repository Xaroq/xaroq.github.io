const toggleBtn = document.getElementById("theme-toggle");
const htmlElement = document.documentElement;
const latestVersionElement = document.getElementById("latest-version");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const siteShell = document.querySelector(".site-shell");

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
  } catch (error) {
    console.error("Error fetching version:", error);
    latestVersionElement.textContent = "macOS EDGE";
  } finally {
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
