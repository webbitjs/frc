import { Webbit, html, css } from '@webbitjs/webbit';
import { containerStyles } from '../../../styles';



export default class CtreEncoder extends Webbit {

    static get metadata() {
        return {
            displayName: 'CTRE Encoder',
            category: 'Simulation',
            slots: [],
            resizable: { },
        };
    }

    static get properties() {
        return {
            position: { type: Number },
            velocity: { type: Number },

            positive: { type: Boolean },
        };
    }

    static get styles() {
        return [
            containerStyles,
            css`
        :host {
          user-select: none;
          display: inline-block;
          height: auto;
          width: 150px;
          font-family: sans-serif;
        }
      `
        ];
    }

    constructor() {
        super();
        this.position = 0;
        this.velocity = 0;
        this.positive = false;
    }

    updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('velocity')) {
            this.positive = this.velocity >= 0;
        }
    }

    render() {
        return html`
            <input
                    part="input"
                    type="text"
                    .value="${this.position.toFixed(4)}"
            />

            <input
                    part="input"
                    type="text"
                    .value="${this.velocity.toFixed(4)}"
            />
    `;
    }
}

webbitRegistry.define('frc-sim-ctre-encoder', CtreEncoder);