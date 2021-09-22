import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class ShadowMapper {

	private renderer: THREE.WebGLRenderer;
	private resolution: THREE.Vector2;
	private light: THREE.DirectionalLight;
	private camera: THREE.OrthographicCamera;
	private size: number;

	private renderTarget: THREE.WebGLRenderTarget;

	constructor( renderer: THREE.WebGLRenderer, resolution: THREE.Vector2, size: number, light: THREE.DirectionalLight ) {

		this.renderer = renderer;
		this.resolution = resolution;
		this.size = size;
		this.light = light;
		this.camera = new THREE.OrthographicCamera( size / 2.0, - size / 2.0, size / 2.0, - size / 2.0 );

		this.renderTarget = new THREE.WebGLRenderTarget( this.resolution.x, this.resolution.y );

	}

	public update( scene: THREE.Scene ) {

		this.camera.position.copy( this.light.position );
		this.camera.lookAt( 0, 0, 0 );

		scene.traverse( obj=>{

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh && mesh.visible ) {

				if ( mesh.customDepthMaterial ) {

					mesh.userData.mat = mesh.material;
					mesh.material = mesh.customDepthMaterial;

				} else {

					mesh.visible = false;
					mesh.userData.depthHide = true;

				}

			}

		} );


		let renderTargetMem = this.renderer.getRenderTarget();
		this.renderer.setRenderTarget( this.renderTarget );

		this.renderer.render( scene, this.camera );

		this.renderer.setRenderTarget( renderTargetMem );

		scene.traverse( obj=>{

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh ) {

				if ( mesh.userData.mat ) {

					mesh.material = mesh.userData.mat;

				}

				if ( mesh.userData.depthHide ) {

					mesh.visible = true;
					mesh.userData.depthHide = false;

				}

			}

		} );



	}

}