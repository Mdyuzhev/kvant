(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var nb = (window.KV && KV.nb) ? KV.nb : function (s) { return s; };
  var PEOPLE = (typeof window.PEOPLE !== 'undefined' && window.PEOPLE) ? window.PEOPLE : [];
  var haveKV = !!(window.KV && typeof KV.add === 'function');

  function animHTML(id) {
    var tpl = document.getElementById('anim-' + id);
    return tpl ? tpl.innerHTML : '';
  }

  if (haveKV && PEOPLE.length) {
  /* ───── реестр всплывающих карточек ───── */
  var reg = {};
  PEOPLE.forEach(function (p) {
    reg[p.id] = {
      k: nb(p.tag + ' · ' + p.where + ' · ' + p.years),
      t: nb(p.name),
      p: p.p,
      f: p.f,
      a: p.a,
      l: p.l,
      icon: animHTML(p.id)
    };
  });
  KV.add(reg);

  /* ───── блок Дирака ───── */
  var dirac = PEOPLE[0];
  var others = PEOPLE.slice(1);

  var dEl = $('#p-dirac');
  if (dEl && dirac) {
    dEl.classList.add('c-' + dirac.c);
    var art = document.createElement('div');
    art.className = 'p-anim-box p-dirac-art';
    art.innerHTML = animHTML(dirac.id);

    var txt = document.createElement('div');
    txt.className = 'p-dirac-txt';

    var tag = document.createElement('p');
    tag.className = 'p-tag';
    tag.textContent = nb(dirac.tag + ' · ' + dirac.where);
    txt.appendChild(tag);

    var h3 = document.createElement('h3');
    h3.textContent = dirac.name;
    txt.appendChild(h3);

    var years = document.createElement('p');
    years.className = 'p-years';
    years.textContent = dirac.years;
    txt.appendChild(years);

    var one = document.createElement('p');
    one.className = 'p-one';
    one.innerHTML = nb(dirac.one || '');
    txt.appendChild(one);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nd btn-more c-' + dirac.c;
    btn.dataset.info = dirac.id;
    btn.dataset.group = 'people';
    btn.textContent = 'Подробнее';
    txt.appendChild(btn);

    dEl.appendChild(art);
    dEl.appendChild(txt);
  }

  /* ───── сетка остальных 13 ───── */
  var grid = $('#people');
  if (grid) {
    others.forEach(function (p) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'nd p-card c-' + p.c;
      card.dataset.info = p.id;
      card.dataset.group = 'people';

      var art = document.createElement('div');
      art.className = 'p-anim-box';
      art.innerHTML = animHTML(p.id);
      card.appendChild(art);

      var name = document.createElement('span');
      name.className = 'p-name';
      name.textContent = p.name;
      card.appendChild(name);

      var years = document.createElement('span');
      years.className = 'p-years';
      years.textContent = (p.tag ? p.tag + ' · ' : '') + p.years;
      card.appendChild(years);

      var one = document.createElement('span');
      one.className = 'p-one';
      one.innerHTML = nb(p.one || '');
      card.appendChild(one);

      grid.appendChild(card);
    });
  }
  }

  if (haveKV && typeof KV.init === 'function') { KV.init(); }
})();
