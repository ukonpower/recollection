import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { PowerMesh } from './PowerMesh';

export class ElapsedWorld extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let light = new THREE.DirectionalLight();
		light.position.set( 1, 1, 1 );
		this.scene.add( light );

		let baseSphere = ( this.scene.getObjectByName( 'Sphere' ) as THREE.Mesh );
		baseSphere.visible = false;

		let sphere = new PowerMesh( baseSphere );
		this.scene.add( sphere );

		let box = new THREE.Mesh( new THREE.BoxBufferGeometry(), new THREE.MeshStandardMaterial() );
		box.position.set( 2, 0.5, 0 );
		this.scene.add( box );


	}

	public update( deltaTime: number, time: number ) {

	}

	public resize( layerInfo: ORE.LayerInfo ) {

	}

}
