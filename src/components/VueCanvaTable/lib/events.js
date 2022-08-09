/**
 * @description :  事件处理
 * mousedown   --- 鼠标按下
 * mouseup     --- 鼠标松开
 * mousemove   --- 鼠标移动
 * resize      --- 窗口缩放
 * mousewheel  --- 滚轮滚动
 * keydown     --- 键盘按下
 * keyup       --- 键盘松开
 */


import { throttle, debounce } from "../utils"
import utils from "rutilsjs";
import {hoverAddAndReduceCell} from "../components/sort"
export default {
  data () {
    return {
      rowFocus: null,
      // 窗口缩放比
      pixelRatio: 1,
      shiftDown: false,
      ctrlDown: false
    }
  },
  mounted () {
    this.pixelRatio = window.devicePixelRatio
  },
  methods: {
    /**
     * @description 移除监听事件
     */
    removeEvent () {
      // 鼠标按下
      window.removeEventListener('mousedown', this.handleMousedown, false)
      // 鼠标松开
      window.removeEventListener('mouseup', this.handleMouseup, false)
      // 鼠标移动
      window.removeEventListener('mousemove', this.mousemove, true)
      // 键盘按下
      window.removeEventListener('keydown', this.handleKeydown, false)
      // 键盘松开
      window.removeEventListener('keyup', this.handleKeyup, false)
      // 窗口变化
      window.removeEventListener('resize', this.handleResize, false)
      // 滑轮滚动
      window.removeEventListener('mousewheel', this.handleWheel)
      // canvas 鼠标点击
      this.$refs.canvas.removeEventListener('click', this.handleClick, false)
      // 鼠标右键
      this.$refs.canvas.removeEventListener('contextmenu',this.handleContextmenu,false)
    },


    /**
     * @description 初始化监听事件
     */
    initEvent () {
      this.mousemove = throttle(16, this.handleMousemove)
       // 鼠标按下
      window.addEventListener('mousedown', this.handleMousedown, false)
      // 鼠标松开
      window.addEventListener('mouseup', this.handleMouseup, false)
      // 鼠标移动
      window.addEventListener('mousemove', this.mousemove, true)
      // 键盘按下
      window.addEventListener('keydown', this.handleKeydown, false)
       // 键盘松开
      window.addEventListener('keyup', this.handleKeyup, false)
      // 窗口变化
      window.addEventListener('resize', this.handleResize, false)
      // 滑轮滚动
      window.addEventListener('mousewheel', this.handleWheel, {passive: false})
      // canvas 鼠标点击
      this.$refs.canvas.addEventListener('click', this.handleClick, false)
      // 鼠标右键
      this.$refs.canvas.addEventListener('contextmenu',this.handleContextmenu,false)
    },

    /**
     *
     * @description window 鼠标按下 事件
     * 1. 自定义组件 cell
     * 2. 编辑输入框 cell
     * 3. 统计输入框 cell
     */
    handleMousedown ({target, offsetX:x, offsetY: y }) {
      this.mousedownTarget = target
      if(!this.getElementByClassName(target,'excel-table')){
        setTimeout(() => {
          this.isFocus = false
          this.focusCell = null
          this.rePainted()
          this.hideInput()
          this.isTotalVisible = false
        })
        return
      }
       // 如果鼠标按需的事件对象不属于 有效的 dom范围内 就隐藏输入框
      // const input = this.getElementByClassName(target,'input-content')

      // if(!input){
      //   this.hideInput()
      // }

      this.save()
      this.isDown = true
      if (target.tagName === 'CANVAS') {
        setTimeout(() => {
          this.isDown = true
          this.hideInput()
          if (x > this.originPoint.x && y > this.rowHeight && x < this.maxPoint.x) {
            const cell = this.getCellAt(x, y)
            if (cell && y<this.maxPoint.y) {
              this.focusCell = cell
              this.rowFocus = {
                cellX: cell.x,
                cellY: cell.y,
                rowIndex: this.focusCell.rowIndex,
                offset: { ...this.offset }
              }
              this.paintFocusCell(cell)
              this.$emit('focus', cell.rowData, cell)
            } else if(cell && y>this.maxPoint.y) {
              this.isFocus = false
              this.focusCell = null
              this.rePainted()
            }
            if(!cell ||  (cell && (cell.column.isImage || cell.column.isCheckbox || cell.column.disabled)) ){
              try {
                this.$refs.input.id= ''
                this.$refs.customInput.id = ''
              } catch (e) {
              }
              this.isFocus = false
            }

          } else {
            this.isFocus = false
            this.focusCell = null
            this.rePainted()
          }
        }, 0)
        if(this.lineCell){
          this.cloumnLineStyle.left = this.i(evt.offsetX) + 'px'
        }
      } else if (target.classList.contains) {
        this.isVisible = false
      } else if (!target.classList.contains('input-content') && !target.parentNode.classList.contains('footer') && this.isFocus) {
        this.isFocus = false
        this.focusCell = null
      } else {
        this.isVisible = false
      }
    },

    /**
     *
     * @description 鼠标松开
     *
     */
    handleMouseup (e) {
      this.mousedownTarget = null
      // 如果列宽目标列 存在 并且是鼠标按下的状态
      if(this.lineCell && this.isDown){
        const { x, width, key } = this.lineCell
        const diff = this.i(parseInt(this.cloumnLineStyle.left) - x - width)
        const dispalyCloumnItem = this.displayColumns.find(i=>i.key === key)
        const allCloumnItem = this.allColumns.find(i=>i.key === key)
        if(dispalyCloumnItem && allCloumnItem) {
          const item = this.columns.find(i=>i.key == key)
          if(item) item.width = item.width + diff
          this.$emit('columnWidthChanged',{key,diff} )
        }
      }
      // 重置列宽虚线为隐藏
      this.cloumnLineStyle.left =  '-10000px!important'
      // 重置按下标识为false
      this.isDown = false
      // 重置横向移动标识为false
      this.horizontalBar.move = false
      // 重置纵向移动标识为false
      this.verticalBar.move = false

      this.sortCell = null
      if(e.target && e.target.tagName!== 'CANVAS'){
        this.isFocus = false
      }
      this.keepMove()
    },

    /**
     * @description 鼠标移动
     */
    handleMousemove:debounce(function (evt) {
      const eX = evt.offsetX
      const eY = evt.offsetY
      // 鼠标hover在canvas
      if(evt.target.tagName === 'CANVAS') {
        if(eY>0 && eY<this.rowHeight){
          if(this.hoverCell || this.rowHover){
            this.hoverCell = null;
            this.rowHover = null;
            this.hoverCheckboxCell = null;
            this.rePainted();
            return
          }
        }
        // hover + -
        hoverAddAndReduceCell.call(this,eX,eY)
        // 列宽
        if(this.lineCell && this.isDown) {
          this.cloumnLineStyle.left = (this.i(evt.offsetX)===-1? this.cloumnLineStyle.left : this.i(evt.offsetX)) + 'px'
          return
        }
        // 表格左上角图标如果被鼠标移上去了，就改变手型为手型，否则就改为默认
        const x = evt.offsetX
        const y = evt.offsetY
        const sx = (this.serialWidth - this.settingWidth) / 2
        const ex = sx + this.settingWidth
        const sy = (this.rowHeight - this.settingHeight) / 2
        const ey = sy + this.settingHeight
        const headerCell = this.getHeadCellAt(x, y,evt)
        const lineCell = this.getHeaderLineCell(eX, eY)
        if ((x > sx && x < ex && y > sy && y < ey) || headerCell) {
          document.querySelector('.excel-table').style.cursor = 'pointer'
          if(headerCell){
            this.paintHeaderSortCellHover(headerCell)
          }else{
            this.sortCell = null
          }
          if(!(this.lineCell && this.isDown))this.lineCell = null
        }else if(lineCell && !this.isDown){
          this.lineCell = lineCell
          document.querySelector('.excel-table').style.cursor = 'col-resize'
        } else {
          const cell = this.getCellAt( eX, eY)
          if(cell){
            if (
              cell.column.isImage &&
              cell.rowData &&
              cell.rowData.image &&
              cell.rowData.image.state
            ) { // 图片 hover 效果
              this.previeUrl = cell.rowData.goodsPreview
              this.previeStyle = {
                left: cell.x + Math.round(cell.width / 2) - 10 + "px",
                top: cell.y + Math.round(cell.height / 2) - 10 + "px"
              }
            } else if (
              cell.column.isCheckbox
            ) { // 复选框 单元格对象
              if (
                x >= cell.x + (cell.width - 20) / 2 &&
                x <= cell.x + cell.width / 2 + 10 &&
                y >= cell.y - 10 &&
                y <= cell.y + cell.height / 2 + 10
              ) {
                this.hoverCheckboxCell = cell;
              } else {
                this.hoverCheckboxCell = null;
              }
            } else { // 图片预览重置
              this.previeUrl = "";
              this.previeStyle = {
                left: "-10000px",
                top: "-10000px"
              }
              this.hoverCheckboxCell = null;
            }
          }
          this.sortCell = null
          if(!(this.lineCell && this.isDown)) this.lineCell = null
          if(!(this.lineCell && this.isDown)) document.querySelector('.excel-table').style.cursor = 'default'
        }


        // row 的 hover 效果
        this.HoverRow(evt)

        // 表头前面图标hover
        const headerCellInfo = this.getHeadColumnCell(evt)
        if(
          headerCellInfo &&
          headerCellInfo.tip&&
          x >= headerCellInfo.tip.point.x&&
          x<= headerCellInfo.tip.point.x + headerCellInfo.tip.size&&
          y>= headerCellInfo.tip.point.y&&
          y<= headerCellInfo.tip.point.y + headerCellInfo.tip.size
        ){
          this.tooltip = headerCellInfo.tip.desc
          this.tooltipStyle.left = this.i(headerCellInfo.tip.point.x + headerCellInfo.tip.size/2) + 'px'
          this.tooltipStyle.top = this.i(headerCellInfo.tip.point.y + headerCellInfo.tip.size-2) + 'px'
        }else{
          this.hideTip()
        }

        /**
         * 单元格 超出省略号
         */
        if(!this.isFocus){
          const cell = this.getCellAt(x,y)
          if(cell){
            // 如果是图片、复选框、禁止点击
            if(cell.column.isImage || cell.column.isCheckbox) {
              try {
                this.$refs.input.id= ''
                this.$refs.customInput.id = ''
              } catch (error) {
              }
              return
            }
            // 原文本和处理后的文本不一致，则是超出省略了
            if (
              cell.paintText &&
              cell.paintText[1] &&
              cell.paintText[1] !== cell.rowData[cell.key]
            ) {
              this.showTip(cell.content,cell.x + cell.width / 2,cell.y + cell.height - 4,true)
            } else {
              this.hideTip()
            }
          }
        }else{
          this.hoverCell = null;
          this.rowHover = null;
          this.rePainted()
        }
      }else{
        // 隐藏 提示框
        this.tooltip = ''
        this.tooltipStyle = {
          left:'-10000px',
          top:'-10000px'
        }
        if(this.hoverCell || this.rowHover){
          this.hoverCell = null;
          this.rowHover = null;

          this.rePainted();
        }
      }

      if(this.isDown && this.isFocus && evt.target.tagName!== 'CANVAS'){
        // this.keepMove()

        // return
      }


      // 纵向滚动
      if (this.verticalBar.move) {
        const height = this.maxPoint.y - this.verticalBar.size
        const moveHeight = this.verticalBar.y + (evt.screenY - this.verticalBar.cursorY)
        if (moveHeight > 0 && moveHeight < height) {
          this.verticalBar.y += evt.screenY - this.verticalBar.cursorY
        } else if (moveHeight <= 0) {
          this.verticalBar.y = 0
        } else {
          this.verticalBar.y = height
        }
        this.verticalBar.cursorY = evt.screenY
        this.offset.y = -this.verticalBar.y / this.verticalBar.k
        requestAnimationFrame(this.rePainted)
        this.getDisplayEditCell()
      } if (this.horizontalBar.move) {//横向滚动
        let width = 0
        if (this.fillWidth > 0) {
          width = this.maxPoint.x - this.horizontalBar.size
        } else {
          width = (this.maxPoint.x + this.fixedWidth) - this.horizontalBar.size
        }
        const moveWidth = this.horizontalBar.x + (evt.screenX - this.horizontalBar.cursorX)
        if (moveWidth > 0 && moveWidth < width) {
          this.horizontalBar.x += evt.screenX - this.horizontalBar.cursorX
        } else if (moveWidth <= 0) {
          this.horizontalBar.x = 0
        } else {
          this.horizontalBar.x = width
        }
        this.horizontalBar.cursorX = evt.screenX
        this.offset.x = -this.horizontalBar.x / this.horizontalBar.k
        requestAnimationFrame(this.rePainted)

        this.getDisplayEditCell()
      }

      /**
       * 拖拽滚动条 编辑器框跟随同步
       */
      if(this.isDown && this.mousedownTarget &&  ['vertical','horizontalBar'].some(i=>this.mousedownTarget.classList.contains(i)) ){
        this.$emit('scroll')
        this.getDisplayEditCell()
      }

    }, 16),


    /**
     * @description 键盘按下事件
     * @param { Object } e: 键盘按下的事件对象
     */
    handleKeydown (e) {
      this.MousedownFocusCell = this.focusCell
      // 键盘按下，聚焦对象必须存在，才能继续下一步
      if(!this.isFocus)return
      if (e.keyCode === 38) { // 👆
        e.preventDefault()
        this.moveFocus('up')
      } else if (e.keyCode === 40) {// 👇
        e.preventDefault()
        this.moveFocus('down')
      } else if (e.keyCode === 37) {// 👈
        e.preventDefault()
          this.moveFocus('left')
          // this.moveFocus('left')
          // this.moveFocus('left')
      } else if (e.keyCode === 39) {// 👉
        e.preventDefault()
        this.moveFocus('right')

      } else if (e.keyCode === 16) {
        this.shiftDown = true
      }else if (e.keyCode === 13) {
        if(this.focusCell && !this.focusCell.column.isImage && !this.focusCell.column.isCheckbox&&!this.focusCell.column.disabled){
          this.save()
        }
        this.moveFocus('down')
      } else if (e.keyCode === 27) { // Esc
        this.hideInput()
        this.$refs.input.innerHTML = ''
      } else if (e.keyCode === 9) {
        this.save()
        this.moveFocus('right')
      } else if (e.keyCode === 17) {
        this.save()
        this.moveFocus('right')
      }

    },


    /**
     *
     * @description 键盘松开
     */
     handleKeyup (e) {
      if (e.keyCode === 16) {
        this.shiftDown = false
      }
    },

    /**
     * @description 窗口发生改变
     */
    handleResize() {
        // 重置聚焦
        this.isFocus = false
        // 重置聚焦单元 为 null
        this.focusCell = null
        // 重置选择
        this.isSelect = false
        this.save()
        // 隐藏输入框
        this.hideInput()

        this.offset.x = 0
        this.offset.y = 0
        this.horizontalBar.x = 0
        this.verticalBar.y = 0

        this.initCanvas()
        this.initSize() // 重置尺寸
    },


    /**
     *
     * @description 滚轮滚动
     */
    handleWheel (e) {
      this.hideTip()
      if (e.target.tagName === 'CANVAS') {
        const { deltaX, deltaY } = e
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          const lastScrollX = this.offset.x
          let maxWidth = 0
          if (this.fillWidth > 0) {
            maxWidth = this.maxPoint.x
          } else {
            maxWidth = this.maxPoint.x + this.fixedWidth
          }
          if (this.offset.x - deltaX > 0) {
            this.offset.x = 0
          } else if ((this.bodyWidth - maxWidth) + this.offset.x < deltaX) {
            this.offset.x = maxWidth - this.bodyWidth
            if (maxWidth - this.bodyWidth < 0) {
              this.offset.x = maxWidth - this.bodyWidth
            } else {
              e.preventDefault()
              e.returnValue = false
            }
          } else {
            e.preventDefault()
            e.returnValue = false
            this.offset.x -= deltaX
          }
          if (lastScrollX !== this.offset.x) {
            requestAnimationFrame(this.rePainted)
            this.$emit('scroll')
            this.getDisplayEditCell()
          }
        } else {
          const lastScrollY = this.offset.y
          if (lastScrollY - deltaY > 0) {
            this.offset.y = 0
          } else if ((this.bodyHeight - this.maxPoint.y) + lastScrollY < deltaY) {
            if (this.maxPoint.y - this.bodyHeight < 0) {
              this.offset.y = this.maxPoint.y - this.bodyHeight
            } else {
              e.preventDefault()
              e.returnValue = false
            }
          } else {
            e.preventDefault()
            e.returnValue = false
            this.offset.y -= deltaY
          }
          if (lastScrollY !== this.offset.y) {
            requestAnimationFrame(this.rePainted)
            this.$emit('scroll')
            this.getDisplayEditCell()
          }
        }
      }
    },

    /**
     * @description canvas 鼠标单击事件
     */
     handleClick (evt) {

      const { offsetX: x, offsetY: y } = evt


      if(this.bottomFixedRows !==2){
        if(y > this.maxPoint.y) {
          this.tooltip = ''
          this.tooltipStyle = {
            left:'-10000px',
            top:'-10000px'
          }
          return
        }
      }




      /**
       * 表头字段设置图标点击事件
       */
      const SettingStartX = (this.serialWidth - this.settingWidth) / 2
      const SettingEndX = SettingStartX + this.settingWidth
      const SettingStartY = (this.rowHeight - this.settingHeight) / 2
      const SettingEndY = SettingStartY + this.settingHeight
      if (x > SettingStartX && x < SettingEndX && y > SettingStartY && y < SettingEndY) {
        alert('表头字段设置')
        this.$emit('cornerClick')
      }
      /**
       * 底部固定行数处理，左边隐藏部分，点击感应区域需要自适应处理
       */

      if(this.bottomFixedRows===2){
        // 列数前5个的宽度和 + 首列宽度
        const mergeVal = this.columns.slice(0, 5).reduce((p, c) => p += c.width, this.serialWidth)
        // 临界值
        const limitVal = mergeVal + this.offset.x
        if (x > this.serialWidth && x < limitVal && y > this.height  - this.scrollerWidth - 2*this.rowHeight && y < this.height - this.rowHeight - this.scrollerWidth) {
          this.offset.x = 0
          this.horizontalBar.x = 0
          requestAnimationFrame(this.rePainted)
          const width = this.columns.slice(0, 5).reduce((p, c) => p += c.width, 0)
          const height = this.rowHeight
          const _x = this.serialWidth
          const _y = this.height - this.scrollerWidth - 2*height
          this.isTotalVisible = true
          this.showInput(_x, _y, width, height)
          if (this.$refs.input) this.$refs.input.innerHTML = ''
          this.isFocus = false
          this.focusCell = null
        } else {
          this.isTotalVisible = false
        }
      }
      /**
       * 表头排序单元格 点击事件
       */

      const headerSortCell = this.getHeadCellAt(evt) // 获取排序的单元格
      if(headerSortCell && y<this.rowHeight){
        const it = this.columns.find(i=>i.key===headerSortCell.key)
        for(const item of this.columns){
          if(item.sort && item.sort!=='default'){
            item.sort = 'default'
            break
          }
        }

        if(it) {
          this.isFocus = false
          this.focusCell = null
          const clone = this.data
          if( headerSortCell.sort === 'default' || headerSortCell.sort === 'down'){
            this.data = clone.sort(it.sorter)
            it.sort = 'up'
          }else if(headerSortCell.sort === 'up'){
            this.data = clone.sort(it.sorter).reverse()
            it.sort = 'down'
          }
          this.rePainted()
        }
      }

      /**
       * 首列单元格 两种不同UI情况下的点击事件
       */
      if(x<=this.serialWidth){
        if(this.sortType===1){
          // 序号加减
          if(this.hoverAddReduceType===1){
            const cell = this.getCellAt(x,y)
            this.focusCell = this.hoverAddReduceCell.rowIndex === cell.rowIndex?this.hoverAddReduceCell:cell
            this.rowFocus = {
              cellX: this.focusCell.x,
              cellY: this.focusCell.y,
              rowIndex: this.focusCell.rowIndex,
              offset: { ...this.offset }
            }
            this.$emit('sortReduce',this.focusCell)
          }else if(this.hoverAddReduceType===2){
            this.focusCell = this.hoverAddReduceCell
            this.rowFocus = {
              cellX: this.focusCell.x,
              cellY: this.focusCell.y,
              rowIndex: this.focusCell.rowIndex,
              offset: { ...this.offset }
            }


            this.$emit('sortAdd',this.focusCell)
          }else{
            if(this.hoverAddReduceType===0){
              if(this.hoverAddReduceCell){
                this.focusCell = this.hoverAddReduceCell
                this.rowFocus = {
                  cellX: this.focusCell.x,
                  cellY: this.focusCell.y,
                  rowIndex: this.focusCell.rowIndex,
                  offset: { ...this.offset }
                }
                this.paintFocusCell(this.focusCell)
              }
            }
          }
        }else if(this.sortType===2){
          if(this.hoverSortCell ){
            this.focusCell = this.hoverSortCell
            this.rowFocus = {
              cellX: this.focusCell.x,
              cellY: this.focusCell.y,
              rowIndex: this.focusCell.rowIndex,
              offset: { ...this.offset }
            }
            this.paintFocusCell(this.focusCell)
          }
        }
        this.isFocus = false
        return
      }


      if(this.hoverCheckboxCell&& y>this.rowHeight){
        const cell = this.hoverCheckboxCell
        console.log('%c [ hoverCheckboxCell ]-238', 'font-size:13px; background:pink; color:#bf2c9f;',cell)
        this.data[cell.rowIndex][cell.key] = !cell.rowData[cell.key]
        this.$emit('checkboxChange',cell)
      }

      /**
       *
       * 左右上下侧边隐藏编辑输入框部分，自适应到可视区域处理
       *
       */
      if (this.focusCell) {
        const limit = this.height - this.scrollerWidth - this.rowHeight*(this.bottomFixedRows+1)
        if(this.focusCell.x < this.serialWidth){ // 左👈
          const diff =  this.focusCell.x - this.serialWidth
          this.offset.x = this.offset.x - diff
          this.resetScrollBar(this.maxPoint, this.bodyWidth, this.bodyHeight, this.fixedWidth)
        }else if(this.focusCell.x + this.focusCell.width > this.maxPoint.x){//右👉
          const diff =  this.focusCell.x + this.focusCell.width - this.maxPoint.x
          this.offset.x = this.offset.x - diff
          this.resetScrollBar(this.maxPoint, this.bodyWidth, this.bodyHeight, this.fixedWidth)
        }else if(this.focusCell.y < this.rowHeight){ // 上👆
          const diff = this.focusCell.y -this.rowHeight
          this.offset.y = this.offset.y - diff
          this.horizontalBar.y = Math.abs(this.offset.y + diff)
        }else if(this.focusCell.y>limit){//下👇
          const diff = this.focusCell.y - limit
          this.offset.y = this.offset.y - diff
          this.horizontalBar.y = Math.abs(this.offset.y + diff)
        }
        this.rePainted()
        setTimeout(() => {
          if(this.focusCell.column && !this.focusCell.column.disabled && !this.focusCell.column.isCustomComponent){
            const { x, y, width, height, content } = this.focusCell
            this.$refs.input.innerHTML = content
            this.keepLastIndex(this.$refs.input)
            this.showInput(x, y, width, height)
          }else{
            if(this.focusCell.column.isCustomComponent){
              const { width, x, y, height, content, rowIndex, column: { disabled } }  = this.focusCell
              if(!disabled){
                // 自适应 x
                const _x = x < this.serialWidth ?
                this.serialWidth:
                x > this.width - this.scrollerWidth - width ?
                this.width - this.scrollerWidth - width : x
                // 自适应 y
                const _y = y < this.rowHeight ?
                this.rowHeight:
                y > this.maxPoint.y  - height ?
                this.maxPoint.y  - height : y

                this.rowFocus = {
                  cellX: _x,
                  cellY: _y,
                  rowIndex,
                  offset: { ...this.offset }
                }
                this.paintFocusCell(this.focusCell,false)
                setTimeout(() => {
                  this.$refs.input.innerHTML = content
                  this.keepLastIndex(this.$refs.input)
                  this.showInput(_x, _y, width, height)
                })
              }else{
                this.paintFocusCell(this.focusCell)
              }
            }
          }
        },16)
      }



    },

    /**
     * @description 鼠标右键
     * @param {*} e
     */
    handleContextmenu(e){
      e.preventDefault();
      this.isFocus = false
    }
  }
}
