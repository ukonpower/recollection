import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { RenderPipeline } from './RenderPipeline';
import { BaseGL } from '../BaseGL';
import { WarmthGlobalManager } from './WarmthGlobalManager';
import { WarmthCameraController } from './WarmthCameraController';
import { WarmthWorld } from './WarmthWorld';

export default class WarmthScene extends BaseGL {

	private gManager: WarmthGlobalManager
	private renderPipeline: RenderPipeline;
	private cameraController: WarmthCameraController;
	private world: WarmthWorld;

	constructor( renderer: THREE.WebGLRenderer, info: ORE.LayerInfo, renderTarget: THREE.WebGLRenderTarget, parentUniforms: ORE.Uniforms ) {

		super( renderer, info, renderTarget, parentUniforms );

		this.gManager = new WarmthGlobalManager( {
			onMustAssetsLoaded: () => {

				this.scene.add( this.gManager.assetManager.gltfScene );

				this.initScene();

				this.onResize();

			}
		} );

		this.renderPipeline = new RenderPipeline( this.renderer, this.commonUniforms );


	}

	private initScene() {

		/*------------------------
			Light
		------------------------*/

		/*------------------------
			CameraController
		------------------------*/
		this.cameraController = new WarmthCameraController( this.camera, this.scene );

		/*------------------------
			World
		------------------------*/
		this.world = new WarmthWorld( this.scene, this.commonUniforms );
		this.scene.add( this.world );

		this.renderer.outputEncoding = THREE.LinearEncoding;

	}

	public animate( deltaTime: number ) {

		this.gManager.animator.update( deltaTime );

		if ( this.cameraController ) {

			this.cameraController.update( deltaTime );

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
