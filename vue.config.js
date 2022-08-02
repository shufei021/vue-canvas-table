/*
 * @Description:
 * @Author: shufei
 * @Date: 2022-07-11 09:52:43
 * @LastEditTime: 2022-07-29 16:14:45
 * @LastEditors: shufei
 */
const { defineConfig } = require('@vue/cli-service')
const OSNetWorkInterfaces = require('os').networkInterfaces() // 获取网络地址
module.exports = defineConfig({
  devServer:{
    host: '0.0.0.0',
    public: `${OSNetWorkInterfaces[Object.keys(OSNetWorkInterfaces)[0]][1].address}:8080`,

  },
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
