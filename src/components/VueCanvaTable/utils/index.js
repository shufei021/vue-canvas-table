/*
 * @Description: 辅助函数
 * @Author: shufei
 * @Date: 2022-06-28 15:13:48
 * @LastEditTime: 2022-06-28 15:24:28
 * @LastEditors: shufei
 */
export const throttle = function (wait, func, options) {
  let timeout, context, args
  let old = 0 // 之前的时间
  if (!options) options = {}
  return function () {
    context = this
    args = arguments
    // 获取当前的时间戳
    const now = new Date().valueOf()
    if (options.leading === false && !old) {
      old = now
    }
    if (now - old > wait) {
      // 第一次会立即执行
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      func.apply(context, args)
      old = now
    } else if (!timeout && options.trailing !== false) {
      // 最后一次也会执行
      timeout = setTimeout(() => {
        old = new Date().valueOf()
        timeout = null
        func.apply(context, args)
      }, wait)
    }
  }
}
export const debounce = function (func, wait, immediate) {
  let timeout
  const debounced = function () {
    // 保存参数
    const arg = arguments
    // 保存 this
    const context = this
    // 如果 定时器 timeout 存在，就清除
    if (timeout) clearTimeout(timeout)
    // 如果立即触发
    if (immediate) {
      // callNow 变量 // true
      const callNow = !timeout
      // 定时器 wait 时间后 timeout 赋值为null
      timeout = setTimeout(function () {
        timeout = null
      }, wait)
      // 此时 callNow 为 true，直接只需回调函数 func
      if (callNow) func.apply(context, arg)
    } else {
      // 正常触发
      timeout = setTimeout(function () {
        func.apply(context, arg)
      }, wait)
    }
  }
  debounced.cancel = function () {
    clearTimeout(timeout)
    timeout = null
  }
  return debounced
}
