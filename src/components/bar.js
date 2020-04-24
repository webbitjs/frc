import { LitElement, html, css } from '@webbitjs/webbit';

function clamp(value, min, max) {
  return Math.min(max, Math.max(value, min));
}


class Bar extends LitElement {

  static get properties() {
    return {
      value: { type: Number },
      min: { type: Number },
      max: { type: Number },
      center: { type: Number },
    }
  }

  static get styles() {
    return css`
      :host {
        display: inline-block;
        width: 300px;
        height: 20px;
        background: #DDD;
        font-size: 15px;
        line-height: 18px;
        text-align: center;
      }

      [part=foreground] {
        position: absolute;
        top: 0;
        height: 100%;
        background: lightblue;
        border-radius: 3px;
        width: var(--foreground-width);
        left: var(--foreground-left);
        right: var(--foreground-right);
      }

      .content {
        position: relative;
      }
    `;
  }

  constructor() {
    super();
    this.value = 0;
    this.min = -1;
    this.max = 1;
    this.center = 0;
  }

  get min() {
    return Math.min(this._min, this._max);
  }

  set min(value) {
    const oldValue = this._min;
    this._min = value;
    this.requestUpdate('min', oldValue);
  }

  get max() {
    return Math.max(this._min, this._max);
  }

  set max(value) {
    const oldValue = this._max;
    this._max = value;
    this.requestUpdate('max', oldValue);
  }

  updateForeground() {
    const { min, max, center, value } = this;
    const val = clamp(value, min, max);

    const foreground = this.shadowRoot.querySelector('[part=foreground]');

    if (max < center) {
      foreground.style.setProperty(
        '--foreground-width', 
        Math.abs(val - max) / (max - min) * 100 + '%'
      );
      foreground.style.setProperty('--foreground-left', 'auto');
      foreground.style.setProperty('--foreground-right', '0');
    }
    else if (min > center) {
      foreground.style.setProperty(
        '--foreground-width', 
        Math.abs(val - min) / (max - min) * 100 + '%'
      );
      foreground.style.setProperty('--foreground-left', '0');
      foreground.style.setProperty('--foreground-right', 'auto');
    }
    else if (val > center) {
      foreground.style.setProperty(
        '--foreground-width', 
        Math.abs(val - center) / (max - min) * 100 + '%'
      );
      foreground.style.setProperty(
        '--foreground-left', 
        Math.abs(min - center) / (max - min) * 100 + '%'
      );
      foreground.style.setProperty('--foreground-right', 'auto');
    }
    else {
      foreground.style.setProperty(
        '--foreground-width', 
        Math.abs(val - center) / (max - min) * 100 + '%'
      );
      foreground.style.setProperty('--foreground-left', 'auto');
      foreground.style.setProperty(
        '--foreground-right', 
        Math.abs(max - center) / (max - min) * 100 + '%'
      );
    }
  }

  resized() {
    this.updateForeground();
  }

  updated() {
    this.updateForeground();
  }

  render() {
    return html`
      <div part="foreground"></div>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('frc-bar', Bar);