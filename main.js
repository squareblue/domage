// What is this tomfoolery?
import d$ from './src/domage.js';
import dq from './src/dquery.js';
export { dq } from './src/dquery.js';
export { d$ } from './src/domage.js';
// add dq to d$ object.
d$.dq = dq;
d$.dquery = dq;
export const dquery = dq;
export default d$;
