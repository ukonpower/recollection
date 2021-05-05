import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class CameraController {

	private animator: ORE.Animator;

	private commonUniforms: ORE.Uniforms;
	private camera: THREE.PerspectiveCamera

	private cursorPos: THREE.Vector2;
	public cursorPosDelay: THREE.Vector2;
	private cursorPosDelayVel: THREE.Vector2;

	private baseCamera: THREE.PerspectiveCamera;

	private posData = {
		base: {
			pos: new THREE.Vector3( 0, 0, 3.49641 ),
			target: new THREE.Vector3( 0, 0, 0 )
		},
		about: {
			pos: new THREE.Vector3( 0, 0, 6.0 ),
			target: new THREE.Vector3( 0, 0, 0 )
		}
	}

	constructor( obj: THREE.PerspectiveCamera, animator: ORE.Animator, parentUniforms?: ORE.Uniforms ) {

		this.camera = obj;
		this.baseCamera = new THREE.PerspectiveCamera( 45, 1.0, 0.1, 1000 );

		/*------------------------
			Animator
		------------------------*/
		this.animator = animator;

		this.animator.add( {
			name: 'cameraPos',
			initValue: this.posData.base.pos.clone(),
		} );

		this.animator.add( {
			name: 'cameraTargetPos',
			initValue: this.posData.base.target.clone(),
		} );

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.cursorPos = new THREE.Vector2();
		this.cursorPosDelay = new THREE.Vector2();
		this.cursorPosDelayVel = new THREE.Vector2();

	}

	public changeScene( scene: 'main' | 'about' ) {

		let pos = new THREE.Vector3();
		let target = new THREE.Vector3();

		if ( scene == 'main' ) {

			pos.copy( this.posData.base.pos );
			target.copy( this.posData.base.target );

		} else if ( scene == 'about' ) {

			pos.copy( this.posData.about.pos );
			target.copy( this.posData.about.target );

		}

		this.animator.animate( 'cameraPos', pos, 1.5 );
		this.animator.animate( 'cameraTargetPos', target, 1.5 );

	}

	public updateCursor( pos: THREE.Vector2 ) {

		if ( pos.x != pos.x ) return;

		this.cursorPos.set( Math.min( 1.0, Math.max( - 1.0, pos.x ) ), Math.min( 1.0, Math.max( - 1.0, pos.y ) ) );

	}

	public update( deltaTime: number ) {

		deltaTime = Math.min( 0.3, deltaTime ) * 0.3;

		/*------------------------
			update hover
		------------------------*/

		let diff = this.cursorPos.clone().sub( this.cursorPosDelay ).multiplyScalar( deltaTime * 1.0 );
		diff.multiply( diff.clone().addScalar( 1.0 ) );

		this.cursorPosDelayVel.add( diff.multiplyScalar( 3.0 ) );
		this.cursorPosDelayVel.multiplyScalar( 0.9 );

		this.cursorPosDelay.add( this.cursorPosDelayVel );

		/*------------------------
			Position
		------------------------*/

		let weight = Math.max( 0.0, 1.0 - this.commonUniforms.contentVisibility.value * 1.0 ) * 0.2;
		let basePos = this.animator.get<THREE.Vector3>( 'cameraPos' );

		this.camera.position.set(
			basePos.x + this.cursorPosDelay.x * weight,
			basePos.y + this.cursorPosDelay.y * weight,
			basePos.z
		);

		/*------------------------
			Target
		------------------------*/

		this.camera.lookAt( this.animator.get<THREE.Vector3>( 'cameraTargetPos' ) );

		/*------------------------
			Content zoom up
		------------------------*/

		this.camera.position.z -= this.commonUniforms.contentVisibility.value * 5.0;

	}

	public resize( info: ORE.AspectInfo ) {

		this.camera.fov = this.baseCamera.fov * 1.0 + info.portraitWeight * 20.0;
		this.camera.updateProjectionMatrix();

	}

}
