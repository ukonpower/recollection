import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import thoughtVert from './shaders/thought.vs';
import thoughtFrag from './shaders/thought.fs';

export class K {

	private commonUniforms: ORE.Uniforms;
	private mesh: THREE.Mesh;

	constructor( parent: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.mesh = parent.getObjectByName( 'K' ) as THREE.Mesh;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			modelMatrixInverse: {
				value: new THREE.Matrix4()
			},
			scale: {
				value: this.mesh.scale
			},
			rnd: {
				value: Math.random()
			},
			envMap: {
				value: null
			}
		} );

		this.mesh.material = new THREE.ShaderMaterial( {
			vertexShader: thoughtVert,
			fragmentShader: thoughtFrag,
			uniforms: this.commonUniforms,
			transparent: true
		} );

		this.mesh.onBeforeRender = () => {

			this.commonUniforms.modelMatrixInverse.value.copy( this.mesh.matrixWorld.clone().invert() );

		};


	}

	public update( deltaTime: number ) {

		// this.mesh.quaternion.copy( new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, - deltaTime * 0.4, 0.0 ) ).multiply( this.mesh.quaternion ) );

	}

}
