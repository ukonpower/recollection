import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { AssetManager } from '../MainVisualManager/AssetManager';
import { Background } from './Background';

import { Contents } from './Contents';

export class MainVisualWorld {

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;

	private assetManager: AssetManager;s
	private renderer: THREE.WebGLRenderer;

	private contents: Contents;
	private background: Background;

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

		this.background = new Background( this.commonUniforms );
		this.scene.add( this.background );

		this.contents = new Contents( this.scene, this.commonUniforms );

		let light = new THREE.DirectionalLight();
		light.position.set( 1.0, 1.0, 1.0 );
		this.scene.add( light );

	}

	public update( deltaTime: number ) {

	}

	public resize( args: ORE.ResizeArgs ) {

	}

}
