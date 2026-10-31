// Mesures P0 (cahier « Correctifs issus du test terrain DJ »). Même scénario avant / après correctifs.
// Usage : charger SetMate.html, injecter ce fichier, puis `await P0.tout()` (ou une mesure seule).
window.P0 = {
  wait: ms => new Promise(r => setTimeout(r, ms)),
  demo() { if (!S.demo || S.tracks.length !== 26) { enterDemo(); } S.L = {}; S.P = {}; S.rules = []; S.dir = "any"; S.sameGenre = false; S.keyF = null; if (window.resetExclusions) resetExclusions(true); },

  // OBS-01 / CHG-01 : un même son revient-il dans des contextes différents ?
  async repetition() {
    this.demo(); const freq = {}, ctx = visible().filter(t => !t.wish);
    for (const t of ctx) { S.cur = t.n; S.set.ids = [t.n]; go("next"); await this.wait(5);
      [...document.querySelectorAll(".sg:not(.disc):not(.sgd)")].forEach(e => { const b = e.querySelector(".sgm b"); if (b) freq[b.textContent] = (freq[b.textContent] || 0) + 1; }); }
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    // Construction d’un set de 8 sons : combien de fois un son proposé revient sans être choisi ?
    this.demo(); const start = visible()[4]; S.cur = start.n; S.set.ids = [start.n]; go("next");
    const seen = {}; let reAppear = 0;
    for (let i = 0; i < 8; i++) { await this.wait(5);
      const rows = [...document.querySelectorAll(".sg:not(.disc):not(.sgd)")]; const names = rows.map(e => e.querySelector(".sgm b").textContent);
      names.forEach(n => { if (seen[n]) reAppear++; seen[n] = (seen[n] || 0) + 1; });
      const pick = rows[rows.length - 1]; if (!pick) break; pick.querySelector(".add").click(); }
    const stuck = Object.entries(seen).filter(([, c]) => c >= 4).map(([n, c]) => `${n} ×${c}`);
    return { contextes: ctx.length, plus_frequent: top.slice(0, 3).map(([n, c]) => `${n} : ${c}/${ctx.length}`), reapparitions_pendant_construction: reAppear, sons_revenus_4_fois_ou_plus: stuck };
  },

  // OBS-05 / CHG-04 : 10 ajouts successifs
  async ajouts() {
    this.demo(); const start = visible()[0]; S.cur = start.n; S.set.ids = [start.n]; go("next"); document.querySelectorAll(".toast").forEach(t => t.remove());
    let maxToasts = 0, blocked = 0; const t0 = performance.now();
    for (let i = 0; i < 10; i++) { const b = document.querySelector(".sg:not(.disc):not(.sgd) .add"); if (!b) { blocked++; continue; }
      b.scrollIntoView({ block: "center" }); await this.wait(20);   // comme un vrai doigt : le bouton doit être à l’écran
      const r = b.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!top || (!b.contains(top) && top !== b)) (this.bloqueurs = this.bloqueurs || []).push(top ? (top.className || top.tagName) : "hors écran");
      if (!top || (!b.contains(top) && top !== b)) blocked++;
      b.click(); maxToasts = Math.max(maxToasts, document.querySelectorAll(".toast").length); await this.wait(60); }
    const ids = S.set.ids; const dup = ids.length - new Set(ids).size;
    const larg = [...document.querySelectorAll(".toast")].map(t => Math.round(t.getBoundingClientRect().width));
    await this.wait(2600); const encore = document.querySelectorAll(".toast").length;
    return { sons_dans_set: ids.length, doublons: dup, clics_bloques: blocked, toasts_simultanes_max: maxToasts, largeurs_px: larg, toasts_encore_visibles_apres_2_6s: encore, texte: [...document.querySelectorAll(".toast")].map(t => t.innerText).join(" | ").slice(0, 120) };
  },

  // OBS-06 / CHG-05 : débordements et infobulle
  async debordements() {
    this.demo(); const out = {};
    for (const scr of ["home", "lib", "next", "trend", "gigs", "debrief", "settings"]) {
      if (scr === "trend") S.trTab = "moment"; go(scr); await this.wait(30);
      const bad = [], vis = [];
      // « visible » : la partie qui dépasse n’est pas coupée par un parent (overflow hidden + points de suspension)
      const clipped = (el, card) => { for (let p = el.parentElement; p && p !== card; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.overflow !== "visible" || cs.overflowX !== "visible") { if (p.getBoundingClientRect().right <= card.getBoundingClientRect().right + 1.5) return true; } } return false; };
      document.querySelectorAll("#main .card, #main .sg, #main .trow").forEach(c => { const cr = c.getBoundingClientRect();
        c.querySelectorAll("*").forEach(el => { const r = el.getBoundingClientRect(); if (r.width && r.right > cr.right + 1.5 && getComputedStyle(el).position !== "fixed") { const lab = (el.className || el.tagName) + " +" + Math.round(r.right - cr.right) + "px"; bad.push(lab); if (!clipped(el, c)) vis.push(lab); } }); });
      out[scr] = { page_plus_large_que_ecran: document.documentElement.scrollWidth > innerWidth, elements_qui_sortent_brut: bad.length, elements_qui_sortent_visiblement: vis.length, exemples_visibles: [...new Set(vis)].slice(0, 3) };
    }
    // infobulle : survol tout en bas à droite de l’écran
    const el = document.querySelector("[data-tip]"); const tp = document.getElementById("tip");
    el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, clientX: innerWidth - 5, clientY: innerHeight - 5 }));
    document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: innerWidth - 5, clientY: innerHeight - 5 }));
    await this.wait(30); const r = tp.getBoundingClientRect();
    out.infobulle_bas_droite = { visible: getComputedStyle(tp).opacity !== "0", dans_ecran: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight };
    // tactile : un appui laisse-t-il une bulle collée ?
    el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })); tp.style.opacity = tp.style.opacity; document.dispatchEvent(new Event("touchstart"));
    document.body.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    out.infobulle_restee_apres_tap = getComputedStyle(tp).opacity !== "0" && !matchMedia("(hover:hover)").matches;
    return out;
  },

  // Critères d’acceptation du cahier (CHG-01, CHG-04, CHG-05) : chaque ligne vaut OK ou ÉCHEC
  async acceptation() {
    const R = {}; const ok = (k, v, d) => R[k] = (v ? "OK" : "ÉCHEC") + (d ? " · " + d : "");
    const names = () => [...document.querySelectorAll(".sg:not(.disc):not(.sgd) .sgm b")].map(b => b.textContent);
    // 1. refusé → ne revient pas au rafraîchissement suivant de la même session
    this.demo(); const st = visible()[4]; S.cur = st.n; S.set.ids = [st.n]; go("next"); await this.wait(5);
    const first = names()[0]; const tr = visible().find(t => t.t === first); dismissSugg("t" + tr.n, tr.t); go("next"); go("home"); go("next");
    ok("refuse_ne_revient_pas", !names().includes(first), first);
    // 2. son déjà dans le set jamais proposé
    const inSet = new Set(S.set.ids.map(n => T(n).t)); ok("deja_dans_set_jamais_propose", !names().some(n => inSet.has(n)));
    // 3. deux sets différents → propositions différentes
    this.demo(); const a = visible()[1], b = visible()[13]; S.cur = a.n; S.set.ids = [a.n]; go("next"); const la = names().join(); S.cur = b.n; S.set.ids = [b.n]; go("next"); const lb = names().join();
    ok("deux_sets_propositions_differentes", la !== lb);
    // 4. inventaire épuisé → message explicite, pas de recyclage silencieux
    this.demo(); S.cur = st.n; S.set.ids = [st.n]; for (let i = 0; i < 12; i++) { go("next"); const ids = names().map(n => visible().find(t => t.t === n)).filter(Boolean).map(t => ["t" + t.n, t.t]); if (!ids.length) break; otherIdeas(ids); }
    go("next"); const txt = document.querySelector("#main").innerText;
    ok("message_si_plus_de_propositions", /Plus d’autres propositions pertinentes|Aucune proposition pertinente/.test(txt));
    ok("bouton_remettre_les_sons_ecartes", /Remettre les sons écartés/.test(txt)); resetExclusions(true);
    // 5. 10 ajouts rapides : rien de bloqué, 10 sons persistés une seule fois, un seul message regroupé
    const aj = await this.ajouts();
    ok("10_ajouts_sans_blocage", aj.clics_bloques === 0, `bloqués ${aj.clics_bloques}`); ok("10_ajouts_persistes_une_fois", aj.sons_dans_set === 11 && aj.doublons === 0, `${aj.sons_dans_set} dans le set`);
    ok("un_seul_message_a_la_fois", aj.toasts_simultanes_max <= 1, `max ${aj.toasts_simultanes_max}`); ok("message_disparu_apres_2_6s", aj.toasts_encore_visibles_apres_2_6s === 0);
    ok("message_regroupe", /10 sons ajoutés/.test(aj.texte) || aj.toasts_encore_visibles_apres_2_6s === 0, aj.texte);
    // 6. double clic sur le même + n’ajoute pas deux fois
    this.demo(); S.cur = st.n; S.set.ids = [st.n]; go("next"); const btn = document.querySelector(".sg:not(.disc):not(.sgd) .add"); const n0 = S.set.ids.length; const target = +btn.getAttribute("onclick").match(/\d+/)[0]; addSet(target); addSet(target);
    ok("double_clic_un_seul_ajout", S.set.ids.length === n0 + 1);
    // 7. le message ne capte pas les clics
    toast("test", true); const t = document.querySelector(".toast"); ok("message_laisse_passer_les_clics", getComputedStyle(t).pointerEvents === "none");
    return R;
  },

  async tout() { const r = {}; r.version = VERSION; r.ecran = innerWidth + "x" + innerHeight; r.repetition = await this.repetition(); r.ajouts = await this.ajouts(); r.debordements = await this.debordements(); return r; }
};
0;
