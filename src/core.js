(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* неразрывные пробелы: короткие слова не повисают в конце строки */
  function nb(s) {
    var NB = String.fromCharCode(160);
    var short = /(^|[\s(«>])([А-Яа-яёЁ]{1,2})\s+(?=[^\s<])/g;
    return s.replace(short, '$1$2' + NB).replace(short, '$1$2' + NB)
      .replace(/\s+—/g, NB + '—')
      .replace(/(\d)\s+(?=\d{3}(?!\d)|МэВ|ГэВ|ТэВ|эВ|фм|км|лет|млрд|млн|%|[мс](?![а-яёА-ЯЁ]))/g, '$1' + NB);
  }

  var info = {};
  function add(obj) {
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) info[k] = obj[k];
  }

  /* ───── Всплывающая карточка ───── */
  function initPop() {
    var pop = $('#pop');
    if (!pop) return;
    var popBody = $('#pop-body'), popIc = $('#pop-ic');
    var group = [], at = 0;

    function fill(trigger, swap) {
      var d = info[trigger.dataset.info];
      if (!d) return;
      var c = getComputedStyle(trigger).getPropertyValue('--c').trim();
      pop.style.setProperty('--c', c || 'var(--c-weak)');
      popIc.innerHTML = '';
      if (d.icon) {
        popIc.innerHTML = d.icon;
      } else {
        var art = trigger.querySelector('svg');
        if (art && !trigger.classList.contains('force') && !trigger.closest('.compo')) {
          var cl = art.cloneNode(true);
          cl.removeAttribute('class');
          if (trigger.querySelector('.gl')) cl.setAttribute('class', 'gl');
          popIc.appendChild(cl);
        }
      }
      $('#pop-kick').innerHTML = nb(d.k);
      $('#pop-title').innerHTML = nb(d.t);
      var h = d.p.map(function (x) { return '<p>' + nb(x) + '</p>'; }).join('');
      if (d.f) h += '<dl class="pop-facts">' + d.f.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + nb(x[1]) + '</dd>'; }).join('') + '</dl>';
      if (d.a) h += '<div class="pop-ana"><span class="tag">Аналогия</span><p>' + nb(d.a) + '</p>' + (d.l ? '<span class="tag">Где хромает</span><p class="limp">' + nb(d.l) + '</p>' : '') + '</div>';
      popBody.innerHTML = h;
      popBody.scrollTop = 0;
      $('#pop-count').textContent = (at + 1) + ' / ' + group.length;
      $('#pop-prev').disabled = $('#pop-next').disabled = group.length < 2;
      if (swap && !calm) {
        [popBody, $('.pop-head', pop)].forEach(function (el) { el.classList.remove('pop-swap'); void el.offsetWidth; el.classList.add('pop-swap'); });
      }
    }
    function open(trigger) {
      group = $$('[data-info][data-group="' + trigger.dataset.group + '"]');
      at = Math.max(0, group.indexOf(trigger));
      fill(trigger, false);
      if (!pop.open) {
        if (pop.showModal) pop.showModal(); else pop.setAttribute('open', '');
      }
    }
    function step(n) {
      if (group.length < 2) return;
      at = (at + n + group.length) % group.length;
      fill(group[at], true);
    }
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-info]') : null;
      if (t && !pop.contains(t)) open(t);
    });
    var popX = $('#pop-x'), popPrev = $('#pop-prev'), popNext = $('#pop-next');
    if (popX) popX.addEventListener('click', function () { pop.close(); });
    if (popPrev) popPrev.addEventListener('click', function () { step(-1); });
    if (popNext) popNext.addEventListener('click', function () { step(1); });
    pop.addEventListener('click', function (e) { if (e.target === pop) pop.close(); });
    pop.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
    });
  }

  /* ───── Появление сцен ───── */
  function initReveal() {
    var reveals = $$('.reveal');
    if (!reveals.length) return;
    if ('IntersectionObserver' in window && !calm) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('in');
          en.target.dispatchEvent(new CustomEvent('kv:reveal'));
          io.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
      reveals.forEach(function (el) { io.observe(el); });
      // страховка: если наблюдатель по какой-то причине молчит, показываем всё
      setTimeout(function () { if (!$('.reveal.in')) reveals.forEach(function (el) { el.classList.add('in'); }); }, 2500);
    } else {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ───── Навигация: прогресс и активный раздел ───── */
  function initNav() {
    var bar = $('#progress'), navLinks = $('#nav-links');
    if (!bar && !navLinks) return;
    var links = navLinks ? $$('a[href^="#"]', navLinks) : [];
    var targets = links.map(function (a) { return $(a.getAttribute('href')); });
    var ticking = false;
    function onScroll() {
      ticking = false;
      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.setProperty('--p', (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + '%');
      }
      if (links.length) {
        var line = window.innerHeight * 0.35, cur = -1;
        targets.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) cur = i; });
        links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
      }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }

  /* ───── Звёздное небо ───── */
  function initStars() {
    var cv = $('#stars');
    if (!cv) return;
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    var W = 0, H = 0, stars = [], comet = null, last = 0, raf = 0;
    var TINT = ['#ffffff', '#cfd6ff', '#b9a4ff', '#8fc4ff', '#ffb8ec'];
    var lastW = 0, starH = 0, resizeTimer = 0;
    var makeStar = function (y, ci) {
      return { x: Math.random() * W, y: y, r: Math.random() * 1.25 + .25, p: Math.random() * 6.28, s: Math.random() * .8 + .3, v: Math.random() * .05 + .01, c: TINT[ci % TINT.length] };
    };
    var resize = function () {
      var narrow = window.innerWidth <= 700;
      var dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 2);
      W = window.innerWidth; H = Math.min(window.innerHeight, 1400);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var density = narrow ? 6200 : 5200;
      var widthChanged = Math.abs(W - lastW) > 40;
      if (widthChanged || !stars.length) {
        lastW = W; starH = H;
        var n = Math.round(Math.min(260, W * H / density));
        stars = [];
        for (var i = 0; i < n; i++) stars.push(makeStar(Math.random() * H, i));
      } else if (H > starH) {
        // адресная строка спряталась и стало выше — досыпаем звёзды в новую область снизу,
        // не трогая уже существующие, чтобы не было пустой полосы
        var addN = Math.round(Math.min(260, W * (H - starH) / density));
        for (var j = 0; j < addN; j++) stars.push(makeStar(starH + Math.random() * (H - starH), stars.length + j));
        starH = H;
      }
      draw(0);
    };
    var onResize = function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };
    var draw = function (t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        ctx.globalAlpha = calm ? .7 : .35 + .65 * Math.abs(Math.sin(st.p + t * .001 * st.s));
        ctx.fillStyle = st.c;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.2832); ctx.fill();
        if (!calm) { st.y -= st.v; if (st.y < -2) { st.y = H + 2; st.x = Math.random() * W; } }
      }
      if (comet) {
        comet.x += comet.dx; comet.y += comet.dy; comet.life -= 1;
        var g = ctx.createLinearGradient(comet.x, comet.y, comet.x - comet.dx * 16, comet.y - comet.dy * 16);
        g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(168,139,255,0)');
        ctx.globalAlpha = Math.min(1, comet.life / 20); ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(comet.x, comet.y); ctx.lineTo(comet.x - comet.dx * 16, comet.y - comet.dy * 16); ctx.stroke();
        if (comet.life <= 0) comet = null;
      }
      ctx.globalAlpha = 1;
    };
    var loop = function (t) {
      raf = requestAnimationFrame(loop);
      if (t - last < 33) return; // ~30 кадров в секунду достаточно
      last = t;
      if (!comet && Math.random() < .004) comet = { x: Math.random() * W * .8, y: Math.random() * H * .4, dx: 5 + Math.random() * 3, dy: 2 + Math.random() * 2, life: 60 };
      draw(t);
    };
    resize();
    window.addEventListener('resize', onResize);
    if (!calm) {
      raf = requestAnimationFrame(loop);
      document.addEventListener('visibilitychange', function () {
        cancelAnimationFrame(raf);
        if (!document.hidden) raf = requestAnimationFrame(loop);
      });
    }
  }

  function init() {
    initPop();
    initReveal();
    initNav();
    initStars();
  }

  window.KV = { nb: nb, info: info, add: add, init: init };
})();
