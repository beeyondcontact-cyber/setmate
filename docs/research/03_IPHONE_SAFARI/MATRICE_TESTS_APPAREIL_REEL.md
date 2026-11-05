# Matrice de tests sur iPhone réel (SetMate)

Préparée le 05/11/2026. **Aucun test n'a été exécuté.** Toute colonne « VÉRIFIÉ » vaut « non testé » tant qu'une preuve n'est pas jointe.

## En-tête à remplir avant les tests
| Champ | Valeur |
|---|---|
| Modèle d'iPhone | à noter (Réglages > Général > Informations > Nom du modèle) |
| Version d'iOS | à noter (même écran ; l'audit indique 18.7 au 30/10/2026) |
| Version de SetMate | à noter (écran Réglages de l'appli ; cible 1.9.1) |
| Mode | installée sur l'écran d'accueil (oui/non) |
| Date, heure, testeur | à noter |
| Batterie, mode économie d'énergie, espace libre | à noter |
| Réseau (Wi-Fi/4G/avion) | à noter par test |

## Règles
- Un test à la fois. Après chaque test : noter RÉUSSI / ÉCHEC / PARTIEL et joindre la preuve.
- « Attendu » est écrit **avant** le test. Étiquette : **[source]** si l'attendu découle d'une source de `FICHES_IPHONE_SAFARI.md` ; **[hypothèse]** si c'est une déduction.
- Ne pas retoucher l'attendu après coup. Un écart est un résultat, pas une erreur du testeur.
- Outils déjà dans l'appli : Réglages > Diagnostic > Envoyer le rapport (rapport texte) ; `startLockTest` (test écran verrouillé avec journal `EVT`). Capture d'écran = preuve visuelle.
- Pas de données personnelles dans les preuves (masquer noms et comptes).

## Matrice
| ID | Fonction (liens audit) | DOCUMENTÉ (source) | VÉRIFIÉ | Procédure (3 étapes max) | Résultat attendu (écrit d'avance) | Preuve à conserver |
|---|---|---|---|---|---|---|
| M-01 | Installation écran d'accueil (AC-01) | Installation manuelle via Partager ; manifeste standalone (WebKit 13878, I-01). Pas d'invite automatique (BCD) | non testé | 1. Safari > ouvrir l'adresse de SetMate. 2. Partager > Sur l'écran d'accueil. 3. Ouvrir l'icône. | Icône créée, ouverture sans barre Safari, 0 erreur [source] | Capture écran d'accueil + capture appli ouverte |
| M-02 | Premier lancement 1.9.1 (AC-01, AC-02, L-023) | rien de spécifique | non testé | 1. Lancer l'appli installée. 2. Réglages > Diagnostic > Envoyer le rapport. 3. Enregistrer le rapport. | 0 erreur en boîte noire au premier lancement [hypothèse, seuil de AC-01] | Fichier rapport texte |
| M-03 | Détection du mode autonome (I-01) | Mode standalone selon manifeste ; iOS 26 ouvre en web app par défaut (WebKit 16993) | non testé | 1. Ouvrir dans Safari : lire l'état dans le diagnostic. 2. Ouvrir l'icône installée : relire. 3. Comparer. | Safari = « navigateur » ; icône = « installée » [hypothèse sur l'affichage] | 2 captures du diagnostic |
| M-04 | Écriture IndexedDB puis relance (D-02, AC-03) | Connexion IndexedDB peut être perdue (bogue 273827, I-05) | non testé | 1. Créer une donnée repérable (une playlist « TEST-IDB »). 2. Forcer la fermeture de l'appli (balayer). 3. Rouvrir. | Donnée présente après relance [hypothèse] | Captures avant/après |
| M-05 | Suspension 0,4 s après action (A-06, AC-04) | Aucune source | non testé | 1. Modifier une donnée puis aussitôt balayer l'appli (< 1 s). 2. Rouvrir. 3. Répéter 5 fois. | Donnée conservée 5 fois sur 5 (seuil AC-04 : 0 perte) [seuil du projet] ; l'ÉCHEC attendu est connu (A-06, NON REMPLI) | Journal des 5 essais + captures |
| M-06 | Stockage persistant et quota (D-01, L-020) | `persist()` accordé selon heuristique ; `estimate()` Safari 17 (WebKit 14403, I-02, I-04) | non testé | 1. Ouvrir le diagnostic. 2. Lire « persistant » et usage/quota. 3. Capturer. | `persisted` vrai ou faux **noté tel quel** ; quota de l'ordre de plusieurs Go [source, ordre de grandeur] ; le rapport 1.6 disait « non garanti » | Capture du diagnostic |
| M-07 | Sauvegarde puis restauration (F-006, F-007, AC-06) | Aucune | non testé | 1. Exporter la sauvegarde JSON (Partager > Enregistrer dans Fichiers). 2. Effacer les données de test. 3. Restaurer le fichier. | État identique avant/après (comparaison des listes) [hypothèse] | Fichier JSON + captures avant/après |
| M-08 | Fichier de restauration abîmé (A-04, AC-05) | Aucune | non testé | 1. Dans Fichiers, dupliquer la sauvegarde et la tronquer (éditeur de texte). 2. Tenter la restauration. 3. Vérifier l'état. | Refus avec message ; état intact [seuil AC-05] ; ÉCHEC probable (A-04 ouvert) | Capture message + état |
| M-09 | Données après plusieurs semaines (L-020, AC-22) | Éviction par inactivité possible ; 7 jours d'usage Safari non installé (WebKit 2020, MDN, I-03) ; exemption installée « attendue » non garantie | non testé | 1. Écrire une donnée repérée, noter la date. 2. Ne pas ouvrir l'appli 7, 14 puis 28 jours. 3. Rouvrir à chaque échéance. | Donnée présente aux 3 dates [hypothèse, dépend de la fiche I-03] ; si perdue, noter la date | Captures datées |
| M-10 | Autorisation micro en appli installée (I-06) | getUserMedia corrigé en iOS 13.4 (bogue 185448) | non testé | 1. Lancer la dictée/enregistrement. 2. Accepter l'autorisation. 3. Parler 10 s. | Invite 1 fois, enregistrement audible/transcrit [source, 13.4] | Capture invite + résultat |
| M-11 | Invites micro répétées (I-06) | Bogue 215884 cité (non lu) : invites répétées quand le hash change | non testé | 1. Autoriser le micro. 2. Naviguer entre 3 écrans de l'appli. 3. Relancer l'enregistrement. | Pas de nouvelle invite [hypothèse] ; sinon noter après quel écran | Vidéo d'écran courte ou captures |
| M-12 | Déblocage Web Audio et lecture (I-07) | Contexte suspendu jusqu'à un geste ; `resume()` (BCD) | non testé | 1. Ouvrir l'appli, ne rien toucher. 2. Appuyer sur Lecture. 3. Écouter 30 s. | Son au premier appui, état « running » [source] | Journal EVT + note d'écoute |
| M-13 | Lecture écran verrouillé 60 min (E-011, L-016, AC-07) | Bogue 198277 : corrigé en iOS 15.4 selon commentaires (probable, I-08) ; rien sur le verrouillage proprement dit | non testé | 1. Lancer `startLockTest`. 2. Verrouiller l'écran 60 min (poser l'iPhone). 3. Déverrouiller, lire le journal EVT. | 60 min sans coupure [seuil AC-07] ; résultat incertain, ne pas supposer | Journal EVT complet + heure de début/fin |
| M-14 | Commandes sur l'écran verrouillé (Media Session) | Media Session Safari 15 (BCD) ; commandes de l'écran verrouillé (MDN) | non testé | 1. Lancer un morceau. 2. Verrouiller. 3. Réveiller l'écran (sans déverrouiller) : lire titre, appuyer Pause puis Lecture. | Titre affiché, Pause/Lecture fonctionnent [source MDN, non prouvé iOS] | Photo/capture de l'écran verrouillé |
| M-15 | Interruption par appel (L-016, I-09) | Bogue 273511 : contexte « interrupted » sans reprise (NEW, non confirmé) | non testé | 1. Lire un morceau. 2. Recevoir/passer un appel de test, raccrocher. 3. Observer. | Lecture reprise ou invite claire « touche pour reprendre » [hypothèse] ; ÉCHEC possible : noter l'état exact | Journal EVT + note |
| M-16 | Interruption par Siri (I-09) | Idem I-09 | non testé | 1. Lire un morceau. 2. Dire « Dis Siri », poser une question. 3. Observer. | Même attendu que M-15 [hypothèse] | Journal EVT |
| M-17 | Autre appli audio (Musique, vidéo) (I-09) | Idem I-09 | non testé | 1. Lire un morceau SetMate. 2. Lancer un son dans une autre appli. 3. Revenir à SetMate. | SetMate se met en pause ; reprise au geste [hypothèse] | Journal EVT + note |
| M-18 | Démarrage sans réseau (F-003, AC-10) | Service worker pris en charge depuis 11.1 (BCD) ; fiabilité hors ligne non vérifiée | non testé | 1. Ouvrir l'appli une fois en ligne. 2. Mode avion, forcer la fermeture. 3. Rouvrir et chronométrer. | Démarrage < 3 s, données visibles [seuil AC-10] | Chronométrage + capture mode avion |
| M-19 | Mise à jour du service worker (I-10) | Aucune lue | non testé | 1. Noter la version affichée. 2. En ligne, fermer puis rouvrir 2 fois. 3. Relire la version. | Nouvelle version après au plus 2 relances [hypothèse] | Captures de la version |
| M-20 | Import de fichiers audio de 3/10/50/120 Mo (L-017, A-14, AC-11) | Formats et mémoire non documentés (I-07) | non testé | 1. Importer un MP3 puis M4A, FLAC, AIFF, WAV de 3, 10, 50, 120 Mo. 2. Lancer l'analyse. 3. Noter plantage, temps, résultat. | 0 plantage jusqu'à 50 Mo [seuil AC-11] ; 120 Mo : incertain [hypothèse] ; formats refusés notés tels quels | Tableau format x taille x résultat |
| M-21 | Mémoire pendant l'analyse (E-008, T-07) | Aucune | non testé | 1. Analyser un fichier de 50 Mo. 2. Toucher l'écran pendant l'analyse. 3. Noter blocages (> 1 s) et rechargements de page. | Pas de rechargement ; blocage noté [hypothèse] | Vidéo d'écran |
| M-22 | Écran allumé (F-088, AC-09) | Wake Lock en web app installée à partir d'iOS 18.4 (bogue 254545, BCD, I-12) | non testé | 1. Activer le mode écran allumé (ou le diagnostic). 2. Laisser l'iPhone 5 min sans toucher (auto-verrouillage réglé 30 s). 3. Observer. | Écran reste allumé [source, 18.4+ ; iPhone sur 18.7] | Vidéo ou photo à 5 min |
| M-23 | Partage / export M3U, sauvegarde (F-060, F-007) | `navigator.share` Safari 12.1, `canShare` 14 (BCD) ; pas de sélecteur de dossier (I-11) | non testé | 1. Exporter une playlist. 2. Ouvrir la feuille de partage. 3. Enregistrer dans Fichiers puis ouvrir le fichier. | Fichier `.m3u8` lisible, bon nom, bon contenu [hypothèse] ; extension non renommée (voir L-022) | Capture de Fichiers + contenu du fichier |
| M-24 | Dictée du débrief (F-083, I-13) | Interface `webkit` depuis 14.1 ; rapport 1.6 : « souvent indisponible » | non testé | 1. Ouvrir le débrief installé. 2. Lancer la dictée. 3. Dicter 10 s. | Disponible ou message clair d'indisponibilité [hypothèse] ; cohérent avec `srOK()` | Capture + rapport diagnostic |
| M-25 | Fluidité de l'interface (E-008, T-07, I-14) | Aucune | non testé | 1. Ouvrir la liste de 26 puis 1 000 sons (si disponible). 2. Faire défiler 30 s. 3. Noter saccades. | Pas de blocage > 1 s [hypothèse] | Vidéo d'écran |
| M-26 | Données séparées Safari / installée (I-02, I-03) | web.dev : conteneur séparé pour l'appli installée (secondaire) | non testé | 1. Créer une donnée dans Safari. 2. Installer l'appli. 3. Chercher la donnée dans l'appli installée. | Donnée absente (stockages séparés) [hypothèse, source secondaire] ; prévoir sauvegarde/restauration pour migrer | Captures |
| M-27 | Effet d'une mise à jour d'iOS (L-020) | Aucune | non testé | 1. Noter l'état des données avant la mise à jour. 2. Mettre à jour iOS (à la prochaine sortie). 3. Relire les données. | Données intactes [hypothèse] | Captures avant/après + versions iOS |

## Après les tests
- Reporter les résultats dans un nouveau fichier daté (ne pas écraser cette matrice).
- Toute ligne ÉCHEC → registre d'erreurs + garde-fou + règle (méthode du projet), puis rappel de lancer la sauvegarde chiffrée.
- Lien avec `11_ETAT_VERSION_IPHONE.md` : AC-01 à AC-11 et AC-22 dépendent de cette matrice.
