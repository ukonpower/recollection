import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { RenderPipeline } from './RenderPipeline';

import { MainVisualWorld } from './MainVisualWorld';
import { MainVisualManager } from './MainVisualManager';
import { CameraController } from './CameraController';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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

		this.name = "MainVisualScene";

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

				window.dispatchEvent( new CustomEvent( 'resize' ) );

			}
		} );

	}

	private initAnimator() {

		this.animator = this.gManager.animator;

		this.animator.applyToUniforms( this.commonUniforms );

	}

	private initScene() {

		this.world = new MainVisualWorld( this.gManager.assetManager, this.renderer, this.scene, this.commonUniforms );

		this.camera.near = 0.1;
		this.camera.far = 1000.0;
		this.camera.updateProjectionMatrix();

		this.commonUniforms.camNear.value = this.camera.near;
		this.commonUniforms.camFar.value = this.camera.far;

		this.scene.add( this.camera );
		this.camera.position.set( 0, 3, 10 );

		this.cameraController = new CameraController( this.camera, this.scene.getObjectByName( 'Camera_Datas' ), this.gManager.animator, this.commonUniforms );

		this.renderPipeline = new RenderPipeline( this.gManager.assetManager, this.renderer, this.commonUniforms );

	}

	public animate( deltaTime: number ) {

		this.commonUniforms.time.value = this.time;

		this.gManager.update( deltaTime );

		if ( this.gManager.assetManager.isLoaded ) {

			this.cameraController.update( deltaTime );

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
