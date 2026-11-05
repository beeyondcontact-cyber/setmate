# 04 · Serato : chemins Windows et méthodes non destructives de transfert

Consultation : 05/11/2026.

---

## S-16 · Chemins Windows : lettres de lecteur, UNC, plus de 260 caractères
- **Question étudiée** : comment Serato référence-t-il les fichiers (lettre de lecteur, chemin réseau UNC), et quelle limite de longueur ?
- **Source primaire** : aucune page Serato lue ne traite de la longueur ni des chemins UNC. Éléments officiels indirects : article « Backing up and moving your library… » : « Never rename the files themselves when you copy them, they must retain the same original filename » (Serato lit le nom et le chemin) ; `_Serato_` est créé « on the root level of any external drive » (article 204022904).
- **URL exacte** : https://support.serato.com/hc/en-us/articles/202305054-Backing-up-and-moving-your-library-to-a-new-computer ; https://support.serato.com/hc/en-us/articles/204022904-What-is-in-the-Serato-folder
- **Date de consultation** : 05/11/2026
- **Version concernée** : sans numéro
- **Résultat vérifié** : (1) un `_Serato_` par disque externe : la lettre de lecteur n'est donc pas ce qui identifie le contenu d'un disque dans Serato ; (2) la recherche web sur « 260 caractères » n'a retourné aucune source Serato, seulement des forums d'autres logiciels (limite générique MAX_PATH de Windows, 260 caractères).
- **Limites et contradictions** : le comportement de Serato avec un chemin > 260 caractères, un chemin UNC (`\\serveur\partage`) ou une lettre de lecteur modifiée est **non recherché en source officielle**. L'affirmation « (2) » ci-dessus est générale à Windows, pas à Serato.
- **Impact sur SetMate** : les cas 5 et 10 de la matrice (§5 bis) restent des cas de test à passer, pas des règles connues.
- **Recommandation** : SetMate signale (sans bloquer) les titres dont le chemin dépasse 240 caractères ; ne pas générer de chemins UNC ; test pratique sur Windows 11 (R-C07).
- **Statut** : **non vérifié**

## S-17 · Copier des caisses sans rien casser (méthode officielle)
- **Question étudiée** : quelle méthode officielle déplace des caisses/playlists sans toucher à la bibliothèque d'origine ?
- **Source primaire** : articles « Copying and Managing Content from the Files Tab - Serato DJ Pro & Lite » et « Using a USB external hard drive for your portable library ».
- **URL exacte** : https://support.serato.com/hc/en-us/articles/14362305508239-Copying-and-Managing-Content-from-the-Files-Tab-Serato-DJ-Pro-Lite ; https://support.serato.com/hc/en-us/articles/202304844-Using-a-USB-external-hard-drive-for-your-portable-library
- **Date de consultation** : 05/11/2026
- **Version concernée** : Pro/Lite (mis à jour le 18/11/2025 et le 18/02/2026)
- **Résultat vérifié** (relayée par l'outil de lecture, non recoupée au texte brut) : dans le panneau Files, on glisse une caisse ou sous-caisse sur un autre disque ; choix Copy / Move / Cancel ; « Copy » laisse la bibliothèque référencer les fichiers d'origine ; « Move » met à jour les références. Pour un disque portable, on copie (pas déplace) la caisse sur la clé ; les caisses intelligentes ne sont pas transférables ; ne pas utiliser la même clé pour Time Machine.
- **Limites et contradictions** : rien sur Mac vs Windows, systèmes de fichiers (FAT32/exFAT/NTFS) ni limites de crates (article renvoyant à un autre).
- **Impact sur SetMate** : la voie non destructive officielle = actions dans l'interface de Serato. Pour SetMate : produire un fichier séparé et laisser l'utilisateur l'importer/le reconstruire lui-même, sans écrire dans `_Serato_`.
- **Recommandation** : chemin de secours = liste texte + M3U8 (S-01/S-03) ; transfert iPhone = S-05.
- **Statut** : **probable**

## S-18 · Déplacer une bibliothèque complète (sauvegarde et nouvel ordinateur)
- **Question étudiée** : quelle est la procédure officielle de sauvegarde/restauration ?
- **Source primaire** : article « Backing up and moving your library to a new computer ».
- **URL exacte** : https://support.serato.com/hc/en-us/articles/202305054-Backing-up-and-moving-your-library-to-a-new-computer
- **Date de consultation** : 05/11/2026
- **Version concernée** : sans numéro (mis à jour le 13/07/2026)
- **Résultat vérifié** (texte brut) : copier `_Serato_` (Music), le dossier `Library` (`C:\Users\<nom>\AppData\Local\Serato\` sous Windows) et les fichiers musicaux ; fusionner les `_Serato_` des disques externes ; après transfert : « Rescan ID3 Tags » puis glisser le dossier de musique sur « Relocate Lost Files ».
- **Limites et contradictions** : ne dit rien des différences 3.x / 4.0 ni du changement de lettre de lecteur. Un article distinct « Merging Two (or more) _Serato_ Folders » (id 219871867, mis à jour en 2017) existe : **non lu**.
- **Impact sur SetMate** : modèle de sauvegarde à conseiller avant toute manipulation ; la restauration passe par « Relocate Lost Files », pas par une modification de chemins hors Serato.
- **Recommandation** : texte d'aide dans l'appli renvoyant à cet article ; SetMate ne tente pas de réparer les chemins.
- **Statut** : **confirmé**
