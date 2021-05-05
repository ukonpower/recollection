import barba from '@barba/core';
import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { RenderPipeline } from './RenderPipeline';

import { ContentSelector } from './ContentSelector';
import { ContentViewer } from './ContentViewer';

import { MainVisualWorld } from './MainVisualWorld';
import { MainVisualManager } from './MainVisualManager';

import { CameraController } from './CameraController';

export class MainVisualScene extends ORE.BaseLayer {

	private animator: ORE.Animator;

	private cameraController: CameraController;

	private renderPipeline: RenderPipeline;

	private contentSelector: ContentSelector;
	private contentViewer: ContentViewer;

	private world: MainVisualWorld;
	private gManager: MainVisualManager;

	private state = {
		currentContent: '',
		firstMove: true
	}

	constructor() {

		super();

		this.commonUniforms = {
			time: {
				value: 0
			},
			contents: {
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
			},
			portraitWeight: {
				value: 0
			}
		};

	}

	onBind( info: ORE.LayerInfo ) {

		super.onBind( info );

		window.mainVisualRenderer = this.renderer;
		this.info.aspect.portraitAspect = 0.4;

		this.initGmanager();
		this.initERay();

		this.switchInfoVisibility( 'gl' );

	}

	private initGmanager() {

		this.gManager = new MainVisualManager( {
			onPreAssetsLoaded: () => {

				this.initScene();
				window.dispatchEvent( new CustomEvent( 'resize' ) );

			},
			onMustAssetsLoaded: () => {

				setTimeout( () => {

					this.animator.animate( 'loaded1', 1, 1.5, () => {

						this.animator.animate( 'loaded2', 1, 1.5 );

						if ( this.state.currentContent == 'main' ) {

							this.switchInfoVisibility( 'all' );

						}

					} );

				}, 500 );

				window.dispatchEvent( new CustomEvent( 'resize' ) );

			}
		} );

		this.gManager.assetManager.addEventListener( 'mustAssetsProcess', ( e ) => {

			let percent = e.num / ( e.total );

			this.animator.animate( 'loading', percent, 0.5 );

		} );

		this.initAnimator();

	}

	private initAnimator() {

		this.animator = this.gManager.animator;

		this.commonUniforms.contentVisibility = this.animator.add( {
			name: 'contentVisibility',
			easing: {
				func: ORE.Easings.easeInOutCubic,
			},
			initValue: 0,
		} );

		this.commonUniforms.infoVisibility = this.animator.add( {
			name: 'infoVisibility',
			initValue: 0
		} );

		this.commonUniforms.aboutVisibility = this.animator.add( {
			name: 'aboutVisibility',
			initValue: 0
		} );

		this.commonUniforms.aboutRaymarch = this.animator.add( {
			name: 'aboutRaymarch',
			initValue: 0,
		} );

		this.commonUniforms.aboutOffset = this.animator.add( {
			name: 'aboutOffset',
			initValue: Math.random() * 10.0,
		} );

		this.commonUniforms.loading = this.animator.add( {
			name: 'loading',
			initValue: 0,
			easing: {
				func: ORE.Easings.sigmoid
			}
		} );

		this.commonUniforms.loaded1 = this.animator.add( {
			name: 'loaded1',
			initValue: 0,
			easing: {
				func: ORE.Easings.linear,
				args: 6
			}
		} );

		this.commonUniforms.loaded2 = this.animator.add( {
			name: 'loaded2',
			initValue: 0,
			easing: {
				func: ORE.Easings.easeInOutCubic
			}
		} );

	}

	private initScene() {

		/*------------------------
			World
		------------------------*/

		this.world = new MainVisualWorld( this.info, this.gManager.assetManager, this.renderer, this.scene, this.commonUniforms );

		/*------------------------
			CameraController
		------------------------*/

		this.cameraController = new CameraController( this.camera, this.gManager.animator, this.commonUniforms );

		this.addEventListener( 'aboutWillOpen', () => {

			this.cameraController.changeScene( 'about' );

		} );

		this.addEventListener( 'aboutWillClose', () => {

			this.cameraController.changeScene( 'main' );

		} );

		/*------------------------
			ContentSelector
		------------------------*/

		this.contentSelector = new ContentSelector( this.world.contents.glList.length, this.commonUniforms );
		this.scene.add( this.contentSelector );

		this.contentSelector.addEventListener( 'changecontent', ( e ) => {

			this.world.contents.changeContent( e.num );

		} );

		this.addEventListener( 'contentWillOpen', ( e ) => {

			this.contentSelector.enable = false;
			this.contentSelector.setCurrentContent( e.contentIndex );

		} );

		this.addEventListener( 'contentClosed', () => {

			this.contentSelector.enable = true;
			this.contentSelector.initElement();

		} );

		this.addEventListener( 'aboutWillOpen', () => {

			this.contentSelector.enable = false;

		} );

		this.addEventListener( 'aboutClosed', () => {

			this.contentSelector.enable = true;

		} );

		this.gManager.eRay.touchableObjs.push( this.contentSelector.clickTargetMesh );

		/*------------------------
			ContentViewer
		------------------------*/

		this.contentViewer = new ContentViewer( this.renderer, this.info, this.commonUniforms );
		this.addEventListener( 'contentWillOpen', ( e: any ) => {

			this.contentViewer.open( this.world.contents.glList[ e.contentIndex ].fileName );

		} );

		this.addEventListener( 'contentWillClose', ( e ) => {

			if ( e.contentIndex ) {

				this.world.contents.changeContent( e.contentIndex );

			}

		} );

		/*------------------------
			RenderPipeline
		------------------------*/

		this.renderPipeline = new RenderPipeline( this.gManager.assetManager, this.renderer, 0.5, 5.0, this.commonUniforms );

		/*------------------------
			Camera
		------------------------*/

		this.camera.near = 0.1;
		this.camera.far = 1000.0;
		this.camera.updateProjectionMatrix();
		this.camera.position.set( 0, 3, 10 );
		this.commonUniforms.camNear.value = this.camera.near;
		this.commonUniforms.camFar.value = this.camera.far;
		this.commonUniforms.contents.value = this.world.contents.glList.length;

	}

	private initERay() {

		this.gManager.eRay.addEventListener( 'ClickTarget', ( e ) =>{

			let currentGL = this.world.contents.glList[ this.contentSelector.currentContent ];

			barba.go( window.origin + '/gl/' + currentGL.fileName + '.html' );

		} );

		this.gManager.eRay.addEventListener( 'onChangeHitObject', ( e ) => {

			if ( this.contentSelector.enable ) {

				this.switchCursorPointer( e.obj != null );

			}

		} );

	}

	private switchCursorPointer( enable: boolean ) {

		if ( enable ) {

			document.querySelector( '.container' ).parentElement.style.cursor = 'pointer';

		} else {

			document.querySelector( '.container' ).parentElement.style.cursor = 'unset';

		}

	}

	public openAbout() {

		if ( ! this.gManager.assetManager.preAssetsLoaded ) {

			this.gManager.assetManager.addEventListener( 'preAssetsLoaded', this.openAbout.bind( this ) );

			return;

		}

		this.state.currentContent = 'about';

		this.dispatchEvent( {
			type: 'aboutWillOpen'
		} );


		this.animator.animate( 'aboutVisibility', 1.0, 1.0, () => {

			this.world.aboutObj.switchVisibility( true );

			document.body.setAttribute( 'data-about', 'true' );

			this.dispatchEvent( {
				type: 'aboutOpened'
			} );

		} );

	}

	public closeAbout() {

		document.body.setAttribute( 'data-about', 'false' );

		this.dispatchEvent( {
			type: 'aboutWillClose'
		} );

		this.world.aboutObj.switchVisibility( false );

		this.animator.animate( 'aboutVisibility', 0.0, 1.0, () => {

			this.dispatchEvent( {
				type: 'aboutClosed'
			} );

		} );

	}

	private getContentIndex( contentName:string ) {

		let index = this.world.contents.glList.findIndex( ( gl ) => {

			return gl.title == contentName;

		} );

		return index == - 1 ? null : index;

	}

	public openContent( contentName: string ) {

		if ( ! this.gManager.assetManager.preAssetsLoaded ) {

			this.gManager.assetManager.addEventListener( 'preAssetsLoaded', this.openContent.bind( this, contentName ) );

			return;

		}

		this.switchCursorPointer( false );

		this.dispatchEvent( {
			type: 'contentWillOpen',
			contentIndex: this.getContentIndex( contentName )
		} );

		return this.animator.animate( 'contentVisibility', 1, this.state.currentContent == '' ? 0 : 6, () => {

			this.state.currentContent = contentName;

			this.dispatchEvent( {
				type: 'contentOpened'
			} );

		} );

	}

	public closeContent( skipAnimation: boolean = false ) {

		if ( ! this.gManager.assetManager.preAssetsLoaded ) {

			this.gManager.assetManager.addEventListener( 'preAssetsLoaded', () => {

				this.closeContent( skipAnimation );

			} );

			return;

		}

		let contentIndex = this.getContentIndex( this.state.currentContent );

		this.state.currentContent = 'main';

		this.dispatchEvent( {
			type: 'contentWillClose',
			contentIndex: contentIndex
		} );

		return this.animator.animate( 'contentVisibility', 0, skipAnimation ? 0 : 4, () => {

			this.dispatchEvent( {
				type: 'contentClosed'
			} );

		} );

	}

	public switchInfoVisibility( state: 'all' | 'hide' | 'gl' ) {

		if ( ! this.gManager.assetManager.preAssetsLoaded ) {

			this.gManager.assetManager.addEventListener( 'preAssetsLoaded', () => {

				this.switchInfoVisibility( state );

			} );

			return;

		}

		if ( this.animator.isAnimatingVariable( 'infoVisibility' ) ) {

			let callback = this.animator.getVariableObject( 'infoVisibility' ).onAnimationFinished;
			callback && callback();

		}

		//infoが閉じるときはContentSelecorを停止
		if ( state == 'hide' ) {

			this.contentSelector.enable = false;

		}

		document.body.setAttribute( 'data-info', state == 'all' ? 'true' : 'false' );

		return this.animator.animate( 'infoVisibility', state == 'all' || state == 'gl' ? 1.0 : 0.0, 1.0 );

	}

	public animate( deltaTime: number ) {

		deltaTime = Math.min( deltaTime, 0.1 );
		this.commonUniforms.time.value = this.time;

		// console.log( this.commonUniforms.aboutVisibility.value );


		// this.commonUniforms.contentVisibility.value = ( Math.sin( this.commonUniforms.time.value * 0.8 ) * 0.5 + 0.5 ) * 1.0 + 0.0;

		this.gManager.update( deltaTime );
		this.updateCameraUnifrorms( deltaTime );

		if ( this.gManager.assetManager.preAssetsLoaded ) {

			this.contentViewer.update( deltaTime );

			this.renderPipeline.render( this.scene, this.camera, this.contentViewer.contentRenderTarget );

		}

		if ( this.gManager.assetManager.mustAssetsLoaded ) {

			this.contentSelector.update( deltaTime );

			this.world.contents.update( deltaTime, this.contentSelector.value );

		}

	}

	private updateCameraUnifrorms( deltaTime: number ) {

		this.cameraController && this.cameraController.update( deltaTime );
		this.commonUniforms.camNear.value = this.camera.near;
		this.commonUniforms.camFar.value = this.camera.far;
		this.commonUniforms.camPosition.value.copy( this.camera.position );
		this.commonUniforms.camWorldMatrix.value = this.camera.matrixWorld;
		this.commonUniforms.camProjectionMatrix.value.copy( this.camera.projectionMatrix );
		this.commonUniforms.camProjectionInverseMatrix.value.copy( this.camera.projectionMatrix ).invert();

	}

	public onHover( args: ORE.TouchEventArgs ) {

		if ( args.position.x != args.position.x ) return;

		if ( this.gManager.assetManager.mustAssetsLoaded ) {

			this.contentViewer.onHover( args );

			this.cameraController.updateCursor( args.normalizedPosition.clone().multiplyScalar( 1.0 - this.info.aspect.portraitWeight ) );
			this.gManager.eRay.checkHitObject( args.normalizedPosition, this.camera, this.gManager.eRay.touchableObjs );

		}

	}

	public onWheel( e: WheelEvent, trackpadDelta: number ) {

		if ( ! this.gManager.assetManager.mustAssetsLoaded ) return;

		if ( Math.abs( trackpadDelta ) < 5.0 ) return;

		if ( trackpadDelta > 0 ) {

			this.contentSelector.next();

		} else {

			this.contentSelector.prev();

		}

	}

	public onTouchStart( args: ORE.TouchEventArgs ) {

		if ( ! this.gManager.assetManager.mustAssetsLoaded ) return;

		this.contentSelector.catch();
		this.contentViewer.touchStart( args );

		this.gManager.eRay.touchStart( args.normalizedPosition, this.camera, this.gManager.eRay.touchableObjs );

	}

	public onTouchMove( args: ORE.TouchEventArgs ) {

		args.event?.preventDefault();

		if ( ! this.gManager.assetManager.mustAssetsLoaded ) return;

		this.contentSelector.drag( args.delta.x );
		this.contentViewer.touchMove( args );

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {

		if ( ! this.gManager.assetManager.mustAssetsLoaded ) return;

		this.contentSelector.release( args.delta.x );
		this.contentViewer.touchEnd( args );

		this.gManager.eRay.touchEnd( args.normalizedPosition, this.camera, this.gManager.eRay.touchableObjs );

	}

	public onResize() {

		super.onResize();

		if ( this.gManager.assetManager.preAssetsLoaded ) {

			this.renderPipeline.resize( this.info.size.canvasPixelSize );
			this.contentViewer.resize();
			this.cameraController.resize( this.info.aspect );
			this.world.resize( this.info );

			this.commonUniforms.windowAspect.value = this.info.size.canvasAspectRatio;
			this.commonUniforms.portraitWeight.value = this.info.aspect.portraitWeight;

		}

	}

}
