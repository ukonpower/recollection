import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

export class BaseGL extends ORE.BaseLayer {

	protected renderTarget: THREE.WebGLRenderTarget;

	constructor( renderer: THREE.WebGLRenderer, info: ORE.LayerInfo, renderTarget: THREE.WebGLRenderTarget, parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, parentUniforms );

		this.renderTarget = renderTarget;
		this.renderer = renderer;
		this.info = info;

		this.camera.position.set( 0, 0, 5 );

	}

	public animate( deltaTime: number ) {
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

	public onResize() {

		super.onResize();

	}

}
