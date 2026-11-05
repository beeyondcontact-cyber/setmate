# 03 · Sécurité : vulnérabilités corrigées et risques résiduels (SetMate 1.9.2-p0)

Établi le 05/11/2026. Ce document ne déclare pas SetMate « stable » ni « prêt pour la production » : il dit ce qui a été corrigé, avec quelle preuve, et ce qui reste.

Statuts : CORRIGÉ ET TESTÉ / IMPLÉMENTÉ NON VALIDÉ / BLOQUÉ / À TESTER SUR APPAREIL / NON COMMENCÉ.

## 1. Vulnérabilités corrigées

| ID | Vulnérabilité | Statut | Preuve |
|---|---|---|---|
| A-05 | `embedAM` plaçait `m.url` (réponse iTunes, gardée dans `S.am` et donc dans les sauvegardes) dans `onclick="location.assign('…')"`. Une URL contenant `');…;('` exécutait du code. | CORRIGÉ ET TESTÉ | `p0_injection.spec.js` : reproduction (échec avant, réussite après), lien légitime toujours ouvert tel quel |
| nouvelle | `openAM` ouvrait `m.url` sans contrôle (`javascript:` possible depuis le cache). | CORRIGÉ ET TESTÉ | test `openAM` |
| nouvelle | Iframe Apple : `m.coll` et `m.id` insérés sans contrôle dans l'attribut `src`. | CORRIGÉ ET TESTÉ | test « ids malformés » |
| nouvelle | Clés du cache d'apprentissage `S.P` : `forget('P','${k}')` recevait la clé telle quelle, et l'affichage ne vérifiait que les deux premiers nombres de `a>b>…`. Une clé `1>2>');…;('` injectait du code via une sauvegarde piégée. | CORRIGÉ ET TESTÉ | test « clés d'apprentissage piégées » (clic réel) + refus à la restauration |
| nouvelle | Identifiants-chaînes dans des `onclick` sans échappement JS : identifiant de playlist, de fichier du téléphone, lien d'écran d'une notification. | CORRIGÉ ET TESTÉ | tests de clic avec valeurs piégées ; `jsq` renforcé |
| nouvelle | Identifiants Deezer (`id`, `artist.id`) insérés tels quels dans `playDz(${x.dz})` etc. : une réponse Deezer piégée ou une sauvegarde piégée pouvait injecter du code. | CORRIGÉ ET TESTÉ | test « réponse Deezer piégée » ; refus à la restauration |
| nouvelle | Injection CSS par l'URL de pochette (`url(${esc(cover)})`). | CORRIGÉ ET TESTÉ | test `cover()` |
| nouvelle | Valeurs brutes dans des attributs ou du texte HTML : date de soirée (attribut `value`), année, tonalité, position de tendance. | CORRIGÉ ET TESTÉ | test « soirée à date piégée » ; refus à la restauration |
| nouvelle | `go()` plantait l'affichage sur un écran inconnu. | CORRIGÉ ET TESTÉ | test des liens de notification |
| nouvelle | `jsq` ne protégeait pas des retours à la ligne et des séparateurs Unicode (un titre avec saut de ligne cassait le bouton). | CORRIGÉ ET TESTÉ | test `jsq` (6 chaînes hostiles) |
| A-04 | Restauration sans validation (voir `01`). | CORRIGÉ ET TESTÉ | `p0_restauration.spec.js` |

« Enlever les apostrophes » n'a pas été utilisé : les URL ne sont plus jamais mises dans du code, et les identifiants sont soit des entiers contrôlés à la source, soit passés par `jsq`.

## 2. Audit des gestionnaires onclick

Méthode (reproductible : `node tests/audit_html_dynamique.js`) : analyse syntaxique du script, liste de tous les gabarits qui produisent du HTML et de chaque `${expression}` insérée, classement automatique (SÛR : `esc`, `jsq`, `svg`, `pl`, `Math.round`, nombres, littéraux, constructeurs HTML internes ; sinon À REVOIR), puis relecture manuelle des expressions placées dans un attribut `on*`.

Chiffres (source `index.html`, comptage par expressions régulières) :
- 294 occurrences de `onclick=` ; 182 sans donnée insérée (statiques, sans risque d'injection) ; 104 avec au moins une `${…}` ; 1 écrit entre apostrophes (`otherIdeas`) ; le reste n'est pas capturé par l'expression (guillemets imbriqués). Autres `on*` : `onchange`, `oninput`, `onsubmit`, `onmouseenter`, `onmousedown`, `onfocus` (305 attributs `on*` au total selon l'outil).
- Autres puits : 33 affectations `innerHTML=`, 1 `insertAdjacentHTML`, 1 balise `<script>` dynamique (JSONP), 1 `location.assign` (désormais via `openExternal`). Pas de `eval`, de `document.write`, de `outerHTML` ni de `srcdoc`.
- 964 expressions insérées dans du HTML : 626 classées sûres automatiquement ; 338 à revoir dont 16 dans un `on*`.

Classement des 16 expressions encore listées comme « à revoir » dans un `on*` (après correctifs) :

| Risque | Expressions | Pourquoi | Décision |
|---|---|---|---|
| Faible | `x.dz`, `c.dz` (8 occurrences) | Identifiants Deezer : entiers imposés à la source (`dzItem`), refusés non entiers à la restauration, `playDz` refuse un identifiant incorrect | Corrigé à la source, garde conservée |
| Faible | `t.n`, `c.n`, `i`, `lim+200` | Compteurs internes ; numéros de sons vérifiés entiers à la restauration | Non modifié |
| Très faible | `key` (roue des tonalités), `k` des onglets et styles | Constantes du code (`ALLKEYS`, listes fixes), aucune donnée externe | Non modifié |
| Faible | `PL.u==="f"+o.fid` / `ownPlay(i)` | `fid` généré par l'appli, vérifié à la restauration, `jsq` ailleurs | Non modifié |
| Corrigé | `p.id`, `o.fid`, `n.go`, `kind`, clés `L` et `P`, `m.url` | Chaînes de données | Passées par `jsq` ou retirées du code |

Gestionnaire à guillemets simples `otherIdeas(${JSON.stringify(...).replace(/'/g,"&#39;")})` : la valeur est un littéral JSON (les guillemets doubles et antislash sont échappés par `JSON.stringify`), donc un titre ne peut pas sortir de la chaîne. Risque faible, non modifié.

**Ce qui n'a pas été fait** : réécrire les 104 gestionnaires à données en `addEventListener` (délégation avec `data-*`). Statut : NON COMMENCÉ. Raison : gros volume, risque de casser l'interface sans appareil de test, et les entrées externes qui y arrivent sont maintenant contrôlées. À planifier avec un test visuel par écran.

## 3. Risques résiduels (hors JSONP)

1. **Données déjà stockées non revalidées au démarrage** : `load()` fait confiance à IndexedDB. Si une donnée piégée y est entrée avant ce correctif (par une ancienne restauration), elle est affichée comme avant. Les sinks critiques sont durcis (jsq, échappements, `safeUrl`), mais pas tous les champs. Statut : NON COMMENCÉ (revalidation au démarrage).
2. **`toast()` et `modal()` utilisent `innerHTML`** et font confiance à l'appelant pour échapper. Les appels revus échappent leurs données, mais rien ne l'impose mécaniquement. 338 expressions « à revoir » n'ont pas toutes été relues une par une : elles sont en majorité des constructeurs HTML internes et des constantes, mais ce n'est pas prouvé exhaustivement.
3. **Pas de Content-Security-Policy** (A-08 non traité). Les 294 `onclick` obligent à autoriser `'unsafe-inline'` pour les scripts : une CSP apporterait peu tant qu'ils existent.
4. **Textes issus de fichiers** (listes M3U, CSV, TXT, Apple, Spotify, tags audio) : affichés via `esc()` dans les écrans relus (aperçu d'import, lignes non reconnues). Non audités exhaustivement.
5. **Iframe Apple** : `sandbox` avec `allow-scripts allow-same-origin` ; acceptable parce que l'origine `embed.music.apple.com` est distincte de l'appli, mais à ne pas élargir.
6. **Liste blanche de domaines** : un domaine légitime non prévu (pochette d'un autre CDN, par exemple) sera refusé et la pochette n'apparaîtra pas, sans plantage. À vérifier sur de vraies données Deezer. Statut : À TESTER SUR APPAREIL.
7. **Fausse alerte possible à la restauration** : une sauvegarde réelle contenant un champ inattendu (par exemple une tonalité non normalisée) serait refusée avec un message. Statut : à essayer avec la vraie sauvegarde de Sabri.

## 4. JSONP Deezer (risque documenté séparément)

**Situation** : `jsonp()` ajoute une balise `<script src="https://api.deezer.com/…&output=jsonp&callback=dzXXXX">` dans la page (24 appels dans le code). La réponse est du JavaScript exécuté **avec tous les droits de l'appli** : lecture d'IndexedDB (bibliothèque, playlists, soirées, fichiers du téléphone), modification de l'interface, appel de toute fonction globale.

**Risque** : si Deezer, un intermédiaire réseau capable de rompre TLS, ou un domaine détourné renvoie du code, il s'exécute chez l'utilisateur. Probabilité faible, gravité haute. Aucune exploitation connue. Le risque de conformité (R-23, changement de règles de Deezer) existe aussi.

**Atténuations déjà en place après cette série** (IMPLÉMENTÉ ET TESTÉ) :
- adresse limitée à `https://api.deezer.com` (hôte exact, port 443, sans identifiants, sans caractères d'échappement) : un identifiant ou une chaîne piégée ne peut plus rediriger la balise vers un autre domaine ; testé avec `evil.example`, `http://`, `javascript:`, `api.deezer.com.evil.example` ;
- nom de rappel aléatoire, supprimé après usage ; délai maximal ; `referrerPolicy="no-referrer"`.

**Ce qui reste** : le code renvoyé par Deezer lui-même s'exécute toujours dans l'origine de l'appli. Aucun contrôle côté appli ne peut l'empêcher tant que JSONP est utilisé. Statut : **NON COMMENCÉ**.

**Pistes, du plus simple au plus lourd (propositions, pas des décisions)** :
1. Isoler le JSONP dans une iframe `sandbox="allow-scripts"` sans `allow-same-origin` (origine opaque) : le script distant s'y exécute sans accès à IndexedDB ni à la page, et renvoie le JSON par `postMessage`. Pas de serveur à payer, modification locale de `jsonp()`, à tester sur Safari/iPhone (comportement des iframes `srcdoc` en mode installé). Coût estimé : un chantier moyen, à mesurer.
2. Passer par un petit relais à Sabri (fonction serveur qui renvoie du JSON) : supprime le script distant, mais ajoute un hébergement, une maintenance et un point de défaillance. Aucun achat n'est proposé ici.
3. Vérifier si l'API Deezer accepte aujourd'hui `fetch` avec CORS : non vérifié lors de ce travail (réseau coupé dans les tests) ; l'audit précédent indiquait que JSONP était la seule voie.

Tant qu'aucune de ces pistes n'est faite, le texte de confidentialité et le contrôle de version avant publication doivent rester prudents sur la sécurité de la découverte Deezer.
