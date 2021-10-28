import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { PowerMesh } from './PowerMesh';
import { ShadowMapper } from './ShadowMapper';
import { PowerReflectionMesh } from './PowerReflectMesh';

export class ElapsedWorld extends THREE.Object3D {

	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	private lights: THREE.Light[] = []
	private shadowMapper: ShadowMapper;

	constructor( renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.renderer = renderer;
		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			Lights
		-------------------------------*/

		let light: THREE.DirectionalLight;

		light = new THREE.DirectionalLight();
		light.position.set( 0, 3, 5 );
		this.scene.add( light );
		this.lights.push( light );

		/*-------------------------------
			ShadowMapper
		-------------------------------*/

		this.shadowMapper = new ShadowMapper( this.renderer, new THREE.Vector2( 512, 512 ), 10, light );

		/*-------------------------------
			Meshes
		-------------------------------*/

		let meshes: PowerMesh[] = [];
		let standardMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] = [];

		this.scene.getObjectByName( 'Scene' ).traverse( obj => {

			if ( ( obj as THREE.Mesh ).isMesh ) {

				let base = obj as THREE.Mesh;
				base.visible = false;

				let mesh: PowerMesh | PowerReflectionMesh | null = null;

				if ( base.name == 'Plane1' ) {

					let refMesh = new PowerReflectionMesh( base, this.commonUniforms );
					mesh = refMesh;

				} else if ( base.name == 'Plane2' || base.name == 'dragon2' ) {

					base.visible = true;
					base.material = new THREE.MeshStandardMaterial( {
						roughness: 0.1
					} );

					standardMesh.push( base as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> );

				} else {

					mesh = new PowerMesh( base, this.commonUniforms );

				}

				if ( mesh ) {

					this.scene.add( mesh );
					meshes.push( mesh );

				}

			}

		} );

		let cubemapLoader = new THREE.CubeTextureLoader();
		cubemapLoader.load( [
			'/assets/scene/img/env/px.jpg',
			'/assets/scene/img/env/nx.jpg',
			'/assets/scene/img/env/py.jpg',
			'/assets/scene/img/env/ny.jpg',
			'/assets/scene/img/env/pz.jpg',
			'/assets/scene/img/env/nz.jpg',
		], ( tex ) => {

			this.scene.background = tex;

			meshes.forEach( item=>{

				item.envMapUpdate = true;

			} );

			standardMesh.forEach( item=>{

				item.material.envMap = tex;
				console.log( item );


			} );

		} );

	}

	public update( deltaTime: number, time: number ) {

		this.lights.forEach( ( item, index ) => {

			let p = item.position;

			p.applyQuaternion( new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0.0, 1.0, 0.0 ), Math.sin( time * 1.0 ) * 0.02 ) );

		} );

		this.shadowMapper.update( this.scene );

	}

	public resize( layerInfo: ORE.LayerInfo ) {

	}

}
