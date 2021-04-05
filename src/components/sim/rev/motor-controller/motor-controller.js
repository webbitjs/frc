import { Webbit, html, css } from '@webbitjs/webbit';
import { containerStyles } from '../../../styles';



export default class RevMotor extends Webbit {

    static get metadata() {
        return {
            displayName: 'Rev Motor',
            category: 'Simulation',
            slots: [],
            resizable: { },
        };
    }

    static get properties() {
        return {
            appliedOutput: { type: Number },
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
        this.appliedOutput = 0;
        this.positive = false;
    }

    updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('appliedOutput')) {
            this.positive = this.appliedOutput >= 0;
        }
    }

    render() {
        return html`
      <frc-bar 
        value="${this.appliedOutput}"
        min="-1"
        max="1"
        center="0"
        part="bar"
      >
        ${this.appliedOutput.toFixed(4)}
      </frc-bar>
    `;
    }
}

webbitRegistry.define('frc-sim-rev-motor-controller', RevMotor);