import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { FocusedGlobalManager } from '../FocusedGlobalManager';
import { ShadowMapper } from '@common/ShadowMapper';
import { PowerMesh } from '@common/PowerMesh';


export class FocusedWorld extends THREE.Object3D {

	private gManager: FocusedGlobalManager;
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	public commonUniforms: ORE.Uniforms;

	private light: THREE.DirectionalLight;
	private shadowMapper: ShadowMapper

	private mesh: THREE.Mesh;

	constructor( gManager: FocusedGlobalManager, renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

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
		light.position.set( - 10, 10, 5.0 );
		// this.scene.add( light );

		this.light = light;

		let pLight = new THREE.PointLight();
		pLight.position.set( 0, 3, 5 );
		pLight.intensity = 6.0;
		pLight.distance = 6.0;
		this.scene.add( pLight );

		/*-------------------------------
			ShadowMapper
		-------------------------------*/

		// this.shadowMapper = new ShadowMapper( this.renderer, new THREE.Vector2( 1024, 1024 ), new THREE.Vector2( 30.0, 30.0 ), light, 2.0 );

		/*-------------------------------
			Meshes
		-------------------------------*/
		let meshes: ( PowerMesh )[] = [];

		this.scene.getObjectByName( 'Scene' ).traverse( obj => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				let powerMesh = new PowerMesh( mesh, {
					uniforms: this.commonUniforms
				} );

				scene.add( powerMesh );
				meshes.push( powerMesh );

			}

			mesh.visible = false;

		} );

		// let cubemapLoader = new THREE.CubeTextureLoader();
		// cubemapLoader.load( [
		// 	'/assets/scene/img/env/px.jpg',
		// 	'/assets/scene/img/env/nx.jpg',
		// 	'/assets/scene/img/env/py.jpg',
		// 	'/assets/scene/img/env/ny.jpg',
		// 	'/assets/scene/img/env/pz.jpg',
		// 	'/assets/scene/img/env/nz.jpg',
		// ], ( tex ) => {

		// 	this.scene.background = tex;
		// 	this.scene.background.encoding = THREE.sRGBEncoding;

		// 	meshes.forEach( item=>{

		// 		item.updateEnvMap( tex );

		// 	} );

		// 	this.commonUniforms.globalEnvMap.value = tex;

		// } );

		new THREE.TextureLoader().load( '/focused/assets/scene/env.png', ( tex ) => {

			meshes.forEach( item=>{

				item.updateEnvMap( tex );

			} );

		} );


	}

	public update( deltaTime: number, time: number ) {

		// this.shadowMapper.update( this.scene );

		// this.light.position.set( - 20.0 * Math.sin( time ), 10.0, 20.0 * Math.cos( time ) );


	}

	public resize( layerInfo: ORE.LayerInfo ) {

	}

}
