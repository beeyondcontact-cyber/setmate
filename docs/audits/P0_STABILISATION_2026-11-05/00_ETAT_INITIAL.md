# 00 · État initial avant travaux (SetMate, 05/11/2026)

Ce document décrit ce qui existait avant les corrections P0. Il ne déclare pas SetMate fiable ni prêt pour des utilisateurs. Il sépare ce qui a été vérifié le 05/11/2026 de ce qui est seulement rapporté.

Statuts utilisés dans tout le dossier : CORRIGÉ ET TESTÉ / IMPLÉMENTÉ NON VALIDÉ / BLOQUÉ / À TESTER SUR APPAREIL / NON COMMENCÉ.

## 1. Dépôt et branches (vérifié le 05/11/2026)

| Élément | Valeur |
|---|---|
| Dépôt | `beeyondcontact-cyber/setmate`, visibilité **publique** |
| `main` | commit `382b661`, version **1.9.1** |
| Production | GitHub Pages, source `main`, à la racine, **sans aucun test** avant mise en ligne |
| Branche de départ du travail | créée depuis `c4306fa` (= branche `tests-automatiques`) |
| `index.html` de `c4306fa` | identique à celui de `main` (revérifié en lecture seule pendant la rédaction : `git diff` entre `c4306fa` et `382b661` sur `index.html` ne renvoie aucune différence) |
| Branche de travail | `fix/setmate-p0-stabilisation` |
| Arbre de travail au départ | propre |
| Demandes de fusion (PR) | aucune |
| Remisage (stash) | aucun |
| Autres worktrees | aucun, d'après le constat de départ. Observation faite à la rédaction : `git worktree list` montre le dossier `site` comme worktree de `main` (`382b661`). Ce n'est pas un travail concurrent, mais la liste n'était donc pas vide. On ne lance aucune commande Git dans `site`. |
| Protection de `main` | **absente** : la route répond 404 « Branch not protected » |
| Droits du compte sur le dépôt | administrateur |

Conséquence directe : tout ce qui arrive sur `main` devient le site en ligne, et rien n'oblige à passer par un test.

## 2. Processus sur la machine (vérifié le 05/11/2026)

Chrome, node et plusieurs sessions Claude étaient présents. Aucun ne travaillait sur ce dépôt : `git status` était propre. Aucun conflit d'écriture n'a été constaté.

## 3. Sauvegarde

- Une seule copie chiffrée du projet, datée du **01/11/2026**, sur le disque D:.
- Le mot de passe n'est connu que de Sabri. Aucune restauration de cette copie n'a été essayée dans ce travail.
- Cette copie couvre le projet. Elle ne couvre pas les données d'usage de l'appli (playlists, soirées, apprentissage), qui vivent dans le navigateur de l'iPhone (risque D-11 de l'audit précédent).

## 4. Mémoire de la machine

- 1,3 Go libres sur 15,9 Go au moment du constat.
- Cette pénurie a déjà provoqué l'arrêt d'un test par le système.
- Règle retenue : ne pas lancer le contrôle de sabotage sous 3 Go libres (voir `09_REPRISE_AUTONOME.md`).

## 5. Périmètre autorisé et interdits de la mission

Autorisé :
- travailler sur une **branche isolée** dans un worktree dédié ;
- corriger le code, ajouter des tests, écrire des documents Markdown dans `docs/audits/` ;
- lire l'état de GitHub en lecture seule.

Interdit :
- fusionner quoi que ce soit ;
- déployer ou publier ;
- modifier `main` ou la protection de `main` ;
- écrire ou manipuler un secret ;
- supprimer une fonctionnalité ou un test pour obtenir du vert ;
- toucher au Serato réel de Sabri (bibliothèque, `_Serato_`, base `database V2`).

Autres garde-fous appliqués : aucun assouplissement d'un test sans l'accord explicite de Sabri ; aucune écriture dans le dossier `site` ; aucun envoi sur GitHub (`git push`).

## 6. État des anomalies au départ

L'audit de transmission du 05/11/2026 (dossier `AUDIT_TRANSMISSION_DJ_CHATGPT`, fichier 05) listait **25 anomalies, toutes ouvertes** : 5 hautes, 15 moyennes, 5 faibles. Classement proposé de la version 1.9.1 : « alpha avancée ». Sur 22 critères d'acceptation iPhone : 2 remplis, 7 non remplis, 13 non prouvés. Ces chiffres sont ceux de l'audit (rapporté, non revérifié ici ligne à ligne).

Côté tests au départ : 20 tests Playwright (Chrome et moteur WebKit simulé), 5 sabotages, un workflow GitHub Actions présent seulement sur la branche `tests-automatiques`, absent de `main`.

## 7. Ce que ce constat ne prouve pas

- Qu'aucune autre copie du dépôt ne contient de travail non versionné ailleurs sur le PC.
- Que la sauvegarde du 01/11/2026 est restaurable (mot de passe inconnu de l'assistant, volontairement).
- Le plan GitHub du compte : le champ vaut `null` pour le jeton utilisé.
