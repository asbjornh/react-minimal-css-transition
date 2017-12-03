import React from "react";
import PropTypes from "prop-types";

const transitionStates = {
  beforeEnter: "before-enter",
  entering: "entering",
  beforeLeave: "before-leave",
  leaving: "leaving"
};

function cn(...classNames) {
  return [...classNames].filter(className => !!className).join(" ");
}

class TinyTransition extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.bool]),
    classNames: PropTypes.shape({
      beforeEnter: PropTypes.string,
      entering: PropTypes.string,
      beforeLeave: PropTypes.string,
      leaving: PropTypes.string
    }),
    duration: PropTypes.number.isRequired
  };

  state = {
    children: this.props.children,
    transitionState: "",
    transitionClassNames: Object.assign(
      {},
      transitionStates,
      this.props.classNames
    )
  };

  timer;

  getClassName = transitionState => {
    const {
      beforeEnter,
      entering,
      beforeLeave,
      leaving
    } = this.state.transitionClassNames;

    switch (transitionState) {
      case transitionStates.beforeEnter:
        return beforeEnter;
      case transitionStates.entering:
        return cn(beforeEnter, entering);
      case transitionStates.beforeLeave:
        return beforeLeave;
      case transitionStates.leaving:
        return cn(beforeLeave, leaving);
      default:
        return "";
    }
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      const { beforeEnter, entering, beforeLeave, leaving } = transitionStates;

      if (nextProps.children) {
        // Element is about to mount
        this.setState(
          {
            children: nextProps.children,
            transitionState: beforeEnter
          },
          () => {
            setTimeout(() => {
              this.setState({ transitionState: entering }, () => {
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                  this.setState({ transitionState: "" });
                }, this.props.duration);
              });
            }, 16);
          }
        );
      } else {
        // Element is about to unmount
        this.setState({ transitionState: beforeLeave }, () => {
          setTimeout(() => {
            this.setState({ transitionState: leaving }, () => {
              clearTimeout(this.timer);
              this.timer = setTimeout(() => {
                this.setState({
                  children: nextProps.children,
                  transitionState: ""
                });
              }, this.props.duration);
            });
          }, 16);
        });
      }
    }
  }

  render() {
    const child = this.state.children;
    const childClass = (child && child.props && child.props.className) || "";

    return !child || child.length > 1
      ? null
      : React.cloneElement(child, {
          className: cn(
            childClass,
            this.getClassName(this.state.transitionState)
          )
        });
  }
}

export default TinyTransition;