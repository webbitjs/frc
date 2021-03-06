import PropertyView from './property-view';
import { html } from 'lit-element';

class StringPropertyView extends PropertyView {

  renderInputField() {
    return html`
      <vaadin-text-field
        part="input"
        .value="${this.inputValue || ''}"
        @input="${this.onInputChange}"
        @change="${this.onInputChange}"
        theme="small"
        ?disabled="${this.isDisabled()}"
      ></vaadin-text-field>
    `;
  }
}

customElements.define('dashboard-string-property-view', StringPropertyView);