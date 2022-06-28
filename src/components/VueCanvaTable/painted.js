/* eslint-disable no-mixed-operators */
/**
 * 绘制
 */

export default {

    data() {
        const oncheck = new Image()
        oncheck.src = require('./oncheck.png')
        const offcheck = new Image()
        offcheck.src = require('./offcheck.png')

        const more = new Image()
        more.src = require('./more.png')

        const down = new Image()
        down.src = require('./down.png')

        const setting = new Image()
        setting.src = require('./setting.png')
        return {
            // 首行背景填充色
            fillColor: '#fafafa',
            // 首列背景色
            fillColumnColor: '#fff',
            // 首行字体色
            headerColor: '#262626',
            // 除首行外的其他行的单元格的字体颜色
            textColor: '#262626',
            // 表格的 border 颜色
            borderColor: '#e8e8e8',
            // button操作的整列背景色
            white: '#fafafa',
            // button操作的整列box-shadow色
            shadowColor: 'rgba(0,0,0,0.2)',
            // button操作的整列字体色
            buttonColor: '#4285f4',
            // 单元格获取焦点的border颜色
            focusColor: '#61adff',
            // 行背景色
            selectRowColor: '#f5f9ff',
            dotColor: 'red',
            // 复选框- 选中图标
            oncheck,
            // 复选框- 取消选中图标
            offcheck,
            // 更多图标
            more,
            // 设置图标
            setting,
            // 设置图标 宽度
            settingWidth: 16,
            // 设置图标 高度
            settingHeight: 16,
            // 复选框图标宽度
            checkWdith: 20,
            down,
            downWidth: 0,
        }
    },
    methods: {
        initCanvas() {
            const canvas = this.$refs.canvas
            let ctx = ''
            if (this.ctx) {
                ctx = this.ctx
            } else {
                ctx = canvas.getContext('2d')
                this.ctx = ctx
            }
            ctx.font = 'normal 12px PingFang SC'
            const backingStore = ctx.backingStorePixelRatio ||
                ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1

            this.ratio = (window.devicePixelRatio || 1) / backingStore

            this.getAllCells(this.data, this.columns)
            this.setBodyHeight(this.allRows, this.originPoint)
            this.setMaxpoint(this.width, this.height, this.fixedWidth, this.scrollerWidth)
            this.resetScrollBar(this.maxPoint, this.bodyWidth, this.bodyHeight, this.fixedWidth)
        },
        p(value) {
            const temp = `${value}`
            if (temp && temp.indexOf && temp.indexOf('.') === -1) {
                return value + 0.5
            }
            return value
        },
        i(value) {
            return Math.round(value)
        },
        rePainted() {
          const items = this.initDisplayItems()
            // if (this.autoAddRow) { // 自动增加行，减少行
            //     if (items.displayRows[items.displayRows.length - 1].rowIndex >= this.allRows.length - 50) {
            //         const startIndex = this.data.length
            //         for (let i = 0; i < 100; i += 1) {
            //             this.data.push(this.templateData)
            //         }
            //         this.setAllCells(startIndex)
            //         items = this.initDisplayItems()
            //     } else if (this.data.length > this.initRows && items.displayRows[items.displayRows.length - 1].rowIndex <= this.allRows.length - 200) {
            //         this.data.splice(this.data.length - 100, 100)
            //         this.allCells.splice(this.allCells.length - 100, 100)
            //         this.allRows.splice(this.allRows.length - 100, 100)
            //         this.setBodyHeight(this.allRows, this.originPoint)
            //         this.resetScrollBar(this.maxPoint, this.bodyWidth, this.bodyHeight, this.fixedWidth)
            //         items = this.initDisplayItems()
            //     }
            // }
            this.clearPainted()
            this.painted(items)
            return items
        },

        clearPainted() {
            this.ctx.clearRect(0, 0, this.width, this.height)
        },

        painted(displayItems) {
            const ctx = this.ctx
            const { displayColumns, displayRows, displayCells, displayFixedCells } = displayItems

            ctx.fillStyle = this.headerColor// text color
            ctx.textAlign = 'center'
            ctx.lineWidth = 1
            ctx.strokeStyle = this.borderColor
            ctx.textBaseline = 'middle'
            ctx.save()

            this.renderButtons = []

            // 绘制表头线条
            this.paintLine(ctx, displayRows, displayColumns)

            // 填充表格单元格内容
            this.paintBody(ctx, displayCells)

            // 改变这个标识来控制是否绘制点击的cell的border，用来标识获取焦点状态
            if (this.isFocus && this.focusCell) this.paintFocus(ctx, this.focusCell)


            // 绘制表头
            this.paintHeader(ctx, displayColumns)



            // 绘制首列
            this.paintSerial(ctx, displayRows)

            // 绘制倒三角
            this.paintNo(ctx)

            // 如果配置了显示复选框就绘制复选框
            if (this.showCheckbox) this.paintCheckbox(ctx, displayRows)

            if (displayFixedCells.length > 0 && this.fillWidth === 0) {
              this.paintFixedCells(ctx, displayFixedCells, displayColumns)
            }
            this.paintFooter(ctx, displayColumns)
            // 绘制底部表尾巴固定合计行
            this.paintTotal(ctx)

            this.paintScroller(ctx, this.scrollerWidth)
        },

        // 绘制复选框
        paintCheckbox(ctx, displayRows) {
            this.checkboxs = []
            const { i, p, offset, maxPoint, allRows, focusCell, rowFocus, checkboxWidth, rowHeight, serialWidth, originPoint, height, oncheck, offcheck, selected, checkWdith, down, downWidth } = this
            ctx.fillStyle = this.fillColor
            ctx.save()
            if (offset.x !== 0) {
                ctx.shadowBlur = 10
                ctx.shadowColor = this.shadowColor
            }
            ctx.fillRect(i(0), p(0), i(checkboxWidth + serialWidth), i(height))
            ctx.restore()
            ctx.beginPath()
            ctx.strokeStyle = this.borderColor
            ctx.lineWidth = 1
            ctx.moveTo(p(serialWidth), i(0))
            ctx.lineTo(p(serialWidth), i(maxPoint.y))
            ctx.moveTo(p(serialWidth + checkboxWidth), i(0))
            ctx.lineTo(p(serialWidth + checkboxWidth), i(maxPoint.y))
            const checkboxX = serialWidth + ((checkboxWidth - checkWdith) / 2) // 绘制复选框居中的 x 左边
            for (const item of displayRows) {
                if (15 + item.y > -item.height) {
                    if (rowFocus && rowFocus.cellY === item.y) {
                        ctx.fillStyle = this.selectRowColor
                        ctx.fillRect(p(serialWidth), p(item.y), i(checkboxWidth - 1), i(item.height))
                    }
                    ctx.moveTo(p(serialWidth), p(item.y + item.height))
                    ctx.lineTo(p(serialWidth + checkboxWidth), p(item.y + item.height))
                    if (selected.indexOf(item.rowIndex) !== -1) {
                        ctx.drawImage(oncheck, checkboxX, p(item.y + 5), checkWdith, checkWdith)
                    } else {
                        ctx.drawImage(offcheck, checkboxX, p(item.y + 5), checkWdith, checkWdith)
                    }
                    this.checkboxs.push({
                        rowIndex: item.rowIndex,
                        x: checkboxX,
                        y: p(item.y + 5),
                        width: checkWdith,
                        height: checkWdith,
                    })
                }
            }
            ctx.stroke()
            if (this.focusCell) {
                ctx.beginPath()
                ctx.strokeStyle = this.focusColor
                ctx.lineWidth = 2
                ctx.moveTo(i(serialWidth + checkboxWidth), i(focusCell.y - 1))
                ctx.lineTo(i(serialWidth + checkboxWidth), i(focusCell.y + focusCell.height + 1))
                ctx.stroke()
            }
            ctx.beginPath()
            ctx.strokeStyle = this.borderColor
            ctx.fillStyle = this.fillColor
            ctx.lineWidth = 1
            ctx.fillRect(p(serialWidth + 1), p(0), i(checkboxWidth), i(rowHeight))
            ctx.moveTo(p(serialWidth), p(originPoint.y))
            ctx.lineTo(p(serialWidth + checkboxWidth), p(originPoint.y))
            ctx.lineTo(p(serialWidth + checkboxWidth), p(0))
            ctx.stroke()
            if (selected.length === allRows.length) {
                ctx.drawImage(oncheck, checkboxX, p(5), checkWdith, checkWdith)
            } else {
                ctx.drawImage(offcheck, checkboxX, p(5), checkWdith, checkWdith)
            }

            // ctx.beginPath()
            if (downWidth) {
                const antoHeight = (rowHeight - downWidth) / 2
                ctx.stroke()
                ctx.drawImage(down, checkboxX + 24, antoHeight, downWidth, downWidth)
            }
        },

        // 绘制最后一列固定的单元格
        paintFixedCells(ctx, displayFixedCells, displayColumns) {
            const { bodyHeight, rowHeight, maxPoint, paintText, paintButton, p, i, allColumns, fixedWidth, fixedColumns, rowFocus } = this
            ctx.save()
            const lastDisplayColumn = displayColumns[displayColumns.length - 1]
            if (lastDisplayColumn.cellIndex === allColumns.length - 1 - fixedColumns.length) {
                if (lastDisplayColumn.x + lastDisplayColumn.width > maxPoint.x) {
                    ctx.shadowBlur = 10
                    ctx.shadowColor = this.shadowColor
                }
            } else {
                ctx.shadowBlur = 10
                ctx.shadowColor = this.shadowColor
            }
            ctx.fillStyle = this.white
            ctx.fillRect(p(maxPoint.x), p(0), i(fixedWidth + 1), i(bodyHeight))
            ctx.restore()

            ctx.beginPath()
            ctx.fillStyle = this.textColor
            ctx.strokeStyle = this.borderColor
            ctx.lineWidth = 1
            let cellX = maxPoint.x
            for (const rows of displayFixedCells.reverse()) {
                let width = 0
                for (const item of rows) {
                    width = item.width
                    if (rowFocus && rowFocus.cellY === item.y) {
                        ctx.fillStyle = this.selectRowColor
                        ctx.fillRect(p(cellX), p(item.y), i(this.maxPoint.x), i(item.height))
                    }
                    if (item.buttons) {
                        paintButton(ctx, item, cellX)
                    } else if (item.paintText && item.paintText.length > 0) {
                        paintText(ctx, i(cellX + (item.width / 2)), i(15 + item.y), item.paintText)
                    }
                    ctx.moveTo(p(cellX), p(item.y))
                    ctx.lineTo(p(cellX), p(item.y + item.height))
                    ctx.lineTo(p(cellX + item.width), p(item.y + item.height))
                }
                cellX += width
            }
            ctx.stroke()

            ctx.beginPath()
            ctx.font = 'bold 12px PingFang SC'
            let columnX = maxPoint.x
            for (const column of fixedColumns) {
                let textColor = this.headerColor
                if (rowFocus && rowFocus.cellX === columnX) {
                    ctx.fillStyle = this.selectRowColor
                    ctx.fillRect(columnX, 0, column.width, rowHeight)
                    textColor = this.focusColor
                } else {
                    ctx.fillStyle = this.fillColor
                    ctx.fillRect(columnX, 0, column.width, rowHeight)
                }
                ctx.fillStyle = textColor
                ctx.fillText(column.title, i(columnX + (column.width / 2)), 15)
                ctx.moveTo(p(columnX), p(0))
                ctx.lineTo(p(columnX), p(rowHeight))
                ctx.lineTo(p(columnX + column.width), p(rowHeight))
                columnX += column.width
            }
            ctx.stroke()
        },


        paintButton(ctx, item, cellX) {
            let buttonGroupWidth = 0
            for (const button of item.buttons) {
                buttonGroupWidth += ctx.measureText(button.title).width
            }
            if (item.buttons.length > 1) {
                buttonGroupWidth += 20 * (item.buttons.length - 1)
            }
            let startX = 0
            if (item.width - buttonGroupWidth > 0) {
                startX = (item.width - buttonGroupWidth) / 2
            } else {
                startX = 0
            }
            ctx.save()
            ctx.font = 'normal 12px PingFang SC'
            for (const button of item.buttons) {
                const buttonWidth = ctx.measureText(button.title).width
                ctx.fillStyle = button.color ? button.color : this.buttonColor
                ctx.fillText(button.title, startX + cellX + (buttonWidth / 2), item.y + 15)
                this.renderButtons.push({
                    x: startX + cellX,
                    y: item.y + 7.5,
                    cellX,
                    cellY: item.y,
                    width: buttonWidth,
                    height: 12,
                    click: button.click,
                    rowIndex: item.rowIndex,
                    offset: { ...this.offset },
                    fixed: item.fixed,
                })
                startX += buttonWidth + 20
            }
            ctx.restore()
        },


        /**
         * @description 左上角表格绘制
         * @param {*} ctx
         */
        paintNo(ctx) {
            const {
                p,
                rowHeight, // 左上角表格高度
                serialWidth, // 左上角表格宽度
                setting, // 左上角设置图标
                settingWidth, // 左上角设置图标宽度
                settingHeight, // 左上角设置图标高度
            } = this
            ctx.beginPath()
            ctx.strokeStyle = this.borderColor
            ctx.fillStyle = this.fillColor
            ctx.fillRect(0, 0, serialWidth, rowHeight)

            ctx.fillStyle = this.headerColor
            // ctx.fillText('序号', serialWidth / 2, 15)
            ctx.lineWidth = 1
            ctx.moveTo(p(serialWidth), p(0))
            ctx.lineTo(p(serialWidth), p(rowHeight))
            ctx.lineTo(p(0), p(rowHeight))
            ctx.stroke()

            if (this.columnSet) {
                // (serialWidth - 16)/2
                ctx.drawImage(setting, (serialWidth - settingWidth) / 2, (rowHeight - settingHeight) / 2, settingWidth, settingHeight)
                // console.log('%c [ serialWidth ]-361', 'font-size:13px; background:pink; color:#bf2c9f;', serialWidth)
                // console.log('%c [ rowHeight ]-351', 'font-size:13px; background:pink; color:#bf2c9f;', rowHeight)
            }
        },


        paintScroller(ctx, height) {
            const p = this.p
            ctx.fillStyle = this.white
            ctx.fillRect((this.width - height) + 1, 0, height - 1, this.height)
            ctx.fillRect(0, (this.height - height) + 1, this.width, height - 1)
            ctx.beginPath()
            ctx.lineWidth = 1
            ctx.strokeStyle = this.borderColor
            ctx.moveTo(p((this.width - height) + 1), p(0))
            ctx.lineTo(p((this.width - height) + 1), p((this.height - height) + 1))
            ctx.lineTo(p(0), p((this.height - height) + 1))
            ctx.fillStyle = this.white
            ctx.fillRect(p((this.width - height) + 1), p((this.height - height) + 1), height - 1, height - 1)
            ctx.stroke()
        },


        // 给点击的焦点单元格绘制 焦点border
        paintFocus(ctx, cell) {
            const { i, originPoint, maxPoint } = this
            if (cell.x + cell.width > originPoint.x && cell.y + cell.height > originPoint.y && cell.x < maxPoint.x && cell.y < maxPoint.y) {
                ctx.lineWidth = 2
                ctx.strokeStyle = this.focusColor
                ctx.strokeRect(i(cell.x), i(cell.y), cell.width, cell.height)
            }
        },



        // 首列 文字填充
        paintSerial(ctx, displayRows) {
            const { p, offset, bodyHeight, rowFocus, serialWidth } = this
            if (!this.showCheckbox) {
                ctx.fillStyle = this.fillColumnColor
                ctx.save()
                if (offset.x !== 0) {
                    ctx.shadowBlur = 10
                    ctx.shadowOffsetX = 3
                    ctx.shadowColor = this.shadowColor
                }
                ctx.fillRect(0, 0, serialWidth, bodyHeight)
                ctx.restore()
            }

            ctx.lineWidth = 1
            for (const item of displayRows) {
                if (15 + item.y > -item.height) {
                    ctx.beginPath()
                    ctx.strokeStyle = this.borderColor
                    // 获取焦点单元格存在，或者 hover单元格存在
                    if ((rowFocus && rowFocus.cellY === item.y) || (this.hoverCell&&this.hoverCell.y === item.y)) {
                        ctx.fillStyle = this.selectRowColor
                        ctx.fillRect(-1, item.y + 1, serialWidth + 1, item.height)
                    }

                    ctx.fillStyle = this.textColor
                    ctx.font = 'normal 12px PingFang SC'

                    ctx.fillText(`${item.rowIndex + 1}`, serialWidth / 2, 15 + item.y)
                    ctx.moveTo(p(0), p(item.y + item.height))
                    ctx.lineTo(p(serialWidth), p(item.y + item.height))
                    ctx.stroke()

                    // if (item.showDot) {
                    //     ctx.beginPath()
                    //     ctx.fillStyle = this.dotColor
                    //     ctx.strokeStyle = this.fillColor
                    //     ctx.arc(15, 15 + item.y, 4, 0, 2 * Math.PI)
                    //     ctx.fill()
                    //     ctx.stroke()
                    // }
                }
            }
            ctx.stroke()

            // if (this.focusCell && !this.showCheckbox) {
            //     ctx.beginPath()
            //     ctx.strokeStyle = this.focusColor
            //     ctx.lineWidth = 2
            //     ctx.moveTo(i(serialWidth), i(focusCell.y - 1))
            //     ctx.lineTo(i(serialWidth), i(focusCell.y + focusCell.height + 1))
            //     ctx.stroke()
            // }
        },



        // 填充头部
        paintHeader(ctx, displayColumns) {
            const { p, width, rowHeight } = this
            ctx.fillStyle = this.fillColor
            ctx.fillRect(0, 0, width, rowHeight)
            ctx.beginPath()
            ctx.strokeStyle = this.borderColor
            ctx.font = 'bold 12px PingFang SC'
            ctx.lineWidth = 1
            for (const column of displayColumns) {
                if (!column.fixed || this.fillWidth > 0) {
                    ctx.fillStyle = this.headerColor
                    ctx.fillText(column.title, p(column.x + (column.width / 2)), p(15))
                    ctx.moveTo(p(column.x + column.width), p(0))
                    ctx.lineTo(p(column.x + column.width), p(rowHeight))
                }
            }
            ctx.stroke()
        },

        // 底部填充
        paintFooter(ctx, displayColumns) {
          const { p, width, rowHeight } = this
          // 底部固定区域填充背景色，白色
          ctx.fillStyle = '#fff'
          // 底部固定矩形左边宽高（x，y，w，h）
          ctx.fillRect(0, this.height - this.rowHeight - this.scrollerWidth - this.rowHeight , width, rowHeight)
          // 开始绘制
          ctx.beginPath()
          // 底部固定区域绘制的border 颜色
          ctx.strokeStyle = this.borderColor
          // 底部固定的字体
          ctx.font = 'normal 12px PingFang SC'
          // 底部固定区域绘制的border宽度
          ctx.lineWidth = 1
          let i = 0
          for (const column of displayColumns) {
              i++
              if (!column.fixed || this.fillWidth > 0) {
                  ctx.fillStyle = '#378efb'
                  // this.height - this.rowHeight - this.scrollerWidth
                  // ctx.fillText(column.title, p(column.x + (column.width / 2)),this.height - this.rowHeight - this.scrollerWidth + (this.rowHeight/2)- this.rowHeight)
                  if(i===5){//
                    ctx.fillStyle = '#bfbfbf'
                    ctx.fillText('请输入商品名称/编号/条码',p(displayColumns[0].x)+ this.serialWidth+30, this.height - this.rowHeight - this.scrollerWidth - this.rowHeight/2+2)
                    // 合并前4列表
                    ctx.moveTo(p(displayColumns[0].x), this.height - this.rowHeight - this.scrollerWidth- this.rowHeight)
                    ctx.lineTo(p(column.x + column.width)-column.width, this.height - this.rowHeight - this.scrollerWidth- this.rowHeight)
                    ctx.lineTo(p(column.x + column.width), this.height - this.rowHeight - this.scrollerWidth- this.rowHeight)
                    ctx.lineTo(p(column.x + column.width),  this.height - this.rowHeight - this.scrollerWidth + this.rowHeight- this.rowHeight)
                    //
                    ctx.stroke()
                  }else if(i>3){
                    ctx.moveTo(p(column.x + column.width)-column.width, this.height - this.rowHeight - this.scrollerWidth- this.rowHeight)
                    ctx.lineTo(p(column.x + column.width), this.height - this.rowHeight - this.scrollerWidth- this.rowHeight)
                    ctx.lineTo(p(column.x + column.width),  this.height - this.rowHeight - this.scrollerWidth + this.rowHeight- this.rowHeight)
                    //
                    ctx.stroke()
                  }



                  ctx.fillText(column.isTotal ? 100 :'', p(column.x + (column.width / 2)),this.height - this.rowHeight - this.scrollerWidth + (this.rowHeight/2))

                  ctx.moveTo(p(column.x + column.width)-column.width, this.height - this.rowHeight - this.scrollerWidth)
                  ctx.lineTo(p(column.x + column.width), this.height - this.rowHeight - this.scrollerWidth)
                  ctx.lineTo(p(column.x + column.width),  this.height - this.rowHeight - this.scrollerWidth + this.rowHeight)
              }
          }
          ctx.stroke()
      },

        // 绘制底部合并行
        paintTotal(ctx) {
          const {
              p,
              rowHeight, // 左上角表格高度
              serialWidth, // 左上角表格宽度
          } = this

          ctx.beginPath()
          ctx.strokeStyle = this.borderColor
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, this.height - this.rowHeight - this.scrollerWidth - this.rowHeight, serialWidth, rowHeight)

          ctx.fillStyle = this.headerColor
          // ctx.fillText('合并', serialWidth / 2, this.height - this.rowHeight - this.scrollerWidth + this.rowHeight/2 - this.rowHeight)
          ctx.lineWidth = 1
          ctx.moveTo(p(serialWidth)- this.serialWidth, this.height - this.rowHeight - this.scrollerWidth - this.rowHeight)
          ctx.lineTo(p(serialWidth), this.height - this.rowHeight - this.scrollerWidth- this.rowHeight)
          // ctx.lineTo(p(serialWidth), this.height - this.rowHeight - this.scrollerWidth)
          ctx.lineTo(p(serialWidth), this.height - this.rowHeight - this.scrollerWidth + this.rowHeight- this.rowHeight)
          // ctx.lineTo(p(0), p(rowHeight))
          ctx.stroke()

          // 合并
          ctx.beginPath()
          ctx.strokeStyle = this.borderColor
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, this.height - this.rowHeight - this.scrollerWidth, serialWidth, rowHeight)

          ctx.fillStyle = this.headerColor
          ctx.fillText('合并', serialWidth / 2, this.height - this.rowHeight - this.scrollerWidth + this.rowHeight/2)
          ctx.lineWidth = 1
          ctx.moveTo(p(serialWidth)- this.serialWidth, this.height - this.rowHeight - this.scrollerWidth )
          ctx.lineTo(p(serialWidth), this.height - this.rowHeight - this.scrollerWidth)
          // ctx.lineTo(p(serialWidth), this.height - this.rowHeight - this.scrollerWidth)
          ctx.lineTo(p(serialWidth), this.height - this.rowHeight - this.scrollerWidth + this.rowHeight)
          // ctx.lineTo(p(0), p(rowHeight))
          ctx.stroke()

          // if (this.columnSet) {
          //     // (serialWidth - 16)/2
          //     ctx.drawImage(setting, (serialWidth - settingWidth) / 2, (rowHeight - settingHeight) / 2, settingWidth, settingHeight)
          //     // console.log('%c [ serialWidth ]-361', 'font-size:13px; background:pink; color:#bf2c9f;', serialWidth)
          //     // console.log('%c [ rowHeight ]-351', 'font-size:13px; background:pink; color:#bf2c9f;', rowHeight)
          // }
      },

        hover(cell) {
          if (cell) {
            this.hoverCell = cell
            this.rowHover = {
                cellX: cell.x,
                cellY: cell.y,
                rowIndex: this.hoverCell.rowIndex,
                offset: { ...this.offset },
            }
            this.paintFocusCell(cell,true)
          }
        },

        // 画表体单元格线框
        paintLine(ctx, displayRows, displayColumns) {
            const { p, i, maxPoint, rowHeight, rowFocus, serialWidth, bodyHeight } = this

            // 画横线
            for (const item of displayRows) {
                if ((rowFocus && rowFocus.cellY === item.y) || (this.hoverCell&&this.hoverCell.y === item.y)) {
                    ctx.fillStyle = this.selectRowColor
                    ctx.fillRect(p(-1), p(item.y), i(maxPoint.x), i(item.height))
                }
            }

            ctx.beginPath()
            ctx.strokeStyle = this.borderColor
            ctx.lineWidth = 1
            // 画竖线
            for (const column of displayColumns) {
                if (!column.fixed) {
                    ctx.moveTo(p(column.x + column.width) + 0.25, i(0))
                    ctx.lineTo(p(column.x + column.width), i(bodyHeight))
                }
            }
            for (const item of displayRows) {
                ctx.moveTo(i(0), p(item.y + item.height))
                ctx.lineTo(i(maxPoint.x), p(item.y + item.height))
            }
            ctx.moveTo(p(serialWidth), p(rowHeight))
            ctx.lineTo(p(serialWidth), i(bodyHeight))
            ctx.moveTo(i(0), p(rowHeight))
            ctx.lineTo(i(maxPoint.x), p(rowHeight))

            ctx.stroke()
        },

        // 表体单元格内容填充
        paintBody(ctx, displayCells) {
            const { paintText, i } = this
            ctx.beginPath()
            ctx.font = 'normal 12px PingFang SC'
            ctx.fillStyle = this.textColor
            for (const rows of displayCells) {
                for (const item of rows) {
                    if (!item.fixed || this.fillWidth > 0) {
                        if (item.buttons) {
                            this.paintButton(ctx, item, i(item.x))
                        } else if (item.paintText && item.paintText.length > 0) {
                            paintText(ctx, i(item.x + (item.width / 2)), i(15 + item.y), item.paintText)
                        }
                    }
                }
            }
            ctx.stroke()
        },

        // 表体单元格内容填充 - 文本填充
        paintText(ctx, x, y, row) {
            for (let b = 0; b < row.length; b += 1) {
                ctx.fillText(row[b], x, y + (b * 18))
            }
        },
    },
}
