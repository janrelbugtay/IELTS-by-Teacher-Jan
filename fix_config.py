import json

with open('firebase-applet-config.json', 'r') as f:
    config = json.load(f)

config['databaseId'] = "ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e"
config['firestoreDatabaseId'] = "ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e"

with open('firebase-applet-config.json', 'w') as f:
    json.dump(config, f, indent=2)
