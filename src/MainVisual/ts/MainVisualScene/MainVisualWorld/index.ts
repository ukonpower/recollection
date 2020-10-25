import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import basicVert from './shaders/basic.vs';
import basicFrag from './shaders/basic.fs';

import { AssetManager } from '../MainVisualManager/AssetManager';

import { Contents } from './Contents';

export class MainVisualWorld {

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;

	private assetManager: AssetManager;s
	private renderer: THREE.WebGLRenderer;

	private contents: Contents;

	constructor( assetManager: AssetManager, renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		this.assetManager = assetManager;

		this.renderer = renderer;
		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		this.scene.add( this.assetManager.gltfScene );

		this.init();

	}

	private init() {

		this.contents = new Contents( this.scene, this.commonUniforms );

	}

	public update( deltaTime: number ) {

	}

	public resize( args: ORE.ResizeArgs ) {

	}

}
