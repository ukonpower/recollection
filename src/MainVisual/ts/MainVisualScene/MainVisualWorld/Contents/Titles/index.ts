import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { GLList } from '..';
import { Title } from './Title';

export class Titles {

	private glList: GLList;

	private title: Title;

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;
	private container: THREE.Object3D

	constructor( glList: GLList, scene: THREE.Scene, parentUniforms?: ORE.Uniforms ) {

		this.glList = glList;
		this.scene = scene;

		this.container = this.scene.getObjectByName( 'Titles' );

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {
		}, parentUniforms );

		this.init();

	}

	protected init() {

		this.title = new Title( 'BebasNeue-Regular', this.commonUniforms );
		this.title.scale.multiplyScalar( 0.3 );
		this.container.add( this.title );

	}

}
