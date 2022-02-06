import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class FocusedCameraController {

	private camera: THREE.PerspectiveCamera
	private cameraBasePos: THREE.Vector3;
	private cameraBasePosClone: THREE.Vector3;
	private cameraTargetPos: THREE.Vector3;

	private cursorPos: THREE.Vector2;
	public cursorPosDelay: THREE.Vector2;
	private cameraMoveWeight: THREE.Vector2;

	private baseCamera: THREE.PerspectiveCamera;

	private orbitControls: OrbitControls;

	constructor( obj: THREE.PerspectiveCamera, data: THREE.Object3D ) {

		this.camera = obj;
		this.cameraBasePos = data.getObjectByName( 'Camera' ).getWorldPosition( new THREE.Vector3() );
		this.cameraTargetPos = data.getObjectByName( 'CameraTarget' ).getWorldPosition( new THREE.Vector3() );
		this.baseCamera = data.getObjectByName( 'Camera' ).children[ 0 ] as THREE.PerspectiveCamera;

		this.cameraBasePosClone = this.cameraBasePos.clone();

		this.cursorPos = new THREE.Vector2();
		this.cursorPosDelay = new THREE.Vector2();
		this.cameraMoveWeight = new THREE.Vector2( 0.1, 0.1 );

		this.camera.userData.depthCamera = true;

		/*-------------------------------
			DOF
		-------------------------------*/

		this.camera.userData.dof = true;
		this.camera.userData.focalLength = 8.0;
		this.camera.userData.focusLength = 8.0;
		this.camera.userData.fNumber = 1.0;

		/*-------------------------------
			OrbitControls
		-------------------------------*/

		this.orbitControls = new OrbitControls( this.camera, document.querySelector( '.contents' ) );
		this.orbitControls.target = this.cameraTargetPos;
		this.camera.position.copy( this.cameraBasePos );

	}

	public updateCursor( pos: THREE.Vector2 ) {

		if ( pos.x != pos.x ) return;

		this.cursorPos.set( Math.min( 1.0, Math.max( - 1.0, pos.x ) ), Math.min( 1.0, Math.max( - 1.0, pos.y ) ) );

	}

	public update( deltaTime: number, time: number ) {

		this.updateOrbitControls();
		this.updateSceneControls( deltaTime, time );

	}

	private updateSceneControls( deltaTime: number, time: number ) {

		deltaTime = Math.min( 0.3, deltaTime );

		let diff = this.cursorPos.clone().sub( this.cursorPosDelay ).multiplyScalar( deltaTime * 1.0 );
		diff.multiply( diff.clone().addScalar( 1.0 ) );
		this.cursorPosDelay.add( diff );

		this.camera.position.set( this.cameraBasePos.x + this.cursorPosDelay.x * this.cameraMoveWeight.x, this.cameraBasePos.y + this.cursorPosDelay.y * this.cameraMoveWeight.y, this.cameraBasePos.z );

		if ( this.cameraTargetPos ) {

			this.camera.lookAt( this.cameraTargetPos );

			this.camera.userData.focusLength = this.camera.position.distanceTo( this.cameraTargetPos );
			// this.camera.userData.focalLength = this.camera.userData.focusLength - 1.0;

		}

		this.camera.applyQuaternion( new THREE.Quaternion().setFromEuler( new THREE.Euler( Math.sin( time * 1.6 ) * Math.sin( time * 1.0 ) * 0.002, Math.sin( time * 2.0 ) * 0.002 ) ) );

	}

	private updateOrbitControls() {

		// this.orbitControls.update();

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.camera.fov = this.baseCamera.fov + layerInfo.size.portraitWeight * 50.0;

		this.cameraBasePos.z = this.cameraBasePosClone.z - layerInfo.size.portraitWeight * 2;

		// this.camera.fov = 50;

		this.camera.updateProjectionMatrix();

	}

}
