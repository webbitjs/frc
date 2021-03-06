import './urdf-manipulator-element';
import './urdf-viewer-element';
import { html, css } from 'lit-element';
import { define, Webbit } from '../../webbit';
import { subscribe, getSourceProvider, getSource } from '@webbitjs/store';
import loadMesh from './load-mesh';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 1 / DEG2RAD;

class UrdfViewer extends Webbit {

  static get dashboardConfig() {
    return {
      displayName: 'URDF Viewer',
      category: '3D Models',
      description: 'Component used to display and manipulate URDF models',
      // documentationLink: 'https://frc-web-components.github.io/components/model-viewer/',
      slots: [],
      dashboardHtml: `
        <frc-urdf-viewer
          urdf="https://rawcdn.githack.com/frc-web-components/frc-web-components/b0fbd5c90d50035012ce04d8dcde041fea7ed79b/models/urdf/pi-bot.urdf"
          max-distance=".75"
          controllable
          camera-x="0.58"
          camera-y="0.3"
          camera-z="0.48"
        ></frc-urdf-viewer>
      `
    };
  }

  static get styles() {
    return css`
      :host {
        display: inline-block;
        width: 300px;
        height: 300px;
        background: white;
      }
      
      urdf-viewer, urdf-manipulator {
        display: block;
        width: 100%;
        height: 100%;
      }

      canvas {
        display: block;
        width: 100%;
        height: 100%;
        outline: none;
      }
    `;
  }

  static get properties() {
    return {
      urdf: { type: String },
      urdfContent: { type: String },
      controllable: { type: Boolean },
      up: { type: String, defaultValue: 'Z+' },
      displayShadow: { type: Boolean },
      ambientColor: { type: String, defaultValue: 'black' },
      minDistance: { type: Number, defaultValue: .25 },
      maxDistance: { type: Number, defaultValue: 5 },
      robotX: { type: Number },
      robotY: { type: Number },
      robotZ: { type: Number },
      cameraX: { type: Number },
      cameraY: { type: Number },
      cameraZ: { type: Number, defaultValue: -10 },
      autoRotate: { type: Boolean },
      autoRotateSpeed: { type: Number, defaultValue: 2 },
    };
  }

  get sourceKey() {
    return this.getAttribute('source-key');
  }

  get sourceProvider() {
    return this.getAttribute('source-provider');
  }

  constructor() {
    super();
    this.unsubscribe = () => {};
    this.jointManipulated = null;
  }

  getSource() {
    return getSource(this.sourceProvider, this.sourceKey);
  }


  setSources() {
    this.unsubscribe();

    if (this.sourceKey) {
      this.unsubscribe = subscribe(this.sourceProvider, this.sourceKey, () => {
        this.setJointAnglesFromSource();
      }, true);
    }
  }

  setJointAnglesFromSource() {
    const viewer = this.shadowRoot.querySelector('[part=viewer]');
    const source = this.getSource();
    if (viewer.robot && source && typeof source === 'object') {
      Object.getOwnPropertyNames(source).forEach(name => {
        viewer.setAngle(name, source[name] * DEG2RAD);
      });
    }
  }

  firstUpdated() {
    const observer = new MutationObserver(() => {
      this.setSources();
    });

    observer.observe(this, {
      attributes: true,
      attributeFilter: ['source-key', 'source-provider']
    });
  }

  onCameraChange(ev) {
    const { x, y, z } = ev.detail;
    this.cameraX = x;
    this.cameraY = y;
    this.cameraZ = z;
  }

  onManipulationStart(ev) {
    this.jointManipulated = ev.detail;
  }

  onManipulationEnd() {
    const viewer = this.shadowRoot.querySelector('[part=viewer]');
    const angle = viewer.robot.joints[this.jointManipulated].angle * RAD2DEG;

    const source = this.getSource();
    if (source && typeof source === 'object') {
      const provider = getSourceProvider(this.sourceProvider);
      provider.userUpdate(`${this.sourceKey}/${this.jointManipulated}`, angle);
    }
  }

  render() {

    if (!this.controllable) {
      return html`   
        <urdf-viewer 
          part="viewer"
          urdf="${this.urdf}"
          urdf-content="${this.urdfContent}"
          up="${this.up}" 
          ?display-shadow="${this.displayShadow}"
          ambient-color="${this.ambientColor}"
          .loadMeshFunc="${loadMesh}"
          min-distance="${this.minDistance}"
          max-distance="${this.maxDistance}"
          robot-x="${this.robotX}"
          robot-y="${this.robotY}"
          robot-z="${this.robotZ}"
          camera-x="${this.cameraX}"
          camera-y="${this.cameraY}"
          camera-z="${this.cameraZ}"
          ?auto-rotate="${this.autoRotate}"
          auto-rotate-speed="${this.autoRotateSpeed}"
          @camera-change="${this.onCameraChange}"
        ></urdf-viewer>
      `;
    }

    return html`   
      <urdf-manipulator
        part="viewer"
        urdf="${this.urdf}" 
        urdf-content="${this.urdfContent}"
        up="${this.up}" 
        ?display-shadow="${this.displayShadow}"
        ambient-color="${this.ambientColor}"
        .loadMeshFunc="${loadMesh}"
        min-distance="${this.minDistance}"
        max-distance="${this.maxDistance}"
        robot-x="${this.robotX}"
        robot-y="${this.robotY}"
        robot-z="${this.robotZ}"
        camera-x="${this.cameraX}"
        camera-y="${this.cameraY}"
        camera-z="${this.cameraZ}"
        ?auto-rotate="${this.autoRotate}"
        auto-rotate-speed="${this.autoRotateSpeed}"
        @camera-change="${this.onCameraChange}"
        @manipulate-start="${this.onManipulationStart}"
        @manipulate-end="${this.onManipulationEnd}"
      ></urdf-manipulator>
    `;
  }
}

define('frc-urdf-viewer', UrdfViewer);

