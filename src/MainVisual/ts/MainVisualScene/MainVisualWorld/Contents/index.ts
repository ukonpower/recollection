import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import gl from '@gl/gl.json';

import { Thumbnails } from './Thumbnails';

export declare interface GLContent {
	name: string;
}
export declare type GLList = GLContent[];

export class Contents {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	private glLists: GLList = [];
	private thumbnails: Thumbnails;

	constructor( scene: THREE.Scene, parentUniforms?: ORE.Uniforms ) {

		this.scene = scene;

		this.glLists = gl;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		this.init();

	}

	protected init() {

		this.thumbnails = new Thumbnails( this.glLists, this.scene, this.commonUniforms );

	}

}
