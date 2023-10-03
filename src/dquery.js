import { devmode, isElement, isString } from './domageUtils.js';

//////////////////////////////////////////////////
////////// dquery ////////////////////////////////
//////////////////////////////////////////////////

// Map custom speedy selectors to their functions
const selectorMap = {
  '^/': getElement,
  '$/': getElement,
  '**': getElements,
  '*/': getElements,
  '//': getElements,
  '$$': getElements,
  '#/': getById,
  '..': getByClass,
  '.:': getByClass,
  './': getByClass,
  '</': getByTag,
  '~/': getByTag,
  '?/': getByName,
  '@/': getByAttribute,
};

const selectorPrefixes = Object.keys(selectorMap);
devmode() && console.log('selectorPrefixes', selectorPrefixes);

/**
 * Get the minimum and maximum lengths of the prefix strings (keys) above
 * @type {[number, number]} // Returns tuple of min, max lengths
 */
const prefixLengths = selectorPrefixes.reduce(([min, max], key) => {
  return [
    key.length < min ? key.length : min,
    key.length > max ? key.length : max
  ];
}, [99, -99]);

devmode() && console.log('prefixLengths', prefixLengths);

function slicePrefix(str, len = 2) {
  return {
    selector: str.slice(len),
    prefix: str.slice(0, len)
  };
}

/**
 * Always return an array of selected elements.
 * @param {string} selector
 * @param {Function} [selectFn]
 * @param {string|Element|Document} [context]
 * @returns {*[]}
 */
function selectElements(selector, selectFn, context) {
  // getElement() and getById() always return a single element...
  return (selectFn === getElement || selectFn === getById)
    ? [selectFn(selector, context)]  /* ...so wrap it in an array. */
    : [].concat(selectFn(selector, context))
}

class DQResult {
  constructor(selected) {
    this.selected = selected;
  }
  all() {
    return [].concat(this.selected);
  }
  get(idx) {
    return this.all()[idx || 0];
  }
  each(fn) {
    return this.all().forEach(fn);
  }
  forEach = this.each;
  map(fn) {
    return this.all().map(fn);
  }
}

/**
 * Select DOM elements using optional special syntax.
 * @param {string} selector
 * @param {string|Node|document} [context]
 * @returns {DQResult}
 */
export function dq(selector, context = document) {
  devmode() && console.log('dq', selector);

  // Handle most common case first
  if (isString(selector)) {
    let trimmedSelector = selector.trim();
    const parsed = slicePrefix(trimmedSelector, 2);
    // Use updated selectFn, or if it's still nope(), use getElements instead
    const selected = selectElements(
      parsed.selector,
      selectorMap[parsed.prefix] || getElements,
      context
    );
    // return class instance with methods:
    // `.all()`, `.get()`, `.each()`, and `.map()`
    return new DQResult(selected);
  }

  if (isElement(selector)) {
    return new DQResult([selector]);
  }
}

// Example:
export const selectorExamples = () => {
  // Returns single element with [id="foo-id"]
  // Uses *very* fast .getElementById('foo-id') under the hood.
  const fooId = dq('#/foo-id').get();
  // Returns array of elements with [class="bar-baz"] that are descendents of `fooId`
  // Uses *very* fast .getElementsByClassName('bar-baz') under the hood.
  const barBaz = dq('./bar-baz', fooId).all();
  return { fooId, barBaz };
};

/**
 * Resolve parent element for selecting only its children
 * @param {string|Element|Document} [context]
 * @returns {Element|Document}
 */
function resolveContext(context = document) {
  if (context === document || isElement(context)) {
    return context;
  }
  if (isString(context)) {
    return document.querySelector(context);
  }
  return document;
}
dq.resolveContext = resolveContext;

function getElement(selector, context) {
  if (isElement(selector)) {
    return selector;
  }
  return resolveContext(context).querySelector(selector);
}
dq.getElement = getElement;
dq.query = getElement;
dq.get = getElement;

function getElements(selector, context) {
  return [...resolveContext(context).querySelectorAll(selector)];
}
dq.getElements = getElements;
dq.queryAll = getElements;
dq.getAll = getElements;

function getById(id) {
  return document.getElementById(id);
}
dq.getById = getById;
dq.byId = getById;

function getByClass(className, context) {
  let selector = className.trim();
  let classes = [selector];
  let queryFn = 'getElementsByClassName';
  // Handle selection of elements with multiple class values
  // (either space- or period-separated)
  if (/[\s.]/.test(selector)) {
    classes = selector.split(/\s*[.\s]+\s*/);
    selector = `.${classes.join('.')}`;
    queryFn = 'querySelectorAll';
  }
  // ...maybe just use dq.getElements('.foo.bar.baz')?
  return [...resolveContext(context)[queryFn](selector)];
}
dq.getByClass = getByClass;
dq.byClass = getByClass;

function getByTag(tagName, context) {
  return [...resolveContext(context).getElementsByTagName(tagName)];
}
dq.getByTag = getByTag;
dq.byTag = getByTag;

function getByName(name, context) {
  return [...resolveContext(context).getElementsByName(name)];
}
dq.getByName = getByName;
dq.byName = getByName;

function getByAttribute(attr, context) {
  return [...resolveContext(context).querySelectorAll('[' + attr + ']')];
}
dq.getByAttribute = getByAttribute;
dq.byAttribute = getByAttribute;
dq.byAttr = getByAttribute;

// 'dquery' named export;
export const dquery = dq;

// dq function is default
export default dq;
