import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { AssetManager } from '../MainVisualManager/AssetManager';
import { PostProcessing } from './PostProcessing';

import depthVert from './shaders/depth.vs';

//raymarch
import raymarchFrag from './shaders/raymarch.fs';

//mix
import mixFrag from './shaders/mix.fs';

//bloom shader
import bloomBlurFrag from './shaders/bloomBlur.fs';
import bloomBrightFrag from './shaders/bloomBright.fs';

//smaa shaders
import edgeDetectionVert from './shaders/smaa_edgeDetection.vs';
import edgeDetectionFrag from './shaders/smaa_edgeDetection.fs';
import blendingWeightCalculationVert from './shaders/smaa_blendingWeightCalculation.vs';
import blendingWeightCalculationFrag from './shaders/smaa_blendingWeightCalculation.fs';
import neiborhoodBlendingVert from './shaders/smaa_neiborhoodBlending.vs';
import neiborhoodBlendingFrag from './shaders/smaa_neiborhoodBlending.fs';

//composite shader
import compositeFrag from './shaders/composite.fs';

//sceneMix shader
import sceneMixerFrag from './shaders/sceneMixer.fs';

export class RenderPipeline {

	private commonUniforms: ORE.Uniforms;
	private smaaCommonUni: ORE.Uniforms;

	private assetManager: AssetManager;
	private renderer: THREE.WebGLRenderer;

	private inputTextures: ORE.Uniforms;

	private bloomResolutionRatio: number;
	private bloomRenderCount: number;

	private raymarch: PostProcessing;
	private mix: PostProcessing;
	private bloomBrightPP: PostProcessing;
	private bloomBlurPP: PostProcessing;
	private smaaEdgePP: PostProcessing;
	private smaaCalcWeighttPP: PostProcessing;
	private smaaBlendingPP: PostProcessing;

	private compositePP: PostProcessing;

	private sceneMixerPP: PostProcessing;

	private renderTargets: {
		[keys:string]: { value: THREE.WebGLRenderTarget }
	};

	constructor( assetManager: AssetManager, renderer: THREE.WebGLRenderer, bloomResolutionRatio: number = 0.5, bloomRenderCount: number = 5, parentUniforms?: ORE.Uniforms ) {

		this.assetManager = assetManager;
		this.renderer = renderer;
		this.bloomResolutionRatio = bloomResolutionRatio;
		this.bloomRenderCount = bloomRenderCount;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.initRenderTargets();
		this.initInputTextures();
		this.initPostProcessings();

	}

	private initRenderTargets() {

		this.renderTargets = {
			sceneDepth: {
				value: new THREE.WebGLRenderTarget( 0, 0, {
					stencilBuffer: false,
					generateMipmaps: false,
					depthBuffer: true,
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter
				} )
			},
			raymarch: {
				value: new THREE.WebGLRenderTarget( 0, 0, {
					stencilBuffer: false,
					generateMipmaps: false,
					depthBuffer: false,
					// type: THREE.HalfFloatType,
					minFilter: THREE.NearestFilter,
					magFilter: THREE.NearestFilter
				} )
			},
			rt1: {
				value: new THREE.WebGLRenderTarget( 0, 0, {
					stencilBuffer: false,
					generateMipmaps: false,
					depthBuffer: true,
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter
				} )
			},
			rt2: {
				value: new THREE.WebGLRenderTarget( 0, 0, {
					depthBuffer: false,
					stencilBuffer: false,
					generateMipmaps: false,
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter
				} )
			},
			rt3: {
				value: new THREE.WebGLRenderTarget( 0, 0, {
					depthBuffer: false,
					stencilBuffer: false,
					generateMipmaps: false,
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter
				} )
			},
		};

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			this.renderTargets[ 'rtBlur' + i.toString() + '_0' ] = {
				value: new THREE.WebGLRenderTarget( 0, 0, {
					depthBuffer: false,
					stencilBuffer: false,
					generateMipmaps: false,
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter
				} )
			};

			this.renderTargets[ 'rtBlur' + i.toString() + '_1' ] = {
				value: new THREE.WebGLRenderTarget( 0, 0, {
					depthBuffer: false,
					stencilBuffer: false,
					generateMipmaps: false,
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter
				} )
			};

		}

	}

	private initInputTextures() {

		this.inputTextures = {
			areaTex: {
				value: null
			},
			searchTex: {
				value: null
			},
			envMap: {
				value: null
			}
		};

		let loader = new THREE.TextureLoader();
		loader.load( '/assets/smaa/smaa-area.png', ( tex ) => {

			tex.minFilter = THREE.LinearFilter;
			tex.generateMipmaps = false;
			tex.format = THREE.RGBFormat;
			tex.flipY = false;
			this.inputTextures.areaTex.value = tex;

		} );

		loader.load( '/assets/smaa/smaa-search.png', ( tex ) => {

			tex.minFilter = THREE.NearestFilter;
			tex.magFilter = THREE.NearestFilter;
			tex.generateMipmaps = false;
			tex.flipY = false;
			this.inputTextures.searchTex.value = tex;

		} );

		let cubemapLoader = new THREE.CubeTextureLoader();
		cubemapLoader.load( [
			'/assets/scene/img/env/px.jpg',
			'/assets/scene/img/env/nx.jpg',
			'/assets/scene/img/env/py.jpg',
			'/assets/scene/img/env/ny.jpg',
			'/assets/scene/img/env/pz.jpg',
			'/assets/scene/img/env/nz.jpg',
		], ( tex ) => {

			this.inputTextures.envMap.value = tex;

		} );

	}

	private initPostProcessings() {

		/*------------------------
			Raymarch
		------------------------*/
		this.raymarch = new PostProcessing( this.renderer, {
			fragmentShader: raymarchFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( {
				envMap: this.inputTextures.envMap
			}, this.commonUniforms ),
		} );

		/*------------------------
			mix
		------------------------*/
		this.mix = new PostProcessing( this.renderer, {
			fragmentShader: mixFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( {
			}, this.commonUniforms ),
		} );

		/*------------------------
			Bloom
		------------------------*/
		this.bloomBrightPP = new PostProcessing( this.renderer, {
			fragmentShader: bloomBrightFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( {
				threshold: {
					value: 0.5,
				},
			}, this.commonUniforms ),
		} );

		this.bloomBlurPP = new PostProcessing( this.renderer, {
			fragmentShader: bloomBlurFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( {
				backbuffer: {
					value: null
				},
				blurRange: {
					value: 1.0
				},
				renderCount: {
					value: this.bloomRenderCount
				},
				count: {
					value: 0
				},
				direction: { value: false },
			}, this.commonUniforms ),
		} );

		/*------------------------
			SMAA
		------------------------*/

		let defines = {
			"mad(a, b, c)": "(a * b + c)",
			"SMAA_THRESHOLD": "0.1",
			"SMAA_LOCAL_CONTRAST_ADAPTATION_FACTOR": "2.0",
			"SMAA_MAX_SEARCH_STEPS": "8",
			"SMAA_AREATEX_MAX_DISTANCE": "16",
			"SMAA_SEARCHTEX_SIZE": "vec2(66.0, 33.0)",
			"SMAA_AREATEX_PIXEL_SIZE": "( 1.0 / vec2( 160.0, 560.0 ) )",
			"SMAA_AREATEX_SUBTEX_SIZE": "( 1.0 / 7.0 )",
			"SMAA_SEARCHTEX_SELECT(sample)": "sample.g",
			"SMAA_AREATEX_SELECT(sample)": "sample.rg",
		};

		this.smaaCommonUni = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			SMAA_RT_METRICS: {
				value: new THREE.Vector4()
			}
		} );

		this.smaaEdgePP = new PostProcessing( this.renderer,
			{
				vertexShader: edgeDetectionVert,
				fragmentShader: edgeDetectionFrag,
				uniforms: ORE.UniformsLib.mergeUniforms( this.smaaCommonUni, {
				} ),
				defines: defines
			}
		);

		this.smaaCalcWeighttPP = new PostProcessing( this.renderer,
			{
				vertexShader: blendingWeightCalculationVert,
				fragmentShader: blendingWeightCalculationFrag,
				uniforms: ORE.UniformsLib.mergeUniforms( this.smaaCommonUni, {
					areaTex: this.inputTextures.areaTex,
					searchTex: this.inputTextures.searchTex,
				} ),
				defines: defines,
			}
		);

		this.smaaBlendingPP = new PostProcessing( this.renderer,
			{
				vertexShader: neiborhoodBlendingVert,
				fragmentShader: neiborhoodBlendingFrag,
				uniforms: ORE.UniformsLib.mergeUniforms( this.smaaCommonUni, {
				} ),
				defines: defines
			}
		);

		/*------------------------
			Composite
		------------------------*/
		let compo = compositeFrag.replace( /RENDER_COUNT/g, this.bloomRenderCount.toString() );

		this.compositePP = new PostProcessing( this.renderer, {
			fragmentShader: compo,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				lensTex: this.assetManager.textures.lensDirt,
				noiseTex: this.assetManager.textures.noise,
				brightness: {
					value: 0.2
				},
			} ),
			defines: {
				RENDER_COUNT: this.bloomRenderCount.toString()
			}
		} );

		/*------------------------
			SceneMixer
		------------------------*/
		this.sceneMixerPP = new PostProcessing( this.renderer, {
			fragmentShader: sceneMixerFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				noiseTex: window.mainVisualManager.assetManager.textures.noise
			} ),
		} );

	}

	public resize( pixelWindowSize: THREE.Vector2 ) {

		this.smaaCommonUni.SMAA_RT_METRICS.value.set( 1 / pixelWindowSize.x, 1 / pixelWindowSize.y, pixelWindowSize.x, pixelWindowSize.y );

		let lowScale = 1.0 / this.renderer.getPixelRatio() * 1.0;
		this.renderTargets.sceneDepth.value.setSize( pixelWindowSize.x * lowScale, pixelWindowSize.y * lowScale );
		this.renderTargets.raymarch.value.setSize( pixelWindowSize.x * lowScale, pixelWindowSize.y * lowScale );

		this.renderTargets.rt1.value.setSize( pixelWindowSize.x, pixelWindowSize.y );
		this.renderTargets.rt2.value.setSize( pixelWindowSize.x, pixelWindowSize.y );
		this.renderTargets.rt3.value.setSize( pixelWindowSize.x, pixelWindowSize.y );

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			let size = pixelWindowSize.clone().multiplyScalar( this.bloomResolutionRatio );
			size.divideScalar( ( i + 1 ) * 2 );

			this.renderTargets[ 'rtBlur' + i.toString() + '_0' ].value.setSize( size.x, size.y );
			this.renderTargets[ 'rtBlur' + i.toString() + '_1' ].value.setSize( size.x, size.y );

		}

	}

	public render( scene: THREE.Scene, camera: THREE.Camera, renderMainVisual: boolean, contentRenderTarget: THREE.WebGLRenderTarget ) {

		if ( renderMainVisual ) {

			this.renderMainVisual( scene, camera );

		}

		/*------------------------
			Scene Mixer
		------------------------*/
		this.sceneMixerPP.render( {
			sceneTex: this.renderTargets.rt2,
			contentTex: { value: contentRenderTarget }
		}, null );

		this.renderer.autoClear = true;

	}

	private renderMainVisual( scene: THREE.Scene, camera: THREE.Camera ) {

		/*------------------------
			Scene
		------------------------*/
		let renderTargetMem = this.renderer.getRenderTarget();

		this.renderer.setRenderTarget( this.renderTargets.rt1.value );
		this.renderer.render( scene, camera );
		this.swapDepthMaterial( scene );

		this.renderer.setRenderTarget( this.renderTargets.sceneDepth.value );
		this.renderer.render( scene, camera );
		this.swapDepthMaterial( scene );

		this.renderer.setRenderTarget( renderTargetMem );


		this.renderer.autoClear = false;

		/*------------------------
			Raymarch
		------------------------*/
		this.raymarch.render( null, this.renderTargets.raymarch );

		/*------------------------
			blend
		------------------------*/
		this.mix.render( {
			sceneTex: this.renderTargets.rt1,
			sceneDepthTex: this.renderTargets.sceneDepth,
			raymarchTex: this.renderTargets.raymarch,
		}, this.renderTargets.rt3 );

		/*------------------------
			Bloom
		------------------------*/
		this.bloomBrightPP.render( {
			sceneTex: this.renderTargets.rt3
		}, this.renderTargets.rt1 );

		let target: { value: THREE.WebGLRenderTarget };
		let uni = this.bloomBlurPP.effect.material.uniforms;
		uni.backbuffer.value = this.renderTargets.rt1.value.texture;

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			uni.count.value = i;

			uni.direction.value = false;
			target = this.renderTargets[ 'rtBlur' + i.toString() + '_0' ];
			this.bloomBlurPP.render( null, target );

			uni.direction.value = true;
			uni.backbuffer.value = target.value.texture;
			target = this.renderTargets[ 'rtBlur' + i.toString() + '_1' ];
			this.bloomBlurPP.render( null, target );

			uni.backbuffer.value = target.value.texture;

		}

		/*------------------------
			SMAA
		------------------------*/
		this.smaaEdgePP.render( {
			sceneTex: this.renderTargets.rt3,
		}, this.renderTargets.rt1 );

		this.smaaCalcWeighttPP.render( {
			backbuffer: this.renderTargets.rt1,
		}, this.renderTargets.rt2 );

		this.smaaBlendingPP.render( {
			sceneTex: this.renderTargets.rt3,
			backbuffer: this.renderTargets.rt2,
		}, this.renderTargets.rt1 );

		/*------------------------
			Composite
		------------------------*/
		let compositeInputRenderTargets = {
			sceneTex: this.renderTargets.rt1,
			bloomTexs: null
		};

		let bloomTexArray: THREE.Texture[] = [];

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			bloomTexArray.push( this.renderTargets[ 'rtBlur' + i.toString() + '_1' ].value.texture );

		}

		compositeInputRenderTargets.bloomTexs = { value: bloomTexArray };
		this.compositePP.render( compositeInputRenderTargets, this.renderTargets.rt2 );

	}

	private swapDepthMaterial( scene: THREE.Scene ) {

		scene.traverse( obj => {

			if ( ( obj as THREE.Mesh ).isMesh ) {

				let tmp = ( obj as THREE.Mesh ).material;

				( obj as THREE.Mesh ).material = obj.customDepthMaterial || new THREE.MeshDepthMaterial( { depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide } );

				obj.customDepthMaterial = tmp as THREE.Material;

			}

		} );

	}

}
