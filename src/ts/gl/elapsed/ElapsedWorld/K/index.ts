import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import kVert from './shaders/k.vs';
import kFrag from './shaders/k.fs';

import oFrag from './shaders/o.fs';

export class K extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms: ORE.Uniforms ) {

		let commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			rnd: {
				value: Math.random()
			},
			envMap: {
				value: null
			} } );

		let kUni = ORE.UniformsLib.mergeUniforms( commonUniforms, {
			modelMatrixInverse: {
				value: new THREE.Matrix4()
			},
			scale: {
				value: new THREE.Vector3( 1.0, 1.0, 1.0 )
			},
		} );

		let geo = new THREE.SphereBufferGeometry( 0.1, );
		let mat = new THREE.ShaderMaterial( {
			vertexShader: kVert,
			fragmentShader: kFrag,
			uniforms: kUni,
			transparent: true
		} );

		super( geo, mat );

		this.commonUniforms = commonUniforms;

		this.onBeforeRender = () => {

			kUni.modelMatrixInverse.value.copy( this.matrixWorld.clone().invert() );

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

}
