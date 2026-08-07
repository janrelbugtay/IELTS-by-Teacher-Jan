const el = "A. Apple and banana and apple and orange.";
const highlightStr = "apple";

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parts = highlightStr.split('...');
const escapedParts = parts.map(p => escapeRegExp(p.trim())).filter(p => p.length > 0);
const regexString = escapedParts.join('[\\s\\S]*?');
const regex = new RegExp(`(${regexString})`, 'i');

console.log(el.split(regex));
