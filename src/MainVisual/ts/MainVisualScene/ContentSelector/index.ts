import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class ContentSelector extends ORE.EventDispatcher {

	public value: number = 0;

	private selectingContentPos: number = 0;
	private touchStartContentPos: number = 0;
	private moveVelocity: number = 0;

	public currentContent: number = - 1;
	private contentNum: number;

	private animator: ORE.Animator;
	private wheelStop: boolean = false;
	private isAnimating: boolean = false;

	private isTouching: boolean = false;
	private touchStartPos: number = 0;
	private touchMove: number;

	private commonUniforms: ORE.Uniforms;

	constructor( contentNum: number, parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		this.contentNum = contentNum;

		this.initAnimator();

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
	public update( deltaTime: number ) {

		if ( this.isAnimating ) {

			this.value = this.animator.get( 'contentSelectorValue' );

		} else if ( this.isTouching ) {

			this.value = this.touchStartPos + this.touchMove;

		} else {

			this.value += this.moveVelocity;

			this.calcVelocity( deltaTime );

		}

		this.commonUniforms.contentNum.value = this.value;
		this.commonUniforms.contentFade.value = ( this.value % 1 );

		this.checkCurrentContent();

	}

	private calcVelocity( deltaTime: number ) {

		this.selectingContentPos = Math.round( this.value );

		if ( this.selectingContentPos == this.touchStartContentPos ) {

			let diff = this.value - this.selectingContentPos;

			if ( Math.abs( diff ) > 0.1 ) {

				this.selectingContentPos += Math.sign( diff );

			}

		}

		this.selectingContentPos = Math.max( 0.0, Math.min( this.contentNum - 1.0, this.selectingContentPos ) );

		let diff = this.selectingContentPos - this.value;
		this.moveVelocity += diff * deltaTime * 0.3;
		this.moveVelocity *= 0.9;

	}

	private checkCurrentContent() {

		let nearest = Math.round( this.value );

		if ( ( 0 <= nearest && nearest < this.contentNum ) && nearest != this.currentContent ) {

			this.currentContent = nearest;

			this.wheelStop = false;
			this.dispatchEvent( {
				type: 'changecontent',
				num: this.currentContent,
			} );

		}

	}

	public catch() {

		this.isTouching = true;
		this.isAnimating = false;
		this.touchStartPos = this.value;
		this.touchStartContentPos = Math.max( 0.0, Math.min( this.contentNum - 1.0, Math.round( this.value ) ) );
		this.touchMove = 0;

	}

	public drag( delta: number ) {

		this.touchMove -= delta * 0.0005;

	}

	public release( delta: number ) {

		this.isTouching = false;

		this.moveVelocity -= delta * 0.002;

	}

	public next() {

		if ( this.wheelStop ) return;

		if ( this.move( Math.round( this.value + 1.0 ) ) ) {

			this.isAnimating = false;
			this.moveVelocity += 0.005;

		}

	}

	public prev() {

		if ( this.wheelStop ) return;

		if ( this.move( Math.round( this.value - 1.0 ) ) ) {

			this.isAnimating = false;
			this.moveVelocity -= 0.005;

		}

	}

	private move( value: number ) {

		if ( value < 0 || this.contentNum <= value || Math.round( this.value ) < 0 || Math.round( this.value ) >= this.contentNum ) {

			this.wheelStop = false;
			return true;

		}

		let duration = 3.0;
		this.touchStartContentPos = - 1;
		this.isAnimating = true;
		this.wheelStop = true;
		this.animator.setValue( 'contentSelectorValue', this.value );
		this.animator.animate( 'contentSelectorValue', value, duration, () => {

			this.isAnimating = false;

		} );

	}

}
