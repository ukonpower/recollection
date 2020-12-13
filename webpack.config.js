const path = require( 'path' );

module.exports = {
	watch: true,
	entry: {
	},
	output: {
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				loader: 'ts-loader',
			},
			{
				test: /\.(vs|fs|glsl)$/,
				exclude: /node_modules/,
				use: [
					'raw-loader',
					{
						loader: 'glslify-loader',
						options: {
							transform: [
								[ 'glslify-hex' ],
								[ 'glslify-import' ]
							],
							basedir: './src/glsl'
						}
					}
				]
			}
		]
	},
	resolve: {
		modules: ['node_modules'],
		extensions: ['.ts', '.js', '.json'],
		alias: {
            "@ore-three-ts": path.resolve(__dirname, './src/common/ts/ore-three-ts/src'),
            "@gl": path.resolve(__dirname, './src/gl/')
        }
	},
	cache: {
		type: 'filesystem',
		buildDependencies: {
			config: [__filename]
		}
	},
	optimization: {
		innerGraph: true
	}
}