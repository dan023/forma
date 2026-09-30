#!/usr/bin/env bash
# Scarica i dati grezzi del catalogo alimenti in data/raw/ (ignorata da git).
# Uso: bash scripts/catalog/fetch-sources.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

CIQUAL_BASE="https://entrepot.recherche.data.gouv.fr/api/access/datafile"   # doi:10.57745/RDMHWY (CIQUAL 2025, Etalab 2.0)
USDA_BASE="https://fdc.nal.usda.gov/fdc-datasets"                            # FoodData Central (CC0 1.0)

mkdir -p data/raw/ciqual data/raw/usda/foundation data/raw/usda/sr

for f in 666252:alim 666250:alim_grp 666246:const 666249:compo; do
  curl -fsSL "$CIQUAL_BASE/${f%%:*}" -o "data/raw/ciqual/${f##*:}.xml"
done

curl -fsSL "$USDA_BASE/FoodData_Central_foundation_food_csv_2026-04-30.zip" -o data/raw/usda/foundation.zip
curl -fsSL "$USDA_BASE/FoodData_Central_sr_legacy_food_csv_2018-04.zip" -o data/raw/usda/sr.zip
unzip -oq data/raw/usda/foundation.zip -d data/raw/usda/foundation
unzip -oq data/raw/usda/sr.zip -d data/raw/usda/sr
echo "Fatto: data/raw/"
