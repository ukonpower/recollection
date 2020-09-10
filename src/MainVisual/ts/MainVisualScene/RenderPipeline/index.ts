import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import raymarchFrag from './shaders/raymarch.fs';
import mixFrag from './shaders/mix.fs';
import bright from './shaders/bloom_bright.fs';
import blur from './shaders/bloom_blur.fs';
import composite from './shaders/bloom_composite.fs';

import edgeDetectionVert from './shaders/smaa_edgeDetection.vs';
import edgeDetectionFrag from './shaders/smaa_edgeDetection.fs';
import blendingWeightCalculationVert from './shaders/smaa_blendingWeightCalculation.vs';
import blendingWeightCalculationFrag from './shaders/smaa_blendingWeightCalculation.fs';
import neiborhoodBlendingVert from './shaders/smaa_neiborhoodBlending.vs';
import neiborhoodBlendingFrag from './shaders/smaa_neiborhoodBlending.fs';

export class RenderPipeline {

	public scene: THREE.Scene;
	public camera: THREE.Camera

	//ORE.PostProcessings
	protected bright: ORE.PostProcessing;
	protected mix: ORE.PostProcessing;
	protected raymarch: ORE.PostProcessing;
	protected blur: ORE.PostProcessing[] = [];
	protected composite: ORE.PostProcessing;
	protected smaa: ORE.PostProcessing;

	protected renderer: THREE.WebGLRenderer;
	protected sceneRenderTarget: THREE.WebGLRenderTarget;
	protected sceneDepthTexture: THREE.DepthTexture;

	//uniforms
	public inputTextures: ORE.Uniforms;
	protected commonUniforms: ORE.Uniforms;

	//parameters
	public renderCount: number = 5;
	protected noPPRenderRes: THREE.Vector2;
	protected bloomResolution: THREE.Vector2;
	protected bloomResolutionRatio: number;

	constructor( renderer: THREE.WebGLRenderer, parentUniforms: ORE.Uniforms, bloomResolutionRatio: number = 0.3, renderCount: number = 5 ) {

		this.renderer = renderer;
		this.bloomResolutionRatio = bloomResolutionRatio;
		let resolution = this.renderer.getSize( new THREE.Vector2() ).multiplyScalar( this.renderer.getPixelRatio() );

		//uniforms
		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {
			threshold: {
				value: 0.5,
			},
			brightness: {
				value: 0.7
			},
			blurRange: {
				value: 1.0
			},
			renderCount: {
				value: this.renderCount
			},
			count: {
				value: 0
			},
			SMAA_RT_METRICS: {
				value: new THREE.Vector4( 1 / resolution.x, 1 / resolution.y, resolution.x, resolution.y )
			}
		}, parentUniforms );

		this.inputTextures = {
			sceneTex: {
				value: null
			},
			raymarchTex: {
				value: null
			},
			sceneDepthTex: {
				value: null
			},
			blurTex: {
				value: []
			},
			areaTex: {
				value: null
			},
			searchTex: {
				value: null
			}
		};

		this.init();
		this.resize( resolution );
		this.loadTextures();

		this.renderCount = renderCount;
		this.brightness = 0.5;
		this.blurRange = 1.5;
		this.threshold = 0.3;

	}

	public set blurRange( value: number ) {

		this.commonUniforms.blurRange.value = value;

	}

	public set threshold( value: number ) {

		this.commonUniforms.threshold.value = value;

	}

	public set brightness( value: number ) {

		this.commonUniforms.brightness.value = value;

	}

	protected init() {

		/*------------------------
			raymarch
		------------------------*/

		let raymarchParam: ORE.PPParam[] = [ {
			fragmentShader: raymarchFrag,
			uniforms: ORE.UniformsLib.CopyUniforms( {
			}, this.commonUniforms ),
		} ];

		this.raymarch = new ORE.PostProcessing( this.renderer, raymarchParam, null, {
			type: THREE.FloatType,
			depthBuffer: false,
			stencilBuffer: false,
			generateMipmaps: false
		} );

		/*------------------------
			mix
		------------------------*/

		let mixParam: ORE.PPParam[] = [ {
			fragmentShader: mixFrag,
			uniforms: ORE.UniformsLib.CopyUniforms( {
				sceneDepthTex: this.inputTextures.sceneDepthTex
			}, this.commonUniforms ),
		} ];

		this.mix = new ORE.PostProcessing( this.renderer, mixParam, null, {
			depthBuffer: false,
			stencilBuffer: false,
			generateMipmaps: false
		} );

		/*------------------------
			bright
		------------------------*/

		let brightParam: ORE.PPParam[] = [ {
			fragmentShader: bright,
			uniforms: ORE.UniformsLib.CopyUniforms( {
			}, this.commonUniforms ),
		} ];

		this.bright = new ORE.PostProcessing( this.renderer, brightParam, null, {
			depthBuffer: false,
			stencilBuffer: false,
			generateMipmaps: false
		} );

		/*------------------------
			blur
		------------------------*/

		let blurParam: ORE.PPParam[] = [ {
			fragmentShader: blur,
			uniforms: ORE.UniformsLib.CopyUniforms( {
				direction: { value: true },
			}, this.commonUniforms )
		},
		{
			fragmentShader: blur,
			uniforms: ORE.UniformsLib.CopyUniforms( {
				direction: { value: false },
			}, this.commonUniforms )
		} ];

		for ( let i = 0; i < this.renderCount; i ++ ) {

			this.blur.push( new ORE.PostProcessing( this.renderer, blurParam, null, {
				depthBuffer: false,
				stencilBuffer: false,
				generateMipmaps: false
			} ) );
			this.inputTextures.blurTex.value[ i ] = null;

		}

		/*------------------------
			composite
		------------------------*/

		let compositeParam:ORE.PPParam[] = [ {
			fragmentShader: composite,
			uniforms: ORE.UniformsLib.CopyUniforms( {
				sceneTex: this.inputTextures.sceneTex,
				blurTex: this.inputTextures.blurTex,
			}, this.commonUniforms ),
			defines: {
				RENDER_COUNT: this.renderCount.toString()
			}
		} ];

		this.composite = new ORE.PostProcessing( this.renderer, compositeParam, null, {
			depthBuffer: false,
			stencilBuffer: false,
			generateMipmaps: false
		} );

		this.sceneDepthTexture = new THREE.DepthTexture( 1000, 1000, THREE.FloatType );
		this.sceneRenderTarget = this.composite.createRenderTarget( {
			depthBuffer: true,
			depthTexture: this.sceneDepthTexture
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

		let smaaParam:ORE.PPParam[] = [ {
			vertexShader: edgeDetectionVert,
			fragmentShader: edgeDetectionFrag,
			uniforms: ORE.UniformsLib.CopyUniforms( {
			}, this.commonUniforms ),
			defines: defines
		}, {
			vertexShader: blendingWeightCalculationVert,
			fragmentShader: blendingWeightCalculationFrag,
			uniforms: ORE.UniformsLib.CopyUniforms( {
				areaTex: this.inputTextures.areaTex,
				searchTex: this.inputTextures.searchTex,
			}, this.commonUniforms ),
			defines: defines
		},
		{
			vertexShader: neiborhoodBlendingVert,
			fragmentShader: neiborhoodBlendingFrag,
			uniforms: ORE.UniformsLib.CopyUniforms( {
				sceneTex: this.inputTextures.sceneTex,
			}, this.commonUniforms ),
			defines: defines
		}
		];

		this.smaa = new ORE.PostProcessing( this.renderer, smaaParam, null, {
			depthBuffer: false,
			stencilBuffer: false,
			generateMipmaps: false,
			minFilter: THREE.LinearFilter,
		} );

	}

	public render( scene: THREE.Scene, camera: THREE.Camera ) {

		//render main scene
		this.renderer.setRenderTarget( this.sceneRenderTarget );
		this.renderer.render( scene, camera );
		this.inputTextures.sceneDepthTex.value = this.sceneRenderTarget.depthTexture;

		//raymarch
		this.raymarch.render( this.sceneRenderTarget.texture, true );
		this.commonUniforms.raymarchTex.value = this.inputTextures.raymarchTex.value = this.raymarch.getResultTexture();

		//mix
		this.mix.render( this.sceneRenderTarget.texture, true );
		this.inputTextures.sceneTex.value = this.mix.getResultTexture();

		//smaa
		this.smaa.render( this.inputTextures.sceneTex.value, true );
		this.inputTextures.sceneTex.value = this.smaa.getResultTexture();

		//render birightness part
		this.bright.render( this.inputTextures.sceneTex.value, true );

		//render blur
		let tex = this.bright.getResultTexture();
		for ( let i = 0; i < this.renderCount; i ++ ) {

			this.commonUniforms.count.value = i;

			this.blur[ i ].render( tex, true );
			tex = this.blur[ i ].getResultTexture();
			this.inputTextures.blurTex.value[ i ] = tex;

		}

		//composition bloom
		this.composite.render( this.inputTextures.sceneTex.value );

	}

	public resize( mainSceneRenderRes: THREE.Vector2 ) {

		this.sceneRenderTarget.setSize( mainSceneRenderRes.x, mainSceneRenderRes.y );

		this.mix.resize( mainSceneRenderRes );
		this.raymarch.resize( mainSceneRenderRes );
		this.smaa.resize( mainSceneRenderRes );

		this.bloomResolution = mainSceneRenderRes.clone().multiplyScalar( this.bloomResolutionRatio );
		this.bright.resize( this.bloomResolution );

		for ( let i = 0; i < this.blur.length; i ++ ) {

			this.blur[ i ].resize( this.bloomResolution.clone().divideScalar( i + 1 ) );

		}

		this.composite.resize( mainSceneRenderRes );

		/*------------------------
			update Uniforms
		------------------------*/
		this.commonUniforms.SMAA_RT_METRICS.value.set( 1 / mainSceneRenderRes.x, 1 / mainSceneRenderRes.y, mainSceneRenderRes.x, mainSceneRenderRes.y );

	}

	protected loadTextures() {

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

}
