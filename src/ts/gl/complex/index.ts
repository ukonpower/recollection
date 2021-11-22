import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { BaseGL } from '../BaseGL';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SmoothCameraMover } from './SmoothCameraMover';
import { ReflectionPlane } from './ReflectionPlane';
import { Emotion } from './Emotion';
import { RenderPipeline } from '@gl/complex/RenderPipeline';

export default class Complex extends BaseGL {

	private controls: OrbitControls;
	private cameraMover: SmoothCameraMover;

	private reflectPlane: ReflectionPlane;
	private emotion: Emotion;
	private renderPipeline: RenderPipeline

	private windowSize: THREE.Vector2;

	constructor( renderer: THREE.WebGLRenderer, info: ORE.LayerInfo, renderTarget: THREE.WebGLRenderTarget, parentUniforms: ORE.Uniforms ) {

		super( renderer, info, renderTarget, parentUniforms );

		this.initScene();

	}

	private initScene() {

		this.renderPipeline = new RenderPipeline( this.renderer, 0.4, 4.0, this.commonUniforms );

		this.camera.position.set( 0, 1.8, 5 );
		this.camera.lookAt( 0, 1.0, 0 );
		this.cameraMover = new SmoothCameraMover( this.commonUniforms, this.camera, Math.PI / 2, Math.PI / 12 );

		this.scene.background = new THREE.Color( 0.15, 0.15, 0.15 );

		let light: THREE.Light;
		light = new THREE.DirectionalLight();
		light.intensity = 0.005;
		light.position.set( - 0.1, 0.6, - 1.0 );
		this.scene.add( light );

		light = new THREE.DirectionalLight();
		light.intensity = 0.005;
		light.position.set( 0.8, 0.6, - 0.8 );
		this.scene.add( light );

		light = new THREE.DirectionalLight();
		light.intensity = 0.005;
		light.position.set( - 0.8, 0.6, - 0.8 );
		this.scene.add( light );

		light = new THREE.DirectionalLight();
		light.intensity = 0.1;
		light.position.set( 1, 1, 1 );
		this.scene.add( light );

		this.emotion = new Emotion( this.renderer, this.commonUniforms );
		this.emotion.position.set( 0, 1.5, 0 );
		this.scene.add( this.emotion );

		this.reflectPlane = new ReflectionPlane( this.renderer, new THREE.Vector2( 20, 30 ), 0.4, this.commonUniforms );
		this.reflectPlane.position.set( 0, 0, 0 );
		this.reflectPlane.rotateX( - Math.PI / 2 );
		this.scene.add( this.reflectPlane );

		this.windowSize = new THREE.Vector2( window.innerWidth, window.innerHeight );

	}

	public animate( deltaTime: number ) {

		this.commonUniforms.time.value = this.time;

		// this.controls.update();

		let m = 1.0 - this.commonUniforms.contentVisibility.value;

		this.camera.position.set( 0, 0, 3 + ( m ) * 3.0 );
		this.camera.rotation.z = m * 1.4;

		this.cameraMover.update( deltaTime );
		this.emotion.update( deltaTime );

		this.renderPipeline.render( this.scene, this.camera, this.renderTarget );

	}

	public onResize() {

		super.onResize();

		this.camera.fov = 40 + this.info.size.portraitWeight * 20;
		this.camera.updateProjectionMatrix();

		this.windowSize.set( window.innerWidth, window.innerHeight );
		this.reflectPlane.resize( this.info.size.canvasPixelSize );
		this.renderPipeline.resize( this.info.size.canvasPixelSize );


	}

	public onHover( args: ORE.TouchEventArgs ) {

		this.cameraMover.setCursor( args.normalizedPosition );

	}

	public onWheel( e: WheelEvent, trackpadDelta: number ) {
	}

	public onTouchStart( args: ORE.TouchEventArgs ) {
	}

	public onTouchMove( args: ORE.TouchEventArgs ) {

		this.cameraMover.setCursor( args.normalizedPosition );

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {

	}


}
