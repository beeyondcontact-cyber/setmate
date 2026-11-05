# 06 · Recherches intégrées (Serato, rekordbox/CDJ, iPhone/Safari, analyse musicale)

Synthèse de `docs/research/` (consultation du 05/11/2026). Les fiches complètes restent la source : ce document les résume et en tire l'impact sur SetMate. Aucun avis juridique. Aucune recherche nouvelle n'a été faite pour ce document : tout vient des fiches, relues le 05/11/2026.

Niveaux de statut des fiches : **confirmé** (source primaire lue, énoncé net) / **probable** / **hypothèse** (déduction) / **non vérifié** (source non lue ou contradiction).

Limite générale : plusieurs pages ont été lues par résumé d'outil, pas à l'écran. Aucune de ces conclusions n'a été confrontée à un appareil réel.

---

## 1. Serato (fiches S-01 à S-18)

Comptage des fiches : confirmé 7, probable 5, hypothèse 0, non vérifié 6.

| # | Conclusion | Statut | Impact sur SetMate |
|---|---|---|---|
| 1 | Les notes de la 5.0.0 contiennent « Added the ability to import .M3U files. » (S-01). La méthode (menu, encodage, chemins) n'est décrite nulle part dans ce qui a été lu (S-03). | confirmé (la ligne) ; effet réel non vérifié ; méthode non vérifié | Le M3U8 est la voie d'export retenue, mais « Serato l'importe » reste NON TESTÉ. L'appli affiche « Compatibilité réelle non testée ». |
| 2 | L'import M3U serait absent de la 4.0, uniquement selon la communauté (S-02). | probable | Serato 4.x : ne pas promettre le M3U. Aucune note officielle trouvée (requête R-C03). |
| 3 | Protect Library est officielle jusqu'à la 3.3.5 : elle verrouille suppressions, tags et noms de caisse dans l'interface (S-07). | confirmé (≤ 3.3.5) | Ce n'est pas une protection contre une écriture faite par un autre programme. |
| 4 | La 5.0.0 annonce « Added Protect Library feature. » sans description (S-09). L'article « Crates 4.0 » la cite encore (S-08). Effet sur une écriture disque externe : inconnu (S-10). | non vérifié | Rien dans SetMate ne doit s'appuyer sur Protect Library. Le mot n'apparaît pas dans l'appli (test). |
| 5 | `_Serato_` est dans Music (Windows et Mac) et à la racine de chaque disque. `Subcrates` est le stockage courant ; `database V2` et `Crates` sont marqués « legacy » (S-11). | confirmé ; compatibilité de `Subcrates` en 4/5 non vérifié | Justifie le choix P0-04 : ne plus écrire dans ces fichiers. |
| 6 | Aucune spécification officielle de `.crate` ni de `database V2` (S-12). | non vérifié | SetMate n'écrit plus ces fichiers (commit `5fdc6e6`). La lecture est conservée. |
| 7 | Historique : exports TXT, CSV, M3U et Serato Playlists dans un dossier « History Export » ; emplacement exact, colonnes et encodage inconnus (S-04, S-15). | confirmé (les 4 formats) ; détail non vérifié | L'import d'historique réel reste à valider (requête R-C04, PC de Sabri). |
| 8 | Chemins Windows (lettres de lecteur, UNC, plus de 260 caractères) : aucune source Serato (S-16). | non vérifié | `m3uPath` suit une convention choisie, pas documentée. À TESTER SUR APPAREIL. |
| 9 | Méthode non destructive officielle : actions dans l'interface (Files, copier/déplacer, Relocate Lost Files), sauvegardes `Export Backups` / `Library/Backups` (S-17, S-18). | probable (S-17) ; confirmé (S-18) | Protocole d'essai à suivre sur une copie, après sauvegarde Serato. |

Corrections aux documents précédents :
- Le texte « Fichiers et iCloud non mentionnés » pour Serato iOS (L-005, cas 16 de la matrice) est périmé : un article officiel Serato iOS du **03/11/2026** décrit l'import par l'app Fichiers (iCloud, Dropbox, Drive) et le transfert de caisses depuis l'ordinateur (S-05). M3U et crate sur iOS restent non vérifiés.
- `_Serato_/Subcrates` et les chemins passent au niveau « officiel » dans la matrice de compatibilité (S-11).

## 2. rekordbox / CDJ (fiches R-01 à R-14)

Comptage : confirmé 9, probable 3, hypothèse 0, non vérifié 2.

| # | Conclusion | Statut | Impact sur SetMate |
|---|---|---|---|
| 1 | Le seul format d'échange documenté par l'éditeur est le XML (`DJ_PLAYLISTS`) (R-01). | confirmé ; types exacts probable | Un export rekordbox passerait par ce XML. Absent du code aujourd'hui. |
| 2 | Le XML ne s'écrit pas sur la clé : rekordbox le lit (Imported Library), l'utilisateur glisse les pistes, rekordbox exporte (R-02). | confirmé | Pas de « copie directe sur clé » possible pour rekordbox ; il faut une étape dans rekordbox. |
| 3 | **rekordbox 7 importe M3U, M3U8 et PLS** (File > Import > Import Playlist) et exporte TXT et M3U8 (R-04). | confirmé ; chemins et encodage non vérifié | Correction de L-007 : le M3U8 est une voie documentée vers rekordbox. L'export M3U8 existant peut servir, à valider par un essai réel. |
| 4 | Une clé peut contenir deux bibliothèques : Device Library (ancienne) et OneLibrary (guide : rekordbox 7.2.11 ou plus). Historiques et playlists séparés ; la conversion est à sens unique et écrase une OneLibrary existante (R-06). | confirmé | Ne rien écrire sur une clé sans savoir quelle bibliothèque elle porte. |
| 5 | Formats de clé : FAT32, exFAT (modèles précis seulement), HFS+ ; NTFS et HFS non pris en charge (R-07). | confirmé (décodage des listes à recontrôler à l'écran) | Message d'avertissement à prévoir pour l'export clé. |
| 6 | Historiques de clé importés dans rekordbox ; format sur disque non documenté (R-08). | confirmé (flux) ; format non vérifié | Lecture d'un historique CDJ non faisable sans reconstruction. |
| 7 | `export.pdb` et ANLZ sont décrits seulement par ingénierie inverse communautaire (R-11, R-12). OneLibrary : aucune spécification trouvée (R-13). | probable ; non vérifié | Ne pas écrire ces fichiers. |
| 8 | L'EULA 2025 interdit la rétro-ingénierie du programme ; rien lu sur l'usage du XML (R-14). | confirmé (texte) ; conséquences non vérifié | À faire relire par un juriste avant toute vente. Pas d'avis ici. |

Divergence de vocabulaire : la page développeurs parle de « Bridge », le manuel 7.2.18 n'emploie pas ce mot (R-05, non vérifié).

## 3. iPhone / Safari / appli installée (fiches I-01 à I-14)

Comptage : voir `FICHES_IPHONE_SAFARI.md` (14 fiches, tableau de synthèse). Aucun test d'appareil.

| # | Conclusion | Statut | Impact sur SetMate |
|---|---|---|---|
| 1 | Installation manuelle (Partager > Sur l'écran d'accueil), pas d'invite. iOS 26 ouvre par défaut un site ajouté comme web app (I-01). | confirmé (16.4) ; comportement iOS 26 final probable | Écran d'aide à l'installation nécessaire (M-01, M-03). |
| 2 | Quota jusqu'à 60 % du disque par origine (Safari 17+), identique installée ou non (I-02). | confirmé (17+) ; iOS 18.7 probable | Le plafond n'est pas le souci principal : l'éviction et les pannes le sont. |
| 3 | **L'éviction existe.** La règle « 7 jours sans usage » est documentée dans le billet WebKit de 2020 pour Safari non installé. L'exemption des applis installées est « attendue » par WebKit, **sans garantie** (I-03). | probable | Sauvegarde manuelle obligatoire, rappel de sauvegarde à prévoir (D-01). Ne jamais écrire « tes données sont conservées ». |
| 4 | `navigator.storage.persist()` suit une heuristique ; non testé sur l'iPhone de Sabri (I-04). | confirmé (principe) | À lire dans le diagnostic (M-06). |
| 5 | Un bogue IndexedDB « connexion perdue » existe depuis 2019, encore signalé en octobre 2025 (I-05). | probable | Justifie la réouverture de connexion testée en P0-01, en simulation seulement. |
| 6 | Micro en appli installée depuis iOS 13.4 ; invites répétées signalées (bogue 215884 cité, non lu) (I-06). | confirmé (13.4) ; invites répétées non vérifié | M-10, M-11. |
| 7 | Audio en arrière-plan : correctif cité en iOS 15.4 d'après des commentaires ; l'écran verrouillé de SetMate n'est pas prouvé (I-08). Interruptions (appel, Siri) : aucun texte officiel (I-09). | probable ; hypothèse | Test M-13 à M-17 obligatoire avant toute promesse. |
| 8 | File System Access (sélecteurs de fichiers/dossiers) absent de Safari et Safari iOS (I-11). | confirmé (données MDN) | Sur iPhone : partage et Fichiers seulement, pas d'écriture dans un dossier. |
| 9 | **Wake Lock fonctionne en appli installée à partir d'iOS 18.4** (I-12). L'iPhone de Sabri est en 18.7 d'après l'audit du 30/10. | confirmé (18.4+) ; non testé sur l'iPhone | Le mode soirée (absent aujourd'hui) est techniquement envisageable. Test M-22. |
| 10 | Dictée (`webkit` préfixée) et performances : disponibilité réelle et mémoire non vérifiées (I-13, I-14). | non vérifié | Tests M-20, M-21, M-24, M-25. |

## 4. Analyse musicale (fiches M-01 à M-10)

| # | Conclusion | Statut | Impact sur SetMate |
|---|---|---|---|
| 1 | La seule mesure du projet porte sur 12 sons de synthèse : BPM 12/12, tonalité 10/12 (T-10 de l'audit). Elle ne dit rien de la précision sur de vrais morceaux (M-10). | probable (écart attendu) ; valeur non vérifié | Anomalie L-018 ouverte. Ne pas citer ces chiffres comme précision de l'appli. |
| 2 | Mesures usuelles du tempo : Accuracy1 (tolérance 4 %), Accuracy2 (erreurs d'octave admises), P-score à 8 % (`mir_eval`) (M-02). | confirmé (existence, tolérances) | Le critère ±1 BPM de SetMate est plus strict que Accuracy1 à 128 BPM (4 % ≈ 5 BPM). Rapporter les quatre. |
| 3 | Sur GiantSteps Tempo, le rapport `tempo_eval` donne Accuracy1 de 0,27 à 0,80 selon l'algorithme (référence 1.0). | confirmé (page lue, sans date) | Repère de prudence uniquement, pas un objectif. |
| 4 | Tonalité : poids `mir_eval` 1 / 0,5 / 0,3 / 0,2 (exact, quinte, relatif, parallèle) (M-04). | confirmé (poids) ; page MIREX non lue | Étiqueter « poids mir_eval ». Les 2 erreurs de SetMate sur synthèse étaient majeur/mineur. |
| 5 | Jeux de données : GiantSteps (604 et 664 extraits Beatport) sans licence déclarée ; FMA et MTG-Jamendo sans BPM ni tonalité ; Ballroom inaccessible (M-07). | confirmé (tailles, licences lues) sauf cases marquées | Ne pas redistribuer l'audio. Le corpus principal serait les morceaux de Sabri annotés par 2 DJ ou plus. |
| 6 | Phrases, énergie, évaluation de transitions : aucune source lue (M-03, M-05, M-06). | non vérifié | L'énergie pilote des crates et suggestions sans étalonnage (A-11). |
| 7 | Avec 100 morceaux, « 90 % de réussite » a une borne basse d'environ 83 % (Wilson 95 %, calcul de l'auditeur). | proposition de méthode | Le seuil AC-12 est à reformuler. Décision de Sabri. |
| 8 | essentia.js 0.1.3 est sous **AGPL-3.0**, wasm d'environ 2 Mo ; intégration à un fichier unique incertaine (M-09). | confirmé (licence, tailles) ; art. 13 et licence commerciale non vérifié | Tension avec le dépôt public sans licence et avec une vente : voir le point suivant. |

### Licence AGPL d'Essentia

La licence AGPL-3.0 d'essentia.js (fiche M-09) est en tension avec deux faits du projet : le dépôt est public sans licence propre, et les règles de Sabri prévoient de ne pas livrer le code source sans contrat. L'article 13 de l'AGPL n'a pas pu être lu (gnu.org a répondu 429). Il s'agit d'un point à faire trancher par un juriste, pas d'une conclusion de ce document. Rien n'est intégré dans SetMate à ce jour.

---

## 5. Contradictions entre sources

| Sujet | Source A | Source B | État |
|---|---|---|---|
| Protect Library en 4.x | Article « only available in 3.3.5 and below » | Article « Crates 4.0 » qui la cite encore (S-08) | Non résolue, requête R-C02 |
| Protect Library en 5.0 | Notes 5.0.0 : « Added Protect Library feature. » | Aucune description (S-09) | Non résolue |
| M3U dans Serato | 5.0.0 : import ajouté (officiel) | 4.0 : absent (communauté) | Pas de contradiction stricte, mais la méthode est inconnue |
| « Bridge » rekordbox | Page développeurs | Manuel 7.2.18 sans ce mot (R-05) | Non résolue, requête R-C06 |
| Éviction iOS | Règle 7 jours (billet 2020, MDN) | Exemption des applis installées « attendue » mais non garantie | Lecture prudente : aucune garantie |
| Audio écran verrouillé | Bogue 198277 corrigé en 15.4 (commentaires) | Bogue 232909 : chacun se dit doublon de l'autre dans nos résumés | Non résolue, requête R-iOS-01 |
| Wake Lock | Disponible en appli installée à partir de 18.4 | iPhone de Sabri en 18.7 selon l'audit du 30/10/2026 | Version d'iOS à revérifier au moment du test |
| Sauvegarde Serato iOS | Audit précédent : « Fichiers et iCloud non mentionnés » | Article du 03/11/2026 : import par Fichiers | Corrigée en faveur de l'article |

## 6. Sources bloquées et renvoi aux requêtes

Détail et format de retour attendu : `docs/research/REQUETES_CHROME.md`.

| Source bloquée | Cause | Requête |
|---|---|---|
| `support.serato.com` (HTML) | HTTP 403 (l'API JSON du centre d'aide répond) | R-C01, R-C02, R-C03 |
| music-ir.org (wiki MIREX) | certificat expiré | R-AM-01 |
| gnu.org (AGPL v3) | HTTP 429 | R-AM-02 |
| upf.edu (Ballroom) | HTTP 403 | R-AM-03 |
| developer.apple.com (notes Safari), support.apple.com | contenu utile non reçu | R-iOS-01, R-iOS-02, R-iOS-06 |
| github.com/hendriks73/tempo_eval | 404 (adresse supposée) | R-AM-04 |
| PDF rekordbox, PDF ISMIR | illisibles par l'outil | R-C08, R-C10, R-C12, R-AM-04 |
| web.archive.org | refusé par l'outil | sans objet |

Priorités de ces requêtes : Priorité 0 : R-C01 (méthode d'import M3U de Serato 5.0) et R-C02 (Protect Library). Priorité 1 : R-iOS-01 à R-iOS-04, R-AM-01, R-AM-02, R-C03 à R-C08.

## 7. Corrections apportées aux documents d'audit précédents

1. **Éviction à 7 jours.** Elle existe bien dans le billet WebKit de 2020 (Safari non installé). L'exemption des applis installées est « attendue » par WebKit mais n'est **pas une garantie** : l'audit précédent ne devait pas laisser croire à une protection.
2. **Import M3U de rekordbox 7.** Il est documenté (M3U, M3U8, PLS). L'affirmation L-007 selon laquelle rekordbox n'avait que le XML est corrigée.
3. **Serato iOS.** Article officiel du 03/11/2026 : import par l'app Fichiers et transfert de caisses. Correction de L-005 et du cas 16.
4. **Wake Lock.** Possible en appli installée dès iOS 18.4 (le mode soirée n'est donc pas bloqué par la plateforme sur un iPhone en 18.7, sous réserve de test).
5. **Licence d'Essentia.** AGPL-3.0 : en tension avec un dépôt public sans licence propre. À faire trancher par un juriste.
6. **Protect Library.** Le sens jusqu'à la 3.3.5 est confirmé par texte brut, mais la contradiction avec « Crates 4.0 » reste.

## 8. Ce que ces recherches n'ont pas permis de savoir

- Comment Serato 5.0 importe réellement un M3U8 (menu, BOM, fins de ligne, chemins).
- Si Protect Library empêche une écriture externe.
- Si `decodeAudioData` sur Safari iOS accepte FLAC et AIFF sans épuiser la mémoire.
- Si l'écran verrouillé tient 60 minutes avec SetMate.
- La précision réelle de l'analyse sur de vrais morceaux de club.
- Les conditions de licence commerciale d'Essentia et le sens exact de l'article 13 de l'AGPL.
