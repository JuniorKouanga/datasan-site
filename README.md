# DataSan Systems — site internet

Site de l'association DataSan Systems, publié sur **www.datasan.net** (Cloudflare Workers, Worker `datasan-site`).
Chaque `git push` sur `main` déclenche la compilation (`npm run build`) puis la publication (`npx wrangler deploy`).

## Organisation

```
src/layout.html          en-tête, menu et pied de page communs
src/pages/               une page = un fichier (métadonnées JSON en commentaire en tête)
  index.html             accueil (à la une + actualités)
  association/  projets/  expertise/  statuts/  reglement-interieur/  contact/
  actualites/            liste + un dossier par article
src/data/news.json       liste des actualités (cartes de l'accueil et de la page Actualités)
src/data/statuts.json    texte des statuts (généré par tools_legal.py)
src/data/ri.json         texte du règlement intérieur (généré par tools_legal.py)
public/assets/           CSS, JS, images (fichiers statiques)
build.mjs                assemble les pages dans public/ (Node, sans dépendance)
```

## Ajouter une actualité

1. Créer `src/pages/actualites/<identifiant>/index.html` (copier un article existant).
2. Ajouter l'entrée correspondante en tête de `src/data/news.json`.
3. Pour la mettre à la une, modifier le bloc `home-hero` de `src/pages/index.html`.
4. `node build.mjs`, puis commit et push.

## Mettre à jour les statuts ou le règlement intérieur

Les textes viennent des fichiers Word de l'association, extraits en `src/data/statuts.txt` et `src/data/ri.txt`, puis convertis :

```
python3 tools_legal.py src/data/statuts.txt statuts src/data/statuts.json
python3 tools_legal.py src/data/ri.txt ri src/data/ri.json
node build.mjs
```

Règle de la charte de travail : rien n'est publié sans validation de la Communication, et aucun accord n'est annoncé avant d'être écrit.
