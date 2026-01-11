import json
import shutil
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
import markdown

BASE = Path(__file__).parent
BUILD = BASE / "build"

# clean build folder
if BUILD.exists():
    shutil.rmtree(BUILD)
BUILD.mkdir()

# copy static files
shutil.copytree(BASE / "static", BUILD / "static")

# load content
site = json.load(open(BASE / "content/site.json"))
projects = json.load(open(BASE / "content/projects.json"))

about_md = open(BASE / "content/about.md").read()
about_html = markdown.markdown(about_md)

# jinja setup
env = Environment(loader=FileSystemLoader(BASE / "templates"))

def render(template, output, **context):
    html = env.get_template(template).render(**context)
    (BUILD / output).write_text(html, encoding="utf-8")

render("index.html", "index.html",
       site=site, projects=projects)

render("about.html", "about.html",
       site=site, about=about_html)

print("✔ Website built successfully")
