import json
import os

PRODUCTS_PATH = r"f:\New folder\aura-and-earth\data\products.json"

with open(PRODUCTS_PATH, "r", encoding="utf-8") as f:
    products = json.load(f)

for p in products:
    pid = p["id"]
    p["images"] = [
        f"product-{pid}-1.jpg",
        f"product-{pid}-2.jpg",
        f"product-{pid}-3.jpg",
        f"product-{pid}-4.jpg"
    ]

with open(PRODUCTS_PATH, "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f"Updated {len(products)} products with 4 image views each.")
