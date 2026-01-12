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
