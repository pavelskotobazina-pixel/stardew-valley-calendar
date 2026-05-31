import json
import re
import shutil
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GAME = Path(r"C:\Program Files (x86)\Steam\steamapps\common\Stardew Valley\Content (unpacked)")
PUBLIC = ROOT / "public" / "game"
GENERATED = ROOT / "src" / "generated"

SEASON_RU = {
    "Spring": "Весна",
    "Summer": "Лето",
    "Fall": "Осень",
    "Winter": "Зима",
    "spring": "Весна",
    "summer": "Лето",
    "fall": "Осень",
    "winter": "Зима",
}

ROOM_RU = {
    "Crafts Room": "Мастерская",
    "Pantry": "Кладовая",
    "Fish Tank": "Аквариум",
    "Boiler Room": "Котельная",
    "Bulletin Board": "Доска объявлений",
    "Vault": "Сейф",
    "Abandoned Joja Mart": "Заброшенный ДжоджаМарт",
}

FALLBACK_FESTIVALS = {
    "spring13": "Яичный фестиваль",
    "spring15": "Пустынный фестиваль",
    "spring16": "Пустынный фестиваль",
    "spring17": "Пустынный фестиваль",
    "spring24": "Цветочные танцы",
    "summer11": "Луау",
    "summer20": "Форелевое дерби",
    "summer21": "Форелевое дерби",
    "summer28": "Танец полуночных медуз",
    "fall16": "Ярмарка долины Стардью",
    "fall27": "День всех духов",
    "winter8": "Ледовый праздник",
    "winter12": "Фестиваль кальмаров",
    "winter13": "Фестиваль кальмаров",
    "winter25": "Пир Зимней звезды",
}

FISH_LOCATION = {
    "680": "городская река",
    "681": "лесная река",
    "682": "горное озеро",
    "683": "океан",
    "684": "лесной пруд",
    "685": "секретные воды",
    "688": "легендарная точка",
    "689": "глубокая вода",
    "690": "особое место",
}

KEY_ITEMS = [
    "24", "188", "190", "192", "248", "250", "252", "254", "256", "258", "260", "262", "264", "266",
    "268", "270", "272", "274", "276", "278", "280", "282", "284", "300", "304", "388", "390", "709",
    "334", "335", "336", "337", "338", "382", "384", "386", "442", "444", "446", "74", "128", "140",
    "143", "145", "146", "148", "150", "151", "154", "155", "162", "163", "698", "700", "701", "705",
    "706", "707", "708", "734", "795", "796", "836", "837", "838", "829", "830", "831", "832", "833",
    "834", "835", "852", "856", "857", "858", "879", "881", "886", "887", "890", "896", "897",
    "Book_Void", "Book_Speed", "Book_PriceCatalogue", "SkillBook_0", "SkillBook_1", "SkillBook_2",
    "SkillBook_3", "SkillBook_4", "Moss", "MysteryBox", "GoldenMysteryBox"
]

CATEGORY_RU = {
    -2: "Минерал",
    -4: "Рыба",
    -5: "Яйцо",
    -6: "Молоко",
    -7: "Готовка",
    -8: "Ремесло",
    -12: "Минерал",
    -14: "Мясо",
    -15: "Металл",
    -16: "Стройматериал",
    -18: "Животное",
    -19: "Удобрение",
    -20: "Хлам",
    -21: "Наживка",
    -22: "Снасть",
    -24: "Декор",
    -25: "Овощ",
    -26: "Фрукт",
    -27: "Зелень",
    -28: "Цветок",
    -74: "Семена",
    -75: "Культура",
    -79: "Фруктовое дерево",
    -80: "Цветок",
    -81: "Собирательство",
    -96: "Кольцо",
    -97: "Оружие",
    -98: "Одежда",
    -99: "Инструмент",
    -102: "Книга",
    -999: "Мусор",
}

STAGE_RU = {
    "year1": "Год 1",
    "year2": "Год 2+",
    "desert": "Пустыня",
    "island": "Остров",
    "greenhouse": "Теплица",
    "late": "Поздняя игра",
    "perfection": "Перфекшен",
}

UI_ASSET_LEDGER = [
    {
        "id": "billboard",
        "source": "LooseSprites/Billboard.ru-RU.png",
        "target": "/game/ui/billboard.png",
        "role": "главная календарная доска и сезонный экран",
        "mode": "whole sprite, used as reference/background frame",
    },
    {
        "id": "junimo-note",
        "source": "LooseSprites/JunimoNote.ru-RU.png",
        "target": "/game/ui/junimo-note.png",
        "role": "узелки и комнаты общественного центра",
        "mode": "whole sprite, cropped by CSS masks/panels",
    },
    {
        "id": "letter-bg",
        "source": "LooseSprites/letterBG.ru-RU.png",
        "target": "/game/ui/letter-bg.png",
        "role": "заметки дня, подсказки и журнал",
        "mode": "tile background",
    },
    {
        "id": "special-orders-board",
        "source": "LooseSprites/SpecialOrdersBoard.png",
        "target": "/game/ui/special-orders-board.png",
        "role": "трекер задач, остров и перфекшен",
        "mode": "board frame/reference",
    },
    {
        "id": "cursors",
        "source": "LooseSprites/Cursors.ru-RU.png",
        "target": "/game/ui/cursors.png",
        "role": "слоты, кнопки, вкладки, указатели",
        "mode": "sprite sheet source",
    },
    {
        "id": "menu-tiles",
        "source": "Maps/MenuTiles.png",
        "target": "/game/ui/menu-tiles.png",
        "role": "деревянные плитки и рамки интерфейса",
        "mode": "tile sheet source",
    },
]

TYPE_RU = {
    "Arch": "Артефакты",
    "Basic": "Предметы",
    "Crafting": "Материалы",
    "Fish": "Рыба",
    "Minerals": "Минералы",
    "Quest": "Квесты",
    "Ring": "Кольца",
    "Seeds": "Семена",
    "asdf": "Книги",
}

VILLAGER_ORDER = [
    "Abigail", "Alex", "Caroline", "Clint", "Demetrius", "Dwarf", "Elliott", "Emily", "Evelyn", "George",
    "Gus", "Haley", "Harvey", "Jas", "Jodi", "Kent", "Krobus", "Leah", "Lewis", "Linus", "Marnie", "Maru",
    "Pam", "Penny", "Pierre", "Robin", "Sam", "Sandy", "Sebastian", "Shane", "Vincent", "Willy", "Wizard",
    "Leo"
]

def load_json(rel):
    return json.loads((GAME / rel).read_text(encoding="utf-8-sig"))

def clean_dir(path):
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)

def localized_token(value, tables):
    if not isinstance(value, str):
        return value
    match = re.fullmatch(r"\[LocalizedText ([^:]+):([^\]]+)\]", value)
    if not match:
        return value
    table_ref, key = match.groups()
    table = table_ref.split("\\")[-1]
    return tables.get(table, {}).get(key, key)

def sanitize(value):
    value = str(value)
    value = re.sub(r"[^A-Za-z0-9_-]+", "_", value)
    return value.strip("_") or "item"

def crop_icon(sheet, index, cols, size=16):
    index = int(index)
    x = (index % cols) * size
    y = (index // cols) * size
    return sheet.crop((x, y, x + size, y + size))

def trim_alpha(image, padding=2):
    if image.mode != "RGBA":
        image = image.convert("RGBA")
    bbox = image.getbbox()
    if not bbox:
        return image
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    return image.crop((left, top, right, bottom))

def write_png(image, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)

def parse_item_id(raw):
    if raw is None:
        return None
    text = str(raw)
    match = re.search(r"\((?:O|BC)\)([^,\s]+)", text)
    return match.group(1) if match else text.strip()

def item_name(item_id, objects):
    item = objects.get(str(item_id))
    if item:
        return item["displayName"]
    return str(item_id)

def item_icon(item_id):
    return f"/game/items/{sanitize(item_id)}.png"

def craftable_icon(item_id):
    return f"/game/craftables/{sanitize(item_id)}.png"

def recipe_ingredients(raw, objects):
    tokens = raw.split()
    ingredients = []
    for i in range(0, len(tokens), 2):
        if i + 1 >= len(tokens):
            break
        iid = tokens[i]
        try:
            amount = int(tokens[i + 1])
        except ValueError:
            amount = 1
        if iid.startswith("-"):
            label = CATEGORY_RU.get(int(iid), f"категория {iid}")
            ingredients.append({"id": iid, "name": label, "icon": "/game/items/0.png", "amount": amount, "category": True})
        else:
            ingredients.append({"id": iid, "name": item_name(iid, objects), "icon": item_icon(iid), "amount": amount, "category": False})
    return ingredients

def recipe_unlock(raw):
    if not raw or raw in {"null", "default"}:
        return "известно сразу"
    parts = raw.split()
    if not parts:
        return "открывается в игре"
    if parts[0] == "l" and len(parts) > 1:
        return f"телевизор: день {parts[1]}"
    if parts[0] == "f" and len(parts) > 2:
        return f"дружба: {parts[1]} {parts[2]} сердца"
    if parts[0] == "s" and len(parts) > 2:
        skill = {"Farming": "земледелие", "Mining": "горное дело", "Foraging": "собирательство", "Fishing": "рыбалка", "Combat": "бой"}.get(parts[1], parts[1])
        return f"{skill}: уровень {parts[2]}"
    return raw

def normalize_season(season):
    return SEASON_RU.get(season, season)

def season_from_tags(tags):
    result = []
    tag_map = {
        "season_spring": "Весна",
        "season_summer": "Лето",
        "season_fall": "Осень",
        "season_winter": "Зима",
    }
    for tag, label in tag_map.items():
        if tag in (tags or []):
            result.append(label)
    return result

def stage_for_item(item):
    tags = set(item.get("tags") or [])
    name = item.get("name", "")
    if "crop_year_2" in tags:
        return "year2"
    if "forage_item_desert" in tags or "Desert" in name or "Cactus" in name:
        return "desert"
    if "forage_item_ginger_island" in tags or "Ginger" in name or "Qi" in name:
        return "island"
    return "year1"

def stage_for_crop(seed_id, harvest_id, objects):
    seed = objects.get(str(seed_id), {})
    harvest = objects.get(str(harvest_id), {})
    tags = set(seed.get("tags") or []) | set(harvest.get("tags") or [])
    seed_name = seed.get("name", "")
    harvest_name = harvest.get("name", "")
    if "crop_year_2" in tags:
        return "year2"
    if seed_name in {"Cactus Seeds"} or harvest_name in {"Cactus Fruit"}:
        return "desert"
    if seed_name in {"Pineapple Seeds", "Taro Tuber"} or harvest_name in {"Pineapple", "Taro Root"}:
        return "island"
    if "Qi" in seed_name or "Qi" in harvest_name:
        return "perfection"
    if seed_name in {"Ancient Seeds", "Rare Seed"}:
        return "late"
    return "year1"

def forage_source(tags):
    tags = set(tags or [])
    if "forage_item_desert" in tags:
        return "пустыня"
    if "forage_item_beach" in tags or "marine_item" in tags:
        return "пляж"
    if "forage_item_cave" in tags:
        return "пещера на ферме"
    if "forage_item_mines" in tags:
        return "шахты"
    if "forage_item_secret" in tags:
        return "тайный лес"
    if "season_winter" in tags:
        return "зимний сбор"
    if "season_fall" in tags:
        return "осенний лес и город"
    if "season_summer" in tags:
        return "летний лес и город"
    if "season_spring" in tags:
        return "весенний лес и город"
    return "особые зоны"

def build():
    clean_dir(PUBLIC)
    GENERATED.mkdir(parents=True, exist_ok=True)

    string_tables = {}
    for name in ["Objects", "NPCNames", "BundleNames", "Buildings"]:
        p = GAME / "Strings" / f"{name}.ru-RU.json"
        if p.exists():
            string_tables[name] = json.loads(p.read_text(encoding="utf-8-sig"))

    raw_objects = load_json("Data/Objects.json")
    objects = {}
    for obj_id, obj in raw_objects.items():
        objects[str(obj_id)] = {
            "id": str(obj_id),
            "name": obj.get("Name", str(obj_id)),
            "displayName": localized_token(obj.get("DisplayName"), string_tables),
            "description": localized_token(obj.get("Description"), string_tables),
            "category": obj.get("Category"),
            "type": obj.get("Type"),
            "price": obj.get("Price", 0),
            "spriteIndex": obj.get("SpriteIndex", 0),
            "texture": obj.get("Texture"),
            "tags": obj.get("ContextTags") or [],
        }

    spring = Image.open(GAME / "Maps" / "springobjects.png").convert("RGBA")
    objects2 = Image.open(GAME / "TileSheets" / "Objects_2.png").convert("RGBA")
    icon_manifest = []
    for obj_id, obj in objects.items():
        try:
            texture = obj.get("texture")
            if texture == "TileSheets\\Objects_2":
                icon = crop_icon(objects2, obj["spriteIndex"], objects2.width // 16)
            else:
                icon = crop_icon(spring, obj["spriteIndex"], spring.width // 16)
            path = PUBLIC / "items" / f"{sanitize(obj_id)}.png"
            write_png(icon, path)
            icon_manifest.append({"id": obj_id, "name": obj["displayName"], "path": f"/game/items/{sanitize(obj_id)}.png"})
        except Exception:
            continue

    raw_big = load_json("Data/BigCraftables.json")
    craftables_sheet = Image.open(GAME / "TileSheets" / "Craftables.png").convert("RGBA")
    craftables = {}
    for craft_id, craft in raw_big.items():
        craftables[str(craft_id)] = {
            "id": str(craft_id),
            "name": craft.get("Name", str(craft_id)),
            "displayName": localized_token(craft.get("DisplayName"), string_tables),
            "description": localized_token(craft.get("Description"), string_tables),
            "spriteIndex": craft.get("SpriteIndex", 0),
        }
        try:
            index = int(craft.get("SpriteIndex", 0))
            cols = craftables_sheet.width // 16
            x = (index % cols) * 16
            y = (index // cols) * 32
            icon = craftables_sheet.crop((x, y, x + 16, y + 32))
            write_png(trim_alpha(icon, 0), PUBLIC / "craftables" / f"{sanitize(craft_id)}.png")
        except Exception:
            continue

    for rel, name in [
        ("LooseSprites/logo.png", "logo.png"),
        ("LooseSprites/stardewPanorama.png", "panorama.png"),
        ("LooseSprites/Billboard.ru-RU.png", "billboard.png"),
        ("LooseSprites/JunimoNote.ru-RU.png", "junimo-note.png"),
        ("LooseSprites/letterBG.ru-RU.png", "letter-bg.png"),
        ("LooseSprites/map.png", "map-spring.png"),
        ("LooseSprites/map_summer.png", "map-summer.png"),
        ("LooseSprites/map_fall.png", "map-fall.png"),
        ("LooseSprites/map_winter.png", "map-winter.png"),
        ("LooseSprites/map_island.png", "map-island.png"),
        ("LooseSprites/daybg.png", "day-bg.png"),
        ("LooseSprites/nightbg.png", "night-bg.png"),
        ("LooseSprites/Cursors.png", "cursors.png"),
        ("LooseSprites/Cursors.ru-RU.png", "cursors-ru.png"),
        ("LooseSprites/Cursors_1_6.png", "cursors-1-6.png"),
        ("LooseSprites/Cursors_1_6.ru-RU.png", "cursors-1-6-ru.png"),
        ("LooseSprites/BundleSprites.png", "bundle-sprites.png"),
        ("LooseSprites/textBox.png", "text-box.png"),
        ("LooseSprites/chatBox.png", "chat-box.png"),
        ("LooseSprites/font_bold.png", "font-bold-sheet.png"),
        ("LooseSprites/font_colored.png", "font-colored-sheet.png"),
        ("Maps/MenuTiles.png", "menu-tiles.png"),
        ("Maps/MenuTilesUncolored.png", "menu-tiles-uncolored.png"),
        ("LooseSprites/FieldOfficeDonationMenu.png", "field-office.png"),
        ("LooseSprites/ForgeMenu.png", "forge-menu.png"),
        ("LooseSprites/PrizeTicketMenu.png", "prize-ticket-menu.png"),
        ("LooseSprites/EmoteMenu.png", "emote-menu.png"),
        ("LooseSprites/Giftbox.png", "giftbox.png"),
        ("LooseSprites/SpecialOrdersBoard.png", "special-orders-board.png"),
    ]:
        src = GAME / rel
        if src.exists():
            (PUBLIC / "ui").mkdir(parents=True, exist_ok=True)
            if name == "map-island.png":
                im = Image.open(src).convert("RGBA").crop((0, 0, 300, 180))
                write_png(im, PUBLIC / "ui" / name)
            elif name.startswith("map-") and name.endswith(".png"):
                im = Image.open(src).convert("RGBA")
                shutil.copy2(src, PUBLIC / "ui" / name)
                write_png(im.crop((0, 0, min(300, im.width), min(188, im.height))), PUBLIC / "ui" / name.replace(".png", "-scene.png"))
            else:
                shutil.copy2(src, PUBLIC / "ui" / name)

    parrots = GAME / "LooseSprites" / "parrots.png"
    if parrots.exists():
        im = Image.open(parrots).convert("RGBA")
        write_png(trim_alpha(im.crop((0, 0, 16, 24)), 0), PUBLIC / "ui" / "parrot.png")

    for rel, name in [
        ("Characters/Junimo.png", "junimo.png"),
        ("Animals/cat.png", "cat.png"),
        ("Animals/Brown Chicken.png", "brown-chicken.png"),
        ("Animals/Duck.png", "duck.png"),
    ]:
        src = GAME / rel
        if src.exists():
            im = Image.open(src).convert("RGBA")
            frame = trim_alpha(im.crop((0, 0, min(32, im.width), min(32, im.height))), 0)
            write_png(frame, PUBLIC / "decor" / name)

    portraits = []
    for name in VILLAGER_ORDER:
        p = GAME / "Portraits" / f"{name}.png"
        if p.exists():
            im = Image.open(p).convert("RGBA").crop((0, 0, 64, 64))
            write_png(im, PUBLIC / "portraits" / f"{name}.png")
            portraits.append(name)
        s = GAME / "Characters" / f"{name}.png"
        if s.exists():
            sprite = Image.open(s).convert("RGBA")
            frame = sprite.crop((0, 0, min(16, sprite.width), min(32, sprite.height)))
            write_png(trim_alpha(frame, 0), PUBLIC / "sprites" / f"{name}.png")

    buildings = load_json("Data/Buildings.json")
    building_assets = []
    for key in ["Greenhouse", "Fish Pond", "Shipping Bin", "Coop", "Barn", "Silo", "Stable", "Mill", "Well", "Junimo Hut", "Gold Clock"]:
        data = buildings.get(key)
        if not data:
            continue
        texture = data.get("Texture", "").replace("\\", "/")
        src = GAME / f"{texture}.png"
        if not src.exists():
            continue
        im = Image.open(src).convert("RGBA")
        rect = data.get("SourceRect") or {}
        if rect.get("Width", 0) and rect.get("Height", 0):
            im = im.crop((rect["X"], rect["Y"], rect["X"] + rect["Width"], rect["Y"] + rect["Height"]))
        im = trim_alpha(im, 2)
        out_name = sanitize(key).lower() + ".png"
        write_png(im, PUBLIC / "buildings" / out_name)
        building_assets.append({
            "id": sanitize(key).lower(),
            "name": localized_token(data.get("Name"), string_tables),
            "path": f"/game/buildings/{out_name}",
            "materials": [{"id": parse_item_id(m.get("ItemId")), "amount": m.get("Amount")} for m in (data.get("BuildMaterials") or [])],
            "cost": data.get("BuildCost", 0),
            "days": data.get("BuildDays", 0),
        })

    crops = []
    raw_crops = load_json("Data/Crops.json")
    for seed_id, crop in raw_crops.items():
        harvest = str(crop.get("HarvestItemId"))
        if harvest not in objects:
            continue
        seed_name_raw = objects.get(str(seed_id), {}).get("name", "")
        if seed_name_raw in {"Spring Seeds", "Summer Seeds", "Fall Seeds", "Winter Seeds"}:
            continue
        seasons = [normalize_season(s) for s in crop.get("Seasons", [])]
        days = sum(crop.get("DaysInPhase", []))
        stage = stage_for_crop(seed_id, harvest, objects)
        price = objects[harvest].get("price", 0)
        seed_price = objects.get(str(seed_id), {}).get("price", 0)
        regrow = crop.get("RegrowDays", -1)
        harvests_28 = 1
        if regrow and regrow > 0 and days > 0:
            harvests_28 += max(0, (28 - days) // regrow)
        crops.append({
            "seedId": str(seed_id),
            "id": harvest,
            "name": item_name(harvest, objects),
            "seedName": item_name(seed_id, objects),
            "icon": item_icon(harvest),
            "seedIcon": item_icon(seed_id),
            "seasons": seasons,
            "days": days,
            "regrow": regrow,
            "raised": crop.get("IsRaised", False),
            "paddy": crop.get("IsPaddyCrop", False),
            "price": price,
            "seedPrice": seed_price,
            "profit": (price * harvests_28) - seed_price,
            "stage": stage,
            "stageLabel": STAGE_RU.get(stage, stage),
            "tags": sorted(set(objects[harvest].get("tags") or []) | set(objects.get(str(seed_id), {}).get("tags") or [])),
        })
    crops.sort(key=lambda x: (x["seasons"][0] if x["seasons"] else "", x["days"], x["name"]))

    forage = []
    for obj in objects.values():
        tags = obj.get("tags") or []
        is_forage = "forage_item" in tags or obj.get("category") in {-81, -79, -80, -23}
        if not is_forage:
            continue
        seasons = season_from_tags(tags)
        if not seasons and "forage_item_desert" not in tags and "forage_item_mines" not in tags and "forage_item_cave" not in tags:
            continue
        stage = stage_for_item(obj)
        forage.append({
            "id": obj["id"],
            "name": obj["displayName"],
            "icon": item_icon(obj["id"]),
            "description": obj.get("description", ""),
            "categoryName": CATEGORY_RU.get(obj.get("category"), TYPE_RU.get(obj.get("type"), obj.get("type") or "Предмет")),
            "price": obj.get("price", 0),
            "seasons": seasons or ["любой сезон"],
            "source": forage_source(tags),
            "stage": stage,
            "stageLabel": STAGE_RU.get(stage, stage),
            "tags": tags,
        })
    crop_ids = {crop["id"] for crop in crops}
    forage = [item for item in forage if item["id"] not in crop_ids]
    forage.sort(key=lambda x: (x["stage"], x["seasons"][0], x["name"]))

    fish = []
    raw_fish = load_json("Data/Fish.json")
    for fish_id, value in raw_fish.items():
        parts = value.split("/")
        if len(parts) < 2:
            continue
        trap = len(parts) > 1 and parts[1] == "trap"
        if trap:
            fish.append({
                "id": str(fish_id),
                "name": item_name(fish_id, objects),
                "icon": item_icon(fish_id),
                "type": "Ловушка",
                "difficulty": 0,
                "time": "весь день",
                "seasons": ["Весна", "Лето", "Осень", "Зима"],
                "weather": "любая",
                "locations": [parts[4] if len(parts) > 4 else "вода"],
                "stage": "year1",
                "stageLabel": STAGE_RU["year1"],
                "bundleHint": "",
            })
            continue
        if len(parts) < 9:
            continue
        seasons = [normalize_season(s) for s in parts[6].split()]
        weather = {"sunny": "солнце", "rainy": "дождь", "both": "любая"}.get(parts[7], parts[7])
        loc_tokens = re.findall(r"\b\d{3}\b", parts[8])
        locations = sorted({FISH_LOCATION.get(t, t) for t in loc_tokens}) or ["особая точка"]
        fish.append({
            "id": str(fish_id),
            "name": item_name(fish_id, objects),
            "icon": item_icon(fish_id),
            "type": parts[2],
            "difficulty": int(parts[1]) if parts[1].isdigit() else 0,
            "time": parts[5].replace("2600", "02:00").replace("2400", "00:00").replace("2200", "22:00").replace("2000", "20:00").replace("1900", "19:00").replace("1800", "18:00").replace("1600", "16:00").replace("1400", "14:00").replace("1300", "13:00").replace("1200", "12:00").replace("1100", "11:00").replace("900", "09:00").replace("800", "08:00").replace("600", "06:00"),
            "seasons": seasons,
            "weather": weather,
            "locations": locations,
            "stage": "year1",
            "stageLabel": STAGE_RU["year1"],
            "bundleHint": "",
        })
    fish.sort(key=lambda x: (x["seasons"][0] if x["seasons"] else "", -x["difficulty"], x["name"]))

    fish_overrides = {
        "159": {"seasons": ["Лето"], "weather": "любая", "locations": ["океан, восточный пирс"], "stage": "year1"},
        "160": {"seasons": ["Осень"], "weather": "любая", "locations": ["север города"], "stage": "year1"},
        "163": {"seasons": ["Весна"], "weather": "дождь", "locations": ["горное озеро"], "stage": "year1"},
        "164": {"stage": "desert", "stageLabel": STAGE_RU["desert"], "locations": ["пустыня"]},
        "165": {"stage": "desert", "stageLabel": STAGE_RU["desert"], "locations": ["пустыня"]},
        "775": {"seasons": ["Зима"], "weather": "любая", "locations": ["Синдерсепский лес"], "stage": "year1"},
        "836": {"stage": "island", "stageLabel": STAGE_RU["island"], "locations": ["пиратская бухта"]},
        "837": {"stage": "island", "stageLabel": STAGE_RU["island"], "locations": ["океан острова"]},
        "838": {"stage": "island", "stageLabel": STAGE_RU["island"], "locations": ["реки и пруды острова"]},
        "898": {"seasons": ["Лето"], "weather": "любая", "locations": ["океан, восточный пирс"], "stage": "perfection", "stageLabel": STAGE_RU["perfection"]},
        "899": {"seasons": ["Осень"], "weather": "любая", "locations": ["север города"], "stage": "perfection", "stageLabel": STAGE_RU["perfection"]},
        "900": {"seasons": ["Весна"], "weather": "дождь", "locations": ["горное озеро"], "stage": "perfection", "stageLabel": STAGE_RU["perfection"]},
        "901": {"seasons": ["Весна", "Лето", "Осень", "Зима"], "weather": "любая", "locations": ["канализация"], "stage": "perfection", "stageLabel": STAGE_RU["perfection"]},
        "902": {"seasons": ["Зима"], "weather": "любая", "locations": ["Синдерсепский лес"], "stage": "perfection", "stageLabel": STAGE_RU["perfection"]},
    }
    for entry in fish:
        override = fish_overrides.get(entry["id"])
        if override:
            entry.update(override)
            entry["stageLabel"] = STAGE_RU.get(entry.get("stage", "year1"), entry.get("stageLabel", STAGE_RU["year1"]))
    fish.sort(key=lambda x: (x["stage"], x["seasons"][0] if x["seasons"] else "", -x["difficulty"], x["name"]))

    raw_bundles = load_json("Data/Bundles.ru-RU.json")
    bundles = []
    for key, value in raw_bundles.items():
        room_raw = key.split("/")[0].replace("_", " ")
        parts = value.split("/")
        bundle_name = parts[-1] if parts and parts[-1] else parts[0]
        item_tokens = parts[2].split() if len(parts) > 2 else []
        items = []
        for i in range(0, len(item_tokens), 3):
            chunk = item_tokens[i:i+3]
            if len(chunk) < 2:
                continue
            iid, amount = chunk[0], int(chunk[1])
            quality = int(chunk[2]) if len(chunk) > 2 and chunk[2].isdigit() else 0
            items.append({"id": iid, "name": item_name(iid, objects), "icon": item_icon(iid), "amount": amount, "quality": quality})
        bundles.append({
            "id": sanitize(key),
            "room": ROOM_RU.get(room_raw, room_raw),
            "name": bundle_name,
            "items": items,
            "required": int(parts[4]) if len(parts) > 4 and parts[4].isdigit() else len(items),
            "reward": parts[1] if len(parts) > 1 else "",
            "source": "Data/Bundles.ru-RU.json + локальная wiki-проверка",
        })

    item_lookup = {}
    for crop in crops:
        item_lookup[crop["id"]] = f"{', '.join(crop['seasons'])}; растет {crop['days']} дн.; {crop['stageLabel']}"
    for entry in fish:
        item_lookup[entry["id"]] = f"{', '.join(entry['seasons'])}; {entry['weather']}; {', '.join(entry['locations'])}"
    for entry in forage:
        item_lookup[entry["id"]] = f"{', '.join(entry['seasons'])}; {entry['source']}; {entry['stageLabel']}"
    for bundle in bundles:
        for item in bundle["items"]:
            item["hint"] = item_lookup.get(item["id"], "проверь в каталоге предметов")

    npc_names = string_tables.get("NPCNames", {})
    characters = load_json("Data/Characters.json")
    gift_tastes = load_json("Data/NPCGiftTastes.json")
    villagers = []
    for key in VILLAGER_ORDER:
        c = characters.get(key)
        if not c:
            continue
        tastes = (gift_tastes.get(key) or "").split("/")
        loves = tastes[1].split() if len(tastes) > 1 else []
        likes = tastes[3].split() if len(tastes) > 3 else []
        villager_gifts = []
        for taste, ids in [("Обожает", loves), ("Любит", likes)]:
            for iid in ids[:10]:
                if iid in objects:
                    villager_gifts.append({"taste": taste, "id": iid, "name": item_name(iid, objects), "icon": item_icon(iid)})
        villagers.append({
            "id": key,
            "name": npc_names.get(key, key),
            "birthdaySeason": normalize_season(c.get("BirthSeason")),
            "birthdayDay": c.get("BirthDay"),
            "romance": bool(c.get("CanBeRomanced")),
            "region": c.get("HomeRegion", ""),
            "portrait": f"/game/portraits/{key}.png" if key in portraits else "",
            "sprite": f"/game/sprites/{key}.png",
            "gifts": villager_gifts,
        })

    cooking_raw = load_json("Data/CookingRecipes.json")
    cooking = []
    for recipe_name, value in cooking_raw.items():
        parts = value.split("/")
        if len(parts) < 3:
            continue
        output_id = parts[2].split()[0]
        cooking.append({
            "id": sanitize(recipe_name),
            "name": item_name(output_id, objects) if output_id in objects else recipe_name,
            "recipeName": recipe_name,
            "icon": item_icon(output_id),
            "outputId": output_id,
            "ingredients": recipe_ingredients(parts[0], objects),
            "unlock": recipe_unlock(parts[3] if len(parts) > 3 else ""),
        })

    crafting_raw = load_json("Data/CraftingRecipes.json")
    crafting = []
    for recipe_name, value in crafting_raw.items():
        parts = value.split("/")
        if len(parts) < 3:
            continue
        output_id = parts[2].split()[0]
        output_name = craftables.get(output_id, {}).get("displayName") or item_name(output_id, objects)
        icon = craftable_icon(output_id) if output_id in craftables else item_icon(output_id)
        crafting.append({
            "id": sanitize(recipe_name),
            "name": output_name,
            "recipeName": recipe_name,
            "icon": icon,
            "outputId": output_id,
            "category": parts[1],
            "ingredients": recipe_ingredients(parts[0], objects),
            "unlock": recipe_unlock(parts[4] if len(parts) > 4 else ""),
        })

    achievements_raw = load_json("Data/Achievements.ru-RU.json")
    achievements = []
    for achievement_id, value in achievements_raw.items():
        parts = value.split("^")
        achievements.append({
            "id": str(achievement_id),
            "name": parts[0] if parts else str(achievement_id),
            "description": parts[1] if len(parts) > 1 else "",
            "hidden": parts[2] == "false" if len(parts) > 2 else False,
            "icon": item_icon("74") if achievement_id == "44" else item_icon("434"),
        })

    world_map_strings = {}
    world_map_path = GAME / "Strings" / "WorldMap.ru-RU.json"
    if world_map_path.exists():
        world_map_strings = json.loads(world_map_path.read_text(encoding="utf-8-sig"))
    world_map = load_json("Data/WorldMap.json")
    island_points = []
    for area in world_map.get("GingerIsland", {}).get("MapAreas", []):
        for tip in area.get("Tooltips", []) or []:
            text = localized_token(tip.get("Text"), {"WorldMap": world_map_strings})
            pixel = tip.get("PixelArea") or {}
            island_points.append({
                "id": tip.get("Id", area.get("Id")),
                "area": area.get("Id"),
                "name": text,
                "x": pixel.get("X", 0),
                "y": pixel.get("Y", 0),
                "w": pixel.get("Width", 0),
                "h": pixel.get("Height", 0),
            })

    festival_names = {}
    p = GAME / "Data" / "Festivals" / "FestivalDates.ru-RU.json"
    if p.exists():
        festival_names.update(json.loads(p.read_text(encoding="utf-8-sig")))
    festival_names.update({k: v for k, v in FALLBACK_FESTIVALS.items() if k not in festival_names})
    calendar = []
    for season in ["spring", "summer", "fall", "winter"]:
        for day in range(1, 29):
            key = f"{season}{day}"
            day_events = []
            if key in festival_names:
                day_events.append({"type": "festival", "title": festival_names[key]})
            for v in villagers:
                if v["birthdaySeason"] == normalize_season(season) and v["birthdayDay"] == day:
                    day_events.append({"type": "birthday", "title": v["name"], "portrait": v["portrait"]})
            calendar.append({"season": normalize_season(season), "day": day, "key": key, "events": day_events})

    strategy = [
        {"season": "Весна", "title": "Старт без перегруза", "text": "Сначала закрывай сезонные окна: культуры для узелков, дождевую рыбу, шахту до стабильной руды и первый апгрейд лейки.", "source": "Shayuwu + wiki checklist"},
        {"season": "Лето", "title": "Деньги и банка", "text": "Держи поле под чернику/хмель/перец, но не забывай про рыбу и заготовку дерева для построек.", "source": "Shayuwu season route"},
        {"season": "Осень", "title": "Закрытие хвостов", "text": "Ставь приоритет на тыкву, батат, баклажан, амарант, дождевого судака и подготовку к зимним шахтам.", "source": "Shayuwu season route"},
        {"season": "Зима", "title": "Ресурсы вместо грядок", "text": "Зима удобна для шахт, инструментов, отношений, музея, крабовых ловушек и подготовки к теплице/острову.", "source": "Shayuwu season route"},
        {"season": "Поздняя игра", "title": "Имбирный остров", "text": "После ремонта лодки Вилли откроются островная ферма, вулкан, золотые грецкие орехи и новые рыбы/культуры.", "source": "Stardew Valley Wiki"},
        {"season": "Перфекшен", "title": "Не верь процентам без базы", "text": "Отдельно веди трекер рыбы, отгрузки, крафта, готовки, обелисков, золотых часов и дружбы.", "source": "Stardew Valley Wiki"},
    ]

    index_items = [objects[i] for i in KEY_ITEMS if i in objects]
    catalog_items = [
        {
            **obj,
            "icon": item_icon(obj["id"]),
            "categoryName": CATEGORY_RU.get(obj.get("category"), TYPE_RU.get(obj.get("type"), obj.get("type") or "Предмет")),
        }
        for obj in objects.values()
        if obj.get("displayName") and obj.get("spriteIndex") is not None and obj.get("category") != -999
    ]
    catalog_items.sort(key=lambda x: (str(x["categoryName"]), str(x["displayName"])))
    data = {
        "meta": {
            "generatedFrom": str(GAME),
            "sources": [
                "Local Content/Data/*.json",
                "Local Content/Strings/*.ru-RU.json",
                "Stardew Valley Wiki",
                "Stardew Valley 1.6 official changelog",
                "Shayuwu YouTube channel as strategy layer",
            ],
        },
        "items": index_items,
        "catalogItems": catalog_items,
        "crops": crops,
        "forage": forage,
        "fish": fish,
        "bundles": bundles,
        "villagers": villagers,
        "cooking": cooking,
        "crafting": crafting,
        "achievements": achievements,
        "islandPoints": island_points,
        "calendar": calendar,
        "buildings": building_assets,
        "strategy": strategy,
        "icons": icon_manifest,
        "uiAssets": UI_ASSET_LEDGER,
    }

    (PUBLIC / "manifest.json").write_text(json.dumps({"icons": icon_manifest, "portraits": portraits, "buildings": building_assets, "uiAssets": UI_ASSET_LEDGER}, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "work" / "asset-ledger.json").parent.mkdir(parents=True, exist_ok=True)
    (ROOT / "work" / "asset-ledger.json").write_text(json.dumps(UI_ASSET_LEDGER, ensure_ascii=False, indent=2), encoding="utf-8")
    (GENERATED / "gameData.ts").write_text("export const GAME_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(json.dumps({
        "items": len(index_items),
        "icons": len(icon_manifest),
        "catalogItems": len(catalog_items),
        "crops": len(crops),
        "forage": len(forage),
        "fish": len(fish),
        "bundles": len(bundles),
        "villagers": len(villagers),
        "cooking": len(cooking),
        "crafting": len(crafting),
        "achievements": len(achievements),
        "islandPoints": len(island_points),
        "calendarDays": len(calendar),
        "buildings": len(building_assets),
    }, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    build()
