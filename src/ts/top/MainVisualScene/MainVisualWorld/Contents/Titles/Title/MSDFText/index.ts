import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import msdfVert from './shaders/msdf.vs';
import msdfFrag from './shaders/msdf.fs';
import msdfDepthFrag from './shaders/msdfDepth.fs';

export class MSDFText extends THREE.Object3D {

	protected uniforms: ORE.Uniforms;

	protected fontName: string;
	protected fontInfo: any;

	protected loader: THREE.TextureLoader;

	protected meshes: THREE.Mesh[] = [];

	constructor( fontName: string, parentUniforms: ORE.Uniforms ) {

		super();

		this.fontName = fontName;

		this.uniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

	}

	public setText( text: string ) {

		this.clearText();

		let length = text.length;

		let x = 0;

		for ( let i = 0; i < length; i ++ ) {

			let meshInfo = this.createTextMesh( text.charAt( i ) );
			let mesh = meshInfo.mesh;
			mesh.position.x = x;
			this.add( mesh );

			x += meshInfo.size.x;

		}

	}

	protected createTextMesh( char: string ) {

		let charInfo = this.getCharInfo( char );

		let left: number, top: number;
		let width: number, height: number;
		let size = new THREE.Vector2( 1.0, 1.0 );
		size.x = size.y * charInfo.width / charInfo.height;

		if ( charInfo ) {

			left = charInfo.x / this.fontInfo.common.scaleW;
			top = charInfo.y / this.fontInfo.common.scaleH;

			width = charInfo.width / this.fontInfo.common.scaleW;
			height = charInfo.height / this.fontInfo.common.scaleH;

		}

		let uni = ORE.UniformsLib.mergeUniforms( {
			left: {
				value: left
			},
			top: {
				value: top
			},
			width: {
				value: width
			},
			height: {
				value: height
			}
		}, this.uniforms );

		let geo = new THREE.PlaneBufferGeometry( size.x, size.y );
		let mat = new THREE.ShaderMaterial( {
			vertexShader: msdfVert,
			fragmentShader: msdfFrag,
			uniforms: uni,
			transparent: true,
		} );

		let mesh = new THREE.Mesh( geo, mat );
		mesh.customDepthMaterial = new THREE.ShaderMaterial( {
			vertexShader: msdfVert,
			fragmentShader: msdfDepthFrag,
			uniforms: uni,
			defines: {
				'DEPTH_PACKING': THREE.RGBADepthPacking
			}
		} );

		return {
			mesh: mesh,
			size: size
		};

	}

	private getCharInfo( char: string ) {

		for ( let i = 0; i < this.fontInfo.chars.length; i ++ ) {

			let c = this.fontInfo.chars[ i ];

			if ( c.char == char ) {

				return c;

			}

		}

		return null;

	}

	public clearText() {

		for ( let i = this.meshes.length - 1.0; i >= 0; i ++ ) {

			let mesh = this.meshes.pop();

			this.remove( mesh );
			mesh.geometry.dispose();
			( mesh.material as THREE.ShaderMaterial ).dispose();

		}

	}

}
