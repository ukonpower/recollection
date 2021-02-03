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
	private cursorPosDelayVel: THREE.Vector2;

	private baseCamera: THREE.PerspectiveCamera;

	constructor( obj: THREE.PerspectiveCamera, animator: ORE.Animator, parentUniforms?: ORE.Uniforms ) {

		this.camera = obj;
		this.cameraBasePos = new THREE.Vector3( 0, 0, 3.49641 );
		this.cameraTargetPos = new THREE.Vector3( 0, 0, 0 );
		this.baseCamera = new THREE.PerspectiveCamera( 45, 1.0, 0.1, 1000 );

		this.animator = animator;

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.init();

	}

	protected init() {

		this.cursorPos = new THREE.Vector2();
		this.cursorPosDelay = new THREE.Vector2();
		this.cursorPosDelayVel = new THREE.Vector2();

	}

	public updateCursor( pos: THREE.Vector2 ) {

		if ( pos.x != pos.x ) return;

		this.cursorPos.set( Math.min( 1.0, Math.max( - 1.0, pos.x ) ), Math.min( 1.0, Math.max( - 1.0, pos.y ) ) );

	}

	public update( deltaTime: number, target?: THREE.Vector3 ) {

		deltaTime = Math.min( 0.3, deltaTime ) * 0.3;

		let diff = this.cursorPos.clone().sub( this.cursorPosDelay ).multiplyScalar( deltaTime * 1.0 );
		diff.multiply( diff.clone().addScalar( 1.0 ) );

		this.cursorPosDelayVel.add( diff.multiplyScalar( 3.0 ) );
		this.cursorPosDelayVel.multiplyScalar( 0.9 );

		this.cursorPosDelay.add( this.cursorPosDelayVel );

		let weight = Math.max( 0.0, 1.0 - this.commonUniforms.contentVisibility.value * 1.0 ) * 0.2;
		this.camera.position.set(
			this.cameraBasePos.x + this.cursorPosDelay.x * weight,
			this.cameraBasePos.y + this.cursorPosDelay.y * weight,
			this.cameraBasePos.z
		);

		if ( this.cameraTargetPos ) {

			this.camera.lookAt( this.cameraTargetPos );

		}

		this.camera.position.z -= this.commonUniforms.contentVisibility.value * 5.0;

	}

	public resize( info: ORE.AspectInfo ) {

		this.camera.fov = this.baseCamera.fov * 1.0 + info.portraitWeight * 35.0;
		this.camera.updateProjectionMatrix();

	}

}
