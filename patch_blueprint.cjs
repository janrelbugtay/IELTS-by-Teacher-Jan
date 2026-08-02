const fs = require('fs');
let data = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf8'));

data.entities.TestSetting = {
  "title": "TestSetting",
  "description": "Visibility settings for tests",
  "type": "object",
  "properties": {
    "isPublished": { "type": "boolean" }
  },
  "required": []
};

data.firestore["/test_settings/{testId}"] = {
  "schema": { "$ref": "#/entities/TestSetting" },
  "description": "Settings for test visibility"
};

fs.writeFileSync('firebase-blueprint.json', JSON.stringify(data, null, 2));
console.log('Patched blueprint');
