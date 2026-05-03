const toggleBtn = document.getElementById("theme-toggle");
const htmlElement = document.documentElement;
const latestVersionElement = document.getElementById("latest-version");

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
    {
      label: "Windows",
      fallback: "LATEST",
      url: "https://api.github.com/repos/Xaroq/xaroq-browser-win/releases/latest",
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
      : "macOS EDGE | Windows LATEST";
  } catch (error) {
    console.error("Error fetching version:", error);
    latestVersionElement.textContent = "macOS EDGE | Windows LATEST";
  } finally {
    window.clearTimeout(timeoutId);
  }
}

fetchLatestVersion();
