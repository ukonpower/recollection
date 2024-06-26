import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

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

export class RenderPipeline {

	private commonUniforms: ORE.Uniforms;
	private smaaCommonUni: ORE.Uniforms;

	private renderer: THREE.WebGLRenderer;

	private inputTextures: ORE.Uniforms;

	private bloomResolutionRatio: number;
	private bloomRenderCount: number;

	private bloomBrightPP: ORE.PostProcessing;
	private bloomBlurPP: ORE.PostProcessing;
	private smaaEdgePP: ORE.PostProcessing;
	private smaaCalcWeighttPP: ORE.PostProcessing;
	private smaaBlendingPP: ORE.PostProcessing;

	private compositePP: ORE.PostProcessing;

	private renderTargets: {
		[keys:string]: THREE.WebGLRenderTarget
	};

	constructor( renderer: THREE.WebGLRenderer, bloomResolutionRatio: number = 0.5, bloomRenderCount: number = 2, parentUniforms?: ORE.Uniforms ) {

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
			rt1: new THREE.WebGLRenderTarget( 0, 0, {
				format: THREE.RGBAFormat,
				stencilBuffer: false,
				generateMipmaps: false,
				depthBuffer: true,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter
			} ),
			rt2: new THREE.WebGLRenderTarget( 0, 0, {
				format: THREE.RGBAFormat,
				depthBuffer: false,
				stencilBuffer: false,
				generateMipmaps: false,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter
			} ),
			rt3: new THREE.WebGLRenderTarget( 0, 0, {
				format: THREE.RGBAFormat,
				depthBuffer: false,
				stencilBuffer: false,
				generateMipmaps: false,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter
			} ),
		};

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			this.renderTargets[ 'rtBlur' + i.toString() + '_0' ] = new THREE.WebGLRenderTarget( 0, 0, {
				format: THREE.RGBAFormat,
				depthBuffer: false,
				stencilBuffer: false,
				generateMipmaps: false,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter
			} );

			this.renderTargets[ 'rtBlur' + i.toString() + '_1' ] = new THREE.WebGLRenderTarget( 0, 0, {
				format: THREE.RGBAFormat,
				depthBuffer: false,
				stencilBuffer: false,
				generateMipmaps: false,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter
			} );

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
		loader.load( '/flower/assets/smaa/smaa-area.png', ( tex ) => {

			tex.minFilter = THREE.LinearFilter;
			tex.generateMipmaps = false;
			tex.format = THREE.RGBAFormat;
			tex.flipY = false;
			this.inputTextures.areaTex.value = tex;

		} );

		loader.load( '/flower/assets/smaa/smaa-search.png', ( tex ) => {

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
		this.bloomBrightPP = new ORE.PostProcessing( this.renderer, {
			fragmentShader: bloomBrightFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				threshold: {
					value: 0.5,
				},
			} ),
		} );

		this.bloomBlurPP = new ORE.PostProcessing( this.renderer, {
			fragmentShader: bloomBlurFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				backbuffer: {
					value: null
				},
				blurRange: {
					value: 1.4
				},
				renderCount: {
					value: this.bloomRenderCount
				},
				count: {
					value: 0
				},
				direction: { value: false },
			} ),
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

		this.smaaEdgePP = new ORE.PostProcessing( this.renderer,
			{
				vertexShader: edgeDetectionVert,
				fragmentShader: edgeDetectionFrag,
				uniforms: ORE.UniformsLib.mergeUniforms( this.smaaCommonUni, {
				} ),
				defines: defines
			}
		);

		this.smaaCalcWeighttPP = new ORE.PostProcessing( this.renderer,
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

		this.smaaBlendingPP = new ORE.PostProcessing( this.renderer,
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

		this.compositePP = new ORE.PostProcessing( this.renderer, {
			fragmentShader: compo,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
				brightness: {
					value: 0.08
				},
			} ),
			defines: {
				RENDER_COUNT: this.bloomRenderCount.toString()
			}
		} );

	}

	public render( scene: THREE.Scene, camera: THREE.Camera, renderTarget: THREE.WebGLRenderTarget ) {

		/*------------------------
			Scene
		------------------------*/
		let renderTargetMem = this.renderer.getRenderTarget();

		this.renderer.setRenderTarget( this.renderTargets.rt1 );
		this.renderer.render( scene, camera );
		this.renderer.setRenderTarget( renderTargetMem );

		this.renderer.autoClear = false;

		/*------------------------
			Bloom
		------------------------*/
		this.bloomBrightPP.render( {
			sceneTex: this.renderTargets.rt1.texture
		}, this.renderTargets.rt2 );

		let target: THREE.WebGLRenderTarget;
		let uni = this.bloomBlurPP.effect.material.uniforms;
		uni.backbuffer.value = this.renderTargets.rt2.texture;

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			uni.count.value = i;

			uni.direction.value = false;
			target = this.renderTargets[ 'rtBlur' + i.toString() + '_0' ];
			this.bloomBlurPP.render( null, target );

			uni.direction.value = true;
			uni.backbuffer.value = target.texture;
			target = this.renderTargets[ 'rtBlur' + i.toString() + '_1' ];
			this.bloomBlurPP.render( null, target );

			uni.backbuffer.value = target.texture;

		}

		/*------------------------
			SMAA
		------------------------*/
		this.smaaEdgePP.render( {
			sceneTex: this.renderTargets.rt1.texture,
		}, this.renderTargets.rt2 );

		this.smaaCalcWeighttPP.render( {
			backbuffer: this.renderTargets.rt2.texture,
		}, this.renderTargets.rt3 );

		this.smaaBlendingPP.render( {
			sceneTex: this.renderTargets.rt1.texture,
			backbuffer: this.renderTargets.rt3.texture,
		}, this.renderTargets.rt2 );


		/*------------------------
			Composite
		------------------------*/
		let compositeInputRenderTargets = {
			sceneTex: this.renderTargets.rt2.texture,
			bloomTexs: null
		};

		let bloomTexArray: THREE.Texture[] = [];

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			bloomTexArray.push( this.renderTargets[ 'rtBlur' + i.toString() + '_1' ].texture );

		}

		compositeInputRenderTargets.bloomTexs = bloomTexArray;

		this.compositePP.render( compositeInputRenderTargets, renderTarget );

		this.renderer.autoClear = true;

	}

	public resize( canvasPixelSize: THREE.Vector2 ) {

		this.smaaCommonUni.SMAA_RT_METRICS.value.set( 1 / canvasPixelSize.x, 1 / canvasPixelSize.y, canvasPixelSize.x, canvasPixelSize.y );

		this.renderTargets.rt1.setSize( canvasPixelSize.x, canvasPixelSize.y );
		this.renderTargets.rt2.setSize( canvasPixelSize.x, canvasPixelSize.y );
		this.renderTargets.rt3.setSize( canvasPixelSize.x, canvasPixelSize.y );

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			let size = canvasPixelSize.clone().multiplyScalar( this.bloomResolutionRatio );
			size.divideScalar( ( i + 1 ) * 2 );

			this.renderTargets[ 'rtBlur' + i.toString() + '_0' ].setSize( size.x, size.y );
			this.renderTargets[ 'rtBlur' + i.toString() + '_1' ].setSize( size.x, size.y );

		}

	}

}
