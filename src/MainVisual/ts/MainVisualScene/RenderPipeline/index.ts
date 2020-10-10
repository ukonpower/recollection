import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { AssetManager } from '../MainVisualManager/AssetManager';
import { PostProcessing } from './PostProcessing';

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
import composite from './shaders/bloom_composite.fs';

export class RenderPipeline {

	private commonUniforms: ORE.Uniforms;
	private smaaCommonUni: ORE.Uniforms;

	private assetManager: AssetManager;
	private renderer: THREE.WebGLRenderer;

	private inputTextures: ORE.Uniforms;

	private bloomResolutionRatio: number;
	private bloomRenderCount: number;

	private bloomBrightPP: PostProcessing;
	private bloomBlurPP: PostProcessing;
	private smaaPP: PostProcessing;
	private compositePP: PostProcessing;

	private renderTargets: {
		[keys:string]: { value: THREE.WebGLRenderTarget }
	};

	constructor( assetManager: AssetManager, renderer: THREE.WebGLRenderer, bloomResolutionRatio: number = 0.5, bloomRenderCount: number = 5, parentUniforms?: ORE.Uniforms ) {

		this.assetManager = assetManager;
		this.renderer = renderer;
		this.bloomResolutionRatio = bloomResolutionRatio;
		this.bloomRenderCount = bloomRenderCount;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {
		}, parentUniforms );

		this.initRenderTargets();
		this.initInputTextures();
		this.initPostProcessings();

	}

	private initRenderTargets() {

		this.renderTargets = {
			rt1: {
				value: new THREE.WebGLRenderTarget( 0, 0, {
					stencilBuffer: false,
					generateMipmaps: false,
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
			}
		};

		let loader = new THREE.TextureLoader();
		loader.load( './assets/smaa/smaa-area.png', ( tex ) => {

			tex.minFilter = THREE.LinearFilter;
			tex.generateMipmaps = false;
			tex.format = THREE.RGBFormat;
			tex.flipY = false;
			this.inputTextures.areaTex.value = tex;

		} );

		loader.load( './assets/smaa/smaa-search.png', ( tex ) => {

			tex.minFilter = THREE.NearestFilter;
			tex.magFilter = THREE.NearestFilter;
			tex.generateMipmaps = false;
			tex.flipY = false;
			this.inputTextures.searchTex.value = tex;

		} );

	}

	private initPostProcessings() {

		/*------------------------
			Bloom
		------------------------*/
		this.bloomBrightPP = new PostProcessing( this.renderer, {
			fragmentShader: bloomBrightFrag,
			uniforms: ORE.UniformsLib.CopyUniforms( {
				threshold: {
					value: 0.5,
				},
			}, this.commonUniforms ),
			inputRenderTargets: {
				sceneTex: this.renderTargets.rt1
			}
		} );

		this.bloomBlurPP = new PostProcessing( this.renderer, {
			fragmentShader: bloomBlurFrag,
			uniforms: ORE.UniformsLib.CopyUniforms( {
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

		this.smaaCommonUni = ORE.UniformsLib.CopyUniforms( {
			SMAA_RT_METRICS: {
				value: new THREE.Vector4()
			}
		}, this.commonUniforms );

		this.smaaPP = new PostProcessing( this.renderer,
			{
				vertexShader: edgeDetectionVert,
				fragmentShader: edgeDetectionFrag,
				uniforms: ORE.UniformsLib.CopyUniforms( {
				}, this.smaaCommonUni ),
				inputRenderTargets: {
					sceneTex: this.renderTargets.rt1,
				},
				defines: defines
			},
			{
				vertexShader: blendingWeightCalculationVert,
				fragmentShader: blendingWeightCalculationFrag,
				uniforms: ORE.UniformsLib.CopyUniforms( {
					areaTex: this.inputTextures.areaTex,
					searchTex: this.inputTextures.searchTex,
				}, this.smaaCommonUni ),
				inputRenderTargets: {
					backbuffer: this.renderTargets.rt2,
				},
				defines: defines,
			},
			{
				vertexShader: neiborhoodBlendingVert,
				fragmentShader: neiborhoodBlendingFrag,
				uniforms: ORE.UniformsLib.CopyUniforms( {
				}, this.smaaCommonUni ),
				inputRenderTargets: {
					sceneTex: this.renderTargets.rt1,
					backbuffer: this.renderTargets.rt3,
				},
				defines: defines
			}
		);

		/*------------------------
			Composite
		------------------------*/

		let compositeRenderTargets = {
			sceneTex: this.renderTargets.rt2,
		};

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			compositeRenderTargets[ 'blurTex' + i.toString() ] = this.renderTargets[ 'rtBlur' + i.toString() + '_1' ];

		}

		console.log( compositeRenderTargets );


		this.compositePP = new PostProcessing( this.renderer, {
			fragmentShader: composite,
			uniforms: ORE.UniformsLib.CopyUniforms( {
				lensTex: this.assetManager.textures.lensDirt,
				noiseTex: this.assetManager.textures.noise,
				brightness: {
					value: 0.2
				},
			}, this.commonUniforms ),
			inputRenderTargets: compositeRenderTargets,
			defines: {
				RENDER_COUNT: this.bloomRenderCount.toString()
			}
		} );

	}

	public resize( pixelWindowSize: THREE.Vector2 ) {

		this.smaaCommonUni.SMAA_RT_METRICS.value.set( 1 / pixelWindowSize.x, 1 / pixelWindowSize.y, pixelWindowSize.x, pixelWindowSize.y );

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

	public render( scene: THREE.Scene, camera: THREE.Camera ) {


		/*------------------------
			Scene
		------------------------*/
		let renderTargetMem = this.renderer.getRenderTarget();
		this.renderer.setRenderTarget( this.renderTargets.rt1.value );
		this.renderer.render( scene, camera );
		this.renderer.setRenderTarget( renderTargetMem );

		this.renderer.autoClear = false;

		/*------------------------
			Bloom
		------------------------*/
		this.bloomBrightPP.render( this.renderTargets.rt2 );

		let target: { value: THREE.WebGLRenderTarget };
		let uni = this.bloomBlurPP.effects[ 0 ].material.uniforms;
		uni.backbuffer.value = this.renderTargets.rt2.value.texture;

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			uni.count.value = i;

			uni.direction.value = false;
			target = this.renderTargets[ 'rtBlur' + i.toString() + '_0' ];
			this.bloomBlurPP.render( target );

			uni.direction.value = true;
			uni.backbuffer.value = target.value.texture;
			target = this.renderTargets[ 'rtBlur' + i.toString() + '_1' ];
			this.bloomBlurPP.render( target );

			uni.backbuffer.value = target.value.texture;

		}

		/*------------------------
			SMAA
		------------------------*/
		this.smaaPP.render( this.renderTargets.rt2, this.renderTargets.rt3, this.renderTargets.rt2 );

		/*------------------------
			Composite
		------------------------*/
		this.compositePP.render( null );

		this.renderer.autoClear = true;

	}

}
