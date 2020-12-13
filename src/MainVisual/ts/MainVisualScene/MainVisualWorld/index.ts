import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { AssetManager } from '../MainVisualManager/AssetManager';
import { Background } from './Background';

import { Contents } from './Contents';
import { Particles } from './Particles';

import { ContentViewer } from './ContentViewer';
import { LayerInfo } from '@ore-three-ts';
export class MainVisualWorld {

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;

	private assetManager: AssetManager;
	private renderer: THREE.WebGLRenderer;

	private layerInfo: ORE.LayerInfo
	public contents: Contents;
	public particle: Particles;
	public background: Background;
	public contentViewer: ContentViewer;

	constructor( info: LayerInfo, assetManager: AssetManager, renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		this.layerInfo = info;
		this.assetManager = assetManager;
		this.renderer = renderer;
		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.scene.add( this.assetManager.gltfScene );

		this.init();

	}

	private init() {

		this.contents = new Contents( this.scene, this.commonUniforms );

		this.background = new Background( this.commonUniforms );
		this.scene.add( this.background );

		this.particle = new Particles( this.commonUniforms );
		this.scene.add( this.particle );

		this.contentViewer = new ContentViewer( this.renderer, this.layerInfo, this.commonUniforms );
		this.contentViewer.position.set( 1, 1, 0 );
		this.scene.add( this.contentViewer );
		
	}

}
