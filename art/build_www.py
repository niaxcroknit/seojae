# Rebuild www/index.html from src/seojae.html (the same page as the Claude web version), with fonts and capacitor.js bundled locally.
# Needs `npm ci` first (fonts come from node_modules/@fontsource).
import os, re, shutil
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(f'{root}/src/seojae.html', encoding='utf-8').read()
links = []
shutil.copy(f'{root}/node_modules/@capacitor/core/dist/capacitor.js', f'{root}/www/capacitor.js')
for pkg, weights in [('gowun-batang', ['400', '700']), ('ibm-plex-sans-kr', ['400', '500', '600']), ('ibm-plex-mono', ['400', '500'])]:
    pdir = f'{root}/node_modules/@fontsource/{pkg}'
    out = f'{root}/www/fonts/{pkg}'
    os.makedirs(out + '/files', exist_ok=True)
    for w in weights:
        css = open(f'{pdir}/{w}.css').read()
        css = re.sub(r",\s*url\([^)]*\.woff\)\s*format\('woff'\)", "", css)
        for f in re.findall(r"url\(\./files/([^)]+\.woff2)\)", css):
            shutil.copy(f'{pdir}/files/{f}', f'{out}/files/{f}')
        open(f'{out}/{w}.css', 'w').write(css)
        links.append(f'<link rel="stylesheet" href="fonts/{pkg}/{w}.css">')
s = re.sub(r'<link rel="preconnect"[^>]*>\n?', '', src)
s = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>\n?', '', s)
assert 'googleapis' not in s
title = re.search(r'<title>.*?</title>\n?', s).group(0)
body = s.replace(title, '', 1)
html = ('<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + title.strip() + '\n' + '\n'.join(links) + '\n<script src="capacitor.js"></script>\n'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        'body{margin:0;font:14px/1.4 system-ui,sans-serif;-webkit-tap-highlight-color:transparent}img{max-width:100%}[hidden]{display:none!important}</style>\n'
        '</head>\n<body>\n' + body + '\n</body>\n</html>\n')
open(f'{root}/www/index.html', 'w', encoding='utf-8').write(html)
print('www/index.html rebuilt')

# ---- Web version for GitHub Pages: docs/index.html is the app itself (privacy policy stays at docs/privacy/) ----
docs = f'{root}/docs'
shutil.rmtree(f'{docs}/fonts', ignore_errors=True)
shutil.copytree(f'{root}/www/fonts', f'{docs}/fonts')
web = html.replace('<script src="capacitor.js"></script>\n',
    '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="img/icon-192.png">\n'
    '<link rel="apple-touch-icon" href="img/icon-192.png">\n<meta name="theme-color" content="#2F4A3F">\n'
    '<meta name="description" content="가진 책, 읽은 책, 마음에 남은 문장까지. 한줄평과 형광펜으로 가볍게 남기는 독서 기록">\n')
assert 'manifest.webmanifest' in web
open(f'{docs}/index.html', 'w', encoding='utf-8').write(web)
print('docs/index.html rebuilt (web version of the app)')
