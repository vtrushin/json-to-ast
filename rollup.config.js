import babel from 'rollup-plugin-babel';

export default {
	input: 'lib/index.js',
	name: 'jsonToAst',
	output: {
		file: 'build.js',
		format: 'umd'
	},
	plugins: [
		babel({
			exclude: 'node_modules/**'
		})
	],
	watch: {
		include: 'lib/*.js',
		exclude: 'node_modules/**'
	}
}
