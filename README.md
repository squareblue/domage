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
  'tag#id.a.b.c|attr=X|etc=values|required',
  { attr: { foo: 'A' }, $bar: 1, _prop: 'C' },
  // Note nested array for children...
  [
    ['p.child', 'Child paragraph.'], 
    ['hr']
  ]
];
// Render to the <body> 
// .render() method *replaces* all child elements of target:
d$.create(...args).render(document.body);
// You can also *append* to an existing DOM node:
d$.create(...args).appendTo(document.body);
```

> Notice the 'nested' array syntax above. The outer array is the container for _all_
> of the children for the current element, the inner arrays define the child elements
> and/or text nodes _(inserting an HTML string is possible using a special prefix)_.

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
    // Sets a property directly on the element
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
shorthand for `:type` and `?name` attributes.

```js
const input = d$.create(
  'input:text#id.a.b.c?name|value=foo|required'
);
const select = d$.create(
  'select?country|value=United States|required',
  [
    // quotes are optional for attribute values
    // boolean attributes use their name as the value
    ['option|value=United States|selected'],
    // double-quotes are allowed
    [`option|value="Canada"`],
    // single-quotes are allowed
    [`option|value='Mexico'`],
    // *values* with quotation marks *must* have outer quotes 
    // ...using proper syntax for nested quotes
    [`option|value="'etc...'"`] 
  ]
);
```
```html
<input type="text" id="id" class="a b c" name="name" value="foo" required/>
<select name="country" required>
    <!-- textContent falls back to 'value' -->
    <option value="United States" selected="selected">United States</option>
    <option value="Canada">Canada</option>
    <option value="Mexico">Mexico</option>
    <!-- inner quotes are preserved -->
    <option value="'etc...'">'etc...'</option>
</select>
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

```js
import d$ from 'domage';

// Use an array with the paramaters, and save a reference to the instance
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

// Later... add an attribute based on some condition
// using the `.attr()` instance method
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

> Generated elements have their own chainable instance methods for manipulating
> the generated element. The functionality and syntax is similar to `jQuery` - 
> like `.attr({})`, `.prop({})`, `.addClass('')`, `.removeClass('')`, 
> and `.data({})` (or `.dataset({})`). You can also append child elements or
> parameter arrays after the parent has been instantiated and inserted into the DOM.

Will generate the HTML below (if `someCondition` is `true`):

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

