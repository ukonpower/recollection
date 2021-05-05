import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { BaseGL } from '../BaseGL';
import { Nose } from './Nose';
import { Finger } from './Finger';
import { TouchScreen } from './TouchScreen';
import { Tunnel } from './Tunnel';
import { RenderPipeline } from './RenderPipeline';

export default class HanaGLScene extends BaseGL {

	private nose: Nose;

	private finger: Finger;
	private touchScreen: TouchScreen;

	private tunnel: Tunnel;
	private renderPipeline: RenderPipeline;

	constructor( renderer: THREE.WebGLRenderer, info: ORE.LayerInfo, renderTarget: THREE.WebGLRenderTarget, parentUniforms: ORE.Uniforms ) {

		super( renderer, info, renderTarget, parentUniforms );

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			isGlitch: {
				value: false
			}
		} );

		this.initScene();

	}

	private initScene() {

		this.camera.position.set( 0, 0, 10 );

		this.loadModels();

		let light = new THREE.DirectionalLight();
		light.position.set( 2.0, 10.0, 3.0 );
		light.intensity = 0.5;
		this.scene.add( light );

		let alight = new THREE.AmbientLight( 0xffffff );
		alight.intensity = 0.2;
		this.scene.add( alight );

		let plight = new THREE.PointLight();
		plight.position.set( 0.0, - 3.0, 1.0 );
		plight.intensity = 0.7;
		this.scene.add( plight );

		this.tunnel = new Tunnel();
		this.tunnel.position.y = 0.2;
		this.scene.add( this.tunnel );

		this.renderPipeline = new RenderPipeline( this.renderer, 0.5, 3, this.commonUniforms );

	}

	private loadModels() {

		let loader = new GLTFLoader();

		loader.load( '../assets/gl/hanagl/model/nose.glb', ( gltf ) => {

			let scene = gltf.scene;

			this.createObjects( scene );

		} );

	}

	private createObjects( scene: THREE.Group ) {

		this.nose = new Nose( this.renderer, scene );
		this.nose.position.y = 0.6;
		this.scene.add( this.nose );

		this.finger = new Finger( scene );
		this.nose.add( this.finger );

		this.touchScreen = new TouchScreen();
		this.scene.add( this.touchScreen );

	}

	public animate( deltaTime: number ) {

		this.tunnel.update( deltaTime, this.nose && this.nose.splashValue );

		if ( this.nose ) {

			this.nose.update( this.time, deltaTime );

		}

		if ( this.finger ) {

			let isSplash = this.nose.updateFingerPos( this.finger.getWorldPosition( new THREE.Vector3() ) );

			let m = 1.0 - this.commonUniforms.contentVisibility.value;

			this.camera.position.set( 0, 0, 5 + ( m ) * 3.0 );

			this.camera.position.x = this.finger.position.x * 0.3;
			this.camera.position.y = this.finger.position.y * 0.3 - 0.2;

			this.camera.lookAt( this.finger.position.x * 0.00, this.finger.position.y * 0.00, 0 );

			this.camera.applyMatrix4( new THREE.Matrix4().makeRotationZ( m * 1.7 ) );

			this.finger.updatePos();

			this.commonUniforms.isGlitch.value = isSplash;

		}

		this.renderPipeline.render( this.scene, this.camera, this.renderTarget );

	}

	public onResize() {

		super.onResize();

		this.renderPipeline.resize( this.info.size.canvasPixelSize );

		if ( this.info.size.canvasAspectRatio > 1.0 ) {

			// pc
			this.camera.position.z = 5;
			this.camera.lookAt( 0.0, 0, 0 );


		} else {

			// sumaho
			this.camera.position.z = 6;
			this.camera.lookAt( 0.0, 0, 0 );


		}

	}

	public onHover( args: ORE.TouchEventArgs ) {

		if ( args.position.x != args.position.x || this.commonUniforms.contentVisibility.value < 0.99 ) {

			return;

		}

		if ( this.finger ) {

			let halfWidth = innerWidth / 2;
			let halfHeight = innerHeight / 2;
			let pos = new THREE.Vector2( ( args.position.x - halfWidth ) / halfWidth, - ( args.position.y - halfHeight ) / halfHeight );

			let p = this.touchScreen.getTouchPos( this.camera, pos );

			if ( p ) {

				this.finger.setPos( new THREE.Vector3( p.x, p.y + 0.5, 0 ) );

			}

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
