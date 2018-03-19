React Lazy Please - LazyLoad Component
=========================

React Lazy Please is a fork of [React Lazy Load](https://github.com/loktar00/react-lazy-load), an easy to use React component which helps you defer loading content in predictable way.

This fork uses [fastdom](https://github.com/wilsonpage/fastdom) to get the values of the css properties and avoid possible layout/reflow trashing.

Also, visibility of lazy load components is calculated using `window` as reference by default. You can also use component inside scrolling container, such as div with scrollbar, but if you want to do that, the container element must be explicitly defined through the `container` prop.

## Installation
React Lazy Load requires **React 0.14 or later.**

```
npm install --save react-lazy-please
```

## Examples
* [Basic](https://github.com/DAreRodz/react-lazy-please/tree/master/examples/basic)

## Usage

```jsx
import React from 'react';
import LazyLoad from 'react-lazy-please';

const MyComponent = () => (
  <div>
    Scroll to load images.
    <div className="filler" />
    <LazyLoad height={762} offsetVertical={300}>
      <img src='http://apod.nasa.gov/apod/image/1502/HDR_MVMQ20Feb2015ouellet1024.jpg' />
    </LazyLoad>
    <div className="filler" />
    <LazyLoad height={683} offsetTop={200}>
      <img src='http://apod.nasa.gov/apod/image/1502/2015_02_20_conj_bourque1024.jpg' />
    </LazyLoad>
    <div className="filler" />
    <LazyLoad height={480} offsetHorizontal={50}>
      <img src='http://apod.nasa.gov/apod/image/1502/MarsPlume_jaeschke_480.gif' />
    </LazyLoad>
    <div className="filler" />
    <LazyLoad
      height={720}
      onContentVisible={() => console.log('look ma I have been lazyloaded!')}
    >
      <img src='http://apod.nasa.gov/apod/image/1502/ToadSky_Lane_1080_annotated.jpg' />
    </LazyLoad>
    <div className="filler" />
  </div>
);
```

## Props

#### offset
Type: `Number|String` Default: `0`

Aliases: `threshold`

The `offset` option allows you to specify how far below, above, to the left, and to the right of the viewport you want to _begin_ displaying your content. If you specify `0`, your content will be displayed as soon as it is visible in the viewport, if you want to load _1000px_ below or above the viewport, use `1000`.

#### offsetVertical
Type: `Number|String` Default: `offset`'s value

The `offsetVertical` option allows you to specify how far above and below the viewport you want to _begin_ displaying your content.

#### offsetHorizontal
Type: `Number|String` Default: `offset`'s value

The `offsetHorizontal` option allows you to specify how far to the left and right of the viewport you want to _begin_ displaying your content.

#### offsetTop
Type: `Number|String` Default: `offsetVertical`'s value

The `offsetTop` option allows you to specify how far above the viewport you want to _begin_ displaying your content.

#### offsetBottom
Type: `Number|String` Default: `offsetVertical`'s value

The `offsetBottom` option allows you to specify how far below the viewport you want to _begin_ displaying your content.

#### offsetLeft
Type: `Number|String` Default: `offsetVertical`'s value

The `offsetLeft` option allows you to specify how far to left of the viewport you want to _begin_ displaying your content.

#### offsetRight
Type: `Number|String` Default: `offsetVertical`'s value

The `offsetRight` option allows you to specify how far to the right of the viewport you want to _begin_ displaying your content.

#### throttle
Type: `Number|String` Default: `250`

The throttle is managed by an internal function that prevents performance issues from continuous firing of `scroll` events. Using a throttle will set a small timeout when the user scrolls and will keep throttling until the user stops. The default is `250` milliseconds.

#### debounce
Type: `Boolean` Default: `true`

By default the throttling function is actually a [debounce](https://lodash.com/docs#debounce) function so that the checking function is only triggered after a user stops scrolling. To use traditional throttling where it will only check the loadable content every `throttle` milliseconds, set `debounce` to `false`.

#### height
Type: `String|Number`

The `height` option allows you to set the element's height even when it has no content.

#### width
Type: `String|Number`

The `width` option allows you to set the element's width even when it has no content.

#### onContentVisible
Type `Function`

A callback function to execute when the content appears on the screen.

### container
Type `Element|Window`

A reference to a DOM element used for calculating visibility of LazyLoad components.
The default is `window`.
