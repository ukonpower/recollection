import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { BlurTexture } from './BlurTexture';

import reflectionMatVert from './shaders/reflectionMat.vs';
import reflectionMatFrag from './shaders/reflectionMat.fs';

export declare interface PowerMaterialParams extends THREE.MaterialParameters {
	roughness?: number,
	metalness?: number,
	uniforms?: any;
	vertexShader?: string;
	transparent?: boolean;
	useEnvMap?: boolean;
	envMap?: THREE.CubeTexture;
}

export class ReflectionMat extends THREE.ShaderMaterial {

	public envMap: THREE.CubeTexture;
	public roughness: number;
	public metalness: number;
	public envMapIntensity: number;

	constructor( param: PowerMaterialParams ) {


		param.uniforms = ORE.UniformsLib.mergeUniforms( param.uniforms, THREE.UniformsUtils.clone( THREE.ShaderLib.standard.uniforms ) );
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

		param.vertexShader = param.vertexShader || reflectionMatVert;

		super( {
			vertexShader: param.vertexShader,
			fragmentShader: reflectionMatFrag,
			uniforms: param.uniforms,
			lights: true,
			extensions: {
				derivatives: true
			}
		} );

		this.roughness = param.roughness != undefined ? param.roughness : 0.5;
		this.metalness = param.metalness != undefined ? param.metalness : 0.5;
		this.envMapIntensity = 1.0;

	}

}
