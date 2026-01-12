const toggleBtn = document.getElementById("theme-toggle");
const htmlElement = document.documentElement;

toggleBtn.addEventListener("click", () => {
  htmlElement.classList.toggle("dark");

  const isDark = htmlElement.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

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
  try {
    const response = await fetch(
      "https://api.github.com/repos/Xaroq/xaroq-browser/releases/latest"
    );
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    document.getElementById("latest-version").textContent =
      data.tag_name.toUpperCase();
  } catch (error) {
    console.error("Error fetching version:", error);
    document.getElementById("latest-version").textContent = "V1.0.0"; // Fallback
  }
}

fetchLatestVersion();
