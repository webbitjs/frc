import { containerStyles } from '../styles';
import { html, css } from 'lit-element';
import { define, Webbit } from '../../webbit';

function getRange(start, end) {
  const range = [];
  for (let i = start; i < end; i++) {
    range.push(i);
  }
  return range;
};

class Pdp extends Webbit {

  static get dashboardConfig() {
    return {
      displayName: 'Power Distribution Panel',
      category: 'Robot & Field Info',
      //description: 'Component for displaying data from a 3-axis accelerometer.',
      documentationLink: 'https://frc-web-components.github.io/components/power-distribution-panel/',
      slots: [],
      editorTabs: ['properties', 'sources'],
      resizable: { left: true, right: true },
      minSize: { width: 224 },
    };
  }

  static get properties() {

    const props = {};

    for (let i = 0; i < 16; i++) {
      props[`chan${i}`] = { type: Number }
    }

    return {
      ...props,
      voltage: { type: Number },
      totalCurrent: { type: Number }      
    };
  }

  static get styles() {
    return [
      containerStyles,
      css`
        :host {
          width: 350px;
          margin: 5px;
        }

        [part=channels] {
          display: grid;
          grid-auto-flow: column;
          grid-template-columns: min-content 1fr min-content 1fr;
          grid-template-rows: auto auto auto auto auto auto auto auto;
          width: 100%;
          height: auto;
          align-items: center;
        }

        .channel, .voltage, .total-current {
          width: auto;
        }

        [part=channel-label] {
          padding-left: 5px;
          text-align: right;
          white-space: nowrap;
        }

        [part=voltage-and-total-current] {
          margin-top: 5px;
          display: grid;
          grid-auto-flow: column;
          grid-template-columns: min-content auto;
          grid-template-rows: auto auto;
          column-gap: 10px;
          width: 100%;
          height: auto;
          align-items: center;
        }

        [part=voltage-and-total-current] {
          white-space: nowrap;
        }
      `
    ];
  }

  renderChannel(number) {
    return html`
      <frc-number-bar
        class="channel"
        part="channel"
        value="${this[`chan${number}`]}"
        min="0"
        max="40"
        center="0"
        precision="2"
        ?hide-text="${false}"
        num-tick-marks="0"
        unit="A"
      ></frc-number-bar>
    `;
  }

  render() {
    return html`
      <div part="channels">
        ${getRange(0, 8).map(number => html`
          <label part="channel-label">
            <slot name="${`channel-label${number}`}">Ch. ${number}</slot>
          </label>
        `)}
        ${getRange(0, 8).map(number => html`
          ${this.renderChannel(number)}
        `)}
        ${getRange(8, 16).map(number => html`
          <label part="channel-label">
            <slot name="${`channel-label${number}`}">Ch. ${number}</slot>
          </label>
        `)}
        ${getRange(8, 16).map(number => html`
          ${this.renderChannel(number)}
        `)}
      </div>
      <div part="voltage-and-total-current">
        <label part="voltage-label">
          <slot name="voltage-label">Voltage</slot>
        </label>
        <label part="total-current-label">
          <slot name="total-current">Total Current</slot>
        </label>
        <frc-voltage-view
          class="voltage"
          part="voltage"
          value="${this.voltage}"
          min="0"
          max="15"
          center="0"
          precision="2"
          ?hide-text="${false}"
          num-tick-marks="0"
        ></frc-voltage-view>
        <frc-number-bar
          class="total-current"
          part="total-current"
          value="${this.totalCurrent}"
          min="0"
          max="500"
          center="0"
          precision="2"
          ?hide-text="${false}"
          num-tick-marks="0"
          unit="A"
        ></frc-number-bar>
      </div>
    `;
  }
}

define('frc-pdp', Pdp);