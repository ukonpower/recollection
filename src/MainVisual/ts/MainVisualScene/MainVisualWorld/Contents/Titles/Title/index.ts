import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import msdfVert from './shaders/msdf.vs';
import msdfFrag from './shaders/msdf.fs';
import msdfDepthFrag from './shaders/msdfDepth.fs';

type TextOrigin = 'left' | 'center' | 'right';

export class Title extends THREE.Object3D {

	protected animatorID: string;

	protected animator: ORE.Animator;
	protected uniforms: ORE.Uniforms;

	protected fontInfo: any;
	protected loader: THREE.TextureLoader;
	protected meshes: THREE.Mesh[] = [];

	constructor( titleID: string, fontInfo: any, parentUniforms: ORE.Uniforms ) {

		super();

		this.animatorID = '';
		this.fontInfo = fontInfo;

		this.uniforms = ORE.UniformsLib.CopyUniforms( {
		}, parentUniforms );

		this.initAnimator();

	}

	protected initAnimator() {

		this.animator = window.mainVisualManager.animator;

		let animateObj: ORE.AnimatorVariable<number>;

		let i = 0;

		do {

			this.animatorID = 'titleVisibility' + i.toString();
			animateObj = this.animator.getVariableObject( this.animatorID, true );

			i ++;

		} while ( animateObj != null && animateObj.time != - 1 );


		this.uniforms.visibility = this.animator.add( {
			name: this.animatorID,
			initValue: 0,
			easing: {
				func: ORE.Easings.linear,
			}
		} );

	}

	public setText( text: string, origin: TextOrigin = "center" ) {

		let fontHeight = 0.7;

		// this.clearText();

		let x = this.getStartX( origin, text, fontHeight );

		for ( let i = 0; i < text.length; i ++ ) {

			let meshInfo = this.createTextMesh( i / ( text.length - 1.0 ), text.charAt( i ), fontHeight );
			let mesh = meshInfo.mesh;
			mesh.position.x = x;
			this.add( mesh );
			this.meshes.push( mesh );

			x += meshInfo.size.x;

		}

		return this.animator.animate( this.animatorID, 1 );

	}

	protected getStartX( origin: TextOrigin, text: string, fontHeight: number, ) {

		let textWidth: number = 0;

		for ( let i = 0; i < text.length; i ++ ) {

			let info = this.getCharInfo( text.charAt( i ) );
			let sizeX = fontHeight * ( info.width / info.height );
			textWidth += sizeX;

		}

		if ( origin == 'left' ) {

			return 0;

		} else if ( origin == 'center' ) {

			return - textWidth / 2;

		} else if ( origin == 'right' ) {

			return - textWidth;

		}

	}

	protected createTextMesh( index: number, char: string, fontHeight: number = 1.0 ) {

		let charInfo = this.getCharInfo( char );

		let left: number, top: number;
		let width: number, height: number;
		let size = new THREE.Vector2( 1.0, fontHeight );
		size.x = size.y * charInfo.width / charInfo.height;

		if ( charInfo ) {

			left = charInfo.x / this.fontInfo.common.scaleW;
			top = charInfo.y / this.fontInfo.common.scaleH;

			width = charInfo.width / this.fontInfo.common.scaleW;
			height = charInfo.height / this.fontInfo.common.scaleH;

		}

		let uni = ORE.UniformsLib.CopyUniforms( {
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
			},
			index: {
				value: index
			}
		}, this.uniforms );

		let geo = new THREE.BufferGeometry();
		geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [
			0, - 0.5 * size.y, 0.0,
			1.0 * size.x, - 0.5 * size.y, 0.0,
			1.0 * size.x, 0.5 * size.y, 0.0,
			0, 0.5 * size.y, 0.0
		] ), 3.0 ) );

		geo.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( [
			0, 0,
			1, 0,
			1, 1,
			0, 1
		] ), 2.0 ) );

		geo.setIndex( new THREE.BufferAttribute( new Uint16Array( [
			0, 1, 2,
			0, 2, 3
		] ), 1 ) );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: msdfVert,
			fragmentShader: msdfFrag,
			uniforms: uni,
			transparent: true,
			depthTest: false,
		} );

		let mesh = new THREE.Mesh( geo, mat );
		mesh.renderOrder = 10;

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

	protected getCharInfo( char: string ) {

		for ( let i = 0; i < this.fontInfo.chars.length; i ++ ) {

			let c = this.fontInfo.chars[ i ];

			if ( c.char == char ) {

				return c;

			}

		}

		return null;

	}

	public clearText() {

		let duration = 1.0;

		return this.animator.animate( this.animatorID, 2, duration, () => {

			for ( let i = this.meshes.length - 1.0; i >= 0; i -- ) {

				let mesh = this.meshes.pop();

				this.remove( mesh );
				mesh.geometry.dispose();
				( mesh.material as THREE.ShaderMaterial ).dispose();

			}

		} );

	}

}
