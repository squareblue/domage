import '../../main.js';
import { devmode } from '../../src/domageUtils.js';

((domage) => {
  const d$ = domage;
  const dq = d$.dq;
  d$.loaded = true;
  console.log(d$);

  const _Inner_ = (children) => d$(['div.inner', { $title: 'Inner Div' }, children]);

  const hdr = d$(
    ['header', [
      _Inner_([
        ['h1', 'Hello world!'],
        ['p', [
          ['small', [
            'What do you want?',
            ' ',
            ['i', 'Nothing???']
          ]],
        ]],
        ['hr'],
        { ___HTML___: 'Some <i>html</i> for the thing?' },
        ['ul#foo-bar-baz', [
          ['li.foo', 'Foo'],
          ['li.bar', 'Bar'],
          ['li.baz', 'Baz'],
        ]]
      ])
    ]]
  );

  console.log(hdr.get());

  const output_ = d$('#output').get();

  d$.render(hdr, output_.get());

  output_.append(['h2', 'What is up???']);

  d$('#/foo-id').get().append(['small', 'Nope.'])

  // d$.create('h2', 'What is up???').appendTo(output_.get());
  // d$.create('small', 'Nope.').appendTo('id:foo-id');

  dq('./multi class')
    .get()
    .insertAdjacentHTML('afterbegin', '<h2>Multi Class</h2>');

  const multiClass = dq('..multi.class').get();

  const multiClassD = d$(multiClass);
  multiClassD.addClass('bogus');
  multiClassD.append('___HTML___' +
    '<b><i>Bold *and* italic.</i></b>'
  ).style({
    color: 'cornflowerblue'
  }).style({
    fontSize: '0.8rem'
  });

  // Calling the .style() instance method will
  // *add* style properties to the created element.
  multiClassD.style({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between'
  });

  // Pass falsey value to remove all inline styles
  // multiClassD.css(false);

  d$(document.body, {
    style: {
      width: '800px',
      margin: '0 auto',
      padding: '20px 0'
    },
    append: [
      ['textarea#big-text?bigText|rows=20|style=width:100%', [
        `Just a bunch of text in a <textarea> thingy.`
      ]]
    ]
  });

  d$(document.body).append([
    ['h2', 'H2 Heading']
  ])

  devmode(() => console.log('Created:', d$.getCount()));

  function doPerf(label, fn) {
    let count = 50_000;
    let i = 0;
    const start = performance.now();
    let magic = true;
    const results = [];
    while (count > i++) {
      results.push(fn());
      magic = !magic;
    }
    const end = performance.now();
    console.log(`${label} performance:`, end - start);
    return results;
  }

  domage.perf = {
    docAll: (selector) => doPerf('docAll', () => [... document.querySelectorAll(selector)]),
    docQuery: (selector) => doPerf('docQuery', () => document.querySelector(selector)),

    docById: (id) => doPerf('docById', () => document.getElementById(id)),
    docByClass: (className) => doPerf('docByClass', () => [...document.getElementsByClassName(className)]),
    docByTag: (tag) => doPerf('docByTag', () => [...document.getElementsByTagName(tag)]),
    docByName: (name) => doPerf('docByName', () => [...document.getElementsByName(name)]),

    dqById: (id) => doPerf('dqById', () => dq.getById(id)),
    dqByClass: (className) => doPerf('dqByClass', () => dq.getByClass(className)),
    dqByTag: (tag) => doPerf('dqByTag', () => dq.getByTag(tag)),
    dqByName: (name) => doPerf('dqByName', () => dq.getByName(name)),

    dq: (selector) => doPerf('dq', () => dq(selector).all()),
    d$: (selector) => doPerf('d$', () => d$(selector))
  }

})(window.domage);
