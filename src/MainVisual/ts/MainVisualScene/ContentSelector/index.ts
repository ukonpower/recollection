import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class ContentSelector extends ORE.EventDispatcher {

	public value: number = 0;
	public currentContent: number = - 1;
	private contentNum: number;

	private animator: ORE.Animator;
	private wheelStop: boolean = false;
	private isAnimating: boolean = false;

	private commonUniforms: ORE.Uniforms;

	constructor( contentNum: number, parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {
		}, parentUniforms );

		this.contentNum = contentNum;

		this.initAnimator();

		this.init();

	}

	protected initAnimator() {

		this.animator = window.mainVisualManager.animator;
		this.animator.add( {
			name: 'contentSelectorValue',
			initValue: 0,
			easing: {
				func: ( x ) => {

					return x === 1 ? 1 : 1 - Math.pow( 2, - 10 * x );

				},
				args: 8
			}
		} );

	}

	protected init() {

	}

	public update() {

		if ( this.isAnimating ) {

			this.value = this.animator.get( 'contentSelectorValue' );

		} else {

		}

		this.commonUniforms.contentNum.value = this.value;
		this.commonUniforms.contentFade.value = ( this.value % 1 );


		this.checkCurrentContent();

	}

	private checkCurrentContent() {

		let nearest = Math.round( this.value );

		if ( nearest != this.currentContent ) {

			this.currentContent = nearest;

			this.wheelStop = false;
			this.dispatchEvent( {
				type: 'changecontent',
				num: this.currentContent
			} );

		}

	}

	public catch() {

	}

	public drag() {

	}

	public release() {

	}

	public next() {

		if ( this.wheelStop ) return;

		this.move( Math.round( this.value + 1.0 ) );

	}

	public prev() {

		if ( this.wheelStop ) return;

		this.move( Math.round( this.value - 1.0 ) );

	}

	private move( value: number ) {

		let duration = 3.0;

		this.isAnimating = true;
		this.wheelStop = true;
		this.animator.setValue( 'contentSelectorValue', this.value );
		this.animator.animate( 'contentSelectorValue', value, duration, () => {

			this.isAnimating = false;


		} );


		let v = ( this.value <= value ) ? 0 : 1;

		// this.animator.setValue( 'contentFade', v );
		// this.animator.animate( 'contentFade', 1.0 - v, duration, () => {

		// 	this.animator.setValue( 'contentFade', 0 );

		// } );

	}

}
