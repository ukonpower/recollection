import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import basicVert from './shaders/basic.vs';
import basicFrag from './shaders/basic.fs';

import { AssetManager } from '../MainVisualManager/AssetManager';

export class MainVisualWorld {

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;

	private assetManager: AssetManager;s
	private renderer: THREE.WebGLRenderer;

	constructor( assetManager: AssetManager, renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		this.assetManager = assetManager;

		this.renderer = renderer;
		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		this.scene.add( this.assetManager.gltfScene );

		let light = new THREE.PointLight();
		light.position.set( 1, 10, 10 );
		this.scene.add( light );

	}

	public update( deltaTime: number ) {

	}

	public resize( args: ORE.ResizeArgs ) {

	}

}
