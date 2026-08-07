const el = "A. 16th and 17th centuries saw two great pioneers of modern science: Galileo and Gilbert. The impact of their findings is eminent.";
const highlightStr = "16th and 17th centuries saw two great pioneers of modern science...";

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// split by ... and also handle cases where there might be spaces around ...
const parts = highlightStr.split('...');
const escapedParts = parts.map(p => escapeRegExp(p.trim())).filter(p => p.length > 0);
const regexString = escapedParts.join('[\\s\\S]*?');
const regex = new RegExp(`(${regexString})`, 'i');

console.log(regex);
console.log(el.split(regex));
