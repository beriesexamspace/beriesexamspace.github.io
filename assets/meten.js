// Anonieme statistieken met PostHog (EU), sinds 4 november 2026 (Berat).
// Zonder cookies en zonder opslag in de browser (cookieless_mode), het IP-adres wordt niet bewaard (instelling in PostHog),
// niets automatisch vastleggen van klikken of wat je typt, geen schermopnames, nooit een naam of e-mailadres.
// Alleen op beriesexamspace.com, dus niet op localhost of een testkopie. Met Do Not Track of Global Privacy Control tellen we niet mee.
// Gebruik: BES.meet('naam', { eigenschap: waarde }). Staan de statistieken uit, dan doet het niets.
(() => {
  'use strict';
  const BES = window.BES = window.BES || {};
  BES.meet = () => {};
  if (window.location.hostname !== 'beriesexamspace.com') return;
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  // Officiële loader van PostHog (Project settings, HTML snippet), ongewijzigd.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}p||((p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",p.onerror=function(){p=null},(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r));var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="rh ah uh hh ph init Uh Wh Nh qh Jh Ku Hh Zh Fh sd rd od ad ld ud capture getExtension Vh pr Bh zh calculateEventProperties dd register register_once register_for_session unregister unregister_for_session md Lh fd getFeatureFlag getFeatureFlagPayload getFeatureFlagResult getAllFeatureFlags isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys onActiveMatchingSurveysChanged renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync yd identify setPersonProperties unsetPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset bd shutdown setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException addExceptionStep captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty pd Xh createPersonProfile setInternalOrTestUser gd bh mh opt_in_capturing opt_out_capturing yh has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Kh debug Yu Fs getPageViewId captureTraceFeedback captureTraceMetric Ah".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  // Van een adres blijven alleen deze zoekwoorden over (bijvoorbeeld de QR-code van een poster). De rest valt weg, en ook alles na #:
  // daar staat na het bevestigen van je e-mail soms een inlogcode.
  const TOEGESTAAN = ['school', 'richting', 'utm_source', 'utm_medium', 'utm_campaign'];
  const schoonAdres = waarde => {
    if (typeof waarde !== 'string' || !/^https?:\/\//i.test(waarde)) return waarde;
    try {
      const adres = new URL(waarde);
      const zoek = new URLSearchParams();
      TOEGESTAAN.forEach(sleutel => {
        if (adres.searchParams.has(sleutel)) zoek.set(sleutel, adres.searchParams.get(sleutel).slice(0, 40));
      });
      const rest = zoek.toString();
      return adres.origin + adres.pathname + (rest ? `?${rest}` : '');
    } catch {
      return null;
    }
  };
  // PostHog haalt ook klikcodes van advertenties uit het adres (zoals fbclid als je via Facebook of Instagram komt). Die gaan nooit mee.
  const KLIKCODE = /^(\$initial_)?(utm_content|utm_term|gclid|gad_source|gclsrc|dclid|gbraid|wbraid|fbclid|msclkid|twclid|li_fat_id|igshid|ttclid|rdt_cid|epik|qclid|sccid|irclid|_kx|oppref|.*clid|.*cid)$/;
  const schoonAlles = object => {
    if (!object || typeof object !== 'object') return;
    Object.keys(object).forEach(sleutel => {
      if (KLIKCODE.test(sleutel)) delete object[sleutel];
      else object[sleutel] = schoonAdres(object[sleutel]);
    });
  };

  window.posthog.init('phc_BpbPeYQtjjKeabaEjYAbaA5rz2AP8Hvrt7oMo2MWFWaV', {
    api_host: 'https://eu.i.posthog.com',
    defaults: '2026-05-30',
    person_profiles: 'identified_only',
    cookieless_mode: 'always',
    autocapture: false,
    capture_heatmaps: false,
    capture_dead_clicks: false,
    capture_performance: false,
    capture_exceptions: false,
    disable_session_recording: true,
    disable_surveys: true,
    respect_dnt: true,
    before_send: event => {
      if (!event) return event;
      schoonAlles(event.properties);
      schoonAlles(event.$set);
      schoonAlles(event.$set_once);
      return event;
    }
  });

  BES.meet = (naam, eigenschappen = {}) => {
    try { window.posthog.capture(naam, eigenschappen); } catch {}
  };
})();
