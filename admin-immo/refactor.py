import os
import shutil
import re

base_dir = r"c:\dev\Projet Immo Global\Projet Immo Global\Projet Immo Global\admin-immo"

# 1. Move app/components to components/vitrine
app_components = os.path.join(base_dir, "app", "components")
components_vitrine = os.path.join(base_dir, "components", "vitrine")
if os.path.exists(app_components):
    os.makedirs(components_vitrine, exist_ok=True)
    for f in os.listdir(app_components):
        src = os.path.join(app_components, f)
        dst = os.path.join(components_vitrine, f)
        shutil.move(src, dst)
    # Don't delete app/components yet if we need to remove it, rmdir works if empty
    os.rmdir(app_components)

# 2. Move app/services to services
app_services = os.path.join(base_dir, "app", "services")
services_dir = os.path.join(base_dir, "services")
if os.path.exists(app_services):
    os.makedirs(services_dir, exist_ok=True)
    for f in os.listdir(app_services):
        src = os.path.join(app_services, f)
        dst = os.path.join(services_dir, f)
        shutil.move(src, dst)
    os.rmdir(app_services)

# 3. Create app/(auth) and move auth routes
app_dir = os.path.join(base_dir, "app")
auth_dir = os.path.join(app_dir, "(auth)")
os.makedirs(auth_dir, exist_ok=True)

auth_routes = ["login", "register", "forgot-password", "reset-password", "validate-otp"]
for route in auth_routes:
    src = os.path.join(app_dir, route)
    dst = os.path.join(auth_dir, route)
    if os.path.exists(src):
        shutil.move(src, dst)

print("Directories moved successfully")
