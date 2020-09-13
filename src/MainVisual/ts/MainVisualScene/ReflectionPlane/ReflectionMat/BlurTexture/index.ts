import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import blurFrag from './shaders/blur.fs';
import mixFrag from './shaders/mix.fs';

export class BlurTexture {

	private commonUniforms: ORE.Uniforms;
	private renderer: THREE.WebGLRenderer;

	private mixPP: ORE.PostProcessing;

	private blurPP: ORE.PostProcessing;
	public texture: { value: THREE.Texture };

	public blur: number;
	public renderCnt = 5;

	constructor( renderer: THREE.WebGLRenderer, size: THREE.Vector2, parentUni: ORE.Uniforms ) {

		this.renderer = renderer;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {
			texResolution: {
				value: size
			},
			texAspectRatio: {
				value: size.x / size.y
			},
			blurWeight: {
				value: 0
			}
		}, parentUni );

		this.texture = {
			value: null
		};

		this.mixPP = new ORE.PostProcessing( this.renderer,
			[ {
				fragmentShader: mixFrag,
				uniforms: ORE.UniformsLib.CopyUniforms( {
				}, this.commonUniforms )
			} ],
		);

		this.blurPP = new ORE.PostProcessing( this.renderer,
			[ {
				fragmentShader: blurFrag,
				uniforms: ORE.UniformsLib.CopyUniforms( {
				}, this.commonUniforms )
			} ],
		);

	}

	public udpateTexture( blur: number, inputTex: THREE.Texture ) {

		this.blur = blur;

		this.commonUniforms.blurWeight.value = blur;

		this.mixPP.render( inputTex, true );

		let tex = this.mixPP.getResultTexture();

		for ( let i = 0; i < this.renderCnt; i ++ ) {

			this.blurPP.render( tex, true );

			tex = this.blurPP.getResultTexture();

		}

		this.texture.value = tex;

	}

}
