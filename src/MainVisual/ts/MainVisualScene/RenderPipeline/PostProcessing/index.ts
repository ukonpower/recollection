import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import passThrowVert from './shaders/passThrow.vs';
import { Material, Mesh } from 'three';

type InputRenderTarget = { [key:string]: { value: THREE.WebGLRenderTarget }};

export interface PPParam extends THREE.ShaderMaterialParameters{
	inputRenderTargets?: InputRenderTarget
}

export class PostProcessing {

	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private camera: THREE.OrthographicCamera;
	private screen: THREE.Mesh;

	public effects: {
		material: THREE.ShaderMaterial,
		inputRenderTargets: InputRenderTarget | InputRenderTarget[]
	}[]

	constructor( renderer: THREE.WebGLRenderer, ...materials: PPParam[] ) {

		this.renderer = renderer;
		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera( - 1.0, 1.0, 1.0, - 1.0 );

		this.screen = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ) );
		this.scene.add( this.screen );

		this.createMaterials( materials );

	}

	private createMaterials( params: PPParam[] ) {

		this.effects = [];

		for ( let i = 0; i < params.length; i ++ ) {

			let param = params[ i ];
			param.vertexShader = param.vertexShader || passThrowVert;
			param.uniforms = param.uniforms || {};
			param.uniforms.resolution = {
				value: new THREE.Vector2()
			};

			let inputRenderTargets = param.inputRenderTargets;
			delete param.inputRenderTargets;

			this.effects.push( {
				material: new THREE.ShaderMaterial( param ),
				inputRenderTargets: inputRenderTargets
			} );

		}

	}

	public render( ...renderTargets: { value: THREE.WebGLRenderTarget }[] ) {

		let renderTargetMem = this.renderer.getRenderTarget();

		for ( let i = 0; i < this.effects.length; i ++ ) {

			let effect = this.effects[ i ];
			let material = effect.material;
			let uniforms = material.uniforms;

			if ( effect.inputRenderTargets ) {

				let keys = Object.keys( effect.inputRenderTargets );

				for ( let j = 0; j < keys.length; j ++ ) {

					if ( uniforms[ keys[ j ] ] ) {

						uniforms[ keys[ j ] ].value = effect.inputRenderTargets[ keys[ j ] ].value.texture;

					} else {

						uniforms[ keys[ j ] ] = { value: effect.inputRenderTargets[ keys[ j ] ].value.texture };

					}

				}

			}

			let rendertarget = renderTargets[ i ] ? renderTargets[ i ].value : null;

			if ( rendertarget ) {

				uniforms.resolution.value.set( rendertarget.width, rendertarget.height );

			} else {

				this.renderer.getSize( uniforms.resolution.value );

			}

			this.screen.material = material;

			this.renderer.setRenderTarget( rendertarget );

			this.renderer.render( this.scene, this.camera );

		}

		this.renderer.setRenderTarget( renderTargetMem );

	}

}
