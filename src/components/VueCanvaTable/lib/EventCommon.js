/*
 * @Description: 事件公共混入
 * @Author: shufei
 * @Date: 2022-08-09 09:20:18
 * @LastEditTime: 2022-08-15 09:54:48
 * @LastEditors: shufei
 */
export default {
  data () {
    return {

    }
  },
  methods: {
    /**
     * @description 在canvas 规定区域进行的 row 的 hover 效果
     * @param {Number} x
     * @param {Number} y
     * @param {Object} target 目标源对象
     */
    HoverRow({ offsetX: x, offsetY: y , target}) {
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

    /**
     * @description 获取第一列单元格对应 cell 对象
     * @param {Number} x :  canvas 上 x 坐标值
     * @param {Number} y ：canvas 上 y 坐标值
     * @return Object
     */
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

    // 全键盘 左右上下移动
    keepMove(){
      setTimeout(() => {
        if(!this.focusCell )return
        const { width, x, y, height, content, rowIndex, column: { disabled } }  = this.focusCell
        if(y<this.rowHeight || y> this.maxPoint.y-this.rowHeight){
          return this.hideInput()
        }
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
        }
      })
    },


    /**
     *
     * 左右上下 聚焦通用方法
     *
     */
     inputMove(){
      console.log('%c [ this.focusCell ]-944', 'font-size:13px; background:pink; color:#bf2c9f;', this.focusCell)
      if(!this.focusCell.column){
        if(this.MousedownFocusCell.y<this.rowHeight){
          this.offset.y = this.offset.y  - this.MousedownFocusCell.y + this.rowHeight
          this.MousedownFocusCell.y = this.rowHeight
          this.focusCell = this.MousedownFocusCell
          this.rePainted()
          const { x, y, width, height, content } = this.focusCell
            this.$refs.input.innerHTML = content
            this.keepLastIndex(this.$refs.input)
            this.showInput(x, this.rowHeight, width, height)
          return
        }
      }
      // 聚焦单元对象存在
      if(this.focusCell){
        if(this.focusCell.column.isImage || this.focusCell.column.disabled){
          this.$refs.input.style.display = 'none'
        }else{
          if(this.focusCell.column.isCustomComponent){
            this.$refs.input.style.display = 'none'
          }else{
            this.$refs.input.style.display = 'flex'
          }
        }
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


              // this.keepMove()

          })
        }else{
          this.paintFocusCell(this.focusCell)
        }
        // this.MousedownFocusCell = null

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
          // this.keepMove()
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
      this.getDisplayEditCell()
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

    handleInputKeyup () {
      this.$emit('inputKeyUp')
    }
  }
}
