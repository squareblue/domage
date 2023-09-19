// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

// const config = {
//   domage: {
//     name: 'Domage',
//     // Could also be a dictionary or array of multiple entry points
//     entry: resolve(__dirname, './src/domage.js'),
//     // the proper extensions will be added
//     fileName: 'domage',
//     // or... use a specific naming convention(?)
//     // fileName: (format) => `domage.${format}.js`
//   },
//   dquery: {
//     name: 'Dquery',
//     entry: resolve(__dirname, './src/dquery.js'),
//     fileName: 'dquery',
//   },
// };

export default defineConfig({
  build: {
    copyPublicDir: false,
    minify: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: [
        resolve(__dirname, 'main.js'),
        // resolve(__dirname, 'src/domage.js'),
        // resolve(__dirname, 'src/dquery.js')
      ],
      // entry: {
      //   domage: resolve(__dirname, 'src/domage.js'),
      //   dquery: resolve(__dirname, 'src/dquery.js')
      // },
      name: 'domage',
      formats: [
        'es',
        'umd',
        'cjs'
      ],
      // the proper extensions will be added
      // fileName: 'domage',
      // or... use a specific naming convention(?)
      fileName: (format, entry) => `${entry}.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [''],
      input: {
        domage: resolve(__dirname, 'main.js'),
        // domage: resolve(__dirname, 'src/domage.js'),
        // dquery: resolve(__dirname, 'src/dquery.js'),
      },
      output: {
        // exports: 'named',
        // Provide global variables to use in the UMD build
        // for externalized deps
        // globals: {
        //   domage: ['domage', 'd$'],
        //   dquery: ['dquery', 'dq']
        // },
      },
    },
  },
});
