const getFallbackTitle = (id) => {
  const strId = String(id);
  if (!/^\d+$/.test(strId)) return null;
  const numId = parseInt(strId, 10);
  if (!isNaN(numId) && numId >= 1 && numId <= 48) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[Math.ceil(numId / 4) - 1];
    let skill = 'Practice';
    if (numId % 4 === 1) skill = 'Reading';
    if (numId % 4 === 2) skill = 'Listening';
    if (numId % 4 === 3) skill = 'Writing';
    if (numId % 4 === 0) skill = 'Speaking';
    return `${month} ${skill} Practice (IELTS)`;
  }
  return null;
};
console.log(15, getFallbackTitle('15'));
console.log(19, getFallbackTitle('19'));
console.log(23, getFallbackTitle('23'));
