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

	constructor( geometry: THREE.BufferGeometry, parentUniforms?: ORE.Uniforms );

	constructor( mesh: THREE.Mesh, parentUniforms?: ORE.Uniforms );

	constructor( geoMesh: THREE.BufferGeometry | THREE.Mesh, parentUniforms?: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
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
			shadowMapDepth: {
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

		}

		/*-------------------------------
			Material
		-------------------------------*/

		let mat = new THREE.ShaderMaterial( {
			vertexShader: powerVert,
			fragmentShader: powerFrag,
			uniforms: uni,
			lights: true,
		} );

		super( geo, mat );

		this.userData.mat = mat;

		this.userData.depthMat = new THREE.ShaderMaterial( {
			vertexShader: powerVert,
			fragmentShader: powerFrag,
			uniforms: uni,
			defines: {
				'DEPTH': "",
			},
			side: THREE.DoubleSide
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
				this.commonUniforms.shadowMapTex = camera.userData.shadowMapTex;
				this.commonUniforms.shadowMapResolution.value.copy( camera.userData.shadowMapResolution );

			}

		} );

	}

}
