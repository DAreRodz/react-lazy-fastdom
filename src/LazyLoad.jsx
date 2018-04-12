import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import inViewport from './utils/inViewport';

export default class LazyLoad extends Component {
  static lazyMap = new Map();

  static createHandler(container, key, th, db) {
    if (th <= 0) return;
    const handleAttached = () => {
      const { attached } = LazyLoad.lazyMap.get(container)[key];
      attached.forEach(lazy => lazy.checkVisibility());
    };

    const handler = (db ? debounce : throttle)(handleAttached, th);
    const attached = [];

    const object = { handler, attached };

    if (!LazyLoad.lazyMap.has(container)) LazyLoad.lazyMap.set(container, {});
    LazyLoad.lazyMap.get(container)[key] = object;

    window.addEventListener('resize', handler);
    container.addEventListener('scroll', handler);
    container.addEventListener('touchmove', handler);
    container.addEventListener('transitionend', handler);
  }

  static removeHandler(container, key) {
    const { handler } = LazyLoad.lazyMap.get(container)[key];

    handler.cancel();

    window.removeEventListener('resize', handler);
    container.removeEventListener('scroll', handler);
    container.removeEventListener('touchmove', handler);
    container.removeEventListener('transitionend', handler);

    delete LazyLoad.lazyMap.get(container)[key];
  }

  static getKey(lazy) {
    const { throttle: th, debounce: db } = lazy.props;
    return `${th}_${db}`;
  }

  static attachLazyLoad(lazy) {
    const { throttle: th, debounce: db } = lazy.props;
    const key = LazyLoad.getKey(lazy);
    const container = lazy.getEventNode();

    if (!LazyLoad.lazyMap.has(container) || !LazyLoad.lazyMap.get(container)[key]) {
      LazyLoad.createHandler(container, key, th, db);
    }

    LazyLoad.lazyMap.get(container)[key].attached.push(lazy);
  }

  static detachLazyLoad(lazy) {
    const key = LazyLoad.getKey(lazy);
    const container = lazy.getEventNode();
    const obj = LazyLoad.lazyMap.get(container)[key];
    obj.attached = obj.attached.filter(a => a !== lazy);
    if (obj.attached.length === 0) LazyLoad.removeHandler(container, key);
  }

  constructor(props) {
    super(props);

    this.handleVisibility = this.handleVisibility.bind(this);

    this.checkingVisibility = false;
    this.visible = false;
    this.state = { visible: false };
  }

  componentDidMount() {
    this.mounted = true;
    LazyLoad.attachLazyLoad(this);
  }

  shouldComponentUpdate(_nextProps, nextState) {
    return nextState.visible;
  }

  componentWillUnmount() {
    this.mounted = false;
    LazyLoad.detachLazyLoad(this);
  }

  getEventNode() {
    return this.props.container || window; // parentScroll(this.node);
  }

  getOffset() {
    const {
      offset,
      offsetVertical,
      offsetHorizontal,
      offsetTop,
      offsetBottom,
      offsetLeft,
      offsetRight,
      threshold,
    } = this.props;

    const offsetAll = threshold || offset;

    return {
      top: offsetTop || offsetVertical || offsetAll,
      bottom: offsetBottom || offsetVertical || offsetAll,
      left: offsetLeft || offsetHorizontal || offsetAll,
      right: offsetRight || offsetHorizontal || offsetAll,
    };
  }

  checkVisibility() {
    if (!this.mounted || this.checkingVisibility) return;
    const offset = this.getOffset();
    const eventNode = this.getEventNode();
    this.checkingVisibility = true;
    inViewport(this.node, eventNode, offset).then(this.handleVisibility);
  }

  handleVisibility(visible) {
    const { onContentVisible } = this.props;

    this.checkingVisibility = false;

    if (!visible || this.visible) return;
    this.visible = true;

    this.setState({ visible: true }, () => onContentVisible && onContentVisible());

    LazyLoad.detachLazyLoad(this);
  }

  render() {
    const { children, className, height, width, elementType: Element } = this.props;
    const { visible } = this.state;

    const elStyles = { height, width };
    const elClasses = `LazyLoad${visible ? ' is-visible' : ''}${
      className ? ` ${className}` : ''
    }`;

    return (
      <Element
        className={elClasses}
        ref={node => {
          this.node = node;
        }}
        style={elStyles}
      >
        {visible && Children.only(children)}
      </Element>
    );
  }
}

LazyLoad.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  container: PropTypes.any,
  debounce: PropTypes.bool,
  elementType: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  offset: PropTypes.number,
  offsetBottom: PropTypes.number,
  offsetHorizontal: PropTypes.number,
  offsetLeft: PropTypes.number,
  offsetRight: PropTypes.number,
  offsetTop: PropTypes.number,
  offsetVertical: PropTypes.number,
  threshold: PropTypes.number,
  throttle: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onContentVisible: PropTypes.func,
};

LazyLoad.defaultProps = {
  className: null,
  container: null,
  height: null,
  width: null,
  threshold: 0,
  onContentVisible: null,
  elementType: 'div',
  debounce: true,
  offset: 0,
  offsetBottom: 0,
  offsetHorizontal: 0,
  offsetLeft: 0,
  offsetRight: 0,
  offsetTop: 0,
  offsetVertical: 0,
  throttle: 250,
};
