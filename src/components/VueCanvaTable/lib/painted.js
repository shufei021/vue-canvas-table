/**
 * 绘制
 */
 import { throttle } from "../utils"
 import {drawAddAndReduceCell,drawArrow} from "../components/sort"
 export default {
  data () {
    const setting = new Image()
    setting.src = require('../images/setting.png')
    const imgLoadingFail = new Image()
    imgLoadingFail.src = require('../images/loading_fail.png')

    const checkedOff = new Image()
    checkedOff.src = require('../images/checkoff.png')

    const checkedOn = new Image()
    checkedOn.src = require('../images/checked.png')

    const arrowR = new Image()
    arrowR.src = require('../images/arrow-r.png')
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
      // 设置图标
      setting,
      // 设置图标 宽度
      settingWidth: 16,
      // 设置图标 高度
      settingHeight: 16,
      // 复选框图标宽度
      checkWdith: 20,
      // 图片加载失败的默认图片
      imgLoadingFail, // 左上角
      checkedOff,
      checkedOn,
      arrowR
    }
  },
  methods: {
    initCanvas () {
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
    p (value) {
      const temp = `${value}`
      if (temp && temp.indexOf && temp.indexOf('.') === -1) {
        return value + 0.5
      }
      return value
    },
    i (value) {
      return Math.round(value)
    },
    rePainted () {
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

    clearPainted () {
      this.ctx.clearRect(0, 0, this.width, this.height)
    },

    painted (displayItems) {
      const ctx = this.ctx
      const { displayColumns, displayRows, displayCells, displayFixedCells } = displayItems

      ctx.fillStyle = this.headerColor// text color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineWidth = 1
      ctx.strokeStyle = this.borderColor
      ctx.save()

      this.renderButtons = []



      //  body border
      this.paintLine(ctx, displayRows, displayColumns)

      // // body content
      this.paintBody(ctx, displayCells)

      // // focus cell
      // if (this.isFocus && this.focusCell) this.paintFocus(ctx, this.focusCell)

      // // 绘制表头
      this.paintHeader(ctx, displayColumns)


      // 绘制首列
      this.paintSerial(ctx, displayRows)

       // 绘制倒三角
       this.paintNo(ctx)





      if (displayFixedCells.length > 0 && this.fillWidth === 0) {
        this.paintFixedCells(ctx, displayFixedCells, displayColumns)
      }

      this.paintScroller(ctx, this.scrollerWidth)

      this.paintFooter(ctx, displayColumns)

      // 绘制底部表尾巴固定合计行
      this.paintTotal(ctx)
    },

    // 绘制最后一列固定的单元格
    paintFixedCells (ctx, displayFixedCells, displayColumns) {
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

      // 画线
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

      // 列头
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

    paintButton (ctx, item, cellX) {
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
          fixed: item.fixed
        })
        startX += buttonWidth + 20
      }
      ctx.restore()
    },

    /**
     * @description 左上角表格绘制
     * @param {*} ctx
     */
    paintNo (ctx) {
      const {
        p,
        rowHeight, // 左上角表格高度
        serialWidth, // 左上角表格宽度
        setting, // 左上角设置图标
        settingWidth, // 左上角设置图标宽度
        settingHeight // 左上角设置图标高度
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

    paintScroller (ctx, height) {
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
    paintFocus (ctx, cell) {
      const { i, originPoint, maxPoint } = this
      if (cell.x + cell.width > originPoint.x && cell.y + cell.height > originPoint.y && cell.x < maxPoint.x && cell.y < maxPoint.y) {
        ctx.lineWidth = 1
        ctx.strokeStyle = this.focusColor
        ctx.strokeRect(i(cell.x), i(cell.y), cell.width, cell.height)
      }
    },

    // 首列 文字填充
    paintSerial (ctx, displayRows) {
      const { p, offset, bodyHeight, rowFocus, serialWidth } = this
      // 设置蒙层
      ctx.fillStyle = this.fillColumnColor
      ctx.save()
      if (offset.x !== 0) {
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 3
        ctx.shadowColor = this.shadowColor
      }
      ctx.fillRect(0, 0, serialWidth, bodyHeight)
      ctx.restore()
      // 首列
      ctx.lineWidth = 1

      for (const [index,item] of displayRows.entries()) {
        if (15 + item.y > -item.height) {

          ctx.beginPath()
          ctx.strokeStyle = this.borderColor
          // 获取焦点单元格存在，或者 hover单元格存在
          if ((rowFocus && rowFocus.cellY === item.y) || (this.hoverCell && this.hoverCell.y === item.y )) {
            ctx.fillStyle = this.selectRowColor
            ctx.fillRect(-1, item.y + 1, serialWidth + 1, item.height)

            if(this.sortType===1){
              drawAddAndReduceCell.call(this,ctx,item.y + 1,item)
            }else{
              ctx.drawImage(this.arrowR, this.i(this.serialWidth/2) -10,item.y + (this.rowHeight - 20)/2, 20, 20)
              ctx.strokeStyle = this.borderColor
              ctx.moveTo(p(0), p(item.y + item.height))
              ctx.lineTo(p(serialWidth), p(item.y + item.height))
              ctx.stroke()
            }
          }else{
            ctx.fillStyle = this.textColor
            ctx.font = 'normal 12px PingFang SC'
            ctx.fillText(`${item.rowIndex + 1}`, serialWidth / 2, 15 + item.y)
            ctx.moveTo(p(0), p(item.y + item.height))
            ctx.lineTo(p(serialWidth), p(item.y + item.height))
            ctx.stroke()
          }



        }

      }
      // if(this.allStatsList && this.allStatsList.length){
      //   const len = this.allStatsList.length
      //   ctx.fillStyle = '#fff'
      //   ctx.fillRect(0, this.height - 18 - 1- this.rowHeight*len, serialWidth, this.rowHeight*len)
      //   for(const item of this.allStatsList){
      //     // ctx.fillStyle = '#fff'
      //     // ctx.fillRect(0, 1017, this.width, this.rowHeight*2+4)
      //     // console.log('%c [ item ]-543', 'font-size:13px; background:pink; color:#bf2c9f;', item)
      //     // // ctx.fillStyle = this.textColor
      //     // ctx.font = 'normal 12px PingFang SC'
      //     // ctx.fillText(item.index, serialWidth / 2, 1020)
      //     // ctx.moveTo(p(0), 1050)
      //     // ctx.lineTo(p(serialWidth), 1050)
      //     // ctx.stroke()
      //   }
      // }
      // ctx.stroke()

    },

    // 填充头部
    paintHeader (ctx, displayColumns) {
      const { p, i, width, rowHeight } = this
      ctx.fillStyle = this.fillColor
      ctx.save()
      ctx.fillRect(0, 0, width, rowHeight)
      ctx.beginPath()
      ctx.strokeStyle = this.borderColor
      ctx.font = 'bold 12px PingFang SC'
      // ctx.lineWidth = 1
      if(this.sortCell){
        ctx.fillStyle = '#e9e9e9'
        ctx.fillRect(i(this.sortCell.x), 0, this.sortCell.width, rowHeight)
      }
      for (const column of displayColumns) {
        ctx.moveTo(p(column.x + column.width), p(0))
        ctx.lineTo(p(column.x + column.width), p(rowHeight))
        ctx.stroke()
      }
      for (const column of displayColumns) {
        if (!column.fixed || this.fillWidth > 0) {
          ctx.fillStyle = this.headerColor
          if(column.center){
            ctx.fillText(column.title, p(column.x + (column.width / 2)), p(15))
          } else{
            if(column.tip){
              const x = p(column.x)  +this.i((ctx.measureText(column.title).width)/2)  + 10
              ctx.drawImage(
                column.tip.img,
                p(column.x) + 10,
                (rowHeight - column.tip.size) / 2,
                column.tip.size,
                column.tip.size
              )
              column.tip.point={x:p(column.x) + 10,y: (rowHeight - column.tip.size) / 2}
              ctx.fillText(column.title, x + column.tip.size +5, p(15))
            }else{
              ctx.fillText(column.title, p(column.x)  +this.i(ctx.measureText(column.title).width/2)  + 10 , p(15))
            }
            if(column.sort){
              ctx.save()
              const width = 10
              const height = 5
              const gap = 2
              const _height = height*2  + gap
              const x_offset = i(p(column.x)  + this.i(ctx.measureText(column.title).width)  + 20)
              const y_offset = i((this.rowHeight - _height)/2)
              const offset = column.tip?column.tip.size : 0
              // 上三角
              ctx.beginPath();
              // ctx.fillStyle="#409eff"
              ctx.fillStyle= column.sort === 'up'?  '#409eff':"#c0c4cc"
              ctx.moveTo(x_offset + width/2 + offset , y_offset );
              ctx.lineTo(x_offset + offset, y_offset + height);
              ctx.lineTo(x_offset + width + offset,y_offset + height);
              ctx.closePath();
              ctx.fill();

              ctx.beginPath();
              ctx.fillStyle= column.sort === 'down'? '#409eff':"#c0c4cc"
              ctx.moveTo(x_offset + width/2 + offset, y_offset + _height );
              ctx.lineTo(x_offset + offset, y_offset + height + gap);
              ctx.lineTo(x_offset + width + offset, y_offset + height + gap);
              ctx.closePath();
              ctx.fill();
              ctx.restore()
            }
          }

        }
      }
    },

    // 底部填充
    paintFooter (ctx, displayColumns) {
      const { p, width, rowHeight } = this

      // 底部固定区域填充背景色，白色
      ctx.fillStyle = '#fff'
      // 底部固定矩形左边宽高（x，y，w，h）
      ctx.fillRect(0, this.height - this.rowHeight - this.scrollerWidth - this.rowHeight, width, rowHeight)
      // 开始绘制
      ctx.beginPath()
      // 底部固定区域绘制的border 颜色
      ctx.strokeStyle = this.borderColor
      // 底部固定的字体
      ctx.font = 'normal 12px PingFang SC'
      // 底部固定区域绘制的border宽度
      ctx.lineWidth = 1
      for (const [index,column] of displayColumns.entries()) {
        if (!column.fixed || this.fillWidth > 0) {
          ctx.fillStyle = '#378efb'

          const y = this.height - this.rowHeight - this.scrollerWidth

          if(this.allColumns.slice(0,4).map(i=>i.key).includes(column.key)){
            ctx.moveTo(p(column.x + column.width) - column.width, y - this.rowHeight)
            ctx.lineTo(p(column.x + column.width), y - this.rowHeight)
            if(this.allColumns[0].key===column.key &&index===0){
              ctx.fillStyle = '#bfbfbf'
              ctx.fillText('请输入商品名称/编号/条码', p(column.x)  +this.i(ctx.measureText('请输入商品名称/编号/条码').width/2)  + 10, y - this.rowHeight / 2 + 2)
            }else if(this.allColumns[1].key===column.key && index===0){
              ctx.fillStyle = '#bfbfbf'
              ctx.fillText('请输入商品名称/编号/条码', p(displayColumns[0].x)  +this.i(ctx.measureText('请输入商品名称/编号/条码').width/2) + 10 +this.offset.x, y - this.rowHeight / 2 + 2)
            }
            // if (index === 4) { //
            //   ctx.fillStyle = '#bfbfbf'
            //   ctx.fillText('请输入商品名称/编号/条码', p(displayColumns[0].x+this.offset.x)  +this.i(ctx.measureText('请输入商品名称/编号/条码').width/2)  + 10, y - this.rowHeight / 2 + 2)
            //   // 合并前4列表
            //   ctx.moveTo(p(displayColumns[0].x), y - this.rowHeight)
            //   ctx.lineTo(p(column.x + column.width) - column.width, y - this.rowHeight)
            //   ctx.lineTo(p(column.x + column.width), y - this.rowHeight)
            //   ctx.lineTo(p(column.x + column.width), y)
            // } else if(index>4) {
            //   ctx.moveTo(p(column.x + column.width) - column.width, y - this.rowHeight)
            //   ctx.lineTo(p(column.x + column.width), y - this.rowHeight)
            //   ctx.lineTo(p(column.x + column.width), y)
            // }
          } else {
                ctx.moveTo(p(column.x + column.width) - column.width, y - this.rowHeight)
                ctx.lineTo(p(column.x + column.width), y - this.rowHeight)
                ctx.lineTo(p(column.x + column.width), y)
          }




          // index ===0 &&  ctx.fillText('请输入', p(column.x)  +this.i(ctx.measureText('请输入').width/2)  + 10, y - this.rowHeight / 2 + 2)
          // ctx.moveTo(p(column.x + column.width) - column.width, y - this.rowHeight)
          // ctx.lineTo(p(column.x + column.width), y - this.rowHeight)
          //   ctx.lineTo(p(column.x + column.width), y)
          ctx.fillText(column.isTotal ? column.total : '', p(column.x)  +this.i(ctx.measureText(column.total).width/2)  + 10, y + (this.rowHeight / 2)+2)

          ctx.moveTo(p(column.x + column.width) - column.width, y)
          ctx.lineTo(p(column.x + column.width), y)
          ctx.lineTo(p(column.x + column.width), y + this.rowHeight)
        }
      }
      ctx.stroke()
    },

    // 绘制底部合并行
    paintTotal (ctx) {
      const {
        p,
        rowHeight, // 左上角表格高度
        serialWidth // 左上角表格宽度
      } = this

      ctx.beginPath()
      ctx.strokeStyle = this.borderColor
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, this.height - this.rowHeight - this.scrollerWidth - this.rowHeight, serialWidth, rowHeight)

      ctx.fillStyle = this.headerColor
      // ctx.fillText('合并', serialWidth / 2, this.height - this.rowHeight - this.scrollerWidth + this.rowHeight/2 - this.rowHeight)
      ctx.lineWidth = 1
      ctx.moveTo(p(serialWidth) - this.serialWidth, this.height - this.rowHeight - this.scrollerWidth - this.rowHeight)
      ctx.lineTo(p(serialWidth), this.height - this.rowHeight - this.scrollerWidth - this.rowHeight)
      // ctx.lineTo(p(serialWidth), this.height - this.rowHeight - this.scrollerWidth)
      ctx.lineTo(p(serialWidth), this.height - this.rowHeight - this.scrollerWidth + this.rowHeight - this.rowHeight)
      // ctx.lineTo(p(0), p(rowHeight))
      ctx.stroke()


      // 合并
      ctx.beginPath()
      ctx.strokeStyle = this.borderColor
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, this.height - this.rowHeight - this.scrollerWidth, serialWidth, rowHeight)

      ctx.fillStyle = this.headerColor
      ctx.fillText('合计', serialWidth / 2, this.height - this.rowHeight - this.scrollerWidth + this.rowHeight / 2)
      ctx.lineWidth = 1
      ctx.moveTo(p(serialWidth) - this.serialWidth, this.height - this.rowHeight - this.scrollerWidth)
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

    paintBodyRowHover (cell) {
      if (cell) {
        this.hoverCell = cell
        this.rowHover = {
          cellX: cell.x,
          cellY: cell.y,
          rowIndex: this.hoverCell.rowIndex,
          offset: { ...this.offset }
        }
        this.paintFocusCell(cell, true)
      }
    },

    paintHeaderSortCellHover(cell){
      this.sortCell = cell
      this.rePainted()
    },


    // 画表体单元格线框
    paintLine (ctx, displayRows, displayColumns) {
      const { p, i, maxPoint, rowHeight, rowFocus, serialWidth, bodyHeight } = this
      // 过滤出 需要渲染列表背景色的 Columns
      const bgColumns = displayColumns.filter(i=>i.isCloumnBg)

      // 行背景色
      for (const item of displayRows) {
        if ((rowFocus && rowFocus.cellY === item.y) || (this.hoverCell && this.hoverCell.y === item.y)) {
          ctx.fillStyle = this.selectRowColor
          ctx.fillRect(p(-1), p(item.y), i(maxPoint.x), i(item.height))
        }else{
          // 列背景色设置
          for(const column of bgColumns){
            ctx.fillStyle = '#fafafa'
            ctx.fillRect(
              column.x,
              p(item.y),
              column.width,
              column.height
            )
          }
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
        const { paintText, i, p } = this
        ctx.beginPath()
        ctx.font = 'normal 12px PingFang SC'
        ctx.fillStyle = this.textColor
        // 显示的单元格
        for (const [rowIndex,rows] of displayCells.entries() ) {
          if( rowIndex===displayCells.length){
            // ctx.fillStyle = '#fff'
            // ctx.fillRect(0, this.height - this.rowHeight - this.scrollerWidth, this.width, this.rowHeight)
          }else{
            for (const  item of rows) {

              // 找到单元格对应的列
              const column = this.columns.find(i=>i.key===item.key)

              if (!item.fixed || this.fillWidth > 0) {
                // 如果文本存在有值
                if (item.paintText && item.paintText.length) {
                  // 文本内容
                  const text = item.paintText[0]



                  // const _txt = String(text).slice(0,this.getWdithIndex(ctx,text,item.width-20))+'...'
                  // 如果当前单元格对应列是居中
                  if(column.center){
                    // 如果是渲染图片
                    if(column.isImage){
                      ctx.drawImage(item.rowData.image, i(item.x + (item.width / 2)-10), i(15 + item.y-10), 20, 20)
                    }else if(column.isCheckbox){// 如果是复选框
                      ctx.drawImage(item.rowData[column.key]=='1'? this.checkedOn : this.checkedOff, i(item.x + (item.width / 2)-10), i(15 + item.y-10), 20, 20)
                    }else{
                      // 文本内容才canvas 的宽度
                      const _w = ctx.measureText(text).width
                      // 超出的文本
                      if(_w>item.width-20){
                        const _txt = String(text).slice(0,this.getWdithIndex(ctx,text,item.width-20))+'...'
                        // 文本超出的 x值
                       const _x = i(item.x + (item.width / 2))-3
                        ctx.fillText(
                          _txt,
                          _x,
                          i(15 + item.y)+2
                        )
                        // text = _txt
                        item.paintText.length==1 && item.paintText.push(_txt)
                        // item.Text = _txt
                      }else{
                        ctx.fillText(
                          text,
                          i(item.x)+i(_w/2)+10,
                          i(15 + item.y)+2
                        )
                      }
                    }
                  }else{
                    // 文本内容才canvas 的宽度
                    const _w = ctx.measureText(text).width
                    if(_w>item.width-20){
                      const _txt = String(text).slice(0,this.getWdithIndex(ctx,text,item.width-20))+'...'
                      // 文本超出的 x值
                      const _x = i(item.x + (item.width / 2))-3
                        // 超出的文本
                      ctx.fillText(
                        _txt,
                        _x,
                        i(15 + item.y)+2
                      )
                      // item.Text = _txt
                      item.paintText.length==1 && item.paintText.push(_txt)
                    }else{
                      ctx.fillText(
                        text,
                        i(item.x)+i(_w/2)+10,
                        i(15 + item.y)+2
                      )
                    }
                  }
                }
              }
            }
          }
        }
        ctx.stroke()
    },


    getWdithIndex(ctx,str,width){
      let result = []
      for(let i = 0; i < str.length;i++){
        result.push(ctx.measureText(str.slice(0,i+1)).width)
      }
      const dotWdith= ctx.measureText('...').width
      const index = result.findIndex(i=>i+dotWdith>width)
      return index
    },


    // 表体单元格内容填充 - 文本填充
    paintText (ctx, x, y, row,item,column) {
      if(ctx.measureText(row[0]).width>column.width-20){
        ctx.fillText(String(row[0]).slice(0,this.getWdithIndex(ctx,row[0],column.width-20))+'...', x, y+2 )
      }else{
        ctx.fillText(row[0], x, y+2 )
      }
    }
  }
}
