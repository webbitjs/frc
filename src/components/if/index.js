import { containerStyles } from '../styles';
import { html } from 'lit-element';
import { Webbit, define } from '../../webbit';

class If extends Webbit {

  static get dashboardConfig() {
    return {
      displayName: 'If',
      // category: 'Layout',
      description: 'Component for conditionally displaying content.',
      slots: ['default', 'if-true', 'if-false']
      // documentationLink: 'https://frc-web-components.github.io/components/3-axis-accelerometer/'
    };
  }

  static get styles() {
    return [
      containerStyles
    ];
  }

  static get properties() {
    return {
      value: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.value = false;
  }

  render() {
    if (this.value) {
      return html`
        <slot></slot>
        <slot name="if-true"></slot>
      `;
    }
    return html`
      <slot name="if-false"></slot>
    `;
  }
}

define('frc-if', If);