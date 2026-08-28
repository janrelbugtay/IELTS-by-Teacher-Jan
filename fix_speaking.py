import re

with open('src/pages/ComputerSpeakingTest.tsx', 'r') as f:
    content = f.read()

# Let's fix the mangled useEffect
# The mangled part is:
bad_code = """      }).catch(err => {
        console.error('Error fetching speaking test:', err);
        setLoadingLobby(false);
      });
      });
      if (isAdmin) {
        setIsLobby(true);
      }
    } else {
      setLoadingLobby(false);
      }).catch(err => {
        console.error('Error fetching speaking test:', err);
        setLoadingLobby(false);
      });"""

good_code = """      }).catch(err => {
        console.error('Error fetching speaking test:', err);
        setLoadingLobby(false);
      });
      if (isAdmin) {
        setIsLobby(true);
      }
    } else {
      setLoadingLobby(false);
    }"""

if bad_code in content:
    content = content.replace(bad_code, good_code)
    with open('src/pages/ComputerSpeakingTest.tsx', 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Not found")

