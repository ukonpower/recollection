import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

// uril shaders
import copyFrag from './shaders/copy.fs';
import blurFrag from './shaders/blur.fs';

// dof shaders
import dofBlurFrag from './shaders/dofBlur.fs';
import dofCompositeFrag from './shaders/dofComposite.fs';

// bloom shaders
import bloomBlurFrag from './shaders/bloomBlur.fs';
import bloomBrightFrag from './shaders/bloomBright.fs';

// smaa shaderss
import edgeDetectionVert from './shaders/smaa_edgeDetection.vs';
import edgeDetectionFrag from './shaders/smaa_edgeDetection.fs';
import blendingWeightCalculationVert from './shaders/smaa_blendingWeightCalculation.vs';
import blendingWeightCalculationFrag from './shaders/smaa_blendingWeightCalculation.fs';
import neiborhoodBlendingVert from './shaders/smaa_neiborhoodBlending.vs';
import neiborhoodBlendingFrag from './shaders/smaa_neiborhoodBlending.fs';

//composite shader
import compositeFrag from './shaders/composite.fs';
import { PowerMesh, PowerMeshMaterialType } from '@common/PowerMesh';

export class FocusedRenderPipeline {

	private renderer: THREE.WebGLRenderer;

	//parameters
	private bloomResolutionRatio: number;
	private bloomRenderCount: number;
	private brightness: number;

	//uniforms
	private commonUniforms: ORE.Uniforms;
	private smaaCommonUni: ORE.Uniforms;

	//textures
	private inputTextures: ORE.Uniforms;

	//postprocessing
	private copyPP: ORE.PostProcessing;

	private blurHorizonalPP: ORE.PostProcessing;
	private blurVerticalPP: ORE.PostProcessing;

	private dofBlurPP: ORE.PostProcessing;
	private dofCompositePP: ORE.PostProcessing;

	private bloomBrightPP: ORE.PostProcessing;
	private bloomBlurPP: ORE.PostProcessing;

	private smaaEdgePP: ORE.PostProcessing;
	private smaaCalcWeighttPP: ORE.PostProcessing;
	private smaaBlendingPP: ORE.PostProcessing;

	private compositePP: ORE.PostProcessing;

	private renderTargets: {
		[keys:string]: THREE.WebGLRenderTarget
	};

	constructor( renderer: THREE.WebGLRenderer, parentUniforms?: ORE.Uniforms ) {

		this.renderer = renderer;
		this.bloomResolutionRatio = 0.4;
		this.bloomRenderCount = 5;
		this.brightness = 0.15;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( {
			cameraNear: {
				value: 0.01
			},
			cameraFar: {
				value: 1000.0
			},
		}, parentUniforms );

		/*------------------------
			RenderTargets
		------------------------*/
		this.renderTargets = {
			rt1: new THREE.WebGLRenderTarget( 0, 0, {
				stencilBuffer: false,
				generateMipmaps: false,
				depthBuffer: true,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter
			} ),
			rt2: new THREE.WebGLRenderTarget( 0, 0, {
				depthBuffer: false,
				stencilBuffer: false,
				generateMipmaps: false,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter
			} ),
			rt3: new THREE.WebGLRenderTarget( 0, 0, {
				depthBuffer: false,
				stencilBuffer: false,
				generateMipmaps: false,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter
			} ),
			depth: new THREE.WebGLRenderTarget( 0, 0, {
				stencilBuffer: false,
				generateMipmaps: false,
				depthBuffer: true,
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter,
				format: THREE.RGBAFormat
			} ),
			dofBlur: new THREE.WebGLRenderTarget( 0, 0, {
				stencilBuffer: false,
				generateMipmaps: false,
				depthBuffer: true,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter
			} ),
			dofBlurTmp: new THREE.WebGLRenderTarget( 0, 0, {
				stencilBuffer: false,
				generateMipmaps: false,
				depthBuffer: true,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter
			} ),
		};

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			this.renderTargets[ 'rtBlur' + i.toString() + '_0' ] = new THREE.WebGLRenderTarget( 0, 0, {
				depthBuffer: false,
				stencilBuffer: false,
				generateMipmaps: true,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter
			} );

			this.renderTargets[ 'rtBlur' + i.toString() + '_1' ] = new THREE.WebGLRenderTarget( 0, 0, {
				depthBuffer: false,
				stencilBuffer: false,
				generateMipmaps: false,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter
			} );

		}

		/*------------------------
			InputTextures
		------------------------*/
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

		/*-------------------------------
			Copy
		-------------------------------*/

		this.copyPP = new ORE.PostProcessing( this.renderer, {
			fragmentShader: copyFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {} ),
		} );

		/*-------------------------------
			Blur
		-------------------------------*/

		this.blurHorizonalPP = new ORE.PostProcessing( this.renderer, {
			fragmentShader: blurFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {} ),
		} );

		this.blurVerticalPP = new ORE.PostProcessing( this.renderer, {
			fragmentShader: blurFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {} ),
			defines: {
				'VERTICAL': ''
			}
		} );

		/*-------------------------------
			Dof
		-------------------------------*/

		this.dofBlurPP = new ORE.PostProcessing( this.renderer, {
			fragmentShader: dofBlurFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {} ),
		} );

		this.dofCompositePP = new ORE.PostProcessing( this.renderer, {
			fragmentShader: dofCompositeFrag,
			uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {} ),
		} );

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
					value: 0.8
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

		let loader = new THREE.TextureLoader();

		loader.load( '/focused/assets/smaa/smaa-area.png', ( tex ) => {

			tex.minFilter = THREE.LinearFilter;
			tex.generateMipmaps = false;
			tex.format = THREE.RGBFormat;
			tex.flipY = false;
			this.inputTextures.areaTex.value = tex;

		} );

		loader.load( '/focused/assets/smaa/smaa-search.png', ( tex ) => {

			tex.minFilter = THREE.NearestFilter;
			tex.magFilter = THREE.NearestFilter;
			tex.generateMipmaps = false;
			tex.flipY = false;
			this.inputTextures.searchTex.value = tex;

		} );

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

		this.smaaCommonUni = ORE.UniformsLib.mergeUniforms( {
			SMAA_RT_METRICS: {
				value: new THREE.Vector4()
			}
		}, this.commonUniforms );

		this.smaaEdgePP = new ORE.PostProcessing( this.renderer,
			{
				vertexShader: edgeDetectionVert,
				fragmentShader: edgeDetectionFrag,
				uniforms: ORE.UniformsLib.mergeUniforms( {
				}, this.smaaCommonUni ),
				defines: defines
			}
		);

		this.smaaCalcWeighttPP = new ORE.PostProcessing( this.renderer,
			{
				vertexShader: blendingWeightCalculationVert,
				fragmentShader: blendingWeightCalculationFrag,
				uniforms: ORE.UniformsLib.mergeUniforms( {
					areaTex: this.inputTextures.areaTex,
					searchTex: this.inputTextures.searchTex,
				}, this.smaaCommonUni ),
				defines: defines,
			}
		);

		this.smaaBlendingPP = new ORE.PostProcessing( this.renderer,
			{
				vertexShader: neiborhoodBlendingVert,
				fragmentShader: neiborhoodBlendingFrag,
				uniforms: ORE.UniformsLib.mergeUniforms( {
				}, this.smaaCommonUni ),
				defines: defines
			}
		);

		/*------------------------
			Composite
		------------------------*/

		let compo = compositeFrag.replace( /RENDER_COUNT/g, this.bloomRenderCount.toString() );

		this.compositePP = new ORE.PostProcessing( this.renderer, {
			fragmentShader: compo,
			uniforms: ORE.UniformsLib.mergeUniforms( {
				brightness: {
					value: this.brightness
				},
			}, this.commonUniforms ),
			defines: {
				RENDER_COUNT: this.bloomRenderCount.toString()
			}
		} );

	}

	public render( scene: THREE.Scene, camera: THREE.Camera, renderTarget: THREE.WebGLRenderTarget ) {

		let renderTargetMem = this.renderer.getRenderTarget();

		if ( ( camera as THREE.PerspectiveCamera ).isPerspectiveCamera ) {

			this.commonUniforms.cameraNear.value = ( camera as THREE.PerspectiveCamera ).near;
			this.commonUniforms.cameraFar.value = ( camera as THREE.PerspectiveCamera ).far;

		}

		/*------------------------
			Scene
		------------------------*/

		this.swapMaterial( scene, 'color' );

		this.renderer.setRenderTarget( this.renderTargets.rt1 );
		this.renderer.render( scene, camera );

		/*-------------------------------
			Depth
		-------------------------------*/

		this.swapMaterial( scene, 'depth' );

		let bg = scene.background;

		scene.background = new THREE.Color( "#000" );

		this.renderer.setRenderTarget( this.renderTargets.depth );
		this.renderer.render( scene, camera );

		this.renderer.setRenderTarget( renderTargetMem );
		this.renderer.autoClear = false;

		scene.background = bg;

		/*-------------------------------
			Dof
		-------------------------------*/

		this.dofBlurPP.render( {
			sceneTex: this.renderTargets.rt1.texture,
			depthTex: this.renderTargets.depth.texture
		}, this.renderTargets.dofBlur );

		// this.blurHorizonalPP.render( {
		// 	tex: this.renderTargets.dofBlur.texture
		// }, this.renderTargets.dofBlurTmp );

		// this.blurVerticalPP.render( {
		// 	tex: this.renderTargets.dofBlurTmp.texture
		// }, this.renderTargets.dofBlur );

		this.dofCompositePP.render( {
			sceneTex: this.renderTargets.rt1.texture,
			dofBlurTex: this.renderTargets.dofBlur.texture
		}, this.renderTargets.rt2 );

		/*------------------------
			Bloom
		------------------------*/

		// this.bloomBrightPP.render( {
		// 	sceneTex: this.renderTargets.rt1.texture
		// }, this.renderTargets.rt2 );

		// let target: THREE.WebGLRenderTarget;
		// let uni = this.bloomBlurPP.effect.material.uniforms;
		// uni.backbuffer.value = this.renderTargets.rt2.texture;

		// for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

		// 	uni.count.value = i;

		// 	uni.direction.value = true;
		// 	target = this.renderTargets[ 'rtBlur' + i.toString() + '_0' ];
		// 	this.bloomBlurPP.render( null, target );

		// 	uni.direction.value = false;
		// 	uni.backbuffer.value = target.texture;
		// 	target = this.renderTargets[ 'rtBlur' + i.toString() + '_1' ];
		// 	this.bloomBlurPP.render( null, target );

		// 	uni.backbuffer.value = target.texture;

		// }

		/*------------------------
			SMAA
		------------------------*/

		// this.smaaEdgePP.render( {
		// 	sceneTex: this.renderTargets.rt1.texture,
		// }, this.renderTargets.rt2 );

		// this.smaaCalcWeighttPP.render( {
		// 	backbuffer: this.renderTargets.rt2.texture,
		// }, this.renderTargets.rt3 );

		// this.smaaBlendingPP.render( {
		// 	sceneTex: this.renderTargets.rt1.texture,
		// 	backbuffer: this.renderTargets.rt3.texture,
		// }, this.renderTargets.rt2 );


		/*------------------------
			Composite
		------------------------*/

		let compositeInputRenderTargets = {
			sceneTex: this.renderTargets.rt2.texture,
			bloomTexs: [] as THREE.Texture[]
		};

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			compositeInputRenderTargets.bloomTexs.push( this.renderTargets[ 'rtBlur' + i.toString() + '_1' ].texture );

		}

		this.compositePP.render( compositeInputRenderTargets, renderTarget );

		this.renderer.autoClear = true;

	}

	private swapMaterial( scene: THREE.Scene, type: PowerMeshMaterialType ) {

		scene.traverse( ( obj ) => {

			let powerMesh = obj as PowerMesh;

			if ( powerMesh.isPowerMesh ) {

				if ( type == 'color' ) {

					powerMesh.material = powerMesh.userData.colorMat;

				} else if ( type == "depth" ) {

					powerMesh.material = powerMesh.userData.depthMat;

				}

			}

		} );

	}

	public resize( pixelWindowSize: THREE.Vector2 ) {

		this.smaaCommonUni.SMAA_RT_METRICS.value.set( 1 / pixelWindowSize.x, 1 / pixelWindowSize.y, pixelWindowSize.x, pixelWindowSize.y );

		this.renderTargets.rt1.setSize( pixelWindowSize.x, pixelWindowSize.y );
		this.renderTargets.rt2.setSize( pixelWindowSize.x, pixelWindowSize.y );
		this.renderTargets.rt3.setSize( pixelWindowSize.x, pixelWindowSize.y );

		this.renderTargets.depth.setSize( pixelWindowSize.x, pixelWindowSize.y );
		this.renderTargets.dofBlurTmp.setSize( pixelWindowSize.x / 2, pixelWindowSize.y / 2 );
		this.renderTargets.dofBlur.setSize( pixelWindowSize.x / 2, pixelWindowSize.y / 2 );

		for ( let i = 0; i < this.bloomRenderCount; i ++ ) {

			let size = pixelWindowSize.clone().multiplyScalar( this.bloomResolutionRatio );
			size.divideScalar( ( i + 1.0 ) * 2 );

			this.renderTargets[ 'rtBlur' + i.toString() + '_0' ].setSize( size.x, size.y );
			this.renderTargets[ 'rtBlur' + i.toString() + '_1' ].setSize( size.x, size.y );

		}

	}

}
