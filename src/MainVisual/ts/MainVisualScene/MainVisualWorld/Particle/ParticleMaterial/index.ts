import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import particleVert from './shaders/particle.vs';
import particleFrag from './shaders/particle.fs';

export declare interface ParticleMaterialParam extends THREE.MaterialParameters {
	roughness?: number,
	metalness?: number,
	uniforms?: any;
	vertexShader?: string;
	transparent?: boolean;
	useEnvMap?: boolean;
	envMap?: THREE.CubeTexture;
}

export class ParticleMaterial extends THREE.ShaderMaterial {

	public envMap: THREE.CubeTexture;
	public roughness: number;
	public metalness: number;
	public envMapIntensity: number;

	constructor( param: ParticleMaterialParam ) {

		param.uniforms = param.uniforms || {};

		let baseUni = THREE.UniformsUtils.merge(
			[
				THREE.UniformsLib.lights,
				THREE.UniformsLib.envmap,
				THREE.ShaderLib.physical.uniforms,
			]
		);

		param.uniforms = ORE.UniformsLib.CopyUniforms( param.uniforms, {
			roughness: {
				value: 0
			},
			metalness: {
				value: 0
			},
			opacity: {
				value: 0
			},
			clearcoat: {
				value: 0
			}
		} );
		param.uniforms = ORE.UniformsLib.CopyUniforms( param.uniforms, baseUni );

		param.vertexShader = param.vertexShader || particleVert;

		super( {
			vertexShader: param.vertexShader,
			fragmentShader: particleFrag,
			uniforms: param.uniforms,
			lights: true
		} );

		this.roughness = param.roughness != undefined ? param.roughness : 0.2;
		this.metalness = param.metalness != undefined ? param.metalness : 0.3;
		this.envMapIntensity = 1.0;

	}

	public get isMeshStandardMaterial() {

		return true;

	}

	public get isMeshPhysicalMaterial() {

		return true;

	}

}
