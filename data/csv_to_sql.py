#!/usr/bin/env python3
"""
Parse Designer_export.csv and generate SQL UPDATE statements to merge
CSV data into the designers table. Transforms:
  - eras: era_images[{image_url}] -> images[url, ...]
  - signature_pieces: farfetch_url -> link
  - known_for_tags: ["string"] -> [{name, description}]
"""
import csv
import json
import sys

def transform_eras(eras_json):
    try:
        eras = json.loads(eras_json)
    except Exception as e:
        print(f"  WARN: eras parse error: {e}", file=sys.stderr)
        return '[]'
    out = []
    for era in eras:
        images = []
        for img in era.get('era_images', []):
            url = img.get('image_url', '') if isinstance(img, dict) else img
            if url:
                images.append(url)
        out.append({
            'title': era.get('title', ''),
            'year_range': era.get('year_range', ''),
            'description': era.get('description', ''),
            'images': images,
        })
    return json.dumps(out, ensure_ascii=False)

def transform_pieces(pieces_json):
    try:
        pieces = json.loads(pieces_json)
    except Exception as e:
        print(f"  WARN: pieces parse error: {e}", file=sys.stderr)
        return '[]'
    out = []
    for p in pieces:
        out.append({
            'name': p.get('name', ''),
            'image_url': p.get('image_url', ''),
            'link': p.get('link', '') or p.get('farfetch_url', ''),
        })
    return json.dumps(out, ensure_ascii=False)

def transform_tags(tags_json):
    try:
        tags = json.loads(tags_json)
    except Exception as e:
        print(f"  WARN: tags parse error: {e}", file=sys.stderr)
        return '[]'
    out = []
    for tag in tags:
        if isinstance(tag, str):
            out.append({'name': tag, 'description': ''})
        elif isinstance(tag, dict):
            out.append({'name': tag.get('name', ''), 'description': tag.get('description', '')})
    return json.dumps(out, ensure_ascii=False)

def q(s):
    """Escape a value for SQL single-quoted string."""
    return "'" + str(s).replace("'", "''") + "'"

stmts = []

with open('data/Designer_export.csv', encoding='utf-8-sig', newline='') as f:
    reader = csv.DictReader(f)
    for row in reader:
        slug = row['slug'].strip()
        name = row['name'].strip()
        print(f"Processing: {name} (slug={slug})", file=sys.stderr)

        eras    = transform_eras(row['eras'])
        pieces  = transform_pieces(row['signature_pieces'])
        tags    = transform_tags(row['known_for_tags'])

        stmt = (
            f"UPDATE designers SET\n"
            f"  name = {q(name)},\n"
            f"  origin_location = {q(row['origin_location'].strip())},\n"
            f"  origin_meaning = {q(row['origin_meaning'].strip())},\n"
            f"  known_for_tags = {q(tags)},\n"
            f"  founder = {q(row['founder'].strip())},\n"
            f"  signature_pieces = {q(pieces)},\n"
            f"  eras = {q(eras)},\n"
            f"  phonetic = {q(row['phonetic'].strip())},\n"
            f"  creative_director = {q(row['creative_director'].strip())},\n"
            f"  founded_year = {q(row['founded_year'].strip())},\n"
            f"  hero_image_url = {q(row['hero_image_url'].strip())},\n"
            f"  audio_url = {q(row['audio_url'].strip())},\n"
            f"  updated_at = datetime('now')\n"
            f"WHERE slug = {q(slug)};"
        )
        stmts.append(stmt)

sql = '\n\n'.join(stmts)
with open('data/csv_merge.sql', 'w', encoding='utf-8') as f:
    f.write(sql + '\n')

print(f"\nGenerated {len(stmts)} UPDATE statement(s) -> data/csv_merge.sql", file=sys.stderr)
print(f"SQL file size: {len(sql):,} bytes", file=sys.stderr)
