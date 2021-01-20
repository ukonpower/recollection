import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import contentViewerVert from './shaders/contentViewer.vs';
import contentViewerFrag from './shaders/contentViewer.fs';
import { BaseGL } from '@gl/BaseGL';

export class ContentViewer extends THREE.Mesh {

	public contentRenderTarget: THREE.WebGLRenderTarget;

	private renderer: THREE.WebGLRenderer;
	private layerInfo: ORE.LayerInfo;

	private commonUniforms: ORE.Uniforms;
	private currentScene: BaseGL;

	constructor( renderer: THREE.WebGLRenderer, layerInfo: ORE.LayerInfo, parentUniforms?: ORE.Uniforms ) {

		let contentRenderTarget = new THREE.WebGLRenderTarget( 1, 1 );

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			tex: {
				value: contentRenderTarget.texture
			}
		} );

		let geo = new THREE.PlaneBufferGeometry( 2.0, 2.0 );
		let mat = new THREE.ShaderMaterial( {
			vertexShader: contentViewerVert,
			fragmentShader: contentViewerFrag,
			uniforms: uni,
		} );

		super( geo, mat );

		this.customDepthMaterial = new THREE.ShaderMaterial( {
			vertexShader: contentViewerVert,
			fragmentShader: THREE.ShaderLib.depth.fragmentShader,
			defines: {
				'DEPTH_PACKING': THREE.RGBADepthPacking,
			}
		} );

		this.renderer = renderer;
		this.layerInfo = layerInfo;
		this.contentRenderTarget = contentRenderTarget;

		this.commonUniforms = {
			contentVisibility: parentUniforms.contentVisibility,
			infoVisibility: parentUniforms.infoVisibility,
		};

		this.resize();

	}

	public open( sceneName: string ) {

		import( '@gl/' + sceneName + '/index.ts' ).then( ( e ) => {

			let Scene = e.default as ( typeof BaseGL );

			this.currentScene = new Scene( this.renderer, this.layerInfo, this.contentRenderTarget, this.commonUniforms );
			this.currentScene.onResize();

			this.dispatchEvent( {
				type: 'loaded',
				sceneName: sceneName,
				scene: this.currentScene
			} );

		} );

		this.dispatchEvent( {
			type: 'loadstart',
			sceneName: sceneName
		} );

	}

	public update( deltaTime: number ) {

		if ( this.currentScene ) {

			this.currentScene.tick( deltaTime );

		}

	}

	public onHover( args: ORE.TouchEventArgs ) {

		if ( this.currentScene ) {

			this.currentScene.onHover( args );

		}

	}

	public onWheel( e: WheelEvent, trackpadDelta: number ) {

		if ( this.currentScene ) {

			this.currentScene.onWheel( e, trackpadDelta );

		}

	}

	public touchStart( args: ORE.TouchEventArgs ) {

		if ( this.currentScene ) {

			this.currentScene.onTouchStart( args );

		}

	}

	public touchMove( args: ORE.TouchEventArgs ) {

		if ( this.currentScene ) {

			this.currentScene.onTouchMove( args );

		}

	}

	public touchEnd( args: ORE.TouchEventArgs ) {

		if ( this.currentScene ) {

			this.currentScene.onTouchEnd( args );

		}

	}

	public resize() {

		this.contentRenderTarget.setSize( this.layerInfo.size.canvasPixelSize.x, this.layerInfo.size.canvasPixelSize.y );

		if ( this.currentScene ) {

			this.currentScene.onResize();

		}

	}

}
