import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { RenderPipeline } from './RenderPipeline';
import { BaseGL } from '../BaseGL';
import { ElapsedGlobalManager } from './ElapsedGlobalManager';
import { ElapsedCameraController } from './ElapsedCameraController';
import { ElapsedWorld } from './ElapsedWorld';

export default class ElapsedScene extends BaseGL {

	private gManager: ElapsedGlobalManager
	private renderPipeline: RenderPipeline;
	private cameraController: ElapsedCameraController;
	private world: ElapsedWorld;

	constructor( renderer: THREE.WebGLRenderer, info: ORE.LayerInfo, renderTarget: THREE.WebGLRenderTarget, parentUniforms: ORE.Uniforms ) {

		super( renderer, info, renderTarget, parentUniforms );

		this.gManager = new ElapsedGlobalManager();

		this.gManager.assetManager.load( { assets: [
			{ name: 'scene', path: '../assets/gl/elapsed/scene/elapsed.glb', type: 'gltf' },
			{ name: 'waterRoughness', path: '../assets/gl/elapsed/scene/ground/Metal002_1K_Roughness.jpg', type: 'tex', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;

			} },
			{ name: 'noise', path: '../assets/scene/img/noise.jpg', type: 'tex', onLoad: ( tex: THREE.Texture ) => {

				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;

			} },

		] } );

		this.gManager.assetManager.addEventListener( 'loadMustAssets', () => {

			this.scene.add( this.gManager.assetManager.getGltf( 'scene' ).scene );

			this.initScene();
			this.onResize();

		} );

		this.renderPipeline = new RenderPipeline( this.renderer, this.commonUniforms );


	}

	private initScene() {

		/*------------------------
			CameraController
		------------------------*/
		this.cameraController = new ElapsedCameraController( this.camera, this.scene );

		/*------------------------
			World
		------------------------*/
		this.world = new ElapsedWorld( this.gManager, this.renderer, this.scene, this.commonUniforms );
		this.scene.add( this.world );

		this.renderer.outputEncoding = THREE.LinearEncoding;

	}

	public animate( deltaTime: number ) {

		this.gManager.animator.update( deltaTime );

		if ( this.cameraController ) {

			this.cameraController.update( deltaTime, this.time );

		}

		let m = 1.0 - this.commonUniforms.contentVisibility.value;
		this.camera.position.z += m;
		this.camera.rotation.z += m * 1.4;

		if ( this.world ) {

			this.world.update( deltaTime, this.time );

		}

		this.renderPipeline.render( this.scene, this.camera, this.renderTarget );

	}

	public onResize() {

		super.onResize();

		if ( this.cameraController ) {

			this.cameraController.resize( this.info );

		}

		if ( this.world ) {

			this.world.resize( this.info );

		}

		this.renderPipeline.resize( this.info.size.canvasPixelSize );

	}

	public onHover( args: ORE.TouchEventArgs ) {

		if ( this.cameraController ) {

			this.cameraController.updateCursor( args.normalizedPosition );

		}

	}

	public onWheel( e: WheelEvent, trackpadDelta: number ) {
	}

	public onTouchStart( args: ORE.TouchEventArgs ) {
	}

	public onTouchMove( args: ORE.TouchEventArgs ) {

		if ( this.cameraController ) {

			this.cameraController.updateCursor( args.normalizedPosition );

		}

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {
	}

}
