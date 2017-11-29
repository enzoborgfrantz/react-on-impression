import React, { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';

export default class TrackVisibility extends Component {
  static propTypes = {
    /**
     * Define if the visibility need to be tracked once
     */
    once: PropTypes.bool,

    /**
     * Tweak the throttle interval
     * Check https://css-tricks.com/debouncing-throttling-explained-examples/ for more details
     */
    throttleInterval(props, propName, component) {
      const currentProp = props[propName];
      if (!Number.isInteger(currentProp) || currentProp < 0) {
        return new Error(
          `The ${propName} prop you provided to ${
            component
          } is not a valid integer >= 0.`
        );
      }
      return null;
    },
    /**
     * Pass one or more children to track
     */
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
    ]),
    /**
     * Define an offset. Can be useful for lazy loading
     */
    offset: PropTypes.number,

    /**
     * Update the visibility state as soon as a part of the tracked component is visible
     */
    partialVisibility: PropTypes.bool,
  };

  static defaultProps = {
    once: false,
    throttleInterval: 150,
    offset: 0,
    children: null,
    partialVisibility: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
    };
    this.throttleCb = throttle(
      this.isComponentVisible,
      this.props.throttleInterval
    );
  }

  componentDidMount() {
    this.attachListener();
    this.isComponentVisible();
  }

  componentWillUnmount() {
    this.removeListener();
  }

  attachListener() {
    window.addEventListener('scroll', this.throttleCb);
    window.addEventListener('resize', this.throttleCb);
  }

  removeListener() {
    window.removeEventListener('scroll', this.throttleCb);
    window.removeEventListener('resize', this.throttleCb);
  }

  isComponentVisible = () => {
    const html = document.documentElement;
    const { offset, partialVisibility, once, onImpression } = this.props;
    const {
      top,
      left,
      bottom,
      right,
      width,
      height,
    } = this.nodeRef.getBoundingClientRect();
    const heightCheck =
      window.innerHeight + offset || html.clientHeight + offset;
    const widthCheck = window.innerWidth + offset || html.clientWidth + offset;

    const isVisible = partialVisibility
      ? top + height >= 0 && left + width >= 0 && right - width <= widthCheck
      : top >= 0 && left >= 0 && bottom <= heightCheck && right <= widthCheck;

    if (isVisible) {
      onImpression();
      once && this.removeListener();
    }
  };

  render() {
    return (
      <div ref={ref => (this.nodeRef = ref)} {...this.props}>
        {this.props.children}
      </div>
    );
  }
}
