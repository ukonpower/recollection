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
		light.position.set( 10.0, 15.0, 10.0 );
		this.scene.add( light );

		/*-------------------------------
			ShadowMapper
		-------------------------------*/

		this.shadowMapper = new ShadowMapper( this.renderer, new THREE.Vector2( 1024, 1024 ), 30.0, light );

		/*-------------------------------
			Meshes
		-------------------------------*/

		this.scene.getObjectByName( 'Scene' ).traverse( obj => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				let powerMesh = new PowerMesh( mesh );

				scene.add( powerMesh );

			}

			mesh.visible = false;

		} );


	}

	public update( deltaTime: number, time: number ) {

		this.shadowMapper.update( this.scene );

	}

	public resize( layerInfo: ORE.LayerInfo ) {

	}

}
