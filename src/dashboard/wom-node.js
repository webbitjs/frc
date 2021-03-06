import { setAttributeFromSourceValue } from '../existing-components';

const isWebbit = (domNode) => {
  if (!(domNode instanceof Object)) {
    return false;
  }

  return domNode.constructor.__WEBBIT_CLASSNAME__ === 'Webbit';
};


const getElementPosition = (element, rootElement = document.body) => {
  let position = [];
  let child = element;

  while (child !== rootElement && child !== document.body) {
    const parent = child.parentElement;
    if (!parent) {
      return position;
    }
    const index = [...parent.children].indexOf(child);
    position = [index, ...position];
    child = parent;
  }

  return position;
};

const getElementFromPosition = (position, rootElement = document.body) => {
  let element = rootElement;
  for (let index of position) {
    element = element.children[index];
    if (!element) {
      return null;
    }
  }
  return element;
};

export default class WomNode {

  constructor(node, wom, ancestors = []) {
    this.node = node;
    this.node.__WOM_NODE__ = this;
    this.wom = wom;
    this.ancestors = ancestors;
    this.childNodes = [];
    this.slots = this.isRegistered() ? this.getDashboardConfig().slots : ['default'];
    this.childBySlotNodes = this.slots.map(() => {
      return [];
    });

    this.selectionBox = null;
  }

  canContainComponent(componentType, slot) {

    if (this.slots.length === 0) {
      return false;
    }

    const { allowedParents } = webbitRegistry.getDashboardConfig(componentType) || {};
    const { allowedChildren } = this.getDashboardConfig() || {};
    
    if (allowedChildren instanceof Array) {
      if (allowedChildren.indexOf(componentType) < 0) {
        return false;
      }
    } else if (typeof allowedChildren === 'object') {
      if (
        typeof allowedChildren[slot] !== 'undefined' 
        && allowedChildren[slot].indexOf(componentType) < 0
      ) {
        return false;
      }
    }

    if (allowedParents && allowedParents.indexOf(this.getName()) < 0) {
      return false;
    }

    return true;
  }

  async getHtml(outer) {
    return new Promise(resolve => {
      window.webbitRegistry.setCloning(true);
      const clonedNode = this.node.cloneNode(true);
      const clonedNodeStyleAttributeValue = clonedNode.getAttribute('style');
      clonedNode.style.display = 'none';
      document.body.parentElement.append(clonedNode);
      [...clonedNode.querySelectorAll('[source-key]'), clonedNode].forEach(node => {
        if (isWebbit(node)) {
          node.isClone = true;
          const position = getElementPosition(node, clonedNode);
          const originalWebbit = getElementFromPosition(position, this.node);

          Object.entries(originalWebbit.defaultProps).forEach(([prop, value]) => {
            if (node.tagName.toLowerCase() === 'frc-field-robot') {
            }
            node[prop] = value;
          });
          node.removeAttribute('webbit-id');
        } else {
          const position = getElementPosition(node, clonedNode);
          const originalWebbit = getElementFromPosition(position, this.node);
          
          let defaultAttributeValues = {};
    
          if (window.manageExistingComponents.hasElement(originalWebbit)) {
            defaultAttributeValues = window.manageExistingComponents.getDefaultAttributeValues(originalWebbit);
          } else {
            originalWebbit.getAttributeNames().forEach(attribute => {
              if (['source-provider', 'source-key', 'webbit-id'].indexOf(attribute) < 0) {
                defaultAttributeValues[attribute] = originalWebbit.getAttribute(attribute);
              }
            });
          }

          node.getAttributeNames().forEach(attribute => {
            if (['source-provider', 'source-key', 'webbit-id'].indexOf(attribute) < 0) {
              if (node !== clonedNode) {
                node.removeAttribute(attribute);
              }
            }
          });
          for (let attribute in defaultAttributeValues) {
            if (attribute) {
              setAttributeFromSourceValue(node, attribute, defaultAttributeValues[attribute]);
            }
          }

          if (originalWebbit !== this.node) {
            if (originalWebbit.getAttribute('style')) {
              node.setAttribute('style', originalWebbit.getAttribute('style'));
            } else {
              node.removeAttribute('style');
            }
          }
        }
      });
      setTimeout(() => {

        clonedNode.remove();

        if (clonedNodeStyleAttributeValue) {
          clonedNode.setAttribute('style', clonedNodeStyleAttributeValue);
        } else {
          clonedNode.removeAttribute('style');
        }
        const html = outer ? clonedNode.outerHTML : clonedNode.innerHTML;
        window.webbitRegistry.setCloning(false);

        resolve(html);
      });
    });
  }

  setHtml(html) {
    this.node.innerHTML = html;

    if (this.getLevel() !== 0) {
      return;
    }

    if (
      this.node.children.length === 1 && 
      this.node.children[0].nodeName === 'FRC-ROOT-LAYOUT'
    ) {
      return;
    }

    this.node.innerHTML = `
      <frc-root-layout>
        ${this.node.innerHTML}
      </frc-root-layout>
    `;
  }

  async executeScripts() {

    if (this.getLevel() !== 0) {
      return;
    }

    // replace script tags with executable ones
    this.node.querySelectorAll('script').forEach(script => {
      script.setAttribute('slot', 'scripts');
      this.wom.addScript(script.src, script.text);
      this.wom.build();
    });
  }

  getParent() {
    const parentNode = this.ancestors[this.ancestors.length - 1];
    return parentNode || null;
  }

  getNextSibling() {
    const parentNode = this.getParent();
    if (!parentNode) {
      return null;
    }
    const siblings = parentNode.getChildren(this.getSlot());
    const siblingIndex = siblings
      .findIndex(sibling => sibling.getNode() === this.getNode()) + 1;

    return siblings[siblingIndex] || null;
  }

  getPreviousSibling() {
    const parentNode = this.getParent();
    if (!parentNode) {
      return null;
    }
    const siblings = parentNode.getChildren(this.getSlot());
    const siblingIndex = siblings
      .findIndex(sibling => sibling.getNode() === this.getNode()) - 1;

    return siblings[siblingIndex] || null;
  }

  destroy() {
    this.childNodes.forEach(node => {
      node.destroy();
    });
    this.childBySlotNodes = this.slots.map(() => {
      return [];
    });
    this.wom.dispatchEvent('womNodeDestroy', { node: this });
  }

  build() {
    this.childNodes = [...this.node.children].map(node => {
      const womNode = new WomNode(node, this.wom, this.ancestors.concat(this));
      const slot = womNode.getSlot();
      const indexOfSlot = this.slots.indexOf(slot);

      if (indexOfSlot > -1) {
        this.childBySlotNodes[indexOfSlot].push(womNode);
      }

      womNode.build();
      return womNode;
    });
    this.wom.dispatchEvent('womNodeBuild', { node: this });
  }

  isDescendant(node) {
    return this.ancestors.map(ancestor => ancestor.node).indexOf(node.node) >= 0;
  }

  getSlots() {
    return this.slots;
  }

  getChildrenBySlot(slot) {
    const indexOfSlot = this.slots.indexOf(slot);
    return this.childBySlotNodes[indexOfSlot] || [];
  }

  getSlot() {
    return this.node.getAttribute('slot') || 'default';
  }

  getChildren() {
    return this.childNodes;
  }

  getDescendents() {
    let descendents = [];
    this.getChildren().forEach(child => {
      descendents.push(child);
      descendents = descendents.concat(child.getDescendents());
    });
    return descendents;
  }

  hasChildren() {
    return this.childNodes.length > 0;
  }

  getName() {
    return this.node.tagName.toLowerCase();
  }

  isPreviewable() {
    const dashboardConfig = this.getDashboardConfig();
    return dashboardConfig ? dashboardConfig.previewable : true;
  }

  getProperties() {
    const dashboardConfig = this.getDashboardConfig();
    const props = dashboardConfig ? dashboardConfig.properties : {};
    const properties = {};
    for (let propName in props) {
      const property = props[propName];
      if (property.canConnectToSources && property.attribute) {
        properties[propName] = property;
      }
    }
    return properties;
  }

  getPropertyValue(property) {
    if (this.isWebbit()) {
      return this.node[property];
    } else {
      const properties = this.getProperties();
      const propertyConfig = properties[property];
      if (!propertyConfig) {
        return null;
      } else {
        return this.node.getAttribute(propertyConfig.attribute);
      }
    }
  }

  getDisplayName() {
    const dashboardConfig = this.getDashboardConfig();
    return dashboardConfig ? dashboardConfig.displayName : this.getName();
  }

  getLayout() {
    const dashboardConfig = this.getDashboardConfig();
    return dashboardConfig ? dashboardConfig.layout : 'absolute';
  }

  getWebbitName() {
    return this.node.name;
  }

  getSourceProvider() {
    if (isWebbit(this.node)) {
      return this.node.sourceProvider;
    } else {
      return window.manageExistingComponents.getSourceProvider(this.node);
    }
  }

  getSourceKey() {
    if (isWebbit(this.node)) {
      return this.node.sourceKey;
    } else {
      return window.manageExistingComponents.getSourceKey(this.node);
    }
  }

  setSource(sourceProvider, sourceKey) {
    if (this.isWebbit()) {
      this.node.sourceProvider = sourceProvider;
      this.node.sourceKey = sourceKey;
    } else {
      this.node.setAttribute('source-provider', sourceProvider);
      this.node.setAttribute('source-key', sourceKey);
    }
  }

  getDefaultProps() {
    if (isWebbit(this.node)) {
      return this.node.defaultProps;
    }

    let defaultAttributeValues = {};
    
    if (window.manageExistingComponents.hasElement(this.node)) {
      defaultAttributeValues = window.manageExistingComponents.getDefaultAttributeValues(this.node);
    } else {
      this.node.getAttributeNames().forEach(attribute => {
        if (['source-provider', 'source-key', 'webbit-id'].indexOf(attribute) < 0) {
          defaultAttributeValues[attribute] = this.node.getAttribute(attribute);
        }
      });
    }
    
    const dashboardConfig = this.getDashboardConfig() || {};
    const properties = dashboardConfig.properties || {};
    const defaultProps = {};

    Object.entries(properties).forEach(([propName, config]) => {
      if (config.attribute in defaultAttributeValues) {
        const type = config.type;
        if (type === String) {
          defaultProps[propName] = defaultAttributeValues[config.attribute];
        } else if (type === Number) {
          defaultProps[propName] = parseFloat(defaultAttributeValues[config.attribute]);
        } else if (type === Boolean) {
          defaultProps[propName] = defaultAttributeValues[config.attribute] === '' || !!defaultAttributeValues[config.attribute];
        } else if (type === Array) {
          try {
            if (defaultAttributeValues[config.attribute] instanceof Array) {
              defaultProp[propName] = defaultAttributeValues[config.attribute];
            } else {
              const value = JSON.parse(defaultAttributeValues[config.attribute]);
              defaultProp[propName] = value instanceof Array ? value : [];
            }
          } catch(e) {
            defaultProps[propName] = [];
          }
        }
      } else {
        defaultProps[propName] = config.defaultValue;
      }
    });

    return defaultProps;
  }

  setProperties(propertyValueMap) {
    if (this.isWebbit()) {
      Object.entries(propertyValueMap).forEach(([property, value]) => {
        if (!this.node.isPropertyConnectedToSource(property)) {
          this.node[property] = value;
        }
        this.node.setDefaultValue(property, value);
      });
    } else {
      const properties = this.getProperties();
      if (window.manageExistingComponents.hasElement(this.node)) {
        Object.entries(propertyValueMap).forEach(([propName, value]) => {
          if (propName in properties) {
            const isConnectedToSource = window.manageExistingComponents.isAttributeConnectedToSource(
              this.node,
              properties[propName].attribute
            );
            window.manageExistingComponents.setDefaultAttributeValue(
              this.node,
              properties[propName].attribute,
              value
            );
            if (!isConnectedToSource) {
              setAttributeFromSourceValue(
                this.node,
                properties[propName].attribute,
                value
              );
            }
          }
        });
      } else {
        Object.entries(propertyValueMap).forEach(([propName, value]) => {
          if (propName in properties) {
            setAttributeFromSourceValue(
              this.node,
              properties[propName].attribute,
              value
            );
          }
        });
      }
    }
  }

  getDashboardConfig() {
    return webbitRegistry.getDashboardConfig(this.getName());
  }
  
  isRegistered() {
    return !!webbitRegistry.get(this.getName());
  }

  isRoot() {
    return this.level === 0;
  }

  getNode() {
    return this.node;
  }

  getLevel() {
    return this.ancestors.length;
  }

  isWebbit() {
    return isWebbit(this.node);
  }

  setSelectionBox(box) {
    this.selectionBox = box;
  }

  getSelectionBox() {
    return this.selectionBox;
  }
}