import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class SmoothCameraMover {

	private commonUniforms: ORE.Uniforms;

	private camera: THREE.Object3D;

	private radX: number;
	private radY: number;
	private rotateZ: number;

	private baseMatrix: THREE.Matrix4;
	private targetPos: THREE.Vector2;
	private delayPos: THREE.Vector2;

	constructor( commonUniforms: ORE.Uniforms, camera: THREE.Object3D, radY: number = Math.PI / 2, radX: number = Math.PI / 4, rotateZ?: number ) {

		this.commonUniforms = commonUniforms;

		this.radY = radY / 2;
		this.radX = radX / 2;
		this.rotateZ = rotateZ;

		this.camera = camera;
		this.camera.updateMatrix();
		this.baseMatrix = this.camera.matrix.clone();

		this.delayPos = new THREE.Vector2( 0, 0 );
		this.targetPos = new THREE.Vector2( 0, 0 );

	}

	public setCursor( pos: THREE.Vector2 ) {

		if ( pos.x != pos.x ) return;

		this.targetPos = pos.clone();

	}

	public update( deltaTime: number ) {

		deltaTime = Math.min( deltaTime, 1.0 );

		this.delayPos.add( this.targetPos.clone().sub( this.delayPos ).multiplyScalar( deltaTime * 2.0 ) );

		this.camera.updateMatrix();
		this.camera.matrix.copy( this.baseMatrix );
		this.camera.matrix.decompose( this.camera.position, this.camera.quaternion, this.camera.scale );

		let m = 1.0 - this.commonUniforms.contentVisibility.value;
		this.camera.rotation.z = m * 3.0;
		this.camera.position.z += ( m ) * 5.0;


		// this.camera.position.set( 0, 0, 3 + ( m ) * 3.0 );
		// this.camera.rotation.z = m * 1.4;

		this.camera.applyMatrix4( new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler( - this.delayPos.y * this.radX, this.delayPos.x * this.radY, 0.0, 'XYZ' ) ) );

	}

}
