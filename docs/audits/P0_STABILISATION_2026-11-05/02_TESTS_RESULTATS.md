# 02 · Tests et résultats (SetMate 1.9.2-p0)

Exécutés le 05/11/2026 sur le PC de Sabri, depuis le worktree `travail_p0_worktree`, après le commit `4d8be71`. Sorties reproduites telles que vues dans le terminal.

## Commandes

| But | Commande | Résultat réel |
|---|---|---|
| Toute la suite (Chrome + moteur Safari simulé) | `npx playwright test` | **136 réussis, 0 échoué, 0 non exécuté** (1,6 min) |
| Liste des tests | `npx playwright test --list` | 136 entrées (68 par moteur) |
| Syntaxe, doublons, version/cache | `node tests/verif_statique.js` | 3 lignes OK : syntaxe (`new Function`), aucun doublon de function/const/let de premier niveau (496 noms), `VERSION` = cache `sw.js` = `1.9.2-p0` |
| Sabotages | `node tests/sabotage.js` | **16 détectés sur 16** (les 5 d'origine, 3 P0-01, 3 P0-02, 5 P0-03) |
| Audit du HTML dynamique | `node tests/audit_html_dynamique.js` | 33 puits `innerHTML`/script/location listés, 964 expressions insérées dans du HTML, 626 classées sûres, 338 à revoir (dont 16 dans un gestionnaire `on*`) |

## Avant / après

| | Avant (base `c4306fa`) | Après (`4d8be71`) |
|---|---|---|
| Tests existants (`setmate.spec.js`) | 20 réussis | 20 réussis (inchangés) |
| P0-01 persistance (`p0_persistance.spec.js`) | 7 échecs, 1 réussi sur 8 (Chrome, code ancien) | 16 réussis (8 × 2 moteurs) |
| P0-02 restauration (`p0_restauration.spec.js`) | 27 échecs, 2 réussis sur 29 (Chrome, code ancien) | 58 réussis (29 × 2) |
| P0-03 injection (`p0_injection.spec.js`) | 19 échecs, 3 réussis sur 22 (Chrome, code ancien) | 42 réussis (21 × 2) |
| Total | 20 | 136 |

Précisions honnêtes sur le « avant » : les tests ont été écrits et lancés AVANT les correctifs. Les réussites « avant » sont des tests qui passent aussi sur l'ancien code (P0-01 : le test d'opération groupée, qui passait parce que `setMany` n'existait pas, a été durci ensuite pour exiger l'erreur de quota ; P0-02 : « annuler dans l'aperçu » et « __proto__ » ; P0-03 : deux refus de restauration déjà couverts par la validation P0-02, et le cas de sauvegarde légitime). Le « avant » P0-03 a été mesuré avec un test de cache Apple plus strict que la version finale (voir plus bas). Seul Chrome a été lancé pour les mesures « avant ».

## Ce que couvre chaque fichier

**`tests/p0_persistance.spec.js`** (8 tests) : succès avec relecture ; quota (QuotaExceededError simulée) ; transaction annulée en cours de route ; transaction « terminée » sans donnée (fantôme) ; connexion fermée puis réouverte ; opération groupée atomique ; `save()` en échec (indicateur `saveBadge`, message « Stockage plein », attribut `data-unsaved`, mémoire intacte, ancien état lisible, rétablissement) ; `pagehide` sans attendre 400 ms (le test échoue si l'écriture met plus de 350 ms).

**`tests/p0_restauration.spec.js`** (29 tests). 22 refus avant application, par le vrai parcours (bouton Restaurer = `importData` + sélecteur de fichier) : JSON coupé, fichier vide, espace seul, liste JSON, pas de marque `setmate`, pas de `state`, `state` vide, réglages seuls, `tracks` en texte (anomalie d'origine), `nextN` en texte, `set.ids` en texte, playlists en objet, numéro de son en texte, titre en nombre, numéros en double, identifiant de playlist piégé, clé d'apprentissage piégée, version 1.10.0, 2.0.0, « abc », booléen, schéma 99. Pour chacun : message « Restauration impossible », état en mémoire et état IndexedDB identiques avant/après, aucune erreur de page, aucun code injecté. Plus : sauvegarde réelle exportée depuis le mode démo (aperçu, copie `backup_prev`, application, annulation et enregistrement de l'annulation) ; ancienne version 1.5.2 (champs absents conservés) ; 30 000 sons restaurés et relus, puis fichier trop gros refusé ; interruption pendant l'écriture ; copie de secours impossible (quota) ; annulation dans l'aperçu ; `__proto__`.

**`tests/p0_injection.spec.js`** (21 tests) : table `safeUrl` (23 cas : `javascript:`, `data:`, `http:`, `//`, faux sous-domaines, identifiants, port, majuscules…) ; reproduction de l'injection `embedAM` (le code en ligne éventuel est exécuté avec un faux `location`, puis clic réel avec navigation capturée) ; lien Apple légitime ouvert tel quel et iframe bien formée ; identifiants Apple piégés ; `openAM` avec `javascript:` ; réponse iTunes piégée ; réponse Deezer piégée (identifiants, pochette CSS, aperçu `javascript:`) ; `cover()` ; `jsq` (6 chaînes hostiles cliquées dans un vrai bouton) ; identifiants de playlist, lien de notification, clés `P` piégés cliqués ; date de soirée piégée ; 8 refus de restauration (tonalité, année, `dz` de son, de playlist, de tendances, de découvertes, position de tendance, date de soirée) ; nettoyage (cache Apple et pochettes) ; sauvegarde légitime acceptée ; JSONP limité à `api.deezer.com`.

**`tests/sabotage.js`** : chaque correctif a au moins un sabotage qui rend un test rouge (par exemple : retirer l'écoute de `tx.onabort`, retirer la relecture, retirer `pagehide`, retirer l'exigence de validation, retirer `backup_prev`, appliquer en mémoire avant l'écriture, `safeUrl` qui accepte tout, `jsq` sans retours à la ligne, `dz` non numérique, JSONP sans contrôle, URL Apple remise dans un `onclick`).

## Ce qui n'est PAS prouvé (limites)

- **Pannes de stockage simulées**, pas réelles : on remplace `IDBObjectStore.prototype.put` dans la page (exception `QuotaExceededError`, abandon de transaction, put sans effet) et on ferme la connexion. Un vrai disque plein, une purge iOS ou un mode privé Safari n'ont pas été provoqués. Statut : à tester sur appareil.
- **Safari** = moteur WebKit de bureau en format iPhone, pas un iPhone. `pagehide` est déclenché par un événement manuel : la suspension réelle d'une page par iOS n'est pas testée. Statut : À TESTER SUR APPAREIL.
- **Deezer et iTunes sont simulés** (données fabriquées). Aucune vraie réponse piégée n'a été observée.
- **30 000 sons** : un seul essai, durée courte sur ce PC. Pas de mesure sur iPhone ni avec 200 000 sons.
- **Restauration** : testée avec des sauvegardes fabriquées et une sauvegarde réelle du mode démo. Aucune vraie sauvegarde d'une bibliothèque Serato réelle (les tonalités, nombres et champs réellement produits par Serato n'ont pas tous été vus) : un champ réel inattendu pourrait provoquer un refus à tort. À essayer avec la vraie sauvegarde de Sabri avant toute mise en ligne.
- **Audit onclick** : l'analyse est statique et heuristique (voir `03_SECURITE.md`) ; elle ne prouve pas l'absence d'autre vulnérabilité.
- Les tests ne couvrent ni Serato réel, ni clé USB, ni rekordbox, ni l'iframe Apple réelle.
- Test « avant » de P0-03 : 3 réussis sur 22 ; depuis, le test sur le cache Apple a été scindé (le cache invalide est désormais nettoyé avec avertissement au lieu d'être refusé), ce qui explique que la suite finale compte 21 tests P0-03.
