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
     * 移除监听事件
     */
    removeEvent () {
      window.removeEventListener('mousedown', this.handleMousedown, false)
      window.removeEventListener('mousemove', throttle(16, this.handleMousemove), true)
      window.removeEventListener('mouseup', this.handleMouseup, false)
      window.removeEventListener('resize', this.handleResize, false)
      window.removeEventListener('mousewheel', this.handleWheel)
      window.removeEventListener('keydown', this.handleKeydown, false)
      window.removeEventListener('keyup', this.handleKeyup, false)
      this.$refs.canvas.removeEventListener('contextmenu',this.oncontextmenu,false)
    },


    /**
     * 初始化监听事件
     */
    initEvent () {
      window.addEventListener('mousedown', this.handleMousedown, false)
      window.addEventListener('mousemove', throttle(16, this.handleMousemove), true)
      window.addEventListener('mouseup', this.handleMouseup, false)
      // this.$refs.canvas.addEventListener('mouseleave', this.handleMouseup, false)
      this.$refs.canvas.addEventListener('click', this.handleClick, false)
      window.addEventListener('resize', this.handleResize, false)
      window.addEventListener('mousewheel', this.handleWheel, {passive: false})
      window.addEventListener('keydown', this.handleKeydown, false)
      window.addEventListener('keyup', this.handleKeyup, false)
      this.$refs.canvas.addEventListener('contextmenu',this.oncontextmenu,false)
    },

    oncontextmenu(e){
      e.preventDefault();
      this.isFocus = false
    },

    /**
     * 窗口发生改变
     */
    handleResize () {
      // 重置聚焦
      this.isFocus = false
      // 重置聚焦单元 为 null
      this.focusCell = null
      // 重置选择
      this.isSelect = false
      this.save()
      // 隐藏输入框
      this.hideInput()
      // 重置尺寸
      this.initSize()
      if(this.offset.x!==0 || this.horizontalBar.x!==0){
        this.offset.x = 0
        this.horizontalBar.x = 0
        requestAnimationFrame(this.rePainted)
      }
    },

    /**
     * 处理列设置
     */
    handleColumnSet () {
      this.showColumnSet = false
      this.initSize()
    },

    /**
     * canvas 鼠标单击事件
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
            this.focusCell = this.hoverAddReduceCell
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
        this.$emit('checkboxClick',this.hoverCheckboxCell)
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
          if(this.focusCell.column && !this.focusCell.column.disabled){
            const { x, y, width, height, content } = this.focusCell
            this.$refs.input.innerHTML = content
            this.keepLastIndex(this.$refs.input)
            this.showInput(x, y, width, height)
          }
        },16)
      }


    },

    /**
     *
     * 滚轮滚动
     */
    handleWheel (e) {
      this.tooltip = ''
      this.tooltipStyle = {
        left:'-10000px',
        top:'-10000px'
      }
      if (e.target.tagName === 'CANVAS') {
        if (!this.isFocus) {
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
            }
          }
        }
      }
    },

    /**
     * 鼠标移动
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
            }
          }
          this.sortCell = null
          if(!(this.lineCell && this.isDown)) this.lineCell = null
          if(!(this.lineCell && this.isDown)) document.querySelector('.excel-table').style.cursor = 'default'
        }


        // row 的 hover 效果
        this.hover(evt)

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
          this.tooltip = ''
          this.tooltipStyle = {
            left:'-10000px',
            top:'-10000px'
          }
        }

        /**
         * 单元格 超出省略号
         */
        if(!this.isFocus){
          const cell = this.getCellAt(x,y)
          if(cell){
            // 如果是图片、复选框、禁止点击
            if(cell.column.isImage || cell.column.isCheckbox || cell.column.disabled) return
            // 原文本和处理后的文本不一致，则是超出省略了
            if (
              cell.paintText &&
              cell.paintText[1] &&
              cell.paintText[1] !== cell.rowData[cell.key]
            ) {
              this.tooltip = cell.content;
              this.tooltipStyle = {
                left: cell.x + cell.width / 2 + "px",
                top: cell.y + cell.height - 4 + "px"
              };
              this.$emit("cellEllipsis", cell);
            } else {
              this.tooltip = "";
              this.tooltipStyle = {
                left: "-10000px",
                top: "-10000px"
              };
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
      }

    }, 16),

    /**
     * @description 在canvas 规定区域进行的 hover 效果
     * @param {*} param0
     */
    hover({ offsetX: x, offsetY: y , target}) {
      // 超出边界 去掉 row hover 效果
      if (x < 0 || x > this.maxPoint.x || y < 0 || y > this.maxPoint.y) {
        this.hoverCell = null;
        this.rowHover = null;
        this.rePainted();
      } else {
        const bodyCell = this.getCellAt(x, y); // body cell
        if (bodyCell) {// 如果bodyCell 存在就说明hover body区域
          // 如果原来的行索引 和 新的行索引不一致，说明换行了，再去hover
          if (
            !this.oldBodyCell ||
            this.oldBodyCell.rowIndex !== bodyCell.rowIndex
          ) {
            this.oldBodyCell = bodyCell;
            this.paintBodyRowHover(bodyCell);
          }
        } else {
          // 如果hover的是首列cell
          this.hoverCell = null;
          this.rowHover = null;
          const firstColumnCell = this.hoverFirstColumnCell(x, y);
          // 首行单元格 hover，按需hover，性能优化
          if (firstColumnCell) {
            if (
              !this.oldFisrtColumnCell ||
              this.oldFisrtColumnCell.rowIndex !== firstColumnCell.rowIndex
            ) {
              this.oldFisrtColumnCell = firstColumnCell;
              this.paintBodyRowHover(firstColumnCell);
            }
          }
        }
      }
    },

    // 获取单元格内容是否超出省略号了
    getCellIsEllipsis(x,y){
      const cell = this.getCellAt(x,y)
      // 再根据key 去匹配到 列
      if(cell){
        const column = this.allColumns.find(i=>i.key===cell.key)
        if(column){
          return column.isEllipsis
        }else{
          return false
        }
      }else{
        return false
      }
    },

    hoverFirstColumnCell(x,y){
      if(x>0 && x< this.serialWidth){
        const item = this.displayRows.find(i=>y<i.y+i.height)
        if(item){
          for (const rows of this.displayCells) {
            for (const cell of rows) {
              if (x >= cell.x - this.serialWidth && y >= cell.y && x <= cell.x + cell.width-this.serialWidth && y <= cell.y + cell.height) {
                return Object.assign({}, cell, { offset: { ...this.offset } })
              }
            }
          }
        }else{
          return null
        }
      }else{
        return null
      }
    },

    getHeaderLineCell(x, y){
      const cell = this.displayColumns.find(i=>this.i(i.width + i.x)-x>= -5 && this.i(i.width + i.x)-x<=5)
      if(cell && y>0 && y <this.rowHeight){
        return cell
      }else{
        return null
      }
    },

    // 获取首列区域的列表头单元对象
    getHeadColumnCell({offsetX:x, offsetY:y, target:t}){
      if(t && t.tagName && t.tagName === 'CANVAS'){
        // 显示在视图的列中找到
        const cell = this.displayColumns.find(i => x>this.i(i.x)&&x< this.i(i.x)+i.width)
        if(cell && y>0 && y <this.rowHeight){
          return cell
        }else{
          return null
        }
      }else{
        return null
      }
    },

    // 获取排序的cloumn信息
    getHeadCellAt({offsetX:x, offsetY:y, target}) {
      if (target && target.tagName !== "CANVAS") return null;
      const { displayColumns } = this.initDisplayItems();
      const headCell = displayColumns.find(i => x > this.i(i.x) && x < this.i(i.x) + i.width);
      if (headCell && headCell.sort && y > 0 && y < this.rowHeight) {
        return headCell;
      } else {
        return null;
      }
    },

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



    /**
     *
     * 鼠标按下 事件
     *
     */
    handleMousedown (evt) {
      //如果鼠标按需的事件对象不属于 有效的 dom范围内 就隐藏输入框
      const input = this.getElementByClassName(evt.target,'input-content')

      if(!input){
        this.hideInput()
      }

      this.save()
      let needRepaint = false

      if (evt.target.tagName === 'CANVAS') {
        setTimeout(() => {
          this.isDown = true
          this.hideInput()
          this.isSelect = false
          const eX = evt.offsetX
          const eY = evt.offsetY
          if (eX > this.originPoint.x && eY > this.rowHeight && eX < this.maxPoint.x) {
            const cell = this.getCellAt(eX, eY)
            if (cell && !cell.buttons && !cell.readOnly) {
              this.focusCell = cell
              this.rowFocus = {
                cellX: cell.x,
                cellY: cell.y,
                rowIndex: this.focusCell.rowIndex,
                offset: { ...this.offset }
              }
              this.paintFocusCell(cell)
              this.$emit('focus', cell.rowData, cell)
            } else {
              this.isFocus = false
              this.focusCell = null
              this.rePainted()
            }
            if(!cell ||  (cell && (cell.column.isImage || cell.column.isCheckbox || cell.column.disabled)) ){
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
      } else if (
        (evt.target && evt.target.classList && evt.target.classList.contains)) {
        // ((evt.target && evt.target.classList.contains('footer')) || (evt.target.parentNode && evt.target.parentNode.classList.contains('footer')))
        this.isVisible = false
      } else if (!evt.target.classList.contains('input-content') && !evt.target.parentNode.classList.contains('footer')) {
        if (evt.target.tagName !== 'CANVAS') {
          // if (this.isFocus) {
          //   this.save()
          //   this.hideInput()
          //   needRepaint = true
          // }
          if (this.isFocus) {
            this.isFocus = false
            this.focusCell = null
            needRepaint = true
          }
          if (this.isSelect) {
            this.isSelect = false
            needRepaint = true
          }
          if (this.showColumnSet) {
            setTimeout(() => {
              if (evt.path.indexOf(this.$refs.columnSet) === -1) {
                this.showColumnSet = false
                this.initSize()
              }
            }, 0)
          }
          if (needRepaint) {
            this.rePainted()
          }
        }
      } else {
        this.isVisible = false
      }
    },



    /**
     *
     * 鼠标松开
     *
     */
    handleMouseup (e) {
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
    },

    /**
     *
     * 键盘松开
     */
    handleKeyup (e) {
      if (e.keyCode === 16) {
        this.shiftDown = false
      }
    },

    /**
     *
     * 键盘按下
     */
    handleKeydown (e) {
      if (this.isFocus) {
        // if (!this.isEditing) {
          if (e.keyCode === 38) {
            e.preventDefault()
            this.moveFocus('up')
          } else if (e.keyCode === 40) {
            e.preventDefault()
            this.moveFocus('down')
          } else if (e.keyCode === 37) {
            e.preventDefault()
            this.moveFocus('left')
          } else if (e.keyCode === 39) {
            e.preventDefault()
            this.moveFocus('right')
          } else if (e.keyCode === 16) {
            this.shiftDown = true
          } else if (e.keyCode === 8 || e.keyCode === 46) {
            if (this.isSelect) {
              const deleteData = []
              for (const row of selectCells) {
                const temp = {
                  rowData: row[0].rowData,
                  index: row[0].rowIndex,
                  items: []
                }
                for (const item of row) {
                  if (item.readOnly) {
                    temp.items.push({
                      key: '',
                      value: ''
                    })
                  } else {
                    temp.items.push({
                      key: item.key,
                      value: ''
                    })
                  }
                }
                deleteData.push(temp)
              }
              this.$emit('update', deleteData)
            } else {
              this.$emit('updateItem', {
                index: this.focusCell.rowIndex,
                key: this.focusCell.key,
                value: ''
              })
            }
          } else if (/macintosh|mac os x/i.test(navigator.userAgent)) {
            if (e.keyCode === 90 && e.metaKey) {
              e.preventDefault()
              this.$emit('history_back')
            } else if (e.keyCode === 89 && e.metaKey) {
              e.preventDefault()
              this.$emit('history_forward')
            } else if (e.keyCode === 67 && e.metaKey) {
              if (this.isSelect) {
                e.preventDefault()
                this.selectText(this.$refs.inputSelect)
                document.execCommand('Copy')
              }
            }
          } else if (e.keyCode === 90 && e.ctrlKey) {
            e.preventDefault()
            this.$emit('history_back')
          } else if (e.keyCode === 89 && e.ctrlKey) {
            e.preventDefault()
            this.$emit('history_forward')
          } else if (e.keyCode === 67 && e.ctrlKey) {
            if (this.isSelect) {
              e.preventDefault()
              this.selectText(this.$refs.inputSelect)
              document.execCommand('Copy')
            }
          }
        // }
        if (e.keyCode === 13) {
          this.save()
          this.moveFocus('down')
        } else if (e.keyCode === 27) {
          this.hideInput()
          this.$refs.input.innerHTML = ''
        } else if (e.keyCode === 9) {
          this.save()
          this.moveFocus('right')
        }
      }
    },

    handleInputKeyup () {

    },


    /**
     *
     * 左右上下 聚焦通用方法
     *
     */
    inputMove(){
      // 聚焦单元对象存在
      if(this.focusCell){
        // 标记 聚焦标识 为 true
        this.isFocus = true
        // 统计不显示
        this.isTotalVisible = false
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
    },

    /**
     * @description 键盘 左右上下 移动且聚焦
     * @param {*} type
     * @returns
     */
    moveFocus (type) {
      if (!this.focusCell)return
      // 竖直方向 -> 行索引
      const row = this.focusCell.rowIndex
      // 横向方向 -> 列索引
      const cell = this.focusCell.cellIndex
      // 隐藏输入框
      this.hideInput()

      if (type === 'up') {
        if (this.getDisplayCellIndexByRowIndex(row) !== 0) {
          this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(this.displayCells, row - 1, cell), { offset: { ...this.offset } })
          if (this.focusCell.y < this.originPoint.y) {
            this.offset.y += this.originPoint.y - this.focusCell.y
          }
          this.inputMove()

        } else {
          const rowIndex = this.displayRows[0].rowIndex
          if (rowIndex > 0) {
            this.offset.y += this.allRows[this.displayRows[0].rowIndex - 1].height
            const { displayCells } = this.rePainted()
            this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(displayCells, displayCells[0][0].rowIndex, cell), { offset: { ...this.offset } })
            this.inputMove()
          }
        }
      } else if (type === 'down') {
        if (row !== this.displayCells[this.displayCells.length - 1][0].rowIndex) {
          this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(this.displayCells, row + 1, cell), { offset: { ...this.offset } })
          if (this.focusCell.y + this.focusCell.height > this.maxPoint.y) {
            this.offset.y -= (this.focusCell.y + this.focusCell.height) - this.maxPoint.y
          }
          this.inputMove()
        } else {// 未出现在可视区域的情况
          const rowIndex = this.displayRows[this.displayRows.length - 1].rowIndex
          if (rowIndex < this.allRows.length - 1) {
            this.offset.y -= this.allRows[this.displayRows[this.displayRows.length - 1].rowIndex + 1].height
            const { displayCells } = this.rePainted()
            this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(displayCells, displayCells[displayCells.length - 1][0].rowIndex, cell), { offset: { ...this.offset } })
            this.inputMove()
          }
        }
      } else if (type === 'left') {
        if (cell !== this.getFirstDisplayCellIndex(this.displayCells)) {
          this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(this.displayCells, row, cell - 1), { offset: { ...this.offset } })
          if (this.focusCell.x < this.originPoint.x) {
            this.offset.x += this.originPoint.x - this.focusCell.x
          }
          this.inputMove()
        } else {
          const cellIndex = this.displayColumns[0].cellIndex
          if (cellIndex > 0) {
            this.offset.x += this.allColumns[cellIndex - 1].width
            const { displayCells } = this.rePainted()
            this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(displayCells, row, this.getFirstDisplayCellIndex(displayCells)), { offset: { ...this.offset } })
            this.inputMove()
          }
        }
      } else if (type === 'right') {
        if (cell !== this.getLastDisplayCellIndex(this.displayCells)) {
          this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(this.displayCells, row, cell + 1), { offset: { ...this.offset } })
          if (this.focusCell.x + this.focusCell.width > this.maxPoint.x - this.fixedWidth) {
            this.offset.x -= (this.focusCell.x + this.focusCell.width) - (this.maxPoint.x - this.fixedWidth)
          }
          this.inputMove()
        } else {
          const cellIndex = this.displayColumns[this.displayColumns.length - 1 - this.displayFixedCells.length].cellIndex
          if (cellIndex < this.allColumns.length - 1) {
            this.offset.x -= this.allColumns[cellIndex + 1].width
            const { displayCells } = this.rePainted()
            this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(displayCells, row, this.getLastDisplayCellIndex(displayCells)), { offset: { ...this.offset } })
            this.inputMove()
          }
        }
      }
      this.$emit('scroll')
    },

    /**
     * @description 获取显示的单元格  通过行索引
     * @param {*} displayCells
     * @param {*} rowIndex
     * @param {*} cellIndex
     * @returns
     */
    getDisplayCellByRowIndex (displayCells, rowIndex, cellIndex) {
      for (const item of displayCells) {
        if (item[0].rowIndex === rowIndex) {
          for (const cell of item) {
            if (cell.cellIndex === cellIndex) {
              return cell
            }
          }
        }
      }
      return null
    },

    /**
     * @description 获取显示的单元格索引  通过行索引
     * @param {*} row
     * @returns
     */
    getDisplayCellIndexByRowIndex (row) {
      let index = 0
      for (const item of this.displayCells) {
        if (item[0].rowIndex === row) {
          return index
        }
        index += 1
      }
      return null
    },

    getLastDisplayCellIndex (displayCells) {
      return displayCells[0][displayCells[0].length - 1].cellIndex
    },

    getFirstDisplayCellIndex (displayCells) {
      return displayCells[0][0].cellIndex
    },

    keepLastIndex (obj) {
      if (window.getSelection) { // ie11 10 9 ff safari
        obj.focus() // 解决ff不获取焦点无法定位问题
        const range = window.getSelection()// 创建range
        range.selectAllChildren(obj)// range 选择obj下所有子内容
        range.collapseToEnd()// 光标移至最后
      } else if (document.selection) { // ie10 9 8 7 6 5
        const range = document.selection.createRange()// 创建选择对象
        // var range = document.body.createTextRange();
        range.moveToElementText(obj)// range定位到obj
        range.collapse(false)// 光标移至最后
        range.select()
      }
    },

    selectText (obj) {
      if (document.selection) {
        const range = document.body.createTextRange()
        range.moveToElementText(obj)
        range.select()
      } else if (window.getSelection) {
        const range = document.createRange()
        range.selectNodeContents(obj)
        window.getSelection().removeAllRanges()
        window.getSelection().addRange(range)
      }
    }
  }
}
