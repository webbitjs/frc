import FieldObject from './field-object';
import { objectWithout } from './utils';
import { define } from '../../webbit';

class FieldTrajectory extends FieldObject {

  static get dashboardConfig() {
    return {
      displayName: 'Field Trajectory',
      category: 'Field',
      // description: 'Component for displaying information about an encoder',
      // documentationLink: 'https://frc-web-components.github.io/components/encoder/',
      slots: [],
      editorTabs: ['properties', 'sources'],
      allowedParents: ['frc-field'],
    };
  }

  static get properties() {
    return {
      ...objectWithout(super.properties, ['width', 'height', 'image', 'draw']),
      xs: { type: Array, inputType: 'NumberArray' },
      ys: { type: Array, inputType: 'NumberArray' },
      startRot: { type: Number },
      endRot: { type: Number },
      color: { type: String, defaultValue: 'orange' }
    };
  }

  renderDrawing({ bottomCtx, scalingFactor }) {
    bottomCtx.lineWidth = 4 / scalingFactor;
    bottomCtx.strokeStyle = this.color;
    bottomCtx.globalAlpha = .5;

    for (let i = 0; i < this.xs.length - 1; i++) {
      bottomCtx.moveTo(-this.ys[i], this.xs[i]);
      bottomCtx.lineTo(-this.ys[i + 1], this.xs[i + 1]);
    }

    bottomCtx.stroke();

    this.drawArrow(bottomCtx, this.xs[0],-this.ys[0], this.startRot, scalingFactor);
    const lastIndex = this.xs.length - 1;
    this.drawArrow(bottomCtx, this.xs[lastIndex], -this.ys[lastIndex], this.endRot, scalingFactor);  
  }

  drawArrow(ctx, x, y, rotation, scalingFactor) {
    ctx.save();
    ctx.translate(y, x);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillStyle = this.color;
    ctx.moveTo(0, 0);
    ctx.lineTo(- 5 / scalingFactor, 0);
    ctx.lineTo(0, 10 / scalingFactor);
    ctx.lineTo(5 / scalingFactor, 0);
    ctx.fill();

    ctx.restore();

  }
}

define('frc-field-trajectory', FieldTrajectory);