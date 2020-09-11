import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import comPosition from './shaders/comPosition.fs';
import comVelocity from './shaders/comVelocity.fs';

import trailsVert from './shaders/trails.vs';
import trailsFrag from './shaders/trails.fs';

import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

declare interface Kernels{
    velocity: ORE.GPUComputationKernel,
    position: ORE.GPUComputationKernel
}

declare interface Datas{
    velocity: ORE.GPUcomputationData,
    position: ORE.GPUcomputationData
}


export class Trails extends THREE.Object3D {

	private renderer: THREE.WebGLRenderer;
	private num: number;
	private length: number;

	private gCon: ORE.GPUComputationController;
	private kernels: Kernels;
	private datas: Datas;
	private particles: THREE.Mesh;

	private commonUniforms: ORE.Uniforms;
	private meshUniforms: ORE.Uniforms;

	constructor( renderer: THREE.WebGLRenderer, num: number, length: number, parentUniforms: ORE.Uniforms ) {

		super();

		this.renderer = renderer;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		this.num = num;
		this.length = length;

		this.initGPUComputationController();
		this.createTrails();

	}

	initGPUComputationController() {

		this.gCon = new ORE.GPUComputationController( this.renderer, new THREE.Vector2( this.length, this.num ) );

		//create computing position kernel
		let posUni = ORE.UniformsLib.CopyUniforms( {
			dataPos: { value: null },
			dataVel: { value: null },
		}, this.commonUniforms );

		let posKernel = this.gCon.createKernel( comPosition, posUni );

		//create computing velocity kernel
		let velUni = ORE.UniformsLib.CopyUniforms( {
			dataPos: { value: null },
			dataVel: { value: null },
			seed: {
				value: Math.random() * 100
			}
		}, this.commonUniforms );


		let velKernel = this.gCon.createKernel( comVelocity, velUni );

		this.kernels = {
			position: posKernel,
			velocity: velKernel,
		};

		this.datas = {
			position: this.gCon.createData(),
			velocity: this.gCon.createData(),
		};

	}

	private createTrails() {

		let geo = new THREE.InstancedBufferGeometry();

		let posArray = [];
		let indexArray = [];
		let normalArray = [];
		let uvXArray = [];
		let uvYArray = [];

		let r = .1;
		let res = 10;
		for ( let j = 0; j < this.length; j ++ ) {

			let cNum = j;
			for ( let k = 0; k < res; k ++ ) {

				let rad = Math.PI * 2 / res * k;
				let x = Math.cos( rad ) * r;
				let y = Math.sin( rad ) * r;
				let z = j * 1.6;
				z = 0;

				posArray.push( x );
				posArray.push( y );
				posArray.push( z );

				let nml = new THREE.Vector3( x, y, z );
				nml.normalize();

				normalArray.push( nml.x, nml.y, nml.z );

				uvXArray.push( j / this.length );

				let c = cNum * res + k;
				if ( j > 0 ) {

					indexArray.push( c );
					indexArray.push( ( ( cNum - 1 ) * ( res ) + ( k + 1 ) % res ) );
					indexArray.push( ( cNum * res + ( ( k + 1 ) % res ) ) );

					indexArray.push( c );
					indexArray.push( c - res );
					indexArray.push( ( ( cNum - 1 ) * res + ( ( k + 1 ) % res ) ) );

				}

			}

		}

		let pos = new Float32Array( posArray );
		let normal = new Float32Array( normalArray );
		let uvx = new Float32Array( uvXArray );
		let indices = new Uint16Array( indexArray );

		geo.setAttribute( 'position', new THREE.BufferAttribute( pos, 3 ) );
		geo.setAttribute( 'uvx', new THREE.BufferAttribute( uvx, 1 ) );
		geo.setAttribute( 'normal', new THREE.BufferAttribute( normal, 3 ) );
		geo.setIndex( new THREE.BufferAttribute( indices, 1 ) );

		//instanecing attribute
		for ( let i = 0; i < this.num; i ++ ) {

			uvYArray.push( i / this.num );

		}

		let uvy = new Float32Array( uvYArray );
		geo.setAttribute( 'uvy', new THREE.InstancedBufferAttribute( uvy, 1, false, 1 ) );

		let customUni: ORE.Uniforms = {
			dataPos: {
				value: null
			},
			dataVel: {
				value: null
			},
		};

		let standard = THREE.ShaderLib.standard;
		this.meshUniforms = THREE.UniformsUtils.merge( [ standard.uniforms, customUni ] );
		this.meshUniforms = ORE.UniformsLib.CopyUniforms( this.meshUniforms, this.commonUniforms );

		this.meshUniforms.roughness.value = 0.5;
		this.meshUniforms.metalness.value = 0.3;

		let mat = new THREE.ShaderMaterial( {
			uniforms: this.meshUniforms,
			vertexShader: trailsVert,
			fragmentShader: trailsFrag,
			lights: true,
			flatShading: true,
			side: THREE.BackSide,
			transparent: true
		} );

		let mesh = new THREE.Mesh( geo, mat );
		mesh.frustumCulled = false;
		this.add( mesh );

	}

	public update() {

		this.kernels.velocity.uniforms.dataPos.value = this.datas.position.buffer.texture;
		this.kernels.velocity.uniforms.dataVel.value = this.datas.velocity.buffer.texture;
		this.gCon.compute( this.kernels.velocity, this.datas.velocity );

		this.kernels.position.uniforms.dataPos.value = this.datas.position.buffer.texture;
		this.kernels.position.uniforms.dataVel.value = this.datas.velocity.buffer.texture;
		this.gCon.compute( this.kernels.position, this.datas.position );

		this.meshUniforms.dataPos.value = this.datas.position.buffer.texture;
		this.meshUniforms.dataVel.value = this.datas.velocity.buffer.texture;

	}

}
