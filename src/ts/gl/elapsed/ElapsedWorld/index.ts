import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { ShadowMapper } from '@common/ShadowMapper';
import { ElapsedGlobalManager } from '../ElapsedGlobalManager';

import groundFrag from './shaders/ground.fs';
import sceneFrag from './shaders/scene.fs';
import { K } from './K';
import { PowerMesh } from '@common/PowerMesh';
import { PowerReflectionMesh } from '@common/PowerMesh/PowerReflectMesh';

export class ElapsedWorld extends THREE.Object3D {

	private gManager: ElapsedGlobalManager;
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	public commonUniforms: ORE.Uniforms;

	private lights: THREE.Light[] = []
	private k: K;
	private shadowMapper: ShadowMapper;

	constructor( gManager: ElapsedGlobalManager, renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.gManager = gManager;
		this.renderer = renderer;
		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			globalEnvMap: {
				value: null
			}
		} );

		/*-------------------------------
			Lights
		-------------------------------*/

		let light: THREE.DirectionalLight;

		light = new THREE.DirectionalLight();
		light.position.set( - 4, 1.5, 2 );
		light.intensity = 1.55;
		this.scene.add( light );
		this.lights.push( light );

		this.k = new K( this.gManager, this.commonUniforms );
		this.scene.add( this.k );

		this.k.position.copy( this.scene.getObjectByName( 'K' ).position );

		/*-------------------------------
			ShadowMapper
		-------------------------------*/

		this.shadowMapper = new ShadowMapper( this.renderer, new THREE.Vector2( 1024, 1024 ), new THREE.Vector2( 2.0, 2.0 ), light );

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
							skyTex: this.gManager.assetManager.getTex( 'sky' )
						} ),
						fragmentShader: groundFrag,
					} );
					mesh = refMesh;

				} else {

					mesh = new PowerMesh( base, {
						fragmentShader: sceneFrag,
						uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
							skyTex: this.gManager.assetManager.getTex( 'sky' )
						} ),
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
			'/elapsed/assets/scene/env/pz.jpg',
			'/elapsed/assets/scene/env/nz.jpg',
			'/elapsed/assets/scene/env/py.jpg',
			'/elapsed/assets/scene/env/ny.jpg',
			'/elapsed/assets/scene/env/px.jpg',
			'/elapsed/assets/scene/env/nx.jpg',
		], ( tex ) => {

			this.scene.background = tex;

			meshes.forEach( item=>{

				item.updateEnvMap( tex );

			} );

			standardMesh.forEach( item=>{

				item.material.envMap = tex;
				item.material.envMapIntensity = 0.5;

			} );

			this.commonUniforms.globalEnvMap.value = tex;

		} );


	}

	public update( deltaTime: number, time: number ) {

		this.lights.forEach( ( item, index ) => {

			let t = time * 0.5 + 0.0;
			let p = item.position;
			p.set( Math.sin( - t ) * 3.0, 1.5 + Math.sin( - t + Math.PI ) * 0.8, Math.cos( - t ) * 3.0 );
			p.multiplyScalar( 5 );

		} );


		this.k.update( time );

		this.shadowMapper.update( this.scene );

	}

	public resize( layerInfo: ORE.LayerInfo ) {

	}

}
