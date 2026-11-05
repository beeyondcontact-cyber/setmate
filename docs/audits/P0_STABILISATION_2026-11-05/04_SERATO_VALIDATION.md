# 04 · Serato : écritures désactivées, export M3U8, validation (SetMate 1.9.3-p0)

Établi le 05/11/2026 dans le worktree `travail_p0_worktree`, branche `fix/setmate-p0-stabilisation`. Ce document ne déclare pas SetMate « stable » ni « prêt pour la production ». Rien n'a été poussé, rien n'est en ligne, le dossier `site` (production) n'a pas été touché.

Statuts : CORRIGÉ ET TESTÉ / IMPLÉMENTÉ NON VALIDÉ / BLOQUÉ / À TESTER SUR APPAREIL / NON COMMENCÉ.

## 0. Résumé honnête

| Sujet | Statut | Ce que ça veut dire |
|---|---|---|
| Aucune écriture de SetMate dans `database V2`, `Subcrates`/crates ou `_Serato_` | CORRIGÉ ET TESTÉ | Vérifié sur un faux disque en mémoire qui enregistre toute écriture : zéro opération, empreintes SHA-256 inchangées. Pas vérifié sur un vrai disque ni un vrai dossier Serato (interdit par la consigne). |
| `seratoGate()` ne peut plus devenir permissif par un réglage (A-01) | CORRIGÉ ET TESTÉ | Constante non modifiable ; l'interrupteur est supprimé des Réglages ; test avec Réglages altérés. |
| Export M3U8 (format, ordre, encodages, chemins Windows, pistes sans fichier) | CORRIGÉ ET TESTÉ | Comparaison octet par octet avec un fichier de référence fabriqué séparément. |
| **Import réel du M3U8 par Serato** | **NON TESTÉ** | Libellé affiché dans l'appli : « Compatibilité réelle non testée ». Un M3U8 bien formé ne prouve pas l'import. |
| Convention de chemin sous Windows (lecteur, `/Users/…` sans lecteur, barres) | À TESTER SUR APPAREIL | Les chemins sont testés comme texte. Ce que Serato Windows accepte n'est documenté nulle part (S-03, S-16). |
| Contrôle de sabotage durci (copie de secours écrite avant altération, restauration au lancement suivant après un arrêt brutal, restauration en fin normale et sur erreur) | CORRIGÉ ET TESTÉ | Voir §6. Les gestionnaires de signaux (Ctrl+C) sont écrits mais NON TESTÉS. |

## 1. Inventaire des chemins d'écriture Serato (code `a590987`, avant correction)

Méthode : recherche de `createWritable`, `removeEntry`, `getDirectoryHandle(..., {create:true})`, `writeFile`, `writeCrates`, `serEnc`, `buildCrate`, puis lecture de chaque appelant et de chaque bouton. Vérifié dans `index.html`, pas repris de l'audit.

| # | Fonction (avant) | Ce qu'elle écrivait | Déclencheur (bouton / appel) | Peut toucher database V2 / crates / originaux ? | Après (1.9.3-p0) |
|---|---|---|---|---|---|
| 1 | `writeFile(dir,name,bytes)` | n'importe quel fichier, via `createWritable` | `backupFile`, `writeCrates`, `exportUsb` | oui (primitive commune) | refuse : `seratoRefus` |
| 2 | `backupFile` | copie d'un fichier dans `SetMate sauvegardes/` à la racine du dossier visé | `writeCrates`, `exportUsb` | crée un dossier dans `_Serato_` | supprimée |
| 3 | `writeCrates(root,list,tag)` | `_Serato_/Subcrates/SetMate.crate` et `SetMate%%<nom>.crate` (binaire, ré-encodé par `serEnc`) | `writeRuleCrates`, `exportSetCrate`, `exportUsb`, `showArrival` | **crates** (nouveaux fichiers ; réécriture de ses propres crates) | refuse : `seratoRefus` |
| 4 | `removeCreated` | `removeEntry` dans `Subcrates` (annulation) | annulations (`pushUndo`) de 2 et 3 | supprime des crates | supprimée |
| 5 | `writableSerato` | demandait la permission `readwrite` sur le dossier Serato | 3 appelants ci-dessus | prépare toute écriture | renvoie `null` sans rien demander |
| 6 | `writeRuleCrates` | création des crates des « Crates proposées » ; sans accès : téléchargement de fichiers `.crate` | bouton « Créer dans Serato (n) » (panneau de la bibliothèque) | **crates** | devient `exportRuleM3U` : playlists M3U8 |
| 7 | `exportSetCrate` | crate du set | bouton « Crate Serato » (écran Préparer) | **crates** | ne fait qu'ouvrir une explication (M3U8 en premier) |
| 8 | `exportUsb`, branche « Serato 3 » | lisait puis **réécrivait `_Serato_/database V2` de la clé** (`serParse`/`serEnc`, risque A-02), sauvegarde, crate du set sur la clé | bouton « Copier sur clé USB » | **database V2** et crates (de la clé) | branche supprimée : copie des fichiers audio seulement dans `SetMate/<set>/` |
| 9 | `showArrival` (clic « Ajouter ») | crate « SetMate › Nouveautés » dans le `_Serato_` principal, si version 3 ou contrôle désactivé | arrivée d'un fichier dans Téléchargements | **crates** (et tous les sons non Serato) | supprimée ; texte « Rien n'est écrit dans Serato » |
| 10 | `downloadCrateAdvanced` + repli de 6 | téléchargement d'un `.crate` à déposer à la main dans `Subcrates` | lien « Avancé » de la fenêtre « Pas de crate possible » | incite à écrire dans Serato à la main (chemins de cet ordinateur seulement, E-013) | supprimée |
| 11 | `modeOf("serato")` / `pickDir` | demandait l'accès **lecture-écriture** au dossier Serato dès la connexion | Réglages > Connecter | donnait le droit | lecture seule pour les trois dossiers |
| 12 | `seratoGate` + interrupteur `seratover` | « Vérifier la version de Serato avant d'écrire » désactivable (A-01) ; coupé, la porte renvoyait `true` | Réglages > « Correctifs du test terrain » | autorisait 3, 6, 7, 8, 9 | porte qui refuse toujours ; interrupteur supprimé |
| 13 | `copyFiles` (exportFolder, exportUsb) | **copie** des fichiers audio dans un dossier choisi (`createWritable` dans le dossier de destination) | boutons « Un dossier à glisser dans Serato », « Copier sur clé USB » | n'écrit que dans la destination, jamais dans la source ; **conservée** | conservée, avec refus si le dossier choisi est un `_Serato_` |

Lectures conservées (sûres) : `loadSerato` (lit `database V2`), import d'un fichier `database V2` isolé (`importDbFile`), lecture de `History Export`, `serParse`, `buildCrate`/`crateTracks` (fonctions pures, utilisées par les tests E-013).

Limite connue non corrigée (pré-existante) : `copyFiles` remplace, dans le **dossier de destination**, un fichier de même nom et de taille différente. Cela ne touche pas les fichiers originaux ni Serato, mais écrase un éventuel fichier du même nom déjà présent dans `SetMate/<set>/`. Statut : NON COMMENCÉ.

## 2. Ce qui est désactivé, et pourquoi c'est non contournable par l'interface

Décision de Sabri : tant que la sûreté n'est pas démontrée, plus aucune écriture binaire directe vers les bibliothèques Serato.

- `const SERATO_ECRITURE_AUTORISEE=false` : constante de premier niveau. Un script de la page ne peut pas la réaffecter (`TypeError`, testé). Aucun écran, aucun réglage, aucun fichier de sauvegarde ne la lit ou ne la change.
- `seratoGate()` renvoie `SERATO_ECRITURE_AUTORISEE===true` : elle ne lit ni `S.flags`, ni `S.seratoVer`, ni `flag()`. Testée avec : interrupteur coupé, `S.flags` indéfini, version « 3 », `flag()` remplacée par une fonction qui renvoie `false`, tentative de réaffecter la constante.
- Dernier verrou : `writeFile` et `writeCrates` lèvent une erreur « Écriture directe dans Serato désactivée (P0-04) » même si on les appelle directement (testé avec un dossier Serato réel du faux disque). `copyFiles` refuse un dossier dont le nom est `_Serato_` ou `Serato`.
- Permissions : les dossiers sont demandés en **lecture** (`mode:"read"`). Le navigateur n'accorde donc plus à SetMate le droit d'écrire dans le dossier Serato connecté. SetMate ne redemande plus jamais l’écriture (`modeOf`) ; un droit d’écriture accordé autrefois par le navigateur à un ancien dossier mémorisé n’est pas retiré par SetMate, mais le code ne l’utilise plus.
- Réglages : l'interrupteur « Vérifier la version de Serato avant d'écrire » n'existe plus. Une sauvegarde ancienne qui contient `flags.seratover` est acceptée et sans effet (testé).
- La question « quelle version de Serato » reste (Réglages) comme **indication** pour les explications ; elle ne débloque rien.
- Les fonctions de lecture ne sont pas supprimées.

« Protect Library » : le mot n'apparaît nulle part dans l'appli (testé). Ce n'est pas une protection contre les écritures de SetMate : Serato 3.3.5 la décrit comme un verrou d'interface, la 5.0.0 l'annonce sans description (fiches S-07 à S-10, `docs/research/01_SERATO/02_protect_library.md`). L'effet sur une écriture faite par un autre programme est inconnu.

## 3. Export M3U8

Boutons : écran **Préparer** : « Exporter M3U8 » (remplace « Playlist M3U » et « Crate Serato ») ; **Ma musique** : « Exporter en M3U8 (n) » (remplace « Créer dans Serato (n) »). La fenêtre « Pas de crate possible d'ici » met le M3U8 en première proposition, puis le dossier à glisser dans Serato, puis le partage sans chemins.

### Format écrit (fonction `buildM3U8`, pure)

```
#EXTM3U
#EXTINF:-1,Artiste - Titre
<chemin>
```

- Encodage UTF-8, **sans BOM**, fins de ligne `\n`, ligne finale terminée. Durée `-1` (SetMate ne connaît pas la durée). Si l'artiste est vide : `#EXTINF:-1,Titre`.
- Ordre : celui du set (ou de la liste), conservé. Testé avec un set réordonné.
- Dans `#EXTINF`, les retours à la ligne et caractères de contrôle d'un titre sont remplacés par une espace (un titre ne peut pas injecter une ligne).
- Chemins (`m3uPath`) : chemin Serato sans lecteur `Users/ines/Music/x.mp3` devient `/Users/ines/Music/x.mp3` ; chemin avec lettre de lecteur `d:/Musique DJ/a b.mp3` ou `D:\Musique DJ\a b.mp3` devient `D:\Musique DJ\a b.mp3` (lettre en majuscule, barres inverses, espaces et accents conservés, séparateurs doublés réduits).
- Refusés (la piste n'est pas écrite) : chemin réseau `\\NAS\…` ou `//NAS/…`, `D:fichier.mp3` (relatif au lecteur, ambigu), chemin vide ou absent, chemin contenant un caractère de contrôle ou un saut de ligne (y compris en fin de texte), piste « à récupérer » (`wish`), piste que Serato signale manquante (`missing`).
- Chemins de plus de 240 caractères : écrits, mais signalés.

### Pistes sans fichier local

Elles ne sont **jamais** écrites avec un chemin inventé : omises du fichier, et listées dans une fenêtre avec leur raison (« à récupérer », « Serato signale le fichier introuvable », « pas de chemin de fichier utilisable ») et le nombre de sons écrits. Si aucune piste n'a de fichier, rien n'est téléchargé et la fenêtre dit « Aucun son avec un fichier local ». En **mode démo** (chemins d'exemple qui n'existent pas), aucun M3U8 n'est écrit : message « chemins inventés ».

### Statut affiché

- Écran Préparer : « Export M3U8 pour Serato : Compatibilité réelle non testée. SetMate n'écrit rien dans ton dossier Serato. »
- Ma musique, panneau des crates : « Exportées en playlists M3U8. SetMate n'écrit rien dans Serato. Compatibilité réelle non testée. »
- Fenêtre après export : « Compatibilité réelle non testée. Un fichier M3U8 bien formé ne prouve pas que Serato l'importe. »
- Explication : « Serato DJ 5.0 annonce l'import des .M3U (notes officielles) ; méthode, encodage et chemins non documentés. »

## 4. Tests ajoutés

Tous dans le dépôt, sans fichier personnel de Sabri et sans son vrai dossier `_Serato_`.

**Fichiers de référence et bibliothèque de test** (`tests/fixtures/serato/`, fabriqués par `fabriquer_reference.js`, qui n'importe rien de `index.html`) :
- `pistes_reference.json` : 15 pistes inventées : accents (« Été à Paris »), arabe (« أحبك », « فيروز »), néerlandais (« ĳ », « Zoë Çelik »), emoji et caractère hors plan de base (« 🎉🔥 𝄞 »), chemins Windows (lecteur majuscule, minuscule, barres mixtes, espaces), et 6 pistes à refuser (à récupérer, réseau, relatif au lecteur, saut de ligne dans le chemin, signalée manquante, sans chemin).
- `attendu_set.m3u8` : le fichier exact attendu (octets), écrit à part par le générateur. `attendu_non_ecrites.json` : les numéros attendus des pistes omises.
- `bibliotheque_test/_Serato_/` : une fausse base `database V2` (encodeur indépendant) et une crate. `.gitattributes` empêche Git de convertir les fins de ligne de ces fichiers.

**`tests/p0_serato.spec.js`** (15 tests par moteur ; 3 d'entre eux demandent les API de dossiers de Chrome et ne tournent que sur Chrome) :
1. `seratoGate` refuse dans 7 situations dont les Réglages altérés.
2. Réglages : plus d'interrupteur, même avec `flags.seratover=false` posé directement dans l'état.
2 bis. Restauration réelle : une sauvegarde produite par l'appli puis altérée (`flags.seratover=false`, version « 3 ») est restaurée par le vrai parcours (Réglages > Restaurer : sélecteur de fichier, aperçu, confirmation). L'état altéré est bien appliqué, `seratoGate()` refuse quand même et aucun interrupteur n'est affiché.
3. Code source : un seul `createWritable` (copie des fichiers audio), aucun `removeEntry`, plus de `Subcrates`/`_Serato_` ouverts, `buildCrate` plus appelé par l'interface, seuls deux sélecteurs demandent l'écriture (dossier du set, clé).
4. Faux disque (Chrome) : base et crate de test chargées dans un faux dossier `_Serato_` en mémoire qui enregistre toute écriture. Réglages altérés (ancien interrupteur coupé, version 3). Appel de `exportSetCrate`, `writeRuleCrates`, `writeCrates`, `writeFile`, `copyFiles` dans `_Serato_` : 0 opération d'écriture, empreintes SHA-256 de tous les fichiers identiques avant et après, seuls des `.m3u8` téléchargés, et la **lecture** de la base de test fonctionne toujours.
5. Faux disque : « Copier sur clé USB » avec une clé qui contient un `_Serato_` : seules des opérations sous `SetMate/` ; `_Serato_` de la clé inchangé (empreintes).
6. Faux disque : choisir un dossier `_Serato_` comme clé ou comme dossier du set est refusé, 0 opération.
7. M3U8 : contenu identique octet par octet à la référence, ordre, pas de BOM, 9 écrites / 6 omises, aucun chemin inventé.
8. M3U8 : 20 cas de chemins (Windows, UNC, relatif au lecteur, vides, nuls, nombres, sauts de ligne, `\r` final, NUL) et un chemin de 250 caractères.
9. M3U8 : le vrai téléchargement (événement `download` de Playwright, nom de fichier `Set référence.m3u8`) est identique à la référence ; la fenêtre cite les 6 pistes omises et « Compatibilité réelle non testée ».
10. M3U8 : ordre d'un set réordonné ; set sans aucun fichier : rien n'est téléchargé.
11. M3U8 : mode démo : aucun téléchargement.
12. M3U8 : playlists proposées de la bibliothèque : uniquement des `.m3u8`.
13. Libellés : « Compatibilité réelle non testée » visible sur l'écran du set et de la bibliothèque, bouton « Exporter M3U8 » présent, « Crate Serato » et « Créer dans Serato » absents.
14. Le mot « Protect Library » n'apparaît pas dans l'appli.

**`tests/sabotage_mecanisme.spec.js`** (8 tests) : voir §6, plus deux contrôles : les 25 motifs de sabotage existent dans le vrai `index.html` (lu seulement) avec des fins de ligne LF comme CRLF, et le programme principal n'écrit `index.html` que dans la zone protégée.

**9 sabotages P0-04** dans `tests/sabotage.js` : porte permissive, interrupteur de retour, `writeCrates` qui réécrit, écriture dans le `_Serato_` de la clé, `_Serato_` accepté comme destination, piste à récupérer écrite, saut de ligne non refusé, lecteur Windows non géré, statut effacé. Entrée E-013 adaptée (son motif de code n'existe plus ; le test visé est inchangé). Le script vérifie maintenant avant chaque sabotage que le filtre désigne au moins un test (liste vide = « FILTRE VIDE », compté comme non détecté) et ne compte « détecté » que si un test échoue réellement : la version précédente passait le nom du test sans guillemets à un shell, donc un nom en plusieurs mots pouvait être découpé en filtres de fichiers et produire un faux « détecté ».

## 5. Résultats

Exécutés le 05/11/2026 sur le PC de Sabri (Windows), depuis le worktree, avec `--workers=2`, mémoire libre vérifiée avant chaque lancement (2,9 à 4,6 Go ; le sabotage n'a été lancé qu'avec plus de 3 Go). Code testé : commit `ee6adbc`.

| Contrôle | Commande | Résultat réel |
|---|---|---|
| Toute la suite (Chrome + moteur Safari simulé) | `npx playwright test --workers=2` | **198 réussis, 0 échoué, 38 non exécutés** (1,3 min) |
| Syntaxe, doublons, version/cache | `node tests/verif_statique.js` | 3 lignes OK (501 noms, version 1.9.3-p0 = cache) |
| Fichiers de déploiement | `node tests/verif_deploiement.js` | OK |
| Garde-fous du workflow | `node tests/verif_ci.js` | OK (7 fichiers de test, tous lancés) |
| Sabotages | `node tests/sabotage.js` | **25 détectés sur 25** (chacun vise exactement 1 test ; 0 impossible, 0 filtre vide). Ensuite : `git status --short index.html` vide, aucune copie `index.html.sabotage_bak`. |

**Avant / après**

| | Avant (`a590987`, 1.9.2-p0) | Après (`ee6adbc`, 1.9.3-p0) |
|---|---|---|
| Tests réussis | 136 | 198 |
| Tests échoués | 0 | 0 |
| Tests non exécutés | 0 | 38 |
| Sabotages | 16 sur 16 | 25 sur 25 |

Les 136 tests existants n'ont pas été modifiés (aucune assertion changée) et passent tous. Les 38 non exécutés sont **voulus** : tests du faux disque (3, API de dossiers de Chrome absentes de WebKit), tests de scripts Node (8 du mécanisme de sabotage, 27 des garde-fous CI) qui ne tournent qu'une fois, sur le projet Chrome. La base de départ n'avait aucun test non exécuté.

Répartition des 62 réussites nouvelles : `p0_serato.spec.js` 27 (15 par moteur moins 3 réservés à Chrome), `sabotage_mecanisme.spec.js` 8, `ci_garde_fous.spec.js` 27.

**Avant correction, sur l'ancien code** : NON EXÉCUTÉ. Les nouveaux tests ont été écrits après le correctif. Leur capacité à échouer est montrée par le contrôle de sabotage (9 régressions P0-04 réintroduites, chacune rend un test rouge), pas par un lancement sur le code de `a590987`. Un premier lancement a aussi trouvé un vrai défaut dans mon propre code (un chemin se terminant par un retour chariot passait le contrôle parce que le texte était rogné avant le test) : corrigé, voir le commit.

**Changement de comportement à connaître** : la « crate Nouveautés » que SetMate écrivait dans le `_Serato_` à l'arrivée d'un nouveau fichier (écran « Nouveau fichier dans Téléchargements », bouton Ajouter) a été **supprimée sans équivalent direct** : c'est une écriture binaire dans les crates, désactivée par décision. Le son est toujours ajouté à la bibliothèque SetMate, mais plus rangé dans Serato. Remplacement possible (NON COMMENCÉ) : inclure les nouveaux sons dans un export M3U8. À valider avec Sabri.

## 6. Contrôle de sabotage durci (incident évité)

Défaut corrigé : `tests/sabotage.js` modifiait le vrai `index.html` et ne le restaurait que dans un `finally` ; un arrêt brutal le laissait altéré (cela est arrivé). Maintenant :

1. Avant toute altération : copie de secours `index.html.sabotage_bak` écrite et relue.
2. Au démarrage : si cette copie existe, l'exécution précédente a été interrompue ; `index.html` est restauré depuis elle (avant de lire l'original), un message est affiché, la copie est supprimée.
3. Restauration quand le code reprend la main : fin normale et erreur (`finally`, testées). Des gestionnaires `SIGINT`/`SIGTERM`/`SIGHUP` restaurent aussi le fichier : les Playwright sont lancés en asynchrone pour que ces signaux soient traités (version précédente : boucle synchrone, signaux jamais traités, défaut corrigé). **Ces gestionnaires de signaux ne sont PAS testés** (NON TESTÉ). À la fin, vérification que le fichier est identique (sinon code de sortie 2).
4. Cas non couvert, assumé : un arrêt brutal (`kill -9`, coupure de courant) ne peut pas être attrapé ; le fichier reste altéré, mais la copie de secours permet de le réparer au lancement suivant (et `git restore -- index.html` reste possible).

Test (`tests/sabotage_mecanisme.spec.js`) sur un fichier **temporaire**, jamais sur le vrai `index.html` : copie écrite avant l'altération et supprimée ensuite ; restauration après une erreur ; **arrêt brutal réel** d'un processus enfant (`SIGKILL`) : fichier resté altéré et copie présente, puis lancement suivant qui restaure l'original (et lui transmet le vrai original, pas la version altérée) ; copie périmée sur fichier sain sans danger ; restauration idempotente. Les signaux `SIGTERM`/`SIGINT` ne sont pas testés (sous Windows, Node ne les délivre pas à un enfant sans le tuer) : NON TESTÉ sur ce point. Les motifs sont cherchés aux fins de ligne normalisées : le script fonctionne pareil sur un `index.html` en CRLF (checkout Windows) et en LF (Linux CI), vérifié par un test.

## 7. Ce qui reste NON TESTÉ sur un vrai Serato

À faire sur la machine de Sabri, avec une bibliothèque de test copiée (jamais la vraie), après une sauvegarde `Export Backups`/`Library/Backups` de Serato (fiche S-18) :

1. Serato DJ 5.0 importe-t-il le M3U8 produit ? Par quel menu (non documenté, S-03) ?
2. Le M3U8 est-il lu avec les accents, l'arabe, les emoji ? Un BOM ou des fins de ligne `\r\n` sont-ils nécessaires ? (SetMate écrit UTF-8 sans BOM, `\n`.)
3. Sous Windows : un chemin `/Users/…` sans lecteur est-il retrouvé ? Un chemin `D:\…` ? Les barres obliques ? Sur un disque externe (`_Serato_` à la racine du disque) ?
4. L'ordre des pistes est-il conservé dans la caisse créée ?
5. Serato 4.x : l'import M3U est signalé absent par la communauté (S-02) ; Serato 3 : non testé.
6. iPhone / Serato DJ for iOS : M3U non testé (S-05).
7. Le dossier à glisser dans Serato (onglet Files) : l'ordre obtenu et le comportement des caisses ne sont pas testés.

## 8. Limites des tests

- Le faux disque est un objet JavaScript qui imite l'API de dossiers (`getFileHandle`, `getDirectoryHandle`, `createWritable`, `removeEntry`). Il prouve que le code de SetMate n'appelle pas ces opérations sur un dossier Serato ; il ne prouve pas le comportement des vrais `FileSystemDirectoryHandle` de Chrome ni du système de fichiers.
- Les tests sont des tests de la page chargée dans Chrome et dans le moteur WebKit de bureau ; pas Safari sur iPhone.
- Les anciens dossiers Serato mémorisés dans IndexedDB avec un droit d’écriture déjà accordé : le comportement du navigateur n’est pas testé avec un vrai dossier.
- Les chemins Windows sont testés comme chaînes (aucun disque Windows réel lu).
- Le texte sur l'effet de Serato 5.0 vient d'une ligne de notes de version (S-01) ; sa méthode est inconnue.
- Le code de sabotage ne couvre pas tout : il vérifie 25 bugs choisis, pas l'absence de tout autre défaut.
