import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import powerVert from './shaders/power.vs';
import powerFrag from './shaders/power.fs';

export type PowerMeshMaterialType = 'color' | 'depth' | 'coc'
export class PowerMesh extends THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> {

	protected commonUniforms: ORE.Uniforms;

	// envMap
	protected envMapRenderTarget: THREE.WebGLCubeRenderTarget;
	protected envMapCamera: THREE.CubeCamera;
	protected envMapUpdate: boolean;
	protected envMapSrc: THREE.CubeTexture | THREE.Texture;

	constructor( geometry: THREE.BufferGeometry, materialOption?: THREE.ShaderMaterialParameters );

	constructor( mesh: THREE.Mesh, materialOption?: THREE.ShaderMaterialParameters );

	constructor( geoMesh: THREE.BufferGeometry | THREE.Mesh, materialOption?: THREE.ShaderMaterialParameters ) {

		materialOption = materialOption || {};

		let uni = ORE.UniformsLib.mergeUniforms( materialOption.uniforms || {}, {
			envMap: {
				value: null
			},
			maxLodLevel: {
				value: 0
			},
			shadowLightModelViewMatrix: {
				value: new THREE.Matrix4()
			},
			shadowLightProjectionMatrix: {
				value: new THREE.Matrix4()
			},
			shadowLightDirection: {
				value: new THREE.Vector3()
			},
			shadowLightCameraClip: {
				value: new THREE.Vector2()
			},
			shadowMap: {
				value: null
			},
			shadowMapSize: {
				value: new THREE.Vector2()
			},
			shadowMapResolution: {
				value: new THREE.Vector2()
			},
			shadowLightSize: {
				value: 1.0
			},
			cameraNear: {
				value: 0.01
			},
			cameraFar: {
				value: 1000.0
			}
		} );

		uni = ORE.UniformsLib.mergeUniforms( uni, THREE.UniformsUtils.clone( THREE.UniformsLib.lights ) );

		/*-------------------------------
			Geometry
		-------------------------------*/

		let geo: THREE.BufferGeometry;

		if ( 'isBufferGeometry' in geoMesh ) {

			geo = geoMesh;

		} else if ( 'isMesh' in geoMesh ) {

			geo = geoMesh.geometry;

			let mat = ( geoMesh.material as THREE.MeshStandardMaterial );

			if ( mat.isMeshStandardMaterial ) {

				if ( mat.map ) {

					uni.map = {
						value: mat.map
					};

				} else if ( mat.color ) {

					uni.color = {
						value: mat.color
					};

				}

				if ( mat.roughnessMap ) {

					uni.roughnessMap = {
						value: mat.roughnessMap
					};

				} else {

					uni.roughness = {
						value: mat.roughness
					};

				}

				if ( mat.alphaMap ) {

					uni.alphaMap = {
						value: mat.alphaMap
					};

				} else {

					uni.opacity = {
						value: mat.opacity
					};

				}

				if ( mat.metalnessMap ) {

					uni.metalnessMap = {
						value: mat.metalnessMap
					};

				} else {

					uni.metalness = {
						value: mat.metalness
					};

				}

				if ( mat.normalMap ) {

					uni.normalMap = {
						value: mat.normalMap
					};

				}

			}

		}

		// tangents

		if ( ! geo.getAttribute( 'tangent' ) ) {

			geo.computeTangents();

		}

		/*-------------------------------
			Material
		-------------------------------*/

		materialOption.uniforms = uni;

		let mat = new THREE.ShaderMaterial( {
			vertexShader: powerVert,
			fragmentShader: powerFrag,
			lights: true,
			transparent: true,
			side: THREE.DoubleSide,
			extensions: {
				derivatives: true,
			},
			defines: {
			},
			...materialOption
		} );

		if ( uni.map ) {

			mat.defines.USE_MAP = '';

		}

		if ( uni.roughnessMap ) {

			mat.defines.USE_ROUGHNESS_MAP = '';

		}

		if ( uni.metalnessMap ) {

			mat.defines.USE_METALNESS_MAP = '';

		}

		if ( uni.alphaMap ) {

			mat.defines.USE_ALPHA_MAP = '';

		}

		if ( uni.normalMap ) {

			mat.defines.USE_NORMAL_MAP = '';

		}

		super( geo, mat );

		this.name = geoMesh.name;

		this.userData.colorMat = this.material;

		this.userData.depthMat = new THREE.ShaderMaterial( {
			vertexShader: powerVert,
			fragmentShader: powerFrag,
			side: THREE.DoubleSide,
			lights: true,
			extensions: {
				derivatives: true
			},
			...materialOption,
			defines: {
				...mat.defines,
				'DEPTH': "",
			},
		} );

		this.commonUniforms = uni;

		/*-------------------------------
			Transform
		-------------------------------*/

		if ( 'isMesh' in geoMesh ) {

			geoMesh.getWorldPosition( this.position );
			geoMesh.getWorldQuaternion( this.quaternion );
			geoMesh.getWorldScale( this.scale );

		}

		/*-------------------------------
			EnvMap
		-------------------------------*/

		let envMapResolution = 256;

		this.envMapRenderTarget = new THREE.WebGLCubeRenderTarget( envMapResolution, {
			format: THREE.RGBAFormat,
			generateMipmaps: true,
			magFilter: THREE.LinearFilter,
			minFilter: THREE.LinearFilter
		} );

		this.envMapCamera = new THREE.CubeCamera( 0.001, 1000, this.envMapRenderTarget );
		this.add( this.envMapCamera );

		this.envMapUpdate = true;

		this.onBeforeRender = ( renderer, scene, camera ) => {

			this.dispatchEvent( {
				type: 'beforeRender',
				renderer,
				scene,
				camera
			} );

		};

		this.addEventListener( 'beforeRender', ( e: THREE.Event ) => {

			let renderer = e.renderer;
			let scene = e.scene;
			let camera = e.camera;

			/*-------------------------------
				EnvMap
			-------------------------------*/

			if ( ! camera.userData.shadowCamera && ( this.envMapUpdate || this.envMapUpdate ) ) {

				let envMapRT: THREE.WebGLRenderTarget | null = null;

				let pmremGenerator = new THREE.PMREMGenerator( renderer );
				pmremGenerator.compileEquirectangularShader();

				if ( this.envMapSrc ) {

					if ( 'isCubeTexture' in this.envMapSrc ) {

						envMapRT = pmremGenerator.fromCubemap( this.envMapSrc );

					} else {

						envMapRT = pmremGenerator.fromEquirectangular( this.envMapSrc );

					}

				} else {

					this.visible = false;

					this.envMapCamera.update( renderer, scene );
					envMapRT = pmremGenerator.fromCubemap( this.envMapRenderTarget.texture );

					this.visible = true;

				}

				this.commonUniforms.envMap.value = envMapRT.texture;
				this.envMapUpdate = false;

			}

			/*-------------------------------
				Depth
			-------------------------------*/

			if ( camera.userData.depthCamera ) {

				this.material = this.userData.depthMat;
				this.commonUniforms.cameraNear.value = camera.near;
				this.commonUniforms.cameraFar.value = camera.far;

				if ( ! this.material ) {

					this.visible = false;

				}

			}

			/*-------------------------------
				ShadowMap Depth
			-------------------------------*/

			if ( camera.userData.shadowCamera ) {

				this.commonUniforms.shadowMap.value = camera.userData.shadowMap.value;
				this.commonUniforms.shadowMapSize.value = camera.userData.shadowMapSize;

				this.commonUniforms.shadowLightModelViewMatrix.value.copy( new THREE.Matrix4().multiply( camera.matrixWorldInverse ).multiply( this.matrixWorld ) );
				this.commonUniforms.shadowLightProjectionMatrix.value.copy( camera.projectionMatrix );

				this.commonUniforms.shadowLightSize.value = camera.userData.shadowLightSize;
				camera.getWorldDirection( this.commonUniforms.shadowLightDirection.value );
				this.commonUniforms.shadowLightCameraClip.value.copy( camera.userData.shadowLightCameraClip );

			}

		} );

	}

	public updateEnvMap( envMap: THREE.CubeTexture | THREE.Texture | null = null ) {

		this.envMapSrc = envMap;
		this.envMapUpdate = true;

	}

	public get isPowerMesh() {

		return true;

	}

}
