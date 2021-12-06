import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class ShadowMapper {

	private renderer: THREE.WebGLRenderer;
	private resolution: THREE.Vector2;
	private light: THREE.DirectionalLight;
	private camera: THREE.OrthographicCamera;
	private size: THREE.Vector2;

	private renderTarget: THREE.WebGLRenderTarget;

	constructor( renderer: THREE.WebGLRenderer, resolution: THREE.Vector2, size: THREE.Vector2, light: THREE.DirectionalLight, lightSize: number = 1.0 ) {

		this.renderer = renderer;
		this.resolution = resolution;
		this.size = size;
		this.light = light;

		this.camera = new THREE.OrthographicCamera( - size.x / 2.0, size.x / 2.0, size.y / 2.0, - size.y / 2.0, 0.01, 1000 );

		// LightCamera
		this.camera.userData.shadowCamera = true;
		this.camera.userData.shadowCameraLight = this.light;
		this.camera.userData.shadowMapCameraClip = new THREE.Vector2( this.camera.near, this.camera.far );
		this.camera.userData.shadowMapLightSize = lightSize;
		this.camera.userData.shadowMapSize = this.size;
		this.camera.userData.shadowMapResolution = this.resolution;
		this.camera.userData.shadowMap = {
			value: null
		};

		this.camera.userData.shadowMapCameraLength = 0;

		this.renderTarget = new THREE.WebGLRenderTarget( this.resolution.x, this.resolution.y, {
			format: THREE.RGBAFormat,
			stencilBuffer: false,
			generateMipmaps: false,
			magFilter: THREE.NearestFilter,
			minFilter: THREE.NearestFilter
		} );

	}

	public update( scene: THREE.Scene ) {

		this.camera.position.copy( this.light.position );
		this.camera.lookAt( 0, 0, 0 );

		scene.traverse( obj=>{

			let mesh = obj as THREE.Mesh;

			if ( mesh.isMesh && mesh.visible ) {

				if ( mesh.userData.depthMat ) {

					mesh.userData.mat = mesh.material;
					mesh.material = mesh.userData.depthMat;

				} else {

					mesh.visible = false;
					mesh.userData.depthHide = true;

				}

			}

		} );

		let bgMem = scene.background;
		scene.background = null;

		let renderTargetMem = this.renderer.getRenderTarget();
		this.renderer.setRenderTarget( this.renderTarget );
		this.renderer.render( scene, this.camera );
		this.renderer.setRenderTarget( renderTargetMem );

		scene.background = bgMem;

		this.camera.userData.shadowMap.value = this.renderTarget.texture;

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
