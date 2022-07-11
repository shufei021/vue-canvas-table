/*
 * @Description:
 * @Author: shufei
 * @Date: 2022-06-28 15:38:47
 * @LastEditTime: 2022-07-11 10:09:25
 * @LastEditors: shufei
 */
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Antd from 'ant-design-vue';
import util from "rutilsjs"
import 'ant-design-vue/dist/antd.css'
Vue.config.productionTip = false

Vue.use(Antd);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

Vue.prototype.util = util
