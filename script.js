/* =========================================================
   Buying for Good — concept build · interactions
   Structure:  1) helpers  2) chrome (header / rail / progress / reveal)
               3) tabs  4) audience + benefits  5) forms  6) GSAP scenes
   ========================================================= */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo && reduceMQ.matches) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }

  /* ---------------------------------------------------------
     CONFIG — swap the endpoint when the real system is chosen.
     null  = demo mode: stored in localStorage, nothing is sent.
     --------------------------------------------------------- */
  var CONFIG = {
    endpoint: null,               // e.g. 'https://example.com/api/register'
    contactEndpoint: null,        // e.g. 'https://example.com/api/contact'
    storageKey: 'bfg_registrations'
  };

  /* ---------------------------------------------------------
     2) CHROME
     --------------------------------------------------------- */
  var header = $('#siteHeader');
  var bar = $('#progressBar');
  var rail = $('#rail');
  var darkSel = ['.hero', '.bigidea', '.ripple', '.crowd', '.site-footer', '.sub-hero'];
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || 0;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('solid', y > 40 && !overDark(60));
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    if (rail) {
      rail.classList.toggle('on-dark', overDark(window.innerHeight / 2));
      var ft = $('.site-footer');
      rail.classList.toggle('hide', !!ft && ft.getBoundingClientRect().top < window.innerHeight * 0.9);
    }
    updateRail();
    ticking = false;
  }
  function overDark(yPos) {
    for (var i = 0; i < darkSel.length; i++) {
      var els = $$(darkSel[i]);
      for (var j = 0; j < els.length; j++) {
        var r = els[j].getBoundingClientRect();
        if (r.top <= yPos && r.bottom >= yPos) return true;
      }
    }
    return false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);

  // Story rail: active stage from scroll position (last stage whose top passed mid-screen)
  var stageEls = $$('[data-stage]');
  var railLinks = $$('.rail a');
  function updateRail() {
    if (!railLinks || !railLinks.length) return;
    var cur = 1;
    (stageEls || []).forEach(function (el) {
      if (el.getBoundingClientRect().top <= window.innerHeight * 0.5) cur = +el.getAttribute('data-stage');
    });
    railLinks.forEach(function (a) { a.classList.toggle('on', +a.getAttribute('data-stage') === cur); });
  }

  onScroll();

  // Reveal on scroll (IntersectionObserver — reliable replay-free)
  var revealEls = $$('.reveal');
  revealEls.forEach(function (el) {
    var sibs = el.parentElement ? $$('.reveal', el.parentElement).filter(function (s) { return s.parentElement === el.parentElement; }) : [];
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', (i * 0.09).toFixed(2) + 's');
  });
  if ('IntersectionObserver' in window) {
    // Enter: show when ~15% is visible. Leave: reset only once the block is completely out of view,
    // so it plays again every time it comes back (scrolling down OR up).
    var enterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    var leaveIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (!e.isIntersecting) e.target.classList.remove('in'); });
    }, { threshold: 0 });
    revealEls.forEach(function (el) { enterIO.observe(el); leaveIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Crowd video: play only while on screen (saves battery/CPU); stay on the poster for reduced motion
  var crowdVideo = document.querySelector('.crowd-video');
  if (crowdVideo) {
    if (reduceMQ.matches || !('IntersectionObserver' in window)) { crowdVideo.removeAttribute('autoplay'); }
    else {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { var p = crowdVideo.play(); if (p && p.catch) p.catch(function () {}); } else { crowdVideo.pause(); }
        });
      }, { threshold: 0.1 }).observe(crowdVideo);
    }
  }

  /* ---------------------------------------------------------
     3) TABS (How it works) — accessible, arrow keys, sliding ink
     --------------------------------------------------------- */
  var tabsRoot = $('#howTabs');
  if (tabsRoot) {
    var tabs = $$('[role="tab"]', tabsRoot);
    var ink = $('.tab-ink', tabsRoot);
    var panels = $$('[role="tabpanel"]', tabsRoot);
    var moveInk = function (t) {
      if (!ink) return;
      ink.style.width = t.offsetWidth + 'px';
      ink.style.transform = 'translateX(' + (t.offsetLeft - 6) + 'px)';
    };
    var selectTab = function (t, focus) {
      tabs.forEach(function (x, i) {
        var on = x === t;
        x.setAttribute('aria-selected', on ? 'true' : 'false');
        x.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      moveInk(t);
      if (focus) t.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { selectTab(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); selectTab(n, true); }
      });
    });
    window.addEventListener('resize', function () { moveInk($('[aria-selected="true"]', tabsRoot)); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveInk($('[aria-selected="true"]', tabsRoot)); });
    moveInk(tabs[0]);
  }

  /* ---------------------------------------------------------
     4) AUDIENCE PATHS + BENEFITS + FAQ
     All copy below is SAMPLE copy to be replaced from the Website Plan.
     --------------------------------------------------------- */
  var AUD = {
    business: {
      title: 'For businesses',
      list: [
        ['Stand out locally', 'Show customers your store gives back, in a way they can see.'],
        ['Build loyalty', 'Shoppers return to stores that share their values.'],
        ['Simple to join', 'Opt in once and let everyday sales do the rest.']
      ],
      faq: [
        ['What does it cost to take part?', 'Sample answer: costs, any fees and minimums are explained here.'],
        ['How will customers know I take part?', 'Sample answer: in-store signs, online listing and supporter-facing updates.'],
        ['Can I leave at any time?', 'Sample answer: how opting out works and what happens to existing contributions.']
      ],
      confirm: 'We will email you with the next steps for joining as a participating business.'
    },
    charity: {
      title: 'For charities',
      list: [
        ['Steady, visible support', 'Receive contributions from purchases supporters already make.'],
        ['Be chosen by people', 'Supporters direct their impact to the causes they care about.'],
        ['Clear reporting', 'Simple, transparent reporting so you can plan with confidence.']
      ],
      faq: [
        ['Who can be listed?', 'Sample answer: eligibility, verification and how organisations are reviewed.'],
        ['How and when are funds paid?', 'Sample answer: payment schedule, thresholds and reporting.'],
        ['Do we have to promote it ourselves?', 'Sample answer: what is expected of listed charities.']
      ],
      confirm: 'We will email you about how organisations are listed and what we need from you.'
    },
    supporter: {
      title: 'For supporters',
      list: [
        ['Shop as you always do', 'No new habits. Buy what you were going to buy anyway.'],
        ['Choose your cause', 'Pick the charity or cause you want your everyday purchases to help.'],
        ['See your ripple', 'Follow the combined impact of many small purchases.']
      ],
      faq: [
        ['Does it cost me anything extra?', 'Sample answer: how supporter costs, if any, are handled.'],
        ['Which stores take part?', 'Sample answer: how participating stores are shown and updated.'],
        ['Can I change my cause?', 'Sample answer: switching causes and how it takes effect.']
      ],
      confirm: 'We will email you when Buying for Good is ready for supporters like you.'
    }
  };
  var COMMON = [
    ['What is Buying for Good?', 'Sample answer: a short, plain-English description of the initiative and who runs it.'],
    ['What counts as an eligible purchase?', 'Sample answer: what is included, what is not, and how it is recognised.'],
    ['How is my information used?', 'Your details are used only as you agree below. See the privacy policy for more.'],
    ['What happens after I register?', 'We follow up by email. No booking is needed.']
  ];

  var audPanels = $$('.aud-panel');
  var benefits = $('#benefits');
  var benefitsBody = $('#benefitsBody');
  var benefitsPrompt = $('#benefitsPrompt');
  var current = null;

  function faqHTML(items) {
    return items.map(function (q) {
      return '<details><summary>' + q[0] + '</summary><p>' + q[1] + '</p></details>';
    }).join('');
  }

  function setAudience(name, opts) {
    opts = opts || {};
    if (!AUD[name]) return;
    current = name;
    audPanels.forEach(function (p) {
      var on = p.getAttribute('data-aud') === name;
      p.setAttribute('aria-checked', on ? 'true' : 'false');
      p.tabIndex = on ? 0 : -1;
    });
    if (benefitsBody) {
      var d = AUD[name];
      $('#benTitle').textContent = d.title;
      $('#benList').innerHTML = d.list.map(function (b) { return '<li><strong>' + b[0] + '</strong><span>' + b[1] + '</span></li>'; }).join('');
      $('#faqAudTitle').textContent = 'Questions ' + d.title.toLowerCase();
      $('#faqAud').innerHTML = faqHTML(d.faq);
      $('#faqCommon').innerHTML = faqHTML(COMMON);
      benefitsBody.hidden = false;
      benefitsPrompt.hidden = true;
    }
    syncForm(name);
    if (opts.scroll && benefits) {
      benefits.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth', block: 'start' });
    }
  }

  if (audPanels.length) {
    audPanels.forEach(function (p, i) {
      p.tabIndex = i === 0 ? 0 : -1;
      p.addEventListener('click', function () { setAudience(p.getAttribute('data-aud'), { scroll: true }); });
      p.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = audPanels[(i + 1) % audPanels.length];
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = audPanels[(i - 1 + audPanels.length) % audPanels.length];
        if (n) { e.preventDefault(); n.focus(); setAudience(n.getAttribute('data-aud')); }
      });
    });
    $$('[data-pick]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        setAudience(a.getAttribute('data-pick'), { scroll: true });
      });
    });
  }

  /* ---------------------------------------------------------
     5) FORMS
     --------------------------------------------------------- */
  // Demo transport. Replace with a real endpoint via CONFIG.endpoint.
  var send = function (payload, endpoint) {
    if (endpoint) {
      return fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json().catch(function () { return {}; }); });
    }
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (/[?&]simulate=fail/.test(location.search)) reject(new Error('Simulated failure'));
        else resolve({ ok: true });
      }, 700);
    });
  };


  var form = $('#regForm');
  var summary = $('#errSummary');
  var confirmBox = $('#confirm');

  function syncForm(name) {
    if (!form) return;
    var radio = $('input[name="audience"][value="' + name + '"]', form);
    if (radio) radio.checked = true;
    $$('.cond', form).forEach(function (fs) {
      var on = fs.getAttribute('data-for') === name;
      fs.hidden = !on;
      fs.disabled = !on;   // disabled fieldsets are skipped by validation and submission
    });
    var f = $('.f-aud', form);
    if (f) { f.classList.remove('bad'); var e = $('[data-err="audience"]', form); if (e) e.hidden = true; }
  }

  if (form) {
    $$('input[name="audience"]', form).forEach(function (r) {
      r.addEventListener('change', function () { setAudience(r.value); });
    });

    var LABELS = { audience: 'Choose who you are', name: 'Your name', email: 'Email', bizName: 'Business name', chaName: 'Organisation name', consentRespond: 'Permission to respond' };

    var emailOK = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };

    var validate = function () {
      var errs = {};
      var v = function (n) { var el = form.elements[n]; return el ? (el.value || '').trim() : ''; };
      var aud = ($('input[name="audience"]:checked', form) || {}).value;
      if (!aud) errs.audience = 'Please choose whether you are a business, a charity or a supporter.';
      if (!v('name')) errs.name = 'Please enter your name.';
      if (!v('email')) errs.email = 'Please enter your email address.';
      else if (!emailOK(v('email'))) errs.email = 'That email address does not look right. Please check it, for example name@example.com.';
      if (aud === 'business' && !v('bizName')) errs.bizName = 'Please enter your business name.';
      if (aud === 'charity' && !v('chaName')) errs.chaName = 'Please enter your organisation name.';
      if (!form.elements.consentRespond.checked) errs.consentRespond = 'We need your permission to respond to this registration.';
      return errs;
    };

    var clearErrors = function () {
      $$('[data-err]', form).forEach(function (p) { p.hidden = true; p.textContent = ''; });
      $$('.bad', form).forEach(function (f) { f.classList.remove('bad'); });
      $$('[aria-invalid]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); });
      summary.hidden = true; summary.innerHTML = '';
    };

    var showErrors = function (errs) {
      clearErrors();
      var keys = Object.keys(errs);
      keys.forEach(function (k) {
        var p = $('[data-err="' + k + '"]', form);
        if (p) { p.textContent = errs[k]; p.hidden = false; p.id = 'err-' + k; }
        var el = form.elements[k];
        if (el && el.setAttribute && el.type !== 'radio') { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', 'err-' + k); var fld = el.closest('.field'); if (fld) fld.classList.add('bad'); }
        if (k === 'audience') $('.f-aud', form).classList.add('bad');
      });
      summary.innerHTML = '<h3>Please fix ' + keys.length + (keys.length === 1 ? ' thing' : ' things') + ' before sending</h3><ul>' +
        keys.map(function (k) { return '<li><a href="#' + (k === 'audience' ? 'regForm' : k) + '" data-focus="' + k + '">' + (LABELS[k] || k) + ': ' + errs[k] + '</a></li>'; }).join('') + '</ul>';
      summary.hidden = false;
      summary.focus();
      $$('a[data-focus]', summary).forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var k = a.getAttribute('data-focus');
          var el = k === 'audience' ? $('input[name="audience"]', form) : form.elements[k];
          if (el && el.focus) el.focus();
        });
      });
    };

    var store = {
      all: function () { try { return JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]'); } catch (e) { return []; } },
      save: function (list) { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(list)); } catch (e) { /* storage unavailable */ } }
    };

    var submitting = false;
    var doSubmit = function () {
      if (submitting) return;
      var errs = validate();
      if (Object.keys(errs).length) { showErrors(errs); return; }
      clearErrors();
      if (form.elements.website && form.elements.website.value) return; // honeypot: silently ignore bots

      var fd = new FormData(form);
      var payload = {};
      fd.forEach(function (val, key) {
        if (key === 'website') return;
        if (payload[key] !== undefined) { payload[key] = [].concat(payload[key], val); } else payload[key] = val;
      });
      payload.email = String(payload.email).trim().toLowerCase();
      payload.consentRespond = !!form.elements.consentRespond.checked;
      payload.consentUpdates = !!form.elements.consentUpdates.checked;   // kept separate from consentRespond
      payload.submittedAt = new Date().toISOString();

      // Duplicate prevention (client-side demo). The real system must also enforce a unique email constraint server-side.
      var list = store.all();
      var dup = list.filter(function (r) { return r.email === payload.email; })[0];

      var btn = $('#regSubmit');
      submitting = true; btn.classList.add('busy'); btn.setAttribute('aria-busy', 'true');

      var finish = function (isDup) {
        var d = AUD[payload.audience];
        $('#confirmTitle').textContent = isDup ? 'You are already on the list' : 'Thank you, ' + String(payload.name).split(' ')[0];
        $('#confirmText').textContent = isDup
          ? 'We found an existing registration for this email, so we have not created a second one. Any change to your update permission has been saved.'
          : d.confirm + (payload.consentUpdates ? ' You also chose to receive updates.' : ' You chose not to receive updates, and we will respect that.');
        form.hidden = true; confirmBox.hidden = false; confirmBox.focus();
        confirmBox.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth', block: 'center' });
      };

      if (dup) {
        // Update permissions on the existing record, do not create another
        dup.consentUpdates = payload.consentUpdates;
        store.save(list);
        setTimeout(function () { submitting = false; btn.classList.remove('busy'); btn.removeAttribute('aria-busy'); finish(true); }, 500);
        return;
      }

      send(payload, CONFIG.endpoint).then(function () {
        list.push({ email: payload.email, audience: payload.audience, consentUpdates: payload.consentUpdates, at: payload.submittedAt });
        store.save(list);
        finish(false);
      }).catch(function () {
        // Failed submission: keep everything the user typed, explain, offer retry and a human route
        summary.innerHTML = '<h3>We could not send your registration</h3><p>Nothing has been lost. Your answers are still here.</p><button type="button" class="retry">Try again</button> <span>or <a href="mailto:hello@example.org?subject=Registration%20help">email us</a> and we will register you by hand.</span>';
        summary.hidden = false; summary.focus();
        $('.retry', summary).addEventListener('click', function () { summary.hidden = true; doSubmit(); });
      }).then(function () {
        submitting = false; btn.classList.remove('busy'); btn.removeAttribute('aria-busy');
      });
    };

    form.addEventListener('submit', function (e) { e.preventDefault(); doSubmit(); });

    $('#confirmAgain').addEventListener('click', function () {
      form.reset(); clearErrors();
      $$('.cond', form).forEach(function (fs) { fs.hidden = true; fs.disabled = true; });
      confirmBox.hidden = true; form.hidden = false;
      $('input[name="audience"]', form).focus();
    });
  }

  // Contact form (contact.html): enquiry only — never registers or subscribes the visitor
  var cform = $('#contactForm');
  if (cform) {
    var cmsg = $('#contactDone');
    var cerr = $('#contactErr');
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [];
      var name = cform.elements.name.value.trim(), email = cform.elements.email.value.trim(), msg = cform.elements.message.value.trim();
      if (!name) bad.push('Please enter your name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) bad.push('Please enter a valid email address.');
      if (!msg) bad.push('Please write a short message.');
      if (!cform.elements.consentRespond.checked) bad.push('Please give permission for us to reply to your enquiry.');
      if (bad.length) {
        cerr.innerHTML = '<h3>Please fix the following</h3><ul>' + bad.map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul>';
        cerr.hidden = false; cerr.focus(); return;
      }
      cerr.hidden = true;
      var btn = $('button[type=submit]', cform); btn.disabled = true;
      send({ name: name, email: email, message: msg, type: 'enquiry' }, CONFIG.contactEndpoint).then(function () {
        cform.hidden = true; cmsg.hidden = false; cmsg.focus();
      }).catch(function () {
        cerr.innerHTML = '<h3>We could not send your message</h3><p>Your message is still here. Please try again, or <a href="mailto:hello@example.org">email us directly</a>.</p>';
        cerr.hidden = false; cerr.focus();
      }).then(function () { btn.disabled = false; });
    });
  }

  /* ---------------------------------------------------------
     6) GSAP SCENES  (desktop / mobile / reduced-motion aware)
     --------------------------------------------------------- */
  if (!window.gsap || !window.ScrollTrigger) { return; }
  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  mm.add({
    desktop: '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
    mobile: '(max-width: 899px) and (prefers-reduced-motion: no-preference)',
    reduce: '(prefers-reduced-motion: reduce)'
  }, function (ctx) {
    var c = ctx.conditions;
    var animate = c.desktop || c.mobile;
    var cardsSec = $('.cards');
    var rippleSec = $('.ripple');
    var words = $$('.big-words');
    var cleanups = [];

    /* --- Big idea: words light up with scroll (also in reduced motion: all lit) --- */
    var bw = $('#bigWords');
    if (bw && !bw.getAttribute('data-split')) {
      var txt = bw.textContent.trim().split(/\s+/);
      bw.setAttribute('data-split', '1');
      bw.innerHTML = txt.map(function (w) { return '<span class="w" aria-hidden="true">' + w + '</span>'; }).join(' ');
    }
    var wEls = $$('.w', bw);
    if (animate && wEls.length) {
      // Plays to the end by itself once the block is in view (no dependence on how far the user scrolls)
      gsap.set(wEls, { opacity: 0.18 });
      gsap.to(wEls, { opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power1.out',
        scrollTrigger: { trigger: '#bigWords', start: 'top 82%', toggleActions: 'restart none restart reset' } });
    } else {
      wEls.forEach(function (el) { el.classList.add('lit'); });
    }

    if (!animate) {
      // Reduced motion: stack the cards, show the ripple's final state, no pins/scrubs
      if (cardsSec) cardsSec.classList.add('stack');
      if (rippleSec) rippleSec.classList.add('static');
      gsap.set('.ln > span', { clearProps: 'all' });
      return function () {
        if (cardsSec) cardsSec.classList.remove('stack');
        if (rippleSec) rippleSec.classList.remove('static');
      };
    }

    /* --- HERO: sunrise intro + parallax --- */
    var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    gsap.from('.hero-video', { opacity: 0, duration: 1.8, ease: 'power2.out' });
    intro.from('.sky', { backgroundPosition: '50% 100%', duration: 2.4, ease: 'power2.out' }, 0)
         .from('.sun', { y: 170, duration: 2.6, ease: 'power2.out' }, 0)
         .from('.sun-glow', { opacity: 0, duration: 2.4 }, 0.2)
         .fromTo('.ln > span', { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.14 }, 0.5)
         .from('.hero .eyebrow, .hero .lede, .hero-cta', { opacity: 0, y: 20, duration: 0.9, stagger: 0.12 }, 0.9);
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom 35%', onEnterBack: function () { intro.restart(); } });

    gsap.to('.hero .sun', { y: 140, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (!document.querySelector('.hero.has-video')) {   // with the video, the sand wave must stay glued to the hero's bottom edge
      gsap.to('.hero .w1', { y: 30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero .w3', { y: -30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    gsap.to('.hero-copy', { y: -60, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.hero', start: '20% top', end: 'bottom top', scrub: true } });

    /* --- CARDS: pinned horizontal story (desktop) / stacked (mobile) --- */
    var track = $('#cardsTrack');
    if (track && c.desktop) {
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: '.cards-pin', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }
      });
    } else if (cardsSec) {
      cardsSec.classList.add('stack');
      cleanups.push(function () { cardsSec.classList.remove('stack'); });
      gsap.from('.card', { opacity: 0, y: 40, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.cards-track', start: 'top 80%' } });
    }

    /* --- LOGO REVEAL: three figures come together --- */
    gsap.set('.fig', { transformOrigin: '50% 50%' });
    gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.3 }, scrollTrigger: { trigger: '#logoReveal', start: 'top 82%', toggleActions: 'restart none restart reset' } })
      .fromTo('.f-biz', { x: -110, scale: 0.5, opacity: 0 }, { x: 0, scale: 1, opacity: 1 }, 0)
      .fromTo('.f-cha', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1 }, 0.15)
      .fromTo('.f-sup', { x: 110, scale: 0.5, opacity: 0 }, { x: 0, scale: 1, opacity: 1 }, 0);
    gsap.from('.logo-key li', { opacity: 0, x: 24, stagger: 0.18, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.logo-key', start: 'top 88%', toggleActions: 'restart none restart reset' } });

    /* --- THE RIPPLE: five purchases build one shared ripple (pinned, scrubbed) --- */
    if (rippleSec) {
      var stage = $('#rippleStage');
      var chips = $$('.chip');
      var rings = $$('.ripple-svg .rg').reverse();   // smallest ring first
      var caps = $$('.cap');
      var photos = $$('.ripple-photos .ph');
      var core = $('.ripple-svg .core');
      var STEP = 1.5, T = chips.length * STEP;
      var drop = c.desktop ? 300 : 220;

      gsap.set(rings, { scale: 0.05, opacity: 0, svgOrigin: '400 400' });
      gsap.set(core, { scale: 0, svgOrigin: '400 400' });
      gsap.set(chips, { opacity: 0, y: -drop });
      gsap.set(caps, { opacity: 0, y: 14 });
      gsap.set(photos, { opacity: 0, scale: 0.5, y: 50, rotation: function (i) { return (i % 2 ? 1 : -1) * (4 + i); } });
      gsap.set('.ripple-end', { opacity: 0, y: 20 });

      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: stage, start: 'top top', end: c.desktop ? '+=380%' : '+=300%', pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true }
      });
      chips.forEach(function (chip, i) {
        var t = i * STEP;
        tl.to(chip, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, t)
          .to(chip, { opacity: 0, scale: 0.25, duration: 0.35, ease: 'power2.in' }, t + 0.7)
          .to(core, { scale: 1 + i * 0.35, duration: 0.3, ease: 'power2.out' }, t + 0.7)
          .to(rings[i], { scale: 1, opacity: 0.95, duration: 0.8, ease: 'power2.out' }, t + 0.75)
          .to(caps[i], { opacity: 1, y: 0, duration: 0.35 }, t + 0.15);
        if (i < chips.length - 1) tl.to(caps[i], { opacity: 0, y: -10, duration: 0.3 }, t + STEP - 0.3);
        if (i > 0) tl.to(rings[i - 1], { opacity: 0.55, duration: 0.6 }, t + 0.75);
      });
      tl.to(caps[caps.length - 1], { opacity: 0, y: -10, duration: 0.4 }, T + 0.2)
        .to(rings, { opacity: 0.55, scale: 1.06, duration: 1, stagger: 0.05 }, T + 0.2)
        .to(photos, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.7, stagger: 0.18, ease: 'back.out(1.3)' }, T + 0.5)
        .to('.ripple-end', { opacity: 1, y: 0, duration: 0.6 }, T + 1.8)
        .to({}, { duration: 0.6 });   // hold the final composition for a moment
    }

    /* --- MONEY FLOW: lines draw, nodes appear --- */
    var flow = $('#flow');
    if (flow) {
      var paths = $$('.fl', flow);
      paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      gsap.timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: flow, start: 'top 85%', toggleActions: 'restart none restart reset' } })
        .fromTo('.coin, .coin-t', { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.5 }, 0)
        .to(paths, { strokeDashoffset: 0, duration: 1.1, stagger: 0.18, ease: 'power1.inOut' }, 0.4)
        .fromTo('.node', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.18 }, 1.2);
    }

    /* --- CROWD: video frame opens from a rounded window to full-bleed --- */
    var cf = $('#crowdFrame');
    if (cf) {
      gsap.fromTo(cf, { clipPath: 'inset(16% 22% round 36px)' }, {
        clipPath: 'inset(0% 0% round 0px)', ease: 'none',
        scrollTrigger: { trigger: '.crowd-pin', start: 'top top', end: '+=90%', pin: true, scrub: 0.6, anticipatePin: 1 }
      });
      gsap.fromTo('.crowd-text', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.crowd-pin', start: 'top 70%', toggleActions: 'restart none restart reset' } });
    }

    /* --- JIGSAW: three pieces slide together --- */
    gsap.timeline({ defaults: { ease: 'back.out(1.2)', duration: 1.4 }, scrollTrigger: { trigger: '#jig', start: 'top 88%', toggleActions: 'restart none restart reset' } })
      .fromTo('.jp1', { x: -160, y: -30, rotation: -8, transformOrigin: '50% 50%' }, { x: 0, y: 0, rotation: 0 }, 0)
      .fromTo('.jp2', { y: 90, rotation: 6, transformOrigin: '50% 50%' }, { y: 0, rotation: 0 }, 0.1)
      .fromTo('.jp3', { x: 160, y: -40, rotation: 9, transformOrigin: '50% 50%' }, { x: 0, y: 0, rotation: 0 }, 0);

    return function () { cleanups.forEach(function (f) { f(); }); };
  });

  // Keep triggers accurate after fonts / images settle
  var refresh = function () { ScrollTrigger.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
})();
