with open('server.ts', 'r') as f:
    content = f.read()

bad = "const url = `https://drive.google.com/uc?export=download&id=${id}`;"
good = "const url = `https://drive.google.com/uc?export=download&id=${id}&confirm=t`;"

if bad in content:
    content = content.replace(bad, good)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched server.ts")
else:
    print("Not found")
