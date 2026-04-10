@echo off
chcp 65001 >nul
echo ==========================================
echo  PUSH PROJET SUR GITHUB
echo ==========================================
echo.

REM Aller dans le dossier projet
cd /d "C:\dev\Projet Immo Global\Projet Immo Global\Projet Immo Global"

echo [1/5] Initialisation Git...
git init

echo.
echo [2/5] Configuration Git (modifiez avec vos infos)...
git config user.email "votre-email@example.com"
git config user.name "Votre Nom"

echo.
echo [3/5] Ajout des fichiers...
git add .

echo.
echo [4/5] Creation du commit...
git commit -m "Initial commit - Projet Immobilier Global v1.0"

echo.
echo [5/5] Connexion a GitHub et push...
echo !!! ATTENTION !!!
echo Remplacez TON_USERNAME par votre pseudo GitHub avant d'executer
echo.
REM Decommentez et modifiez la ligne suivante :
REM git remote add origin https://github.com/TON_USERNAME/projet-immobilier-global.git
REM git branch -M main
REM git push -u origin main

echo.
echo ==========================================
echo  MODIFIEZ CE FICHIER :
echo  1. Ouvrez PUSH_GITHUB.bat dans un editeur
echo  2. Remplacez TON_USERNAME par votre pseudo
echo  3. Decommentez les lignes git remote/push
echo  4. Sauvegardez et relancez
echo ==========================================
pause
