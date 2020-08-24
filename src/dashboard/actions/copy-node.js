import Action from '../action';

export default class CopyNode extends Action {

  constructor() {
    super({
      needsSelection: true,
      needsTarget: true
    });
  }

  execute({ wom, selectedNode }) {
    alert(`Copying nodes hasn't been implemented yet!`);
  }
}