import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { AboutTrails } from './AboutTrails';

export class AboutObj extends THREE.Object3D {

	private animator: ORE.Animator;
	private commonUniforms: ORE.Uniforms;
	private trails: AboutTrails;

	constructor( parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*------------------------
			Objects
		------------------------*/
		this.trails = new AboutTrails( window.mainVisualRenderer, 40, 100, this.commonUniforms );
		this.trails.frustumCulled = false;
		this.add( this.trails );

	}

	public switchVisibility( visible: boolean ) {

		this.trails.switchVisibility( visible );

	}

}

