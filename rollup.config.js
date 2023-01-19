// @ts-check

import terser from '@rollup/plugin-terser';
import bundleSize from 'rollup-plugin-bundle-size';
import typescript from 'rollup-plugin-typescript2';

/** @type {import('rollup').RollupOptions} */
const config = {
  input: 'src/microstruct.ts',
  output: [
    { file: 'dist/microstruct.js', format: 'es' },
    { file: 'dist/microstruct.min.cjs', format: 'cjs', plugins: [terser()] },
    { file: 'dist/microstruct.min.js', format: 'es', plugins: [terser()] },
  ],
  plugins: [
    bundleSize(),
    typescript({
      tsconfigOverride: {
        include: ['src'],
        exclude: ['**/*.test.ts'],
        compilerOptions: {
          declaration: true,
          newLine: 'lf',
          removeComments: true,
          module: 'ES2015',
          target: 'ES2016',
        },
      },
    }),
  ],
};

export default config;
