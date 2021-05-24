import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { AboutTrails } from './AboutTrails';

export class AboutObj extends THREE.Object3D {

	private animator: ORE.Animator;
	private commonUniforms: ORE.Uniforms;
	private trails: AboutTrails;

	private offsetTimer: number = - 1;

	constructor( parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*------------------------
			Animator
		------------------------*/
		this.animator = window.mainVisualManager.animator;



		/*------------------------
			Objects
		------------------------*/
		this.trails = new AboutTrails( window.mainVisualRenderer, 60, 20, this.commonUniforms );
		this.trails.frustumCulled = false;
		this.add( this.trails );

	}

	public switchVisibility( visible: boolean ) {

		this.trails.switchVisibility( visible );

		this.animator.animate( 'aboutRaymarch', visible ? 1 : 0, 2 );

		if ( visible ) {

			this.offsetTimer = window.setInterval( () => {

				this.animator.animate( 'aboutOffset',
					this.animator.get<number>( 'aboutOffset' ) + 1.0,
					3
				);

			}, 5000 );

		} else {

			window.clearInterval( this.offsetTimer );

		}

	}

}

