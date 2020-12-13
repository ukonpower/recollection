import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import contentViewerVert from './shaders/contentViewer.vs';
import contentViewerFrag from './shaders/contentViewer.fs';
import { BaseGL } from 'src/gl/BaseGL';

export class ContentViewer extends THREE.Mesh {

	private renderer: THREE.WebGLRenderer;
	private contentRenderTarget: THREE.WebGLRenderTarget;
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

		let geo = new THREE.PlaneBufferGeometry( 1.0, 1.0 );
		let mat = new THREE.ShaderMaterial( {
			vertexShader: contentViewerVert,
			fragmentShader: contentViewerFrag,
			uniforms: uni
		} );

		super( geo, mat );

		this.renderer = renderer;
		this.layerInfo = layerInfo;
		this.contentRenderTarget = contentRenderTarget;
		
		this.resize();
		
	}

	public open( sceneName: string ) {

		import( '@gl/' + sceneName + '/index.ts' ).then( ( e ) => {

			let Scene = e.default as ( typeof BaseGL );

			this.currentScene = new Scene( this.renderer, this.layerInfo, this.contentRenderTarget );

		} );

	}

	public update( deltaTime: number ) {

		if ( this.currentScene ) {
			
			this.currentScene.animate( deltaTime );

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

	public onTouchStart( args: ORE.TouchEventArgs ) {

		if ( this.currentScene ) {

			this.currentScene.onTouchStart( args );

		}

	}

	public onTouchMove( args: ORE.TouchEventArgs ) {

		if ( this.currentScene ) {

			this.currentScene.onTouchMove( args );

		}

	}

	public onTouchEnd( args: ORE.TouchEventArgs ) {

		if ( this.currentScene ) {

			this.currentScene.onTouchEnd( args );

		}

	}

	public resize() {

		this.contentRenderTarget.setSize( this.layerInfo.size.canvasPixelSize.x, this.layerInfo.size.canvasPixelSize.y)
		
		if ( this.currentScene ) {

			this.currentScene.onResize();

		}

	}


}
