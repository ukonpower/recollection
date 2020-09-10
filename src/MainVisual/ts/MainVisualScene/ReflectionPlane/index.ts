import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { ReflectionMat } from './ReflectionMat';
import { BlurTexture } from './ReflectionMat/BlurTexture';
import { AssetManager } from '../MainVisualManager/AssetManager';

export class ReflectionPlane extends THREE.Mesh {

	private params: any;

	private assetManager: AssetManager;

	private commonUniforms: ORE.Uniforms;
	private refRenderTarget: THREE.WebGLRenderTarget;
	private resolutionRatio: number;

	private blurTexture: BlurTexture;

	private mat: ReflectionMat;

	constructor( assetManager: AssetManager, renderer: THREE.WebGLRenderer, size: THREE.Vector2, resolutionRatio: number = 0.001, parentUniforms?: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.CopyUniforms( {
			reflectionTex: {
				value: null
			},
			winResolution: {
				value: new THREE.Vector2( window.innerWidth, window.innerHeight )
			},
			roughnessTex: assetManager.textures.groundRoughness,
			colorTex: assetManager.textures.groundColor,
			normalTex: assetManager.textures.groundNormal,
		}, parentUniforms );

		let geo = new THREE.PlaneBufferGeometry( size.x, size.y );
		let mat = new ReflectionMat( {
			uniforms: uni,
		} );

		super( geo, mat );

		this.assetManager = assetManager;

		this.commonUniforms = uni;

		this.blurTexture = new BlurTexture( renderer, new THREE.Vector2( 512, 512 ), uni );

		this.mat = mat;
		this.resolutionRatio = resolutionRatio;
		this.frustumCulled = false;

		this.init();

	}

	protected init() {

		this.refRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth * this.resolutionRatio, window.innerHeight * this.resolutionRatio );
		this.commonUniforms.reflectionTex.value = this.refRenderTarget.texture;

		let n = new THREE.Vector3( 0, 0, 1 );
		let x = new THREE.Vector3( 0, 0, 0 );

		this.onBeforeRender = ( renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera ) => {

			let currentRenderTarget = renderer.getRenderTarget();

			let refCamera = camera.clone();

			let inverse = new THREE.Matrix4().getInverse( this.matrixWorld );

			refCamera.applyMatrix4( inverse );

			//カメラの向く位置と面の交点
			let x0 = refCamera.getWorldPosition( new THREE.Vector3() );
			let m = refCamera.getWorldDirection( new THREE.Vector3() );

			let h = n.clone().dot( x );
			let intersectPoint = x0.add( m.clone().multiplyScalar( ( h - n.clone().dot( x0 ) ) / ( n.clone().dot( m ) ) ) );

			refCamera.position.reflect( n );

			refCamera.up.set( 0, - 1, 0 );
			refCamera.up.applyMatrix4( inverse );
			refCamera.up.reflect( n );
			refCamera.lookAt( intersectPoint );

			refCamera.applyMatrix4( this.matrix );

			if ( intersectPoint.clone().sub( refCamera.position ).normalize().dot( m ) < - 0.2 ) {

				refCamera.rotateY( Math.PI );

			}

			this.swithViible( false, scene );

			renderer.setRenderTarget( this.refRenderTarget );

			renderer.render( scene, refCamera );

			this.swithViible( true, scene );

			this.blurTexture.udpateTexture( 1.0, this.refRenderTarget.texture );
			this.commonUniforms.reflectionTex.value = this.blurTexture.texture.value;

			// this.commonUniforms.reflectionTex.value = this.refRenderTarget.texture;

			renderer.setRenderTarget( currentRenderTarget );


		};

	}

	private swithViible( visible: boolean, scene: THREE.Scene ) {

		this.visible = visible;

	}

	public resize( windowResolution: THREE.Vector2 ) {

		this.refRenderTarget.setSize( windowResolution.x * this.resolutionRatio, windowResolution.y * this.resolutionRatio );
		this.commonUniforms.winResolution.value.copy( windowResolution );

	}

}
