import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import curtainVert from './shaders/curtain.vs';
import curtainFrag from './shaders/curtain.fs';

export class Curtain {

	private commonUniforms: ORE.Uniforms;

	private mesh: THREE.Mesh;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {

		} );

		/*-------------------------------
			Mesh
		-------------------------------*/

		this.mesh = scene.getObjectByName( 'Curtain' ) as THREE.Mesh;

		this.mesh.material = new THREE.ShaderMaterial( {
			vertexShader: curtainVert,
			fragmentShader: curtainFrag,
			uniforms: this.commonUniforms,
			side: THREE.DoubleSide,
			transparent: true
		} );

	}

}
