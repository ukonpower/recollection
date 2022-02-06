import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { FocusedGlobalManager } from '../FocusedGlobalManager';
import { ShadowMapper } from '@common/ShadowMapper';
import { PowerMesh } from '@common/PowerMesh';
import { Particles } from './Particles';
import { FaceLine } from './FaceLine';


export class FocusedWorld extends THREE.Object3D {

	private gManager: FocusedGlobalManager;
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	public commonUniforms: ORE.Uniforms;

	private shadowMapper: ShadowMapper
	private mesh: THREE.Mesh;
	private particles: Particles

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
			ShadowMapper
		-------------------------------*/

		// this.shadowMapper = new ShadowMapper( this.renderer, new THREE.Vector2( 1024, 1024 ), new THREE.Vector2( 30.0, 30.0 ), light, 2.0 );

		/*-------------------------------
			Light
		-------------------------------*/

		let basePLight = new THREE.PointLight();
		basePLight.intensity = 0.0;
		basePLight.distance = 7.0;

		let leftLight = this.scene.getObjectByName( 'Light_Left' );
		leftLight.add( basePLight.clone() );

		let rightLight = this.scene.getObjectByName( 'Light_Right' );
		rightLight.add( basePLight.clone() );

		/*-------------------------------
			Face Line
		-------------------------------*/

		let faceLine = new FaceLine( this.scene.getObjectByName( 'Face_Line' ) as THREE.Line, this.commonUniforms );

		/*-------------------------------
			Meshes
		-------------------------------*/
		let meshes: ( PowerMesh )[] = [];

		this.scene.getObjectByName( 'Scene' ).traverse( obj => {

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				/*-------------------------------
					Light Mesh
				-------------------------------*/

				if ( mesh.name == 'Light' ) {

					mesh.material = new THREE.MeshBasicMaterial( {
						color: new THREE.Color( "#FFF" ),
					} );

					mesh.getWorldPosition( mesh.position );
					mesh.getWorldQuaternion( mesh.quaternion );
					mesh.getWorldScale( mesh.scale );
					this.scene.add( mesh );

					let pLight = new THREE.PointLight();
					pLight.distance = 7.0;
					pLight.intensity = 4.0;
					mesh.add( pLight );

					return;

				}

				let powerMesh = new PowerMesh( mesh, {
					uniforms: this.commonUniforms
				} );

				scene.add( powerMesh );
				meshes.push( powerMesh );
				mesh.visible = false;

			}

		} );

		new THREE.TextureLoader().load( '/focused/assets/scene/env.png', ( tex ) => {

			meshes.forEach( item=>{

				item.iblIntensity = 0.2;
				item.updateEnvMap( tex );

				if ( item.name == 'face' ) {

					item.envMapIntensity = 2.5;

				}

			} );

		} );

		/*-------------------------------
			Particles
		-------------------------------*/

		this.particles = new Particles( this.commonUniforms );
		this.particles.position.set( 0.0, 0.3, 12.0 );
		this.particles.renderOrder = 999;
		this.add( this.particles );

	}

	public update( deltaTime: number, time: number ) {

		// this.shadowMapper.update( this.scene );

		// this.light.position.set( - 20.0 * Math.sin( time ), 10.0, 20.0 * Math.cos( time ) );


	}

	public resize( layerInfo: ORE.LayerInfo ) {

	}

}
