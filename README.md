# DOMAGE

<small>DOM damage? _(performance unknown)_</small>

Seemingly stable functionality for creating and selecting actual DOM nodes,
allowing for programmatically creating UI elements on-the-fly. 🤷‍♂️ 
Usage is similar to `React.createElement()` or something like `h` in SolidJS, 
with a few differences/enhancments for convenience, like attribute shorthand for
the tag parameter, and more explicit setting of attributes, properties,
and event listeners (rather than lumping everything together as `props`).

Anatomy of `d$.create()` function parameters:

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

Input `<input>` elements can also use shorthand for `:type` and `?name` attributes:

```js
d$.create(
  'input:text#id.a.b.c?name|value=foo|required'
);
```
```html
<input type="text" id="id" class="a b c" name="name" value="foo" required/>
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

You can call `d$` directly, but you must use an array containing the required
parameters as the single function argument. You can also save a reference to the created instance for later manipulation.

```js
import d$ from 'domage';

// Function params array
const params = [
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
];

// Save a reference
const coolDiv = d$(params);

// Later... add an attribute based on some condition
// using the `.attr()` instance method
if (someCondition) {
  coolDiv.attr({
    'data-thing': 'Stuff'
  });
}

coolDiv.render(document.body);
```
> Generated elements have their own instance methods for manipulating
> the generated element. The functionality and syntax is similar to `jQuery` - 
> like `.attr()`, `.prop()`, `.addClass()` and `.removeClass()`.

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
</p>
</body>
```

