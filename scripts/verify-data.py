import urllib.request, json, time, sys

BASE = 'http://localhost:3000'

def req(path, method='GET', data=None, token=None):
    url = f'{BASE}{path}'
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    body = json.dumps(data).encode() if data else None
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f'  ERROR: {e}', file=sys.stderr)
        return None

# Login as admin
print('Login admin...')
d = req('/api/auth/login', 'POST', {'email': 'admin@astral.family', 'password': 'admin123'})
if not d:
    print('FAIL: Cannot login')
    sys.exit(1)
token = d['token']
print(f'  OK: {d["user"]["name"]} ({d["user"]["role"]})')

# Get profiles
time.sleep(2)
print('\nCARTAS ASTRALES:')
d = req('/api/profiles', token=token)
if d and 'profiles' in d:
    for p in d['profiles']:
        sun = next((pp['sign'] for pp in p.get('planetaryPositions',[]) if pp['body']=='Sun'), '?')
        moon = next((pp['sign'] for pp in p.get('planetaryPositions',[]) if pp['body']=='Moon'), '?')
        asc = next((cp['sign'] for cp in p.get('chartPoints',[]) if cp['point']=='Ascendant'), '?')
        npp = len(p.get('planetaryPositions', []))
        nasp = len(p.get('aspects', []))
        print(f'  {p["name"]:20s} | {p["birthDate"]} | Sol: {sun:10s} | Luna: {moon:10s} | Asc: {asc:10s} | Planetas: {npp} | Aspectos: {nasp}')
else:
    print(f'  No profiles or error: {d}')

# Get invitations
time.sleep(2)
print('\nINVITACIONES:')
d = req('/api/invitations', token=token)
if d and 'invitations' in d:
    for i in d['invitations']:
        print(f'  {i["code"]:25s} | Usos: {i["currentUses"]}/{i["maxUses"]} | Activa: {i["isActive"]}')

# Test member logins
print('\nLOGIN MIEMBROS:')
for name in ['carlos','sofia','diego','valentina','andres','gabriela','miguel','isabella','roberto','daniela','alejandro','camila','sebastian']:
    time.sleep(0.5)
    d = req('/api/auth/login', 'POST', {'email': f'{name}@astral.family', 'password': 'familia2024'})
    if d and 'user' in d:
        print(f'  {name}@astral.family -> {d["user"]["name"]} ({d["user"]["role"]})')
    else:
        print(f'  {name}@astral.family -> FAIL: {d}')

print('\nVerificacion completa!')
