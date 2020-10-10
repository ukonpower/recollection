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

const options = minimist( process.argv.slice( 2 ), {
	default: {
		gl: null,
		P: false,
	}
});

const srcPath = './src';
const publicPath = './public';
var webpackMode = 'development';

function isFixed( file ) {

	return file.eslint != null && file.eslint.fixed;

}

function esLint( cb ) {

	let paths = [
		'./src/gl',
		'./src/topVisual'
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

const glDir = srcPath + '/gl/';
const distGLDir =  publicPath + '/gl/';

function buildAllGLs( cb ) {

	fs.readdir( glDir, ( err, files ) => {

		if ( err ) throw err;

		let conf = _.cloneDeep( require( './webpack.config' ) );
		conf.mode = options.P ? 'production' : webpackMode;

		for ( let i = 0; i < files.length; i++ ) {

			if( files[i] == '.DS_Store' ) continue;
			
			let glItemDir = glDir + files[i];
			let distGLItemDir = distGLDir + files[i];

			//set webpack entry files
			conf.entry[files[i]] = glItemDir + '/ts/main.ts';	 

			//pug
			gulp.src([ glItemDir + '/pug/**/*.pug', '!' + glItemDir + '/pug/**/_*.pug'] )
				.pipe(plumber())
				.pipe(pug({
					pretty: true,
					locals: {
						title: files[i],
					}
				}))
				.pipe(gulp.dest( distGLItemDir ));

			//sass
			gulp.src( glItemDir + "/scss/style.scss" )
				.pipe( plumber() )
				.pipe( autoprefixer() )
				.pipe( sass() )
				.pipe( cssmin() )
				.pipe( gulp.dest( distGLItemDir + "/css/" ) )

			//copy files
			gulp.src( glDir + files[i] + '/assets/**/*' ).pipe( gulp.dest( distGLItemDir + '/assets/' ) );
			gulp.src( glItemDir + '/' + files[i] + '.jpg', { allowEmpty: true } ).pipe( gulp.dest( distGLItemDir) );
			
		}
		
		conf.output.filename = '[name]/js/main.js';
		
		//webpack
		webpackStream( conf, webpack )
			.on( 'error', function() { this.emit( 'end' ) } )
			.pipe( gulp.dest( distGLDir ) )
			.on( 'end', cb )

	});

}

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

let srcDir = '';
let distDir = '';

function copyFiles( cb ) {

	gulp.src( srcDir + '/assets/**/*' ).pipe( gulp.dest( distDir + '/assets/' ) );
	gulp.src( './src/conf/**/*' ).pipe( gulp.dest( distDir ) );

	browserSync.reload();
	
	cb();

}

let webpackConfDev = _.cloneDeep( require( './webpack.config' ) );

function webpackDev( cb ) {

	webpackConfDev.entry.main = srcDir + '/ts/main.ts';
	webpackConfDev.output.filename = 'main.js';
	webpackConfDev.mode = options.P ? 'production' : webpackMode;
	
	webpackStream( webpackConfDev, webpack )
		.on( 'error', function() { this.emit( 'end' ) } )
		.pipe( gulp.dest( distDir + "/js/" ) )
		.on( 'end', function() { browserSync.reload(); cb(); } );

}

function pugDev() {

	let title = options.name || 'Recollection';
	
	return gulp.src([ srcDir + '/pug/**/*.pug', '!' + srcDir + '/pug/**/_*.pug'] )
		.pipe(plumber())
		.pipe(pug({
			pretty: true,
			locals: {
				title: title,
			}
		}))
		.pipe( gulp.dest( distDir ) )
		.unpipe( browserSync.reload() );
	
}

function sassDev() {

	return gulp.src( srcDir + "/scss/style.scss" )
		.pipe( plumber() )
		.pipe( sass() )
		.pipe( autoprefixer() )
		.pipe( cssmin() )
		.pipe( gulp.dest( distDir + "/css/" ) )
		.pipe( browserSync.stream() )

}

function brSync() {

	browserSync.init({
		server: {
			baseDir: distDir,
			index: "index.html",
		},
		notify: false
	});

}

function watch() {

	gulp.watch( srcDir + '/ts/**/*', gulp.series( webpackDev ) );
	gulp.watch( srcDir + '/pug/**/*', gulp.series( pugDev ) );
	gulp.watch( srcDir + '/scss/**/*', gulp.series( sassDev ) );
	gulp.watch( srcDir + '/html/**/*', gulp.series( copyFiles ) );
	gulp.watch( srcDir + '/assets/**/*', gulp.series( copyFiles ) );
	
	let commonDir = './src/common';
	gulp.watch( commonDir + '/ts/**/*', gulp.series( webpackDev ) );
	gulp.watch( commonDir + '/pug/**/*', gulp.series( pugDev ) );

}

function setPathGL( cb ) {
	
	srcDir = srcPath + '/gl/' + options.name;
	distDir = publicPath + '/gl/' + options.name + '/public';

	cb();
}

function setPathMainVisual( cb ) {

	srcDir = srcPath + '/MainVisual';
	distDir = publicPath;

	cb();

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

exports.build	= gulp.series( cleanAllFiles, setModeProduction, buildAllGLs, setPathMainVisual, build );
exports.default	= gulp.series( cleanAllFiles, setModeDevelopment, buildAllGLs, setPathMainVisual, develop );

exports.top	= gulp.series( cleanAllFiles, setPathMainVisual, setModeDevelopment, develop );
exports.gl	= gulp.series( cleanAllFiles, setPathGL, setModeDevelopment, develop );

exports.lint = gulp.series( esLint );

