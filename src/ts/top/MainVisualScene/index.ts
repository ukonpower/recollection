import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { RenderPipeline } from './RenderPipeline';

import { ContentSelector } from './ContentSelector';
import { ContentViewer } from './ContentViewer';

import { MainVisualWorld } from './MainVisualWorld';
import { MainVisualManager } from './MainVisualManager';

import { CameraController } from './CameraController';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class MainVisualScene extends ORE.BaseLayer {

	private animator: ORE.Animator;

	private cameraController: CameraController;
	private orbitControls: OrbitControls;

	private renderPipeline: RenderPipeline;

	private contentSelector: ContentSelector;
	private contentViewer: ContentViewer;

	private world: MainVisualWorld;
	private gManager: MainVisualManager;

	constructor() {

		super();

		this.commonUniforms = {
			time: {
				value: 0
			},
			contentNum: {
				value: 0
			},
			contentFade: {
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
		};

	}

	onBind( info: ORE.LayerInfo ) {

		super.onBind( info );

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

		this.camera.near = 0.1;
		this.camera.far = 1000.0;
		this.camera.updateProjectionMatrix();

		this.commonUniforms.camNear.value = this.camera.near;
		this.commonUniforms.camFar.value = this.camera.far;

		this.scene.add( this.camera );
		this.camera.position.set( 0, 3, 10 );

		this.world = new MainVisualWorld( this.info, this.gManager.assetManager, this.renderer, this.scene, this.commonUniforms );
		this.cameraController = new CameraController( this.camera, this.scene.getObjectByName( 'CameraDatas' ), this.gManager.animator, this.commonUniforms );
		this.renderPipeline = new RenderPipeline( this.gManager.assetManager, this.renderer, 0.5, 5.0, this.commonUniforms );

		this.contentViewer = new ContentViewer( this.renderer, this.info, this.commonUniforms );
		this.scene.add( this.contentViewer );

		this.initContentSelector();

	}

	private initContentSelector() {

		this.contentSelector = new ContentSelector( this.world.contents.glList.length, this.commonUniforms );
		this.contentSelector.addEventListener( 'changecontent', ( e ) => {

			this.world.contents.changeContent( e.num );

			this.contentViewer.open( this.world.contents.glList[ e.num ].name );

		} );

	}

	public animate( deltaTime: number ) {

		this.commonUniforms.time.value = this.time;

		this.gManager.update( deltaTime );

		if ( this.gManager.assetManager.isLoaded ) {

			this.updateCameraInfo( deltaTime );

			this.contentSelector.update( deltaTime );

			this.world.contents.update( deltaTime, this.contentSelector.value );
			this.contentViewer.update( deltaTime );

			this.renderPipeline.render( this.scene, this.camera );

		}

	}

	private updateCameraInfo( deltaTime: number ) {

		this.cameraController.update( deltaTime );

		this.commonUniforms.camNear.value = this.camera.near;
		this.commonUniforms.camFar.value = this.camera.far;
		this.commonUniforms.camPosition.value.copy( this.camera.position );
		this.commonUniforms.camWorldMatrix.value = this.camera.matrixWorld;
		this.commonUniforms.camProjectionMatrix.value.copy( this.camera.projectionMatrix );
		this.commonUniforms.camProjectionInverseMatrix.value.copy( this.camera.projectionMatrix ).invert();

	}

	public onHover( args: ORE.TouchEventArgs ) {

		if ( args.position.x != args.position.x ) return;

		if ( this.gManager.assetManager.isLoaded ) {

			this.cameraController.updateCursor( args.normalizedPosition );

		}

	}

	public onWheel( e: WheelEvent, trackpadDelta: number ) {

		e.preventDefault();

		if ( ! this.gManager.assetManager.isLoaded ) return;

		if ( Math.abs( trackpadDelta ) < 5.0 ) return;

		if ( trackpadDelta > 0 ) {

			this.contentSelector.next();

		} else {

			this.contentSelector.prev();

		}

	}

	private touchStartTime: number;

	public onTouchStart( args: ORE.TouchEventArgs ) {

		args.event?.preventDefault();

		if ( ! this.gManager.assetManager.isLoaded ) return;

		this.contentSelector.catch();
		this.contentViewer.touchStart( args );

		this.touchStartTime = this.time;

	}

	public onTouchMove( args: ORE.TouchEventArgs ) {

		args.event?.preventDefault();

		if ( ! this.gManager.assetManager.isLoaded ) return;

		this.contentSelector.drag( args.delta.x );
		this.contentViewer.touchMove( args );

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {

		args.event?.preventDefault();

		if ( ! this.gManager.assetManager.isLoaded ) return;

		this.contentSelector.release( args.delta.x );
		this.contentViewer.touchEnd( args );

		if ( this.time - this.touchStartTime < 0.2 ) {

		}

	}

	public onResize() {

		super.onResize();

		if ( this.gManager.assetManager.isLoaded ) {

			this.renderPipeline.resize( this.info.size.canvasPixelSize );

			this.contentViewer.resize();

			this.cameraController.resize( this.info.aspect );

		}

	}

}
