import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';
import { add, remove } from 'eventlistener';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import inViewport from './utils/inViewport';

export default class LazyLoad extends Component {
  constructor(props) {
    super(props);

    this.lazyLoadHandler = this.lazyLoadHandler.bind(this);

    if (props.throttle > 0) {
      if (props.debounce) {
        this.lazyLoadHandler = debounce(this.lazyLoadHandler, props.throttle);
      } else {
        this.lazyLoadHandler = throttle(this.lazyLoadHandler, props.throttle);
      }
    }

    this.state = { visible: false };
  }

  componentDidMount() {
    this._mounted = true;
    const eventNode = this.getEventNode();

    this.lazyLoadHandler();

    if (this.lazyLoadHandler.flush) {
      this.lazyLoadHandler.flush();
    }

    add(window, 'resize', this.lazyLoadHandler);
    add(eventNode, 'scroll', this.lazyLoadHandler);
    add(eventNode, 'touchmove', this.lazyLoadHandler);
    add(eventNode, 'transitionend', this.lazyLoadHandler);
  }

  componentWillReceiveProps() {
    if (!this.state.visible) {
      this.lazyLoadHandler();
    }
  }

  shouldComponentUpdate(_nextProps, nextState) {
    return nextState.visible;
  }

  componentWillUnmount() {
    this._mounted = false;
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
      offset, offsetVertical, offsetHorizontal,
      offsetTop, offsetBottom, offsetLeft, offsetRight, threshold,
    } = this.props;

    const _offsetAll = threshold || offset;
    const _offsetVertical = offsetVertical || _offsetAll;
    const _offsetHorizontal = offsetHorizontal || _offsetAll;

    return {
      top: offsetTop || _offsetVertical,
      bottom: offsetBottom || _offsetVertical,
      left: offsetLeft || _offsetHorizontal,
      right: offsetRight || _offsetHorizontal,
    };
  }

  async lazyLoadHandler() {
    if (!this._mounted) {
      return;
    }
    const offset = this.getOffset();
    const eventNode = this.getEventNode();

    if (await inViewport(this.node, eventNode, offset)) {
      const { onContentVisible } = this.props;

      this.setState({ visible: true }, () => {
        if (onContentVisible) {
          onContentVisible();
        }
      });
      this.detachListeners();
    }
  }

  detachListeners() {
    const eventNode = this.getEventNode();

    remove(window, 'resize', this.lazyLoadHandler);
    remove(eventNode, 'scroll', this.lazyLoadHandler);
    remove(eventNode, 'touchmove', this.lazyLoadHandler);
    remove(eventNode, 'transitionend', this.lazyLoadHandler);
  }

  render() {
    const { children, className, height, width, elementType: Element } = this.props;
    const { visible } = this.state;

    const elStyles = { height, width };
    const elClasses = `LazyLoad${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`;

    return (
      <Element
        className={elClasses}
        ref={node => { this.node = node; }}
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
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  offset: PropTypes.number,
  offsetBottom: PropTypes.number,
  offsetHorizontal: PropTypes.number,
  offsetLeft: PropTypes.number,
  offsetRight: PropTypes.number,
  offsetTop: PropTypes.number,
  offsetVertical: PropTypes.number,
  threshold: PropTypes.number,
  throttle: PropTypes.number,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  onContentVisible: PropTypes.func,
};

LazyLoad.defaultProps = {
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
