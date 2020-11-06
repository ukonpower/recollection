import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { Thumbnail } from './Thumbnail';
import { Titles } from './Titles';

export declare interface GLContent {
	name: string;
}
export declare type GLList = GLContent[];

export class Contents {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	public glList: GLList = [];
	private thumbnails: Thumbnail;
	private titles: Titles;

	constructor( scene: THREE.Scene, parentUniforms?: ORE.Uniforms ) {

		this.scene = scene;

		this.glList = require( '@gl/gl.json' );

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		this.init();

	}

	protected init() {

		this.thumbnails = new Thumbnail( this.glList, this.scene, this.commonUniforms );
		this.titles = new Titles( this.glList, this.scene, this.commonUniforms );

	}

	public update( selectorValue: number ) {

		this.thumbnails.update( selectorValue );

	}

	public changeContent( num: number ) {

	}

}
