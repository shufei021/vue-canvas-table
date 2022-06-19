/*
 * @Description:
 * @Author: shufei
 * @Date: 2019-12-08 00:30:40
 * @LastEditTime: 2022-06-18 18:51:20
 * @LastEditors: shufei021 1017981699@qq.com
 */
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})
