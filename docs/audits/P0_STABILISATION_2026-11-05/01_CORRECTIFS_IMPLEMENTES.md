# 01 · Correctifs implémentés (P0, SetMate 1.9.2-p0)

Branche `fix/setmate-p0-stabilisation`, base `c4306fa` (1.9.1). Fait le 05/11/2026 dans le worktree `travail_p0_worktree`. Rien n'a été poussé, rien n'est en ligne, `main` et le dossier `site` (production) n'ont pas été touchés.

Version : `VERSION="1.9.2-p0"` dans `index.html` et `const C = "setmate-1.9.2-p0"` dans `sw.js` (commit P0-01, vérifié par `node tests/verif_statique.js` avant chaque commit).

## Commits

| Commit | Contenu | Fichiers |
|---|---|---|
| `db03547` | P0-01 Persistance | `index.html`, `sw.js`, `tests/p0_persistance.spec.js`, `tests/aide.js`, `tests/verif_statique.js`, `tests/sabotage.js` |
| `a9a64ec` | P0-02 Restauration et intégrité | `index.html`, `tests/p0_restauration.spec.js`, `tests/sabotage.js` |
| `4d8be71` | P0-03 Injection | `index.html`, `tests/p0_injection.spec.js`, `tests/audit_html_dynamique.js`, `tests/sabotage.js` |
| (commit « docs ») | Ces trois documents | `docs/audits/P0_STABILISATION_2026-11-05/*.md` |

Aucun des 20 tests existants (`tests/setmate.spec.js`) n'a été modifié ni assoupli. Aucun test ni fonctionnalité supprimé.

Note Git : l'identité Git n'était pas configurée dans ce worktree. Les commits ont été signés avec l'identité des commits précédents du dépôt, passée en option `-c` (aucune configuration modifiée).

---

## P0-01 · Persistance (A-03, A-06) · CORRIGÉ ET TESTÉ (simulation) · fermeture réelle iPhone : À TESTER SUR APPAREIL

**Problème reproduit** : `DB.set` appelait `res()` dans `onerror` et dans le `catch`, et `del` n'avait aucun chemin d'erreur. Avant correctif, les tests P0-01 donnaient 7 échecs sur 8 (Chrome).

**Ce qui a changé** (`index.html`, bloc `DB`, `save`) :
- `DB._run` : une écriture ne réussit qu'à l'événement de **fin de transaction** (`oncomplete`), puis une **relecture** (`DB.read`) vérifie que la donnée est là avec la même forme (taille de liste, nombre de clés, taille de fichier, calculée au moment de l'écriture). Sinon la promesse est **rejetée**.
- Erreurs exploitables (`dbErr`) : `.quota` (QuotaExceededError ou équivalent), `.kind` (`quota`, `abort`, `unavailable`, `verify`, `other`), `.dbName`, message en français.
- `DB.setMany` / `DB.delMany` : opérations groupées dans UNE transaction (tout ou rien). Si une écriture échoue de façon synchrone, la transaction est annulée (`tx.abort()`).
- `save()` écrit maintenant `state` et `tracks` dans une seule transaction (avant : deux écritures séparées). `tracksDirty` n'est remis à faux qu'après succès.
- Indicateur : attribut `data-unsaved="1"` sur `<html>` tant qu'une modification n'est pas confirmée, et bouton fixe « Modifications non enregistrées · Réessayer » après un échec. Message de quota : « Stockage plein : tes dernières modifications ne sont PAS enregistrées… ». Nouvelle tentative automatique après 15 s et au clic. Le message revient au plus une fois par minute.
- Fermeture : `pagehide` et passage de la page en arrière-plan (`visibilitychange` hidden) forcent l'écriture sans attendre les 400 ms. `beforeunload` prévient seulement si une écriture a déjà échoué.
- Appelants adaptés pour ne pas planter sur un refus : mémorisation des dossiers (`h_*`), `doReset` (une seule transaction, ne recharge pas si l'effacement échoue), `ownRm` (le son n'est retiré de la liste qu'après suppression confirmée), `dbPut` (fichiers du téléphone, vérifiés), boîte noire (`log`).
- `load()` : `S.tracks` redevient `[]` si la valeur lue n'est pas une liste.

**Limites assumées**
- Les messages « fait » affichés par l'interface après une action (par exemple « Masqué ») précèdent l'écriture de 400 ms. L'échec est signalé ensuite par le bouton et le message de stockage, pas par un retour en arrière de l'action. Les données restent en mémoire.
- `DB.get` (lecture) renvoie toujours `undefined` en cas d'erreur de lecture, sans erreur. Seule la relecture de vérification (`DB.read`) rejette.
- `pagehide` n'est testé que par un événement envoyé à la main : le comportement d'iOS qui suspend la page n'est pas vérifié.

---

## P0-02 · Restauration et intégrité (A-04) · CORRIGÉ ET TESTÉ

**Problème reproduit** : `importData` acceptait tout JSON ayant la clé `setmate`, puis `Object.assign(S, state)`. Avant correctif, les tests P0-02 donnaient 27 échecs sur 29 (les 2 réussites, « annuler » et « __proto__ », passent aussi sur l'ancien code et servent de garde).

**Ce qui a changé** :
- `validateBackup(texte, taille)` ne touche à rien et renvoie `{ok, errors, warnings, state, info}` :
  - fichier vide, trop gros (`RESTORE_MAX_BYTES`, 120 Mo), JSON invalide (la lecture ignore les clés `__proto__`), pas un objet, pas de marque `setmate` ;
  - version : `1.x` avec x inférieur ou égal à la version courante acceptée (avertissement si ancienne) ; version future, version majeure différente, version illisible ou non textuelle refusées ; champ `schema` supérieur à 1 refusé ;
  - `state` obligatoire ; au moins une donnée reconnue (sons, set, playlists, soirées ou fichiers) ;
  - types de chaque champ connu (table `BK_SHAPE`), fiches de sons (numéro entier unique, textes, tonalité `8A`, nombres, identifiants Deezer entiers), playlists (identifiant sûr), fichiers du téléphone, soirées (date `AAAA-MM-JJ`), notifications, clés d'apprentissage `L` et `P` (`n` et `n>n` seulement), tendances, découvertes, à récupérer ;
  - parcours en profondeur : tout `dz`, `aid` doit être entier, tout `fid` un identifiant sûr ;
  - **nettoyés avec avertissement** (pas de refus) : pochettes hors liste blanche (retirées), entrées du cache Apple invalides (retirées) ;
  - champs absents : conservés tels quels sur l'appareil, signalé dans l'aperçu ; numéro suivant corrigé si trop petit.
- Aperçu (`confirmRestore`) : version, date, nombre de sons, playlists, soirées, set, avertissements, état actuel, et mention de la copie de secours.
- Message d'erreur (`showRestoreError`) en français : « Restauration impossible » + raisons + « Tes données actuelles n'ont pas été modifiées ».
- `restoreState` : copie de l'état précédent dans la clé IndexedDB `backup_prev` (si elle échoue, la restauration est refusée), puis `applyStateAtomic` écrit `state` et `tracks` en une transaction vérifiée, puis seulement applique en mémoire. En cas d'erreur à l'application : retour arrière en mémoire puis dans le stockage. La restauration reste annulable (bouton Annuler du message).
- Les sauvegardes exportées (`exportData`, `shareData`) contiennent seulement les champs persistants, plus `schema:1` (`backupObj`). Les anciennes sauvegardes restent lisibles.

**Limites assumées**
- `load()` (lecture au démarrage depuis IndexedDB) ne revalide pas les données : elles sont considérées comme de confiance (même origine). Une donnée abîmée déjà stockée n'est pas détectée.
- Les migrations d'anciennes versions (liste à part de la 1.1, `pos` des tendances) restent faites par `load()` au prochain démarrage, comme avant.
- Les fichiers audio du téléphone ne font pas partie de la sauvegarde (comportement inchangé).
- `backup_prev` ne garde qu'UN état précédent (le plus récent). Il double l'espace utilisé pendant la restauration.

---

## P0-03 · Injection (A-05, A-08 en partie) · CORRIGÉ ET TESTÉ pour les entrées externes traitées · réécriture complète des onclick : NON COMMENCÉ

**Problème reproduit** : `embedAM` écrivait `onclick="location.assign('${m.url}')"`. Une URL `https://music.apple.com/x');window.__PWNED=1;('` exécutait le code. Avant correctif : 19 échecs sur 22 tests P0-03 (Chrome).

**Ce qui a changé** :
- `safeUrl(url, usage)` : https obligatoire, pas d'identifiants dans l'URL, port 443 seulement, aucun espace ni `' " < > \` ``, hôte dans une liste blanche par usage : `open` (music.apple.com, itunes.apple.com, deezer.com), `img` (dzcdn.net, deezer.com, mzstatic.com), `media` (dzcdn.net), `api` (api.deezer.com, hôte exact), `embed` (embed.music.apple.com, hôte exact). Les faux domaines (`music.apple.com.evil.com`) sont refusés.
- `embedAM` / `openAM` : la fiche Apple passe par `amSafe` (identifiants entiers, URL validée). Le bouton « Ouvrir dans Musique » est créé sans `onclick` et reçoit un `addEventListener` ; l'ouverture passe par `openExternal` (revalide). Le lecteur intégré n'est construit que si les identifiants sont des entiers. `amMatch` ne garde plus une réponse iTunes aux champs incorrects.
- Deezer : `dzItem`/`dzItemA` rendent `dz` et `aid` numériques ou `null` ; pochettes filtrées par `safeUrl` ; `playDz` refuse un identifiant incorrect ; les extraits audio (`AU.src`, `fetch`) passent par `dzMedia` ; l'artwork du lecteur est filtré.
- `cover()` : l'URL de pochette est validée puis placée entre apostrophes dans le style.
- `jsq` : échappe aussi `\r`, `\n`, U+2028, U+2029. Appliqué à tous les identifiants-chaînes placés dans un `onclick` (`p.id`, `o.fid`, `n.go`, `kind`, clés des listes apprises).
- `go()` ignore un écran inconnu (un lien de notification abîmé cassait l'affichage : trouvé par les tests).
- Champs affichés bruts désormais échappés : année, tonalité, position de tendance, date de soirée dans le formulaire.
- Restauration : voir P0-02 (mêmes validations).
- JSONP : `jsonp()` refuse toute adresse hors `https://api.deezer.com` et pose `referrerPolicy="no-referrer"`. Le risque de fond est dans `03_SECURITE.md` (section JSONP).
- Outil d'audit : `node tests/audit_html_dynamique.js` (reproductible).

**Limites assumées** : voir `03_SECURITE.md` (risques résiduels, classement des gestionnaires onclick).

---

## Hors périmètre (non touché)
Garde de version Serato coupable (A-01), ré-encodage Serato (A-02), promesses de confidentialité (A-07), `catch` vides (A-09), rustines (A-10) : anomalies de l'audit non traitées ici.
