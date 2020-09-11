import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import particleInstancedVert from './shaders/particleInstanced.vs';
import particleInstancedFrag from './shaders/particleInstanced.fs';

import particlePointVert from './shaders/particlePoint.vs';
import particlePointFrag from './shaders/particlePoint.fs';

export class Dust extends THREE.Object3D {

	private commonUniforms: ORE.Uniforms;

	private range: THREE.Vector3;
	private num: number;

	constructor( parentUniforms?: ORE.Uniforms ) {

		super();

		this.num = 50;
		this.range = new THREE.Vector3( 20, 8, 20 );

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {
			total: {
				value: this.num
			}
		}, parentUniforms );

		this.createInstancedMesh();

	}

	private createInstancedMesh() {

		let scale = 0.3;
		let originGeo = new THREE.BoxBufferGeometry( scale, scale, scale );

		let geo = new THREE.InstancedBufferGeometry();
		geo.setAttribute( 'position', originGeo.getAttribute( 'position' ) );
		geo.setAttribute( 'uv', originGeo.getAttribute( 'uv' ) );
		geo.setAttribute( 'normal', originGeo.getAttribute( 'normal' ) );
		geo.setIndex( originGeo.getIndex() );

		let numArray = [];
		let offsetPositionArray = [];

		for ( let i = 0; i < this.num; i ++ ) {

			numArray.push( i / ( this.num - 1.0 ) );

			offsetPositionArray.push(
				( Math.random() - 0.5 ) * this.range.x,
				( Math.random() - 0.5 ) * this.range.y + this.range.y / 2.0,
				( Math.random() - 0.5 ) * this.range.z,
			);

		}

		let num = new THREE.InstancedBufferAttribute( new Float32Array( numArray ), 1 );
		let offsetPosition = new THREE.InstancedBufferAttribute( new Float32Array( offsetPositionArray ), 3 );

		geo.setAttribute( 'num', num );
		geo.setAttribute( 'offsetPos', offsetPosition );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: particleInstancedVert,
			fragmentShader: particleInstancedFrag,
			uniforms: this.commonUniforms,
			// wireframe: true,
			transparent: true,
			// blending: THREE.AdditiveBlending
		} );

		let mesh = new THREE.Mesh( geo, mat );
		mesh.frustumCulled = false;
		this.add( mesh );

	}

}
