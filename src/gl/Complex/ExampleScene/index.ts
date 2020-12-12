import * as ORE from '@ore-three-ts';
import * as THREE from 'three';

export class ExampleScene extends ORE.BaseLayer {

	constructor() {

		super();

		this.commonUniforms = {
			time: {
				value: 0
			}
		};

	}

	onBind( info: ORE.LayerInfo ) {

		super.onBind( info );

		this.initScene();

	}

	private initScene() {


		this.camera.position.set( 2, 1, 2 );
		this.camera.fov = 45;
		this.camera.lookAt( 0, 0, 0 );
		this.camera.updateProjectionMatrix();

		let box = new THREE.Mesh( new THREE.BoxBufferGeometry(), new THREE.MeshStandardMaterial() );
		this.scene.add( box );

		let light = new THREE.DirectionalLight();
		light.position.set( 1, 2, 1 );
		this.scene.add( light );

	}

	public animate( deltaTime: number ) {

		this.renderer.render( this.scene, this.camera );

	}

	public onResize() {

		super.onResize();

	}

}
