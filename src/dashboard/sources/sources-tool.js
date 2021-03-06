import { LitElement, html, css } from 'lit-element';
import { getSourceProviderNames, getSources } from '@webbitjs/store';
import './sources-view';

class SourcesTool extends LitElement {

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 15px 10px;
        font-family: sans-serif;
      }

      [part=source-fields] {
        display: flex;
      }

      [part=source-fields] vaadin-combo-box {
        flex: 1;
        margin-right: 7px;
        min-width: 120px;
      }

      [part=source-fields] vaadin-combo-box::part(text-field) {
        padding-top: 0;
      }

      [part=source-key-dropdown] {
        --vaadin-combo-box-overlay-width: 400px;
      }

      [part=buttons] {
        display: flex;
        justify-content: flex-end;
      }

      [part=buttons] vaadin-button {
        margin-right: 7px;
      }

      p {
        margin-top: 0;
        font-weight: bold;
      }

      p span {
        color: purple;
      }

      vaadin-form-layout vaadin-combo-box, vaadin-form-layout multiselect-combo-box {
        width: calc(100% - 5px);
      }

      vaadin-form-layout vaadin-form-item::part(label) {
        margin-top: 10px;
      }

    `;
  }

  static get properties() {
    return {
      wom: { type: Object },
      selectedNode: { type: Object, attribute: false },
      sourceKeyInput: { type: String, attribute: false },
      sourceProviderInput: { type: String, attribute: false },
    };
  }

  constructor() {
    super();
    this.wom = null;
    this.selectedNode = null;
    this.sourceKeyInput = '';
    this.sourceProviderInput = '';
  }

  getSourceKey() {
    return this.selectedNode.getSourceKey();
  }

  getSourceProvider() {
    return this.selectedNode.getSourceProvider();
  }

  updated(changedProperties) {
    if (changedProperties.has('selectedNode') && this.selectedNode) {
      this.sourceKeyInput = this.getSourceKey();
      this.sourceProviderInput = this.getSourceProvider();
    }
  }

  isSourceKeyInputModified() {
    if (!this.selectedNode) {
      return false;
    }

    return this.getSourceKey() !== this.sourceKeyInput || this.sourceKeyInput === null;
  }

  isSourceProviderInputModified() {
    if (!this.selectedNode) {
      return false;
    }

    return this.getSourceProvider() !== this.sourceProviderInput;
  }

  isInputModified() {
    return this.isSourceKeyInputModified() || this.isSourceProviderInputModified();
  }

  onSourceKeyInputChange(ev) {
    const input = ev.target || ev.path[0];
    this.sourceKeyInput = input.value;
  }

  onSourceProviderInputChange(ev) {
    const input = ev.target || ev.path[0];
    this.sourceProviderInput = input.value;
  }

  onCancel() {
    this.sourceKeyInput = this.getSourceKey();
    this.sourceProviderInput = this.getSourceProvider();
  }

  onConfirm() {
    this.wom.executeAction('setSource', {
      sourceProvider: this.sourceProviderInput,
      sourceKey: this.sourceKeyInput,
    });
    this.requestUpdate();
  }

  onSourceSelect(ev) {
    const { sourceKey, sourceProvider } = ev.detail;
    this.sourceKeyInput = sourceKey;
    this.sourceProviderInput = sourceProvider;
  }

  getSourceKeyItems() {
    const sources = getSources(this.sourceProviderInput || '') || {};
    const keys = Object.getOwnPropertyNames(sources);
    const blankKeyIndex = keys.indexOf('');
    if (blankKeyIndex > -1) {
      keys.splice(blankKeyIndex, 1);
    }
    return keys;
  }

  renderWebbit() {
    return html`
      <p>Source for <span>${this.selectedNode.getWebbitName() || this.selectedNode.getName()}</span></p>
      <vaadin-form-layout>
        <vaadin-form-item>
          <label slot="label">Source Key</label>
          <vaadin-combo-box
            part="source-key-dropdown"
            clear-button-visible 
            value="${this.sourceKeyInput || ''}"
            .items="${this.getSourceKeyItems()}"
            @change="${this.onSourceKeyInputChange}"
            theme="small"
            allow-custom-value
          >
          </vaadin-combo-box>
        </vaadin-form-item>
        <vaadin-form-item>
          <label slot="label">Source Provider</label>
          <vaadin-combo-box 
            clear-button-visible
            value="${this.sourceProviderInput || ''}"
            .items="${getSourceProviderNames()}"
            @change="${this.onSourceProviderInputChange}"
            theme="small"
          ></vaadin-combo-box>
        </vaadin-form-item>
      </vaadin-form-layout>

      <div part="buttons">
        <vaadin-button 
          part="confirm-button" 
          theme="success primary small" 
          aria-label="Confirm"
          ?disabled="${!this.isInputModified()}"
          @click="${this.onConfirm}"
        >
          Confirm
        </vaadin-button>

        <vaadin-button 
          part="cancel-button" 
          theme="error primary small" 
          aria-label="Cancel"
          ?disabled="${!this.isInputModified()}"
          @click="${this.onCancel}"
        >
          Cancel
        </vaadin-button>
      </div>
    `;
  }

  renderSelectedNodeInputs() {

    if (!this.selectedNode) {
      return html`<p>Select an element to change its source.</p>`;
    }

    if (this.selectedNode === this.wom.getRootNode()) {
      return html`<p>The source for the root node cannot be changed.</p>`;
    }

    if (this.selectedNode && !this.selectedNode.isRegistered()) {
      return html`<p>Sources cannot be applied to this element..</p>`;
    }

    return this.renderWebbit();
  }


  render() {
    return html`
      ${this.renderSelectedNodeInputs()}
      <dashboard-sources-view
        selected-source-key="${this.sourceKeyInput}"
        selected-source-provider="${this.sourceProviderInput}"
        @sourceSelect="${this.onSourceSelect}"
      ></dashboard-sources-view>
    `;
  }
}

customElements.define('dashboard-sources-tool', SourcesTool);