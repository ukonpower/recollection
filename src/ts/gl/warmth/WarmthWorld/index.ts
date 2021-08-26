import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { K } from './K';
import { AmbientLight, DirectionalLight, PointLight } from 'three';
import { Floor } from './Floor';
import { Particles } from './Particles';

export class WarmthWorld extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	private k: K;
	private floor: Floor
	private particles: Particles;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let light = new DirectionalLight();
		light.position.set( - 3, 2, 1 );
		light.intensity = 1.9;
		this.scene.add( light );

		let pLight = new PointLight();
		pLight.position.set( 0, 2, 0 );
		pLight.intensity = 0.5;
		this.scene.add( pLight );

		let aLight = new AmbientLight();
		aLight.intensity = 0.05;
		this.scene.add( aLight );

		this.k = new K( this.commonUniforms );
		this.k.position.set( - 0.8, 0.5, - 3, );
		this.scene.add( this.k );

		this.particles = new Particles( this.commonUniforms );
		this.particles.position.set( 0, 0, - 10 );
		this.scene.add( this.particles );

		this.floor = new Floor( this.scene, this.commonUniforms );

	}

	public update( deltaTime: number ) {

		this.k.update( deltaTime );

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.floor.resize( layerInfo );

	}

}
