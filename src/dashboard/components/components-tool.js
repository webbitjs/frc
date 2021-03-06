import { LitElement, html, css } from 'lit-element';
import { throttle } from '../../utils';

class ComponentsTool extends LitElement {

  static get styles() {
    return css`

      :host {
        display: block;
        position: relative;
        padding: 15px 10px;
        font-family: sans-serif;
      }

      [part=fields] {
        display: flex;
      }

      [part=components] {
        flex: 1;
      }

      [part=components] vaadin-text-field {
        width: 100%;
        padding-top: 0;
      }

      [part=slots] {
        width: 180px;
      }

      [part=fields] > * {
        margin-right: 7px;
        padding-top: 0;
      }

      vaadin-combo-box::part(text-field) {
        padding-top: 0;
      }

      p {
        margin-top: 0;
        font-weight: bold;
      }

      p span, header span {
        color: purple;
      }

      header {
        font-weight: bold;
      }

      [part=components-list] {
        position: absolute;
        width: 100%;
        border-radius: 4px;
        box-shadow: rgba(0, 0, 0, 0.3) 4px 4px 15px 2px;
        padding: 5px 7px;
        max-height: 250px;
        overflow: auto;
        box-sizing: border-box;
        background: white;
        z-index: 1;
      }

      [part=component] {
        padding-left: 20px;
        cursor: pointer;
      }

      [part=component]:not(.selected):hover {
        background-color: #a1bbeb;
      }

      [part=component].selected {
        background-color: #4781eb;
      }

      [part=buttons] vaadin-button {
        margin-right: 7px;
      }

      [part=selected-component-details] {
        margin: 10px 0;
      }

      [part=selected-component-details] p {
        font-weight: normal;
        margin-top: 10px;
      }
    `;
  }

  static get properties() {
    return {
      wom: { type: Object },
      selectedNode: { type: Object, attribute: false },
      componentCategories: { type: Array, attribute: false },
      selectedComponent: { type: String, attribute: false },
      showComponentList: { type: Boolean, attribute: false },
      selectedSlot: { type: String, attribute: false },
    };
  }

  constructor() {
    super();
    this.wom = null;
    this.selectedNode = null;
    this.componentCategories = [];
    this.selectedComponent = '';
    this.selectedSlot = '';
    this.showComponentList = false;
  }

  getComponents() {
    return window.webbitRegistry.getRegisteredNames();
  }

  getDashboardConfig(componentName) {
    return window.webbitRegistry.getDashboardConfig(componentName);
  }

  getComponentName(componentName) {
    return this.getDashboardConfig(componentName).displayName;
  }

  getComponentDashboardConfig(componentName) {
    return window.webbitRegistry.getDashboardConfig(componentName);
  }

  sortAlphabetically(array, property) {
    return array.sort((a, b) => {
      if(a[property] < b[property]) { return -1; }
      if(a[property] > b[property]) { return 1; }
      return 0;
    });
  }

  updated(changedProps) {
    if (changedProps.has('selectedNode') && this.selectedNode) {
      this.showComponentList = false;
      this.selectedSlot = this.selectedNode.getSlots()[0] || '';
      this.componentCategories = this.getComponentCategories();
      if (this.selectedNode.getSlots().length === 0) {
        return;
      } else if (this.componentCategories.length === 1) {
        const { components } = this.componentCategories[0];
        if (components.length === 1) {
          this.selectedComponent = components[0].name;
        }
      }
    }

    if (changedProps.has('selectedSlot')) {
      this.componentCategories = this.getComponentCategories();
      if (this.selectedNode.getSlots().length === 0) {
        return;
      } else if (this.componentCategories.length === 1) {
        const { components } = this.componentCategories[0];
        if (components.length === 1) {
          this.selectedComponent = components[0].name;
        }
      }
    }
  }

  getComponentCategories() {
    const categories = {};

    if (!this.selectedNode) {
      return [];
    }

    this.getComponents().forEach(name => {
      const { displayName, category } = this.getComponentDashboardConfig(name);
      if (!this.selectedNode.canContainComponent(name, this.selectedSlot) || !category) {
        return;
      }
      
      const categoryName = category.toLowerCase();
      if (categoryName in categories) {
        categories[categoryName].push({ displayName, name });
      } else {
        categories[categoryName] = [{ displayName, name }];
      }
    });

    // sort alphabetically
    return Object.keys(categories).sort().map(categoryName => {
      return {
        name: categoryName,
        components: this.sortAlphabetically(categories[categoryName], 'displayName')
      }
    });
  }

  onComponentSelect(name) {
    this.selectedComponent = name; 
    this.showComponentList = false;
  }

  onPrependElement() {
    this.wom.executeAction('addNode', {
      prepend: true,
      componentType: this.selectedComponent,
      slot: this.selectedSlot
    });
  }

  onAppendElement() {
    this.wom.executeAction('addNode', {
      prepend: false,
      componentType: this.selectedComponent,
      slot: this.selectedSlot
    });
  }

  toggleShowComponentList() {
    this.showComponentList = !this.showComponentList;
  }

  onSlotChange(ev) {
    const input = ev.target || ev.path[0];
    this.selectedSlot = input.value;
  }

  renderSelectedComponentDetails() {
    if (!this.selectedComponent) {
      return html`
        <div part="selected-component-details">
          <p>Select a component to view details.</p>
        </div>
      `;
    }

    const dashboardConfig = this.getComponentDashboardConfig(this.selectedComponent);

    if (!dashboardConfig) {
      return html`
        <div part="selected-component-details">
          <p>Component <span>${this.selectedComponent}</span> does not exist.</p>
        </div>
      `;
    }

    if (!this.selectedNode.canContainComponent(this.selectedComponent, this.selectedSlot)) {
      return html`
        <div part="selected-component-details">
          <p>Component <span>${this.selectedComponent}</span> cannot be added to the selected element.</p>
        </div>
      `;
    }

    return html`
      <div part="selected-component-details">
        <header><span>${dashboardConfig.displayName}</span> component</header>
        <p>
          ${dashboardConfig.description}
          ${' '}
          ${dashboardConfig.documentationLink ? html`
            Examples and documentation can be found <a href="${dashboardConfig.documentationLink}" target="_blank">here</a>.
          ` : ''}
        </p>
      </div>
      <div part="buttons">
        <vaadin-button 
          part="confirm-button" 
          theme="success primary small" 
          aria-label="Confirm"
          ?disabled="${!this.selectedComponent}"
          @click="${this.onPrependElement}"
        >
          Prepend Element
        </vaadin-button>
        <vaadin-button 
          part="confirm-button" 
          theme="success primary small" 
          aria-label="Confirm"
          ?disabled="${!this.selectedComponent}"
          @click="${this.onAppendElement}"
        >
          Append Element
        </vaadin-button>
      </div>
    `;
  }

  renderComponentList() {

    const dashboardConfig = this.getDashboardConfig(this.selectedComponent) || {};
    const canContain = this.selectedNode.canContainComponent(this.selectedComponent, this.selectedSlot);
    const accordionOpenIndex = (dashboardConfig && canContain)
      ? this.componentCategories.findIndex(category => {
        if (typeof dashboardConfig.category !== 'string') {
          return false;
        }
        return category.name === dashboardConfig.category.toLowerCase();
      })
      : null;

    return html`
      <vaadin-accordion opened="${accordionOpenIndex}">
        ${this.componentCategories.map(category => html`
          <vaadin-accordion-panel theme="small">
            <div part="category-name" slot="summary">${category.name}</div>
            <div part="component-list">
              ${category.components.map(component => html`
                <div 
                  part="component" 
                  @click="${() => this.onComponentSelect(component.name)}"
                  class="${this.selectedComponent === component.name ? 'selected' : ''}"
                >
                  ${component.displayName}
                </div>
              `)}
            </div>
          </vaadin-accordion-panel>
        `)}
      </vaadin-accordion>
    `;
  }

  onSelectedComponentInput() {
    const selectedComponentInput = this.shadowRoot.querySelector('[part=selected-component-input]');
    this.onComponentSelect(selectedComponentInput.value);
  }

  render() {

    if (!this.selectedNode) {
      return html`<p>Select an element to begin adding.</p>`;
    }

    if (this.selectedNode.getSlots().length === 0) {
      return html`
        <p>Elements of type <span>${this.selectedNode.getName()}</span> can't contain other elements.</p>
      `;
    }

    if (Object.keys(this.componentCategories).length === 0) {
      return html`
        <p>There are no available elements to add to element of type <span>${this.selectedNode.getName()}</span>.</p>
      `;
    }

    return html`
      <p>Add elements to <span>${this.selectedNode.getWebbitName()  || this.selectedNode.getDisplayName()}</span></p>
      <div part="fields">
        <div part="components" style="position: relative">
          <vaadin-text-field
            part="selected-component-input"
            label="Component"
            value="${this.selectedComponent || ''}"
            theme="small"
            @input="${this.onSelectedComponentInput}"
          >
              <iron-icon 
                slot="suffix" 
                icon="vaadin:angle-down"
                style="cursor: pointer"
                @click="${this.toggleShowComponentList}"
              ></iron-icon>
          </vaadin-text-field>
          ${this.showComponentList ? html`
            <div part="components-list">
              ${this.renderComponentList()}
            </div>
          ` : ''}
        </div>
        <vaadin-combo-box
          part="slots"
          .items="${this.selectedNode.getSlots()}"
          label="Slot"
          value="${this.selectedSlot}"
          ?readonly="${this.selectedNode.getSlots().length === 1}"
          @change="${this.onSlotChange}"
          theme="small"
        ></vaadin-combo-box>
      </div>
      ${this.renderSelectedComponentDetails()}
    `
  }
}

customElements.define('dashboard-components-tool', ComponentsTool);