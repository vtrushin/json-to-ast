import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { list as babelHelpersList } from 'babel-helpers';

export default {
	input: 'index.js',
	name: 'jsonToAst',
	output: {
		file: 'build.js',
		format: 'umd'
	},
	plugins: [
		commonjs(),
		resolve(),
		babel({
			exclude: 'node_modules/**',
			presets: [
				['es2015', {
					modules: false
				}],
				'stage-3'
			],
			plugins: [
				'external-helpers',
				'transform-object-assign'
			],
			// fixing temporary rollup's regression, remove when https://github.com/rollup/rollup/issues/1595 gets solved
			externalHelpersWhitelist: babelHelpersList.filter(helperName => helperName !== 'asyncGenerator'),
		})
	],
	watch: {
		include: 'lib/*.js',
		exclude: 'node_modules/**'
	}
}
