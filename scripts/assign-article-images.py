# -*- coding: utf-8 -*-
"""Assign unique real product photos to each article; fix category nav images."""
from pathlib import Path
import json
import re
import shutil

ROOT = Path(r"d:\Getstafff\getstaff2")
GEN = ROOT / "scripts" / "gen-articles.py"

# Unique real packshots (anatomically correct) — one per article slug
ARTICLE_IMAGES = {
    "kak-vybrat-samorezy-po-derevu": "211763002/1.webp",
    "samorezy-krovelnye-ral": "848081947/1.webp",
    "samorezy-po-metallu-ili-derevu": "868628984/1.webp",
    "zheltyj-cink-ili-chernyj-fosfat": "211763003/1.webp",
    "kak-otlichit-kachestvennyj-krepezh": "681021423/1.webp",
    "gvozdi-stroitelnye-razmery": "479499362/1.webp",
    "opt-krepezha-kogda-vygodno": "assets/brand/hero-wholesale.jpg",
    "samorezy-dlya-gipsokartona": "868628985/1.webp",
    "dlina-i-diametr-samoreza": "211763002/3.webp",
    "epdm-prokladka-krovelnyh": "848081945/1.webp",
    "rzhavchina-na-samorezah": "868628986/1.webp",
    "upakovka-krepezha-kg-ili-sht": "479499362/3.webp",
    "samorezy-dlya-osb-i-dsp": "211763002/2.webp",
    "krepezh-dlya-metallocherepicy": "848081946/1.webp",
    "shutupy-i-samorezy-raznica": "868628987/1.webp",
    "kak-rasschitat-kolichestvo-samorezov": "681021424/1.webp",
    "dostavka-krepezha-sajt-ili-marketplace": "assets/brand/banner-yandex.jpg",
    "oshibki-pri-vybore-krovelnyh": "681021425/1.webp",
    "samorezy-35-i-42": "868628988/1.webp",
    "chek-list-zakupki-krepezha": "assets/brand/logo-full.png",
}

# Prefer existing files; fallback pool from products.data.js
FALLBACK_POOL = []


def load_products():
    raw = (ROOT / "js" / "products.data.js").read_text(encoding="utf-8")
    raw = re.sub(r"/\*.*?\*/", "", raw, flags=re.S)
    raw = re.sub(r"^\s*//.*?$", "", raw, flags=re.M)
    raw = raw.replace("const PRODUCTS_DATA = ", "", 1).rstrip().rstrip(";")
    return json.loads(raw)


def exists(rel: str) -> bool:
    return (ROOT / rel.replace("/", "\\") if False else ROOT / rel).exists()


def main():
    data = load_products()
    pool = []
    for p in data.get("products", []):
        rel = f"{p['wbId']}/1.webp"
        if exists(rel):
            pool.append(rel)
        for n in (2, 3):
            reln = f"{p['wbId']}/{n}.webp"
            if exists(reln):
                pool.append(reln)

    used = set()
    final = {}
    pool_i = 0
    for slug, img in ARTICLE_IMAGES.items():
        if exists(img) and img not in used:
            final[slug] = img
            used.add(img)
            continue
        # pick next unused from pool
        while pool_i < len(pool):
            cand = pool[pool_i]
            pool_i += 1
            if cand not in used:
                final[slug] = cand
                used.add(cand)
                break
        else:
            # last resort brand assets
            for brand in [
                "assets/brand/hero-roof.jpg",
                "assets/brand/hero-wood.jpg",
                "assets/brand/cat-wood.jpg",
                "assets/brand/cat-roof.jpg",
                "assets/brand/hero-wholesale.jpg",
            ]:
                if brand not in used and exists(brand):
                    final[slug] = brand
                    used.add(brand)
                    break

    # ensure uniqueness report
    assert len(final) == len(set(final.values())), "duplicate images remain"
    print("Assigned", len(final), "unique images")
    for s, i in final.items():
        print(f"  {s}: {i}")

    # Patch gen-articles.py — replace CAT_IMAGES block with ARTICLE_IMAGES
    text = GEN.read_text(encoding="utf-8")
    block = "ARTICLE_IMAGES = {\n"
    for slug, img in final.items():
        block += f'  "{slug}": "{img}",\n'
    block += "}\n\n"
    # remove old CAT_IMAGES if present
    text2 = re.sub(
        r"CAT_IMAGES\s*=\s*\{.*?\}\n\n",
        "",
        text,
        count=1,
        flags=re.S,
    )
    if "ARTICLE_IMAGES" in text2:
        text2 = re.sub(
            r"ARTICLE_IMAGES\s*=\s*\{.*?\}\n\n",
            block,
            text2,
            count=1,
            flags=re.S,
        )
    else:
        text2 = text2.replace(
            'CSS_ROOT = "css/style.css?v=20261003seo"\n\n',
            'CSS_ROOT = "css/style.css?v=20261003seo"\n\n' + block,
            1,
        )

    # Fix card generation to use ARTICLE_IMAGES[slug]
    old_card = '''        img = CAT_IMAGES.get(a["category"], "assets/brand/hero-wholesale.jpg")
        cards.append(f"""
      <a class="article-card" href="articles/{a['slug']}.html">
        <div class="article-card__media"><img src="{img}" alt="" loading="lazy"></div>'''
    new_card = '''        img = ARTICLE_IMAGES.get(a["slug"], "assets/brand/hero-wholesale.jpg")
        cards.append(f"""
      <a class="article-card" href="articles/{a['slug']}.html">
        <div class="article-card__media"><img src="{img}" alt="" loading="lazy"></div>'''
    if "CAT_IMAGES.get" in text2:
        text2 = text2.replace(
            'img = CAT_IMAGES.get(a["category"], "assets/brand/hero-wholesale.jpg")',
            'img = ARTICLE_IMAGES.get(a["slug"], "assets/brand/hero-wholesale.jpg")',
        )
    elif "ARTICLE_IMAGES.get" not in text2:
        text2 = text2.replace(old_card, new_card)

    GEN.write_text(text2, encoding="utf-8")

    # Copy correct product shots over broken AI category images
    brand = ROOT / "assets" / "brand"
    copies = {
        "cat-metal.jpg": "868628984/1.webp",
        "cat-nails.jpg": "479499362/1.webp",
        "cat-coating.jpg": "211763002/1.webp",
    }
    for dest, src in copies.items():
        src_p = ROOT / src
        if src_p.exists():
            shutil.copy2(src_p, brand / dest)
            print("Copied", src, "->", dest)

    # Update homepage category nav in components.js to webp paths
    comp = ROOT / "js" / "components.js"
    ct = comp.read_text(encoding="utf-8")
    ct = ct.replace(
        "'metal-screws': 'assets/brand/cat-metal.jpg'",
        "'metal-screws': '868628984/1.webp'",
    )
    ct = ct.replace(
        "'nails': 'assets/brand/cat-nails.jpg'",
        "'nails': '479499362/1.webp'",
    )
    comp.write_text(ct, encoding="utf-8")
    print("Updated components.js category images")


if __name__ == "__main__":
    main()
