# 08 · Anomalies restantes (SetMate 1.9.3-p0, branche `fix/setmate-p0-stabilisation`)

Établi le 05/11/2026 à partir des documents `01` à `05`, de l'audit `AUDIT_TRANSMISSION_DJ_CHATGPT/05` et de contrôles de lecture sur `index.html` (commit `c2c7a99`). Aucun test n'a été relancé pour écrire ce document (mémoire de la machine insuffisante) : les résultats de tests cités sont ceux de `02` et `04`, « rapportés, non revérifiés ».

Ce document ne dit pas que SetMate est prêt. Il liste ce qui reste.

Statuts : CORRIGÉ ET TESTÉ / IMPLÉMENTÉ NON VALIDÉ / BLOQUÉ / À TESTER SUR APPAREIL / NON COMMENCÉ.
Sens de « CORRIGÉ ET TESTÉ » : une preuve reproductible existe (test automatique, sabotage détecté). Pour P0-01 à P0-03, cette preuve est une **simulation** : ni iPhone réel ni panne de stockage réelle.

## 1. Problèmes ouverts

| ID | Gravité | Description | Preuve / source | Statut | Prochaine action |
|---|---|---|---|---|---|
| AN-01 | Haute | **JSONP Deezer** : `jsonp()` insère une balise `<script>` vers `api.deezer.com`. La réponse est du code exécuté avec tous les droits de l'appli (lecture d'IndexedDB, appel de toute fonction globale). | `03_SECURITE.md` §4. 25 occurrences de `jsonp(` relevées par recherche dans `index.html` (24 appels et la définition). L'adresse est limitée à l'hôte exact (commit `4d8be71`, testé), mais le code renvoyé par Deezer s'exécute toujours. | NON COMMENCÉ (atténuation d'adresse faite et testée, risque de fond intact) | Décision de Sabri sur la piste : iframe `sandbox` sans `allow-same-origin`, relais, ou `fetch` si l'API accepte CORS (non vérifié). Test sur iPhone nécessaire. |
| AN-02 | Moyenne | **104 `onclick` recevant une donnée non réécrits** en `addEventListener`. L'outil d'audit classe 338 expressions sur 964 « à revoir » (dont 16 dans un `on*`). | `03_SECURITE.md` §2 (chiffres de l'outil `node tests/audit_html_dynamique.js`, rapportés, non revérifiés). Recherche simple du 05/11 : 282 occurrences de `onclick=` dans `index.html` (HEAD), contre 294 dans `03` : écart probablement dû au retrait de boutons Serato et à la méthode de comptage, non élucidé. | NON COMMENCÉ | Chantier à planifier, un écran à la fois, avec test visuel. Les entrées externes connues sont déjà contrôlées. |
| AN-03 | Moyenne | **`load()` ne revalide pas** les données lues dans IndexedDB au démarrage (seulement `S.tracks` redevient `[]` si ce n'est pas une liste). Une donnée piégée entrée avant le correctif reste affichée comme avant. | `01_CORRECTIFS` limites P0-02 ; `03_SECURITE.md` §3.1 | NON COMMENCÉ | Réutiliser `validateBackup` au démarrage, avec quarantaine plutôt que suppression. |
| AN-04 | Moyenne | **Aucune Content-Security-Policy.** Les `onclick` en ligne obligent à autoriser `'unsafe-inline'`, ce qui limite l'apport d'une CSP. | 0 occurrence de `Content-Security-Policy` dans `index.html` (recherche du 05/11). A-08. | NON COMMENCÉ | Dépend d'AN-02 et d'AN-01. |
| AN-05 | Moyenne | **Crate « Nouveautés » supprimée sans remplacement.** À l'arrivée d'un fichier dans Téléchargements, le son est ajouté à SetMate mais plus rangé dans Serato. | `04_SERATO_VALIDATION.md` §5 (changement de comportement) | NON COMMENCÉ (remplacement) | Validation de Sabri. Option : inclure les nouveaux sons dans un export M3U8. |
| AN-06 | Faible | **Comportement M3U modifié en mode démo** : aucun M3U8 n'est écrit (chemins inventés), message « chemins inventés ». Avant, un fichier d'exemple pouvait sortir. | `04` §3, test 11 de `p0_serato.spec.js` | IMPLÉMENTÉ NON VALIDÉ (testé en simulation ; accord de Sabri non retrouvé) | Demander si ce comportement lui convient. |
| AN-07 | Haute | **Serato réel jamais testé** : import M3U8 par Serato 5.0, encodage (UTF-8 sans BOM, `\n`), chemins Windows (`D:\...`, `/Users/...` sans lecteur), ordre des pistes. | `04` §7 ; matrice de compatibilité ; AC-14 de l'audit | À TESTER SUR APPAREIL (PC de Sabri, bibliothèque de test copiée, après sauvegarde Serato) | Exécuter le protocole de `04` §7 sur une copie. Rien dans le vrai dossier `_Serato_`. |
| AN-08 | Moyenne | **Protect Library non documentée pour la 5.0** (« Added Protect Library feature. » sans description). Effet sur les écritures externes inconnu. Contradiction avec « Crates 4.0 » non résolue. | `docs/research/01_SERATO/02_protect_library.md` (S-07 à S-10) | BLOQUÉ (source `support.serato.com` en 403 pour les outils automatiques) | Requête R-C02 dans un vrai navigateur. En attendant : aucune écriture SetMate dans Serato. |
| AN-09 | Haute | **Restauration jamais essayée avec la vraie sauvegarde de Sabri.** Un champ réel inattendu (tonalité non normalisée, par exemple) pourrait provoquer un refus à tort. | `02_TESTS_RESULTATS.md` limites ; `03` §3.7 | À TESTER SUR APPAREIL | Parcours C de `07_IPHONE_PLAN_TESTS.md`, avec export préalable en copie de sécurité. |
| AN-10 | Haute | **Pannes de stockage seulement simulées** (`put` remplacé par une exception, abandon de transaction, connexion fermée). Pas de disque plein, de purge iOS ni de mode privé réels. `pagehide` déclenché à la main. | `02` limites | À TESTER SUR APPAREIL | Parcours B et D de `07`. |
| AN-11 | Moyenne | **Workflow CI jamais exécuté chez GitHub.** Durées (10/30/45 min) estimées, installation `--with-deps` sur l'image du moment non essayée, validateur YAML externe non utilisé. | `05_GITHUB_CI.md` §8 | IMPLÉMENTÉ NON VALIDÉ | Après l'accord de Sabri pour un envoi sur une branche (aucun `git push` n'a été fait). Les gardes locales `verif_ci.js` et `ci_garde_fous.spec.js` passent (rapporté). |
| AN-12 | Haute | **Pas de protection de `main`, alors que GitHub Pages sert `main` sans test.** | `00_ETAT_INITIAL.md` ; `05` §5 (route 404) et §7 (règles proposées) | NON COMMENCÉ | Accord de Sabri. Ordre à suivre : fusionner d'abord le workflow par demande de fusion, le laisser tourner, ruleset en mode « Évaluer », puis « Actif ». |
| AN-13 | Moyenne | **Dépôts publics sans licence** (`setmate` et `setmate-test`). Le code est copiable ; les règles de Sabri prévoient de ne pas livrer le code source sans contrat. | A-22 ; `05` §5 (visibilité publique) | NON COMMENCÉ (décision) | Décision écrite de Sabri : privé + démo, licence, ou statu quo. Pas d'avis juridique ici. |
| AN-14 | Moyenne | **Textes de confidentialité contredits par les appels réseau** (A-07) : « Tout reste sur ton ordinateur », « rien n'est envoyé », alors que artiste et titre partent vers Deezer et iTunes, et qu'un lecteur Apple est chargé en iframe. | A-07, AC-17. Aucun changement de texte dans les commits P0. | NON COMMENCÉ | Formulation à valider par Sabri ; liste visible des services appelés. |
| AN-15 | Moyenne | **Garde-fous de publication seulement dans Claude Code** (A-21). Un autre outil pousse sans ces contrôles. Le fichier d'accord peut être créé par Claude seul. | A-21 ; `09_AUTONOMIE_CLAUDE_CODE.md` de l'audit | NON COMMENCÉ | Protection de `main` (AN-12) comme barrière côté GitHub. |
| AN-16 | Moyenne | **25 `catch(e){}` vides** à l'audit (A-09). Recherche du 05/11 sur `index.html` : 22 occurrences sur la branche, 25 sur `382b661`. La baisse vient des suppressions de code Serato et des réécritures P0, pas d'un chantier dédié. | Recherche du 05/11 ; A-09 | NON COMMENCÉ | Traiter les chemins utilisateur un par un (message ou journal). |
| AN-17 | Moyenne | **Rustines en couches** (A-10) : `VIEWS.trend` redéfini 3 fois, `VIEWS.settings` 3 fois, 5 fonctions réaffectées. Non touché. | A-10 | NON COMMENCÉ | Fusionner les couches après couverture de tests. |
| AN-18 | Moyenne | **Fonctionnalités du cahier absentes** : mode soirée, lecteur plein écran, import/export rekordbox, enregistrement audio (`MediaRecorder`), fondus, courbe d'énergie, connexions Spotify/Apple Music/Deezer (hors JSONP et iTunes), comptes, licences. | `00_LIRE_EN_PREMIER.md` de l'audit, fichier 03 | NON COMMENCÉ | Décision de portée par Sabri. Le Wake Lock est possible en appli installée dès iOS 18.4 (`06` §3). |
| AN-19 | Moyenne | **Précision de l'analyse audio non mesurée sur de vrais morceaux** (L-018). Seule mesure : 12 sons de synthèse (BPM 12/12, tonalité 10/12), énergie constante à 1, confiance de tonalité inutilisée (A-11, A-12, A-13). | `docs/research/04_ANALYSE_MUSICALE/PROTOCOLE_MESURE.md` | NON COMMENCÉ (protocole écrit, aucune mesure) | Choix du corpus et du seuil par Sabri (le seuil « 90 % sur 100 morceaux » est à reformuler). |
| AN-20 | Moyenne | **Licence AGPL d'essentia.js** en tension avec le dépôt public et avec la vente éventuelle. | Fiche M-09 | BLOQUÉ (article 13 non lu, conditions de licence commerciale non vérifiées) | Requête R-AM-02 ; relecture par un juriste. Rien n'est intégré. |
| AN-21 | Faible | **Gestionnaires de signaux de `sabotage.js`** (Ctrl+C) écrits mais non testés (sous Windows, Node ne délivre pas ces signaux à un enfant sans le tuer). Un arrêt brutal laisse `index.html` altéré, réparable par la copie de secours ou `git restore`. | `04` §6 | IMPLÉMENTÉ NON VALIDÉ | Test sous Linux (CI) ou à la main. |
| AN-22 | Faible | **`copyFiles` remplace un fichier de même nom et de taille différente** dans le dossier de destination (`SetMate/<set>/`). Ne touche ni les originaux ni Serato. | `04` §1 | NON COMMENCÉ | Demander avant d'écraser. |
| AN-23 | Moyenne | **Convention de chemin Windows pour le M3U8** choisie, non documentée par Serato (lettre de lecteur en majuscule, barres inverses, chemin sans lecteur converti en `/Users/...`). | `04` §3 ; S-16 | À TESTER SUR APPAREIL | Lié à AN-07. |
| AN-24 | Faible | **Liste blanche de domaines** (pochettes, aperçus) : un CDN légitime non prévu serait refusé (pochette absente, pas de plantage). Non vérifié sur de vraies réponses Deezer. | `03` §3.6 | À TESTER SUR APPAREIL | Observer sur de vraies données. |
| AN-25 | Faible | **Artefact d'échec de la CI** téléchargeable par tout le monde (dépôt public). Ne contient que des données fabriquées. | `05` §2 | IMPLÉMENTÉ NON VALIDÉ | Retirer l'étape si Sabri préfère. |
| AN-26 | Faible | **38 tests « non exécutés »** dans le résultat rapporté (198 réussis). Ils sont voulus (API de dossiers Chrome absentes de WebKit, scripts Node lancés une fois). Ils réduisent la couverture WebKit. | `04` §5 | IMPLÉMENTÉ NON VALIDÉ (explication cohérente, non revérifiée par relance) | Relancer la suite quand la mémoire le permet. |
| AN-27 | Moyenne | **Serato iOS / Serato 3 / Serato 4 : M3U et crate non testés.** | `04` §7 points 5 et 6 | À TESTER SUR APPAREIL | Hors périmètre actuel. |
| AN-28 | Faible | **Messages de réussite avant l'écriture** (400 ms) : l'interface peut afficher « Masqué » avant que l'écriture soit confirmée ; l'échec est signalé ensuite par le bouton, pas par un retour en arrière. `DB.get` renvoie `undefined` sur erreur de lecture. | `01` limites P0-01 | NON COMMENCÉ | Choix de conception à discuter. |

## 2. Anomalies de l'audit précédent (A-01 à A-25)

Statut au commit `c2c7a99`. « Corrigée par la branche » ne veut pas dire « validée sur appareil ».

| ID | Sujet | Gravité d'origine | Situation | Commit | Statut |
|---|---|---|---|---|---|
| A-01 | Garde de version Serato désactivable | Haute | Corrigée : constante `SERATO_ECRITURE_AUTORISEE=false`, interrupteur supprimé, porte qui refuse toujours | `5fdc6e6` | CORRIGÉ ET TESTÉ (faux disque, pas de Serato réel) |
| A-02 | Ré-encodage `database V2` incomplet | Haute | Chemin d'écriture supprimé (branche « Serato 3 » de `exportUsb`) ; le ré-encodage lui-même n'a pas été rendu fidèle | `5fdc6e6` | CORRIGÉ ET TESTÉ (par suppression de l'écriture, faux disque) |
| A-03 | `DB.set` répond « fait » à tort | Haute | Corrigée : réussite à la fin de transaction + relecture | `db03547` | CORRIGÉ ET TESTÉ (simulation) ; À TESTER SUR APPAREIL |
| A-04 | Restauration sans validation | Haute | Corrigée : validation, aperçu, copie `backup_prev`, application atomique | `a9a64ec` | CORRIGÉ ET TESTÉ (sauvegardes fabriquées et démo) ; vraie sauvegarde À TESTER SUR APPAREIL |
| A-05 | Injection par URL Apple dans `onclick` | Moyenne | Corrigée : `safeUrl`, plus d'URL dans du code | `4d8be71` | CORRIGÉ ET TESTÉ |
| A-06 | Pas de sauvegarde à la fermeture | Moyenne | Corrigée : `pagehide` et passage en arrière-plan forcent l'écriture | `db03547` | CORRIGÉ ET TESTÉ (événement manuel) ; À TESTER SUR APPAREIL |
| A-07 | Textes de confidentialité contredits | Moyenne | Ouverte | | NON COMMENCÉ |
| A-08 | JSONP Deezer et absence de CSP | Moyenne | Partielle : adresse limitée à l'hôte exact. Risque de fond et CSP ouverts | `4d8be71` (partie) | NON COMMENCÉ pour le fond (voir AN-01, AN-04) |
| A-09 | 25 `catch` vides | Moyenne | Ouverte (22 occurrences relevées) | | NON COMMENCÉ |
| A-10 | Rustines en couches | Moyenne | Ouverte | | NON COMMENCÉ |
| A-11 | Énergie non validée | Moyenne | Ouverte | | NON COMMENCÉ |
| A-12 | Confiance de tonalité inutilisée | Moyenne | Ouverte | | NON COMMENCÉ |
| A-13 | Commentaire de validation non traçable | Faible | Ouverte | | NON COMMENCÉ |
| A-14 | Gros fichiers et mémoire iPhone | Moyenne | Ouverte | | NON COMMENCÉ (à tester sur appareil) |
| A-15 | Service worker « réseau d'abord » sans délai | Moyenne | Ouverte (le nom du cache suit désormais la version, vérifié par `verif_statique.js`) | | NON COMMENCÉ |
| A-16 | Chemins Windows et Mac non vérifiés | Moyenne | Partielle : `m3uPath` et 20 cas de chemins testés comme texte. Serato réel non testé | `5fdc6e6` | IMPLÉMENTÉ NON VALIDÉ ; À TESTER SUR APPAREIL |
| A-17 | Sabotage : tout échec pris pour une détection | Moyenne | Corrigée : filtre vide compté non détecté, « détecté » seulement si un test échoue réellement | `5fdc6e6`, `ee6adbc` | CORRIGÉ ET TESTÉ (25/25 rapporté) |
| A-18 | Assertion qui réussit à vide (« 12 critères ») | Faible | Non traitée dans les documents lus | | NON COMMENCÉ |
| A-19 | Chemins d'écriture non testés | Haute (couverture) | Partielle : persistance, restauration, `writeCrates` et `writeFile` (faux disque) sont couverts. Service worker, analyse audio, vrais services et E-004 : non | `db03547`, `a9a64ec`, `5fdc6e6` | IMPLÉMENTÉ NON VALIDÉ (couverture partielle) |
| A-20 | Production non protégée par la CI | Moyenne | Workflow durci écrit, non exécuté, non fusionné. `main` sans workflow | `78b7395`, `ee6adbc` | IMPLÉMENTÉ NON VALIDÉ |
| A-21 | Garde-fous de publication seulement dans Claude Code | Moyenne | Ouverte | | NON COMMENCÉ |
| A-22 | Dépôts publics sans licence | Moyenne | Ouverte | | NON COMMENCÉ |
| A-23 | Obsolescence de la CI (Node 20, Ubuntu 26) | Faible | Actions repassées sur `checkout` v7.0.1, `setup-node` v7.1.0, `upload-artifact` v7.0.2, figées sur SHA. Jamais exécuté chez GitHub | `78b7395` | IMPLÉMENTÉ NON VALIDÉ |
| A-24 | Restes et incohérences de dossier | Faible | Non traité | | NON COMMENCÉ |
| A-25 | `tester_garde_fous.js` écrit dans le projet | Faible | Non traité (script hors du worktree) | | NON COMMENCÉ |

Décompte (par la table ci-dessus) : corrigées avec preuve de simulation : A-01, A-02, A-03, A-04, A-05, A-06, A-17 (7). Partielles ou écrites non exécutées : A-08 (partie), A-16, A-19, A-20, A-23 (5). Toujours ouvertes : les 13 autres.

Le statut « CORRIGÉ ET TESTÉ » des 7 premières lignes signifie : preuve reproductible **en simulation**. Aucune n'est validée sur iPhone réel ni sur Serato réel.

## 3. Nouveaux points trouvés pendant les travaux

- `go()` plantait l'affichage sur un écran inconnu (lien de notification abîmé) : corrigé, `4d8be71`.
- Un chemin se terminant par un retour chariot passait le contrôle M3U8 : corrigé avant le commit `ee6adbc` (trouvé par les nouveaux tests).
- Version précédente de `sabotage.js` : un nom de test en plusieurs mots passé sans guillemets pouvait produire un faux « détecté ». Corrigé.

## Ajout du 05/11/2026 : tests intermittents observés (AN-90)
- **Constat** : une exécution complète (
px playwright test --workers=2, mémoire libre environ 4,3 Go) a donné **194 réussis, 4 échoués** dans 	ests/p0_restauration.spec.js. Trois relances ensuite : ciblée sur ce fichier 58/58 réussis (--workers=1), complète 198/198 réussis, puis complète 198/198 réussis.
- **Statut** : cause non établie. Hypothèse, non vérifiée : délais dépassés sous forte charge mémoire (le même PC avait fait arrêter un test par le système peu avant). Les noms exacts des 4 échecs n'ont pas été conservés.
- **Risque** : sur la CI GitHub (machine différente), des échecs intermittents sont possibles. Statut : À TESTER (première exécution du workflow chez GitHub pas encore faite).
- **Prochaine action** : conserver la liste des échecs de toute exécution rouge (reporter list ou rapport HTML) avant d'envisager un correctif. Ne pas augmenter les délais ni retirer un test sans l'accord de Sabri.
