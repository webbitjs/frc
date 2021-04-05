import { Webbit, html, css } from '@webbitjs/webbit';
import { containerStyles } from '../../styles';

export default class Accelerometers extends Webbit {

    static get metadata() {
        return {
            displayName: 'Accelerometers',
            category: 'Simulation',
            slots: [],
            resizable: { left: true, right: true },
            minSize: { width: 50 }
        };
    }

    static get styles() {
        return [
            containerStyles,
            css`
        :host {
          display: inline-block;
          height: auto;
          width: 300px;
          font-family: sans-serif;
        }

        [part=inputs] {
          width: 100%;
          display: inline-grid;
          grid-template-columns: min-content auto;
          grid-auto-rows: 150px;
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

      frc-3-axis-accelerometer {
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
        this.sourceKey = 'Accel';
        this.sourceProvider = 'HALSim';
    }

    renderInputs() {

        const source = this.getSource();
        const sourceKey = this.sourceKey;
        const sourceProvider = this.sourceProvider;

        if (!this.hasSource()) {
            return html`<p>Add source to show CTRE Motors devices.</p>`;
        }

        if (!source) {
            return html`<p>Start HALSim back-end to show DIO devices.</p>`;
        }

        const initializedDIOs = Object.getOwnPropertyNames(source).map( deviceName => {

            let initialized = true;
            if(Object.getOwnPropertyNames(source[deviceName]).includes("init")) {
                initialized = source[deviceName].init;
            }

            return {
                initialized,
                deviceName: deviceName,
                sourceKey: `${sourceKey}/${deviceName}`
            };
        }).filter(({ initialized }) => initialized)

        if (initializedDIOs.length === 0) {
            return html`<p>No Accelerometers</p>`;
        }

        return html`
      <div part="inputs">
        ${initializedDIOs.map(dio => html`
          <label>${dio.deviceName}</label>
          <frc-3-axis-accelerometer
            source-key="${dio.sourceKey}"
            source-provider="${sourceProvider}"
          ></frc-3-axis-accelerometer>
        `)}
      </div>
    `;
    }

    render() {
        return html`
      <label part="header">Accelerometers</label>
      ${this.renderInputs()}
    `;
    }
}

webbitRegistry.define('frc-sim-accelerometers', Accelerometers);