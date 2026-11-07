# runs on GitHub Actions: copies the licensed Unsplash photos into the repo so the page doesn't depend on hotlinks
import urllib.request
UA = {'User-Agent': 'Mozilla/5.0'}
for name, pid, w in [('vitrine','photo-1726950189914-8fe1016eb9c7',1800),('carrot','photo-1607269832078-1a3bd22a306d',1400),
                     ('lemon','photo-1530449595747-4315f4cd454f',1400),('basque','photo-1759303380841-55c09244fd2b',1400)]:
    data = urllib.request.urlopen(urllib.request.Request(f'https://images.unsplash.com/{pid}?w={w}&q=78&fm=jpg&fit=max', headers=UA), timeout=60).read()
    open(name + '.jpg', 'wb').write(data); print('ok', name, len(data))
