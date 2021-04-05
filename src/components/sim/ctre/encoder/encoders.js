import { Webbit, html, css } from '@webbitjs/webbit';
import { containerStyles } from '../../../styles';

export default class CtreEncoders extends Webbit {

    static get metadata() {
        return {
            displayName: 'CTRE Encoders',
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

        frc-sim-ctre-encoder {
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
        this.sourceKey = 'CANEncoder';
        this.sourceProvider = 'HALSim';
    }

    renderInputs() {

        const source = this.getSource();
        const sourceKey = this.sourceKey;
        const sourceProvider = this.sourceProvider;

        if (!this.hasSource()) {
            return html`<p>Add source to show CTRE Encoders devices.</p>`;
        }

        if (!source) {
            return html`<p>Start HALSim back-end to show CTRE Encoders devices.</p>`;
        }

        const initializedDIOs = Object.getOwnPropertyNames(source).map( deviceName => {

            return {
                deviceName: deviceName,
                sourceKey: `${sourceKey}/${deviceName}/quadEncoder`
            };
        })

        if (initializedDIOs.length === 0) {
            return html`<p>No CTRE motors</p>`;
        }

        return html`
      <div part="inputs">
        ${initializedDIOs.map(dio => html`
          <label>${dio.deviceName}</label>
          <frc-sim-ctre-encoder
            source-key="${dio.sourceKey}"
            source-provider="${sourceProvider}"
          ></frc-sim-ctre-encoder>
        `)}
      </div>
    `;
    }

    render() {
        return html`
      <label part="header">CTRE Encoders</label>
      ${this.renderInputs()}
    `;
    }
}

webbitRegistry.define('frc-sim-ctre-encoders', CtreEncoders);