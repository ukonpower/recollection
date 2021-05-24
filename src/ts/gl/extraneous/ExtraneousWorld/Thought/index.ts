import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import thoughtVert from './shaders/thought.vs';
import thoughtFrag from './shaders/thought.fs';

export class Thought {

	private commonUniforms: ORE.Uniforms;
	private mesh: THREE.Mesh;

	constructor( parent: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		this.mesh = parent.getObjectByName( 'Thought' ) as THREE.Mesh;

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

		let cubemapLoader = new THREE.CubeTextureLoader();
		cubemapLoader.load( [
			'/assets/scene/img/env/px.jpg',
			'/assets/scene/img/env/nx.jpg',
			'/assets/scene/img/env/py.jpg',
			'/assets/scene/img/env/ny.jpg',
			'/assets/scene/img/env/pz.jpg',
			'/assets/scene/img/env/nz.jpg',
		], ( tex ) => {

			this.commonUniforms.envMap.value = tex;

		} );

		this.nextDay();

	}

	public nextDay() {

		this.commonUniforms.rnd.value = Math.random();

	}

	public update( deltaTime: number ) {

		// this.mesh.quaternion.copy( new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, - deltaTime * 0.4, 0.0 ) ).multiply( this.mesh.quaternion ) );

	}

}
