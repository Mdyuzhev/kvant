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

  /* ───── Словарик: чипы из данных ───── */
  var gl = $('#gloss');
  GLOSS.forEach(function (g, i) {
    var id = 'gl-' + i;
    INFO[id] = { k: 'словарик', t: g[0], p: [g[1]] };
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'nd g-chip c-em';
    b.dataset.info = id;
    b.dataset.group = 'gloss';
    b.textContent = g[0];
    gl.appendChild(b);
  });

  /* ───── Всплывающая карточка ───── */
  var pop = $('#pop'), popBody = $('#pop-body'), popIc = $('#pop-ic');
  var group = [], at = 0;

  function fill(trigger, swap) {
    var d = INFO[trigger.dataset.info];
    if (!d) return;
    var c = getComputedStyle(trigger).getPropertyValue('--c').trim();
    pop.style.setProperty('--c', c || 'var(--c-weak)');
    popIc.innerHTML = '';
    var art = trigger.querySelector('svg');
    if (art && !trigger.classList.contains('force') && !trigger.closest('.compo')) {
      var cl = art.cloneNode(true);
      cl.removeAttribute('class');
      if (trigger.querySelector('.gl')) cl.setAttribute('class', 'gl');
      popIc.appendChild(cl);
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
  $('#pop-x').addEventListener('click', function () { pop.close(); });
  $('#pop-prev').addEventListener('click', function () { step(-1); });
  $('#pop-next').addEventListener('click', function () { step(1); });
  pop.addEventListener('click', function (e) { if (e.target === pop) pop.close(); });
  pop.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
  });

  /* ───── Кто какую силу чувствует ───── */
  var SAY = {
    '': 'Выберите силу — останутся гореть только те, кто её чувствует. Нажмите на частицу — всплывёт её карточка. Строки — поколения: чем ниже, тем тяжелее. Столбцы — электрический заряд.',
    strong: 'Сильную силу чувствуют только кварки и сами глюоны. Лептоны к ней глухи: поэтому электрон не сидит в ядре, а нейтрино пролетает Землю насквозь.',
    em: 'Электромагнитную силу чувствуют все, у кого есть электрический заряд: шесть кварков, электрон, мюон, тау и W-бозоны. Три нейтрино не заряжены — и гаснут. Курьер, фотон, сам не заряжен: свет проходит сквозь свет.',
    weak: 'Слабую силу чувствуют все 12 частиц вещества без исключения, а ещё W, Z и бозон Хиггса. Только она умеет превращать одни частицы в другие.',
    grav: 'Гравитацию чувствует всё, у чего есть энергия, — то есть вообще всё. Но её курьер, гравитон, пока лишь гипотеза, и в Стандартную модель гравитация не входит.',
    higgs: 'Размер значка — масса. Масштаб логарифмический: в честном масштабе истинный кварк был бы в 340 000 раз крупнее электрона. Фотон и глюон поля Хиггса не замечают и массы не имеют. Откуда масса у нейтрино — пока неизвестно.'
  };
  var sm = $('#sm'), say = $('#f-say'), fbtns = $$('.f-btn');
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('aria-pressed') === 'true' ? '' : b.dataset.force;
      fbtns.forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.force === f ? 'true' : 'false'); });
      if (f) sm.dataset.force = f; else delete sm.dataset.force;
      say.textContent = nb(SAY[f]);
      say.style.setProperty('--fc-now', f ? getComputedStyle(b).getPropertyValue('--c') : 'var(--c-ui)');
    });
  });

  /* ───── Конструктор адронов ───── */
  var ORDER = 'udscbt';
  var Q3 = { u: 2, d: -1, s: -1, c: 2, b: -1, t: 2 };
  var FR = { 0: '0', 1: '1/3', 2: '2/3', 3: '1', 4: '4/3', 5: '5/3', 6: '2' };
  function fr(n) { return n === 0 ? '0' : (n > 0 ? '+' : '−') + FR[Math.abs(n)]; }
  var BARYON = {
    uud: ['Протон', 'Ядро атома водорода и главная деталь всех остальных ядер. Стабилен.'],
    udd: ['Нейтрон', 'В ядре живёт сколько угодно, на свободе — меньше 15 минут.'],
    uuu: ['Дельта-плюс-плюс, Δ⁺⁺', 'Тяжёлый родственник протона с зарядом +2. Распадается примерно за 10⁻²³ с.'],
    ddd: ['Дельта-минус, Δ⁻', 'Как Δ⁺⁺, только из трёх d-кварков. Живёт те же 10⁻²³ с.'],
    uds: ['Лямбда-гиперон, Λ⁰', '«Странный» родственник нейтрона: один d-кварк заменён на s. Живёт 2,6×10⁻¹⁰ с.'],
    uus: ['Сигма-плюс, Σ⁺', 'Странный барион. Живёт 0,8×10⁻¹⁰ с.'],
    dds: ['Сигма-минус, Σ⁻', 'Странный барион. Живёт 1,5×10⁻¹⁰ с.'],
    uss: ['Кси-ноль, Ξ⁰', 'Дважды странный барион.'],
    dss: ['Кси-минус, Ξ⁻', 'Дважды странный барион.'],
    sss: ['Омега-минус, Ω⁻', 'Три странных кварка. Гелл-Ман предсказал эту частицу по пустой клетке в своей таблице — и в 1964 году её нашли.'],
    udc: ['Лямбда-c, Λc⁺', 'Очарованный барион.'],
    udb: ['Лямбда-b, Λb⁰', 'Прелестный барион. Именно в его распадах эксперимент LHCb нашёл пентакварки.'],
    ucc: ['Кси-cc, Ξcc⁺⁺', 'Дважды очарованный барион. Открыт на LHCb в 2017 году.']
  };
  var MESON = {
    'u|d': ['Пион π⁺', 'Самый лёгкий мезон. Живёт 26 наносекунд.'],
    'd|u': ['Пион π⁻', 'Античастица для π⁺. Живёт те же 26 наносекунд.'],
    'u|u': ['Пион π⁰', 'Настоящий π⁰ — квантовая смесь пар u + анти-u и d + анти-d. Живёт 8×10⁻¹⁷ с и распадается на два фотона.'],
    'd|d': ['Пион π⁰', 'Настоящий π⁰ — квантовая смесь пар u + анти-u и d + анти-d. Живёт 8×10⁻¹⁷ с и распадается на два фотона.'],
    'u|s': ['Каон K⁺', 'Странный мезон. Живёт 12 наносекунд.'],
    's|u': ['Каон K⁻', 'Античастица для K⁺.'],
    'd|s': ['Каон K⁰', 'Нейтральный странный мезон.'],
    's|s': ['Фи-мезон, φ', 'Странный кварк в паре со своим антикварком.'],
    'c|c': ['J/ψ, «джей-пси»', 'Очарованный кварк со своим антикварком. Открытие этой частицы в 1974 году доказало, что c-кварк существует.'],
    'b|b': ['Ипсилон, Υ', 'Прелестный кварк со своим антикварком. Так в 1977 году открыли b-кварк.'],
    'c|d': ['D⁺-мезон', 'Очарованный мезон.'],
    'c|u': ['D⁰-мезон', 'Очарованный мезон.'],
    'c|s': ['Ds⁺-мезон', 'Очарованный и странный сразу.'],
    'u|b': ['B⁺-мезон', 'На B-мезонах изучают разницу между веществом и антивеществом.'],
    'd|b': ['B⁰-мезон', 'На B-мезонах изучают разницу между веществом и антивеществом.'],
    's|b': ['Bs⁰-мезон', 'Странный и прелестный сразу.'],
    'c|b': ['Bc⁺-мезон', 'Редкий мезон из двух разных тяжёлых кварков.']
  };
  var TOP = 'Истинный кварк распадается за 5×10⁻²⁵ с — раньше, чем сильная сила успевает прилепить его к соседям. Частиц с t-кварком не бывает.';

  var picked = [];
  var slots = $$('#slots .b-slot'), out = $('#b-out');
  function glyph(id) { return '<svg class="gl" viewBox="0 0 100 100" aria-hidden="true"><use href="#g-' + id + '"/></svg>'; }
  function isAnti(id) { return id.charAt(0) === 'a'; }
  function flavor(id) { return isAnti(id) ? id.charAt(1) : id; }
  function charge3(id) { return isAnti(id) ? -Q3[flavor(id)] : Q3[id]; }
  function sortF(a) { return a.slice().sort(function (x, y) { return ORDER.indexOf(x) - ORDER.indexOf(y); }).join(''); }

  function verdict() {
    var n = picked.length;
    if (!n) return ['', 'Пусто', 'Выберите кварки слева или нажмите на готовый рецепт.'];
    var total = picked.reduce(function (s, id) { return s + charge3(id); }, 0);
    var sum = picked.map(function (id) { return fr(charge3(id)); }).join(' ') + ' = ' + fr(total);
    var q = picked.filter(function (id) { return !isAnti(id); }).map(flavor);
    var a = picked.filter(isAnti).map(flavor);
    if (picked.some(function (id) { return flavor(id) === 't'; })) return [sum, 'Не успеет склеиться', TOP];
    if (n === 1) return [sum, 'Одиночный кварк', 'На свободе такой не живёт: конфайнмент. Добавьте ему компанию.'];
    if (n === 2 && q.length === 1) {
      var m = MESON[q[0] + '|' + a[0]], conj = MESON[a[0] + '|' + q[0]];
      if (m) return [sum, m[0], 'Мезон — пара «кварк + антикварк». ' + m[1]];
      if (conj) return [sum, 'Античастица для: ' + conj[0], 'Мезон. Та же масса, противоположный заряд.'];
      return [sum, 'Мезон', 'Пара «кварк + антикварк» — такая частица существует.'];
    }
    if (n === 2) return [sum, 'Ещё не частица', 'Два кварка не бывают «бесцветными». Добавьте третий — или замените один на антикварк, выйдет мезон.'];
    if (q.length === 3 || a.length === 3) {
      var b = BARYON[sortF(q.length ? q : a)];
      if (q.length === 3) return [sum, b ? b[0] : 'Барион', b ? 'Барион — частица из трёх кварков. ' + b[1] : 'Три кварка — такая частица существует, хоть и живёт недолго.'];
      return [sum, b ? 'Античастица для: ' + b[0] : 'Антибарион', 'Три антикварка — частица из антивещества. Та же масса, противоположный заряд.'];
    }
    return [sum, 'Такую сборку природа не выпускает', 'Она не получается «бесцветной». Нужны три кварка, три антикварка или пара «кварк + антикварк».'];
  }
  function render() {
    slots.forEach(function (s, i) { s.innerHTML = picked[i] ? glyph(picked[i]) : ''; });
    var v = verdict();
    out.innerHTML = '';
    [['b-sum', v[0]], ['b-name', v[1]], ['b-note', v[2]]].forEach(function (x) {
      if (!x[1]) return;
      var el = document.createElement('span');
      el.className = x[0];
      el.textContent = nb(x[1]);
      out.appendChild(el);
    });
  }
  function palette(root, anti) {
    ORDER.split('').forEach(function (f) {
      var id = (anti ? 'a' : '') + f;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'b-chip';
      b.setAttribute('aria-label', (anti ? 'анти-' : '') + f + '-кварк, заряд ' + fr(charge3(id)));
      b.innerHTML = glyph(id) + '<small>' + fr(charge3(id)) + '</small>';
      b.addEventListener('click', function () { if (picked.length < 3) { picked.push(id); render(); } });
      root.appendChild(b);
    });
  }
  palette($('#pal-q'), false);
  palette($('#pal-a'), true);
  $('#b-undo').addEventListener('click', function () { picked.pop(); render(); });
  $('#b-clear').addEventListener('click', function () { picked = []; render(); });
  $$('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () { picked = b.dataset.preset.split(','); render(); });
  });
  picked = ['u', 'u', 'd'];
  render();

  /* ───── Превращения: вкладки и повтор анимации ───── */
  var tabs = $$('.tab'), procs = $$('svg.proc'), panel = $('#proc');
  function play(name) {
    procs.forEach(function (s) {
      var on = s.dataset.proc === name;
      s.toggleAttribute('hidden', !on);
      s.classList.remove('play');
      if (on) { void s.getBoundingClientRect(); s.classList.add('play'); }
    });
  }
  function pick(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    var d = PROC[tab.dataset.proc];
    panel.setAttribute('aria-labelledby', tab.id);
    $('#proc-title').textContent = d.t;
    $('#proc-text').textContent = nb(d.p);
    $('#proc-fact').textContent = nb(d.f);
    play(tab.dataset.proc);
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(t, false); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      pick(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length], true);
      e.preventDefault();
    });
  });
  $('#replay').addEventListener('click', function () { play($('.tab[aria-selected="true"]').dataset.proc); });

  /* ───── Мифы: переворот карточки ───── */
  $$('.myth').forEach(function (m) {
    m.addEventListener('click', function () {
      m.setAttribute('aria-pressed', m.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  /* ───── Появление сцен ───── */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !calm) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.id === 'proc') play($('.tab[aria-selected="true"]').dataset.proc);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
    // страховка: если наблюдатель по какой-то причине молчит, показываем всё
    setTimeout(function () { if (!$('.reveal.in')) reveals.forEach(function (el) { el.classList.add('in'); }); }, 2500);
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ───── Навигация: прогресс и активный раздел ───── */
  var links = $$('#nav-links a'), bar = $('#progress');
  var targets = links.map(function (a) { return $(a.getAttribute('href')); });
  var ticking = false;
  function onScroll() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty('--p', (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + '%');
    var line = window.innerHeight * 0.35, cur = -1;
    targets.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ───── Звёздное небо ───── */
  var cv = $('#stars'), ctx = cv.getContext && cv.getContext('2d');
  if (ctx) {
    var W = 0, H = 0, stars = [], comet = null, last = 0, raf = 0;
    var TINT = ['#ffffff', '#cfd6ff', '#b9a4ff', '#8fc4ff', '#ffb8ec'];
    var resize = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = Math.min(window.innerHeight, 1400);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(260, W * H / 5200));
      stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.25 + .25, p: Math.random() * 6.28, s: Math.random() * .8 + .3, v: Math.random() * .05 + .01, c: TINT[i % TINT.length] });
      }
      draw(0);
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
    window.addEventListener('resize', resize);
    if (!calm) {
      raf = requestAnimationFrame(loop);
      document.addEventListener('visibilitychange', function () {
        cancelAnimationFrame(raf);
        if (!document.hidden) raf = requestAnimationFrame(loop);
      });
    }
  }
})();
