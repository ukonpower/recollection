import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { MSDFText } from './MSDFText';

export class Title extends MSDFText {

	private animator: ORE.Animator;

	constructor( name: string, parentUniforms: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.CopyUniforms( parentUniforms, {

		} );

		let animator = window.mainVisualManager.animator;

		uni.visibility = animator.add( {
			name: 'titleVisibility',
			initValue: 0,
		} );

		super( name, parentUniforms );

		this.addEventListener( 'infoloaded', () => {

			this.show( 'HELLO' );

		} );

	}

	public show( text: string ) {

		this.setText( text );

	}

}
