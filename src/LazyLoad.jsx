import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import inViewport from './utils/inViewport';

export default class LazyLoad extends Component {
  constructor(props) {
    super(props);

    this.handleVisibility = this.handleVisibility.bind(this);
    this.lazyLoadHandler = this.lazyLoadHandler.bind(this);

    if (props.throttle > 0) {
      if (props.debounce) {
        this.lazyLoadHandler = debounce(this.lazyLoadHandler, props.throttle);
      } else {
        this.lazyLoadHandler = throttle(this.lazyLoadHandler, props.throttle);
      }
    }

    this.checkingVisibility = false;
    this.visible = false;
    this.state = { visible: false };
  }

  componentDidMount() {
    this.mounted = true;
    const eventNode = this.getEventNode();

    this.lazyLoadHandler();

    if (this.lazyLoadHandler.flush) {
      this.lazyLoadHandler.flush();
    }

    window.addEventListener('resize', this.lazyLoadHandler);
    eventNode.addEventListener('scroll', this.lazyLoadHandler);
    eventNode.addEventListener('touchmove', this.lazyLoadHandler);
    eventNode.addEventListener('transitionend', this.lazyLoadHandler);
  }

  componentWillReceiveProps() {
    if (!this.state.visible) this.lazyLoadHandler();
  }

  shouldComponentUpdate(_nextProps, nextState) {
    return nextState.visible;
  }

  componentWillUnmount() {
    this.mounted = false;
    if (this.lazyLoadHandler.cancel) {
      this.lazyLoadHandler.cancel();
    }

    this.detachListeners();
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

  lazyLoadHandler() {
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

    this.lazyLoadHandler.cancel();
    this.detachListeners();
  }

  detachListeners() {
    const eventNode = this.getEventNode();

    window.removeEventListener('resize', this.lazyLoadHandler);
    eventNode.removeEventListener('scroll', this.lazyLoadHandler);
    eventNode.removeEventListener('touchmove', this.lazyLoadHandler);
    eventNode.removeEventListener('transitionend', this.lazyLoadHandler);
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
