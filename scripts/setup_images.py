import os
import urllib.request
import time
from PIL import Image, ImageEnhance, ImageFilter

PRODUCTS_DIR = r"f:\New folder\aura-and-earth\public\images\products"
os.makedirs(PRODUCTS_DIR, exist_ok=True)

# Curated Unsplash images for products 13 to 25 (4 images per product)
# Each URL corresponds to artisanal tableware, brass cutlery, copper, teak wood, pitchers, glass cruets, stone bells, bread cloches, ceramic vases, linen napkins, and table suites.
CURATED_IMAGES = {
    13: [ # The Hand-Forged Brass Butter Knife Trio
        "https://images.unsplash.com/photo-1615865417491-9941019fbc00?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=1000&auto=format&fit=crop&q=85"
    ],
    14: [ # Hand-Hammered Pure Copper Coasters
        "https://images.unsplash.com/photo-1594913785162-e678a0c23ddb?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=1000&auto=format&fit=crop&q=85"
    ],
    15: [ # Satin Brass Table Tongs
        "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1615865417491-9941019fbc00?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=1000&auto=format&fit=crop&q=85"
    ],
    16: [ # Sculpted Teak Footed Charcuterie Board
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1000&auto=format&fit=crop&q=85"
    ],
    17: [ # Terracotta & White Dipped Pouring Pitcher
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1000&auto=format&fit=crop&q=85"
    ],
    18: [ # Smoked Glass Olive Oil Cruet
        "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1000&auto=format&fit=crop&q=85"
    ],
    19: [ # Basalt Stone Butter Bell
        "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=1000&auto=format&fit=crop&q=85"
    ],
    20: [ # Raw Clay Oval Bread Cloche & Baker
        "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=1000&auto=format&fit=crop&q=85"
    ],
    21: [ # Raw Stone Incense & Palo Santo Well
        "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1602872030219-aa285c54c30c?w=1000&auto=format&fit=crop&q=85"
    ],
    22: [ # Fluted Ceramic Pillar Candleholder Pair
        "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1602872030219-aa285c54c30c?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=1000&auto=format&fit=crop&q=85"
    ],
    23: [ # Botanical Dyed Flax Napkins
        "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&auto=format&fit=crop&q=85"
    ],
    24: [ # Amphora Terracotta Bud Vase
        "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1602872030219-aa285c54c30c?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=85"
    ],
    25: [ # The Aura Grand 16-Piece Tasting Suite
        "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=1000&auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1000&auto=format&fit=crop&q=85"
    ]
}

def generate_views_for_product(pid):
    """Generate 4 views for products 1-12 from their 1024x1024 master image"""
    master_path = os.path.join(PRODUCTS_DIR, f"product-{pid}.jpg")
    if not os.path.exists(master_path):
        print(f"Master image for product {pid} not found: {master_path}")
        return

    img = Image.open(master_path).convert('RGB')
    w, h = img.size

    # View 1: Master Hero
    view1_path = os.path.join(PRODUCTS_DIR, f"product-{pid}-1.jpg")
    img.save(view1_path, "JPEG", quality=92)

    # View 2: Macro Texture & Artisan Detail
    # Center-cropped 60%
    box2 = (int(w * 0.20), int(h * 0.20), int(w * 0.80), int(h * 0.80))
    view2 = img.crop(box2).resize((1000, 1000), Image.Resampling.LANCZOS)
    enhancer2 = ImageEnhance.Sharpness(view2)
    view2 = enhancer2.enhance(1.15)
    view2_path = os.path.join(PRODUCTS_DIR, f"product-{pid}-2.jpg")
    view2.save(view2_path, "JPEG", quality=92)

    # View 3: Side Angle / Rim Focus
    box3 = (int(w * 0.05), int(h * 0.15), int(w * 0.85), int(h * 0.95))
    view3 = img.crop(box3).resize((1000, 1000), Image.Resampling.LANCZOS)
    view3_path = os.path.join(PRODUCTS_DIR, f"product-{pid}-3.jpg")
    view3.save(view3_path, "JPEG", quality=92)

    # View 4: Warm Atmosphere / Lifestyle Table Crop
    box4 = (int(w * 0.15), int(h * 0.05), int(w * 0.95), int(h * 0.85))
    view4 = img.crop(box4).resize((1000, 1000), Image.Resampling.LANCZOS)
    enhancer4 = ImageEnhance.Color(view4)
    view4 = enhancer4.enhance(1.08)
    view4_path = os.path.join(PRODUCTS_DIR, f"product-{pid}-4.jpg")
    view4.save(view4_path, "JPEG", quality=92)

    print(f"[OK] Generated 4 views for product {pid}")

def download_views_for_curated():
    """Download 4 views for products 13 to 25"""
    headers = {"User-Agent": "Mozilla/5.0"}
    for pid, urls in CURATED_IMAGES.items():
        for i, url in enumerate(urls, 1):
            out_path = os.path.join(PRODUCTS_DIR, f"product-{pid}-{i}.jpg")
            if os.path.exists(out_path) and os.path.getsize(out_path) > 5000:
                print(f"[OK] Already have product-{pid}-{i}.jpg")
                continue
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=12) as resp:
                    data = resp.read()
                    with open(out_path, "wb") as f:
                        f.write(data)
                # Ensure square format 1000x1000
                with Image.open(out_path) as im:
                    im = im.convert('RGB')
                    min_dim = min(im.size)
                    left = (im.width - min_dim) // 2
                    top = (im.height - min_dim) // 2
                    cropped = im.crop((left, top, left + min_dim, top + min_dim))
                    resized = cropped.resize((1000, 1000), Image.Resampling.LANCZOS)
                    resized.save(out_path, "JPEG", quality=90)
                print(f"[OK] Downloaded & processed product-{pid}-{i}.jpg")
                time.sleep(0.15)
            except Exception as e:
                print(f"[ERR] Error product-{pid}-{i}.jpg: {e}")

if __name__ == "__main__":
    print("Processing products 1 to 12 views...")
    for pid in range(1, 13):
        generate_views_for_product(pid)

    print("\nProcessing products 13 to 25 views...")
    download_views_for_curated()
    print("\nAll product images completed!")
