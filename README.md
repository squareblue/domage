# DOMAGE

<small>DOM damage? _(performance unknown)_</small>

Basic functionality for creating and selecting actual DOM nodes,
allowing for programmatically creating and modifying UI elements on-the-fly.
Usage is similar to `React.createElement()` or something like `h` in SolidJS, 
with a few differences/enhancments for convenience, like attribute shorthand for
the tag parameter, and more explicit _(delcarative?)_ setting of attributes, properties,
data attributes, and event listeners (rather than lumping everything together as `props`).

Basic anatomy of `d$.create()` function parameters:

```js
// Define the parameters:
const args = [
  // Tag string (shown with shorthand syntax)
  'tag#id.a.b.c|attr=X|etc=values|required',
  // 'Props' object
  { attr: { foo: 'A' }, $bar: 1, _baz: 'C' },
  // Children containing parameter arrays, elements, or strings...
  [
    ['p.child', 'Child paragraph.'], 
    ['hr'],
    'Text node.'
  ]
];
// Render to the <body> 
// You can *append* to an existing DOM node:
d$.create(...args).appendTo(document.body);
// Or use .render() method to *replace* all child elements of target:
d$.create(...args).render(document.body);
```

[//]: # (> Notice the nested arrays above. The outer array is the container for _all_ children)
[//]: # (> of the created element and each inner array item defines a separate child element)
[//]: # (> and/or text node _&#40;inserting an HTML string is possible using an object or special prefix&#41;_.)

```html
<body>
<tag id="id" class="a b c" attr="X" etc="values" required foo="A" bar="1">
    <p class="child">Child paragraph.</p>
    <hr>
</tag>
</body>
```

A more complex example:

```js
// For non-input elements, using shorthand syntax
d$.create(
  // First parameter: tag with optional attribute shorthand
  'tag#id.a.b.c|attr=value|etc=values|required',
  
  // Second parameter: a config object
  { 
    // Uses .setAttribute() explicitly
    attr: {
      attrName: 'attrValue'
    },
    // Sets a property value directly on the element
    prop: {
      propName: 'propValue'
    },
    // Prefix with '$' to set attribute value
    $attr: 'value', 
    // Prefix with '_' to directly set an element property
    _prop: 'value',
    // Special handling for some options, like 'className' and 'style'
    className: 'a b c',
    style: { 
      display: 'block'
    },
    data: {
      // Adds [data-foo-bar="baz"] attribute
      fooBar: 'baz'
    }
    // TODO: event handlers using syntax like
    //  `on: { event: doSomething }` 
    //  or `on: [['event', doSomething, {options}]]
    //  or `onevent: doSomething`
  },
  
  // Third parameter: child element(s) or text/html content
  [
    'Text content wandering inside the parent.',
    ['p.child', 'Child paragraph'],
    ['p.child', [
      'Another child paragraph with a <ul>',
      ['ul', [
        ['li', 'A'],
        ['li', 'B'],
        ['li', 'C'],
      ]],
      'More text after the <ul>',
      ['br'], // insert <br>
      '___HTML___' + `<i>Use '___HTML___' prefix for actual HTML content</i>`
    ]]
  ]
);
```

Form elements like `<input>`, `<select>` and `<textarea>` can also use 
shorthand for `:type` and `?name` attributes. The example below uses
these shortcuts along with a component-style pattern that may look
slightly similar to patterns used in modern component-based frameworks/libraries.

```js
const _SomeForm_ = (children) => d$.create('form#some-form', children);

const _Input_ = () => d$.create(
  'input:text#id.a.b.c?name|value=foo|required'
);

const _Option_ = ({ value, ...other }, children) => d$.create(
  'option',
  { attr: { value }, ...other },
  children || value
);

const _Select_ = () => d$.create(
  'select?country|value=United States|required',
  [
    // quotes are optional for attribute values
    // boolean attributes like 'selected' use their name as the value
    ['option|value=United States|selected'],
    // double-quotes are allowed
    [`option|value="Canada"`],
    // single-quotes are allowed
    [`option|value='Mexico'`],
    // *values* with quotation marks *must* have outer quotes 
    // ...using standard syntax for nested quotes
    [`option|value="'etc...'"`],
    // using component-style pattern w/chained instance method
    _Option_({ value: 'United Kingdom' }).text('UK') // .text() will overwrite textContent
  ]
);

d$.render(_SomeForm_([
  _Input_(),
  _Select_()
]), '#form-container');
```
```html
<div id="form-container">
    <form id="some-form">
        <input type="text" id="id" class="a b c" name="name" value="foo" required />
        <select name="country" required>
            <!-- textContent falls back to 'value' -->
            <option value="United States" selected="selected">United States</option>
            <option value="Canada">Canada</option>
            <option value="Mexico">Mexico</option>
            <!-- inner quotes are preserved -->
            <option value="'etc...'">'etc...'</option>
        </select>
    </form>
</div>
```

Most basic usage example:

```js
import { d$, dq } from 'domage';

d$.create('a#ur-link.pretty-link|href=/path/to/page', 'Click Me!')
  .render(dq.getById('parent-element'));
```
```html
<div id="parent-element">
    <a id="ur-link" class="pretty-link" href="/path/to/page">Click Me!</a>
</div>
```

You can call `d$()` directly, rather than `d$.create()`, to create a new element/tree, 
but you must use an array containing the required parameters as the single function 
argument. You can also save a reference to the created instance for later manipulation.

> Generated elements have their own chainable instance methods for manipulating
> the generated element. The functionality and syntax is similar to `jQuery` -
> like `.attr({})`, `.prop({})`, `.addClass('')`, `.removeClass('')`,
> and `.data({})` (or `.dataset({})`). You can also append child elements or
> parameter arrays using the `.append()` method, even after the parent has been 
> instantiated and inserted into the DOM.

```js
import d$ from 'domage';

// Use a parameter array and save a reference to the instance
const coolP = d$([
  // shorthand for adding id, class and title attributes
  'p#thing.is.cool|title=Cool Thing',
  // add an attribute using the '$' prefix
  { '$data-id': 102938 },
  // Contents/children
  [
    'Something is cool',
    ['ul', [
      ['li', 'A'],
      ['li', 'B'],
      ['li', 'C']
    ]]
  ]
]);

// Later... add a [data-*] attribute based on some condition
// using the `.data({})` instance method
if (someCondition) {
  coolP.data({
    'thing': 'Stuff'
  });
}

// Write the <p> to the DOM (it will be updated below)
coolP.render(document.body);

// Define the element to be appended as a parameter array:
const itsCoolParams = ['div.its-all-cool', [
  ['i', 'Loading...'] // Initial content
]];

const coolLoadDiv = d$(itsCoolParams);

// Insert coolLoadDiv into coolP
coolP.append(coolLoadDiv);

// Render after a timeout or async function call
(async () => {
  const resp = await fetch('/some/data/url');
  const txt = await resp.text();
  if (txt === 'cool') {
    setTimeout(() => {
      // Replace contents of `coolLoadDiv` after loading and timeout
      coolLoadDiv.replace(['b', "It's cool!!!"]);
    }, 1000);
  }
})();
```
```html
<body>
<p id="thing" class="is cool" title="Cool Thing" data-id="102938" data-thing="Stuff">
    Something is cool
    <ul>
        <li>A</li>
        <li>B</li>
        <li>C</li>
    </ul>
    <div class="its-all-cool">
        <!-- before -->
        <i>Loading...</i>
        <!-- after -->
        <b>It's cool!!!</b>
    </div>
</p>
</body>
```

