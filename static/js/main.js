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

  try {
    const response = await fetch(
      "https://api.github.com/repos/Xaroq/xaroq-browser/releases/latest",
      {
        signal: controller.signal,
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API request failed with ${response.status}`);
    }

    const data = await response.json();
    latestVersionElement.textContent =
      data && data.tag_name ? data.tag_name.toUpperCase() : "v0.1.0-BETA";
  } catch (error) {
    console.error("Error fetching version:", error);
    latestVersionElement.textContent = "v0.1.0-BETA";
  } finally {
    window.clearTimeout(timeoutId);
  }
}

fetchLatestVersion();
