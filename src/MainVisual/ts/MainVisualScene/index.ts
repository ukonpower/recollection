import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

import { RenderPipeline } from './RenderPipeline';

import { MainVisualWorld } from './MainVisualWorld';
import { MainVisualManager } from './MainVisualManager';
import { CameraController } from './CameraController';

export class MainVisualScene extends ORE.BaseScene {

	private commonUniforms: ORE.Uniforms;
	private cameraController: CameraController;

	private renderPipeline: RenderPipeline;

	private world: MainVisualWorld;
	private gManager: MainVisualManager;

	constructor() {

		super();

		this.name = "MainScene";

		this.commonUniforms = {
			time: {
				value: 0
			},
			camNear: {
				value: 0
			},
			camFar: {
				value: 0
			},
			camPosition: {
				value: new THREE.Vector3()
			},
			camWorldMatrix: {
				value: null
			},
			camProjectionInverseMatrix: {
				value: new THREE.Matrix4()
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

		this.camera.near = 1.0;
		this.camera.far = 100.0;
		this.camera.updateProjectionMatrix();

		this.commonUniforms.camNear.value = this.camera.near;
		this.commonUniforms.camFar.value = this.camera.far;
		this.cameraController = new CameraController( this.camera, this.scene.getObjectByName( 'Camera_Datas' ) );

		this.renderPipeline = new RenderPipeline( this.renderer, this.commonUniforms );

	}

	public animate( deltaTime: number ) {

		if ( this.gManager.assetManager.isLoaded ) {

			this.cameraController.update( deltaTime );

			// this.camera.getWorldPosition( this.commonUniforms.camPosition.value );
			this.commonUniforms.camPosition.value.copy( this.camera.position );
			this.commonUniforms.camWorldMatrix.value = this.camera.matrixWorld;
			this.commonUniforms.camProjectionInverseMatrix.value.getInverse( this.camera.projectionMatrix );

			this.renderPipeline.render( this.scene, this.camera );

		}

	}

	public onHover( cursor: ORE.Cursor ) {

		if ( cursor.position.x != cursor.position.x ) return;

		let cursorPosWindowNormalized = cursor.getNormalizePosition( this.gProps.resizeArgs.windowSize );

		if ( this.gManager.assetManager.isLoaded ) {

			this.cameraController.updateCursor( cursorPosWindowNormalized );

		}

	}

	public onResize( args: ORE.ResizeArgs ) {

		super.onResize( args );

		if ( this.gManager.assetManager.isLoaded ) {

			this.renderPipeline.resize( args.windowPixelSize );

			this.cameraController.resize( args );

		}

	}

}
