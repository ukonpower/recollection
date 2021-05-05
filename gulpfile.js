const fancyLog = require('fancy-log');
const supportsColor = require( 'supports-color' );
const gulp = require( 'gulp' );
const rename = require( 'gulp-rename' );
const pug = require( 'gulp-pug' );
const autoprefixer = require( 'gulp-autoprefixer' );
const plumber = require( 'gulp-plumber' );
const sass = require( 'gulp-sass' );
const cssmin = require( 'gulp-cssmin' );

const webpackStream = require( 'webpack-stream' );
const webpack = require( 'webpack' );

const minimist = require( 'minimist' );
const browserSync = require( 'browser-sync' );
const eslint = require( 'gulp-eslint' );
const del = require( 'del' );
const fs = require( 'fs' );

const _ = require( 'lodash' );
const { reload } = require('browser-sync');

const options = minimist( process.argv.slice( 2 ), {
	default: {
		gl: null,
		P: false,
	}
});

const srcPath = './src';
const glPath = './src/ts/gl';
const publicPath = './public';
var webpackMode = 'development';

function isFixed( file ) {

	return file.eslint != null && file.eslint.fixed;

}

function esLint( cb ) {

	let paths = [
		'./src/gl',
	];

	for ( let i = 0; i < paths.length; i ++ ) {

		gulp.src( paths[ i ] + '**/*.js' )
			.pipe( eslint( { useEslintrc: true, fix: true } ) ) // .eslintrc を参照
			.pipe( eslint.format() )
			.pipe( gulpIf( isFixed, gulp.dest( paths[ i ] ) ) )
			.pipe( eslint.failAfterError() );

	}

	cb();

}

/*-------------------
	Production
--------------------*/

function cleanAllFiles( cb ) {

	del([

		publicPath
		
	],{

		force: true,

	}).then( ( paths ) => {

		cb();

	});

}

/*-------------------
	Development
--------------------*/

function copyFiles( cb ) {

	gulp.src( srcPath + '/ts/top/assets/**/*' ).pipe( gulp.dest( publicPath + '/assets/' ) );
	gulp.src( './src/conf/**/*' ).pipe( gulp.dest( publicPath ) );

	let glList = require( './src/ts/gl/gl.json' );

	for (let i = 0; i < glList.length; i++) {
		
		let glName = glList[i].fileName;

		gulp.src( glPath + '/'+ glName + '/assets/**/*' ).pipe( gulp.dest( publicPath + '/assets/gl/' + glName + '/' ) );
		
	}
		
	browserSync.reload();
	
	cb();

}

let webpackConfDev = _.cloneDeep( require( './webpack.config' ) );

function webpackDev( cb ) {

	webpackConfDev.entry.main = srcPath + '/ts/top/main.ts';
	webpackConfDev.output.filename = 'main.js';
	webpackConfDev.mode = options.P ? 'production' : webpackMode;
	
	webpackStream( webpackConfDev, webpack, function( err, stats ) {
		
		//https://github.com/shama/webpack-stream/blob/master/index.js
		
		if (err) {
			return;
		}

		stats = stats || {};

		var statusLog = stats.toString({
			colors: supportsColor.stdout.hasBasic,
			hash: false,
			timings: false,
			chunks: false,
			chunkModules: false,
			modules: false,
			children: true,
			version: true,
			cached: false,
			cachedAssets: false,
			reasons: false,
			source: false,
			errorDetails: false
		});
		
		if (statusLog) {
			fancyLog(statusLog);
		}

		reload();
		
	})
		.on( 'error', function() { this.emit( 'end' ) } )
		.pipe( gulp.dest( publicPath + "/js/" ) );

	cb();

}

function pugDev( cb ) {

	gulp.src( [srcPath + '/pug/**/*.pug', '!/**/_*.pug', '!/**/gl.pug'] )
		.pipe(plumber())
		.pipe(pug({
			pretty: true,
		}))
		.pipe( gulp.dest( publicPath ) )
		.unpipe( browserSync.reload() );

	
	let glList = require( './src/ts/gl/gl.json' );

	for (let i = 0; i < glList.length; i++) {

		let gl = glList[i];
		let glName = gl.title;
		let glDate = gl.data;
		let glFileName = gl.fileName;
		let glDescription = gl.description;
		
		gulp.src( srcPath + '/pug/gl.pug' )
			.pipe( plumber() )
			.pipe( pug( {
				pretty: true,
				locals: {
					glName: glName,
					glDate: glDate,
					glFileName: glFileName,
					glDescription: glDescription
				}
			} ) )
			.pipe( rename( (path) => { path.basename = gl.fileName }) )
			.pipe( gulp.dest( publicPath + '/gl/' ) )
		
	}

	cb();
	
}

function sassDev() {

	return gulp.src( srcPath + "/scss/style.scss" )
		.pipe( plumber() )
		.pipe( sass() )
		.pipe( autoprefixer() )
		.pipe( cssmin() )
		.pipe( gulp.dest( publicPath + "/css/" ) )
		.pipe( browserSync.stream() )

}

function brSync() {

	browserSync.init({
		server: {
			baseDir: publicPath,
			index: "index.html",
		},
		notify: false
	});

}

function watch() {

	gulp.watch( srcPath + '/pug/**/*', gulp.series( pugDev ) );
	gulp.watch( srcPath + '/scss/**/*', gulp.series( sassDev ) );
	gulp.watch( [srcPath + '/ts/top/assets/**/*', glPath + '/*/assets/**/*'], gulp.series( copyFiles ) );
	
}

function setModeDevelopment( cb ) {

	webpackMode = 'development';

	cb();
	
}

function setModeProduction( cb ) {

	webpackMode = 'production';

	cb();
	
}

let build = gulp.series( 
	copyFiles,
	gulp.parallel( pugDev, webpackDev, sassDev ),
);

let develop = gulp.series( 
	build,
	gulp.parallel( brSync, watch ),
);

exports.build	= gulp.series( cleanAllFiles, setModeProduction, build );
exports.default	= gulp.series( cleanAllFiles, setModeDevelopment, develop );

exports.lint = gulp.series( esLint );

