import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import comPosition from './shaders/aboutTrailsComputePosition.glsl';
import comVelocity from './shaders/aboutTrailsComputeVelocity.glsl';

import trailsVert from './shaders/aboutTrails.vs';
import trailsFrag from './shaders/aboutTrails.fs';

declare interface Kernels{
    velocity: ORE.GPUComputationKernel,
    position: ORE.GPUComputationKernel
}

declare interface Datas{
    velocity: ORE.GPUcomputationData,
    position: ORE.GPUcomputationData
}


export class AboutTrails extends THREE.Object3D {

	private animator: ORE.Animator;

	public enabled: boolean = true;
	private renderer: THREE.WebGLRenderer;
	private num: number;
	private length: number;

	private gCon: ORE.GPUComputationController;
	private kernels: Kernels;
	private datas: Datas;

	private commonUniforms: ORE.Uniforms;
	private meshUniforms: ORE.Uniforms;

	constructor( renderer: THREE.WebGLRenderer, num: number, length: number, parentUniforms: ORE.Uniforms ) {

		super();

		this.renderer = renderer;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			dataSize: {
				value: new THREE.Vector2( length, num )
			},
			fadeIn: {
				value: false
			}
		} );

		/*------------------------
			Animator
		------------------------*/

		this.animator = window.mainVisualManager.animator;

		this.commonUniforms.visibility = this.animator.add( {
			name: 'trailsVisibility',
			initValue: 0,
		} );

		this.num = num;
		this.length = length;

		this.initGPUComputationController();
		this.createTrails();

		let l = new THREE.DirectionalLight();
		l.position.set( 1, 1, 1 );
		this.add( l );

	}

	initGPUComputationController() {

		this.gCon = new ORE.GPUComputationController( this.renderer, new THREE.Vector2( this.length, this.num ) );

		//create computing position kernel
		let posUni = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			dataPos: { value: null },
			dataVel: { value: null },
		} );

		let posKernel = this.gCon.createKernel( {
			fragmentShader: comPosition,
			uniforms: posUni
		} );

		//create computing velocity kernel
		let velUni = ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
			dataPos: { value: null },
			dataVel: { value: null },
			seed: {
				value: Math.random() * 100
			}
		} );


		let velKernel = this.gCon.createKernel( {
			fragmentShader: comVelocity,
			uniforms: velUni
		} );

		this.kernels = {
			position: posKernel,
			velocity: velKernel,
		};

		this.initData();

	}

	public initData() {

		if ( this.datas ) {

			if ( this.datas.position.buffer ) {

				this.datas.position.buffer.dispose();

			}

			if ( this.datas.velocity.buffer ) {

				this.datas.velocity.buffer.dispose();

			}

		}

		this.datas = {
			position: this.gCon.createData( this.createInitialPositionData() ),
			velocity: this.gCon.createData(),
		};

	}

	private createInitialPositionData() {

    	let dataArray = [];

    	for ( let i = 0; i < this.num; i ++ ) {

			let pos = [
				( Math.random() - 0.5 ) * 10.0,
				( Math.random() - 0.5 ) * 10.0,
				( Math.random() - 0.5 ) * 10.0,
				0,
			];

    		for ( let j = 0; j < this.length; j ++ ) {


				pos.forEach( item => {

					dataArray.push( item );

				} );

    		}

    	}

    	return new THREE.DataTexture( new Float32Array( dataArray ), this.length, this.num, THREE.RGBAFormat, THREE.FloatType );

	}

	private createTrails() {

		let geo = new THREE.InstancedBufferGeometry();

		let posArray = [];
		let indexArray = [];
		let normalArray = [];
		let uvXArray = [];
		let uvYArray = [];

		let r = .1;
		let res = 4;
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

		let standard = THREE.ShaderLib.standard.uniforms;
		this.meshUniforms = ORE.UniformsLib.mergeUniforms( standard, this.commonUniforms );
		this.meshUniforms = ORE.UniformsLib.mergeUniforms( this.meshUniforms, {
			dataPos: {
				value: null
			},
			dataVel: {
				value: null
			} }
		);

		this.meshUniforms.roughness.value = 0.5;
		this.meshUniforms.metalness.value = 0.3;

		let mat = new THREE.ShaderMaterial( {
			uniforms: this.meshUniforms,
			vertexShader: trailsVert,
			fragmentShader: trailsFrag,
			lights: true,
			flatShading: true,
			transparent: true,
		} );

		let mesh = new THREE.Mesh( geo, mat );
		mesh.frustumCulled = false;

		mesh.customDepthMaterial = new THREE.ShaderMaterial( {
			vertexShader: trailsVert,
			fragmentShader: trailsFrag,
			uniforms: this.meshUniforms,
			defines: {
				'DEPTH': '',
				'DEPTH_PACKING': ''
			},
			side: THREE.DoubleSide
		} );

		this.add( mesh );

		/*------------------------
			add listener
		------------------------*/
		this.animator.addEventListener( 'update', ( e ) => {

			if ( this.animator.get( 'trailsVisibility' ) > 0 ) {

				this.update();

			}

		} );

	}

	public switchVisibility( visible: boolean ) {

		this.commonUniforms.fadeIn.value = visible;

		this.animator.animate( 'trailsVisibility', visible ? 1 : 0, 2 );

	}

	public update() {

		if ( this.enabled ) {

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

}
