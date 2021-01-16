import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { BaseGL } from '../BaseGL';

export default class Example extends BaseGL {

	private box: THREE.Mesh;

	constructor( renderer: THREE.WebGLRenderer, info: ORE.LayerInfo, renderTarget: THREE.WebGLRenderTarget, parentUniforms: ORE.Uniforms ) {

		super( renderer, info, renderTarget, parentUniforms );

		this.initScene();

	}

	private initScene() {

		for ( let i = 0; i < 5; i ++ ) {

			for ( let j = 0; j < 5; j ++ ) {

				this.box = new THREE.Mesh( new THREE.BoxBufferGeometry(), new THREE.MeshNormalMaterial() );
				this.scene.add( this.box );
				this.box.scale.multiplyScalar( 0.5 );
				this.box.position.set( i - 2, j - 2, 0 );

			}

		}

	}

	public animate( deltaTime: number ) {

		let renderTargetMem = this.renderer.getRenderTarget();

		this.box.rotateX( 0.01 );

		let m = 1.0 - this.commonUniforms.contentVisibility.value;

		this.camera.position.set( 0, 0, 5 + ( m ) * 10.0 );
		this.camera.rotation.z = m * 2.0;

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
