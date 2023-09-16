import { devmode, isElement, nope } from './domageUtils.js';

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

function slicePrefix(selector, prefixLength) {
  const sliceAt = (-selector.length + prefixLength);
  const prefix = selector.slice(0, sliceAt);
  const value = selector.slice(sliceAt);
  return {
    selector: value.trim(),
    prefix: prefix
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

function dqResult(selected) {
  return {
    all: () => selected,
    get: (idx) => selected[idx || 0],
    exe: (fn) => fn(selected)
  };
}

/**
 * Select DOM elements using optional special syntax.
 * @param {string} selector
 * @param {string|Node|document} [context]
 * @returns {*}
 */
export function dq(selector, context = document) {
  devmode() && console.log('dq', selector);
  if (isElement(selector)) {
    return dqResult([selector]);
  }
  // let [prefixMin, prefixMax] = prefixLengths;
  let selectFn = nope;
  let trimmedSelector = selector.trim();
  let parsedSelector = trimmedSelector;
  // while (prefixMax >= prefixMin && selectFn === nope) {
    const parsed = slicePrefix(trimmedSelector, 2);
    if (selectorMap[parsed.prefix]) {
      parsedSelector = parsed.selector;
      selectFn = selectorMap[parsed.prefix];
    }
    // prefixMax--;
  // }
  // Use updated selectFn, or if it's still nope(), use getElements instead
  const selected = selectElements(
    parsedSelector,
    (selectFn !== nope) ? selectFn : getElements,
    context
  );
  // return object with `.all()`, `.get()`, and `.exe()` methods
  // TODO: use class instead so we can have an .update() function
  //  that pushes the new items into the `selected` array.
  //  class DQ { all; get; exe; refresh; }
  return dqResult(selected);
}

// Example:
export const selectorExamples = () => {
  // Returns single element with [id="foo-id"]
  // Uses *very* fast .getElementById('foo-id') under the hood.
  const fooId = dq('#/foo-id').get();
  // Returns array of elements with [class="bar-baz"] that are descendents of `fooId`
  // Uses *very* fast .getElementsByClassName('bar-baz') under the hood.
  const barBaz = dq('./bar-baz', fooId).all();
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
