import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class ElapsedWorld extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let light = new THREE.DirectionalLight();
		light.position.set( 1, 1, 1 );
		this.scene.add( light );

	}

	public update( deltaTime: number, time: number ) {

	}

	public resize( layerInfo: ORE.LayerInfo ) {

	}

}
