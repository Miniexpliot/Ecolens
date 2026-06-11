/**
 * @fileoverview Unit tests for the accessibility helper module.
 * Validates keyboard focus management and activation behaviour.
 */
import { describe, test, expect, vi } from 'vitest';
import { makeFocusable } from './accessibility.js';

describe('accessibility helpers', () => {
  describe('makeFocusable', () => {
    test('sets tabindex="0" on the element', () => {
      const el = document.createElement('div');
      makeFocusable(el, () => {});
      expect(el.getAttribute('tabindex')).toBe('0');
    });

    test('calls onActivate when Enter key is pressed', () => {
      const el = document.createElement('div');
      const onActivate = vi.fn();
      makeFocusable(el, onActivate);

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);

      expect(onActivate).toHaveBeenCalledTimes(1);
    });

    test('calls onActivate when Space key is pressed', () => {
      const el = document.createElement('div');
      const onActivate = vi.fn();
      makeFocusable(el, onActivate);

      const event = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);

      expect(onActivate).toHaveBeenCalledTimes(1);
    });

    test('does NOT call onActivate for other keys', () => {
      const el = document.createElement('div');
      const onActivate = vi.fn();
      makeFocusable(el, onActivate);

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);

      expect(onActivate).not.toHaveBeenCalled();
    });

    test('prevents default behaviour on activation keys', () => {
      const el = document.createElement('div');
      makeFocusable(el, () => {});

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      const spy = vi.spyOn(event, 'preventDefault');
      el.dispatchEvent(event);

      expect(spy).toHaveBeenCalled();
    });

    test('does not throw when onActivate is a no-op', () => {
      const el = document.createElement('div');
      makeFocusable(el, () => {});

      const event = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });

      expect(() => el.dispatchEvent(event)).not.toThrow();
    });
  });
});
