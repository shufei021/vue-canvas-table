/*
 * @Description: 全局公共混入
 * @Author: shufei
 * @Date: 2022-08-09 09:20:18
 * @LastEditTime: 2022-08-09 09:56:21
 * @LastEditors: shufei
 */
export default {
  data () {
    return {

    }
  },
  methods: {
    /**
     * 隐藏 tip 框
     */
    hideTip(){
      this.tooltip = ''
      this.tooltipStyle = {
        left:'-10000px',
        top:'-10000px'
      }
    },
    /**
     * @description 显示 tip 框
     * @param {String} content 显示的内容
     * @param {Number} left tip 框的 x 坐标值
     * @param {Number} top tip 框的 y 坐标值
     * @param {Boolean} isEmit 是否触发 tip 事件给父组件
     */
    showTip(content,left,top,isEmit=false){
      this.tooltip = content || ''
      this.tooltipStyle = {
        left: left + "px",
        top: top + "px"
      }
      isEmit &&  this.$emit("cellEllipsis")
    },

    /**
     * @description 根据class类获取到对应的元素
     * @param {Element} el
     * @param {String} className
     * @return Element || Null
     */
    getElementByClassName(el, className) {
      // 如果当前DOM身上存在传入的class类，直接返回该元素
      if (el.classList.contains(className)) return el
      // 查询该元素的父节点
      let p = el.parentNode
      // 自内向外循环查询每一层的父节点身上是否包含传入的class类
      while (true) {
        // 如果 查询到顶端，即document了，直接返回 null，未查询到
        if (!p.classList) return null
        // 如果查询到了，就返回该元素
        if (p.classList.contains(className)) return p
        // 父节点变量随着查询过程，不断更改为父节点
        p = p.parentNode
      }
    },
  }
}
