import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { PowerMesh } from './PowerMesh';

export class ElapsedWorld extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let light = new THREE.DirectionalLight();
		light.position.set( 1, 1, 0 );
		this.scene.add( light );

		light = new THREE.DirectionalLight();
		light.position.set( - 1, 1, 0 );
		this.scene.add( light );

		let meshes: PowerMesh[] = [];

		this.scene.getObjectByName( 'Scene' ).traverse( obj => {

			if ( ( obj as THREE.Mesh ).isMesh ) {

				let base = obj as THREE.Mesh;
				base.visible = false;

				let powerMesh = new PowerMesh( base, this.commonUniforms );
				this.scene.add( powerMesh );

				meshes.push( powerMesh );

			}

		} );

		// let box = new THREE.Mesh( new THREE.BoxBufferGeometry(), new THREE.MeshStandardMaterial() );
		// box.position.set( 2, 0.5, 0 );
		// this.scene.add( box );

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

		} );

	}

	public update( deltaTime: number, time: number ) {

	}

	public resize( layerInfo: ORE.LayerInfo ) {

	}

}
