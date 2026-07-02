import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/evaluate-writing-json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputText: 'This is a test response for task 1. It is short but should be enough.',
      taskType: '1',
      rawPrompt: 'Write a short test response.'
    })
  });
  console.log(res.status);
  const text = await res.text();
  console.log(text);
}

test();
