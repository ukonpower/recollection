import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import EventEmitter from 'wolfy87-eventemitter';

import reflectionVert from './shaders/reflection.vs';
import reflectionFrag from './shaders/reflection.fs';

import powerVert from './shaders/power.vs';
import powerFrag from './shaders/power.fs';
import { PowerMesh } from '../PowerMesh';

export class PowerReflectionMesh extends PowerMesh {

	private refRenderTarget: THREE.WebGLRenderTarget;

	private lookAtPosition: THREE.Vector3;
	private rotationMatrix: THREE.Matrix4;
	private target: THREE.Vector3;
	private view: THREE.Vector3;

	private virtualCamera: THREE.PerspectiveCamera;
	private reflectorPlane: THREE.Plane;
	private normal: THREE.Vector3;

	private reflectorWorldPosition: THREE.Vector3;
	private cameraWorldPosition: THREE.Vector3;

	private clipPlane: THREE.Vector4;
	private clipBias: number;
	private q: THREE.Vector4;

	private textureMatrix: THREE.Matrix4;

	constructor( geometry: THREE.BufferGeometry, parentUniforms?: ORE.Uniforms );

	constructor( mesh: THREE.Mesh, parentUniforms?: ORE.Uniforms );

	constructor( geoMesh: THREE.BufferGeometry | THREE.Mesh<THREE.BufferGeometry>, parentUniforms?: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			reflectionTex: {
				value: null
			},
			canvasResolution: {
				value: new THREE.Vector2( 1, 1 )
			},
			textureMatrix: {
				value: new THREE.Matrix4()
			},
		} );

		super( geoMesh as THREE.BufferGeometry, uni );

		this.material.defines.REFLECTPLANE = '';
		this.material.needsUpdate = true;

		this.reflectorPlane = new THREE.Plane();
		this.normal = new THREE.Vector3();
		this.reflectorWorldPosition = new THREE.Vector3();
		this.cameraWorldPosition = new THREE.Vector3();
		this.rotationMatrix = new THREE.Matrix4();
		this.lookAtPosition = new THREE.Vector3( 0, 0, - 1 );
		this.clipPlane = new THREE.Vector4();
		this.textureMatrix = this.commonUniforms.textureMatrix.value;
		this.clipBias = 0.1;

		this.view = new THREE.Vector3();
		this.target = new THREE.Vector3();
		this.q = new THREE.Vector4();

		this.virtualCamera = new THREE.PerspectiveCamera();

		/*-------------------------------
			Reflection
		-------------------------------*/

		this.refRenderTarget = new THREE.WebGLRenderTarget( 1, 1 );
		this.refRenderTarget.texture.magFilter = THREE.LinearFilter;
		this.commonUniforms.reflectionTex.value = this.refRenderTarget.texture;

		this.addEventListener( 'beforeRender', ( e: THREE.Event ) => {

			let renderer = e.renderer;
			let scene = e.scene;
			let camera = e.camera;

			// if ( camera.userData.shadowCamera ) return;

			this.reflectorWorldPosition.setFromMatrixPosition( this.matrixWorld );
			this.cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

			this.rotationMatrix.extractRotation( this.matrixWorld );

			this.normal.set( 0, 1.0, 0 );
			this.normal.applyMatrix4( this.rotationMatrix );

			this.view.subVectors( this.reflectorWorldPosition, this.cameraWorldPosition );

			// Avoid rendering when reflector is facing away

			if ( this.view.dot( this.normal ) > 0 ) return;

			this.view.reflect( this.normal ).negate();
			this.view.add( this.reflectorWorldPosition );

			this.rotationMatrix.extractRotation( camera.matrixWorld );

			this.lookAtPosition.set( 0, 0, - 1 );
			this.lookAtPosition.applyMatrix4( this.rotationMatrix );
			this.lookAtPosition.add( this.cameraWorldPosition );

			this.target.subVectors( this.reflectorWorldPosition, this.lookAtPosition );
			this.target.reflect( this.normal ).negate();
			this.target.add( this.reflectorWorldPosition );

			this.virtualCamera.position.copy( this.view );
			this.virtualCamera.up.set( 0, 1, 0 );
			this.virtualCamera.up.applyMatrix4( this.rotationMatrix );
			this.virtualCamera.up.reflect( this.normal );
			this.virtualCamera.lookAt( this.target );

			if ( ( camera as THREE.PerspectiveCamera ).far ) {

				this.virtualCamera.far = ( camera as THREE.PerspectiveCamera ).far; // Used in WebGLBackground

			}

			this.virtualCamera.updateMatrixWorld();
			this.virtualCamera.projectionMatrix.copy( camera.projectionMatrix );

			// Update the texture matrix
			this.textureMatrix.set(
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 0.5, 0.5,
				0.0, 0.0, 0.0, 1.0
			);

			this.textureMatrix.multiply( this.virtualCamera.projectionMatrix );
			this.textureMatrix.multiply( this.virtualCamera.matrixWorldInverse );
			this.textureMatrix.multiply( this.matrixWorld );

			// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
			// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
			this.reflectorPlane.setFromNormalAndCoplanarPoint( this.normal, this.reflectorWorldPosition );
			this.reflectorPlane.applyMatrix4( this.virtualCamera.matrixWorldInverse );

			this.clipPlane.set( this.reflectorPlane.normal.x, this.reflectorPlane.normal.y, this.reflectorPlane.normal.z, this.reflectorPlane.constant );

			var projectionMatrix = this.virtualCamera.projectionMatrix;

			this.q.x = ( Math.sign( this.clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
			this.q.y = ( Math.sign( this.clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
			this.q.z = - 1.0;
			this.q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

			// Calculate the scaled plane vector
			// this.clipPlane.multiplyScalar( 2.0 / this.clipPlane.dot( this.q ) );

			// Replacing the third row of the projection matrix
			projectionMatrix.elements[ 2 ] = this.clipPlane.x;
			projectionMatrix.elements[ 6 ] = this.clipPlane.y;
			projectionMatrix.elements[ 10 ] = this.clipPlane.z + 1.0 - this.clipBias;
			projectionMatrix.elements[ 14 ] = this.clipPlane.w;

			//render
			let currentRenderTarget = renderer.getRenderTarget();

			renderer.setRenderTarget( this.refRenderTarget );
			this.visible = false;
			this.dispatchEvent( { type: 'onBeforeRender' } );

			renderer.clear();
			renderer.render( scene, this.virtualCamera );

			renderer.setRenderTarget( currentRenderTarget );
			this.visible = true;
			this.dispatchEvent( { type: 'onAfterRender' } );

			this.commonUniforms.reflectionTex.value = this.refRenderTarget.texture;



		} );

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.refRenderTarget.setSize( 512, 512 );
		this.commonUniforms.canvasResolution.value.copy( layerInfo.size.canvasPixelSize );

	}

}
