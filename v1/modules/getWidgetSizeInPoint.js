/* getWidgetSizeInPoint.js
 * This script is written by swenhayashi
 * https://talk.automators.fm/t/get-available-widget-height-and-width-depending-on-the-devices-screensize/9258/5
*/
function getWidgetSizeInPoint(widgetSize = (config.runsInWidget ? config.widgetFamily : null)) {
  // RegExp to verify widgetSize
  const sizes = /^(?:small|medium|large)$/
  // stringify device screen size
  const devSize = (({width: w, height: h}) => w > h ? `${h}x${w}` : `${w}x${h}`)(Device.screenSize())
  // screen size to widget size mapping for iPhone, excluding the latest iPhone 12 series. iPad size
  const sizeMap = {
    // iPad Mini 2/3/4, iPad 3/4, iPad Air 1/2. 9.7" iPad Pro
    // '768x1024': { small: [0, 0], medium: [0, 0], large: [0, 0] },
    // 10.2" iPad
    // '810x1080': { small: [0, 0], medium: [0, 0], large: [0, 0] },
    // 10.5" iPad Pro, 10.5" iPad Air 3rd Gen
    // '834x1112': { small: [0, 0], medium: [0, 0], large: [0, 0] },
    // 10.9" iPad Air 4th Gen
    // '820x1180': { small: [0, 0], medium: [0, 0], large: [0, 0] },
    // 11" iPad Pro
    '834x1194': { small: [155, 155], medium: [329, 155], large: [345, 329] },
    // 12.9" iPad Pro
    '1024x1366': { small: [170, 170], medium: [332, 170], large: [382, 332] },
    // 12 Pro Max
    // '428x926': { small: [0, 0], medium: [0, 0], large: [0, 0] },
    // XR, 11, 11 Pro Max
    '414x896': { small: [169, 169], medium: [360, 169], large: [360, 376] },
    // 12, 12 Pro
    // '390x844': { small: [0, 0], medium: [0, 0], large: [0, 0] },
    // X, XS, 11 Pro, 12 Mini
    '375x812': { small: [155, 155], medium: [329, 155], large: [329, 345] },
    // 6/7/8(S) Plus
    '414x736': { small: [159, 159], medium: [348, 159], large: [348, 357] },
    // 6/7/8(S) and 2nd Gen SE
    '375x667': { small: [148, 148], medium: [322, 148], large: [322, 324] },
    // 1st Gen SE
    '320x568': { small: [141, 141], medium: [291, 141], large: [291, 299] }
  }
  let widgetSizeInPoint = null

  if (widgetSize && sizes.test(widgetSize)) {
    let mappedSize = sizeMap[devSize]
    if (mappedSize) {
      widgetSizeInPoint = new Size(...mappedSize[widgetSize])
    }
  }
  return widgetSizeInPoint
}

module.exports = getWidgetSizeInPoint;