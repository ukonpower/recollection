import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { AssetManager } from './AssetManager';
import { EasyRaycaster } from './EasyRaycaster';
import { Uniform } from 'three';

export class MainVisualManager {

	public eRay: EasyRaycaster
	public assetManager: AssetManager;
	public animator: ORE.Animator;

	constructor( param: { onPreAssetsLoaded?: Function, onMustAssetsLoaded?: Function, onSubAssetsLoaded?: Function } ) {

		this.animator = new ORE.Animator();
		this.assetManager = new AssetManager();
		this.eRay = new EasyRaycaster();

		this.assetManager.addEventListener( 'preAssetsLoaded', () => {

			param.onPreAssetsLoaded && param.onPreAssetsLoaded();

		} );

		this.assetManager.addEventListener( 'mustAssetsLoaded', () => {

			param.onMustAssetsLoaded && param.onMustAssetsLoaded();

		} );

		this.assetManager.addEventListener( 'subAssetsLoaded', () => {

			param.onSubAssetsLoaded && param.onSubAssetsLoaded();

		} );

		setTimeout( () => {

			this.assetManager.load();

		}, 0 );

		window.mainVisualManager = this;

	}

	public update( deltaTime: number ) {

		this.animator.update( deltaTime );

	}

}

