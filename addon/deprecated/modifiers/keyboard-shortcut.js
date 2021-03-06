import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { lte } from 'ember-compatibility-helpers';
import { gte } from 'ember-compatibility-helpers';
import { deprecate } from '@ember/debug';

let Klass;
if (gte('3.8.0')) {

  /* This is an element modifier to trigger a click on the element when
   * the specified key is pressed. In the following example, we trigger a
   * click on the button when the B key is pressed:
   *
   * <button {{keyboard-shortcut 'KeyB'}}>Press me or press "B"</button>
   */
  Klass = class KeyboardShortcutModifier extends Modifier {
    @service keyboard;

    keyboardActivated = true;
    keyboardPriority = 0;
    keyboardFirstResponder = false;
    keyboardEventType = 'keypress';

    didReceiveArguments() {
      this.key = this.args.positional[0];

      if ('keyboardActivated' in this.args.named) {
        this.keyboardActivated = this.args.named.keyboardActivated
      }

      if ('keyboardPriority' in this.args.named) {
        this.keyboardPriority = this.args.named.keyboardPriority
      }

      if ('keyboardFirstResponder' in this.args.named) {
        this.keyboardFirstResponder = this.args.named.keyboardFirstResponder
      }

      if ('keyboardEventType' in this.args.named) {
        this.keyboardEventType = this.args.named.keyboardEventType
      }
    }

    didInstall() {
      deprecate(
        'The `keyboard-shortcut` modifier of ember-keyboard is deprecated. Please use the `on-key` modifier with no action instead.',
        false,
        {
            id: 'ember-keyboard.keyboard-shortcut',
            until: '7.0.0',
            url: 'https://adopted-ember-addons.github.io/ember-keyboard/deprecations#keyboard-shortcut'
        }
      );

      try {
        this.keyboard.register(this);
      } catch(e) {
        if (lte('3.8.0')) {
          console.warn('ember-keyboard\'s modifiers are only supported in Ember 3.8+');
        }
        throw e;
      }
    }

    willRemove() {
      this.keyboard.unregister(this);
    }

    has(triggerName) {
      return triggerName === this.keyboardEventName && this.keyboardActivated
    }

    trigger(listenerName) {
      if (this.keyboardActivated && listenerName === this.keyboardEventName) {
        this.element.click();
      }
    }

    get keyboardEventName() {
      let { key, keyboardEventType } = this;
      return `${keyboardEventType}:${key}`;
    }
  }
} else {
  Klass = class OnKeyboardModifier extends Modifier {
    didInstall() {
      throw new Error('ember-keyboard only supports the keyboard-shortcut element modifier in Ember 3.8 and higher.');
    }
  }
}
export default Klass;
