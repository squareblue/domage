import '../main.js';
import { devmode } from '../src/domageUtils.js';

((domage) => {
  const d$ = domage;
  const dq = d$.dq;
  d$.loaded = true;
  console.log(d$);

  const Inner = (children) => d$(['div.inner', { $title: 'Inner Div' }, children]);

  const hdr = d$(
    ['header', [
      Inner([
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

  const output_ = dq('#output').get();

  d$.render(hdr, output_);

  d$.create('h2', 'What is up???').appendTo(output_);
  d$.create('small', 'Nope.').appendTo('id:foo-id');

  dq('//.multi.class')
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

  d$(document.body, {
    style: {
      width: '800px',
      margin: '0 auto',
      padding: '20px 0'
    }
  });

  devmode(() => console.log('Created:', d$.getCount()));

})(window.domage);
