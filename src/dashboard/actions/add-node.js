import Action from '../action';

export default class AddNode extends Action {

  constructor() {
    super({
      needsSelection: true,
      needsTarget: true
    });
  }

  execute({ 
    wom, 
    selectedNode, 
    targetedNode,
    context
  }) {
    const { position } = context;

    if (position === 'inside') {
      wom.prependNode(selectedNode, targetedNode);
    } else if (position === 'before') {
      wom.insertNodeBefore(selectedNode, targetedNode);
    } else {
      wom.insertNodeAfter(selectedNode, targetedNode);
    }
  }
}