import { Webbit, html, css } from '@webbitjs/webbit';

class BasicSubsystem extends Webbit {

  static get metadata() {
    return {
      displayName: 'Basic Subsystem',
      category: 'Robot & Field Info',
      //description: 'Component for displaying data from a 3-axis accelerometer.',
      documentationLink: 'https://frc-web-components.github.io/components/basic-subsystem/'
    };
  }

  static get styles() {
    return css`
      :host {
        text-align: left;
        font-weight: normal;
        display: inline-block;
      }

      p {
        margin: 0;
      }

      p:first-child {
        margin-bottom: 5px;
      }
    `;
  }

  static get properties() {
    return {
      default: { type: String },
      command: { type: String }
    };
  }

  constructor() {
    super();
    this.default = 'None';
    this.command = 'None';
  }

  render() {
    return html`
      <p>Default command: ${this.default}</p>
      <p>Current command: ${this.command}</p>
    `;
  }
}

webbitRegistry.define('frc-basic-subsystem', BasicSubsystem);