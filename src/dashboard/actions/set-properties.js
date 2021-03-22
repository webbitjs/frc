import Action from '../action';

export default class SetProperties extends Action {

  get needsSelection() {
    return true;
  }

  execute({ wom, selectedNode, context }) {
    const { propertyValueMap } = context;

    console.log('set properties', propertyValueMap);

    selectedNode.setProperties(propertyValueMap);

    setTimeout(async () => {
      wom.history.push(await wom.getHtml());
    });
  }
}