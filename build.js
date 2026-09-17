// Собирает src/* в один самодостаточный index.html:  node build.js
const fs = require('fs'), path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const fonts = 'https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap';

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#070918">
<meta name="description" content="Элементарные частицы простым языком: что из чего состоит, кто за что отвечает и как всё рождается.">
<title>Конструктор материи</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<style>
${src('style.css')}</style>
</head>
<body>
${src('body1.html')}${src('body2.html')}<script>
${src('data.js')}
${src('app.js')}</script>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html собран:', html.length, 'символов');
