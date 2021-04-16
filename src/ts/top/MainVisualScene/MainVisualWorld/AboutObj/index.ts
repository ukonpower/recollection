import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class AboutObj extends THREE.Object3D {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.init();

	}

	protected init() {

	}

}
