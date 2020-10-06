import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class CameraController {

	private animator: ORE.Animator;

	private commonUniforms: ORE.Uniforms;
	private camera: THREE.PerspectiveCamera
	private cameraBasePos: THREE.Vector3;
	private cameraTargetPos: THREE.Vector3;

	private cursorPos: THREE.Vector2;
	public cursorPosDelay: THREE.Vector2;

	private hoverElm: HTMLCanvasElement;

	private baseCamera: THREE.PerspectiveCamera;
	
	constructor( obj: THREE.PerspectiveCamera, data: THREE.Object3D, animator: ORE.Animator, parentUniforms?: ORE.Uniforms ) {

		this.camera = obj;
		this.cameraBasePos = data.getObjectByName( 'Camera' ).getWorldPosition( new THREE.Vector3() );
		this.cameraTargetPos = data.getObjectByName( 'Camera_Target' ).getWorldPosition( new THREE.Vector3() );

		this.baseCamera = data.getObjectByName( 'Camera' ).children[0] as THREE.PerspectiveCamera;
		
		this.animator = animator;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {
		}, parentUniforms );

		this.init();

	}

	protected init() {

		this.cursorPos = new THREE.Vector2();
		this.cursorPosDelay = new THREE.Vector2();

	}

	public updateCursor( pos: THREE.Vector2 ) {

		if ( pos.x != pos.x ) return;

		this.cursorPos.set( Math.min( 1.0, Math.max( - 1.0, pos.x ) ), Math.min( 1.0, Math.max( - 1.0, pos.y ) ) );

	}

	public update( deltaTime: number, target?: THREE.Vector3 ) {

		deltaTime = Math.min( 0.3, deltaTime );

		let diff = this.cursorPos.clone().sub( this.cursorPosDelay ).multiplyScalar( deltaTime * 2.0 );
		this.cursorPosDelay.add( diff );

		let weight = 1.0;
		this.camera.position.set( this.cameraBasePos.x + this.cursorPosDelay.x * weight, this.cameraBasePos.y + this.cursorPosDelay.y * weight, this.cameraBasePos.z );

		if ( this.cameraTargetPos ) {

			this.camera.lookAt( this.cameraTargetPos );

		}

	}

	public resize( resizeArgs: ORE.ResizeArgs ) {

		let blenderWidth = 1920;
		let blenderHeight = 1080;
		let blenderAng = 39.5978;
		let dist = Math.cos( blenderAng / 180 * Math.PI / 2 ) * ( blenderWidth / 2 ) / Math.sin( blenderAng / 180 * Math.PI / 2 );
		let fov = Math.atan2( blenderHeight / 2, dist ) * 180 / Math.PI * 2;

		this.camera.fov = fov * 1.0;
		this.camera.fov = this.baseCamera.fov
		this.camera.updateProjectionMatrix();

	}

}
