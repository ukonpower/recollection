import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { AssetManager } from '../MainVisualManager/AssetManager';
import { Background } from './Background';

import { Contents } from './Contents';
import { Particles } from './Particles';

export class MainVisualWorld {

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;

	private assetManager: AssetManager;
	private renderer: THREE.WebGLRenderer;

	public contents: Contents;
	public particle: Particles;
	public background: Background;

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

		this.background = new Background( this.commonUniforms );
		this.scene.add( this.background );

		this.particle = new Particles( this.commonUniforms );
		this.scene.add( this.particle );

	}

	public update( deltaTime: number ) {

	}

	public resize( args: ORE.ResizeArgs ) {

	}

}
