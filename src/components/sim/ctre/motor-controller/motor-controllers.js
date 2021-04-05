import { Webbit, html, css } from '@webbitjs/webbit';
import { containerStyles } from '../../../styles';

function getIds() {
    const array = [];
    for (let i = 0; i < 64; i++) {
        array.push("talonSrx" + i);
        array.push("victorSpx" + i);
    }
    return array;
}

export default class CtreMotorControllers extends Webbit {

    static get metadata() {
        return {
            displayName: 'CTRE Motors',
            category: 'Simulation',
            slots: [],
            resizable: { left: true, right: true },
            minSize: { width: 50 }
        };
    }

    static get properties() {
        return {
            ...super.properties,
        };
    }

    static get styles() {
        return [
            containerStyles,
            css`
        :host {
          display: inline-block;
          height: auto;
          width: 200px;
          font-family: sans-serif;
        }

        [part=inputs] {
          width: 100%;
          display: inline-grid;
          grid-template-columns: min-content auto;
          grid-auto-rows: 25px;
          column-gap: 8px;
        }

        label {
          font-size: 15px;
          text-align: right;
          white-space: nowrap;
          font-weight: normal;
        }

        [part=header] {
          display: inline-block;
          font-weight: bold;
          margin-bottom: 7px;
          color: #555;
        }

        frc-sim-ctre-motor-controller {
          width: 100%;
          min-width: 50px;
          padding: 0;
        }

        p {
          margin: 0;
          font-size: 14px;
        }
      `
        ];
    }

    constructor() {
        super();
        this.sourceKey = 'CANMotor';
        this.sourceProvider = 'HALSim';
    }

    renderInputs() {

        const source = this.getSource();
        const sourceKey = this.sourceKey;
        const sourceProvider = this.sourceProvider;

        if (!this.hasSource()) {
            return html`
        <label part="header">CTRE Motors</label>
        <p>Add source to show CTRE Motors devices.</p>
      `;
        }

        if (!source) {
            return html`
        <label part="header">CTRE Motors</label>
        <p>Start HALSim back-end to show DIO devices.</p>
      `;
        }

        const initializedDIOs = Object.getOwnPropertyNames(source).map( deviceName => {

            return {
                deviceName,
                sourceKey: `${sourceKey}/${deviceName}`
            };
        })

        if (initializedDIOs.length === 0) {
            return html`
        <label part="header">CTRE Motors</label>
        <p>No CTRE motors</p>
      `;
        }

        return html`
      <div part="inputs">
        <label part="header">CTRE Motors</label>
        <div></div>
        ${initializedDIOs.map(dio => html`
          <label>${dio.deviceName}</label>
          <frc-sim-ctre-motor-controller
            source-key="${dio.sourceKey}"
            source-provider="${sourceProvider}"
          ></frc-sim-ctre-motor-controller>
        `)}
      </div>
    `;
    }

    render() {
        return html`
      ${this.renderInputs()}
    `;
    }
}

webbitRegistry.define('frc-sim-ctre-motor-controllers', CtreMotorControllers);