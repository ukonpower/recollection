const gulp = require( 'gulp' );
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

const srcPath = './src/MainVisual';
const glPath = './src/gl';
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

	gulp.src( srcPath + '/assets/**/*' ).pipe( gulp.dest( publicPath + '/assets/' ) );
	gulp.src( './src/conf/**/*' ).pipe( gulp.dest( publicPath ) );
	gulp.src( glPath + '/*/assets/**/*' ).pipe( gulp.dest( publicPath + '/gl/' ) );

	browserSync.reload();
	
	cb();

}

let webpackConfDev = _.cloneDeep( require( './webpack.config' ) );

function webpackDev( cb ) {

	webpackConfDev.entry.main = srcPath + '/ts/main.ts';
	webpackConfDev.output.filename = 'main.js';
	webpackConfDev.mode = options.P ? 'production' : webpackMode;
	
	webpackStream( webpackConfDev, webpack, function() {
		reload();
	} )
		.on( 'error', function() { this.emit( 'end' ) } )
		.pipe( gulp.dest( publicPath + "/js/" ) )

	cb();

}

function pugDev() {

	let title = options.name || 'Recollection';
	
	return gulp.src([ srcPath + '/pug/**/*.pug', '!' + srcPath + '/pug/**/_*.pug'] )
		.pipe(plumber())
		.pipe(pug({
			pretty: true,
			locals: {
				title: title,
			}
		}))
		.pipe( gulp.dest( publicPath ) )
		.unpipe( browserSync.reload() );
	
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
	gulp.watch( [srcPath + '/assets/**/*', glPath + '/assets/**/*'], gulp.series( copyFiles ) );
	
	let commonDir = './src/common';
	gulp.watch( commonDir + '/pug/**/*', gulp.series( pugDev ) );

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

