import barba from '@barba/core';
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

	private state = {
		renderMainVisual: false,
		renderContent: false,
		animatingInfoVisibility: false
	}

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
			windowAspect: {
				value: 1.0
			}
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

		this.initERay();

	}

	private initAnimator() {

		this.animator = this.gManager.animator;

		this.commonUniforms.contentVisibility = this.animator.add( {
			name: 'contentVisibility',
			initValue: 0,
		} );

		this.commonUniforms.infoVisibility = this.animator.add( {
			name: 'infoVisibility',
			initValue: 1
		} );

	}

	private initERay() {

		this.gManager.eRay.addEventListener( 'ClickTarget', ( e ) =>{

			this.contentSelector.enable = false;

			let currentGL = this.world.contents.glList[ this.contentSelector.currentContent ];

			barba.go( window.origin + '/gl/' + currentGL.fileName + '.html' );

		} );

		this.gManager.eRay.addEventListener( 'onChangeHitObject', ( e ) => {

			if ( e.obj ) {

				document.querySelector( '.container' ).parentElement.style.cursor = 'pointer';

			} else {

				document.querySelector( '.container' ).parentElement.style.cursor = 'unset';

			}

		} );

	}

	public openContent( contentName: string ) {

		if ( ! this.gManager.assetManager.isLoaded ) {

			this.gManager.assetManager.addEventListener( 'mustAssetsLoaded', () => {

				this.animator.setValue( 'contentVisibility', 1.0 );
				this.openContent( contentName );

			} );

			return;

		}

		let contentIndex = this.world.contents.glList.findIndex( ( gl ) => {

			return gl.title == contentName;

		} );

		this.contentSelector.setCurrentContent( contentIndex );
		this.contentViewer.open( this.world.contents.glList[ this.contentSelector.value ].fileName );

		this.state.renderContent = true;
		this.contentSelector.enable = false;

		return this.animator.animate( 'contentVisibility', 1, 6, () => {

			this.state.renderMainVisual = false;
			this.switchInfoVisibility( true );

		} );

	}

	public closeContent() {

		this.state.renderMainVisual = true;

		return this.animator.animate( 'contentVisibility', 0, 4, () => {

			this.state.renderContent = false;
			this.contentSelector.enable = true;
			this.switchInfoVisibility( true );

		} );

	}

	public switchInfoVisibility( visibility: boolean ) {

		if ( ! this.gManager.assetManager.isLoaded ) {

			this.gManager.assetManager.addEventListener( 'mustAssetsLoaded', () => {

				this.switchInfoVisibility( visibility );

			} );

			return;

		}

		console.log( this.state.animatingInfoVisibility );


		if ( this.state.animatingInfoVisibility ) {

			let callback = this.animator.getVariableObject( 'infoVisibility' ).onAnimationFinished;
			callback && callback();

		}

		let promise = new Promise( resolve => {

			this.state.animatingInfoVisibility = true;

			document.body.setAttribute( 'data-info', visibility ? 'true' : 'false' );

			this.animator.animate( 'infoVisibility', visibility ? 1.0 : 0.0, 1.0, () => {

				this.state.animatingInfoVisibility = false;

				resolve( null );

			} );

		} );

		return promise;

	}

	private initScene() {

		this.camera.near = 0.1;
		this.camera.far = 1000.0;
		this.camera.updateProjectionMatrix();
		this.camera.position.set( 0, 3, 10 );

		this.commonUniforms.camNear.value = this.camera.near;
		this.commonUniforms.camFar.value = this.camera.far;

		this.world = new MainVisualWorld( this.info, this.gManager.assetManager, this.renderer, this.scene, this.commonUniforms );

		this.cameraController = new CameraController( this.camera, this.scene.getObjectByName( 'CameraDatas' ), this.gManager.animator, this.commonUniforms );
		this.renderPipeline = new RenderPipeline( this.gManager.assetManager, this.renderer, 0.5, 5.0, this.commonUniforms );

		this.contentViewer = new ContentViewer( this.renderer, this.info, this.commonUniforms );
		// this.scene.add( this.contentViewer );

		this.initContentSelector();

	}

	private initContentSelector() {

		this.contentSelector = new ContentSelector( this.world.contents.glList.length, this.commonUniforms );
		this.contentSelector.addEventListener( 'changecontent', ( e ) => {

			this.world.contents.changeContent( e.num );

		} );

		this.gManager.eRay.touchableObjs.push( this.contentSelector.clickTargetMesh );

		this.scene.add( this.contentSelector );

	}

	public animate( deltaTime: number ) {

		deltaTime = Math.min( deltaTime, 0.1 );

		this.commonUniforms.time.value = this.time;

		this.gManager.update( deltaTime );

		if ( this.gManager.assetManager.isLoaded ) {

			let a = ( Math.sin( this.time ) * 0.5 + 0.5 );

			// this.commonUniforms.contentVisibility.value = ( Math.max( 0.3, a ) - 0.3 ) * ( 10 / 7 );
			// this.commonUniforms.infoVisibility.value = 1.0 - ( Math.min( 0.3, a ) ) * 3.3333;

			// this.commonUniforms.contentVisibility.value = 0.5 + Math.sin( this.time ) * 0.1;
			// this.commonUniforms.contentVisibility.value = ( Math.sin( this.time ) * 0.5 + 0.5 ) * 0.9;
			// this.commonUniforms.contentVisibility.value = ( Math.sin( this.time ) * 0.5 + 0.5 ) * 0.7;
			// this.commonUniforms.infoVisibility.value = 0.0;

			this.updateCameraInfo( deltaTime );

			this.contentSelector.update( deltaTime );

			this.world.contents.update( deltaTime, this.contentSelector.value );

			// if ( this.state.renderContent ) {

			this.contentViewer.update( deltaTime );

			// }

			this.renderPipeline.render( this.scene, this.camera, this.state.renderMainVisual, this.contentViewer.contentRenderTarget );

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

			this.contentViewer.onHover( args );

			this.cameraController.updateCursor( args.normalizedPosition );
			this.gManager.eRay.checkHitObject( args.normalizedPosition, this.camera, this.gManager.eRay.touchableObjs );

		}

	}

	public onWheel( e: WheelEvent, trackpadDelta: number ) {

		if ( ! this.gManager.assetManager.isLoaded ) return;

		if ( Math.abs( trackpadDelta ) < 5.0 ) return;

		if ( trackpadDelta > 0 ) {

			this.contentSelector.next();

		} else {

			this.contentSelector.prev();

		}

	}

	public onTouchStart( args: ORE.TouchEventArgs ) {

		args.event?.preventDefault();

		if ( ! this.gManager.assetManager.isLoaded ) return;

		this.contentSelector.catch();
		this.contentViewer.touchStart( args );

		this.gManager.eRay.touchStart( args.normalizedPosition, this.camera, this.gManager.eRay.touchableObjs );

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

		this.gManager.eRay.touchEnd( args.normalizedPosition, this.camera, this.gManager.eRay.touchableObjs );

	}

	public onResize() {

		super.onResize();

		if ( this.gManager.assetManager.isLoaded ) {

			this.renderPipeline.resize( this.info.size.canvasPixelSize );

			this.contentViewer.resize();

			this.cameraController.resize( this.info.aspect );

			this.commonUniforms.windowAspect.value = this.info.size.canvasAspectRatio;

		}

	}

}
