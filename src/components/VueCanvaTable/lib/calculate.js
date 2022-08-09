
/**
 * 计算
 */
 export default {
  data () {
    const rowHeight = 30
    const serialWidth = 57
    const checkboxWidth = 80
    const scrollerWidth = 20
    const height = this.leftHeight ? window.innerHeight - this.leftHeight : 500
    let originPointX = serialWidth

    const bottomFixedRows = 2
    return {
      width: 0,
      height,
      rowHeight,
      scrollerWidth,
      fixedWidth: 0,
      bodyWidth: 0,
      bodyHeight: 0,
      serialWidth,
      checkboxWidth,
      fillWidth: 0,
      bottomFixedRows,

      allCells: [],
      displayCells: [],
      allRows: [],
      displayRows: [],
      allColumns: [],
      displayColumns: [],
      allFixedCells: [],
      displayFixedCells: [],
      fixedColumns: [],
      renderButtons: [],
      checkboxs: [],
      selected: [],

      offset: {
        x: 0,
        y: 0
      },
      originPoint: {
        x: originPointX,
        y: rowHeight
      },
      maxPoint: {
        x: 0,
        y: height - scrollerWidth
      }
    }
  },
  watch: {
    leftHeight () {
      this.initSize()
    }
  },
  mounted () {
    this.width = this.$refs.grid.offsetWidth - 2

    this.height = this.leftHeight ? window.innerHeight - this.leftHeight : 500
    this.maxPoint.y = this.height - this.scrollerWidth - this.bottomFixedRows*this.rowHeight

    this.bodyWidth = this.originPoint.x
    for (const column of this.columns) {
      this.bodyWidth += column.width ? column.width : 100
    }
    // if (this.bodyWidth < this.width - this.scrollerWidth) {
    //   this.fillWidth = (this.width - this.bodyWidth - this.scrollerWidth) / this.columns.length
    //   this.bodyWidth = this.width - this.scrollerWidth
    // }
  },
  methods: {
    // 初始化尺寸大小
    initSize () {
      if (this.$refs.grid) {
        this.width = this.$refs.grid.offsetWidth - 2
        this.height = this.leftHeight ? window.innerHeight - this.leftHeight : 50


        this.originPoint.x = this.serialWidth
        this.bodyWidth -= this.checkboxWidth

        this.bodyWidth = this.originPoint.x
        let columnCount = 0
        for (const column of this.allColumns) {
          if (column.checked) {
            this.bodyWidth += column.width ? column.width : 100
            columnCount += 1
          }
        }
        // this.fillWidth = 0
        // if (this.bodyWidth < this.width - this.scrollerWidth) {
        //   this.fillWidth = (this.width - this.bodyWidth - this.scrollerWidth) / columnCount
        //   this.bodyWidth = this.width - this.scrollerWidth
        // }
        this.setBodyHeight(this.allRows, this.originPoint)
        this.setFixedWidth(this.allColumns, this.fillWidth)
        this.setMaxpoint(this.width, this.height, this.fixedWidth, this.scrollerWidth, this.fillWidth)
        this.resetScrollBar(this.maxPoint, this.bodyWidth, this.bodyHeight, this.fixedWidth)
        requestAnimationFrame(this.rePainted)
      }
    },

    // 设置固定列表宽度值
    setFixedWidth (allColumns, fillWidth) {
      // 固定宽度值0
      this.fixedWidth = 0
      for (const column of allColumns) {
        // 如果当前列是复选框和固定列
        if (column.checked && column.fixed) {
          //  固定宽度值 进行累加
          this.fixedWidth += column.width ? column.width : 100
          this.fixedWidth += fillWidth
        }
      }
    },

    // 设置表体绘制高度
    setBodyHeight (allRows, { y }) {
      // 单元格的高度
      this.bodyHeight = y
      const unit = y
      for (const row of allRows) {
        this.bodyHeight += row.height
      }
      // 固定底部1行 1行高度30
      this.bodyHeight = this.bodyHeight
    },

    // 设置最大点
    setMaxpoint (width, height, fixedWidth, scrollerWidth, fillWidth) {
      if (fillWidth > 0) {
        this.maxPoint.x = width - scrollerWidth
      } else {
        this.maxPoint.x = width - scrollerWidth - fixedWidth
      }
      this.maxPoint.y = height - scrollerWidth - (this.bottomFixedRows * this.rowHeight)
    },

    getAllCells (value, columns) {
      this.allCells = []
      this.allRows = []
      this.allColumns = []
      this.allFixedCells = []
      this.fixedColumns = []
      this.fixedWidth = 0
      const { rowHeight, ctx, getTextLine, allRows, allCells, allColumns, fixedColumns, allFixedCells } = this
      let rowIndex = 0
      for (const item of value) {
        let maxHeight = rowHeight
        let cellIndex = 0
        const cellTemp = []
        for (const column of columns) {
          if (rowIndex === 0) {
            if (column.fixed) {
              // this.fixedWidth += column.width
              fixedColumns.push({
                cellIndex,
                ...column
              })
              allColumns.push({
                height: rowHeight,
                cellIndex,
                ...column,
                checked: true
              })
            } else {
              allColumns.push({
                height: rowHeight,
                cellIndex,
                ...column,
                checked: true
              })
            }
          }
          let text = ''
          let buttons
          let textLine
          if (column.renderText) {
            text = column.renderText(item)
          } else {
            text = item[column.key]
          }
          if (text || text === 0) {
            textLine = getTextLine(ctx, text, column.width ? column.width : 100,item)
            let textLineCount = 0
            if (textLine) {
              textLineCount = textLine.length
            }
            if (textLineCount > 1) {
              if (maxHeight < rowHeight + ((textLineCount - 1) * 18)) {
                maxHeight = rowHeight + ((textLineCount - 1) * 18)
              }
            }
          }

          if (column.fixed) {
            cellTemp.push({
              width: column.width ? column.width : 100,
              content: item[column.key],
              key: column.key,
              rowIndex,
              cellIndex,
              paintText: textLine,
              fixed: column.fixed === true,
              readOnly: column.readOnly === true,
              buttons,
              renderText: column.renderText,
              rowData: item,
              type: column.type
            })
          } else {
            cellTemp.push({
              width: column.width ? column.width : 100,
              content: item[column.key],
              key: column.key,
              rowIndex,
              cellIndex,
              paintText: textLine,
              fixed: column.fixed === true,
              readOnly: column.readOnly === true,
              buttons,
              renderText: column.renderText,
              rowData: item,
              type: column.type
            })
          }
          cellIndex += 1
        }
        allCells.push(cellTemp)

        let showDot = false
        if (this.showDot) {
          if (item[this.showDot.key] === this.showDot.value) {
            showDot = true
          }
        }
        allRows.push({
          height: maxHeight,
          rowIndex,
          showDot
        })
        rowIndex += 1
      }
      for (const item of fixedColumns) {
        const temp = []
        let index = 0
        for (const row of allCells) {
          const cell = row[item.cellIndex]
          temp.push({
            ...cell,
            height: allRows[index].height
          })
          index += 1
        }
        allFixedCells.push(temp)
      }
    },

    setAllCells (startIndex) {
      const { rowHeight, ctx, getTextLine, allRows, allCells, columns } = this
      let rowIndex = startIndex
      for (let i = startIndex; i < this.data.length; i += 1) {
        const item = this.data[i]
        let maxHeight = rowHeight
        let cellIndex = 0
        const cellTemp = []
        for (const column of columns) {
          let text = ''
          let buttons
          let textLine
          if (column.renderText) {
            text = column.renderText(item)
          }  else {
            text = item[column.key]
          }
          if (text || text === 0) {
            textLine = getTextLine(ctx, text, column.width ? column.width : 100,item)
            let textLineCount = 0
            if (textLine) {
              textLineCount = textLine.length
            }
            if (textLineCount > 1) {
              if (maxHeight < rowHeight + ((textLineCount - 1) * 18)) {
                maxHeight = rowHeight + ((textLineCount - 1) * 18)
              }
            }
          }
          cellTemp.push({
            width: column.width ? column.width : 100,
            content: item[column.key],
            key: column.key,
            rowIndex,
            cellIndex,
            paintText: textLine,
            fixed: column.fixed === true,
            readOnly: column.readOnly === true,
            buttons,
            renderText: column.renderText,
            rowData: item,
            type: column.type
          })
          cellIndex += 1
        }
        allCells.push(cellTemp)

        let showDot = false
        if (this.showDot) {
          if (item[this.showDot.key] === this.showDot.value) {
            showDot = true
          }
        }
        allRows.push({
          height: maxHeight,
          rowIndex,
          showDot
        })
        rowIndex += 1
      }
      this.setBodyHeight(this.allRows, this.originPoint)
      this.resetScrollBar(this.maxPoint, this.bodyWidth, this.bodyHeight, this.fixedWidth)
    },

    initRowHeight () {

    },

    setCellItem (rowIndex, cellIndex, text) {
      const { ctx, allRows, allCells, getTextLine, rowHeight } = this
      const row = allRows[rowIndex]
      const cell = allCells[rowIndex][cellIndex]
      let maxHeight = 0
      const textLine = getTextLine(ctx, text, cell.width,cell)
      let textLineCount = 0
      if (textLine) {
        textLineCount = textLine.length
      }
      if (textLineCount > 1) {
        if (maxHeight < rowHeight + ((textLineCount - 1) * 18)) {
          maxHeight = rowHeight + ((textLineCount - 1) * 18)
        }
      }
      if (maxHeight > row.height) {
        row.height = maxHeight
      }
      cell.content = text
      cell.paintText = textLine
    },

    setCellItemByKey (rowIndex, key, text) {
      const { ctx, allRows, allCells, getTextLine, rowHeight } = this
      const row = allRows[rowIndex]
      const cells = allCells[rowIndex]
      let index = 0
      let cell = null
      for (const item of cells) {
        if (item.key === key) {
          cell = allCells[rowIndex][index]
          break
        }
        index += 1
      }
      if (cell) {
        let maxHeight = 0
        const textLine = getTextLine(ctx, text, cell.width,cell)
        let textLineCount = 0
        if (textLine) {
          textLineCount = textLine.length
        }
        if (textLineCount > 1) {
          if (maxHeight < rowHeight + ((textLineCount - 1) * 18)) {
            maxHeight = rowHeight + ((textLineCount - 1) * 18)
          }
        }
        if (maxHeight > row.height) {
          row.height = maxHeight
          this.initSize()
        }
        cell.content = text
        cell.paintText = textLine
      }
    },

    setCellItemAll (rowIndex, data) {
      let index = 0
      for (const item of data) {
        this.setCellItem(rowIndex, index, item)
        index += 1
      }
    },

    getDisplayCells (displayRows, displayColumns) {
      const temp = []
      const { allCells, fillWidth, setCellRenderText } = this
      for (const row of displayRows) {
        const cellTemp = []
        for (const column of displayColumns) {
          let cell = allCells[row.rowIndex][column.cellIndex]
          if (cell.renderText) {
            cell = setCellRenderText(cell)
          }

          const cellClone = Object.assign({}, cell, { column, x: column.x, y: row.y, width: cell.width + fillWidth, height: row.height }) //eslint-disable-line
          cellTemp.push(cellClone)
        }
        temp.push(cellTemp)
      }
      setTimeout(() => { this.displayCells = [...temp] }, 0)
      return temp
    },

    setCellRenderText (cell) {
      const text = cell.renderText(cell.rowData)
      const row = this.allRows[cell.rowIndex]
      if (text) {
        let maxHeight = 0
        const textLine = this.getTextLine(this.ctx, text, cell.width,cell)
        let textLineCount = 0
        if (textLine) {
          textLineCount = textLine.length
        }
        if (textLineCount > 1) {
          if (maxHeight < this.rowHeight + ((textLineCount - 1) * 18)) {
            maxHeight = this.rowHeight + ((textLineCount - 1) * 18)
          }
        }
        if (maxHeight > row.height) {
          row.height = maxHeight
        }
        cell.content = text
        cell.paintText = textLine
      } else {
        cell.content = ''
        cell.paintText = []
      }
      return cell
    },

    getDisplayFixedCells (displayRows) {
      const temp = []
      const { allFixedCells, fillWidth } = this
      for (const fixedCell of allFixedCells) {
        const fixedCellTemp = []
        for (const row of displayRows) {
          const fixed = fixedCell[row.rowIndex]

          const fixedCellClone = Object.assign({}, fixed, { y: row.y, width: fixed.width + fillWidth, height: row.height })
          fixedCellTemp.push(fixedCellClone)
        }
        temp.push(fixedCellTemp)
      }
      setTimeout(() => { this.displayallFixedCells = [...temp] }, 0)
      return temp
    },

    getDisplayRows () {
      const { offset: { y }, originPoint, maxPoint, allRows } = this
      const temp = []
      let startY = originPoint.y + y
      for (const row of allRows) {
        if (startY + row.height > originPoint.y &&startY < maxPoint.y) {
          const rowClone = Object.assign({}, row, { y: startY })
          temp.push(rowClone)
        } else if (startY >= maxPoint.y) {
          break
        }
        startY += row.height
      }
      setTimeout(() => { this.displayRows = [...temp] }, 0)
      return temp
    },

    getDisplayColumns () {
      const { offset: { x }, originPoint, maxPoint, allColumns, fillWidth } = this
      const temp = []
      let startX = originPoint.x + x
      for (const column of allColumns) {
        if (column.checked) {
          const width = column.width + fillWidth
          if (width + startX > originPoint.x && startX < maxPoint.x) {
            const columnClone = Object.assign({}, column, { x: startX, width })
            temp.push(columnClone)
          }
          startX += width
        }
      }
      setTimeout(() => { this.displayColumns = [...temp] }, 0)
      return temp
    },

    getTextLine (ctx, text, width,cell) {
      if (!text && text !== 0) return null
      if(cell.isImage===true)return [text]
      return [text]
      // if(ctx.measureText(text).width>width-20){
      //   // 文字内容超出省略 this.getWdithIndex(ctx,text,width-20)
      //   return [String(text).slice(0,this.getWdithIndex(ctx,text,width-20))+'...']
      // }else{
      //   return  [text]
      // }


      // const chr = `${text}`.split('')
      // let temp = ''
      // const row = []
      // for (let a = 0; a < chr.length; a += 1) {
      //   if (ctx.measureText(temp).width >= width - 20) {
      //     row.push(temp)
      //     temp = ''
      //   }
      //   temp += chr[a]
      // }
      // row.push(temp)
      // return row
    },

    getCellAt (x, y) {
      for (const rows of this.displayCells) {
        for (const cell of rows) {
          if (x >= cell.x && y >= cell.y && x <= cell.x + cell.width && y <= cell.y + cell.height) {
            return Object.assign({}, cell, { offset: { ...this.offset } })
          }
        }
      }
      for (const rows of this.displayCells) {
        for (const cell of rows) {
          if (x <this.maxPoint.x && y >= cell.y && y <= cell.y + cell.height) {
            return Object.assign({}, cell, { offset: { ...this.offset } })
          }
        }
      }
      return null
    },

    paintFirstColumnCellHover(cell){
      if (cell) {
        this.fisrtCell = cell
        this.fisrtCellHover = {
          cellX: cell.x,
          cellY: cell.y,
          rowIndex: this.fisrtCell.rowIndex,
          offset: { ...this.offset }
        }
        this.rePainted()
      }
    },

    getCheckboxAt (x, y) {
      for (const check of this.checkboxs) {
        if (x >= check.x && y >= check.y && x <= check.x + check.width && y <= check.y + check.height) {
          return Object.assign({}, check)
        }
      }
      return null
    },

    getButtonAt (x, y) {
      for (const button of this.renderButtons) {
        if (x >= button.x && y >= button.y && x <= button.x + button.width && y <= button.y + button.height) {
          return Object.assign({}, button)
        }
      }
      return null
    },



    getCellByRowAndKey (rowIndex, key) {
      const cells = this.allCells[rowIndex]
      for (const cell of cells) {
        if (cell.key === key) {
          return cell
        }
      }
      return null
    },

    focusCellByOriginCell (cell) {
      for (const row of this.displayCells) {
        for (const item of row) {
          if (item.rowIndex === cell.rowIndex && item.key === cell.key) {
            const focusCell = Object.assign({}, item, { offset: { ...this.offset } })
            this.focusCell = focusCell
            this.rowFocus = {
              cellX: focusCell.x,
              cellY: focusCell.y,
              rowIndex: this.focusCell.rowIndex,
              offset: { ...this.offset }
            }
            this.paintFocusCell(focusCell)
            return focusCell
          }
        }
      }
      return null
    },

    freshFocusCell (rowIndex, cellIndex, displayRows, displayColumns) {
      const firstRowIndex = displayRows[0].rowIndex
      const lastRowIndex = displayRows[displayRows.length - 1].rowIndex
      if (rowIndex >= firstRowIndex && rowIndex <= lastRowIndex) {
        this.focusCell.height = displayRows[rowIndex - firstRowIndex].height
      }
      for (const item of displayColumns) {
        if (item.cellIndex === cellIndex) {
          this.focusCell.width = item.width
        }
      }
    },

    getDisplayEditCell(){
      if(!this.focusCell)return
      const is = (el)=>el.style.display === 'none'
      const input = this.$refs.input
      const customInput = this.$refs.customInput
      const footerInput = this.$refs.footerInput
      if(!is(input)){
        const id = input.id
        const displayCells = this.initDisplayItems().displayCells
        for(let i = 0; i < displayCells.length; i++){
          const rowCell = displayCells[i]
          for(let j = 0; j < rowCell.length; j++){
            const cell = rowCell[j]
            if(cell.rowData.id === id && cell.key === this.focusCell.key){
              if(cell.y<this.rowHeight ||
                cell.y>this.maxPoint.y-this.rowHeight ||
                cell.x<this.serialWidth ||
                cell.x>this.maxPoint.x - cell.width
              ) {
                input.style.top = '-10000px'
                input.style.left = '-10000px'
              }else{
                input.style.top = cell.y + 'px'
                input.style.left = cell.x + 'px'
              }
              return
            }
          }
          input.style.top = '-10000px'
          input.style.left = '-10000px'
        }
      }else if(!is(customInput)){
        if(!this.focusCell)return
        const id = customInput.id
        const displayCells = this.initDisplayItems().displayCells
        for(let i = 0; i < displayCells.length; i++){
          const rowCell = displayCells[i]
          for(let j = 0; j < rowCell.length; j++){
            const cell = rowCell[j]
            if(cell.rowData.id === id && cell.key === this.focusCell.key){
              if(cell.y<this.rowHeight ||
                cell.y>this.maxPoint.y-this.rowHeight ||
                cell.x<this.serialWidth ||
                cell.x>this.maxPoint.x - cell.width
              ) {
                customInput.style.top = '-10000px'
                customInput.style.left = '-10000px'
              }else{
                customInput.style.top = cell.y + 'px'
                customInput.style.left = cell.x + 'px'
              }
              return
            }
          }
          customInput.style.top = '-10000px'
          customInput.style.left = '-10000px'
        }
      }else if(!is(footerInput)){
        if(this.displayColumns[0].key!==this.allColumns[0].key || this.displayColumns[0].x<this.serialWidth){
          footerInput.style.top = '-10000px'
          footerInput.style.left = '-10000px'
        }else{
          footerInput.style.top = this.maxPoint.y + 'px'
          footerInput.style.left =this.serialWidth + 'px'
        }
      }
    },

    initDisplayItems () {
      const displayColumns = this.getDisplayColumns()
      const displayRows = this.getDisplayRows()
      const displayCells = this.getDisplayCells(displayRows, displayColumns)
      const displayFixedCells = this.getDisplayFixedCells(displayRows)
      if (this.focusCell) {
        this.freshFocusCell(this.focusCell.rowIndex, this.focusCell.cellIndex, displayRows, displayColumns)
        const lastOffset = this.focusCell.offset
        if (lastOffset.x !== this.offset.x || lastOffset.y !== this.offset.y) {
          this.focusCell.x -= lastOffset.x - this.offset.x
          this.focusCell.y -= lastOffset.y - this.offset.y
          this.focusCell.offset = { ...this.offset }
        }
      }
      if (this.rowFocus) {
        const lastOffset = this.rowFocus.offset
        if (lastOffset.x !== this.offset.x || lastOffset.y !== this.offset.y) {
          this.rowFocus.y -= lastOffset.y - this.offset.y
          this.rowFocus.cellY -= lastOffset.y - this.offset.y
          if (!this.rowFocus.fixed) {
            this.rowFocus.x -= lastOffset.x - this.offset.x
            this.rowFocus.cellX -= lastOffset.x - this.offset.x
          }
          this.rowFocus.offset = { ...this.offset }
        }
      }
      return { displayColumns, displayRows, displayCells, displayFixedCells }
    }
  },

}
