const fc = {
  nodes: [
    { id: '1', text: 'Gigartina\n(also called as {7})', row: 0, col: 1 },
    { id: '2', text: '{8}', row: 2, col: 1 },
    { id: '3', text: '{9}\ncanned or bottled food', row: 4, col: 0 },
    { id: '4', text: 'medicine\n(e.g. {10})\ntoothpaste\nothers', row: 4, col: 2 }
  ],
  edges: [
    { from: '1', to: '2', label: 'made into' },
    { from: '2', to: '3' },
    { from: '2', to: '4' }
  ]
};
