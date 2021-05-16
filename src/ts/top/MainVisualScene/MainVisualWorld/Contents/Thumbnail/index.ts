import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { GLList } from '../';

import thumbnailVert from './shaders/thumbnail.vs';
import thumbnailFrag from './shaders/thumbnail.fs';

export class Thumbnail extends THREE.Mesh {

	private glList: GLList;

	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;

	constructor( glList: GLList, parentUniforms?: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			currentTex: window.mainVisualManager.assetManager.textures[ glList[ 0 ].fileName ],
			nextTex: window.mainVisualManager.assetManager.textures[ glList[ 0 ].fileName ],
			index: {
				value: 0
			}
		} );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: thumbnailVert,
			fragmentShader: thumbnailFrag,
			uniforms: uni,
			transparent: true
		} );

		super( new THREE.PlaneBufferGeometry( 1.0, 1.0 * 9 / 16, 100, 100 ), mat );

		this.customDepthMaterial = new THREE.ShaderMaterial( {
			vertexShader: thumbnailVert,
			fragmentShader: THREE.ShaderLib.depth.fragmentShader,
			defines: {
				'DEPTH_PACKING': THREE.RGBADepthPacking,
			}
		} );

		this.glList = glList;

		this.commonUniforms = uni;

	}

	public update( selectorValue: number ) {

		let index = Math.floor( selectorValue );
		this.commonUniforms.index.value = index;

		this.commonUniforms.currentTex = window.mainVisualManager.assetManager.textures[ this.glList[ Math.min( this.glList.length - 1, Math.max( 0.0, index ) ) ].fileName ];
		this.commonUniforms.nextTex = window.mainVisualManager.assetManager.textures[ this.glList[ Math.min( this.glList.length - 1, Math.max( 0.0, index + 1 ) ) ].fileName ];

	}

}
