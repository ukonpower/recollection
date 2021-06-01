import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { RenderPipeline } from './RenderPipeline';
import { BaseGL } from '../BaseGL';
import { ExtraneousGlobalManager } from './ExtraneousGlobalManager';
import { CameraController } from './CameraController';
import { ExtraneousWorld } from './ExtraneousWorld';

export default class FlowerScene extends BaseGL {

	private gManager: ExtraneousGlobalManager
	private renderPipeline: RenderPipeline;
	private cameraController: CameraController;
	private world: ExtraneousWorld;

	constructor( renderer: THREE.WebGLRenderer, info: ORE.LayerInfo, renderTarget: THREE.WebGLRenderTarget, parentUniforms: ORE.Uniforms ) {

		super( renderer, info, renderTarget, parentUniforms );

		this.gManager = new ExtraneousGlobalManager( {
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
		let light = new THREE.PointLight();
		light.intensity = 0.3;
		light.position.set( 0.0, 2.0, 0.0 );
		this.scene.add( light );

		let dlight = new THREE.DirectionalLight();
		dlight.position.set( 1, 1, 1 );
		dlight.intensity = 0.02;
		this.scene.add( dlight );

		/*------------------------
			CameraController
		------------------------*/
		this.cameraController = new CameraController( this.camera, this.scene, this.gManager );

		/*------------------------
			World
		------------------------*/
		this.world = new ExtraneousWorld( this.scene, this.commonUniforms );
		this.scene.add( this.world );

		this.cameraController.addListener( 'nextDay', () => {

			this.world.nextDay();

		} );

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

			this.world.update( deltaTime );

		}

		this.renderPipeline.render( this.scene, this.camera, this.renderTarget );

	}

	public onResize() {

		super.onResize();

		if ( this.cameraController ) {

			this.cameraController.resize( this.info );

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

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {
	}

}
