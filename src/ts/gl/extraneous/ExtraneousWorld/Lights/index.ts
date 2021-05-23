import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class Lights extends THREE.Object3D {

	private commonUniforms: ORE.Uniforms;

	constructor( scene: THREE.Object3D ) {

		super();

		let lights = scene.getObjectByName( 'Lights' );
		this.position.copy( lights.position );

		for ( let i = 0; i < lights.children.length; i ++ ) {

			let light = lights.children[ i ];

			let pLight = new THREE.PointLight();
			pLight.intensity = 7.0;
			pLight.distance = 10;
			pLight.position.copy( light.position );
			this.add( pLight );

		}

	}

}
