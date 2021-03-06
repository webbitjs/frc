import { addSourceProvider, setDefaultSourceProvider } from '@webbitjs/store';
import WebbitDashboard from './dashboard';
import './dashboard/tools/networktables-dialog';

class FrcDashboardBuilder extends WebbitDashboard {

  static get properties() {
    return {
      ...super.properties,
      address: { type: String, attribute: 'address', reflect: true },
    };
  }

  constructor() {
    super();
    this.address = 'localhost';
  }

  firstUpdated() {
    super.firstUpdated();

    if (!localStorage.robotAddress) {
      localStorage.robotAddress = this.address;
    }

    addSourceProvider('HALSim', 'HALSim', {
      address: localStorage.robotAddress
    });
    addSourceProvider('NetworkTables', 'NetworkTables', {
      address: localStorage.robotAddress
    });
    addSourceProvider('Gamepad', 'Gamepad');
    setDefaultSourceProvider('NetworkTables');

    const interval = setInterval(() => {
      if (NetworkTables.isWsConnected()) {
        const event = new CustomEvent('load', {
          detail: {}
        });
        this.dispatchEvent(event);
        clearInterval(interval);
      }
    }, 500);

    const networktablesDialog = this.shadowRoot.querySelector('dashboard-networktables-dialog');

    document.body.addEventListener('keydown', ev => {
      if (ev.shiftKey && ev.code === 'KeyN' && document.activeElement === document.body) {
        networktablesDialog.open();
      }
    });
  }
}


customElements.define('frc-dashboard-builder', FrcDashboardBuilder);
