import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class Fan {

	private commonUniforms: ORE.Uniforms;

	private mesh: THREE.Mesh;

	private plane: THREE.Mesh;
	private neck: THREE.Mesh;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {

		} );

		this.mesh = scene.getObjectByName( 'Fan' ) as THREE.Mesh;

		/*-------------------------------
			Fan
		-------------------------------*/
		this.plane = this.mesh.getObjectByName( 'Plane' ) as THREE.Mesh;

		/*-------------------------------
			Neck
		-------------------------------*/
		this.neck = this.mesh.getObjectByName( 'Fan_Neck' ) as THREE.Mesh;

	}


	public update( deltaTime: number, time: number ) {


		this.plane.rotateZ( deltaTime * 10.0 );

		this.neck.rotation.y = Math.sin( time * 0.3 ) * 0.8;


	}

}
