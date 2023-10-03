/**
 * General utility functions
 */

// Be nothing.
let undef;

// Do nothing.
export const nope = () => null;

const objectString = (obj) => Object.prototype.toString.call(obj);

const oObj = objectString({});
const oArr = objectString([]);
// const oDate = objectString(new Date());
const oFunc = objectString(function () {});
// const oMap = objectString(new Map());
// const oSet = objectString(new Set());

// console.log(oObj);
// console.log(oArr);
// console.log(oDate);
// console.log(oFunc);
// console.log(oMap);
// console.log(oSet);

export function isString(str) {
  return typeof str === 'string';
}

export function isNumber(num) {
  return typeof num === 'number';
}

export function isElement(it) {
  return (
    it && it.nodeType && it.nodeType === Node.ELEMENT_NODE
    || it instanceof Element
  );
}

export function isFragment(it) {
  return (
    it && it.nodeType && it.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    || it instanceof DocumentFragment
  );
}

export function isNode(it) {
  return (
    isElement(it) || isFragment(it) || it instanceof Node
  )
}

export function isTextNode(it) {
  return (
    it != null && it.nodeType && it.nodeType === Node.TEXT_NODE
    || it instanceof Text
  );
}

export function stringable(it) {
  return isString(it) || isNumber(it);
}

export function appendable(it) {
  return stringable(it) || isElement(it) || isFragment(it) || isTextNode(it);
}

export function isPlainObject(obj) {
  return objectString(obj) === oObj;
}

export function isArray(arr) {
  return objectString(arr) === oArr;
}

export function isFunction(fn) {
  return objectString(fn) === oFunc;
}

// Super-simple kebab-case to camelCase converter
export function camelCase(str) {
  return str.replace(/-./g, (match) => match.slice(1).toUpperCase());
}

export function splitClass(className) {
  return [].concat(className).join(' ').trim().split(/\s+/);
}

export function devmode(fn) {
  if (/devmode/i.test(window.location.hash)) {
    if (fn && isFunction(fn)) fn();
    return true;
  }
  return false;
}
