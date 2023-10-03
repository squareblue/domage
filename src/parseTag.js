import { camelCase } from './domageUtils.js';

// Export regular expressions used in this module that other modules may need.
// -----
// Characters that need to be present for a tag to be 'parseable'
export const parseRE = /[:#.?|]/;
// Characters used to indicate a `#document-fragment` should be created
export const fragRE = /^([!#]+|<>|<\/>)/;
// Characters that indicate a new element should be created...
// ...possibly from another library, like: parseTag('<div>');
export const createRE = /^[\s<+=]*|[/>\s]*$/g;
// -----

/**
 * Return a tuple with the tagName and an object containing element attributes.
 * @param {string} tag - tag string with optional attributes
 * @returns {[string, {}]} - returns tuple with tag and attributes object
 *
 * @example parseTag('input:checkbox#foo.bar?baz|title="Select Option"|checked');
 *     -->  ['input', {
 *            type: 'checkbox',
 *            id: 'foo',
 *            'class': 'bar',
 *            name: 'baz',
 *            title: 'Input text',
 *            checked: 'checked'
 *          }];
 *
 * @example Used with a library that creates DOM elements (like `h` from SolidJS or React's non-JSX syntax)
 *          const [tag, attr] = parseTag('input:checkbox#subscribe.ckbx?subscribe|title="Subscribe"|checked');
 *          const { ['class']: className, ...props } = attr;
 *          props.className = props.className || className;
 *          React.createElement(tag, props);
 *     -->  <input type="checkbox" id="subscribe" class="ckbx" name="subscribe" title="Input text" checked />
 *
 * @example Q: Why would something like this be useful?
 *          A: Let's say we're working with a system that uses YAML to generate a DOM tree. 😳
 *             In this example there are arrays of objects used to build the DOM...
 *             ...the properties are tag strings, the values are the 'children'.
 *          ---
 *          - 'main.content':
 *            - 'h2#about.text-xl.mx-2.p-4|title="About"': "About Us"
 *            - 'p.mx-2.p-4': "Here's what we're about..."
 *          (there's a function that processes the above YAML and uses parseTag() to process the property names)
 *     -->  <main class="content">
 *            <h2 id="about" class="text-xl mx-2 p-4" title="About">About Us</h2>
 *            <p class="mx-2 p-4">Here's what we're about...</p>
 *           </main>
 */
export function parseTag(tag = '') {
  // Don't try to handle fragments - they have no attributes.
  if (tag === '' || fragRE.test(tag)) {
    return ['', null];
  }

  if (!parseRE.test(tag)) {
    // Return early if no shorthand values
    return [tag, null];
  }

  let tagName, type, id, classes, name, tagAttrs;

  tagName = tag.replace(createRE, '');

  [tagName, ...tagAttrs] = tagName.split(/\s*[\[\]|]\s*/);
  [tagName, name] = tagName.trim().split('?');
  [tagName, ...classes] = tagName.split('.');
  [tagName, id] = tagName.split('#');
  [tagName, type] = tagName.split(':');

  // Future attributes object
  let attr = null;

  if (tagAttrs.length) {
    attr = {};
    for (const tagAttr of tagAttrs) {
      let [name, value = ''] = tagAttr.split('=');
      // Only handle attributes with a non-empty attribute name
      if (name) {
        attr[name] = value.replace(/^['"]|['"]$/g, '') || name;
      }
    }
  }

  // The `attr` object is *tiny* so making copies shouldn't be a problem
  if (name) attr = { ...attr, name };
  if (classes.length) attr = { ...attr, ['class']: classes.join(' ') };
  if (id) attr = { ...attr, id };
  if (type) attr = { ...attr, type };

  return [tagName, attr];
}

// Default export provided for convenience, but using named exports is preferred.
export default parseTag;

/**
 * Convert 'class' and 'style' attributes to React-friendly props
 * @param {Object} attr - object to make React-friendly
 * @returns {{}} - returns object with 'className' string and 'style' object
 */
export function reactProps(attr) {
  const {
    ['class']: className,
    style,
    ...props
  } = attr;
  if (className || props.className) {
    props.className = props.className || className;
  }
  if (style) {
    props.style = parseStyle(style);
  }
  return props;
}

/**
 * Convert 'style' string to style object
 * @param {string} style - style string to convert to object
 * @returns {{}|*} - returns style object
 */
export function parseStyle(style) {
  if (typeof style === 'string') {
    try {
      return style.split(';').reduce((obj, styleProp) => {
        styleProp = styleProp.trim();
        if (styleProp) {
          let [prop, value] = styleProp.split(':');
          obj[camelCase(prop.trim())] = value.trim();
        }
        return obj;
      }, {});
    } catch (e) {
      console.warn('Could not parse style: ', style);
    }
  } else {
    return style;
  }
}
