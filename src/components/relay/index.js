import { html, css } from 'lit-element';
import { define, Webbit } from '../../webbit';

class Relay extends Webbit {

  static get dashboardConfig() {
    return {
      displayName: 'Relay',
      category: 'Robot & Field Info',
      //description: 'Component for displaying data from a 3-axis accelerometer.',
      documentationLink: 'https://frc-web-components.github.io/components/relay/',
      slots: [],
      editorTabs: ['properties', 'sources'],
    };
  }

  static get styles() {
    return css`
      :host {
        font-size: 15px;
        display: inline-flex;
        flex-direction: column;
        width: 150px;
        height: 300px;
      }

      [part=button] {
        border-radius: 0;
        margin: 0;
        flex: 1;
        font-size: inherit;
        height: 100%;
      }
    `;
  }

  static get properties() {
    return {
      value: { type: String, defaultValue: 'Off', primary: true }
    };
  }

  constructor() {
    super();
    this.buttons = ['Off', 'On', 'Forward', 'Reverse'];
  }

  setValue(value) {
    this.value = value;
  }

  render() {
    return html`   
      ${this.buttons.map(button => html`
        <vaadin-button
          part="button" 
          theme="contrast ${this.value == button ? 'primary' : ''}" 
          @click="${() => this.setValue(button)}"
        >
          ${button}
        </vaadin-button>
      `)}
    `;
  }
}

define('frc-relay', Relay);