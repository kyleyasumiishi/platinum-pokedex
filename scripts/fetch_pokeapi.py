"""
fetch_pokeapi.py — Regional Pokédex Data Pipeline

Fetches all data needed for the app from PokeAPI, filters for one regional
pokedex (Sinnoh Platinum or Unova Black), and outputs 5 static JSON files to
src/data/gen{N}/.

Run once locally:
  pip install -r requirements.txt
  python scripts/fetch_pokeapi.py --gen 4    # default
  python scripts/fetch_pokeapi.py --gen 5

Caches raw API responses in scripts/cache/ so re-runs are fast (no re-fetching).
Output files are committed to the repo and used as static assets in the React app.
"""

import argparse
import json
import time
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).parent
CACHE_DIR = SCRIPT_DIR / "cache"

CACHE_DIR.mkdir(exist_ok=True)

BASE_URL = "https://pokeapi.co/api/v2"
SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon"

# ---------------------------------------------------------------------------
# Per-generation config — choose endpoints, versions, and validation targets
# ---------------------------------------------------------------------------

GEN_CONFIG = {
    4: {
        "pokedex_id": 6,                 # Sinnoh Platinum dex
        "version_group": "platinum",
        "version": "platinum",
        "preferred_flavor_versions": ["platinum", "diamond", "pearl"],
        "preferred_move_version_groups": ["platinum", "diamond-pearl", "heartgold-soulsilver"],
        "expected_count": 210,
        "starters": ["turtwig", "chimchar", "piplup"],
        "region": "Sinnoh",
    },
    5: {
        "pokedex_id": 8,                 # Unova Black/White dex
        "version_group": "black-white",
        "version": "black",
        "preferred_flavor_versions": ["black", "white"],
        "preferred_move_version_groups": ["black-white", "black-2-white-2"],
        "expected_count": 156,
        "starters": ["snivy", "tepig", "oshawott"],
        "region": "Unova",
    },
}

# Set by main() once args are parsed; consulted by helpers below.
CFG: dict = {}

# ---------------------------------------------------------------------------
# Black/White version exclusives (Gen 5 only)
# ---------------------------------------------------------------------------
# Sourced from Bulbapedia. Pokémon NOT obtainable in Black except by trade
# get version_exclusive="white" (their `encounters` array will be empty).
# Pokémon obtainable in Black get version_exclusive=null OR "black" (informational).

WHITE_EXCLUSIVES = {
    "sawk",
    "petilil", "lilligant",
    "solosis", "duosion", "reuniclus",
    "rufflet", "braviary",
    "thundurus",
    "zekrom",
    "archen", "archeops",      # Plume Fossil
}

BLACK_EXCLUSIVES = {
    "throh",
    "cottonee", "whimsicott",
    "gothita", "gothorita", "gothitelle",
    "vullaby", "mandibuzz",
    "tornadus",
    "reshiram",
    "tirtouga", "carracosta",  # Cover Fossil
}

# ---------------------------------------------------------------------------
# HTTP helpers — cache every GET response to disk
# ---------------------------------------------------------------------------

def fetch(url: str, max_attempts: int = 5) -> dict:
    """GET a URL, returning parsed JSON. Caches result to disk keyed by URL.
    Retries with exponential backoff on transient network errors."""
    key = url.replace(BASE_URL + "/", "").replace("https://", "").replace("/", "_").rstrip("_")
    cache_path = CACHE_DIR / f"{key}.json"

    if cache_path.exists():
        with open(cache_path) as f:
            return json.load(f)

    last_err = None
    for attempt in range(1, max_attempts + 1):
        try:
            print(f"  Fetching: {url}" + (f" (attempt {attempt})" if attempt > 1 else ""))
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            break
        except (requests.exceptions.Timeout,
                requests.exceptions.ConnectionError,
                requests.exceptions.HTTPError) as e:
            last_err = e
            if attempt == max_attempts:
                raise
            backoff = min(2 ** attempt, 30)
            print(f"    ! {type(e).__name__}: retrying in {backoff}s...")
            time.sleep(backoff)

    with open(cache_path, "w") as f:
        json.dump(data, f)

    time.sleep(0.6)  # ~1.6 req/sec — respectful of PokeAPI fair use
    return data

# ---------------------------------------------------------------------------
# Step 1 — Get the regional dex for the active generation
# ---------------------------------------------------------------------------

def get_regional_dex() -> list[tuple[int, str]]:
    pokedex_id = CFG["pokedex_id"]
    region = CFG["region"]
    print(f"\n[1/6] Fetching {region} dex index (pokedex/{pokedex_id})...")
    dex = fetch(f"{BASE_URL}/pokedex/{pokedex_id}/")
    entries = []
    for entry in dex["pokemon_entries"]:
        regional_num = entry["entry_number"]
        name = entry["pokemon_species"]["name"]
        entries.append((regional_num, name))
    entries.sort(key=lambda x: x[0])
    print(f"      Found {len(entries)} Pokémon in the {region} dex.")
    return entries

# ---------------------------------------------------------------------------
# Step 2 — Fetch raw data for each Pokémon
# ---------------------------------------------------------------------------

def get_flavor_text(species_data: dict) -> str:
    """Find a preferred-version flavor text, fall back to any English entry."""
    preferred_versions = CFG["preferred_flavor_versions"]
    entries_by_version = {}
    for entry in species_data.get("flavor_text_entries", []):
        if entry["language"]["name"] == "en":
            ver = entry["version"]["name"]
            entries_by_version[ver] = entry["flavor_text"].replace("\n", " ").replace("\f", " ")

    for ver in preferred_versions:
        if ver in entries_by_version:
            return entries_by_version[ver]

    if entries_by_version:
        return list(entries_by_version.values())[0]
    return ""


def get_gender_ratio(species_data: dict) -> dict:
    rate = species_data.get("gender_rate", -1)
    if rate == -1:
        return {"genderless": True}
    female_pct = round((rate / 8) * 100, 1)
    male_pct = round(100 - female_pct, 1)
    return {"male": male_pct, "female": female_pct}


def get_abilities(pokemon_data: dict) -> dict:
    regular = []
    hidden = None
    for slot in pokemon_data.get("abilities", []):
        name = slot["ability"]["name"].replace("-", " ").title()
        if slot["is_hidden"]:
            hidden = name
        else:
            regular.append(name)
    return {"regular": regular, "hidden": hidden}


def get_types(pokemon_data: dict) -> list[str]:
    types = [t["type"]["name"].capitalize() for t in pokemon_data.get("types", [])]
    # PokeAPI returns modern types. Fairy didn't exist before Gen 6, so strip it
    # for Gen 4/5 datasets. For Pokémon that were pure Fairy in modern data,
    # stripping leaves them empty — restore their pre-Gen-6 typing here.
    if CFG.get("version_group") in ("platinum", "black-white"):
        name = pokemon_data["name"]
        if name in PRE_FAIRY_TYPES:
            return PRE_FAIRY_TYPES[name]
        types = [t for t in types if t != "Fairy"]
    return types


# Historical types for Pokémon retyped to (or partly to) Fairy in Gen 6.
# Only those whose modern types become empty/wrong after stripping Fairy need an entry.
PRE_FAIRY_TYPES = {
    "cleffa":   ["Normal"],
    "clefairy": ["Normal"],
    "clefable": ["Normal"],
    "togepi":   ["Normal"],
    "togetic":  ["Normal", "Flying"],
    "togekiss": ["Normal", "Flying"],
}


def get_base_stats(pokemon_data: dict) -> tuple[dict, int]:
    stat_name_map = {
        "hp": "hp",
        "attack": "attack",
        "defense": "defense",
        "special-attack": "sp_atk",
        "special-defense": "sp_def",
        "speed": "speed",
    }
    stats = {}
    total = 0
    for s in pokemon_data.get("stats", []):
        key = stat_name_map.get(s["stat"]["name"])
        if key:
            val = s["base_stat"]
            stats[key] = val
            total += val
    return stats, total


def get_held_items(pokemon_data: dict) -> list[dict]:
    version = CFG["version"]
    items = []
    for item_slot in pokemon_data.get("held_items", []):
        item_name = item_slot["item"]["name"].replace("-", " ").title()
        for version_detail in item_slot["version_details"]:
            if version_detail["version"]["name"] == version:
                items.append({
                    "item": item_name,
                    "rarity": version_detail["rarity"],
                })
    return items


def get_moves_for_version_group(pokemon_data: dict) -> dict:
    """Extract moves learned in the active version group (level_up, tm_hm, tutor, egg)."""
    version_group = CFG["version_group"]
    level_up = []
    tm_hm = []
    tutor = []
    egg = []

    for move_entry in pokemon_data.get("moves", []):
        move_id = move_entry["move"]["name"]
        for vgd in move_entry["version_group_details"]:
            if vgd["version_group"]["name"] != version_group:
                continue
            method = vgd["move_learn_method"]["name"]
            level = vgd["level_learned_at"]

            if method == "level-up":
                level_up.append({"level": level, "move_id": move_id})
            elif method == "machine":
                tm_hm.append(move_id)
            elif method == "tutor":
                tutor.append(move_id)
            elif method == "egg":
                egg.append(move_id)

    level_up.sort(key=lambda x: x["level"])
    return {
        "level_up": level_up,
        "tm_hm": sorted(tm_hm),
        "tutor": sorted(tutor),
        "egg": sorted(egg),
    }


def get_encounters_for_version(national_dex_id: int) -> list[dict]:
    """Fetch encounter locations for a Pokémon, filtered to the active version."""
    version = CFG["version"]
    url = f"{BASE_URL}/pokemon/{national_dex_id}/encounters"
    raw = fetch(url)
    encounters = []

    for loc_entry in raw:
        location_id = loc_entry["location_area"]["name"]
        for version_detail in loc_entry["version_details"]:
            if version_detail["version"]["name"] != version:
                continue
            for encounter_detail in version_detail["encounter_details"]:
                method = encounter_detail["method"]["name"]
                min_lvl = encounter_detail.get("min_level")
                max_lvl = encounter_detail.get("max_level")
                chance = encounter_detail.get("chance")

                time_of_day = "all"
                for cond in encounter_detail.get("condition_values", []):
                    cname = cond["name"]
                    if "morning" in cname:
                        time_of_day = "morning"
                    elif "day" in cname:
                        time_of_day = "day"
                    elif "night" in cname:
                        time_of_day = "night"

                special = None
                if "swarm" in location_id or any("swarm" in c["name"] for c in encounter_detail.get("condition_values", [])):
                    special = "swarm"
                elif "trophy-garden" in location_id:
                    special = "trophy-garden"

                encounters.append({
                    "location": location_id,
                    "method": method,
                    "level_range": [min_lvl, max_lvl],
                    "rate_percent": chance,
                    "time_of_day": time_of_day,
                    "special": special,
                })

    return encounters


def classify_version_exclusive(name_lower: str) -> str | None:
    """Return 'white' / 'black' / None for Gen 5; always None for Gen 4."""
    if CFG.get("version") != "black":
        return None
    if name_lower in WHITE_EXCLUSIVES:
        return "white"
    if name_lower in BLACK_EXCLUSIVES:
        return "black"
    return None

# ---------------------------------------------------------------------------
# Step 3 — Evolution chains
# ---------------------------------------------------------------------------

def parse_evolution_chain(chain_data: dict, chain_id: int, regional_name_to_dex: dict) -> dict:
    """Recursively flatten an evolution chain (may branch)."""

    def parse_link(link: dict) -> dict:
        name = link["species"]["name"]
        national_id = link["species"]["url"].rstrip("/").split("/")[-1]
        regional_num = regional_name_to_dex.get(name)

        node = {
            "pokemon_id": name,
            "name": name.capitalize(),
            "regional_dex": regional_num,
            "national_dex": int(national_id),
            "sprite_url": f"{SPRITE_BASE}/{national_id}.png",
        }

        evo_details = link.get("evolution_details", [])
        if evo_details:
            detail = evo_details[0]
            trigger = detail.get("trigger", {}).get("name", "")
            method_info = {"trigger": trigger}

            if trigger == "level-up":
                if detail.get("min_level"):
                    method_info["level"] = detail["min_level"]
                if detail.get("min_happiness"):
                    method_info["happiness"] = detail["min_happiness"]
                if detail.get("time_of_day"):
                    method_info["time_of_day"] = detail["time_of_day"]
                if detail.get("known_move"):
                    method_info["known_move"] = detail["known_move"]["name"]
                if detail.get("location"):
                    method_info["location"] = detail["location"]["name"]
                if detail.get("min_beauty"):
                    method_info["beauty"] = detail["min_beauty"]
            elif trigger == "use-item":
                if detail.get("item"):
                    method_info["item"] = detail["item"]["name"].replace("-", " ").title()
            elif trigger == "trade":
                if detail.get("held_item"):
                    method_info["held_item"] = detail["held_item"]["name"].replace("-", " ").title()

            node["method"] = method_info

        next_stages = link.get("evolves_to", [])
        if next_stages:
            node["evolves_to"] = [parse_link(n) for n in next_stages]

        return node

    root = chain_data["chain"]
    return {
        "chain_id": chain_id,
        "stages": parse_link(root),
    }

# ---------------------------------------------------------------------------
# Step 4 — Move details
# ---------------------------------------------------------------------------

def get_move_details(move_id: str) -> dict | None:
    """Fetch a single move's details from PokeAPI."""
    try:
        data = fetch(f"{BASE_URL}/move/{move_id}/")
    except Exception:
        return None

    effect_text = ""
    for entry in data.get("effect_entries", []):
        if entry["language"]["name"] == "en":
            effect_text = entry.get("short_effect", entry.get("effect", ""))
            break

    if not effect_text:
        for entry in data.get("flavor_text_entries", []):
            vg = entry.get("version_group", {}).get("name")
            if entry["language"]["name"] == "en" and vg in CFG["preferred_move_version_groups"]:
                effect_text = entry["flavor_text"].replace("\n", " ").replace("\f", " ")
                break

    effect_chance = data.get("effect_chance")
    if effect_chance is not None:
        effect_text = effect_text.replace("$effect_chance", str(effect_chance))

    category_map = {"physical": "Physical", "special": "Special", "status": "Status"}
    damage_class = data.get("damage_class", {}).get("name", "status")

    return {
        "name": data["name"].replace("-", " ").title(),
        "type": data.get("type", {}).get("name", "").capitalize(),
        "category": category_map.get(damage_class, "Status"),
        "power": data.get("power"),
        "accuracy": data.get("accuracy"),
        "pp": data.get("pp"),
        "priority": data.get("priority", 0),
        "description": effect_text,
        "learned_by": {
            "level_up": {},
            "tm_hm": {},
            "tutor": {},
            "egg": {},
        }
    }

# ---------------------------------------------------------------------------
# Step 5 — Type effectiveness chart (Gen 4/5 — both 17 types, no Fairy)
# ---------------------------------------------------------------------------

GEN4_5_TYPES = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
    "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
    "Rock", "Ghost", "Dragon", "Dark", "Steel"
]

def build_type_chart() -> dict:
    region = CFG["region"]
    print(f"\n[5/6] Building {region} type chart (17 types)...")
    matrix = {t: {} for t in GEN4_5_TYPES}

    for atk_type in GEN4_5_TYPES:
        data = fetch(f"{BASE_URL}/type/{atk_type.lower()}/")
        relations = data.get("damage_relations", {})

        for def_type in GEN4_5_TYPES:
            matrix[atk_type][def_type] = 1

        for rel in relations.get("double_damage_to", []):
            t = rel["name"].capitalize()
            if t in matrix[atk_type]:
                matrix[atk_type][t] = 2

        for rel in relations.get("half_damage_to", []):
            t = rel["name"].capitalize()
            if t in matrix[atk_type]:
                matrix[atk_type][t] = 0.5

        for rel in relations.get("no_damage_to", []):
            t = rel["name"].capitalize()
            if t in matrix[atk_type]:
                matrix[atk_type][t] = 0

    return {"types": GEN4_5_TYPES, "matrix": matrix}


def compute_type_matchups(types: list[str], type_chart: dict) -> dict:
    matrix = type_chart["matrix"]
    matchups = {}

    for atk_type in GEN4_5_TYPES:
        multiplier = 1.0
        for def_type in types:
            multiplier *= matrix.get(atk_type, {}).get(def_type, 1)
        if multiplier != 1.0:
            matchups[atk_type] = multiplier

    return {
        "weak_to_4x": [t for t, m in matchups.items() if m == 4],
        "weak_to_2x": [t for t, m in matchups.items() if m == 2],
        "resistant_0_5x": [t for t, m in matchups.items() if m == 0.5],
        "resistant_0_25x": [t for t, m in matchups.items() if m == 0.25],
        "immune_to": [t for t, m in matchups.items() if m == 0],
    }

# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Fetch PokeAPI data for one generation.")
    parser.add_argument("--gen", type=int, choices=(4, 5), default=4,
                        help="Generation to build (default: 4)")
    args = parser.parse_args()

    global CFG
    CFG = GEN_CONFIG[args.gen]
    output_dir = SCRIPT_DIR.parent / "src" / "data" / f"gen{args.gen}"
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"=== Building Gen {args.gen} ({CFG['region']} — {CFG['version']}) ===")

    # --- Step 1: Regional dex index ---
    regional_entries = get_regional_dex()
    regional_name_to_dex = {name: num for num, name in regional_entries}

    expected = CFG["expected_count"]
    if len(regional_entries) != expected:
        print(f"  WARNING: expected {expected} entries, got {len(regional_entries)}")

    # --- Step 2: Per-Pokémon data ---
    print(f"\n[2/6] Fetching data for {len(regional_entries)} Pokémon...")
    pokemon_list = []
    all_move_ids = set()
    evolution_chain_ids_seen = set()
    evolution_chains_raw = {}

    for regional_num, name in regional_entries:
        print(f"  [{regional_num:03d}/{len(regional_entries)}] {name.capitalize()}")

        species_data = fetch(f"{BASE_URL}/pokemon-species/{name}/")
        national_id = int(species_data["id"])
        pokemon_data = fetch(f"{BASE_URL}/pokemon/{national_id}/")

        types = get_types(pokemon_data)
        base_stats, bst = get_base_stats(pokemon_data)
        abilities = get_abilities(pokemon_data)
        moves = get_moves_for_version_group(pokemon_data)
        held_items = get_held_items(pokemon_data)
        version_exclusive = classify_version_exclusive(name)

        # White-exclusives have no Black encounters; skip the fetch entirely.
        if version_exclusive == "white":
            encounters = []
        else:
            encounters = get_encounters_for_version(national_id)

        flavor_text = get_flavor_text(species_data)
        gender_ratio = get_gender_ratio(species_data)

        egg_cycles = species_data.get("hatch_counter", 0)
        hatch_steps = egg_cycles * 255

        egg_groups = [g["name"].replace("-", " ").title() for g in species_data.get("egg_groups", [])]

        for mu in moves["level_up"]:
            all_move_ids.add(mu["move_id"])
        for mid in moves["tm_hm"] + moves["tutor"] + moves["egg"]:
            all_move_ids.add(mid)

        chain_url = species_data.get("evolution_chain", {}).get("url", "")
        chain_id = int(chain_url.rstrip("/").split("/")[-1]) if chain_url else None
        if chain_id and chain_id not in evolution_chain_ids_seen:
            evolution_chain_ids_seen.add(chain_id)
            chain_data = fetch(chain_url)
            evolution_chains_raw[chain_id] = chain_data

        record = {
            "regional_dex": regional_num,
            "national_dex": national_id,
            "name": name.capitalize(),
            "types": types,
            "description": flavor_text,
            "sprite_url": f"{SPRITE_BASE}/{national_id}.png",
            "base_stats": base_stats,
            "base_stat_total": bst,
            "abilities": abilities,
            "height": round(pokemon_data.get("height", 0) / 10, 1),
            "weight": round(pokemon_data.get("weight", 0) / 10, 1),
            "catch_rate": species_data.get("capture_rate"),
            "gender_ratio": gender_ratio,
            "egg_groups": egg_groups,
            "hatch_steps": hatch_steps,
            "held_items": held_items,
            "evolution_chain_id": chain_id,
            "moves": moves,
            "encounters": encounters,
            "type_matchups": None,  # filled in after type chart is built
        }
        if args.gen >= 5:
            record["version_exclusive"] = version_exclusive
        pokemon_list.append(record)

    # --- Step 3: Move details ---
    print(f"\n[3/6] Fetching {len(all_move_ids)} move details...")
    moves_data = {}
    for move_id in sorted(all_move_ids):
        print(f"  move: {move_id}")
        details = get_move_details(move_id)
        if details:
            moves_data[move_id] = details

    for poke in pokemon_list:
        name_lower = poke["name"].lower()
        for entry in poke["moves"]["level_up"]:
            mid = entry["move_id"]
            if mid in moves_data:
                moves_data[mid]["learned_by"]["level_up"][name_lower] = entry["level"]
        for mid in poke["moves"]["tm_hm"]:
            if mid in moves_data:
                moves_data[mid]["learned_by"]["tm_hm"][name_lower] = True
        for mid in poke["moves"]["tutor"]:
            if mid in moves_data:
                moves_data[mid]["learned_by"]["tutor"][name_lower] = True
        for mid in poke["moves"]["egg"]:
            if mid in moves_data:
                moves_data[mid]["learned_by"]["egg"][name_lower] = True

    # --- Step 4: Evolution chains ---
    print(f"\n[4/6] Parsing {len(evolution_chains_raw)} evolution chains...")
    evolutions = []
    for chain_id, chain_data in sorted(evolution_chains_raw.items()):
        parsed = parse_evolution_chain(chain_data, chain_id, regional_name_to_dex)
        evolutions.append(parsed)

    # --- Step 5: Type chart ---
    type_chart = build_type_chart()

    for poke in pokemon_list:
        poke["type_matchups"] = compute_type_matchups(poke["types"], type_chart)

    # --- Step 6: Locations index ---
    print("\n[6/6] Building locations index...")
    locations = {}
    for poke in pokemon_list:
        for enc in poke["encounters"]:
            loc_id = enc["location"]
            if loc_id not in locations:
                loc_name = loc_id.replace("-", " ").title()
                locations[loc_id] = {"name": loc_name, "encounters": []}
            locations[loc_id]["encounters"].append({
                "pokemon_id": poke["name"].lower(),
                "pokemon_name": poke["name"],
                "regional_dex": poke["regional_dex"],
                "national_dex": poke["national_dex"],
                "sprite_url": poke["sprite_url"],
                "method": enc["method"],
                "level_range": enc["level_range"],
                "rate_percent": enc["rate_percent"],
                "time_of_day": enc["time_of_day"],
                "special": enc["special"],
            })

    for poke in pokemon_list:
        poke["encounters"] = [
            {
                "location": e["location"],
                "method": e["method"],
                "level_range": e["level_range"],
                "rate_percent": e["rate_percent"],
                "time_of_day": e["time_of_day"],
                "special": e["special"],
            }
            for e in poke["encounters"]
        ]

    # --- Write output files ---
    print("\nWriting output files...")
    out_pokemon    = output_dir / "pokemon.json"
    out_moves      = output_dir / "moves.json"
    out_locations  = output_dir / "locations.json"
    out_evolutions = output_dir / "evolutions.json"
    out_type_chart = output_dir / "type_chart.json"

    with open(out_pokemon, "w") as f:
        json.dump(pokemon_list, f, indent=2)
    print(f"  Wrote {out_pokemon} ({len(pokemon_list)} Pokémon)")

    with open(out_moves, "w") as f:
        json.dump(moves_data, f, indent=2)
    print(f"  Wrote {out_moves} ({len(moves_data)} moves)")

    with open(out_locations, "w") as f:
        json.dump(locations, f, indent=2)
    print(f"  Wrote {out_locations} ({len(locations)} locations)")

    with open(out_evolutions, "w") as f:
        json.dump(evolutions, f, indent=2)
    print(f"  Wrote {out_evolutions} ({len(evolutions)} chains)")

    with open(out_type_chart, "w") as f:
        json.dump(type_chart, f, indent=2)
    print(f"  Wrote {out_type_chart}")

    # --- Validation ---
    print("\n--- Validation ---")
    assert len(pokemon_list) == expected, f"Expected {expected} Pokémon, got {len(pokemon_list)}"
    print(f"  OK: exactly {expected} Pokémon")

    dex_nums = sorted(p["regional_dex"] for p in pokemon_list)
    # Some regional dexes (e.g. Unova B/W) are 0-indexed (Victini=000); accept either.
    assert dex_nums == list(range(dex_nums[0], dex_nums[0] + expected)), \
        f"Regional dex numbers are not contiguous: min={dex_nums[0]}, max={dex_nums[-1]}, count={len(dex_nums)}"
    print(f"  OK: regional_dex values are {dex_nums[0]}-{dex_nums[-1]} with no gaps")

    no_moves = [p["name"] for p in pokemon_list if not p["moves"]["level_up"]]
    if no_moves:
        print(f"  WARNING: {len(no_moves)} Pokémon have no level-up moves: {no_moves[:5]}...")
    else:
        print("  OK: All Pokémon have at least one level-up move")

    for starter in CFG["starters"]:
        match = next((p for p in pokemon_list if p["name"].lower() == starter), None)
        if match:
            print(f"  OK: {starter.capitalize()} found at {CFG['region']} #{match['regional_dex']} (national #{match['national_dex']})")
        else:
            print(f"  WARNING: {starter} not found in output!")

    if args.gen >= 5:
        white_count = sum(1 for p in pokemon_list if p.get("version_exclusive") == "white")
        black_count = sum(1 for p in pokemon_list if p.get("version_exclusive") == "black")
        print(f"  OK: version exclusives — White: {white_count}, Black: {black_count}")
        # Spot-check a few
        for n in ("zekrom", "thundurus", "solosis", "rufflet", "reshiram"):
            m = next((p for p in pokemon_list if p["name"].lower() == n), None)
            if m:
                print(f"    {n.capitalize():10} → version_exclusive={m.get('version_exclusive')!r}")

    assert len(type_chart["types"]) == 17, "Type chart should have 17 types"
    for t in GEN4_5_TYPES:
        assert len(type_chart["matrix"][t]) == 17, f"Type {t} row is missing entries"
    print("  OK: Type chart is 17x17")

    print(f"\nDone! All data files written to {output_dir}/")


if __name__ == "__main__":
    main()
