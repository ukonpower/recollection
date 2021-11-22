import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import powerVert from './shaders/power.vs';
import powerFrag from './shaders/power.fs';

export class PowerMesh extends THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> {

	protected commonUniforms: ORE.Uniforms;

	// envMap
	protected envMapRenderTarget: THREE.WebGLCubeRenderTarget;
	protected envMapCamera: THREE.CubeCamera;
	public envMapUpdate: boolean;

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
			modelViewMatrixLight: {
				value: new THREE.Matrix4()
			},
			projectionMatrixLight: {
				value: new THREE.Matrix4()
			},
			shadowMapTex: {
				value: null
			},
			shadowMapResolution: {
				value: new THREE.Vector2()
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

				if ( mat.color ) {

					uni.color = {
						value: mat.color
					};

				}

				if ( mat.map ) {

					uni.map = {
						value: mat.map
					};

				}

				if ( mat.normalMap ) {

					uni.normalMap = {
						value: mat.normalMap
					};

				}

				if ( mat.roughnessMap ) {

					uni.roughnessMap = {
						value: mat.roughnessMap
					};

				}

				if ( mat.alphaMap ) {

					uni.alphaMap = {
						value: mat.alphaMap
					};

				}

			}

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
				derivatives: true
			},
			defines: {
			},
			...materialOption
		} );

		if ( uni.map ) {

			mat.defines.USE_MAP = '';

		}

		if ( uni.normalMap ) {

			mat.defines.USE_NORMAL_MAP = '';

		}

		if ( uni.roughnessMap ) {

			mat.defines.USE_ROUGHNESS_MAP = '';

		}

		if ( uni.alphaMap ) {

			mat.defines.USE_ALPHA_MAP = '';

		}

		super( geo, mat );

		this.name = geoMesh.name;

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

			this.position.copy( geoMesh.position );
			this.rotation.copy( geoMesh.rotation );
			this.scale.copy( geoMesh.scale );

		}

		/*-------------------------------
			EnvMap
		-------------------------------*/

		let envMapResolution = 256;

		this.envMapRenderTarget = new THREE.WebGLCubeRenderTarget( envMapResolution, {
			format: THREE.RGBFormat,
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

			if ( this.envMapUpdate && ! camera.userData.shadowCamera ) {

				this.visible = false;

				this.envMapCamera.update( renderer, scene );

				this.visible = true;

				let pmremGenerator = new THREE.PMREMGenerator( renderer );
				pmremGenerator.compileEquirectangularShader();
				let envMapRT = pmremGenerator.fromCubemap( this.envMapRenderTarget.texture );

				this.commonUniforms.envMap.value = envMapRT.texture;

				this.envMapUpdate = false;

			}

			/*-------------------------------
				ShadowMap Depth
			-------------------------------*/

			if ( camera.userData.shadowCamera ) {

				this.commonUniforms.modelViewMatrixLight.value.copy( new THREE.Matrix4().multiply( camera.matrixWorldInverse ).multiply( this.matrixWorld ) );
				this.commonUniforms.projectionMatrixLight.value.copy( camera.projectionMatrix );
				this.commonUniforms.shadowMapTex.value = camera.userData.shadowMapTex.value;
				this.commonUniforms.shadowMapResolution.value.copy( camera.userData.shadowMapResolution );

			}

		} );

	}

}
