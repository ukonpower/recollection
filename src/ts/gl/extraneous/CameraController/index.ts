import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { ExtraneousGlobalManager } from '../ExtraneousGlobalManager';

export class CameraController {

	private animator: ORE.Animator;

	private cameraData: THREE.Object3D;

	private camera: THREE.PerspectiveCamera
	private cameraBasePos: THREE.Vector3;
	private cameraTargetPos: THREE.Vector3;

	private cursorPos: THREE.Vector2;
	public cursorPosDelay: THREE.Vector2;
	private cameraMoveWeight: THREE.Vector2;

	private baseCamera: THREE.PerspectiveCamera;

	constructor( camera: THREE.PerspectiveCamera, scene: THREE.Object3D, gManager: ExtraneousGlobalManager ) {

		this.camera = camera;
		this.cameraData = scene.getObjectByName( 'CameraData' );

		let cameraModel = this.cameraData && this.cameraData.getObjectByName( 'Camera' ) as THREE.Object3D;
		this.cameraBasePos = cameraModel ? cameraModel.getWorldPosition( new THREE.Vector3() ) : new THREE.Vector3( 0, 1, 5 );

		let cameraTarget = this.cameraData && this.cameraData.getObjectByName( 'CameraTarget' );
		this.cameraTargetPos = cameraTarget ? cameraTarget.getWorldPosition( new THREE.Vector3() ) : new THREE.Vector3( 0, 1, 0 );

		let baseCamera = this.cameraData && cameraModel;
		this.baseCamera = baseCamera ? baseCamera.children[ 0 ] as THREE.PerspectiveCamera : camera.clone();

		this.cursorPos = new THREE.Vector2();
		this.cursorPosDelay = new THREE.Vector2();
		this.cameraMoveWeight = new THREE.Vector2( 100.0, 1.0 );

		/*------------------------
			Animator
		------------------------*/
		this.animator = gManager.animator;

		this.animator.add( {
			name: 'cameraPos',
			initValue: this.cameraBasePos.clone(),
			easing: {
				func: ORE.Easings.linear
			}
		} );

		this.animateCameraPos();

	}

	private animateCameraPos() {

		this.animator.setValue( 'cameraPos', this.cameraData.getObjectByName( 'CameraStart' ).position );
		this.animator.animate( 'cameraPos', this.cameraData.getObjectByName( 'CameraEnd' ).position, 7, () => {

			this.animateCameraPos();

		} );

	}

	public updateCursor( pos: THREE.Vector2 ) {

		if ( pos.x != pos.x ) return;

		this.cursorPos.set( Math.min( 1.0, Math.max( - 1.0, pos.x ) ), Math.min( 1.0, Math.max( - 1.0, pos.y ) ) );

	}

	public update( deltaTime: number ) {

		deltaTime = Math.min( 0.3, deltaTime );

		let diff = this.cursorPos.clone().sub( this.cursorPosDelay ).multiplyScalar( deltaTime * 1.0 );
		diff.multiply( diff.clone().addScalar( 1.0 ) );
		this.cursorPosDelay.add( diff );

		this.cameraBasePos.copy( this.animator.get( 'cameraPos' ) );

		this.camera.position.copy( this.cameraBasePos );

		if ( this.cameraTargetPos ) {

			this.camera.lookAt( this.cameraTargetPos );

		}

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.camera.fov = this.baseCamera.fov + layerInfo.aspect.portraitWeight * 20;
		this.camera.updateProjectionMatrix();

	}

}
