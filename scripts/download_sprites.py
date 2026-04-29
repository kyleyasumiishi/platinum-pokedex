"""
download_sprites.py — Local sprite downloader

Reads src/data/gen{N}/pokemon.json and downloads each Pokémon's sprite from
PokeAPI's sprites repo to public/sprites/{nationalDex}.png. Skips files that
already exist on disk so re-runs are cheap.

Run:
  python scripts/download_sprites.py --gen 5
"""

import argparse
import json
import time
from pathlib import Path

import requests

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
SPRITES_DIR = REPO_ROOT / "public" / "sprites"
SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon"


def main():
    parser = argparse.ArgumentParser(description="Download sprite PNGs for one generation.")
    parser.add_argument("--gen", type=int, choices=(4, 5), required=True,
                        help="Generation whose national_dex IDs to pull from")
    args = parser.parse_args()

    pokemon_json = REPO_ROOT / "src" / "data" / f"gen{args.gen}" / "pokemon.json"
    if not pokemon_json.exists():
        raise SystemExit(f"Missing {pokemon_json} — run fetch_pokeapi.py --gen {args.gen} first.")

    with open(pokemon_json) as f:
        pokemon = json.load(f)

    SPRITES_DIR.mkdir(parents=True, exist_ok=True)

    national_ids = sorted({p["national_dex"] for p in pokemon})
    print(f"Gen {args.gen}: {len(national_ids)} Pokémon, range #{national_ids[0]}–#{national_ids[-1]}")

    downloaded = 0
    skipped = 0
    failed = []

    for nid in national_ids:
        out_path = SPRITES_DIR / f"{nid}.png"
        if out_path.exists():
            skipped += 1
            continue

        url = f"{SPRITE_BASE}/{nid}.png"
        print(f"  Downloading #{nid} ← {url}")
        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            with open(out_path, "wb") as f:
                f.write(resp.content)
            downloaded += 1
        except Exception as e:
            print(f"    FAILED: {e}")
            failed.append(nid)

        time.sleep(0.6)

    print(f"\nDone. Downloaded: {downloaded}, already present: {skipped}, failed: {len(failed)}")
    if failed:
        print(f"  Failed national IDs: {failed}")


if __name__ == "__main__":
    main()
