# 09 Â· Reprise autonome : Ã©tat exact et marche Ã  suivre

Ã‰tabli le 05/11/2026. Pour quelqu'un (ou une session) qui reprend sans avoir vu les Ã©changes. Rien ici n'autorise une fusion, un envoi, un dÃ©ploiement ou une dÃ©pense.

## 1. Ã‰tat exact

| Ã‰lÃ©ment | Valeur (lu le 05/11/2026) |
|---|---|
| Dossier de travail | `<dossier du projet>\travail_p0_worktree` |
| Branche | `fix/setmate-p0-stabilisation` |
| Dernier commit de la branche | `c2c7a99` (docs : validation Serato P0-04 et CI P0-05) |
| Base | `c4306fa` (version 1.9.1, = branche `tests-automatiques`) |
| Version | `1.9.3-p0` (`VERSION` dans `index.html` et `const C = "setmate-1.9.3-p0"` dans `sw.js`, lu) |
| `main` | `382b661`, version 1.9.1, en production, inchangÃ©e |
| Envoi vers GitHub | aucun (`git push` jamais lancÃ©) |
| Fichiers non versionnÃ©s au moment de la rÃ©daction | `docs/research/` (non suivi par Git) ; les fichiers `00`, `06`, `07`, `08`, `09`, `10` de ce dossier (nouveaux) |
| Dossier `site` | worktree de `main`, jamais touchÃ© |

Commits de la branche, du plus ancien :

| Commit | Contenu |
|---|---|
| `db03547` | P0-01 persistance |
| `a9a64ec` | P0-02 restauration et intÃ©gritÃ© |
| `4d8be71` | P0-03 injection |
| `a590987` | docs (01 Ã  03) |
| `5fdc6e6` | P0-04 Serato : Ã©critures dÃ©sactivÃ©es, export M3U8 |
| `78b7395` | P0-05 CI GitHub |
| `ee6adbc` | sabotage durci, fins de ligne, restauration rÃ©elle |
| `c2c7a99` | docs (04 et 05) |

RÃ©sultats rapportÃ©s (non relancÃ©s pour ce document) : 198 tests rÃ©ussis, 0 Ã©chouÃ©, 38 non exÃ©cutÃ©s (voulus) ; 25 sabotages dÃ©tectÃ©s sur 25 ; contrÃ´les statiques OK (`04` Â§5).

Les fichiers de ce dossier n'ont pas Ã©tÃ© commitÃ©s par leur rÃ©dacteur (aucune Ã©criture Git autorisÃ©e). Les ajouter Ã  la branche est une Ã©criture Git Ã  faire par la session principale.

## 2. RÃ¨gles de lancement (dans l'ordre)

1. **MÃ©moire d'abord.** Dans PowerShell :
   `(Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory` (valeur en Ko ; 3 Go libres = environ 3 145 728).
2. Fermer ce qui est inutile (Chrome, sessions Claude en trop) avant un lancement lourd.
3. Tests : `npx playwright test --workers=2`. Ne pas augmenter les workers.
4. **Ne pas lancer `tests\sabotage.js` s'il y a moins de 3 Go libres.**
5. **AprÃ¨s chaque test ou sabotage :** `git status --short index.html`. La sortie doit Ãªtre vide.
6. Si elle ne l'est pas : regarder `git diff -- index.html`. Restaurer par `git restore -- index.html` **seulement aprÃ¨s avoir vÃ©rifiÃ© que la seule diffÃ©rence est une altÃ©ration de sabotage** (motifs connus dans `tests/sabotage.js`). Si un vrai travail non commitÃ© s'y trouve, ne pas restaurer.
7. VÃ©rifier aussi qu'il n'existe pas de fichier `index.html.sabotage_bak`. S'il existe, l'exÃ©cution prÃ©cÃ©dente a Ã©tÃ© interrompue ; relancer `node tests/sabotage.js` le restaure au dÃ©marrage, ou voir `04` Â§6.
8. ContrÃ´les lÃ©gers (sans navigateur) : `node tests/verif_statique.js`, `node tests/verif_deploiement.js`, `node tests/verif_ci.js`.

Interdits de reprise : modifier `main` ou sa protection, fusionner, pousser, dÃ©ployer, toucher le vrai `_Serato_`, assouplir un test sans l'accord explicite de Sabri.

## 3. Ordre des prochaines tÃ¢ches (proposition)

| # | TÃ¢che | Qui | DÃ©pend de |
|---|---|---|---|
| 1 | Ajouter les documents (`docs/research`, `00`, `06` Ã  `10`) Ã  la branche, avec l'identitÃ© Git dÃ©jÃ  utilisÃ©e par les commits prÃ©cÃ©dents passÃ©e en option `-c` | session principale | accord de commit |
| 2 | Parcours C, B, D de `07_IPHONE_PLAN_TESTS.md` (restauration avec la vraie sauvegarde, persistance, pannes) | Sabri + iPhone | dÃ©cision : comment servir 1.9.3-p0 Ã  l'iPhone |
| 3 | Protocole Serato de `04` Â§7 sur une copie de bibliothÃ¨que | Sabri + PC | sauvegarde Serato prÃ©alable |
| 4 | RequÃªtes R-C01 et R-C02 (`docs/research/REQUETES_CHROME.md`) | session Chrome ou ChatGPT | aucun |
| 5 | Premier envoi de la branche pour faire tourner le workflow | session principale | accord de Sabri |
| 6 | Protection de `main` selon `05` Â§7 (ordre imposÃ©) | Sabri | tÃ¢che 5 rÃ©ussie |
| 7 | Chantiers de code : revalidation de `load()`, 25 `catch` vides, textes de confidentialitÃ© (aprÃ¨s validation des mots), puis alternative au JSONP | session de code | dÃ©cisions de Sabri (Â§6) |
| 8 | RÃ©Ã©criture des 104 `onclick`, un Ã©cran Ã  la fois, puis CSP | session de code | tests visuels par Ã©cran |
| 9 | Mesure d'analyse audio sur vrais morceaux | Sabri + script | choix du corpus |

## 4. Journal des incidents

| Incident | Effet | Traitement |
|---|---|---|
| **ArrÃªt d'un test par le systÃ¨me pour manque de mÃ©moire** (1,3 Go libres sur 15,9 Go au constat) | exÃ©cution interrompue | `--workers=2`, vÃ©rification de la mÃ©moire avant chaque lancement, sabotage seulement au-dessus de 3 Go |
| **Ancien `sabotage.js` qui altÃ©rait `index.html`** : il ne restaurait le fichier que dans un `finally`, un arrÃªt brutal le laissait modifiÃ© (cela est arrivÃ©) | `index.html` laissÃ© altÃ©rÃ© | Copie de secours `index.html.sabotage_bak` avant altÃ©ration, restauration au lancement suivant, vÃ©rification finale (code 2 sinon). Gestionnaires de signaux Ã©crits mais non testÃ©s |
| **IdentitÃ© Git non configurÃ©e** dans le worktree | les commits ne pouvaient pas se signer | IdentitÃ© des commits prÃ©cÃ©dents passÃ©e en option `-c`, aucune configuration modifiÃ©e |
| Un faux Â« dÃ©tectÃ© Â» possible dans l'ancien sabotage (nom de test sans guillemets) | contrÃ´le trompeur | CorrigÃ©, filtre vide comptÃ© non dÃ©tectÃ© |

## 5. Garde-fous et limites

- **Le garde-fou de publication ne vit que dans Claude Code** (hooks de `Codex/.claude/settings.json`). Un autre outil, un terminal ou GitHub n'est pas couvert (A-21 ouverte). Le fichier d'accord peut Ãªtre crÃ©Ã© par Claude seul : c'est un frein, pas une barriÃ¨re.
- **Une session Claude Code ne continue pas aprÃ¨s sa fermeture.** Les tÃ¢ches planifiÃ©es de session ne tournent que si Claude Code est ouvert et inactif, et expirent au bout de 7 jours (documentation lue par l'audit prÃ©cÃ©dent).
- **Ne rien supposer sur les tÃ¢ches planifiÃ©es sans vÃ©rification.** Aucune tÃ¢che planifiÃ©e n'a Ã©tÃ© crÃ©Ã©e ni vÃ©rifiÃ©e dans ce travail. Si une tÃ¢che existe, vÃ©rifier son Ã©tat avant de s'y fier.
- Le relais de continuitÃ© rÃ©el est Ã©crit : `SUIVI.md`, ce dossier, et le journal Git. Les sessions ne se parlent pas entre elles.
- Un seul Ã©crivain par fichier. Pas de commande Git d'Ã©criture dans `site`.
- Rappel de sauvegarde : aprÃ¨s un chantier, Sabri lance la sauvegarde chiffrÃ©e (il tape son mot de passe). Elle ne couvre pas les donnÃ©es de l'appli sur l'iPhone.

## 6. DÃ©cisions qui attendent Sabri

1. Comment servir la version 1.9.3-p0 Ã  l'iPhone pour les tests (aucune mise en ligne n'est faite).
2. Autoriser le premier envoi de la branche vers GitHub pour exÃ©cuter le workflow, puis la fusion Ã©ventuelle par demande de fusion.
3. Protection de `main` : accord pour la crÃ©er, avec l'ordre de `05` Â§7 (et choix : 0 ou 1 approbation, rÃ¨gle appliquÃ©e ou non aux administrateurs).
4. Accord pour provoquer une vraie panne de stockage sur un iPhone (laquelle ? sur quel appareil ?).
5. Crate Â« NouveautÃ©s Â» : remplacement par un export M3U8, ou abandon.
6. Comportement du M3U en mode dÃ©mo (aucun fichier Ã©crit) : acceptable ?
7. Voie Ã  suivre pour le JSONP Deezer (iframe isolÃ©e, relais, `fetch`).
8. DÃ©pÃ´ts publics : privÃ© + dÃ©mo, licence, ou statu quo.
9. Formulation des textes de confidentialitÃ© (A-07).
10. Seuils de mesure audio (borne basse plutÃ´t que Â« 90 % sur 100 Â»), corpus Ã  utiliser.
11. Licence d'Essentia : Ã  confier Ã  un juriste avant toute intÃ©gration.
12. Retrait Ã©ventuel de l'envoi d'artefacts de la CI en cas d'Ã©chec.

## 7. Ce qui n'a pas Ã©tÃ© vÃ©rifiÃ© pour ce document

Aucun test relancÃ© ; aucune commande lancÃ©e dans `site` ; l'Ã©tat de GitHub n'a pas Ã©tÃ© relu depuis le premier constat ; l'espace mÃ©moire courant de la machine n'a pas Ã©tÃ© mesurÃ©.
