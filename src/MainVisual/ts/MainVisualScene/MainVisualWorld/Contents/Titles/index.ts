import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { GLContent, GLList } from '..';
import { Title } from './Title';

export class Titles extends THREE.Object3D {

	private glList: GLList;

	private fontName: string = 'BebasNeue-Regular';
	private fontInfo: any;
	private loader: THREE.TextureLoader;
	private isLoaded: boolean = false;

	private commonUniforms: ORE.Uniforms;

	private currentTitle: Title;

	constructor( glList: GLList, parentUniforms?: ORE.Uniforms ) {

		super();

		this.glList = glList;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			tex: {
				value: null
			}
		} );

		this.loadAssets();
		this.initAnimator();
		this.init();

	}

	private initAnimator() {

		let animator = window.mainVisualManager.animator;

		this.commonUniforms.visibility = animator.add( {
			name: 'titleVisibility',
			initValue: 0,
		} );

	}

	protected init() {

		// this.title = new Title( this.commonUniforms );
		// this.title.scale.multiplyScalar( 0.3 );
		// this.container.add( this.title );

	}

	public changeTitle( glContent: GLContent ) {

		if ( ! this.isLoaded ) {

			this.addEventListener( 'infoloaded', () => {

				this.changeTitle( glContent );

			} );

			return;

		}

		if ( this.currentTitle ) {

			this.currentTitle.clearText();

		}

		this.currentTitle = new Title( glContent.name, this.fontInfo, this.commonUniforms );
		this.currentTitle.position.set( 2.3, - 0.9, 0 );
		this.currentTitle.setText( glContent.name.toUpperCase(), "right" );
		// this.currentTitle.position.set( - 2.6, - 1.0, 0.0 );
		// this.currentTitle.setText( glContent.name.toUpperCase(), "left" );
		// this.currentTitle.setText( glContent.name.toUpperCase(), "left" );
		this.add( this.currentTitle );

	}

	protected loadAssets() {

		let xhr = new XMLHttpRequest();
		xhr.open( 'GET', './assets/scene/fonts/' + this.fontName + '/' + this.fontName + '-msdf.json' );

		let promise = new Promise( resolve => {

			xhr.onload = () => {

				let response = JSON.parse( xhr.response );

				this.fontInfo = response;

				this.isLoaded = true;

				this.dispatchEvent( {
					type: 'infoloaded'
				} );

				resolve(null);

			};

			xhr.onerror = ( e ) => {

				console.warn( e );

			};

			xhr.send();

		} );

		this.loader = new THREE.TextureLoader();
		this.loader.load( './assets/scene/fonts/' + this.fontName + '/' + this.fontName + '.png', tex => {

			this.commonUniforms.tex.value = tex;

		} );

		return promise;

	}

}
