# 01 · Serato : import M3U, exports de playlists et d'historiques

Consultation : 05/11/2026. Les extraits entre guillemets ont été lus sur le texte brut de l'API publique du centre d'aide Serato (corps JSON de l'article, récupéré par `curl`), sauf mention « relayée par l'outil de lecture ». Les pages HTML de `support.serato.com` répondent 403 aux outils automatiques ; l'API `support.serato.com/api/v2/help_center/...` répond 200.

---

## S-01 · La 5.0.0 ajoute l'import de fichiers M3U
- **Question étudiée** : Serato annonce-t-il officiellement l'import M3U, et depuis quelle version ?
- **Source primaire** : notes de version Serato DJ Pro (page de téléchargement).
- **URL exacte** : https://serato.com/dj/pro/downloads
- **Date de consultation** : 05/11/2026
- **Version concernée** : Serato DJ Pro 5.0.0 (seules les notes 5.0.0 sont affichées ; aucune date ni exigence système sur la page)
- **Résultat vérifié** : la page contient la ligne « Added the ability to import .M3U files. » (citation relayée par l'outil de lecture, identique à V1 de `07_RECHERCHES_ET_SOURCES.md`).
- **Limites et contradictions** : la ligne ne dit ni où cliquer, ni quels encodages, chemins ou fins de ligne sont acceptés. Elle ne précise pas si l'import marche aussi dans Lite/Intro. Aucune note 4.x n'est affichée sur cette page.
- **Impact sur SetMate** : on peut écrire « Serato 5.0.0 déclare importer les M3U » ; on ne peut PAS écrire « notre M3U s'importe correctement en 5.0 ».
- **Recommandation** : garder l'export M3U8 comme chemin principal pour la 5.0, mais l'afficher « annoncé par l'éditeur, non testé par nous » (niveau B de la matrice) tant que le protocole P0 à P8 n'a pas été passé.
- **Statut** : **confirmé** (existence de la ligne) ; effet réel **non vérifié**.

## S-02 · L'import M3U est absent de la 4.0
- **Question étudiée** : la 4.x lit-elle les M3U ?
- **Source primaire** : aucune page officielle. Fil du forum officiel (contenu rédigé par des utilisateurs, avec un message qui relaie une réponse attribuée à un modérateur sur le forum de la bêta publique).
- **URL exacte** : https://serato.com/forum/discussion/2066603
- **Date de consultation** : 05/11/2026
- **Version concernée** : Serato DJ Pro 4.0.0 (nouvelle bibliothèque)
- **Résultat vérifié** : le fil (novembre à décembre 2025) rapporte que le glisser-déposer d'un M3U ne fonctionne plus (un utilisateur décrit une caisse vide). Un message relaie, de seconde main, que la fonction manque dans la 4.0.0 « avec la nouvelle bibliothèque ». Aucun employé Serato ne répond directement dans le fil. Des utilisateurs repassent à la 3.5.
- **Limites et contradictions** : source de niveau **communauté** ; le relais du modérateur n'est pas vérifiable. Le blog DJ.Studio (https://dj.studio/blog/m3u-playlist-maker, tiers) affirme que Pro et Lite importent les M3U/M3U8 : il est probablement antérieur à la 4.0. L'ajout de l'import en 5.0.0 (S-01) est cohérent avec une absence en 4.0, sans le prouver.
- **Impact sur SetMate** : pour la 4.x, ne pas proposer le M3U comme voie recommandée ; proposer la liste texte / le lien de partage. Pour la 3.x et avant : le M3U était supposé importable (voir S-03), non testé.
- **Recommandation** : afficher « Serato 4.x : import M3U signalé absent (communauté) ». Rechercher une note officielle 4.x dans l'archive (R-C03 dans `REQUETES_CHROME.md`).
- **Statut** : **probable**

## S-03 · Méthode exacte d'import M3U (menu, encodage, chemins, fins de ligne) dans Serato 5.0
- **Question étudiée** : comment importer, quel encodage (M3U ancien vs M3U8 UTF-8, BOM), chemins absolus/relatifs, CRLF/LF, caractères spéciaux ?
- **Source primaire** : aucune trouvée. Recherche dans l'API d'aide (« M3U », « import playlist ») : le seul article qui parle de M3U est « History » (export, voir S-04). Aucun manuel 5.0 n'est remonté ; le résultat de recherche liste 435 articles et seuls deux articles 5.x sont apparus (Open Streaming, Cue Loops, mis à jour le 19/10/2026), tronqués.
- **URL exacte** : sans objet (recherche : https://support.serato.com/api/v2/help_center/articles/search.json?query=M3U)
- **Date de consultation** : 05/11/2026
- **Version concernée** : 5.0.0
- **Résultat vérifié** : néant. La seule trace d'ancienneté est un message de forum de 2013 cité par la matrice (M3U chargé vide avec caractères non occidentaux), non relu ici.
- **Limites et contradictions** : le résultat de recherche était tronqué ; l'absence de page ne prouve pas l'absence de procédure dans un manuel PDF.
- **Impact sur SetMate** : le message de l'appli ne doit pas décrire une procédure d'import (menu, glisser-déposer) tant qu'elle n'est pas observée.
- **Recommandation** : exécuter la requête R-C01 ; en attendant, fournir un M3U8 UTF-8 avec chemins absolus Windows, mais présenter ce choix comme une hypothèse de test, pas comme une exigence de Serato.
- **Statut** : **non vérifié**

## S-04 · Export M3U depuis l'historique de Serato (ce que Serato écrit lui-même)
- **Question étudiée** : quel est le format officiel des exports d'historique ?
- **Source primaire** : article d'aide « History ».
- **URL exacte** : https://support.serato.com/hc/en-us/articles/223455687-History (texte lu via https://support.serato.com/api/v2/help_center/en-us/articles/223455687.json)
- **Date de consultation** : 05/11/2026
- **Version concernée** : Serato DJ Pro (article mis à jour le 18/11/2025, sans numéro de version)
- **Résultat vérifié** : « Exported files can be located in the History Export folder contained in your Serato folder. » Formats : Serato Playlists, TXT, CSV, M3U. Pour le M3U : « Note that an .m3u does not contain audio itself, it only points to the location of your audio files. » Les pistes « inserted » ne sont pas dans le M3U.
- **Limites et contradictions** : l'article ne donne ni noms de colonnes, ni encodage, ni séparateur, ni format d'heure, ni nom de fichier. « Your Serato folder » est ambigu : le dossier `_Serato_` (Music) ou le dossier `Library` (AppData\Local\Serato), voir S-12. Aucun exemple de fichier réel n'a été comparé à `histParse`.
- **Impact sur SetMate** : lacune L-006 : le format exact reste à observer sur un export réel. Un M3U exporté par Serato contient des chemins vers les fichiers : c'est un bon échantillon pour apprendre la convention de chemin de Serato.
- **Recommandation** : demander à Sabri un export M3U + CSV + TXT d'une vraie session (copie), les comparer au code `histParse`, et réutiliser la forme des chemins du M3U exporté pour le M3U que SetMate génère.
- **Statut** : **confirmé** pour les 4 formats et le fait que le M3U ne contient pas d'audio ; format détaillé **non vérifié**.

## S-05 · Serato iOS : ce qui peut entrer (correction de L-005 et du cas n°16 de la matrice)
- **Question étudiée** : peut-on importer sur iPhone des fichiers locaux, via Fichiers ou iCloud, un `.crate` ou un M3U ?
- **Source primaire** : article d'aide « Adding files to the Serato DJ for iOS Library ».
- **URL exacte** : https://support.serato.com/hc/en-us/articles/17922671675407-Adding-files-to-the-Serato-DJ-for-iOS-Library (texte lu via l'API, mise à jour 03/11/2026 ; un doublon d'article porte l'identifiant 18042171009167)
- **Date de consultation** : 05/11/2026
- **Version concernée** : Serato DJ for iOS (octobre 2026)
- **Résultat vérifié** : deux méthodes. (1) « Transfer » depuis Serato DJ Pro/Lite sur l'ordinateur : on glisse une caisse vers l'appareil dans « iOS Transfer », puis « Allow » sur l'iPhone. (2) « Import Songs » ou « Import Folder » via l'application Fichiers ; Dropbox, Google Drive et iCloud fonctionnent si leurs applications sont installées et connectées. Une caisse est créée et nommée (par défaut du nom du dossier).
- **Limites et contradictions** : l'article ne mentionne ni `.crate`, ni M3U, ni liste de lecture. **Correction** : `07` et `08` (L-005) écrivent « Fichiers et iCloud non mentionnés » : c'est périmé, ils le sont maintenant. « iOS ne lit ni .crate ni M3U » reste non démontré (absent de l'article ≠ refusé).
- **Impact sur SetMate** : le chemin iPhone sûr = fichiers audio importés via Fichiers + caisse créée sur l'iPhone, ou transfert de caisse depuis Serato sur ordinateur. SetMate ne peut pas « pousser » une liste ; il peut afficher la liste de titres à retrouver.
- **Recommandation** : mettre à jour L-005 ; texte de l'appli : « Sur iPhone : importe tes morceaux avec Importer un dossier, puis retrouve la liste SetMate ».
- **Statut** : **confirmé** (méthodes) ; M3U/crate sur iOS **non vérifié**.

## S-06 · Formats audio acceptés et morceaux protégés
- **Question étudiée** : quelles extensions Serato lit-il, et les morceaux protégés (.m4p) ?
- **Source primaire** : article « Serato DJ Supported File Types ».
- **URL exacte** : https://support.serato.com/hc/en-us/articles/204177974-Serato-DJ-Supported-File-Types (relayée par l'outil de lecture, via l'API)
- **Date de consultation** : 05/11/2026
- **Version concernée** : Serato DJ Pro (sans numéro de version)
- **Résultat vérifié** : types listés : MP3, OGG, ALAC, FLAC, AIF, WAV, WL.MP3, MP4, M4A, AAC. « Tracks protected by DRM are not compatible with Serato DJ Pro. » ALAC : macOS et Windows 10 seulement ; AAC : macOS seulement (selon la lecture de l'outil). Apple Music en qualité Lossless téléchargé puis importé par l'intégration iTunes devient `.movpkg` illisible.
- **Limites et contradictions** : M4P n'est pas cité nommément ; la restriction « AAC macOS seulement » semble datée (non recoupée). Tableau par version absent.
- **Impact sur SetMate** : le cas n°9 de la matrice (m4p) est étayé par la règle DRM.
- **Recommandation** : signaler à l'utilisateur les morceaux sans fichier local ; ne pas promettre la lecture de l'ALAC/AAC selon l'OS.
- **Statut** : **probable** (lecture par un outil, citation non recoupée au texte brut).
