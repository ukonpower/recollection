import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { MainVisualWorld } from './MainVisualWorld';
import { MainVisualManager } from './MainVisualManager';
import { CameraController } from './CameraController';

export class MainVisualScene extends ORE.BaseScene {

	private commonUniforms: ORE.Uniforms;
	private cameraController: CameraController;
	private world: MainVisualWorld;
	private gManager: MainVisualManager;

	constructor() {

		super();

		this.name = "MainScene";

		this.commonUniforms = {
			time: {
				value: 0
			}
		};

	}

	onBind( gProps: ORE.GlobalProperties ) {

		super.onBind( gProps );

		this.gManager = new MainVisualManager( {
			onMustAssetsLoaded: () => {

				this.initScene();

				window.dispatchEvent( new CustomEvent( 'resize' ) );

			}
		} );

	}

	private initScene() {

		this.scene.add( this.gManager.assetManager.gltfScene );

		this.world = new MainVisualWorld( this.scene, this.commonUniforms );

		let light = new THREE.DirectionalLight();
		light.position.set( 0, 2, 3 );
		light.intensity = 2.0;
		this.scene.add( light );

		this.cameraController = new CameraController( this.camera, this.scene.getObjectByName( 'Camera_Datas' ) );

	}

	public animate( deltaTime: number ) {

		if ( this.gManager.assetManager.isLoaded ) {

			this.cameraController.update( deltaTime );

			this.renderer.render( this.scene, this.camera );

		}

	}

	public onResize( args: ORE.ResizeArgs ) {

		super.onResize( args );

		if ( this.gManager.assetManager.isLoaded ) {

			this.cameraController.resize( args );

		}

	}

}
