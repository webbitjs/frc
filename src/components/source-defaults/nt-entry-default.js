import { Webbit } from '@webbitjs/webbit';
import { getSourceProvider, sourceProviderAdded } from '@webbitjs/store';

export default class NtEntryDefault extends Webbit {

  static get properties() {
    return {
      key: { type: String, showInEditor: true },
      value: { type: Object, showInEditor: true },
    };
  }

  constructor() {
    super();
    this.key = '';

    this.provider = null;
    this.hasProvider = new Promise(resolve => {

      const provider = getSourceProvider('NetworkTables');

      if (provider) {
        this.provider = provider;
        resolve(this.provider);
      } else {
        sourceProviderAdded(providerName => {
          if (providerName === 'NetworkTables') {
            this.provider = getSourceProvider('NetworkTables');
            resolve(this.provider);
          }
        });
      }
    });
  }

  async isSourceSet() {
    await this.hasProvider;
    const value = this.provider.getSource(this.key);
    return value !== undefined;
  }

  async updated(changedProps) {
    if (!changedProps.has('key') && !changedProps.has('value'))  {
      return;
    }

    if (!this.key) {
      return;
    }

    if (!await this.isSourceSet()) {
      this.provider.userUpdate(this.key, this.value);
    }
  }
}