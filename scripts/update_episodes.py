"""Update data/episodes.json from the Owenverse YouTube Data API."""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen

CHANNEL_ID = "UC-y0fmq1aQ4HmtvLr60aJAw"
API_URL = "https://www.googleapis.com/youtube/v3/search"
DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "episodes.json"


def fetch_feed(api_key: str) -> bytes:
    query = f"{API_URL}?part=snippet&channelId={CHANNEL_ID}&order=date&type=video&maxResults=50&key={api_key}"
    request = Request(query, headers={"User-Agent": "Owenverse-Episode-Updater/1.0"})
    with urlopen(request, timeout=30) as response:
        return response.read()


def relative_date(published: str) -> str:
    published_at = datetime.fromisoformat(published.replace("Z", "+00:00"))
    elapsed = datetime.now(timezone.utc) - published_at
    days = elapsed.days

    if days < 1:
        hours = max(1, int(elapsed.total_seconds() // 3600))
        return "1 hour ago" if hours == 1 else f"{hours} hours ago"
    if days == 1:
        return "1 day ago"
    if days < 30:
        return f"{days} days ago"
    months = max(1, days // 30)
    return "1 month ago" if months == 1 else f"{months} months ago"


def video_id_from_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.hostname == "youtu.be":
        return parsed.path.strip("/")
    return parse_qs(parsed.query).get("v", [""])[0]


def clean_title(title: str) -> str:
    return re.sub(r"\s+", " ", title).strip()


def load_existing() -> dict[str, dict[str, str]]:
    if not DATA_PATH.exists():
        return {}

    with DATA_PATH.open("r", encoding="utf-8") as file:
        data = json.load(file)

    existing = {}
    for episode in data.get("episodes", []):
        video_id = video_id_from_url(episode.get("url", ""))
        if video_id:
            existing[video_id] = episode
    return existing


def parse_episodes(feed: bytes, existing: dict[str, dict[str, str]]) -> list[dict[str, str]]:
    data = json.loads(feed)
    episodes = []

    for item in data.get("items", []):
        snippet = item.get("snippet", {})
        video_id = item.get("id", {}).get("videoId", "")
        title = clean_title(snippet.get("title", ""))
        published = snippet.get("publishedAt", "")
        if not video_id or not title or not published:
            continue

        previous = existing.get(video_id, {})
        thumbnails = snippet.get("thumbnails", {})
        thumbnail = thumbnails.get("maxres", thumbnails.get("high", {})).get("url")
        episodes.append(
            {
                "title": title,
                "date": relative_date(published),
                "description": previous.get("description") or snippet.get("description", "") or "Watch the latest conversation from The Owenverse.",
                "thumbnail": thumbnail or f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",
                "url": f"https://www.youtube.com/watch?v={video_id}",
            }
        )

    return episodes


def write_data(episodes: list[dict[str, str]]) -> bool:
    new_data = {"episodes": episodes}
    current_data = None

    if DATA_PATH.exists():
        with DATA_PATH.open("r", encoding="utf-8") as file:
            current_data = json.load(file)

    if current_data == new_data:
        return False

    with DATA_PATH.open("w", encoding="utf-8", newline="\n") as file:
        json.dump(new_data, file, ensure_ascii=False, indent=2)
        file.write("\n")
    return True


def main() -> int:
    try:
        api_key = os.environ.get("YOUTUBE_API_KEY")
        if not api_key:
            raise RuntimeError("YOUTUBE_API_KEY is not set.")
        existing = load_existing()
        episodes = parse_episodes(fetch_feed(api_key), existing)
        if not episodes:
            raise RuntimeError("The YouTube API returned no episodes.")
        changed = write_data(episodes)
        print(f"Found {len(episodes)} episodes. {'Updated' if changed else 'No changes needed'} data/episodes.json.")
        return 0
    except (OSError, ValueError, RuntimeError) as error:
        print(f"Episode update failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
