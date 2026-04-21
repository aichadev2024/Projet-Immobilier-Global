import os
import re

SEARCH_DIRS = ['app', 'components', 'services', 'lib']
ROOT_DIR = r'c:\dev\Projet Immo Global\admin-immo'
PATTERN = r'["\']\${API_BASE_URL}(.*?)["\']'
REPLACEMENT = r'`${API_BASE_URL}\1`'

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = re.sub(PATTERN, REPLACEMENT, content)

    if new_content != content:
        print(f"Fixed quotes in: {file_path}")
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
                    fix_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
