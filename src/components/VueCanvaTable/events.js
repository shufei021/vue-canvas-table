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


import { throttle, debounce } from "./utils"

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
  watch: {
    retract () {
      this.handleResize()
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
    },
    /**
     * 初始化监听事件
     */
    initEvent () {
      window.addEventListener('mousedown', this.handleMousedown, false)
      window.addEventListener('mousemove', throttle(16, this.handleMousemove), true)
      window.addEventListener('mouseup', this.handleMouseup, false)
      // this.$refs.canvas.addEventListener('mouseleave', this.handleMouseup, false)
      this.$refs.canvas.addEventListener('dblclick', this.handleDoubleClick, false)
      this.$refs.canvas.addEventListener('click', this.handleClick, false)
      window.addEventListener('resize', this.handleResize, false)
      window.addEventListener('mousewheel', this.handleWheel, {passive: false})
      window.addEventListener('keydown', this.handleKeydown, false)
      window.addEventListener('keyup', this.handleKeyup, false)
    },

    handleResize () {
      this.isFocus = false
      this.focusCell = null

      this.isSelect = false
      this.save()
      this.hideInput()
      this.initSize()
    },

    handleColumnSet () {
      this.showColumnSet = false
      this.initSize()
    },

    /**
     *
     * 鼠标单击
     */
    handleClick (evt) {
      // 如果不是选中状态
      if (!this.isSelect) {
        const x = evt.offsetX
        const y = evt.offsetY

        if (x > this.maxPoint.x && y > this.maxPoint.y && x < this.width && y < this.height) {
          this.fullScreen()
        }

        if (this.showCheckbox) {
          if (x > this.serialWidth && x < this.originPoint.x) {
            const checkbox = this.getCheckboxAt(x, y)
            const { serialWidth, checkboxWidth, checkWdith } = this
            const checkboxX = serialWidth + ((checkboxWidth - checkWdith) / 2) // 绘制复选框居中的 x 左边
            if (checkbox) {
              if (this.selected.indexOf(checkbox.rowIndex) !== -1) {
                this.selected.splice(this.selected.findIndex((item) => { if (item === checkbox.rowIndex) { return true } return false }), 1)
              } else {
                this.selected.push(checkbox.rowIndex)
              }
              this.rePainted()
            } else if (x > checkboxX && x < checkboxX + checkWdith && y > 5 && y < 25) {
              console.log('%c [ 1你的速度 ]-92', 'font-size:13px; background:pink; color:#bf2c9f;')
              if (this.selected.length === this.allRows.length) {
                this.selected = []
              } else {
                this.selected = []
                for (const row of this.allRows) {
                  this.selected.push(row.rowIndex)
                }
              }
              this.rePainted()
            } else if (this.downWidth && x > checkboxX + 25 && x < checkboxX + 25 + this.downWidth && y > (this.rowHeight - this.downWidth) / 2 && y < ((this.rowHeight - this.downWidth) / 2) + this.downWidth) {
              //
              this.$emit('down')
            }
            return
          }
        }

        if (this.columnSet) {
          if (!this.showColumnSet) {
            // console.log('%c [ x ]-106', 'font-size:13px; background:pink; color:#bf2c9f;', x)
            // console.log('%c [ y ]-106', 'font-size:13px; background:pink; color:#bf2c9f;', y)
            // console.log('%c [ serialWidth ]-361', 'font-size:13px; background:pink; color:#bf2c9f;', this.serialWidth)
            // console.log('%c [ rowHeight ]-351', 'font-size:13px; background:pink; color:#bf2c9f;', this.rowHeight)
            const sx = (this.serialWidth - this.settingWidth) / 2
            const ex = sx + this.settingWidth
            const sy = (this.rowHeight - this.settingHeight) / 2
            const ey = sy + this.settingHeight
            if (x > sx && x < ex && y > sy && y < ey) {
              console.log('%c [ 点击到图标了 ]-115', 'font-size:13px; background:pink; color:#bf2c9f;')
              // this.showColumnSet = true
              return
            }
          } else {
            this.handleColumnSet()
          }
        }

        const button = this.getButtonAt(x, y)
        if (button) {
          this.rowFocus = button
          button.click(this.data[button.rowIndex], button.rowIndex)
          this.rePainted()
        }
        const { displayColumns } = this.initDisplayItems()
        console.log('-------------------')
        console.log('-----------X--Y------', x, y)

        if (x > this.serialWidth && x < displayColumns.slice(0, 4).reduce((p, c) => p += c.width, this.serialWidth) && y > this.height - this.rowHeight - this.scrollerWidth - this.rowHeight && y < this.height - this.rowHeight - this.scrollerWidth) {
          console.log('%c [ 点击了选择商品 ]-109', 'font-size:13px; background:pink; color:#bf2c9f;', x, y)
          const width = displayColumns.slice(0, 4).reduce((p, c) => p += c.width, 0)
          const height = this.rowHeight
          const _x = this.serialWidth
          const _y = this.height - this.rowHeight - this.scrollerWidth - this.rowHeight
          this.isTotalVisible = true
          this.showInput(_x, _y, width, height)
          if (this.$refs.input) this.$refs.input.innerHTML = ''
          this.isFocus = false
          this.focusCell = null
          this.isSelect = false
          this.rePainted()
        } else {
          this.isTotalVisible = false
        }
      } else {
        this.isTotalVisible = false
      }
    },

    /**
     * 鼠标双击
     */
    handleDoubleClick () {
      if (this.focusCell) {
        const { x, y, width, height, content } = this.focusCell
        this.$refs.input.innerHTML = content
        this.keepLastIndex(this.$refs.input)
        this.showInput(x, y, width, height)
      }
    },

    /**
     *
     * 滚轮滚动
     */
    handleWheel (e) {
      if (e.target.tagName === 'CANVAS') {
        if (!this.isEditing) {
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
    handleMousemove: debounce(function (evt) {
      const eX = evt.offsetX
      const eY = evt.offsetY
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
      }
      if (this.horizontalBar.move) {
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
      // 表格左上角图标如果被鼠标移上去了，就改变手型为手型，否则就改为默认
      const x = evt.offsetX
      const y = evt.offsetY
      const sx = (this.serialWidth - this.settingWidth) / 2
      const ex = sx + this.settingWidth
      const sy = (this.rowHeight - this.settingHeight) / 2
      const ey = sy + this.settingHeight
      if (x > sx && x < ex && y > sy && y < ey) {
        document.querySelector('.excel-table').style.cursor = 'pointer'
      } else {
        document.querySelector('.excel-table').style.cursor = 'default'
      }
      const cell = this.getCellAt(eX, eY)
      if (evt.target.tagName !== 'CANVAS') {
        this.hoverCell = null
        this.rowHover = null
        this.rePainted()
      } else {
        if (cell) {
          this.hover(cell)
        } else {
          this.hoverCell = null
          this.rowHover = null
          this.rePainted()
        }
      }
    }, 16),

    /**
     *
     * 鼠标按下
     *
     */
    handleMousedown (evt) {
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
              this.$emit('focus', cell.rowData)
            } else {
              this.isFocus = false
              this.focusCell = null
              this.rePainted()
            }
          } else {
            this.isFocus = false
            this.focusCell = null
            this.rePainted()
          }
        }, 0)
      } else if (
        (evt.target && evt.target.classList && evt.target.classList.contains)) {
        // ((evt.target && evt.target.classList.contains('footer')) || (evt.target.parentNode && evt.target.parentNode.classList.contains('footer')))
        console.log('%c [  ]-375', 'font-size:13px; background:pink; color:#bf2c9f;')
        this.isVisible = false
      } else if (!evt.target.classList.contains('input-content') && !evt.target.parentNode.classList.contains('footer')) {
        console.log('%c [ sdsdvd  ]-370', 'font-size:13px; background:pink; color:#bf2c9f;')
        if (evt.target.tagName !== 'CANVAS') {
          if (this.isEditing) {
            this.save()
            this.hideInput()
            needRepaint = true
          }
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
    handleMouseup () {
      this.isDown = false
      this.horizontalBar.move = false
      this.verticalBar.move = false
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
        if (!this.isEditing) {
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
        }
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

    moveFocus (type) {
      if (!this.focusCell) {
        return
      }
      if (this.isSelect) {
        this.isSelect = false
      }
      const row = this.focusCell.rowIndex
      const cell = this.focusCell.cellIndex
      this.hideInput()
      if (type === 'up') {
        if (this.getDisplayCellIndexByRowIndex(row) !== 0) {
          this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(this.displayCells, row - 1, cell), { offset: { ...this.offset } })
          if (this.focusCell.y < this.originPoint.y) {
            this.offset.y += this.originPoint.y - this.focusCell.y
          }
          this.paintFocusCell(this.focusCell)
        } else {
          const rowIndex = this.displayRows[0].rowIndex
          if (rowIndex > 0) {
            this.offset.y += this.allRows[this.displayRows[0].rowIndex - 1].height
            const { displayCells } = this.rePainted()
            this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(displayCells, displayCells[0][0].rowIndex, cell), { offset: { ...this.offset } })
            this.paintFocusCell(this.focusCell)
          }
        }
      } else if (type === 'down') {
        if (row !== this.displayCells[this.displayCells.length - 1][0].rowIndex) {
          this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(this.displayCells, row + 1, cell), { offset: { ...this.offset } })
          if (this.focusCell.y + this.focusCell.height > this.maxPoint.y) {
            this.offset.y -= (this.focusCell.y + this.focusCell.height) - this.maxPoint.y
          }
          this.paintFocusCell(this.focusCell)
        } else {
          const rowIndex = this.displayRows[this.displayRows.length - 1].rowIndex
          if (rowIndex < this.allRows.length - 1) {
            this.offset.y -= this.allRows[this.displayRows[this.displayRows.length - 1].rowIndex + 1].height
            const { displayCells } = this.rePainted()
            this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(displayCells, displayCells[displayCells.length - 1][0].rowIndex, cell), { offset: { ...this.offset } })
            this.paintFocusCell(this.focusCell)
          }
        }
      } else if (type === 'left') {
        if (cell !== this.getFirstDisplayCellIndex(this.displayCells)) {
          this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(this.displayCells, row, cell - 1), { offset: { ...this.offset } })
          if (this.focusCell.x < this.originPoint.x) {
            this.offset.x += this.originPoint.x - this.focusCell.x
          }
          this.paintFocusCell(this.focusCell)
        } else {
          const cellIndex = this.displayColumns[0].cellIndex
          if (cellIndex > 0) {
            this.offset.x += this.allColumns[cellIndex - 1].width
            const { displayCells } = this.rePainted()
            this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(displayCells, row, this.getFirstDisplayCellIndex(displayCells)), { offset: { ...this.offset } })
            this.paintFocusCell(this.focusCell)
          }
        }
      } else if (type === 'right') {
        if (cell !== this.getLastDisplayCellIndex(this.displayCells)) {
          this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(this.displayCells, row, cell + 1), { offset: { ...this.offset } })
          if (this.focusCell.x + this.focusCell.width > this.maxPoint.x - this.fixedWidth) {
            this.offset.x -= (this.focusCell.x + this.focusCell.width) - (this.maxPoint.x - this.fixedWidth)
          }
          this.paintFocusCell(this.focusCell)
        } else {
          const cellIndex = this.displayColumns[this.displayColumns.length - 1 - this.displayFixedCells.length].cellIndex
          if (cellIndex < this.allColumns.length - 1) {
            this.offset.x -= this.allColumns[cellIndex + 1].width
            const { displayCells } = this.rePainted()
            this.focusCell = Object.assign({}, this.getDisplayCellByRowIndex(displayCells, row, this.getLastDisplayCellIndex(displayCells)), { offset: { ...this.offset } })
            this.paintFocusCell(this.focusCell)
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
