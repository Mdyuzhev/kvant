// Собирает src/* в самодостаточные HTML-страницы:  node build.js
const fs = require('fs'), path = require('path');
const srcPath = f => path.join(__dirname, 'src', f);
const has = f => fs.existsSync(srcPath(f));
const src = f => fs.readFileSync(srcPath(f), 'utf8');
const fonts = 'https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap';

// Общие стили для элементов, разделяемых обеими страницами (например, ссылка
// на другую страницу в шапке), которые не должны попадать в src/style.css,
// потому что этим файлом владеет другой агент.
const NAV_CSS = `
.nav-links a.page-link {
  border: 1px solid color-mix(in oklab, var(--c-ui) 45%, transparent);
  background: rgba(95,227,255,.1);
  color: var(--ink);
  border-radius: 9px;
  padding: .35em .8em;
  font-family: var(--mono, inherit);
}
.nav-links a.page-link:hover,
.nav-links a.page-link:focus-visible {
  background: rgba(95,227,255,.2);
}
`;

function page({ title, description, body, scripts, extraCss }) {
  const js = scripts.map(f => src(f)).join('\n\n');
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#070918">
<meta name="description" content="${description}">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<style>
${extraCss}
${NAV_CSS}
</style>
</head>
<body>
${body}<script>
${js}</script>
</body>
</html>
`;
}

function buildKvant() {
  const html = page({
    title: 'Конструктор материи',
    description: 'Элементарные частицы простым языком: что из чего состоит, кто за что отвечает и как всё рождается.',
    extraCss: src('style.css'),
    body: `${src('body1.html')}${src('body2.html')}${src('pop.html')}`,
    scripts: ['core.js', 'data.js', 'app.js']
  });
  fs.writeFileSync(path.join(__dirname, 'kvant.html'), html);
  console.log('kvant.html собран:', html.length, 'символов');
}

function buildPeople() {
  const needed = ['people-style.css', 'people-body.html', 'people-data.js', 'people-app.js'];
  const missing = needed.filter(f => !has(f));
  if (missing.length) {
    console.log('people.html пропущен — не найдены:', missing.join(', '));
    return;
  }
  const html = page({
    title: 'Люди кванта',
    description: 'Учёные, придумавшие квантовую физику: кто они были и что именно открыли.',
    extraCss: `${src('style.css')}\n${src('people-style.css')}`,
    body: `${src('people-body.html')}${src('pop.html')}`,
    scripts: ['core.js', 'people-data.js', 'people-app.js']
  });
  fs.writeFileSync(path.join(__dirname, 'people.html'), html);
  console.log('people.html собран:', html.length, 'символов');
}

function buildIndexRedirect() {
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="refresh" content="0; url=kvant.html">
<link rel="canonical" href="kvant.html">
<meta name="theme-color" content="#070918">
<title>Конструктор материи</title>
<style>
  html, body { background: #070918; color: #e8ecff; font-family: system-ui, sans-serif; height: 100%; margin: 0; }
  body { display: flex; align-items: center; justify-content: center; text-align: center; }
  a { color: #5fe3ff; }
</style>
<script>location.replace('kvant.html');</script>
</head>
<body>
  <p>Открывается страница… <a href="kvant.html">Открыть страницу</a></p>
</body>
</html>
`;
  fs.writeFileSync(path.join(__dirname, 'index.html'), html);
  console.log('index.html собран:', html.length, 'символов');
}

buildKvant();
buildPeople();
buildIndexRedirect();
