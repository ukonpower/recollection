import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import kVert from './shaders/k.vs';
import kFrag from './shaders/k.fs';

export class K extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			modelMatrixInverse: {
				value: new THREE.Matrix4()
			},
			scale: {
				value: new THREE.Vector3( 1.0, 1.0, 1.0 )
			},
			rnd: {
				value: Math.random()
			},
			envMap: {
				value: null
			}
		} );

		let geo = new THREE.SphereBufferGeometry( 1.0, );
		let mat = new THREE.ShaderMaterial( {
			vertexShader: kVert,
			fragmentShader: kFrag,
			uniforms: uni,
			transparent: true
		} );

		super( geo, mat );

		this.commonUniforms = uni;

		this.onBeforeRender = () => {

			this.commonUniforms.modelMatrixInverse.value.copy( this.matrixWorld.clone().invert() );

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

	}

	public update( deltaTime: number ) {

		// this.mesh.quaternion.copy( new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, - deltaTime * 0.4, 0.0 ) ).multiply( this.mesh.quaternion ) );

	}

}
