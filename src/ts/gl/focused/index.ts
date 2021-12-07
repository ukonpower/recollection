import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { BaseGL } from '../BaseGL';
import { FocusedRenderPipeline } from './FocusedRenderPipeline';
import { FocusedGlobalManager } from './FocusedGlobalManager';
import { FocusedCameraController } from './FocusedCameraController';
import { FocusedWorld } from './FocusedWorld';

export default class Focused extends BaseGL {

	private gManager: FocusedGlobalManager
	private renderPipeline: FocusedRenderPipeline;
	private cameraController: FocusedCameraController;
	private world: FocusedWorld;

	constructor( renderer: THREE.WebGLRenderer, info: ORE.LayerInfo, renderTarget: THREE.WebGLRenderTarget, parentUniforms: ORE.Uniforms ) {

		super( renderer, info, renderTarget, parentUniforms );

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
		} );

		this.gManager = new FocusedGlobalManager();

		this.gManager.assetManager.load( { assets: [
			{ name: 'scene', path: '/focused/assets/scene/focused.glb', type: 'gltf' }
		] } );

		this.gManager.assetManager.addEventListener( 'loadMustAssets', () => {

			this.scene.add( this.gManager.assetManager.getGltf( 'scene' ).scene );

			this.initScene();
			this.onResize();

		} );

		this.renderPipeline = new FocusedRenderPipeline( this.renderer, this.commonUniforms );


	}

	private initScene() {

		/*------------------------
			CameraController
		------------------------*/
		this.cameraController = new FocusedCameraController( this.camera, this.scene );

		/*------------------------
			World
		------------------------*/
		this.world = new FocusedWorld( this.gManager, this.renderer, this.scene, this.commonUniforms );
		this.scene.add( this.world );

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
