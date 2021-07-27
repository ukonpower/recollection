import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { K } from './K';
import { AmbientLight, DirectionalLight, PointLight } from 'three';
import { Floor } from './Floor';

export class WarmthWorld extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	private k: K;
	private floor: Floor

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let light = new DirectionalLight();
		light.position.set( - 3, 2, 1 );
		light.intensity = 1.5;
		this.scene.add( light );

		let pLight = new PointLight();
		pLight.position.set( 0, 2, 0 );
		this.scene.add( pLight );

		let aLight = new AmbientLight();
		aLight.intensity = 0.1;
		this.scene.add( aLight );

		this.k = new K( this.scene, this.commonUniforms );

		this.floor = new Floor( this.scene, this.commonUniforms );

	}

	public update( deltaTime: number ) {

		this.k.update( deltaTime );

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.floor.resize( layerInfo );

	}

}
