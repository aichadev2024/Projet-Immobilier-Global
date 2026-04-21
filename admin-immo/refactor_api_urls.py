import os
import re

# Directory to search
SEARCH_DIRS = ['app', 'components', 'services', 'lib']
ROOT_DIR = r'c:\dev\Projet Immo Global\admin-immo'
TARGET_URL = 'http://localhost:8080'
REPLACEMENT = '${API_BASE_URL}'
IMPORT_LINE = 'import { API_BASE_URL } from "@/services/api";\n'

def refactor_file(file_path):
    # Skip the configuration file itself to avoid circular references or logic errors
    if 'services\\api.ts' in file_path or 'services/api.ts' in file_path:
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if TARGET_URL not in content:
        return

    print(f"Refactoring: {file_path}")

    # Replace the URL
    new_content = content.replace(TARGET_URL, REPLACEMENT)

    # Add import if needed
    if 'API_BASE_URL' in new_content and 'import { API_BASE_URL }' not in new_content:
        # Try to insert after 'use client' or at the top
        if '"use client"' in new_content:
            new_content = new_content.replace('"use client";', f'"use client";\n{IMPORT_LINE}')
        elif "'use client'" in new_content:
            new_content = new_content.replace("'use client';", f"'use client';\n{IMPORT_LINE}")
        else:
            new_content = IMPORT_LINE + new_content

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

def main():
    for d in SEARCH_DIRS:
        full_path = os.path.join(ROOT_DIR, d)
        if not os.path.exists(full_path):
            continue
        for root, _, files in os.walk(full_path):
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    refactor_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
