import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { PowerMesh } from './PowerMesh';
import { ShadowMapper } from './ShadowMapper';
import { PowerReflectionMesh } from './PowerMesh/PowerReflectMesh';
import { ElapsedGlobalManager } from '../ElapsedGlobalManager';

import groundVert from './shaders/ground.vs';
import groundFrag from './shaders/ground.fs';

export class ElapsedWorld extends THREE.Object3D {

	private gManager: ElapsedGlobalManager;
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	private lights: THREE.Light[] = []
	private shadowMapper: ShadowMapper;

	constructor( gManager: ElapsedGlobalManager, renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.gManager = gManager;
		this.renderer = renderer;
		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Lights
		-------------------------------*/

		let light: THREE.DirectionalLight;

		light = new THREE.DirectionalLight();
		light.position.set( - 4, 1.5, 2 );
		this.scene.add( light );
		this.lights.push( light );

		/*-------------------------------
			ShadowMapper
		-------------------------------*/

		this.shadowMapper = new ShadowMapper( this.renderer, new THREE.Vector2( 1024, 1024 ), 2, light );

		/*-------------------------------
			Meshes
		-------------------------------*/

		let meshes: ( PowerMesh )[] = [];
		let standardMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] = [];

		this.scene.getObjectByName( 'Scene' ).traverse( obj => {

			if ( ( obj as THREE.Mesh ).isMesh ) {

				let base = obj as THREE.Mesh;
				base.visible = false;

				let mesh: PowerMesh | PowerReflectionMesh | null = null;

				if ( base.name == 'Ground' ) {

					let refMesh = new PowerReflectionMesh( base, {
						uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
							waterRoughness: this.gManager.assetManager.getTex( 'waterRoughness' ),
							noiseTex: this.gManager.assetManager.getTex( 'noise' ),
						} ),
						fragmentShader: groundFrag,
					} );
					mesh = refMesh;

				} else {

					mesh = new PowerMesh( base, {
						uniforms: this.commonUniforms
					} );

				}

				if ( mesh ) {

					this.scene.add( mesh );
					meshes.push( mesh );

				}

			}

		} );

		let cubemapLoader = new THREE.CubeTextureLoader();
		cubemapLoader.load( [
			'/assets/gl/elapsed/scene/env/px.png',
			'/assets/gl/elapsed/scene/env/nx.png',
			'/assets/gl/elapsed/scene/env/py.png',
			'/assets/gl/elapsed/scene/env/ny.png',
			'/assets/gl/elapsed/scene/env/pz.png',
			'/assets/gl/elapsed/scene/env/nz.png',
		], ( tex ) => {

			this.scene.background = tex;

			meshes.forEach( item=>{

				item.envMapUpdate = true;

			} );

			standardMesh.forEach( item=>{

				item.material.envMap = tex;
				item.material.envMapIntensity = 0.5;

			} );

		} );

	}

	public update( deltaTime: number, time: number ) {

		this.lights.forEach( ( item, index ) => {

			let p = item.position;

			p.applyQuaternion( new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0.0, - 1.0, 0.0 ).normalize(), 0.01 ) );

		} );

		this.shadowMapper.update( this.scene );

	}

	public resize( layerInfo: ORE.LayerInfo ) {

	}

}
