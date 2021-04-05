import { Webbit, html, css } from '@webbitjs/webbit';
import { containerStyles } from '../../styles';

function getRange() {
  const array = [];
  for (let pcm_index = 0; pcm_index < 64; ++pcm_index)
  {
    for (let solenoid_index = 0; solenoid_index < 8; solenoid_index++) {
      array.push("" + pcm_index + solenoid_index);
    }
  }
  return array;
} 

export default class Solenoids extends Webbit {

  static get metadata() {
    return {
      displayName: 'Solenoids',
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
          width: 100px;
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

        frc-boolean-box {
          width: 80%;
          height: 80%;
          min-width: 50px;
          padding-bottom: 2px;
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
    this.sourceKey = 'Solenoid';
    this.sourceProvider = 'HALSim';
  }

  renderInputs() {

    const source = this.getSource();
    const sourceKey = this.sourceKey;
    const sourceProvider = this.sourceProvider;

    if (!this.hasSource()) {
      return html`<p>Add source to show Solenoids.</p>`;
    }

    if (!source) {
      return html`<p>Start HALSim back-end to show Solenoids.</p>`;
    }

    const initializedSolenoids = getRange()
      .map(index => {
        const initialized = source[index] && source[index].init;
        return {
          index,
          initialized,
          sourceKey: `${sourceKey}/${index}/output`
        };
      })
      .filter(({ initialized }) => initialized);

    if (initializedSolenoids.length === 0) {
      return html`<p>No Solenoids</p>`;
    }

    return html`
      <div part="inputs">
        ${initializedSolenoids.map(solenoid => html`
          <label>${solenoid.index}</label>
          <frc-boolean-box
            source-key="${solenoid.sourceKey}"
            source-provider="${sourceProvider}"
          ></frc-boolean-box>
        `)}
      </div>
    `;
  }

  render() {
    return html`
      <label part="header">Solenoids</label>
      ${this.renderInputs()}
    `;
  }
}

webbitRegistry.define('frc-sim-solenoids', Solenoids);