from pathlib import Path
from datetime import datetime, timezone
import json
import re

from playwright.sync_api import sync_playwright

URL = "https://www.change.org/putvotersovercorporatedonors"
OUT = Path("petition-change-org-live.png")
META = Path("petition-change-org-live.json")

TITLE_RE = re.compile(r"Put\s+VOTERS\s+Over\s+Corporate\s+Donors", re.I)
SIGNATURE_RE = re.compile(r"Verified signatures", re.I)


def dismiss_overlays(page):
    labels = [
        r"Accept all",
        r"Accept All",
        r"Accept",
        r"I agree",
        r"Reject all",
        r"Reject All",
        r"Close",
    ]
    for label in labels:
        try:
            page.get_by_role("button", name=re.compile(f"^{re.escape(label)}$", re.I)).first.click(timeout=700)
        except Exception:
            pass


def hero_clip(page, marker):
    marker.scroll_into_view_if_needed()
    page.wait_for_timeout(500)
    box = marker.evaluate(
        """el => {
          const minWidth = Math.min(1000, window.innerWidth * 0.72);
          let chosen = null;
          for (let node = el; node && node !== document.body; node = node.parentElement) {
            const r = node.getBoundingClientRect();
            if (r.width >= minWidth && r.height >= 420 && r.height <= 850) {
              chosen = {
                x: r.left + window.scrollX,
                y: r.top + window.scrollY,
                width: r.width,
                height: r.height
              };
            }
          }
          return chosen;
        }"""
    )
    if box:
        pad = 10
        page_width = page.evaluate("document.documentElement.scrollWidth")
        page_height = page.evaluate("document.documentElement.scrollHeight")
        x = max(0, box["x"] - pad)
        y = max(0, box["y"] - pad)
        width = min(page_width - x, box["width"] + pad * 2)
        height = min(page_height - y, box["height"] + pad * 2)
        return {"x": x, "y": y, "width": width, "height": height}

    scroll_y = page.evaluate("window.scrollY")
    return {"x": 0, "y": scroll_y, "width": 1440, "height": 820}


with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-dev-shm-usage", "--no-sandbox"],
    )
    context = browser.new_context(
        viewport={"width": 1440, "height": 900},
        device_scale_factor=1,
        locale="en-US",
        user_agent=(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/131.0.0.0 Safari/537.36"
        ),
    )
    page = context.new_page()
    page.add_init_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
    )
    page.goto(URL, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(4500)
    dismiss_overlays(page)

    body_text = page.locator("body").inner_text(timeout=30000)
    if not TITLE_RE.search(body_text):
        raise RuntimeError("Change.org petition title was not found; refusing to publish a bad preview.")
    if not SIGNATURE_RE.search(body_text):
        raise RuntimeError("Change.org signature card was not found; refusing to publish a bad preview.")

    markers = page.get_by_text(SIGNATURE_RE)
    marker = None
    for index in range(min(markers.count(), 100)):
        candidate = markers.nth(index)
        if candidate.is_visible():
            marker = candidate
            break
    if marker is None:
        raise RuntimeError("No visible Change.org signature card was found.")
    clip = hero_clip(page, marker)

    page.screenshot(
        path=str(OUT),
        type="png",
        clip=clip,
        animations="disabled",
    )

    if not OUT.exists() or OUT.stat().st_size < 50_000:
        raise RuntimeError("Generated petition preview is unexpectedly small.")

    count_match = re.search(r"([0-9][0-9,]*)\s*\n\s*Verified signatures", body_text, re.I)
    goal_match = re.search(r"get to\s+([0-9][0-9,]*)\s+signatures", body_text, re.I)
    metadata = {
        "source": URL,
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "count": int(count_match.group(1).replace(",", "")) if count_match else None,
        "goal": int(goal_match.group(1).replace(",", "")) if goal_match else None,
        "clip": clip,
    }
    META.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    browser.close()
