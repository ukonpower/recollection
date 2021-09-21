import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import powerVert from './shaders/power.vs';
import powerFrag from './shaders/powerLight.fs';

export class PowerMesh extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;

	// envMap
	private envMapRenderTarget: THREE.WebGLCubeRenderTarget;
	private envMapCamera: THREE.CubeCamera;
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
		} );

		uni = ORE.UniformsLib.mergeUniforms( uni, THREE.UniformsLib.lights );

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
			lights: true
		} );

		super( geo, mat );

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

		this.onBeforeRender = ( renderer, scene ) => {

			this.visible = false;

			if ( this.envMapUpdate ) {

				this.envMapCamera.update( renderer, scene );

				let pmremGenerator = new THREE.PMREMGenerator( renderer );
				pmremGenerator.compileEquirectangularShader();
				let envMapRT = pmremGenerator.fromCubemap( this.envMapRenderTarget.texture );

				this.commonUniforms.envMap.value = envMapRT.texture;

				this.envMapUpdate = false;

			}

			this.visible = true;

		};

	}


}
