import { Webbit, html, css } from '@webbitjs/webbit';
import { containerStyles } from '../../styles';

export default class Gyros extends Webbit {

    static get metadata() {
        return {
            displayName: 'Gyros',
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
          width: 200px;
          font-family: sans-serif;
        }

        [part=inputs] {
          width: 100%;
          display: inline-grid;
          grid-template-columns: min-content auto;
          grid-auto-rows: 50px;
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

        frc-gyro {
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
        this.sourceKey = 'Gyro';
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

            return {
                deviceName: deviceName,
                sourceKey: `${sourceKey}/${deviceName}/angle_x`
            };
        })

        if (initializedDIOs.length === 0) {
            return html`<p>No Gyros</p>`;
        }

        return html`
      <div part="inputs">
        ${initializedDIOs.map(dio => html`
          <label>${dio.deviceName}</label>
          <frc-gyro
            source-key="${dio.sourceKey}"
            source-provider="${sourceProvider}"
          ></frc-gyro>
        `)}
      </div>
    `;
    }

    render() {
        return html`
      <label part="header">Gyros</label>
      ${this.renderInputs()}
    `;
    }
}

webbitRegistry.define('frc-sim-gyros', Gyros);