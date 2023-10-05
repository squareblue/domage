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
  splitClass
} from './domageUtils.js';
import { parseRE, parseTag } from './parseTag.js';
import { dquery } from './dquery.js';

export const ___HTML___ = '___HTML___';
export const HTML = ___HTML___;
const re_HTML = new RegExp(`^\s*${___HTML___}\s*`);

let undef;
let counter = 0;

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
      dataset: _this.dataset,
      data: _this.data,
      text: _this.text,
      ___HTML___: _this.___HTML___,
      append: _this.append,
      on: _this.on
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
   * @param {string|Object|null} css
   * @returns {HTMLElement}
   */
  static style(element, css = {}) {
    if (!css) {
      element.removeAttribute('style');
      return element;
    }
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
   * @param {Object|string|null} [prop]
   * @param {null|string|Function} [value]
   * @returns {string|DOMStringMap|Element}
   *   - returns string value for `prop`, the entire `dataset` object or the element
   */
  static dataset(element, prop, value) {
    if (isElement(element)) {
      try {
        if (value === undef) {
          // Recommended pattern: Domage.data({ foo: 'bar' })
          if (isPlainObject(prop)) {
            for (const [_prop, _value] of Object.entries(prop)) {
              element.dataset[_prop] = Domage.#asValue(_value, element);
            }
            return element;
          }

          if (isString(prop)) {
            return element.dataset[prop]
          }

          if (prop === undef) {
            return element.dataset;
          }
        }
        element.dataset[prop] = Domage.#asValue(value, element);
      }
      catch (e) {
        console.error(`Could not set [data-*] attribute(s).`, e);
      }
    }
    else {
      console.warn(`Not an HTMLElement.`, element);
    }
    return element;
  }
  static data = Domage.dataset;

  dataset(data) {
    if (data === undef) {
      return this.element.dataset;
    }
    if (isString(data)) {
      return this.element.dataset[data];
    }
    if (isPlainObject(data)) {
      for (const [prop, value] of Object.entries(data)) {
        this.element.dataset[prop] = value;
      }
    }
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

    if (isNode(child)) {
      parent.appendChild(child);
      return parent;
    }

    if (child instanceof Domage) {
      parent.appendChild(child.get());
      return parent;
    }

    if (isPlainObject(child)) {
      parent.appendChild(Domage.create(child).get());
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
    while (container.hasChildNodes()) {
      container.removeChild(container.firstChild);
    }
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

  static on(element, events) {
    for (const [eventType, eventHandler] of Object.entries(events)) {
      element.addEventListener(eventType, ...[].concat(eventHandler));
    }
    return element;
  }

  on(events) {
    Domage.on(this.element, events);
    return this;
  }

  static #hasMethod(method) {
    return isFunction(Domage.#fns[method]);
  }

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
      tag = $tag.tag || '';
      props = isPlainObject($tag.props) ? $tag.props : {};
      children = $tag.children || '';
      delete $tag.tag;
      delete $tag.props;
      delete $tag.children;
      // Assign 'leftover' properties from `$tag` to `props`
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
      // Handle $attr shortcut
      if (method.charAt(0) === '$') {
        d$.element.setAttribute(method.slice(1), Domage.#asValue(args[0], d$.element));
        continue;
      }
      // Handle _prop shortcut
      if (method.charAt(0) === '_') {
        d$.element[method.slice(1)] = Domage.#asValue(args[0], d$.element);
        continue;
      }
      // Handle props with defined *instance* methods
      if (Domage.#hasMethod(method)) {
        d$[method](...args);
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

  exe(fn) {
    if (isFunction(fn)) {
      fn(this);
    }
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
 * @returns {Domage|Node|Object}
 */
export function d$(argd, context = document) {
  if (isArray(argd)) {
    return Domage.create(...argd);
  }
  if (isString(argd)) {
    const d$All = dquery(argd, context).all().map(elem => new Domage(elem));
    return {
      all: () => d$All,
      get: (idx) => d$All[idx || 0],
      map: (fn) => d$All.map(fn),
      each: (fn) => d$All.forEach(fn),
      getElement: (idx) => d$All.get(idx || 0)
    }
  }
  if (isPlainObject(argd)) {
    return Domage.create(argd);
  }
  return Domage.create(...arguments);
}

d$.create = Domage.create;
d$.render = Domage.render;

d$.getCount = () => counter;

export default d$;

// Add to `window` object to 'export' globally
window.d$ = window.domage = d$;
