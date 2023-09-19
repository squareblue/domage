import d$ from './src/domage.js';
import dq from './src/dquery.js';
export * from './src/dquery.js';
export * from './src/domage.js';
export * from './src/domageUtils.js';
export * from './src/parseTag.js';
// add dq to d$ object.
d$.dq = dq;
d$.dquery = dq;
export const dquery = dq;
export default d$;
