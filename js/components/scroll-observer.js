/**
 * @fileoverview IntersectionObserver Utility for Scroll Animations
 * 
 * Manages the detection of DOM elements entering the viewport and
 * applies animation classes to them.
 * 
 * @module scroll-observer
 */

let scrollObserver = null;

/**
 * Initializes or resets the global IntersectionObserver for scroll animations.
 * Disconnects any existing observer before creating a new one.
 * 
 * @returns {void}
 */
export function initScrollObserver() {
  if (scrollObserver) {
    scrollObserver.disconnect();
  }
  
  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
}

/**
 * Observes all elements with the `.animate-on-scroll` class within a given container.
 * 
 * @param {HTMLElement} container - The DOM container to search for animatable elements.
 * @returns {void}
 */
export function observeScrollElements(container) {
  if (!scrollObserver) return;
  const elements = container.querySelectorAll('.animate-on-scroll');
  elements.forEach(el => scrollObserver.observe(el));
}
