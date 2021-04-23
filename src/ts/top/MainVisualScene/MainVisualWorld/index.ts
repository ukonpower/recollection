import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { AssetManager } from '../MainVisualManager/AssetManager';
import { Background } from './Background';

import { Contents } from './Contents';
import { Particles } from './Particles';

import { LayerInfo } from '@ore-three-ts';
import { AboutObj } from './AboutObj';
export class MainVisualWorld {

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;

	private assetManager: AssetManager;
	private renderer: THREE.WebGLRenderer;

	private layerInfo: ORE.LayerInfo
	public contents: Contents;
	public particle: Particles;
	public background: Background;
	public aboutObj: AboutObj;

	constructor( info: LayerInfo, assetManager: AssetManager, renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		this.layerInfo = info;
		this.assetManager = assetManager;
		this.renderer = renderer;
		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.init();

	}

	private init() {

		this.background = new Background( this.commonUniforms );
		this.scene.add( this.background );

		this.contents = new Contents( this.scene, this.commonUniforms );

		this.particle = new Particles( this.commonUniforms );
		this.scene.add( this.particle );

		this.aboutObj = new AboutObj( this.commonUniforms );
		this.scene.add( this.aboutObj );

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.contents.resize( layerInfo );

	}

}
