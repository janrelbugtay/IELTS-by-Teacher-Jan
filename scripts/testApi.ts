import { readFileSync } from 'fs';
fetch('http://127.0.0.1:3000/api/evaluate-writing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ inputText: 'This is a test of the writing task 2.', taskType: 'task2' })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
