/*
 * Toestemming voor Google Analytics.
 *
 * Analytics plaatst cookies die niet strikt nodig zijn, dus het laadt pas nadat de
 * bezoeker op "Accepteren" klikt. Zonder keuze of na "Weigeren" gaat er niets naar
 * Google Analytics. Weigeren is even makkelijk als accepteren, en elk element met
 * data-cookie-settings opent de keuze opnieuw.
 *
 * Geeft ook de seintjes van de Rumo-widget (rumo:booking) door aan Analytics, zodat
 * voltooide boekingen per kanaal zichtbaar zijn. Die seintjes bevatten geen
 * persoonsgegevens: bij "booked" alleen bedrag, munt en aantal kamers.
 */
(function () {
  var GA_ID = 'G-DN7D5CR7BF';
  var KEY = 'carlton_analytics_consent';
  var GELDIG_MS = 182 * 24 * 60 * 60 * 1000; // daarna vragen we opnieuw: 6 maanden

  var TEKST = {
    nl: {
      vraag: 'Bezoeken meten met cookies van Google Analytics?',
      extra: 'Geen reclame.',
      ja: 'Accepteren', nee: 'Weigeren', meer: 'Meer info', instellingen: 'Cookie-instellingen', label: 'Toestemming voor cookies',
    },
    en: {
      vraag: 'Measure visits with Google Analytics cookies?',
      extra: 'No advertising.',
      ja: 'Accept', nee: 'Decline', meer: 'More info', instellingen: 'Cookie settings', label: 'Cookie consent',
    },
    fr: {
      vraag: 'Mesurer les visites avec les cookies Google Analytics ?',
      extra: 'Pas de publicité.',
      ja: 'Accepter', nee: 'Refuser', meer: 'Infos', instellingen: 'Paramètres des cookies', label: 'Consentement aux cookies',
    },
    de: {
      vraag: 'Besuche mit Cookies von Google Analytics messen?',
      extra: 'Keine Werbung.',
      ja: 'Akzeptieren', nee: 'Ablehnen', meer: 'Mehr', instellingen: 'Cookie-Einstellungen', label: 'Einwilligung in Cookies',
    },
  };
  var BELEID = { nl: '/nl/voorwaarden.html', en: '/en/terms.html', fr: '/fr/conditions.html', de: '/de/bedingungen.html' };

  function taal() {
    var pad = location.pathname.match(/^\/(?:guest\/)?(nl|en|fr|de)(?:\/|$)/);
    if (pad) return pad[1];
    var codes = [document.documentElement.lang, navigator.language];
    for (var i = 0; i < codes.length; i++) {
      var code = String(codes[i] || '').slice(0, 2).toLowerCase();
      if (TEKST[code]) return code;
    }
    return 'en';
  }
  var t = TEKST[taal()];

  function leesKeuze() {
    try {
      var keuze = JSON.parse(localStorage.getItem(KEY));
      if (keuze && (keuze.keuze === 'ja' || keuze.keuze === 'nee') && Date.now() - keuze.op < GELDIG_MS) return keuze.keuze;
    } catch (e) { /* geen opslag of oude inhoud: dan vragen we gewoon */ }
    return null;
  }
  function bewaarKeuze(keuze) {
    try { localStorage.setItem(KEY, JSON.stringify({ keuze: keuze, op: Date.now() })); } catch (e) { /* de keuze geldt dan voor deze pagina */ }
  }

  var geladen = false;
  function gtag() { window.dataLayer.push(arguments); }
  function laadAnalytics() {
    window['ga-disable-' + GA_ID] = false;
    if (geladen) return;
    geladen = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = gtag;
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('js', new Date());
    gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  function stopAnalytics() {
    window['ga-disable-' + GA_ID] = true;
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var naam = c.split('=')[0].trim();
      if (naam.indexOf('_ga') !== 0) return;
      ['', '; domain=' + host, '; domain=.' + host, '; domain=' + location.hostname].forEach(function (d) {
        document.cookie = naam + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
      });
    });
  }

  var balk = null;
  function sluitBalk() { if (balk) { balk.remove(); balk = null; } }
  function kies(keuze) {
    bewaarKeuze(keuze);
    sluitBalk();
    if (keuze === 'ja') laadAnalytics(); else stopAnalytics();
  }
  function knop(tekst, keuze) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = tekst;
    b.setAttribute('data-consent', keuze);
    // Twee keer dezelfde knop: weigeren mag niet moeilijker zijn dan accepteren.
    b.style.cssText = 'padding:1px 8px;font:inherit;font-size:10.5px;line-height:1.5;color:#3d1127;background:transparent;border:1px solid rgba(61,17,39,.25);border-radius:3px;cursor:pointer';
    b.addEventListener('click', function () { kies(keuze); });
    return b;
  }
  function toonBalk() {
    if (balk || !document.body) return;
    balk = document.createElement('div');
    balk.id = 'cookie-keuze';
    balk.setAttribute('role', 'dialog');
    balk.setAttribute('aria-label', t.label);
    // Onder de widget (2147483646): wie aan het boeken is, wordt niet gestoord.
    balk.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483000;width:max-content;max-width:calc(100vw - 24px);padding:7px 10px;box-sizing:border-box;background:#fff;color:#3d1127;border:1px solid rgba(61,17,39,.15);border-radius:5px;box-shadow:0 2px 8px rgba(0,0,0,.1);font-family:inherit;font-size:11px;line-height:1.35';
    var p = document.createElement('p');
    p.style.cssText = 'margin:0 0 5px;font-size:inherit;line-height:inherit;color:inherit';
    p.textContent = t.vraag;
    var rij = document.createElement('div');
    rij.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px';
    var extra = document.createElement('span');
    extra.textContent = t.extra + ' ';
    var a = document.createElement('a');
    a.href = BELEID[taal()] + '#cookies'; // daar opent start() de privacytekst
    a.textContent = t.meer;
    a.style.cssText = 'color:inherit;text-decoration:underline';
    extra.appendChild(a);
    var knoppen = document.createElement('div');
    knoppen.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:5px;flex:none';
    knoppen.appendChild(knop(t.nee, 'nee'));
    knoppen.appendChild(knop(t.ja, 'ja'));
    rij.appendChild(extra);
    rij.appendChild(knoppen);
    balk.appendChild(p);
    balk.appendChild(rij);
    document.body.appendChild(balk);
  }

  // Elk element met data-cookie-settings opent de keuze opnieuw. Een pagina zonder
  // zo'n link in haar footer krijgt er onderaan een, zodat wijzigen overal kan.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest && e.target.closest('[data-cookie-settings]');
    if (!el) return;
    e.preventDefault();
    var overlay = el.closest('.policy-overlay');
    if (overlay) overlay.classList.remove('active');
    toonBalk();
  });
  function zetInstellingenLink() {
    if (document.querySelector('footer [data-cookie-settings]')) return;
    var a = document.createElement('a');
    a.href = '#';
    a.setAttribute('data-cookie-settings', '');
    a.textContent = t.instellingen;
    a.style.cssText = 'display:block;padding:18px 16px 24px;text-align:center;font-size:12px;color:inherit;opacity:.7';
    document.body.appendChild(a);
  }

  // De widget meldt hoe ver een gast geraakt. Alleen met toestemming gaat dat verder.
  document.addEventListener('rumo:booking', function (e) {
    if (!geladen || window['ga-disable-' + GA_ID]) return;
    var d = e.detail || {};
    if (d.step === 'booked') {
      gtag('event', 'purchase', {
        // Analytics vraagt een nummer. Dit is een willekeurig nummer, geen boekingsnummer.
        transaction_id: 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        value: d.value,
        currency: d.currency,
      });
    } else if (d.step) {
      gtag('event', 'booking_' + d.step);
    }
  });
  document.addEventListener('click', function (e) {
    if (!geladen || window['ga-disable-' + GA_ID]) return;
    if (e.target && e.target.closest && e.target.closest('[data-rumo-book]')) gtag('event', 'booking_open');
  });

  var keuze = leesKeuze();
  if (keuze === 'ja') laadAnalytics();
  function start() {
    zetInstellingenLink();
    if (!keuze) toonBalk();
    var beleid = location.hash === '#cookies' && document.getElementById('modal-privacy');
    if (beleid) beleid.classList.add('active');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
