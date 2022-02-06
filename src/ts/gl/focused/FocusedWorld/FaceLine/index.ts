import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import faceLineVert from './shaders/faceLine.vs';
import faceLineFrag from './shaders/faceLine.fs';

export class FaceLine {

	private commonUniforms: ORE.Uniforms;
	private line: THREE.Line

	constructor( line: THREE.Line, parentUniforms: ORE.Uniforms ) {

		this.line = line;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {} );

		this.line.material = new THREE.ShaderMaterial( {
			vertexShader: faceLineVert,
			fragmentShader: faceLineFrag,
			uniforms: this.commonUniforms,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		} );

	}

}
