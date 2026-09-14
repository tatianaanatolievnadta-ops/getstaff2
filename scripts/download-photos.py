#!/usr/bin/env python3
"""Скачать фото товаров WB в {nmId}/{n}.webp по списку из js/products.data.js."""

from __future__ import annotations

import concurrent.futures
import json
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_JS = ROOT / "js" / "products.data.js"
SELLER = 55354
MAX_PICS = 3
WORKERS = 8

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "image/webp,image/*,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9",
    "Referer": f"https://www.wildberries.ru/seller/{SELLER}",
}

CTX = ssl.create_default_context()
HOST_CACHE: dict[int, str] = {}

# Базовая таблица шардов (уточняется probing'ом при miss)
RANGES = [
    (143, 1), (287, 2), (431, 3), (719, 4), (1007, 5),
    (1061, 6), (1115, 7), (1169, 8), (1313, 9), (1601, 10),
    (1655, 11), (1919, 12), (2045, 13), (2189, 14), (2405, 15),
    (2621, 16), (2837, 17), (3053, 18), (3269, 19), (3485, 20),
    (3701, 21), (3917, 22), (4133, 23), (4349, 24), (4565, 25),
    (4877, 26), (5189, 27), (5501, 28), (5813, 29), (6125, 30),
    (6437, 31), (6749, 32), (7061, 33), (7373, 34), (7685, 35),
    (7997, 36), (8309, 37), (8621, 38), (8933, 39), (9245, 40),
    (9557, 41), (9869, 42), (10181, 43), (10493, 44), (10805, 45),
    (11117, 46), (11429, 47), (11741, 48), (12053, 49), (12365, 50),
]


def guess_host(vol: int) -> int:
    for max_vol, host in RANGES:
        if vol <= max_vol:
            return host
    return 50


def load_products() -> dict:
    text = DATA_JS.read_text(encoding="utf-8")
    m = re.search(r"const PRODUCTS_DATA\s*=\s*(\{.*\})\s*;?\s*$", text, re.S)
    if not m:
        raise SystemExit("Не удалось разобрать products.data.js")
    return json.loads(m.group(1))


def image_url(nm_id: int, n: int, host: int) -> str:
    vol = nm_id // 100000
    part = nm_id // 1000
    return (
        f"https://basket-{host:02d}.wbbasket.ru/"
        f"vol{vol}/part{part}/{nm_id}/images/big/{n}.webp"
    )


def fetch_bytes(url: str, timeout: float = 12) -> bytes | None:
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=CTX, timeout=timeout) as resp:
            data = resp.read()
            if len(data) < 500:
                return None
            return data
    except Exception:
        return None


def resolve_host(nm_id: int) -> int | None:
    vol = nm_id // 100000
    if vol in HOST_CACHE:
        return HOST_CACHE[vol]

    est = guess_host(vol)
    order: list[int] = []
    for delta in range(0, 20):
        for h in (est - delta, est + delta):
            if 1 <= h <= 60 and h not in order:
                order.append(h)
    for h in range(1, 61):
        if h not in order:
            order.append(h)

    for h in order:
        data = fetch_bytes(image_url(nm_id, 1, h), timeout=6)
        if data:
            HOST_CACHE[vol] = h
            return h
    return None


def download_one(product: dict) -> tuple[int, int, str]:
    """Returns (wbId, downloaded_count, status)."""
    nm_id = int(product["wbId"])
    pics = min(int(product.get("pics") or 1), MAX_PICS)
    dir_path = ROOT / str(nm_id)
    existing = sum(1 for n in range(1, pics + 1) if (dir_path / f"{n}.webp").exists())
    if existing >= pics:
        return nm_id, 0, "skip"

    host = resolve_host(nm_id)
    if host is None:
        return nm_id, 0, "nohost"

    got = 0
    for n in range(1, pics + 1):
        dest = dir_path / f"{n}.webp"
        if dest.exists():
            continue
        data = fetch_bytes(image_url(nm_id, n, host))
        if not data and n == 1:
            # host мог съехать — перепроверим
            HOST_CACHE.pop(nm_id // 100000, None)
            host = resolve_host(nm_id)
            if host is None:
                return nm_id, got, "fail"
            data = fetch_bytes(image_url(nm_id, n, host))
        if not data:
            break
        dir_path.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        got += 1
        time.sleep(0.05)
    return nm_id, got, "ok" if got or existing else "fail"


def rewrite_data(data: dict) -> None:
    for cat in data.get("categories") or []:
        wb = cat.get("wbId")
        if wb:
            cat["image"] = f"{wb}/1.webp"
    for p in data.get("products") or []:
        wb = p.get("wbId")
        pics = min(int(p.get("pics") or 1), MAX_PICS)
        images = []
        for n in range(1, pics + 1):
            rel = f"{wb}/{n}.webp"
            if (ROOT / rel).exists():
                images.append(rel)
        if not images:
            images = [f"{wb}/1.webp"]
        p["images"] = images
    data["syncedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    payload = json.dumps(
        {"categories": data["categories"], "products": data["products"], "syncedAt": data["syncedAt"]},
        ensure_ascii=False,
        separators=(",", ":"),
    )
    content = (
        f"/* AUTO-GENERATED by scripts/download-photos.py — {data['syncedAt']} */\n"
        f"/* Товаров: {len(data['products'])} | Продавец WB: {SELLER} */\n\n"
        f"const PRODUCTS_DATA = {payload};\n"
    )
    DATA_JS.write_text(content, encoding="utf-8")


def main() -> int:
    print(f"=== GETSTUFF photos from WB seller {SELLER} ===")
    print(f"Product list: {DATA_JS}")
    data = load_products()
    products = data.get("products") or []
    print(f"Products in catalog: {len(products)}")

    need = []
    have = 0
    for p in products:
        nm = int(p["wbId"])
        pics = min(int(p.get("pics") or 1), MAX_PICS)
        if all((ROOT / str(nm) / f"{n}.webp").exists() for n in range(1, pics + 1)):
            have += 1
        else:
            need.append(p)
    print(f"Already complete: {have}; need download: {len(need)}")

    downloaded = 0
    failed = []
    skipped = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = [ex.submit(download_one, p) for p in need]
        total = len(futs)
        for i, fut in enumerate(concurrent.futures.as_completed(futs), 1):
            nm_id, got, status = fut.result()
            if status == "skip":
                skipped += 1
            elif status in ("ok",) and got >= 0:
                downloaded += got
                if got == 0 and status == "ok":
                    skipped += 1
            if status in ("fail", "nohost"):
                failed.append(nm_id)
            if i % 20 == 0 or i == total:
                print(f"  progress {i}/{total}, new files: {downloaded}, fail: {len(failed)}, hosts cached: {len(HOST_CACHE)}")

    # Пересчёт покрытия
    with_img = sum(1 for p in products if (ROOT / str(p["wbId"]) / "1.webp").exists())
    rewrite_data(data)
    print(f"\nDone. New files: {downloaded}. With 1.webp: {with_img}/{len(products)}. Failed: {len(failed)}")
    if failed[:15]:
        print("Missing sample:", ", ".join(map(str, failed[:15])))
    print(f"Updated {DATA_JS.name}")
    return 0 if with_img > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
