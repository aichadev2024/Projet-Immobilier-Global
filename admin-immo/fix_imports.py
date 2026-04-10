import os
import re

base_dir = r"c:\dev\Projet Immo Global\Projet Immo Global\Projet Immo Global\admin-immo"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content

    # 1. Update imports for components/vitrine (formerly app/components)
    # In app/page.tsx: import VitrineNavbar from "./components/VitrineNavbar";
    new_content = re.sub(r'from\s+["\']\./components/([^"\'\.]+)["\']', r'from "@/components/vitrine/\1"', new_content)
    
    # In app/login/page.tsx or others: import BrandMark from "../components/BrandMark"; -> now it should point to vitrine
    # NOTE: Be careful not to replace `@/components/...`
    new_content = re.sub(r'from\s+["\']\.\./components/([^"\'\.]+)["\']', r'from "@/components/vitrine/\1"', new_content)

    # 2. Update imports for services (formerly app/services)
    # e.g., import api from "../services/api" or "../../services/api"
    new_content = re.sub(r'from\s+["\'](?:\.\./)+services/([^"\'\.]+)["\']', r'from "@/services/\1"', new_content)

    # Note: What if someone used `@/app/services/...`? Let's fix that just in case:
    new_content = re.sub(r'from\s+["\']@/app/services/([^"\'\.]+)["\']', r'from "@/services/\1"', new_content)

    # What if someone used `@/app/components/...`?
    new_content = re.sub(r'from\s+["\']@/app/components/([^"\'\.]+)["\']', r'from "@/components/vitrine/\1"', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(base_dir):
    if "node_modules" in root or ".next" in root:
        continue
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            process_file(os.path.join(root, file))

print("Imports updated successfully")
