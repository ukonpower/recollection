import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { Thumbnail } from './Thumbnail';
import { Titles } from './Titles';
import { timeStamp } from 'console';

export declare interface GLContent {
	fileName: string;
	title: string;
}
export declare type GLList = GLContent[];

export class Contents {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	public glList: GLList = [];
	private thumbnails: Thumbnail;
	private titles: Titles;

	private layoutControllers: ORE.LayoutController[] = [];

	constructor( scene: THREE.Scene, parentUniforms?: ORE.Uniforms ) {

		this.scene = scene;
		this.glList = require( '@gl/gl.json' );

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.init();

	}

	protected init() {

		this.thumbnails = new Thumbnail( this.glList, this.commonUniforms );
		this.scene.add( this.thumbnails );

		this.titles = new Titles( this.glList, this.commonUniforms );
		this.titles.rotation.set( 0, 0.1, 0 );
		this.titles.position.set( 2.3, - 0.9, 0.0 );
		this.titles.scale.setScalar( 0.9 );

		this.layoutControllers.push( new ORE.LayoutController( this.titles, {
			position: new THREE.Vector3( - 1.35, - 0.9, 0.0 ),
			rotation: new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, - 0.13, 0 ) ),
			scale: 0.55
		} ) );

		this.scene.add( this.titles );

	}

	public update( deltaTime: number, selectorValue: number ) {

		this.thumbnails.update( selectorValue );

	}

	public changeContent( num: number ) {

		this.titles.changeTitle( this.glList[ num ] );

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		for ( let i = 0; i < this.layoutControllers.length; i ++ ) {

			this.layoutControllers[ i ].updateTransform( layerInfo.aspect.portraitWeight );

		}


	}

}
