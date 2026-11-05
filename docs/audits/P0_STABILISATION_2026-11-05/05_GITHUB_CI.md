# 05 · GitHub Actions (CI) et protection de la branche (SetMate 1.9.3-p0)

Établi le 05/11/2026. Ce document ne déclare pas SetMate « stable » ni « prêt pour la production ». Il décrit le workflow écrit, les choix faits, les règles de protection PROPOSÉES, et ce qui n'a pas pu être exécuté.

Statuts utilisés : CORRIGÉ ET TESTÉ / IMPLÉMENTÉ NON VALIDÉ / BLOQUÉ / À TESTER SUR APPAREIL / NON COMMENCÉ.

| Élément | Statut |
|---|---|
| Workflow `.github/workflows/tests.yml` (3 jobs) | IMPLÉMENTÉ NON VALIDÉ : jamais exécuté par GitHub (aucun `git push`, consigne) |
| Garde-fous du workflow (`tests/verif_ci.js`) et leur test (`tests/ci_garde_fous.spec.js`) | CORRIGÉ ET TESTÉ en local (le vrai fichier passe, 19 entorses sont détectées) |
| Contrôle d'intégrité de déploiement (`tests/verif_deploiement.js`) | CORRIGÉ ET TESTÉ en local (vrais fichiers cohérents, 6 entorses détectées) |
| Protection de la branche `main` | NON COMMENCÉ : exige l'accord de Sabri, rien n'a été configuré |

---

## 1. Ce qui existait

`tests-automatiques:.github/workflows/tests.yml` (commit `c4306fa`) : un seul job, `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4` (étiquettes mobiles, pas de SHA), aucune clause `permissions`, aucun `concurrency`, aucune `persist-credentials: false`, déclenché sur tout `push` (étiquettes comprises) et `pull_request`. Les tests Playwright et le sabotage tournaient dans le même job de 15 minutes. Il ne vérifiait ni les doublons/syntaxe (`verif_statique.js`), ni la cohérence des fichiers de déploiement, ni le workflow lui-même.

## 2. Ce qui est écrit maintenant

Fichier : `.github/workflows/tests.yml`. Trois jobs.

| Job | Délai max | Contenu |
|---|---|---|
| `controles-statiques` | 10 min | `npm ci`, `node tests/verif_statique.js` (syntaxe, doublons, version = cache), `node tests/verif_deploiement.js` (voir §4), `node tests/verif_ci.js` (le workflow respecte ses propres règles) |
| `tests-navigateur` (après le premier) | 30 min | `npx playwright install --with-deps chromium webkit`, puis un pas par thème, tous avec `--workers=2` : persistance (`p0_persistance`), restauration (`p0_restauration`), injection (`p0_injection`), export Serato + protection de `_Serato_` + mécanisme du contrôle de sabotage + garde-fous CI (`p0_serato`, `sabotage_mecanisme`, `ci_garde_fous`), non-régression (`setmate.spec.js`). Puis `git diff --exit-code -- index.html sw.js manifest.webmanifest` (aucun test n'a modifié l'appli). Envoi des traces seulement en cas d'échec. |
| `controle-sabotage` (après le premier, en parallèle des tests) | 45 min | `node tests/sabotage.js` (le contrôle reste dans la CI), puis, même en cas d'échec, vérification que `index.html` est identique et qu'aucune copie `index.html.sabotage_bak` ne traîne |

Aucun test n'a été désactivé, supprimé ni assoupli pour obtenir du vert. Le contrôle de sabotage a deux entrées adaptées (voir §6).

### Règles demandées et où elles sont respectées

| Règle | Comment |
|---|---|
| `permissions: contents: read` | Une seule clause, au premier niveau, aucun job n'élargit (contrôlé par `verif_ci.js`) |
| Aucun secret | Aucun `secrets.*`, aucun `GITHUB_TOKEN` explicite ; `persist-credentials: false` au checkout pour ne pas laisser le jeton dans `.git` |
| Actions officielles figées | Voir §3 |
| Aucun déploiement ni publication | Aucune étape de déploiement, d'`environment`, de `git push`, de release ; `verif_ci.js` refuse ces motifs. Le seul envoi est `upload-artifact` (traces des échecs, 7 jours) : ce n'est pas une publication du site, mais l'artefact d'un dépôt public est téléchargeable par tout le monde ; il ne contient que des données fabriquées (pas de secret, pas de fichier personnel). Statut : à retirer si Sabri préfère. |
| Déclenchement | `pull_request` et `push` des branches (`branches: "**"`, donc plus les étiquettes). Conséquence : une branche avec une demande de fusion ouverte lance deux exécutions (une par événement), regroupées dans des groupes de concurrence différents (numéro de PR / référence). |
| `concurrency` | Groupe par numéro de PR ou par référence, `cancel-in-progress: true` : un nouvel envoi annule l'exécution précédente |
| Délais | `timeout-minutes` sur chaque job (10 / 30 / 45) |
| Pas de `continue-on-error` | Interdit par `verif_ci.js` |

## 3. Choix des versions des actions

Résolution faite en lecture seule le 05/11/2026 avec `gh api repos/<action>/releases/latest` puis `git/ref/tags/<étiquette>` (type `commit`, donc pas d'étiquette annotée à déréférencer). Le SHA de `actions/checkout` a été revérifié avec `commits/<sha>`.

| Action | Étiquette | SHA du commit | Publiée le | Âge au 05/11/2026 |
|---|---|---|---|---|
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` | 20/07/2026 | 3,5 mois |
| `actions/setup-node` | v7.1.0 | `949feb2413d6458794dcd2491c4babbbce0c15c1` | 08/10/2026 | 28 jours |
| `actions/upload-artifact` | v7.0.2 | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` | 07/10/2026 | 29 jours |

Pourquoi un SHA : une étiquette (`@v7`) peut être déplacée par son propriétaire ; un SHA ne le peut pas. Pourquoi ces versions : les dernières publiées depuis plus de deux semaines au moment du travail. Chaque ligne `uses:` porte un commentaire `# vX.Y.Z` pour qu'un humain lise la version ; `verif_ci.js` refuse une action non figée, sans commentaire de version, ou hors de l'organisation `actions/`.

Limite : je n'ai pas relu le code de ces actions ni leurs notes de version ligne à ligne ; la confiance repose sur le fait qu'elles sont publiées par GitHub (`actions/`) et figées. Mise à jour : à faire à la main (ou avec Dependabot, non configuré), en rechargeant le SHA avec la même commande.

Paramètres du dépôt lus (lecture seule) : `allowed_actions: all`, `sha_pinning_required: false`, droits par défaut du jeton `read`, approbation de PR par les workflows `false`. Un durcissement possible (non fait, nécessite l'accord de Sabri) : limiter les actions autorisées aux actions GitHub et exiger le figeage par SHA.

## 4. Intégrité des fichiers de déploiement (`tests/verif_deploiement.js`)

Sans réseau ni navigateur. Vérifie : `VERSION` de `index.html` = nom du cache de `sw.js` ; `manifest.webmanifest` est un JSON valide avec `name`, `start_url`, `display` et au moins une icône ; chaque icône du manifeste existe ; chaque fichier précaché par `sw.js` existe ; chaque fichier local référencé par `index.html` (`link`, `script`, `img`) existe. Résultat sur le dépôt actuel : cohérent. Six entorses sont testées (version divergente, icône absente, fichier précaché absent, manifeste illisible, référence locale absente, `sw.js` absent). Ce que ce contrôle ne dit pas : que le site est en ligne, ni que le cache d'un vrai iPhone a été renouvelé.

## 5. Ce qui a été lu sur le dépôt GitHub (lecture seule)

Commandes : `gh api repos/beeyondcontact-cyber/setmate` et sous-routes, le 05/11/2026.

| Fait | Valeur lue |
|---|---|
| Visibilité | **public** (`private: false`) |
| Branche par défaut | `main` ; branches distantes : `main`, `tests-automatiques` |
| Droits du compte connecté | administrateur (`admin`, `maintain`, `push`) |
| GitHub Pages | actif, source `main` à la racine `/`, `build_type: legacy`, état `built` |
| Protection de `main` | **aucune** : `GET .../branches/main/protection` répond 404 « Branch not protected » |
| Rulesets du dépôt | liste vide `[]` (la route répond 200, sans message de restriction de plan) |
| Plan du compte | **non vérifié** : le champ `plan` est `null` pour ce jeton |
| Workflows actifs | « Tests SetMate » (sur la branche portant le fichier), « pages-build-deployment » |

Conséquence importante : **`main` est la branche publiée** (Pages la sert telle quelle, sans étape de test). Tout ce qui est fusionné ou poussé sur `main` devient le site en ligne. Aujourd'hui rien ne l'empêche d'y pousser directement. Le fichier de workflow n'existe pas sur `main` : il est sur `tests-automatiques`.

## 6. Contrôle de sabotage : modifications

- `tests/sabotage.js` : copie de secours `index.html.sabotage_bak` écrite avant la première altération ; restauration au démarrage si une exécution précédente a été interrompue ; restauration en fin normale et en cas d'erreur (testées), gestionnaires de signaux d'arrêt (écrits, NON TESTÉS) ; vérification finale que le fichier est identique (code de sortie 2 sinon) ; `--workers=2`. Détail et test du mécanisme : `04_SERATO_VALIDATION.md` §6.
- Une entrée existante a dû être adaptée parce que son motif n'existe plus : « E-013 : le crate inutilisable est de nouveau téléchargé » ciblait `if(!root){crateImpossible();return;}` (supprimé avec les écritures dans Serato). Le test visé (« E-013 : … aucun fichier crate inutilisable n'est téléchargé ») n'a pas changé ; le sabotage réintroduit un téléchargement de `.crate` dans `exportSetCrate`.
- Ajout de 9 sabotages P0-04 (voir `04`), 25 au total.

## 7. Règles de protection de `main` PROPOSÉES (non appliquées)

À appliquer seulement avec l'accord de Sabri. Le dépôt est public et la route des rulesets répond sans restriction : la protection de branche et les rulesets sont donc probablement disponibles sur le plan actuel (le plan lui-même n'est pas vérifié ; à confirmer dans Réglages > Rules, ou par un essai en mode « Évaluer » du ruleset, qui n'applique rien).

Proposition, sous forme de ruleset sur la branche `main` :

1. **Exiger une demande de fusion** avant d'écrire sur `main` (plus de push direct). Approbations exigées : 0 tant que Sabri est seul à développer (1 approbation bloquerait ses propres fusions). Passer à 1 s'il y a un deuxième relecteur.
2. **Exiger que les contrôles réussissent** avant fusion : « Contrôles sans navigateur (syntaxe, doublons, déploiement, workflow) », « Tests Playwright (Chrome et moteur de Safari) », « Contrôle de sabotage (chaque bug connu doit faire échouer son test) ». Les noms viennent des champs `name` des jobs. Un contrôle n'est sélectionnable qu'après avoir tourné au moins une fois sur le dépôt.
3. **Exiger que la branche soit à jour** avec `main` avant fusion (évite de fusionner un test vert sur une base périmée).
4. **Interdire le push forcé** et la **suppression** de `main`.
5. **Résoudre les conversations** avant fusion (utile seulement s'il y a des relectures).
6. **Pas de contournement par défaut** ; un administrateur peut toujours désactiver la règle, ce qui laisse une trace dans le journal d'audit du dépôt. Pour un développeur seul, ne pas cocher « s'appliquer aussi aux administrateurs » rendrait la règle contournable en un clic ; la cocher le protège de lui-même mais exige de désactiver la règle en cas d'urgence.

Ordre d'application (important, sinon `main` se bloque) :
1. Fusionner d'abord le fichier de workflow dans `main` par une demande de fusion (sinon les contrôles exigés n'existent pas sur `main` et rien ne pourra être fusionné).
2. Laisser tourner une fois le workflow pour que les trois contrôles soient connus de GitHub.
3. Créer le ruleset d'abord en mode « Évaluer » (journalise sans bloquer), vérifier, puis passer en « Actif ».
4. Garder une porte de secours : savoir désactiver le ruleset depuis Réglages > Rules.

Rappel : cette protection ne remplace pas un test sur appareil. Elle garantit seulement que les tests automatiques ont été verts avant la mise en ligne.

## 8. Ce qui n'a PAS pu être exécuté ou vérifié

- **Le workflow n'a jamais tourné chez GitHub** (aucun push). Inconnus : temps réel de chaque job (les timeouts 10/30/45 min sont des estimations prudentes, non mesurées), installation `--with-deps` sur l'image du moment, comportement de `cache: npm`, durée du contrôle de sabotage avec 25 sabotages (chacun relance Playwright).
- Le workflow n'a pas été analysé par un validateur YAML externe (aucun outil installé, consigne de ne rien installer). Il a été relu, et `verif_ci.js` contrôle ses règles par lecture de texte, pas par un vrai analyseur YAML.
- Les résultats locaux des tests sont dans `04` et `02` ; ils ont tourné sous Windows, pas sous Ubuntu.
- La protection de `main` n'a pas été créée ni testée.
- Le plan GitHub du compte n'est pas vérifié.
- Les deux jobs lourds (`tests-navigateur`, `controle-sabotage`) réinstallent chacun les navigateurs : un peu plus de minutes, mais des jobs indépendants et un `index.html` jamais partagé entre le sabotage et les tests.
