import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import sphereMatVert from './shaders/sphereMat.vs';
import sphereMatFrag from './shaders/sphereMat.fs';

export declare interface PowerMaterialParams extends THREE.MaterialParameters {
	roughness?: number,
	metalness?: number,
	uniforms?: any;
	vertexShader?: string;
	transparent?: boolean;
	useEnvMap?: boolean;
	envMap?: THREE.CubeTexture;
}

export class SphereMaterial extends THREE.ShaderMaterial {

	public envMap: THREE.CubeTexture;
	public roughness: number;
	public metalness: number;
	public envMapIntensity: number;

	constructor( param: PowerMaterialParams ) {

		param.uniforms = ORE.UniformsLib.mergeUniforms( param.uniforms, {
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
		param.uniforms = ORE.UniformsLib.mergeUniforms( param.uniforms, THREE.UniformsUtils.clone( THREE.ShaderLib.standard.uniforms ) );

		param.vertexShader = param.vertexShader || sphereMatVert;

		super( {
			vertexShader: param.vertexShader,
			fragmentShader: sphereMatFrag,
			uniforms: param.uniforms,
			lights: true
		} );

		this.roughness = param.roughness != undefined ? param.roughness : 0.2;
		this.metalness = param.metalness != undefined ? param.metalness : 0.3;
		this.envMapIntensity = 1.0;

	}

}
