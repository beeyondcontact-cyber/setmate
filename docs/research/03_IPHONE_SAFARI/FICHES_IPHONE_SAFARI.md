# Fiches iPhone / Safari / PWA (SetMate 1.9.1)

Consultation : 05/11/2026. Aucune fiche ne prouve qu'une fonction marche dans SetMate : « documenté » n'est pas « testé » (voir `MATRICE_TESTS_APPAREIL_REEL.md`).

## Avertissements de méthode (à lire d'abord)
- Les pages web ont été lues par un outil qui renvoie un **résumé** (petit modèle), pas le texte brut. Les citations ci-dessous sont celles du résumé : à reconfirmer sur la page avant toute décision. Marqué « résumé outil ».
- Les données de compatibilité viennent de `mdn/browser-compat-data` (BCD), lu sur la branche `main` sans numéro de commit. Pour Safari iOS, la valeur `"mirror"` signifie « reprend la valeur de Safari bureau » : c'est une **dérivation du jeu de données**, pas un test sur iPhone.
- Aucune version précise d'iOS n'a été testée dans cette étape. iPhone de Sabri : iOS 18.7 au 30/10/2026 (audit `06`, T-09).
- Statuts : confirmé (source primaire lue, énoncé net) ; probable (source primaire, mais ambiguïté, ancienneté ou contradiction) ; hypothèse (déduction) ; non vérifié (source non lue).

## Correction apportée à l'audit
`07` (V5) note que l'article WebKit de 2023 ne contient pas la durée « 7 jours » et conclut de ne pas l'écrire sans source. **Une source existe** : billet WebKit du 24/03/2020 et page MDN, voir fiche I-03. Mais ces sources se contredisent partiellement sur les applis installées. La règle d'audit « ne pas affirmer que iOS efface après 7 jours » reste prudente ; il faut aussi écrire « ne pas affirmer le contraire ».

---

## I-01 · Installation sur l'écran d'accueil et mode autonome (standalone)
- **Question étudiée** : comment une web app s'installe-t-elle sur iPhone et à quelles conditions s'ouvre-t-elle sans barre Safari ?
- **Source primaire** : WebKit, « Web Push for Web Apps on iOS and iPadOS » (Eidson, Simmons) ; WebKit, « News from WWDC25: Web technology coming this fall in Safari 26 beta ».
- **URL exacte** : https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ ; https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/
- **Date de consultation** : 05/11/2026 (billets du 16/02/2023 et du 09/06/2025).
- **Version concernée** : iOS/iPadOS 16.4 (billet 2023) ; iOS 26 (billet 2025, version bêta au moment de l'écriture).
- **Résultat vérifié** : (résumé outil) l'utilisateur ajoute le site via le bouton Partager puis « Sur l'écran d'accueil » ; un site devient web app quand son manifeste a `display` à `standalone` ou `fullscreen` (billet 2023). Depuis iOS 26 : « By default, every website added to the Home Screen opens as a web app », avec un interrupteur « Open as Web App » pour revenir au signet (billet 2025). BCD : `BeforeInstallPromptEvent` absent de Safari (`version_added: false`) : **pas d'invite d'installation automatique**, l'installation est manuelle.
- **Limites et contradictions** : le billet 2025 décrit une bêta ; son état final en iOS 26.x n'est pas relu. La page d'aide Apple (étapes exactes) n'a pas pu être lue (contenu non reçu par l'outil). Sur iOS 26, un utilisateur peut désactiver l'interrupteur et obtenir un simple signet : l'appli s'ouvre alors dans Safari avec ses limites.
- **Impact sur SetMate** : le manifeste reste utile (icônes, `display`). L'appli doit détecter si elle tourne en autonome (`matchMedia('(display-mode: standalone)')`, propriété historique `navigator.standalone` : **non vérifiée** ici) et dire à l'utilisateur comment l'installer, car aucune invite n'existe.
- **Recommandation** : écran d'aide « Installer sur l'iPhone » avec captures (une étape par image) ; afficher l'état « installée / dans Safari » dans le diagnostic.
- **Statut** : confirmé (installation manuelle, manifeste standalone, 16.4) ; probable (comportement par défaut iOS 26 final).

## I-02 · Quotas de stockage (IndexedDB, Cache, localStorage)
- **Question étudiée** : quelle quantité de données une web app peut-elle écrire, navigateur et écran d'accueil ?
- **Source primaire** : WebKit, « Updates to Storage Policy » (Liu, 10/08/2023) ; MDN, « Storage quotas and eviction criteria ».
- **URL exacte** : https://webkit.org/blog/14403/updates-to-storage-policy/ ; https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- **Date de consultation** : 05/11/2026.
- **Version concernée** : Safari 17.0, iOS/iPadOS 17, macOS Sonoma.
- **Résultat vérifié** : (résumé outil) quota d'origine « up to 60% of the total disk space » pour un navigateur, 15 % pour les autres applis, 10 % du quota du cadre principal pour les cadres tiers ; une web app d'écran d'accueil a « the same origin quota and overall quota as when it is opened in a browser app ». Plafond global : 80 % du disque (navigateurs) selon MDN. `navigator.storage.estimate()` : Safari 17 (BCD). Le quota est « une limite supérieure, pas une garantie » et peut varier avec l'usage existant.
- **Limites et contradictions** : web.dev (« Storage for the web », sans date, mise à jour 2024 citée) écrit que Safari « appears to allow about 1GB » avec invites par 200 Mo, et que l'appli installée a un conteneur séparé de Safari. MDN date la limite de 1 Gio aux versions antérieures. **Les deux sont à lire comme versions différentes**, pas comme une contradiction de fait ; la source web.dev est secondaire (auteur dit n'avoir pas trouvé de documentation officielle).
- **Impact sur SetMate** : le quota n'est pas le risque principal (60 % du disque). Le risque est l'éviction (I-03). Les fichiers audio importés sont à garder hors IndexedDB si possible (I-11).
- **Recommandation** : afficher `usage/quota` dans le diagnostic ; ne pas promettre un espace chiffré.
- **Statut** : confirmé (Safari 17+) ; probable pour iOS 18.7 (non recoupé version par version).

## I-03 · Éviction : durée sans usage, applis installées
- **Question étudiée** : dans quels cas iOS supprime-t-il les données d'une web app, et l'installation sur l'écran d'accueil protège-t-elle ?
- **Source primaire** : WebKit, « Full Third-Party Cookie Blocking and More » (Wilander, 24/03/2020) ; WebKit « Updates to Storage Policy » (2023) ; MDN (ci-dessus).
- **URL exacte** : https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/ ; https://webkit.org/blog/14403/updates-to-storage-policy/ ; https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- **Date de consultation** : 05/11/2026.
- **Version concernée** : iOS/iPadOS 13.4, Safari 13.1 (2020) ; Safari 17 (2023).
- **Résultat vérifié** : 2020 (résumé outil) : l'ITP supprime IndexedDB, localStorage, enregistrements de service workers et caches « after seven days of Safari use without user interaction on the site ». Les web apps d'écran d'accueil « have their own counter of days of use » et WebKit écrit : « We do not expect the first-party in such a web application to have its website data deleted », la suppression étant « a serious bug ». 2023 : l'éviction peut survenir au-delà du quota, sous pression de stockage, ou si le site n'a pas eu d'interaction « for some time » ; **aucune durée de 7 jours dans ce billet**, aucune exemption explicite des applis installées. MDN : « Safari proactively evicts data when cross-site tracking prevention is turned on. If an origin has no user interaction [...] in the last seven days of browser use, its data created from script will be deleted ».
- **Limites et contradictions** : (1) 2020 « on ne s'attend pas à une suppression » pour les applis installées ; 2023 décrit une éviction par inactivité sans exemption : les deux textes ne se recoupent pas parfaitement, et l'**exemption ne garantit pas une conservation permanente** (pression de stockage, quota, mise à jour d'OS, action de l'utilisateur restent possibles). (2) Le comportement réel sur iOS 18.7 n'est pas testé. (3) « 7 jours d'utilisation de Safari » compte des jours d'usage du navigateur, pas des jours calendaires (formule de 2020).
- **Impact sur SetMate** : le risque D-01 (éviction) reste réel. Une appli ouverte dans Safari (non installée) est la plus exposée.
- **Recommandation** : sauvegarde JSON régulière rappelée dans l'appli ; test long AC-22 ; message honnête « les données du téléphone peuvent être effacées par iOS ».
- **Statut** : probable (règle 7 jours pour Safari non installé ; exemption des applis installées « attendue » par WebKit, non garantie).

## I-04 · Stockage persistant : `navigator.storage.persist()`
- **Question étudiée** : peut-on demander à iOS de ne pas évincer les données ?
- **Source primaire** : WebKit « Updates to Storage Policy » ; MDN ; BCD `StorageManager`.
- **URL exacte** : https://webkit.org/blog/14403/updates-to-storage-policy/ ; https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/StorageManager.json
- **Date de consultation** : 05/11/2026.
- **Version concernée** : `persist`, `persisted`, `getDirectory` : Safari 15.2 ; `estimate` : Safari 17 (BCD, iOS = « mirror »).
- **Résultat vérifié** : (résumé outil) « WebKit currently grants a request based on heuristics like whether the website is opened as a Home Screen Web App ». MDN : Safari approuve ou refuse « based on the user's history of interaction with the site » sans invite. Les origines persistantes sont exclues de l'éviction sous pression de stockage.
- **Limites et contradictions** : l'heuristique n'est pas publiée ; une réponse « accordé » aujourd'hui n'engage pas pour l'avenir. Le rapport 1.6 note « stockage non garanti » (T-09).
- **Impact sur SetMate** : appeler `persist()` après l'installation et afficher le résultat, sans en faire une garantie.
- **Recommandation** : lire `persisted()` à chaque lancement et alerter si faux ; sauvegarde reste obligatoire.
- **Statut** : confirmé (existence et principe heuristique) ; non testé sur l'iPhone de Sabri.

## I-05 · Fiabilité d'IndexedDB (connexion perdue, ouvertures bloquées)
- **Question étudiée** : IndexedDB sur iOS peut-il échouer en cours d'usage, indépendamment de l'éviction ?
- **Source primaire** : WebKit Bugzilla 273827 ; BCD `IDBFactory`.
- **URL exacte** : https://bugs.webkit.org/show_bug.cgi?id=273827 ; https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/IDBFactory.json
- **Date de consultation** : 05/11/2026.
- **Version concernée** : iOS 17.4 (régression), corrigée en partie en 17.6 / 18 bêta selon un ingénieur WebKit ; récurrence signalée sur iOS 18.0.1 (09/10/2024).
- **Résultat vérifié** : (résumé outil) erreur « UnknownError: Connection to Indexed Database server lost » quand le processus réseau plante ; un ingénieur suggère d'écouter l'événement `close` et d'appeler à nouveau `indexedDB.open` ; un rapporteur répond que la réouverture échoue et que seul un redémarrage de l'appareil règle le problème (20/05/2024). Statut affiché : RESOLVED / CONFIGURATION CHANGED, mais dernier commentaire du **10/10/2025** : « pas résolu, toujours présent ». BCD : `indexedDB.open` « Safari 14, première ouverture peut se bloquer à jamais » (partial) ; correct à partir de 15.
- **Limites et contradictions** : statut « résolu » **contredit** par le dernier commentaire ; ne pas écrire « corrigé ». Les bogues 277615, 201483, 197050 n'ont été vus que par un résultat de recherche : **non vérifié** page par page.
- **Impact sur SetMate** : lien direct avec A-03 (échec d'écriture silencieux) et AC-03. Une perte de connexion est un cas à signaler, pas à ignorer.
- **Recommandation** : gérer `onclose`/`onerror`, réessayer, et afficher « sauvegarde impossible, exporte maintenant » ; tester la reprise.
- **Statut** : probable (existence d'un bogue intermittent) ; fréquence réelle inconnue.

## I-06 · Micro (getUserMedia) dans l'appli installée
- **Question étudiée** : `getUserMedia` fonctionne-t-il dans une web app d'écran d'accueil ?
- **Source primaire** : WebKit Bugzilla 185448 ; BCD `MediaDevices.getUserMedia`.
- **URL exacte** : https://bugs.webkit.org/show_bug.cgi?id=185448 ; https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/MediaDevices.json
- **Date de consultation** : 05/11/2026.
- **Version concernée** : iOS 13.4 (corrigé) ; `MediaDevices.getUserMedia` : Safari 11 (BCD).
- **Résultat vérifié** : (résumé outil) bogue « getUserMedia not working in apps added to home screen that run in standalone mode », RESOLVED FIXED ; confirmé fonctionnel « as of iOS 13.4 beta 1 » (06/02/2020). Remarques de fil : appels multiples en échec sur certains sites (07/2020) ; invites de permission répétées en mode autonome quand le hash change : bogue distinct 215884, **non lu**.
- **Limites et contradictions** : ne pas confondre avec l'entrée BCD de `navigator.getUserMedia` (ancienne API, retirée en Safari 12) : seule `navigator.mediaDevices.getUserMedia` est pertinente. L'état en iOS 18.7 n'est pas testé. Le micro est lié à la dictée du débrief (voir I-13).
- **Impact sur SetMate** : le micro devrait être disponible en installé ; des invites répétées sont un risque d'usage (débrief en soirée).
- **Recommandation** : ne pas modifier l'URL (hash) pendant l'enregistrement ; tester M-10 et M-11.
- **Statut** : confirmé (corrigé en 13.4) ; non testé sur 18.7.

## I-07 · Web Audio : démarrage, formats, mémoire
- **Question étudiée** : quelles contraintes pour `AudioContext`, `decodeAudioData`, `OfflineAudioContext` sur iOS ?
- **Source primaire** : BCD `AudioContext`, `OfflineAudioContext` ; MDN `decodeAudioData`.
- **URL exacte** : https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/AudioContext.json ; https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/OfflineAudioContext.json ; https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData
- **Date de consultation** : 05/11/2026.
- **Version concernée** : `AudioContext` et `OfflineAudioContext` sans préfixe depuis Safari 14.1 ; iOS = « mirror ».
- **Résultat vérifié** : BCD note : « New audio contexts are suspended until the `resume()` method is called via user action ». MDN : `decodeAudioData` « only works on complete file data, not fragments » ; **la liste des formats décodables n'est pas donnée** par la page lue.
- **Limites et contradictions** : formats (MP3, M4A, FLAC, AIFF, WAV), limites mémoire de page iOS, `OfflineAudioContext` dans un Worker, durée de décodage d'un fichier de 50 Mo : **non vérifié** (requêtes R-iOS-03, R-iOS-04). Le billet WebKit 16.4 note : « Fixed only requiring a transient user activation for Web Audio rendering ».
- **Impact sur SetMate** : l'analyse (A-14, AC-11) ne peut pas être déclarée sûre sur iPhone ; la page doit gérer un contexte suspendu.
- **Recommandation** : appeler `resume()` dans le geste utilisateur ; tester 3/10/50/120 Mo (M-20) ; limiter taille et formats tant que non prouvé.
- **Statut** : confirmé (suspension avant geste) ; non vérifié (formats et mémoire).

## I-08 · Lecture écran verrouillé et arrière-plan
- **Question étudiée** : l'audio d'une web app installée continue-t-il écran verrouillé ou appli en arrière-plan ?
- **Source primaire** : WebKit Bugzilla 198277 et 232909 ; MDN Media Session ; BCD `MediaSession`.
- **URL exacte** : https://bugs.webkit.org/show_bug.cgi?id=198277 ; https://bugs.webkit.org/show_bug.cgi?id=232909 ; https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API ; https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/MediaSession.json
- **Date de consultation** : 05/11/2026.
- **Version concernée** : iOS 15.4 (correctif cité dans les commentaires) ; Media Session : Safari 15 (BCD).
- **Résultat vérifié** : 198277 « Audio stops playing when standalone web app is no longer in foreground » : RESOLVED, DUPLICATE ; commentaire d'un développeur WebKit (Noble) : le Web Audio est traité comme audio « Ambient » que le système coupe hors premier plan ; commentaires de 2022 : « fixed » en iOS 15.4 (Sneddon : « not 15.4.1 »). 232909 : « [iOS] Adopt -[AVAudioSession setAuditTokensForProcessAssertion:] », RESOLVED FIXED (commits nov. 2021). MDN : l'API Media Session permet métadonnées et commandes sur écran verrouillé ; MDN la dit « not Baseline ».
- **Limites et contradictions** : **les deux pages se désignent mutuellement comme doublon** (198277 → 232909 selon le résumé de la première ; 232909 → 198277 selon le résumé de la seconde) : non résolu, à relire à la main. « Corrigé en 15.4 » vient de commentaires, pas d'une note de version Apple : statut probable. Rien ne dit que `<audio>` et Web Audio se comportent pareil ; aucune source lue sur le **verrouillage de l'écran** à proprement parler, ni sur l'enchaînement de morceaux.
- **Impact sur SetMate** : AC-07 reste NON PROUVÉ. L'audit retient « écran verrouillé non prouvé » : cohérent.
- **Recommandation** : exécuter `startLockTest` 60 min sur 18.7 (M-13) ; en cas d'échec, message honnête « la lecture s'arrête écran verrouillé ». Ne rien promettre avant le test.
- **Statut** : probable (correctif 15.4) ; non testé pour 1.9.1.

## I-09 · Interruptions audio (appel, Siri, autre appli)
- **Question étudiée** : que devient l'`AudioContext` lors d'un appel, de Siri ou d'une autre appli audio, et peut-on reprendre ?
- **Source primaire** : WebKit Bugzilla 273511 ; BCD `AudioSession`.
- **URL exacte** : https://bugs.webkit.org/show_bug.cgi?id=273511 ; https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/AudioSession.json
- **Date de consultation** : 05/11/2026.
- **Version concernée** : iOS 17 / Safari 17 (rapport 30/04/2024) ; `navigator.audioSession` et `AudioSession.type` : Safari 16.4 ; `AudioSession.state` : non pris en charge (BCD).
- **Résultat vérifié** : bogue « AudioContext stuck on Interrupted », statut **NEW**, non assigné, dernière modification 08/05/2024 : le contexte reste en état « interrupted » sans reprise via `resume()` (rapporteur). Un ingénieur demande un cas de test. Le billet 16.4 annonce « a subset of the AudioSession Web API ».
- **Limites et contradictions** : un seul rapport non confirmé par WebKit ; le cas décrit n'est pas forcément un appel réel. Le comportement exact après appel, Siri et autre appli n'est **pas documenté officiellement** (résultats de recherche : rapports d'utilisateurs, non lus). L'état `interrupted` n'est pas dans les types TypeScript classiques (résultat de recherche, non lu).
- **Impact sur SetMate** : après une interruption, prévoir un état « audio interrompu, touche pour reprendre » et recréer le contexte si `resume()` échoue.
- **Recommandation** : écouter `statechange`, journaliser dans l'EVT ; tester M-15 à M-17.
- **Statut** : hypothèse (comportement) ; probable (existence du risque).

## I-10 · Service workers et hors ligne
- **Question étudiée** : le service worker est-il pris en charge et suffit-il pour un démarrage sans réseau ?
- **Source primaire** : BCD `ServiceWorkerContainer`, `Navigator.serviceWorker` ; WebKit 2020 (I-03).
- **URL exacte** : https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/ServiceWorkerContainer.json ; https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/Navigator.json
- **Date de consultation** : 05/11/2026.
- **Version concernée** : Safari 11.1 (iOS = « mirror »). `messageerror` jamais déclenché (BCD, partiel).
- **Résultat vérifié** : support du service worker depuis 11.1. Les enregistrements et caches sont dans la liste des stockages concernés par la règle des 7 jours (WebKit 2020, I-03).
- **Limites et contradictions** : les tests Playwright bloquent le service worker (T-02, `serviceWorkers: "block"`) : le **hors ligne n'est prouvé nulle part**. Le comportement de mise à jour du service worker sur iOS n'a pas été lu.
- **Impact sur SetMate** : AC-10 NON PROUVÉ ; un cache évincé = démarrage sans réseau impossible.
- **Recommandation** : test M-18/M-19 ; afficher la version en cache dans le diagnostic.
- **Statut** : confirmé (support) ; non vérifié (fiabilité hors ligne).

## I-11 · Fichiers : File System Access absent, alternatives
- **Question étudiée** : SetMate peut-il lire/écrire des fichiers et dossiers sur Safari iOS comme sur Chrome bureau ?
- **Source primaire** : BCD `Window.showOpenFilePicker` / `showSaveFilePicker` / `showDirectoryPicker` ; BCD `StorageManager.getDirectory` ; MDN File System API ; WebKit Safari 26 ; BCD `Navigator.share`, `canShare`.
- **URL exacte** : https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/Window.json ; https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/StorageManager.json ; https://developer.mozilla.org/en-US/docs/Web/API/File_System_API ; https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/
- **Date de consultation** : 05/11/2026.
- **Version concernée** : Safari/iOS jusqu'à 26 (bêta).
- **Résultat vérifié** : les trois sélecteurs de fichiers/dossiers : `safari: {version_added: false}`, `safari_ios: "mirror"` : **absents**. OPFS (`navigator.storage.getDirectory`) : Safari 15.2. `navigator.share` : 12.1 ; `canShare` : 14. Le billet Safari 26 cite « File System WritableStream API » (écriture directe « within the user's file system »).
- **Limites et contradictions** : l'énoncé du billet 26 est ambigu : il vise probablement l'écriture dans l'OPFS (privé à l'origine), pas un accès aux dossiers de l'utilisateur ; **hypothèse**, à confirmer. MDN indique que le support de Safari « n'est pas dans le contenu lu » : seule la donnée BCD fait foi, résumée. L'ouverture d'un fichier via `<input type="file">` et l'accès à « Fichiers » ne sont pas documentés dans cette étape : non vérifié (R-iOS-05).
- **Impact sur SetMate** : l'écriture d'un dossier (`.crate`, clé USB) est impossible sur iPhone ; seul l'export en téléchargement/partage reste. Cela renforce la garde « aucune écriture de base » (L-001) et le chemin de secours M3U/partage. Sur Safari Mac (L-022) la même absence est la cause probable du `.crate` renommé : à confirmer.
- **Recommandation** : détecter `showDirectoryPicker` et basculer sur téléchargement/partage ; ne jamais annoncer une écriture de dossier sur iPhone.
- **Statut** : confirmé (absence des sélecteurs, selon BCD) ; hypothèse (sens du billet Safari 26).

## I-12 · Écran allumé (Screen Wake Lock)
- **Question étudiée** : peut-on garder l'écran allumé en mode soirée dans l'appli installée ?
- **Source primaire** : WebKit Bugzilla 254545 ; BCD `WakeLock`.
- **URL exacte** : https://bugs.webkit.org/show_bug.cgi?id=254545 ; https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/WakeLock.json
- **Date de consultation** : 05/11/2026.
- **Version concernée** : Safari/iOS 16.4 à 18.3 : ne marche pas dans les web apps d'écran d'accueil ; iOS/iPadOS 18.4 : marche.
- **Résultat vérifié** : commentaire du 31/03/2025 (Simmons) : « The Screen Wake Lock API now works in Home Screen Web Apps on iOS and iPadOS 18.4 ». BCD : `version_added: 18.4`, entrée partielle 16.4 à 18.4 « Does not work in standalone Home Screen Web Apps ». Une régression signalée sur iOS 26.1 (04/12/2025) a été retirée par son auteur (bibliothèque de détection du navigateur).
- **Limites et contradictions** : le bogue a été rouvert et refermé plusieurs fois. Le wake lock se libère quand la page est masquée : il ne sert pas à l'audio écran verrouillé. L'iPhone de Sabri (18.7) est au-dessus de 18.4.
- **Impact sur SetMate** : le futur « mode soirée » (AC-09, F-088) est techniquement possible sur 18.4+, à tester.
- **Recommandation** : demander le verrou au geste ; ré-acquérir après `visibilitychange` ; afficher si refusé.
- **Statut** : confirmé (18.4+ selon bogue et BCD) ; non testé sur l'iPhone.

## I-13 · Reconnaissance vocale (dictée du débrief)
- **Question étudiée** : `SpeechRecognition` est-il utilisable dans l'appli installée ?
- **Source primaire** : BCD `SpeechRecognition` ; bogues WebKit 225298 et forum Apple 748048 cités par l'audit (non lus ici).
- **URL exacte** : https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/SpeechRecognition.json
- **Date de consultation** : 05/11/2026.
- **Version concernée** : Safari 14.1, préfixe `webkit` (BCD, iOS = « mirror »).
- **Résultat vérifié** : l'interface existe avec préfixe depuis 14.1.
- **Limites et contradictions** : le rapport 1.6 observe la dictée « souvent indisponible » dans l'appli installée (T-09) ; aucune page lue ici n'explique pourquoi. Existence de l'interface ≠ disponibilité en installé.
- **Impact sur SetMate** : le code `srOK()` qui la désactive est prudent.
- **Recommandation** : garder la dictée du clavier iOS comme repli ; tester M-24.
- **Statut** : confirmé (interface préfixée) ; non vérifié (disponibilité réelle).

## I-14 · Performance sur iPhone
- **Question étudiée** : l'analyse et l'interface tiennent-elles sur un iPhone (mémoire, fil principal) ?
- **Source primaire** : aucune lue.
- **URL exacte** : aucune.
- **Date de consultation** : 05/11/2026.
- **Version concernée** : sans objet.
- **Résultat vérifié** : rien de documenté. Mesures du projet : sur ordinateur, 3,7 s de blocage en 18 s, analyse = 560 ms sur le fil principal (T-07). Sur iPhone : déduit, jamais mesuré.
- **Limites et contradictions** : aucune.
- **Impact sur SetMate** : AC-11 et les blocages (E-008) restent à mesurer.
- **Recommandation** : mesurer sur l'appareil (M-25) ; Web Worker à étudier pour l'analyse (hypothèse).
- **Statut** : non vérifié.

---

## Synthèse des statuts
| Statut | Fiches |
|---|---|
| Confirmé | I-01 (partiel), I-02, I-04, I-06, I-10 (support), I-11 (absence), I-12, I-13 (interface) |
| Probable | I-03, I-05, I-08 |
| Hypothèse | I-09 |
| Non vérifié | I-14 ; formats et mémoire d'I-07 ; fiabilité hors ligne d'I-10 |

Note : plusieurs fiches ont des volets de statuts différents ; le statut dominant est indiqué dans chaque fiche. « Confirmé » signifie « énoncé net dans une source primaire lue par résumé », jamais « vérifié sur iPhone ».
