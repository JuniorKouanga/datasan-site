# DataSan Systems — site vitrine

Site statique de l'association DataSan Systems, publié sur **www.datasan.net** via Cloudflare Workers (Worker `datasan-site`).

## Structure

```
public/            fichiers publiés tels quels
  index.html       page unique (mission, domaines, projets, gouvernance, équipe, actualités, contact)
  404.html
  assets/css/      feuille de style
  assets/js/       menu mobile et galerie photo
  assets/img/      logos, photos de l'AG du 31 octobre 2026
wrangler.jsonc     configuration Cloudflare Workers (fichiers statiques)
```

Aucune étape de compilation : on modifie `public/index.html`, on pousse, c'est en ligne.

## Déploiement

**Automatique (recommandé)** — Cloudflare → Workers & Pages → `datasan-site` → Settings → Build → *Connect* ce dépôt GitHub, branche `main`, commande de déploiement `npx wrangler deploy`. Chaque `git push` sur `main` met le site à jour.

**Manuel** — depuis ce dossier :

```
npm install
npx wrangler login
npx wrangler deploy
```

Le domaine personnalisé (datasan.net / www.datasan.net) se gère dans Cloudflare → `datasan-site` → Settings → Domains & Routes.

## Mettre à jour le contenu

- Ajouter une actualité : dupliquer le bloc `<article class="news">` dans `index.html`.
- Ajouter des photos : les placer dans `public/assets/img/` en deux tailles (1600 px et 800 px, suffixe `-sm`).
- Règle de la charte de travail : rien n'est publié sans validation de la Communication, et aucun accord n'est annoncé avant d'être écrit.
