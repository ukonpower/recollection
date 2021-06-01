import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { Lights } from './Lights';
import { Thought } from './Thought';

export class ExtraneousWorld extends THREE.Object3D {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	private thought: Thought;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		super();

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		let lights = new Lights( this.scene );
		this.add( lights );

		this.thought = new Thought( this.scene, this.commonUniforms );

	}

	public update( deltaTime: number ) {

		this.thought.update( deltaTime );

	}

	public nextDay() {

		this.thought.nextDay();

	}

}
