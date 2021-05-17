import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { Lights } from './Lights';

export class ExtraneousWorld extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let lights = new Lights( this.scene );
		this.add( lights );

	}

}
