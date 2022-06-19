/**
 * 绘制
 */
export default {

    data() {
        const oncheck = new Image()
        oncheck.src = require('./images/oncheck.png')
        const offcheck = new Image()
        offcheck.src = require('./images/offcheck.png')
        const more = new Image()
        more.src = require('./images/more.png')
        const setting = new Image()
        setting.src = require('./images/setting.png')
        return {
            // 首行背景填充色
            fillColor: '#fafafa',
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
            // 区域框选 矩形的border颜色
            selectColor: 'red',
            // 区域框选 矩形的背景颜色
            selectAreaColor: 'rgba(160, 195, 255, 0.2)',
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
        }
    },
    methods: {
        /**
         * 初始化canvas
         */
        initCanvas() {
            // 通过 $refs 形式拿到 canvas 节点
            const canvas = this.$refs.canvas
            let ctx = ''
            // 检测示例上canvas上下文是否存在，如果存在 ctx 则赋值 this.ctx
            if (this.ctx) {
                ctx = this.ctx
            } else { // 如果不存在，则 ctx =赋值为生产的 上下文，并且上下文赋值给实列
                ctx = canvas.getContext('2d')
                this.ctx = ctx
            }
            // 字体设置
            ctx.font = 'normal 12px PingFang SC'
            // 解决 canvas 在高清屏中绘制模糊的问题,屏幕的设备像素比
            const backingStore = ctx.backingStorePixelRatio ||
                ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1
            this.ratio = (window.devicePixelRatio || 1) / backingStore
            // 获取所有的单元格
            this.getAllCells(this.data, this.columns)
            // 设置高度
            this.setBodyHeight(this.allRows, this.originPoint)
            // 设置最大点
            this.setMaxpoint(this.width, this.height, this.fixedWidth, this.scrollerWidth)
            // 重置滚动条
            this.resetScrollBar(this.maxPoint, this.bodyWidth, this.bodyHeight, this.fixedWidth)
        },
        /**
         * 判断一个数字是否是小数，传入的数字存在并且没有小数点，就返回这个值 加上0.5，否则原样返回
         * @param {*} value
         * @returns
         */
        p(value) {
            const temp = `${value}`
            if (temp && temp.indexOf && temp.indexOf('.') === -1) {
                return value + 0.5
            }
            return value
        },
        // 四舍五入到整数
        i(value) {
            return Math.round(value)
        },
        // 重新绘制
        rePainted() {
            let items = this.initDisplayItems()
            if (this.autoAddRow) { // 自动增加行，减少行
                if (items.displayRows[items.displayRows.length - 1].rowIndex >= this.allRows.length - 50) {
                    const startIndex = this.data.length
                    for (let i = 0; i < 100; i += 1) {
                        this.data.push(this.templateData)
                    }
                    this.setAllCells(startIndex)
                    items = this.initDisplayItems()
                } else if (this.data.length > this.initRows && items.displayRows[items.displayRows.length - 1].rowIndex <= this.allRows.length - 200) {
                    this.data.splice(this.data.length - 100, 100)
                    this.allCells.splice(this.allCells.length - 100, 100)
                    this.allRows.splice(this.allRows.length - 100, 100)
                    this.setBodyHeight(this.allRows, this.originPoint)
                    this.resetScrollBar(this.maxPoint, this.bodyWidth, this.bodyHeight, this.fixedWidth)
                    items = this.initDisplayItems()
                }
            }
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

            this.paintLine(ctx, displayRows, displayColumns)

            this.paintBody(ctx, displayCells)

            if (this.isSelect) {
                this.paintSelect(ctx, this.selectArea)
            }
            if (this.isFocus) {
                this.paintFocus(ctx, this.focusCell)
            }

            this.paintHeader(ctx, displayColumns)

            if (this.showCheckbox) {
                this.paintCheckbox(ctx, displayRows)
            }

            this.paintSerial(ctx, displayRows)

            this.paintNo(ctx)

            if (displayFixedCells.length > 0 && this.fillWidth === 0) {
                this.paintFixedCells(ctx, displayFixedCells, displayColumns)
            }

            this.painScroller(ctx, this.scrollerWidth)
        },
        paintCheckbox(ctx, displayRows) {
            this.checkboxs = []
            const { i, p, offset, maxPoint, allRows, focusCell, rowFocus, checkboxWidth, rowHeight, serialWidth, originPoint, height, oncheck, offcheck, selected } = this
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

            for (const item of displayRows) {
                if (15 + item.y > -item.height) {
                    if (rowFocus && rowFocus.cellY === item.y) {
                        ctx.fillStyle = this.selectRowColor
                        ctx.fillRect(p(serialWidth), p(item.y), i(checkboxWidth - 1), i(item.height))
                    }
                    ctx.moveTo(p(serialWidth), p(item.y + item.height))
                    ctx.lineTo(p(serialWidth + checkboxWidth), p(item.y + item.height))
                    if (selected.indexOf(item.rowIndex) !== -1) {
                        ctx.drawImage(oncheck, p(serialWidth + 5), p(item.y + 5), 20, 20)
                    } else {
                        ctx.drawImage(offcheck, p(serialWidth + 5), p(item.y + 5), 20, 20)
                    }
                    this.checkboxs.push({
                        rowIndex: item.rowIndex,
                        x: p(serialWidth + 5),
                        y: p(item.y + 5),
                        width: 20,
                        height: 20,
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
                ctx.drawImage(oncheck, p(serialWidth + 5), p(5), 20, 20)
            } else {
                ctx.drawImage(offcheck, p(serialWidth + 5), p(5), 20, 20)
            }
        },
        paintLine(ctx, displayRows, displayColumns) {
            const { p, i, maxPoint, rowHeight, rowFocus, serialWidth, bodyHeight } = this

            for (const item of displayRows) {
                if (rowFocus && rowFocus.cellY === item.y) {
                    ctx.fillStyle = this.selectRowColor
                    ctx.fillRect(p(-1), p(item.y), i(maxPoint.x), i(item.height))
                }
            }
            ctx.beginPath()
            ctx.strokeStyle = this.borderColor
            ctx.lineWidth = 1
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
                console.log('%c [ serialWidth ]-361', 'font-size:13px; background:pink; color:#bf2c9f;', serialWidth)
                console.log('%c [ rowHeight ]-351', 'font-size:13px; background:pink; color:#bf2c9f;', rowHeight)
            }
        },
        painScroller(ctx, height) {
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
        paintSelect(ctx, area) {
            const { p, originPoint, maxPoint } = this
            if (area.x + area.width > originPoint.x && area.y + area.height > originPoint.y && area.x < maxPoint.x && area.y < maxPoint.y) {
                ctx.beginPath()
                ctx.lineWidth = 1
                ctx.strokeStyle = this.selectColor
                ctx.moveTo(p(area.x), p(area.y))
                ctx.lineTo(p(area.x + area.width), p(area.y))
                ctx.lineTo(p(area.x + area.width), p(area.y + area.height))
                ctx.lineTo(p(area.x), p(area.y + area.height))
                ctx.closePath()
                ctx.fillStyle = this.selectAreaColor
                ctx.fill()
                ctx.stroke()
            }
        },
        paintFocus(ctx, cell) {
            const { i, originPoint, maxPoint } = this
            if (cell.x + cell.width > originPoint.x && cell.y + cell.height > originPoint.y && cell.x < maxPoint.x && cell.y < maxPoint.y) {
                ctx.lineWidth = 2
                ctx.strokeStyle = this.focusColor
                ctx.strokeRect(i(cell.x), i(cell.y), cell.width, cell.height)
            }
        },
        paintSerial(ctx, displayRows) {
            const { i, p, offset, bodyHeight, focusCell, rowFocus, serialWidth } = this
            if (!this.showCheckbox) {
                ctx.fillStyle = this.fillColor
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
                    let textColor = this.textColor
                    if (rowFocus && rowFocus.cellY === item.y) {
                        ctx.fillStyle = this.selectRowColor
                        ctx.fillRect(-1, item.y + 1, serialWidth + 1, item.height)
                        textColor = this.focusColor
                    }
                    ctx.fillStyle = textColor

                    ctx.fillText(`${item.rowIndex + 1}`, serialWidth / 2, 15 + item.y)
                    ctx.moveTo(p(0), p(item.y + item.height))
                    ctx.lineTo(p(serialWidth), p(item.y + item.height))
                    ctx.stroke()

                    if (item.showDot) {
                        ctx.beginPath()
                        ctx.fillStyle = this.dotColor
                        ctx.strokeStyle = this.fillColor
                        ctx.arc(15, 15 + item.y, 4, 0, 2 * Math.PI)
                        ctx.fill()
                        ctx.stroke()
                    }
                }
            }
            ctx.stroke()

            if (this.focusCell && !this.showCheckbox) {
                ctx.beginPath()
                ctx.strokeStyle = this.focusColor
                ctx.lineWidth = 2
                ctx.moveTo(i(serialWidth), i(focusCell.y - 1))
                ctx.lineTo(i(serialWidth), i(focusCell.y + focusCell.height + 1))
                ctx.stroke()
            }
        },
        paintHeader(ctx, displayColumns) {
            const { p, i, focusCell, width, rowHeight, rowFocus } = this
            ctx.fillStyle = this.fillColor
            ctx.fillRect(0, 0, width, rowHeight)
            ctx.beginPath()
            ctx.strokeStyle = this.borderColor
            ctx.font = 'bold 12px PingFang SC'
            ctx.lineWidth = 1
            for (const column of displayColumns) {
                if (!column.fixed || this.fillWidth > 0) {
                    let textColor = this.headerColor
                    if (rowFocus && rowFocus.cellX === column.x) {
                        ctx.fillStyle = this.selectRowColor
                        ctx.fillRect(p(column.x), p(0), p(column.width), p(rowHeight - 1))
                        textColor = this.focusColor
                    }
                    ctx.fillStyle = textColor
                    ctx.fillText(column.title, p(column.x + (column.width / 2)), p(15))
                    ctx.moveTo(p(column.x + column.width), p(0))
                    ctx.lineTo(p(column.x + column.width), p(rowHeight))
                }
            }
            ctx.stroke()

            if (focusCell) {
                ctx.beginPath()
                ctx.strokeStyle = this.focusColor
                ctx.lineWidth = 2
                ctx.moveTo(i(focusCell.x - 1), i(rowHeight))
                ctx.lineTo(i(focusCell.x + focusCell.width + 1), i(rowHeight))
                ctx.stroke()
            }
        },
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
        paintText(ctx, x, y, row) {
            for (let b = 0; b < row.length; b += 1) {
                ctx.fillText(row[b], x, y + (b * 18))
            }
        },
    },
}
