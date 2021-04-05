import { Webbit, html, css } from '@webbitjs/webbit';
import { containerStyles } from '../../../styles';



export default class CtreMotor extends Webbit {

    static get metadata() {
        return {
            displayName: 'CTRE Motor',
            category: 'Simulation',
            slots: [],
            resizable: { },
        };
    }

    static get properties() {
        return {
            percentOutput: { type: Number },
            supplyCurrent: { type: Number },
            motorCurrent: { type: Number },
            busVoltage: { type: Number },

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

        [part=bar] {
          width: 100%;
        }

        [part=bar]::part(foreground) {
          border-radius: 0;
          background: rgba(200,0,0,.5);
        }

        :host([positive]) [part=bar]::part(foreground) {
          background: rgba(0,180,0,.8);
        }
      `
        ];
    }

    constructor() {
        super();
        this.percentOutput = 0;
        this.positive = false;
    }

    updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('percentOutput')) {
            this.positive = this.percentOutput >= 0;
        }
    }

    render() {
        return html`
      <frc-bar 
        value="${this.percentOutput}"
        min="-1"
        max="1"
        center="0"
        part="bar"
      >
        ${this.percentOutput.toFixed(4)}
      </frc-bar>
    `;
    }
}

webbitRegistry.define('frc-sim-ctre-motor-controller', CtreMotor);