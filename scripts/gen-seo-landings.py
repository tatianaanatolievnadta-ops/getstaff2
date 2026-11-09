# -*- coding: utf-8 -*-
"""Generate RAL landings, city GEO pages, calculator, hubs; refresh sitemap + llms.txt."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://gstmetiz.shop"
CSS = "../css/style.css?v=20261109seo2"
CSS_ROOT = "css/style.css?v=20261109seo2"
TODAY = "2026-11-09"

RAL_COLORS = [
    {
        "code": "8017",
        "slug": "ral-8017",
        "name": "RAL 8017",
        "color_name": "коричневый шоколад",
        "hex": "#442F29",
        "desc": "Самый ходовой цвет кровельных саморезов под металлочерепицу и профлист «шоколад».",
    },
    {
        "code": "6005",
        "slug": "ral-6005",
        "name": "RAL 6005",
        "color_name": "зелёный мох",
        "hex": "#0F4336",
        "desc": "Классика для зелёной кровли и заборов из профнастила.",
    },
    {
        "code": "3005",
        "slug": "ral-3005",
        "name": "RAL 3005",
        "color_name": "красное вино",
        "hex": "#5E2028",
        "desc": "Красно-бордовый оттенок для кровли и ограждений в тон листу.",
    },
    {
        "code": "7024",
        "slug": "ral-7024",
        "name": "RAL 7024",
        "color_name": "графитовый серый",
        "hex": "#474A50",
        "desc": "Графит — частый выбор для современной кровли и заборов.",
    },
]

CITIES = [
    {
        "slug": "moskva",
        "name": "Москва",
        "prep": "в Москву",
        "gen": "Москвы",
        "days": "2–4 рабочих дня",
        "rate_from": 199,
        "note": "Доставка через логистику Ozon до ПВЗ или курьером. Итоговый способ согласует менеджер.",
    },
    {
        "slug": "sankt-peterburg",
        "name": "Санкт-Петербург",
        "prep": "в Санкт-Петербург",
        "gen": "Санкт-Петербурга",
        "days": "1–2 рабочих дня",
        "rate_from": 149,
        "note": "Приоритетная зона. Бесплатная доставка при заказе от 50 000 шт.",
    },
    {
        "slug": "krasnodar",
        "name": "Краснодар",
        "prep": "в Краснодар",
        "gen": "Краснодара",
        "days": "1–2 рабочих дня",
        "rate_from": 149,
        "note": "Приоритетная зона (Краснодарский край) — отправка со склада в регионе.",
    },
    {
        "slug": "ekaterinburg",
        "name": "Екатеринбург",
        "prep": "в Екатеринбург",
        "gen": "Екатеринбурга",
        "days": "2–4 рабочих дня",
        "rate_from": 299,
        "note": "Доставка Ozon по крупным городам. Способ и адрес согласуем с менеджером.",
    },
    {
        "slug": "novosibirsk",
        "name": "Новосибирск",
        "prep": "в Новосибирск",
        "gen": "Новосибирска",
        "days": "2–4 рабочих дня",
        "rate_from": 299,
        "note": "Отправка заказов с сайта обычно 1 раз в неделю (по пятницам).",
    },
    {
        "slug": "kazan",
        "name": "Казань",
        "prep": "в Казань",
        "gen": "Казани",
        "days": "2–4 рабочих дня",
        "rate_from": 299,
        "note": "Доставка до пункта выдачи Ozon или курьером по согласованию.",
    },
    {
        "slug": "nizhniy-novgorod",
        "name": "Нижний Новгород",
        "prep": "в Нижний Новгород",
        "gen": "Нижнего Новгорода",
        "days": "2–4 рабочих дня",
        "rate_from": 299,
        "note": "Для срочных мелких заказов можно взять на Wildberries; партия — выгоднее с сайта.",
    },
    {
        "slug": "rostov-na-donu",
        "name": "Ростов-на-Дону",
        "prep": "в Ростов-на-Дону",
        "gen": "Ростова-на-Дону",
        "days": "2–4 рабочих дня",
        "rate_from": 299,
        "note": "Ориентировочная стоимость доставки — от тарифа крупного города; точную сумму подтвердит менеджер.",
    },
    {
        "slug": "sochi",
        "name": "Сочи",
        "prep": "в Сочи",
        "gen": "Сочи",
        "days": "1–3 рабочих дня",
        "rate_from": 149,
        "note": "Краснодарский край — приоритетная зона GETSTUFF.",
    },
    {
        "slug": "chelyabinsk",
        "name": "Челябинск",
        "prep": "в Челябинск",
        "gen": "Челябинска",
        "days": "2–4 рабочих дня",
        "rate_from": 299,
        "note": "Опт от 20 000 ₽ и крупный опт от 100 000 шт. — с ценой ниже Wildberries.",
    },
]


def load_products() -> list[dict]:
    text = (ROOT / "js" / "products.data.js").read_text(encoding="utf-8")
    m = re.search(r"PRODUCTS_DATA\s*=\s*(\{.*\})\s*;?\s*\Z", text, re.S)
    if not m:
        raise RuntimeError("PRODUCTS_DATA not found")
    data = json.loads(m.group(1))
    return data.get("products", [])


def products_for_ral(products: list[dict], code: str) -> list[dict]:
    return [p for p in products if code in p.get("name", "") and p.get("category") == "roof-screws"]


def shell(title, description, keywords, canonical, og_image, prefix, css, h1, crumb_extra, content, json_ld=""):
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="keywords" content="{keywords}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="{canonical}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="{og_image}">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:site_name" content="GETSTUFF">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="{prefix}assets/brand/logo-mark.png">
  <link rel="apple-touch-icon" href="{prefix}assets/brand/logo-mark.png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{css}">
  {json_ld}
</head>
<body>
  <div class="page-header">
    <h1 class="page-header__title">{h1}</h1>
    <div class="page-header__breadcrumb">
      <a href="{prefix}index.html">Главная</a> / {crumb_extra}
    </div>
  </div>
  {content}
  <script src="{prefix}js/products.data.js"></script>
  <script src="{prefix}js/data.js"></script>
  <script src="{prefix}js/config.js"></script>
  <script src="{prefix}js/wholesale.js"></script>
  <script src="{prefix}js/app.js"></script>
  <script src="{prefix}js/components.js"></script>
  <script>renderLayout();</script>
</body>
</html>
"""


def faq_ld(items: list[dict]) -> str:
    data = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": i["q"],
                "acceptedAnswer": {"@type": "Answer", "text": i["a"]},
            }
            for i in items
        ],
    }
    return f'<script type="application/ld+json">\n{json.dumps(data, ensure_ascii=False)}\n</script>'


def write_ral_pages(products: list[dict]) -> list[str]:
    out_dir = ROOT / "ral"
    out_dir.mkdir(exist_ok=True)
    urls = []

    cards = []
    for ral in RAL_COLORS:
        items = products_for_ral(products, ral["code"])
        product_cards = []
        for p in items[:12]:
            img = f"{p.get('wbId') or p['id']}/1.webp"
            product_cards.append(
                f"""
        <a class="seo-product-card" href="../product.html?id={p['id']}">
          <img src="../{img}" alt="{p['name']}" loading="lazy">
          <div class="seo-product-card__body">
            <div class="seo-product-card__name">{p['name']}</div>
            <div class="seo-product-card__price">от {p.get('price', '—')} ₽</div>
          </div>
        </a>"""
            )

        faq = [
            {
                "q": f"Какие саморезы RAL {ral['code']} бывают у GETSTUFF?",
                "a": f"Оцинкованные кровельные саморезы с EPDM в цвете {ral['name']} ({ral['color_name']}), разные длины и фасовки.",
            },
            {
                "q": f"Почему важен цвет {ral['name']}?",
                "a": "Головка в тон листу не «светится» на скате и заборе, кровля выглядит цельно.",
            },
            {
                "q": "Как купить оптом?",
                "a": "Оформите заявку на сайте. Опт от 20 000 ₽, крупный опт от 100 000 шт. Цена на сайте ниже Wildberries.",
            },
        ]

        content = f"""
  <div class="container seo-landing">
    <div class="seo-ral-hero" style="--ral:{ral['hex']}">
      <div class="seo-ral-swatch" aria-hidden="true"></div>
      <p class="seo-lead">{ral['desc']} Купить {ral['name']} саморезы GETSTUFF — на сайте со скидкой к WB, опт и доставка по России.</p>
    </div>
    <div class="seo-actions">
      <a class="btn btn--primary" href="../catalog.html?cat=roof-screws&q=RAL{ral['code']}">В каталог RAL {ral['code']}</a>
      <a class="btn btn--outline" href="../checkout.html">Оставить заявку</a>
      <a class="btn btn--outline" href="../calc/rashod-samorezov.html">Калькулятор расхода</a>
    </div>
    <h2>Позиции {ral['name']} в наличии</h2>
    <div class="seo-product-grid">{''.join(product_cards) or '<p>Смотрите все кровельные в каталоге.</p>'}
    </div>
    <h2>Что учесть при выборе</h2>
    <ul>
      <li>длина под толщину листа + обрешётки;</li>
      <li>обязательная EPDM-прокладка для кровли;</li>
      <li>сверло — если основание металл;</li>
      <li>запас 5–10% к сметному количеству.</li>
    </ul>
    <h2>Частые вопросы</h2>
    <div class="article-faq">
      {''.join(f"<details><summary>{i['q']}</summary><p>{i['a']}</p></details>" for i in faq)}
    </div>
    <p class="seo-more">Ещё цвета: {' · '.join(f"<a href='{x['slug']}.html'>{x['name']}</a>" for x in RAL_COLORS if x['code'] != ral['code'])}</p>
  </div>"""

        html = shell(
            title=f"Саморезы кровельные {ral['name']} ({ral['color_name']}) купить — GETSTUFF",
            description=f"Купить саморезы {ral['name']} {ral['color_name']} с EPDM. Цена на сайте ниже WB, опт от 20 000 ₽, доставка по России.",
            keywords=f"саморезы {ral['name']}, саморезы {ral['color_name']}, кровельные саморезы {ral['code']}",
            canonical=f"{SITE}/ral/{ral['slug']}.html",
            og_image=f"{SITE}/assets/brand/hero-roof.jpg",
            prefix="../",
            css=CSS,
            h1=f"Саморезы {ral['name']} — {ral['color_name']}",
            crumb_extra=f"<a href=\"index.html\">Цвета RAL</a> / <span>{ral['name']}</span>",
            content=content,
            json_ld=faq_ld(faq),
        )
        (out_dir / f"{ral['slug']}.html").write_text(html, encoding="utf-8")
        urls.append(f"ral/{ral['slug']}.html")
        cards.append(
            f"<a class='seo-hub-card' href='{ral['slug']}.html'><span class='seo-hub-swatch' style='background:{ral['hex']}'></span><strong>{ral['name']}</strong><span>{ral['color_name']}</span></a>"
        )

    hub = shell(
        title="Кровельные саморезы по цветам RAL — GETSTUFF",
        description="Каталог посадочных страниц по RAL: 8017, 6005, 3005, 7024. Подбор кровельных саморезов GETSTUFF под цвет листа.",
        keywords="саморезы RAL, RAL 8017, RAL 6005, RAL 3005, RAL 7024",
        canonical=f"{SITE}/ral/",
        og_image=f"{SITE}/assets/brand/hero-roof.jpg",
        prefix="../",
        css=CSS,
        h1="Саморезы по цветам RAL",
        crumb_extra="<span>Цвета RAL</span>",
        content=f"""
  <div class="container seo-landing">
    <p class="seo-lead">Выберите цвет головки под металлочерепицу или профлист — и перейдите к позициям GETSTUFF.</p>
    <div class="seo-hub-grid">{''.join(cards)}</div>
    <div class="seo-actions" style="margin-top:24px">
      <a class="btn btn--primary" href="../catalog.html?cat=roof-screws">Весь кровельный крепёж</a>
      <a class="btn btn--outline" href="../articles/samorezy-krovelnye-ral.html">Что такое RAL и EPDM</a>
    </div>
  </div>""",
    )
    (out_dir / "index.html").write_text(hub, encoding="utf-8")
    urls.append("ral/")
    return urls


def write_city_pages() -> list[str]:
    out_dir = ROOT / "delivery"
    out_dir.mkdir(exist_ok=True)
    urls = []
    hub_cards = []

    for city in CITIES:
        faq = [
            {
                "q": f"Как купить саморезы с доставкой {city['prep']}?",
                "a": "Оставьте заявку на сайте GETSTUFF. Менеджер подтвердит наличие, сумму и способ доставки через Ozon.",
            },
            {
                "q": f"Сколько идет доставка {city['prep']}?",
                "a": f"Ориентир: {city['days']}. Отправка заказов с сайта обычно 1 раз в неделю (по пятницам).",
            },
            {
                "q": "Можно ли взять срочно?",
                "a": "Для срочных мелких заказов удобен Wildberries. Партия и опт — выгоднее с сайта.",
            },
        ]
        content = f"""
  <div class="container seo-landing">
    <p class="seo-lead">Саморезы кровельные, по дереву и металлу, гвозди GETSTUFF с доставкой {city['prep']}. На сайте цена ниже Wildberries; опт от 20 000 ₽.</p>
    <div class="seo-geo-box">
      <div><strong>Срок:</strong> {city['days']}</div>
      <div><strong>Доставка от:</strong> {city['rate_from']} ₽</div>
      <div><strong>Логистика:</strong> Ozon (ПВЗ / курьер)</div>
    </div>
    <p>{city['note']}</p>
    <div class="seo-actions">
      <a class="btn btn--primary" href="../checkout.html">Заявка с доставкой {city['prep']}</a>
      <a class="btn btn--outline" href="../catalog.html">Каталог</a>
      <a class="btn btn--outline" href="../wholesale.html">Опт</a>
    </div>
    <h2>Что чаще заказывают {city['prep']}</h2>
    <ul>
      <li>кровельные саморезы RAL 8017 / 6005 / 7024 с EPDM;</li>
      <li>саморезы по дереву 3,5 и 4,2 мм;</li>
      <li>крепёж для забора из профнастила;</li>
      <li>гвозди строительные килограммами и коробками.</li>
    </ul>
    <h2>Частые вопросы</h2>
    <div class="article-faq">
      {''.join(f"<details><summary>{i['q']}</summary><p>{i['a']}</p></details>" for i in faq)}
    </div>
    <p><a href="../calc/rashod-samorezov.html">Калькулятор расхода саморезов →</a> · <a href="../ral/">Цвета RAL →</a></p>
  </div>"""

        html = shell(
            title=f"Купить саморезы с доставкой {city['prep']} — GETSTUFF",
            description=f"Саморезы и крепёж GETSTUFF с доставкой {city['prep']}. Срок {city['days']}, цена сайта ниже WB, опт от 20 000 ₽.",
            keywords=f"саморезы купить {city['name']}, крепёж доставка {city['name']}, саморезы оптом {city['name']}",
            canonical=f"{SITE}/delivery/{city['slug']}.html",
            og_image=f"{SITE}/assets/brand/hero-roof.jpg",
            prefix="../",
            css=CSS,
            h1=f"Саморезы с доставкой {city['prep']}",
            crumb_extra=f"<a href=\"index.html\">Доставка</a> / <span>{city['name']}</span>",
            content=content,
            json_ld=faq_ld(faq)
            + "\n"
            + '<script type="application/ld+json">\n'
            + json.dumps(
                {
                    "@context": "https://schema.org",
                    "@type": "Service",
                    "name": f"Доставка крепежа GETSTUFF {city['prep']}",
                    "provider": {"@type": "Organization", "name": "GETSTUFF", "url": SITE + "/"},
                    "areaServed": {"@type": "City", "name": city["name"]},
                    "serviceType": "Delivery",
                },
                ensure_ascii=False,
            )
            + "\n</script>",
        )
        (out_dir / f"{city['slug']}.html").write_text(html, encoding="utf-8")
        urls.append(f"delivery/{city['slug']}.html")
        hub_cards.append(f"<a class='seo-hub-card' href='{city['slug']}.html'><strong>{city['name']}</strong><span>от {city['rate_from']} ₽ · {city['days']}</span></a>")

    hub = shell(
        title="Доставка саморезов и крепежа по городам России — GETSTUFF",
        description="Доставка GETSTUFF через Ozon: Москва, СПб, Краснодар, Екатеринбург и другие города. Опт и розница со скидкой к WB.",
        keywords="доставка саморезов, купить крепёж с доставкой, GETSTUFF города",
        canonical=f"{SITE}/delivery/",
        og_image=f"{SITE}/assets/brand/hero-roof.jpg",
        prefix="../",
        css=CSS,
        h1="Доставка по городам",
        crumb_extra="<span>Доставка</span>",
        content=f"""
  <div class="container seo-landing">
    <p class="seo-lead">Выберите город — откроется страница с сроками, тарифом и заявкой на крепёж GETSTUFF.</p>
    <div class="seo-hub-grid">{''.join(hub_cards)}</div>
    <p style="margin-top:20px">Отправка заказов с сайта — обычно 1 раз в неделю (по пятницам). Подробности: <a href="../docs.html#delivery">документы и доставка</a>.</p>
  </div>""",
    )
    (out_dir / "index.html").write_text(hub, encoding="utf-8")
    urls.append("delivery/")
    return urls


def write_calculator() -> str:
    out_dir = ROOT / "calc"
    out_dir.mkdir(exist_ok=True)
    content = """
  <div class="container seo-landing">
    <p class="seo-lead">Посчитайте ориентировочный расход саморезов на профнастил: кровля, забор или фасад. Добавьте запас и перейдите в каталог GETSTUFF.</p>
    <form class="calc-box" id="screw-calc" onsubmit="return false">
      <label>Тип работ
        <select id="calc-type">
          <option value="roof">Кровля (8–10 шт/м²)</option>
          <option value="fence">Забор (5–8 шт/м²)</option>
          <option value="facade">Фасад (7–9 шт/м²)</option>
        </select>
      </label>
      <label>Площадь, м²
        <input type="number" id="calc-area" min="1" step="0.1" value="50">
      </label>
      <label>Запас, %
        <input type="number" id="calc-reserve" min="0" max="30" value="10">
      </label>
      <label class="calc-optional">Или: листов × лаг × шт на лагу
        <div class="calc-row">
          <input type="number" id="calc-sheets" min="0" placeholder="листов">
          <input type="number" id="calc-lags" min="0" placeholder="лаг">
          <input type="number" id="calc-per-lag" min="0" placeholder="шт/лагу" value="3">
        </div>
      </label>
      <button type="button" class="btn btn--primary" id="calc-run">Рассчитать</button>
    </form>
    <div class="calc-result" id="calc-result" hidden></div>
    <div class="seo-actions">
      <a class="btn btn--primary" href="../catalog.html?cat=roof-screws">Кровельные саморезы</a>
      <a class="btn btn--outline" href="../ral/">По цвету RAL</a>
      <a class="btn btn--outline" href="../checkout.html">Заявка менеджеру</a>
    </div>
    <p><a href="../articles/rashod-samorezov-profnastil-m2.html">Подробная статья про расход на 1 м² →</a></p>
  </div>
  <script>
  (function(){
    const rates = { roof: 9, fence: 6.5, facade: 8 };
    function run(){
      const type = document.getElementById('calc-type').value;
      const area = parseFloat(document.getElementById('calc-area').value) || 0;
      const reserve = (parseFloat(document.getElementById('calc-reserve').value) || 0) / 100;
      const sheets = parseFloat(document.getElementById('calc-sheets').value) || 0;
      const lags = parseFloat(document.getElementById('calc-lags').value) || 0;
      const perLag = parseFloat(document.getElementById('calc-per-lag').value) || 0;
      let base = 0, method = '';
      if (sheets > 0 && lags > 0 && perLag > 0) {
        base = sheets * lags * perLag;
        method = 'по листам и лагам';
      } else {
        base = area * rates[type];
        method = 'по площади';
      }
      const total = Math.ceil(base * (1 + reserve));
      const boxes500 = Math.ceil(total / 500);
      const el = document.getElementById('calc-result');
      el.hidden = false;
      el.innerHTML = '<strong>Нужно примерно ' + total.toLocaleString('ru-RU') + ' шт.</strong>' +
        '<div>База: ' + Math.ceil(base).toLocaleString('ru-RU') + ' (' + method + '), запас учтён.</div>' +
        '<div>Ориентир упаковок по 500 шт: ' + boxes500 + '</div>';
    }
    document.getElementById('calc-run').addEventListener('click', run);
  })();
  </script>
"""
    faq = [
        {"q": "Насколько точен калькулятор?", "a": "Это смета-ориентир. На сложных кровлях и в ветреных регионах расход выше — закладывайте верхнюю границу нормы."},
        {"q": "Как заказать посчитанное количество?", "a": "Округлите до фасовки коробки и оставьте заявку на сайте или выберите позиции в каталоге."},
    ]
    html = shell(
        title="Калькулятор расхода саморезов на профнастил — GETSTUFF",
        description="Онлайн-расчёт саморезов на кровлю, забор и фасад из профнастила. Нормы на м², запас, переход в каталог GETSTUFF.",
        keywords="калькулятор саморезов, расход саморезов на профнастил, сколько саморезов на м2",
        canonical=f"{SITE}/calc/rashod-samorezov.html",
        og_image=f"{SITE}/assets/brand/hero-roof.jpg",
        prefix="../",
        css=CSS,
        h1="Калькулятор расхода саморезов",
        crumb_extra="<span>Калькулятор</span>",
        content=content,
        json_ld=faq_ld(faq),
    )
    # inject FAQ visually before actions end — already in article style below result via link
    (out_dir / "rashod-samorezov.html").write_text(html, encoding="utf-8")
    return "calc/rashod-samorezov.html"


def collect_article_urls() -> list[str]:
    arts = sorted((ROOT / "articles").glob("*.html"))
    return [f"articles/{p.name}" for p in arts]


def write_sitemap(extra: list[str]) -> None:
    static = [
        ("", "1.0", "daily"),
        ("articles.html", "0.9", "daily"),
        ("catalog.html", "0.9", "daily"),
        ("wholesale.html", "0.8", "weekly"),
        ("docs.html", "0.7", "monthly"),
        ("ral/", "0.85", "weekly"),
        ("delivery/", "0.85", "weekly"),
        ("calc/rashod-samorezov.html", "0.85", "weekly"),
    ]
    sm = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    seen = set()
    for path, prio, freq in static:
        loc = f"{SITE}/{path}" if path else f"{SITE}/"
        if loc in seen:
            continue
        seen.add(loc)
        sm.append(
            f"  <url><loc>{loc}</loc><lastmod>{TODAY}</lastmod>"
            f"<changefreq>{freq}</changefreq><priority>{prio}</priority></url>"
        )
    for path in extra:
        loc = f"{SITE}/{path}"
        if loc in seen:
            continue
        seen.add(loc)
        prio = "0.8" if path.startswith("articles/") else "0.75"
        sm.append(
            f"  <url><loc>{loc}</loc><lastmod>{TODAY}</lastmod>"
            f"<changefreq>monthly</changefreq><priority>{prio}</priority></url>"
        )
    sm.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sm) + "\n", encoding="utf-8")


def write_llms(extra_notes: list[str]) -> None:
    lines = [
        "# GETSTUFF",
        "",
        "> Российский бренд строительного крепежа: саморезы кровельные RAL с EPDM,",
        "> саморезы по дереву и металлу, гвозди. Сайт gstmetiz.shop — розница со скидкой к Wildberries,",
        "> опт от 20 000 ₽, крупный опт от 100 000 шт. Доставка через Ozon по России,",
        "> отправка обычно 1 раз в неделю. Тел. +7 (911) 910-33-44, email gstmetiz@yandex.ru.",
        "",
        "## Главные страницы",
        f"- [Главная]({SITE}/)",
        f"- [Каталог]({SITE}/catalog.html)",
        f"- [Опт]({SITE}/wholesale.html)",
        f"- [Статьи]({SITE}/articles.html)",
        f"- [Цвета RAL]({SITE}/ral/)",
        f"- [Доставка по городам]({SITE}/delivery/)",
        f"- [Калькулятор расхода]({SITE}/calc/rashod-samorezov.html)",
        "",
        "## RAL",
    ]
    for r in RAL_COLORS:
        lines.append(f"- [{r['name']} {r['color_name']}]({SITE}/ral/{r['slug']}.html)")
    lines += ["", "## Города"]
    for c in CITIES:
        lines.append(f"- [Доставка {c['prep']}]({SITE}/delivery/{c['slug']}.html)")
    lines += ["", "## Статьи"]
    for path in collect_article_urls():
        lines.append(f"- [{path}]({SITE}/{path})")
    lines += ["", "## Заметки"] + [f"- {n}" for n in extra_notes] + [""]
    (ROOT / "llms.txt").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    products = load_products()
    urls = []
    urls += write_ral_pages(products)
    urls += write_city_pages()
    urls.append(write_calculator())
    urls += collect_article_urls()
    # dedupe while preserving order for non-hub paths already in sitemap static
    extra = [u for u in urls if u not in {"ral/", "delivery/", "calc/rashod-samorezov.html"}]
    write_sitemap(extra)
    write_llms(
        [
            "Бренд: GETSTUFF / Getstuff.",
            "Каналы: сайт выгоднее по цене; WB — срочные мелкие заказы.",
            "География: доставка по России (Ozon).",
        ]
    )
    print(f"OK: landings + calc + sitemap ({len(extra)} extra urls)")


if __name__ == "__main__":
    main()
