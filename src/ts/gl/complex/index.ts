import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { BaseGL } from '../BaseGL';

export default class Complex extends BaseGL {

	private box: THREE.Mesh;

	constructor( renderer: THREE.WebGLRenderer, info: ORE.LayerInfo, renderTarget: THREE.WebGLRenderTarget, parentUniforms: ORE.Uniforms ) {

		super( renderer, info, renderTarget, parentUniforms );

		this.initScene();

	}

	private initScene() {

		this.box = new THREE.Mesh( new THREE.BoxBufferGeometry(), new THREE.MeshNormalMaterial() );
		this.scene.add( this.box );

	}

	public animate( deltaTime: number ) {

		let renderTargetMem = this.renderer.getRenderTarget();

		this.box.rotateY( - 0.01 );

		this.renderer.setRenderTarget( this.renderTarget );
		this.renderer.render( this.scene, this.camera );

		this.renderer.setRenderTarget( renderTargetMem );

	}

	public onResize() {

		super.onResize();

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
