import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { Flower } from './Flower';
import { Background } from './Background';
import { RenderPipeline } from './RenderPipeline';
import { BaseGL } from '../BaseGL';
import { timeStamp } from 'console';

export default class FlowerScene extends BaseGL {

	private renderPipeline: RenderPipeline;

	private light: THREE.Light;
	private alight: THREE.Light;
	private flowerContainer: THREE.Object3D;
	private flower: Flower;
	private flower2: Flower;
	private rotator: ORE.MouseRotator;

	private bg: Background;

	constructor( renderer: THREE.WebGLRenderer, info: ORE.LayerInfo, renderTarget: THREE.WebGLRenderTarget, parentUniforms: ORE.Uniforms ) {

		super( renderer, info, renderTarget, parentUniforms );

		this.renderPipeline = new RenderPipeline( this.renderer, 0.4, 3.0, this.commonUniforms );

		this.initScene();

	}

	private initScene() {

		this.light = new THREE.DirectionalLight();
		this.light.position.y = 10;
		this.light.position.z = 10;
		this.scene.add( this.light );

		this.alight = new THREE.AmbientLight();
		this.alight.intensity = 0.5;
		this.scene.add( this.alight );

		this.bg = new Background();
		this.scene.add( this.bg );

		this.flower = new Flower();
		this.scene.add( this.flower );

		this.flower2 = new Flower();
		this.flower2.rotateX( Math.PI );
		this.flower2.scale.set( 0.7, 0.7, 0.7 );

		this.flower.add( this.flower2 );
		this.flower.position.set( 0, - 0.2, 0 );
		this.flower.rotateX( 0.7 );
		this.flower.rotateZ( - 0.3 );

		this.flowerContainer = new THREE.Object3D();
		this.flowerContainer.position.set( 0, 0.1, 0 );
		this.flowerContainer.add( this.flower );
		this.scene.add( this.flowerContainer );

		this.rotator = new ORE.MouseRotator( this.flowerContainer );

	}

	public animate( deltaTime: number ) {

		let m = 1.0 - this.commonUniforms.contentVisibility.value;

		this.camera.position.set( 0, 0, 3 + ( m ) * 3.0 );
		this.camera.rotation.z = m * 1.4;

		this.flower.update( this.time );
		this.flower2.update( this.time + Math.PI + 0.2 );
		this.rotator.update();

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

		this.rotator.addVelocity( args.delta.clone().multiplyScalar( 0.3 ) );

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {
	}

}
