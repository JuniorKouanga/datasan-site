"""Convertit les dumps structurés des statuts et du RI en contenu HTML (src/pages)."""
import re, sys, html, json

def slug(s):
    s=s.lower()
    for a,b in [('é','e'),('è','e'),('ê','e'),('à','a'),('ô','o'),('î','i'),('ç','c'),('’',"'"),('ù','u'),('û','u'),('â','a')]: s=s.replace(a,b)
    return re.sub(r'[^a-z0-9]+','-',s).strip('-')[:60]

def fmt(t, li=False):
    t=html.escape(t)
    # Mettre en gras les intitulés du type "Définition :" ou "1. Le Membre Fondateur."
    t=re.sub(r'^(\d\.\s[^.]{3,60}\.)', r'<strong>\1</strong>', t)
    t=re.sub(r'^((?:Définition|Obligations|Conventions réglementées|Registre et sanctions)\s?[:.])', r'<strong>\1</strong>', t)
    if li: t=re.sub(r'^([A-ZÉ][^.]{3,60}\.)(\s)', lambda m: '<strong>'+m.group(1)+'</strong>'+m.group(2) if len(m.group(1).split())<=8 else m.group(0), t)
    return t

def titlecase_title(t):
    # "Titre IV : assemblee generale" -> "Titre IV — Assemblée générale"
    m=re.match(r'(Titre [IVXL]+)\s*:\s*(.*)',t)
    if not m: return t
    rest=m.group(2).strip().lower()
    fixes={'assemblee generale':'assemblée générale','membre':'membres','ressources et moyen d’action':"ressources et moyens d'action",'direction exécutive':'direction exécutive','finances, transparence et éthique':'finances, transparence et éthique'}
    rest=fixes.get(rest,rest)
    return m.group(1)+' — '+rest[0].upper()+rest[1:]

def convert(path, start_marker, stop_markers):
    lines=[l.rstrip('\n') for l in open(path,encoding='utf-8')]
    out=[]; toc=[]; started=False; lst=False; tbl=None; sec_open=False; title_open=False
    def close_list():
        nonlocal lst
        if lst: out.append('</ul>'); lst=False
    def close_tbl():
        nonlocal tbl
        if tbl is not None:
            head,*rows=tbl
            out.append('<div class="table-wrap"><table><thead><tr>'+''.join(f'<th>{html.escape(c)}</th>' for c in head)+'</tr></thead><tbody>'+''.join('<tr>'+''.join(f'<td>{html.escape(c)}</td>' for c in r)+'</tr>' for r in rows)+'</tbody></table></div>')
            tbl=None
    for l in lines:
        m=re.match(r'\[(.*?)\|(.*?)\] (.*)',l)
        if l.startswith('[TR] '):
            if not started: continue
            close_list()
            cells=l[5:].split(' | ')
            if tbl is None: tbl=[]
            tbl.append(cells); continue
        if not m: continue
        style,flags,text=m.groups()
        if not started:
            if text.startswith(start_marker) and style.startswith('Heading'): started=True
            else: continue
        if any(text.startswith(s) for s in stop_markers): break
        close_tbl()
        if style=='Heading 1':
            close_list()
            if sec_open: out.append('</section>'); sec_open=False
            t=titlecase_title(text) if text.startswith('Titre') else text
            sid=slug(t.split(' — ')[0] if t.startswith('Titre') else t)
            toc.append({'id':sid,'label':t,'children':[]})
            out.append(f'<h2 id="{sid}" class="legal-title">{html.escape(t)}</h2>')
        elif style=='Heading 2':
            close_list()
            if sec_open: out.append('</section>')
            am=re.match(r'Article (\d+)',text)
            sid=(toc[-1]['id']+'-' if not am else '')+('article-'+am.group(1) if am else slug(text))
            # identifiants uniques (articles en double)
            base=sid; k=2
            while any(c['id']==sid for t in toc for c in t['children']): sid=f'{base}-{k}'; k+=1
            toc[-1]['children'].append({'id':sid,'label':text})
            out.append(f'<section class="article" id="{sid}"><h3>{html.escape(text)}</h3>'); sec_open=True
        elif 'L' in flags:
            if not lst: out.append('<ul>'); lst=True
            out.append(f'<li>{fmt(text, True)}</li>')
        else:
            close_list()
            out.append(f'<p>{fmt(text)}</p>')
    close_list(); close_tbl()
    if sec_open: out.append('</section>')
    return '\n'.join(out), toc

def toc_html(toc):
    h=['<nav class="toc" aria-label="Sommaire"><p class="toc-label">Sommaire</p><ol>']
    for t in toc:
        h.append(f'<li><a href="#{t["id"]}">{html.escape(t["label"])}</a>')
        if t['children']:
            h.append('<ol>'+''.join(f'<li><a href="#{c["id"]}">{html.escape(c["label"])}</a></li>' for c in t['children'])+'</ol>')
        h.append('</li>')
    h.append('</ol></nav>')
    return ''.join(h)

if __name__=='__main__':
    src,kind,dst=sys.argv[1:4]
    if kind=='statuts':
        body,toc=convert(src,'Titre I',['Fait à Dolisie'])
    else:
        body,toc=convert(src,'Titre I',['Fait à Brazzaville'])
        # Annexes après la signature
        body2,toc2=convert(src,'Annexe A',[])
        body+='\n'+body2; toc+=toc2
    json.dump({'toc':toc_html(toc),'body':body},open(dst,'w',encoding='utf-8'),ensure_ascii=False)
    print(kind, len(toc),'titres', sum(len(t['children']) for t in toc),'articles')
