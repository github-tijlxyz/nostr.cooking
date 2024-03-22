/** Dispatch event on click outside of node */
export function clickOutside(node: any) {
  // eslint-disable-line
  const handleClick = (event: any) => {
    // eslint-disable-line
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      node.dispatchEvent(new CustomEvent('click_outside', node));
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
}
