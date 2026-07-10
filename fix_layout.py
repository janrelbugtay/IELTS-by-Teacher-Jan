with open("src/components/Layout.tsx", "r") as f:
    content = f.read()
    
target = """  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then((docSnap) => {
        if (docSnap.exists() && docSnap.data().course) {
          setUserCourse(docSnap.data().course);
        }
      }).catch(() => {});
    }
  }, [user]);"""

content = content.replace(target, "")
with open("src/components/Layout.tsx", "w") as f:
    f.write(content)
