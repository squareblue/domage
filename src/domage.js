import {
  appendable,
  devmode,
  isArray,
  isElement,
  isFragment,
  isFunction,
  isNode,
  isPlainObject,
  isString,
  nope,
  splitClass
} from './domageUtils.js';
import { parseRE, parseTag } from './parseTag.js';

export const ___HTML___ = '___HTML___';
const re_HTML = new RegExp(`^\s*${___HTML___}\s*`);

let counter = 0;

export class Domage {
  tag = '';
  props = {};
  children = [];
  element = null;
  fragment = null;

  static #fns = {};

  constructor(tag = '', props = {}, children = '') {
    const _this = this; // ensure proper scope?

    this.tag = tag;
    this.props = props;
    this.children = children;

    // Keep track of callable 'props' methods
    Object.assign(Domage.#fns, {
      attr: _this.attr,
      prop: _this.prop,
      style: _this.style,
      css: _this.css,
      className: _this.className,
      text: _this.text,
      ___HTML___: _this.___HTML___,
      append: _this.append,
    });

    if (isElement(tag)) {
      this.element = tag;
    } else if (tag instanceof Domage) {
      // this.element = tag.element;
      // this.fragment = tag.fragment;
      Object.assign(this, tag);
    } else if (isFragment(tag)) {
      this.fragment = tag;
    } else if (!this.tag) {
      this.fragment = document.createDocumentFragment();
    } else {
      this.element = document.createElement(this.tag);
    }
  }

  /**
   * If `value` is a function, execute and use its return value,
   * otherwise use `value` directly.
   * @param {Function|*} value
   * @param {Node} [element]
   * @returns {*}
   * @private
   */
  static #asValue(value, element) {
    return (
      typeof value === 'function'
        ? value(element)
        : value
    );
  }

  /**
   * Set attribute values from `obj`
   * @param {Element} element
   * @param {Object} obj
   * @returns {Element}
   */
  static attr(element, obj = {}) {
    if (isElement(element)) {
      for (const [name, value] of Object.entries(obj)) {
        try {
          element.setAttribute(name, String(Domage.#asValue(value, element)));
        } catch (e) {
          console.error(`Error setting attribute '${name}' to value ${value}.\n`, e);
        }
      }
    } else {
      console.warn(`Can only set attributes on elements.`);
    }
    return element;
  }

  attr(obj = {}) {
    this.element = Domage.attr(this.element, obj);
    return this;
  }

  /**
   * Assign property values from `obj`
   * @param {Element} element
   * @param {Object} obj
   * @returns {Element}
   */
  static prop(element, obj = {}) {
    if (isElement(element)) {
      for (const [prop, value] of Object.entries(obj)) {
        try {
          element[prop] = Domage.#asValue(value, element);
        } catch (e) {
          console.error(`Error setting property '${prop}' to value '${value}'.\n`, e);
        }
      }
    } else {
      console.warn(`Not an Element.`, element);
    }
    return element;
  }

  prop(obj = {}) {
    this.element = Domage.prop(this.element, obj);
    return this;
  }

  /**
   * Handle style as an attribute string or object
   * @param {HTMLElement} element
   * @param {string|Object} css
   * @returns {HTMLElement}
   */
  static style(element, css = {}) {
    if (isElement(element)) {
      try {
        if (isString(css)) {
          element.setAttribute('style', css);
        } else {
          for (const [prop, value] of Object.entries(css)) {
            element.style[prop] = Domage.#asValue(value, element);
          }
        }
      } catch (e) {
        console.error(`Could not set element style.\n`, e);
      }
    } else {
      console.warn(`Not an HTMLElement.`, element);
    }
    return element;
  }
  // alias to `css` instance method
  static css = Domage.style;

  style(css = {}) {
    this.element = Domage.style(this.element, css);
    return this;
  }
  css = this.style;

  /**
   * Add className to element
   * @param {HTMLElement} element
   * @param {string|Function} cls
   * @returns {HTMLElement}
   */
  static className(element, cls) {
    element.className = Domage.#asValue(cls, element);
    return element;
  }

  className(cls) {
    this.element = Domage.className(this.element, cls);
    return this;
  }

  addClass(cls) {
    splitClass(cls).forEach(className => {
      this.element && this.element.classList.add(className);
    });
  }

  removeClass(cls) {
    splitClass(cls).forEach(className => {
      this.element && this.element.classList.remove(className);
    });
  }

  /**
   * Add [data-*] attributes to element (using `dataset` property)
   * @param {HTMLElement} element
   * @param {Object|Function} dataObj
   * @returns {*}
   */
  static dataset(element, dataObj = {}) {
    if (isElement(element)) {
      let obj = isFunction(dataObj)
        ? dataObj(element)
        : dataObj;

      if (!isPlainObject(obj)) {
        // Return early if we're not working with an object
        console.warn('Not an object.', obj);
        return element;
      }

      try {
        for (const [prop, value] of Object.entries(dataObj)) {
          element.dataset[prop] = Domage.#asValue(value, element);
        }
      } catch (e) {
        console.error(`Could not set [data-*] attribute(s).`, e);
      }
    }
    else {
      console.warn(`Not an HTMLElement.`, element);
    }
    return element;
  }
  static data = Domage.dataset;

  dataset(dataObj) {
    this.element = Domage.dataset(this.element, dataObj);
    return this;
  }
  data = this.dataset;

  /**
   * Get or set the `textContent` of an element
   * @param {Element|DocumentFragment} container
   * @param {string|*} txt
   * @returns {Element|DocumentFragment|string|*}
   */
  static text(container, txt = '') {
    if (typeof txt !== 'string') {
      return container.textContent;
    }
    container.textContent = String(Domage.#asValue(txt, container));
    return container;
  }

  text(txt = '') {
    Domage.text(this.get(), txt);
    return this;
  }

  /**
   *
   * @param container
   * @param html
   * @returns {*}
   * @private
   */
  static ___HTML___(container, html) {
    let tmpl = document.createElement('template');
    tmpl.insertAdjacentHTML('afterbegin', html);
    while (tmpl.firstChild) {
      container.appendChild(tmpl.firstChild);
    }
    tmpl = null;
    return container;
  }

  ___HTML___(html) {
    Domage.___HTML___(this.get(), html);
    return this;
  }

  static append(parent, child) {
    if (isArray(child)) {
      if (child.length) {
        parent.appendChild(Domage.create(...child).get());
      }
      return parent;
    }

    if (/string|number/.test(typeof child)) {
      const childString = String(child);
      if (!childString.length) {
        return this;
      }
      if (re_HTML.test(childString)) {
        Domage.___HTML___(parent, childString.replace(re_HTML, ''));
      }
        // else if (regex___FRAG.test(childString)) {
        //   this.appendText(childString.replace(regex___FRAG, ''));
      // }
      else {
        parent.append(childString);
      }
      return parent;
    }

    if (isPlainObject(child)) {
      parent.appendChild(Domage.create(child).get());
      return parent;
    }

    if (isNode(child)) {
      parent.appendChild(child);
      return parent;
    }

    if (child instanceof Domage) {
      parent.appendChild(child.get());
      return parent;
    }

    // try {
    //   parent.appendChild(Domage.create(child).get());
    //   return parent;
    // } catch (e) {
    //   console.warn('Could not append:\n', child);
    // }

  }

  append(child) {
    Domage.append(this.get(), child);
    return this;
  }

  static empty(container) {
    Domage.___HTML___(container, '');
    return container;
  }

  empty() {
    Domage.empty(this.get());
    return this;
  }

  static replace(container, children){
    Domage.empty(container);
    Domage.append(container, children);
    return container;
  }
  static replaceChildren = Domage.replace;

  replace(children) {
    this.empty();
    this.append(children);
    return this;
  }
  replaceChildren = this.replace;

  static #hasMethod(method) {
    return isFunction(Domage.#fns[method]);
  }

  /**
   * Types
   * @typedef {{
   *    tag: string,
   *    props: Object|Children,
   *    children: Children,
   *    [k: string]: *
   *  }} TagObject
   * @typedef {TagArg|TagArg[]} TagArgs
   * @typedef {string|TagArgs|TagObject} TagArg
   * @typedef {DomageArgs[]|Node|string|number|Domage|Children[]} Children
   * @typedef {[string, Object, Children]} DomageArgs
   */

  /**
   * Main element creation static method
   * @param {TagArg} $tag
   * @param {Object|Children} [$props]
   * @param {Children} [$children]
   * @returns {Domage}
   */
  static create($tag = '', $props = {}, $children = '') {
    let tag = $tag;
    let props = $props;
    let children = $children;

    devmode(() => {
      console.log('Domage.create()');
      counter += 1;
    });

    if (isArray($tag)) {
      [tag, props = {}, children = ''] = $tag;
    } else if (isPlainObject($tag)) {
      (tag = $tag.tag || '') && delete $tag.tag;
      (props = isPlainObject($tag.props) ? $tag.props : {}) && delete $tag.props;
      (children = $tag.children || '') && delete $tag.children;
      // Assign 'leftover' properties to `props`
      Object.assign(props, $tag);
    }

    devmode() && console.log('tag', tag || '#document-fragment');

    // `props` argument could actually be `children`
    if (isArray(props) || appendable(props)) {
      children = props;
      props = {};
    }

    let attr;

    // Pull out attribute 'shortcuts'
    if (isString(tag) && parseRE.test(tag)) {
      [tag, attr] = parseTag(tag);
    }

    if (props.attr || attr) {
      props.attr = {
        ...attr,
        ...props.attr
      };
    }

    // console.log('tag', tag);
    // console.log('props', props);
    // console.log('children', children);

    const d$ = new Domage(tag, props, children);

    for (let [method, ...args] of Object.entries(props)) {
      // Handle props with defined methods
      if (Domage.#hasMethod(method)) {
        d$[method](...args);
        continue;
      }
      // Handle $attr shortcut
      if (method.startsWith('$')) {
        d$.attr({
          [method.slice(1)]: args
        });
        continue;
      }
      // Handle _prop shortcut
      if (method.startsWith('_')) {
        d$.prop({
          [method.slice(1)]: args
        });
      }
    }

    if (children) {
      for (const child of [].concat(children)) {
        if (child) d$.append(child);
      }
    }

    return d$;
  }

  static render(toRender, container) {
    const renderTarget = (
      isNode(container)
        ? container
        : dquery(container).get()
    );

    if (toRender instanceof Domage) {
      renderTarget.replaceChildren(toRender.get());
    } else {
      renderTarget.replaceChildren(toRender);
    }

    // Domage.empty(renderTarget);
    // Domage.append(renderTarget, toRender);

    return renderTarget;
  }
  static renderTo = Domage.render;

  render(container) {
    Domage.render((this.element || this.fragment), container);
    return this;
  }
  renderTo = this.render;

  appendTo(container) {
    const toRender = this.get();
    if (isNode(container)) {
      container.append(toRender);
      return this;
    } else if (container instanceof Domage) {
      container.get().appendChild(toRender);
    } else {
      dquery(container).get().appendChild(toRender);
    }
    return this;
  }

  get() {
    return this.element || this.fragment;
  }

  // end Domage
}

/**
 * Main exposed function.
 * @param {string|[string, Object|Children, Children]|Object} argd
 * @param {string|Node|document} [context]
 * @returns {Domage|Node}
 */
export function d$(argd, context = document) {
  if (isArray(argd)) {
    return Domage.create(...argd);
  }
  if (isString(argd)) {
    return dquery(argd, context).get();
  }
  if (isPlainObject(argd)) {
    return Domage.create(argd);
  }
  return Domage.create(...arguments);
}

d$.create = Domage.create;
d$.render = Domage.render;

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
  'id:': getById,
  '#/': getById,
  'class:': getByClass,
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
  let [prefixMin, prefixMax] = prefixLengths;
  let selectFn = nope;
  let trimmedSelector = selector.trim();
  let parsedSelector = trimmedSelector;
  while (prefixMax >= prefixMin && selectFn === nope) {
    const parsed = slicePrefix(trimmedSelector, prefixMax);
    if (selectorMap[parsed.prefix]) {
      parsedSelector = parsed.selector;
      selectFn = selectorMap[parsed.prefix];
    }
    prefixMax--;
  }
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

d$.dq = dq;
d$.dquery = dq;

d$.getCount = () => counter;

export const dquery = dq;
export default d$;

// Add to `window` object to 'export' globally
window.d$ = window.domage = d$;
