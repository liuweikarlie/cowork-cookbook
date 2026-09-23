"""Compare built cookbook prompts, English goals/outputs, and workflows to a local source deck."""

import argparse
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET
import zipfile

PAIRS = {
    "executive-command-center": (8, 9),
    "customer-meeting-prep": (28, 29),
    "campaign-asset-production": (48, 49),
    "case-intake-brief": (68, 69),
    "close-variance-narrative": (88, 89),
}
NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
}


class SourceBlocks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.blocks = {}
        self.capture = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        key = "prompt" if attrs.get("id") == "prompt-source" else next(
            (name for name in ("data-source-goal", "data-source-output", "data-source-workflow") if name in attrs),
            None,
        )
        if key:
            self.capture = (tag, key, [])

    def handle_data(self, data):
        if self.capture:
            self.capture[2].append(data)

    def handle_endtag(self, tag):
        if self.capture and tag == self.capture[0]:
            _, key, text = self.capture
            self.blocks.setdefault(key, []).append("".join(text))
            self.capture = None


def shapes(archive, slide):
    root = ET.fromstring(archive.read(f"ppt/slides/slide{slide}.xml"))
    result = []
    for shape in root.findall(".//p:sp", NS):
        paragraphs = [
            "".join(run.text or "" for run in paragraph.findall(".//a:t", NS)).strip()
            for paragraph in shape.findall(".//a:p", NS)
        ]
        if any(paragraphs):
            result.append("\n".join(p for p in paragraphs if p))
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("deck", type=Path)
    args = parser.parse_args()
    dist = Path(__file__).resolve().parents[1] / "dist"
    errors = []
    with zipfile.ZipFile(args.deck) as archive:
        for recipe, (workflow_slide, prompt_slide) in PAIRS.items():
            source = shapes(archive, prompt_slide)
            prompt = source[source.index("Prompt") + 1]
            goal = next(s.removeprefix("Goal: ") for s in source if s.startswith("Goal: "))
            output = next(s.removeprefix("Output: ") for s in source if s.startswith("Output: "))
            workflow = [
                line for shape in shapes(archive, workflow_slide)
                for line in shape.splitlines() if "→" in line
            ]
            for locale in ("en", "zh-Hant", "zh-Hans"):
                page = SourceBlocks()
                page.feed((dist / locale / "recipes" / recipe / "index.html").read_text(encoding="utf-8"))
                expected = {"prompt": [prompt]}
                if locale == "en":
                    expected.update({
                        "data-source-goal": [goal],
                        "data-source-output": [output],
                        "data-source-workflow": workflow,
                    })
                for key, value in expected.items():
                    if page.blocks.get(key) != value:
                        errors.append(f"{locale}/{recipe}: {key} differs from source slide")
    if errors:
        raise SystemExit("\n".join(errors))
    print("Verified 15 original prompts and all five English goals, outputs, and workflow sequences against the source deck.")


if __name__ == "__main__":
    main()
