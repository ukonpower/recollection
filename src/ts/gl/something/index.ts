import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { RenderPipeline } from './RenderPipeline';
import { BaseGL } from '../BaseGL';

export default class FlowerScene extends BaseGL {

	private renderPipeline: RenderPipeline;

	constructor( renderer: THREE.WebGLRenderer, info: ORE.LayerInfo, renderTarget: THREE.WebGLRenderTarget, parentUniforms: ORE.Uniforms ) {

		super( renderer, info, renderTarget, parentUniforms );

		this.renderPipeline = new RenderPipeline( this.renderer, this.commonUniforms );

		this.initScene();

	}

	private initScene() {

		/*------------------------
			Light
		------------------------*/
		let light = new THREE.DirectionalLight();
		light.position.set( 1.0, 1.0, 1.0 );
		this.scene.add( light );

		/*------------------------

		------------------------*/


	}

	public animate( deltaTime: number ) {

		let m = 1.0 - this.commonUniforms.contentVisibility.value;

		this.camera.position.set( 0, 0, 3 + ( m ) * 3.0 );
		this.camera.rotation.z = m * 1.4;

		this.renderPipeline.render( this.scene, this.camera, this.renderTarget );

	}

	public onResize() {

		super.onResize();

		this.camera.fov = 40 + this.info.aspect.portraitWeight * 30;
		this.camera.updateProjectionMatrix();

		this.renderPipeline.resize( this.info.size.canvasPixelSize );

	}

	public onHover( args: ORE.TouchEventArgs ) {
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
