
import json

with open('../../../workspace.json') as f:
  data = json.load(f)

for key in data['projects']:
  if(data['projects'][key]['architect']['lint']):
    print('nx run %s:lint' % key)