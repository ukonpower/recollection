import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { RenderPipeline } from './RenderPipeline';

import { MainVisualWorld } from './MainVisualWorld';
import { MainVisualManager } from './MainVisualManager';
import { CameraController } from './CameraController';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { timeStamp } from 'console';

export class MainVisualScene extends ORE.BaseScene {

	private animator: ORE.Animator;

	private commonUniforms: ORE.Uniforms;
	private cameraController: CameraController;
	private orbitControls: OrbitControls;

	private renderPipeline: RenderPipeline;

	private world: MainVisualWorld;
	private gManager: MainVisualManager;

	constructor() {

		super();

		this.name = "MainScene";

		this.commonUniforms = {
			time: {
				value: 0
			},
			camNear: {
				value: 0
			},
			camFar: {
				value: 0
			},
			camPosition: {
				value: new THREE.Vector3()
			},
			camWorldMatrix: {
				value: null
			},
			camProjectionMatrix: {
				value: new THREE.Matrix4()
			},
			camProjectionInverseMatrix: {
				value: new THREE.Matrix4()
			},
			raymarchTex: {
				value: null
			},
		};

	}

	onBind( gProps: ORE.GlobalProperties ) {

		super.onBind( gProps );

		this.gManager = new MainVisualManager( {
			onMustAssetsLoaded: () => {

				this.initAnimator();

				this.initScene();

				this.initTimeline();

				window.dispatchEvent( new CustomEvent( 'resize' ) );

			}
		} );

	}

	private initAnimator() {

		this.animator = this.gManager.animator;

		this.animator.add( {
			name: 'dustVisibility',
			initValue: 0.0
		} );

		this.animator.add( {
			name: 'trailVisibility',
			initValue: 0.0
		} );

		this.animator.add( {
			name: 'phase',
			initValue: 1.0
		} );

		this.animator.add( {
			name: 'movieVisibility',
			initValue: 0,
		} );

		this.animator.add( {
			name: 'CameraPosition',
			initValue: new THREE.Vector3( 0, 0, 0 ),
			easing: {
				func: ORE.Easings.linear
			}
		} );

		this.animator.applyToUniforms( this.commonUniforms );

	}

	private initTimeline() {

		this.initParams();

		this.initPhaseTimeline();
		this.initCameraTimeline();

	}

	private initParams() {

		this.world.dust.visible = true;
		this.animator.setValue( 'dustVisibility', 1 );
		this.world.trails.visible = false;
		this.animator.setValue( 'trailVisibility', 0 );

		this.animator.setValue( 'movieVisibility', 1.0, );

	}

	private async initPhaseTimeline() {

		/*------------------------
			Phase1
		------------------------*/
		this.animator.animate( 'movieVisibility', 1.0, 5 );
		await this.setPhase( 1, 10 );

		/*------------------------
			Phase2
		------------------------*/
		await this.setPhase( 2, 15 );

		/*------------------------
			Phase3
		------------------------*/
		this.world.dust.visible = true;
		this.animator.animate( 'dustVisibility', 1, 1 );
		await this.setPhase( 3, 15 );

		/*------------------------
			Phase4
		------------------------*/
		this.world.trails.visible = true;
		this.animator.animate( 'trailVisibility', 1, 1 );
		await this.setPhase( 4, 25 );


		/*------------------------
			End
		------------------------*/

		this.world.trails.visible = true;
		this.animator.animate( 'trailVisibility', 1, 1 );
		await this.setPhase( 5, 5 );


		this.animator.animate( 'movieVisibility', 0.0, 5, () => {

			this.initTimeline();

		} );


	}

	private async initCameraTimeline() {

		let sp = new THREE.Vector3();
		let ep = new THREE.Vector3();

		/*------------------------
			Phase1 10s
		------------------------*/

		sp.set( 0, 2, 5 );
		ep.set( 0, 2, 15 );
		await this.doCameraAnimate( sp, ep, 5 );

		sp.set( 5, 2, 10 );
		ep.set( - 5, 2, 10 );
		await this.doCameraAnimate( sp, ep, 6 );

		/*------------------------
			Phase2
		------------------------*/
		sp.set( - 10, 2, - 10 );
		ep.set( - 10, 2, 10 );
		await this.doCameraAnimate( sp, ep, 7 );

		sp.set( 10, 5, - 10 );
		ep.set( 10, 5, 10 );
		await this.doCameraAnimate( sp, ep, 7 );

		/*------------------------
			Phase3
		------------------------*/
		sp.set( - 4, 2, 10 );
		ep.set( 4, 1, 10 );
		await this.doCameraAnimate( sp, ep, 5 );

		sp.set( 1, 5, 4 );
		ep.set( 1, 1, 10 );
		await this.doCameraAnimate( sp, ep, 10 );

		/*------------------------
			Phase4
		------------------------*/
		sp.set( 0, 1, 20 );
		ep.set( 0, 3, 10 );
		await this.doCameraAnimate( sp, ep, 5 );

		sp.set( - 4, 7, 0 );
		ep.set( - 4, 7, 10 );
		await this.doCameraAnimate( sp, ep, 5 );

		sp.set( 0, 5, 10 );
		ep.set( 0, 1, 10 );
		await this.doCameraAnimate( sp, ep, 5 );

		sp.set( - 10, 3, - 8 );
		ep.set( - 10, 3, 8 );
		await this.doCameraAnimate( sp, ep, 5 );

		sp.set( 10, 2, - 10 );
		ep.set( 10, 2, 10 );
		await this.doCameraAnimate( sp, ep, 5 );

		/*------------------------
			End
		------------------------*/
		sp.set( 0, 2, 5 );
		ep.set( 0, 2, 20 );
		await this.doCameraAnimate( sp, ep, 10 );

	}


	private setPhase( phase: number, duration: number ) {

		this.animator.animate( 'phase', phase, 1 );

		let promise = new Promise( ( resolve ) => {

			setTimeout( () => {

				resolve();

			}, duration * 1000 );

		} );

		return promise;

	}

	private doCameraAnimate( sp: THREE.Vector3, ep: THREE.Vector3, dur: number, callBack?: Function ) {

		let promise = new Promise( ( resolve ) => {

			this.animator.setValue( 'CameraPosition', sp );
			this.animator.animate( 'CameraPosition', ep, dur, () => {

				resolve();

			} );

		} );

		return promise;

	}

	private cameraFreedomMove() {

		let p = new THREE.Vector3(
			( Math.random() - 0.5 ) * 10,
			( Math.random() - 0.0 ) * 10,
			( Math.random() - 0.0 ) * 10 + 0.5,
		);

		this.animator.animate( 'CameraPosition', p, 3, () => {

			this.cameraFreedomMove();

		} );

	}

	private initScene() {

		this.scene.add( this.gManager.assetManager.gltfScene );

		this.world = new MainVisualWorld( this.gManager.assetManager, this.renderer, this.scene, this.commonUniforms );

		this.camera.near = 0.1;
		this.camera.far = 1000.0;
		this.camera.updateProjectionMatrix();

		this.commonUniforms.camNear.value = this.camera.near;
		this.commonUniforms.camFar.value = this.camera.far;

		this.scene.add( this.camera );
		this.camera.position.set( 10, 3, 10 );

		this.cameraController = new CameraController( this.camera, this.scene.getObjectByName( 'Camera_Datas' ), this.gManager.animator, this.commonUniforms );

		this.orbitControls = new OrbitControls( this.camera, this.renderer.domElement );

		this.renderPipeline = new RenderPipeline( this.renderer, this.commonUniforms );

	}

	public animate( deltaTime: number ) {

		this.commonUniforms.time.value = this.time;

		this.gManager.update( deltaTime );

		if ( this.gManager.assetManager.isLoaded ) {

			this.cameraController.update( deltaTime );
			// this.orbitControls.update();

			this.commonUniforms.camPosition.value.copy( this.camera.position );
			this.commonUniforms.camWorldMatrix.value = this.camera.matrixWorld;
			this.commonUniforms.camProjectionMatrix.value.copy( this.camera.projectionMatrix );
			this.commonUniforms.camProjectionInverseMatrix.value.getInverse( this.camera.projectionMatrix );

			this.world.update( deltaTime );

			this.renderPipeline.render( this.scene, this.camera );

		}

	}

	public onHover( cursor: ORE.Cursor ) {

		if ( cursor.position.x != cursor.position.x ) return;

		let cursorPosWindowNormalized = cursor.getNormalizePosition( this.gProps.resizeArgs.windowSize );

		if ( this.gManager.assetManager.isLoaded ) {

			this.cameraController.updateCursor( cursorPosWindowNormalized );

		}

	}

	public onResize( args: ORE.ResizeArgs ) {

		super.onResize( args );

		if ( this.gManager.assetManager.isLoaded ) {

			this.renderPipeline.resize( args.windowPixelSize );

			this.world.resize( args );

			this.cameraController.resize( args );

		}

	}

}
