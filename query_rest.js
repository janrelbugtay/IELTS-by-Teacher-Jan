import https from 'https';

https.get('https://firestore.googleapis.com/v1/projects/ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e/databases/(default)/documents/submissions', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const json = JSON.parse(data);
    if (!json.documents) {
        console.log("No documents or error:", json);
        return;
    }
    json.documents.forEach(doc => {
        const fields = doc.fields;
        if (fields && fields.assignmentType && fields.assignmentType.stringValue === 'writing') {
            console.log("ID:", doc.name.split('/').pop());
            console.log("assignmentId:", fields.assignmentId ? fields.assignmentId.stringValue : 'none');
            console.log("assignmentTitle:", fields.assignmentTitle ? fields.assignmentTitle.stringValue : 'none');
            console.log("createdAt:", fields.createdAt?.timestampValue || 'none');
        }
    });
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
