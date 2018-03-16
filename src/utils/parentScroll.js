import { getOverflowValues } from './fastdom';
// DEPRECATED
const scrollParent = async element => {
  if (!(element instanceof HTMLElement)) {
    return window;
  }

  let parent = element;

  while (parent) {
    if (parent === document.body || parent === document.documentElement) {
      break;
    }

    if (!parent.parentNode) {
      break;
    }

    const { overflow, overflowX, overflowY } = await getOverflowValues(element);

    if (/(scroll|auto)/.test(`${overflow}${overflowX}${overflowY}`)) {
      return parent;
    }

    parent = parent.parentNode;
  }

  return window;
};

export default scrollParent;
