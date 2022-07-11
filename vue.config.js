/*
 * @Description:
 * @Author: shufei
 * @Date: 2022-07-11 09:52:43
 * @LastEditTime: 2022-07-11 10:07:09
 * @LastEditors: shufei
 */
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: []
    }
  },
  css: {
    loaderOptions: {
      less: {
        // DO NOT REMOVE THIS LINE
        javascriptEnabled: true
      }
    }
  },
})
