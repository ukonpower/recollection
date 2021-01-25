import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { GLList } from '../';

import thumbnailVert from './shaders/thumbnail.vs';
import thumbnailFrag from './shaders/thumbnail.fs';

export class Thumbnail extends THREE.Mesh {

	private glList: GLList;
	private thumbnails: Thumbnail[];

	private commonUniforms: ORE.Uniforms;

	constructor( glList: GLList, parentUniforms?: ORE.Uniforms ) {

		console.log( window.mainVisualManager.assetManager.textures );

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			currentTex: window.mainVisualManager.assetManager.textures[ glList[ 0 ].fileName ],
			nextTex: window.mainVisualManager.assetManager.textures[ glList[ 0 ].fileName ]
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

		this.init();

	}

	protected init() {
	}

	public update( selectorValue: number ) {

		let s = Math.min( this.glList.length - 1, Math.max( 0.0, selectorValue ) );
		this.commonUniforms.currentTex = window.mainVisualManager.assetManager.textures[ this.glList[ Math.floor( s ) ].fileName ];
		this.commonUniforms.nextTex = window.mainVisualManager.assetManager.textures[ this.glList[ Math.min( Math.floor( s + 1 ), this.glList.length - 1.0 ) ].fileName ];

	}

}
