import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import kVert from './shaders/k.vs';
import kFrag from './shaders/k.fs';
import { ElapsedGlobalManager } from '@gl/elapsed/ElapsedGlobalManager';

export class K extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;
	private light: THREE.PointLight;

	constructor( gManager: ElapsedGlobalManager, parentUniforms: ORE.Uniforms ) {

		let commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			envMap: {
				value: null
			},
			skyTex: gManager.assetManager.getTex( 'sky' ),
			modelMatrixInverse: {
				value: new THREE.Matrix4()
			},
			camNear: {
				value: 0
			},
			camFar: {
				value: 0
			}
		} );

		commonUniforms = ORE.UniformsLib.mergeUniforms( commonUniforms, THREE.UniformsUtils.clone( THREE.ShaderLib.standard.uniforms ) );

		let geo = new THREE.SphereBufferGeometry( 0.1 );
		let mat = new THREE.ShaderMaterial( {
			vertexShader: kVert,
			fragmentShader: kFrag,
			uniforms: commonUniforms,
			transparent: true
		} );

		super( geo, mat );

		this.renderOrder = 999;
		this.commonUniforms = commonUniforms;

		this.userData.depthMat = new THREE.ShaderMaterial( {
			vertexShader: kVert,
			fragmentShader: kFrag,
			side: THREE.DoubleSide,
			uniforms: commonUniforms,
			lights: true,
			defines: {
				'DEPTH': "",
			},
		} );

		this.onBeforeRender = ( renderer, scene, camera: THREE.PerspectiveCamera ) => {

			this.commonUniforms.modelMatrixInverse.value.copy( this.matrixWorld.clone().invert() );

			if ( camera.userData.shadowCamera ) {

				this.commonUniforms.camNear.value = camera.near;
				this.commonUniforms.camFar.value = camera.far;

			}

		};

		this.light = new THREE.PointLight();
		this.light.decay = 1.0;
		this.light.distance = 0.2;
		this.add( this.light );

	}

	public update( time: number ) {

		this.light.intensity = 3.0 + ( Math.sin( time * 3.0 ) * Math.sin( time * 1.4 + .1 ) ) * 1;

	}

}
