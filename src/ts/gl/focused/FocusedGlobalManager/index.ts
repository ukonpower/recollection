import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { AssetManager } from './AssetManager';

export class FocusedGlobalManager {

	public assetManager: AssetManager;
	public animator: ORE.Animator;

	constructor() {

		this.animator = new ORE.Animator();
		this.assetManager = new AssetManager();

	}

	public update( deltaTime: number ) {

		this.animator.update( deltaTime );

	}

}

