import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import basicVert from './shaders/basic.vs';
import basicFrag from './shaders/basic.fs';
import { ReflectionPlane } from '../ReflectionPlane';
import { AssetManager } from '../MainVisualManager/AssetManager';

export class MainVisualWorld {

	private animator: ORE.Animator;

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;

	private assetManager: AssetManager;s
	private renderer: THREE.WebGLRenderer;

	private refPlane: ReflectionPlane;

	constructor( assetManager: AssetManager, renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		this.assetManager = assetManager;

		this.renderer = renderer;
		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		let groundModel = this.scene.getObjectByName( 'GroundModel' );
		groundModel.visible = false;

		let light = new THREE.DirectionalLight();
		light.position.set( 0, 2, 3 );
		light.intensity = 2.0;
		this.scene.add( light );

		this.refPlane = new ReflectionPlane( this.assetManager, this.renderer, new THREE.Vector2( 100, 100 ), 0.3, this.commonUniforms );
		this.refPlane.rotation.x = - Math.PI / 2;
		this.scene.add( this.refPlane );

	}

	public resize( args: ORE.ResizeArgs ) {

		this.refPlane.resize( args.windowSize );

	}

}
