import os
import re

def find_imports(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    # Find lines starting with "from app..." or "import app..."
    imports = re.findall(r'^(?:from|import)\s+(app[\.\w]+)', content, re.MULTILINE)
    return imports

def map_connections():
    print(f"\n{'='*20} PROJECT CONNECTIONS {'='*20}")
    # Walk through all folders starting from current location
    for root, _, files in os.walk("."):
        for file in files:
            if file.endswith(".py") and file != "map_project.py":
                path = os.path.join(root, file)
                # Get the folder/file name (e.g., app/models/models.py)
                clean_path = os.path.relpath(path, ".")
                
                # Find what this file imports
                connections = find_imports(path)
                
                if connections:
                    print(f"\n📄 {clean_path}")
                    for conn in connections:
                        print(f"  └── 🔗 Imports: {conn}")

if __name__ == "__main__":
    map_connections()
    input("\nPress Enter to close...")