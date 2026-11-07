# runs on GitHub Actions: checks the current hotlinked photos and pulls Wikimedia Commons candidates
import json, urllib.request, urllib.parse, subprocess
UA = {'User-Agent': 'noam-cakes-page/1.0 (https://shahar1987.github.io/kvutzot/noam/)'}
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read()
for pid in ['photo-1726950189914-8fe1016eb9c7','photo-1607269832078-1a3bd22a306d','photo-1530449595747-4315f4cd454f','photo-1759303380841-55c09244fd2b']:
    try: print('HOTLINK', pid, len(get(f'https://images.unsplash.com/{pid}?w=200')))
    except Exception as e: print('HOTLINK', pid, 'ERR', e)
credits = {}
for tag, q in [('vit','bakery display case cakes'),('vit','patisserie window cakes'),('carrot','carrot cake'),('lemon','lemon meringue pie'),('basque','basque cheesecake')]:
    api = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({'action':'query','format':'json','generator':'search','gsrnamespace':6,'gsrsearch':q+' filetype:bitmap','gsrlimit':6,'prop':'imageinfo','iiprop':'url|extmetadata|size','iiurlwidth':1600})
    pages = json.loads(get(api)).get('query',{}).get('pages',{})
    for n, p in enumerate(sorted(pages.values(), key=lambda p: p.get('index', 0))):
        ii = p['imageinfo'][0]; md = ii.get('extmetadata', {})
        if ii.get('width', 0) < 1000: continue
        name = f'{tag}-{q.split()[0]}-{n}'
        try:
            open(name+'.raw','wb').write(get(ii['thumburl']))
            subprocess.run(['convert', name+'.raw', '-auto-orient', '-resize', '1600x1600>', '-strip', '-quality', '80', name+'.jpg'], check=True)
            credits[name] = {'title': p['title'], 'page': ii['descriptionurl'], 'artist': md.get('Artist',{}).get('value',''), 'license': md.get('LicenseShortName',{}).get('value','')}
            print('ok', name, credits[name]['license'])
        except Exception as e: print('FAIL', name, e)
json.dump(credits, open('credits.json','w'), ensure_ascii=False, indent=1)
