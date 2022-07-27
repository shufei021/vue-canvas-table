<template>
  <div ref="grid" class="excel-table" :style="`height:${height + 2}px;`" @paste="doPaste">

    <!-- footer total 底部固定统计 -->
    <div
      class="input-content footer"
      v-show="isTotalVisible"
      :style="inputStyles"
      @keydown.tab.prevent
      @keydown.enter.prevent
      @keydown.esc.prevent>
      <!-- 自定义组件 -->
      <slot name="footer"></slot>
    </div>

    <!-- 单元格 自定义组件 -->
    <div
      class="input-content custom"
      v-show="!isTotalVisible  && (focusCell &&focusCell.key &&  customComponentKeys.includes(focusCell.key))"
      :style="inputStyles">
      <slot name="cell"></slot>
    </div>

    <!-- 单元格正常输入编辑  -->
    <div
      class="input-content"
      v-show="!isTotalVisible && !(focusCell &&focusCell.key &&  customComponentKeys.includes(focusCell.key))"
      :style="inputStyles"
      ref="input"
      contenteditable="true"
      @input="setValueTemp"
      @keydown.tab.prevent
      @keydown.enter.prevent
      @keydown.esc.prevent
      @keyup="handleInputKeyup">
    </div>

    <div class="horizontal-container"
      :style="{ width: `${width - scrollerWidth + 2}px` }"
      @click="scroll($event, 0)"
    >
      <div
        class="scroll-bar-horizontal"
        ref="horizontal"
        @mousedown="dragMove($event, 0)"
        :style="{
          width: horizontalBar.size + 'px',
          left: horizontalBar.x + 'px',
        }">
        <div
          class="horizontalBar"
          :style="
            horizontalBar.move
              ? 'background-color:#a1a1a1;'
              : 'background-color:#c1c1c1;'
          "></div>
      </div>
    </div>

    <div class="vertical-container" :style="{ height: `${height - scrollerWidth + 2}px` }" @click="scroll($event, 1)">
      <div
        class="scroll-bar-vertical"
        ref="horizontal"
        @mousedown="dragMove($event, 1)"
        :style="{ height: verticalBar.size + 'px', top: verticalBar.y + 'px' }">
        <div
          class="vertical"
          :style="
            verticalBar.move
              ? 'background-color:#a1a1a1;'
              : 'background-color:#c1c1c1;'
          "></div>
      </div>
    </div>

    <canvas ref="canvas" :width="width" :height="height" :style="`width:${width}px;height:${height}px;`"></canvas>

    <!-- 列宽拖动线 -->
    <div class="cloumn-line" :style="{ height: `${height - scrollerWidth + 2}px`,...cloumnLineStyle }" ></div>

    <!-- 表头标题提示弹框 -->
    <div class="tooltip" :style="tooltipStyle">
        <div class="tooltip-content">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner">
                <span style="text-align: center; display: inline-block;word-break: wrap;"> {{tooltip}} </span>
            </div>
        </div>
    </div>

    <!-- 图片侧边预览 -->
    <div class="previe" ref="previe" @click="previeHandler" :style="previeStyle">
      <div  style="" class="previe-content">
          <div class="previe-arrow"></div>
          <img :src="previeUrl" alt="" style="width: 100%;height: 100%;object-fit: contain;" />
        </div>
    </div>


  </div>
</template>

<script>
import painted from './lib/painted'
import events from './lib/events'
import calculate from './lib/calculate'
import scroller from './lib/scroller'

// type: default,noextent
export default {
  mixins: [calculate, painted, events, scroller],
  props: {
    sortType:{
      type:Number,
      default:1
    },
    columns: Array,
    dataSource: Array,
    type: {
      type: String,
      default: 'default'
    },
    leftHeight: Number,
    showDot: Object,
    columnSet: {
      type: Boolean,
      default: false
    },
    storageKey: {
      type: String,
      default: 'gridStorage'
    },
    initSelected: Array,
    autoAddRow: {
      type: Boolean,
      default: false
    },
    allStatsList:Array,
    templateData: Object,
    customComponentKeys:{
      type: Array,
      default: ()=>[]
    }
  },
  data () {
    return {
      keys: { 37: 1, 38: 1, 39: 1, 40: 1 },

      ctx: null,

      isDown: false,
      isEditing: false,
      isSelect: false,
      isFocus: false,

      currentText: '',
      inputStyles: {},
      valueTemp: '',
      data: null,
      showColumnSet: false,
      ratio: 1,
      showTip: false,
      tipMessage: '',
      initRows: 300,
      isTotalVisible: false,
      focusCell:null,
      cloumnLineStyle:{
        left:'-10000px'
      },
      tooltipStyle:{
        left:'-10000px',
        top:'-10000px'
      },
      tooltip:'',
      previeStyle:{
        left:'-10000px',
        top:'-10000px'
      },
      previeUrl:''
    }
  },
  watch: {
    dataSource:{
      handler(value) {
        console.log('%c [ dataSource改变了 ]-179', 'font-size:13px; background:pink; color:#bf2c9f;')
        this.data = [...value]
        this.initCanvas()
        // this.painted(this.initDisplayItems())
        this.initEvent()
        // setTimeout(() => {
          this.rePainted()
        // },16)
      },
      deep:true
    },
    // 列宽改变需要重新初始化
    columns:{
      handler(){
        this.initCanvas()
        // this.painted(this.initDisplayItems())
        this.initEvent()
          this.rePainted()
          this.bodyWidth = this.originPoint.x
           for (const column of this.columns) {
            this.bodyWidth += column.width ? column.width : 100
          }
      },
      deep:true
    }
  },
  created () {
    this.data = [...this.dataSource]
    this.$on('updateNoSave', (data) => {
      this.saveItems(data, false)
    })
    this.$on('update', (data) => {
      this.$emit('updateValue', this.saveItems(data, true))
    })
    this.$on('updateItem', (data) => {
      this.saveItem(data, true)
    })
  },
  mounted () {
    this.$nextTick(function () {
      //eslint-disable-line
      if (this.data.length > 0) {
        this.initCanvas()
        // this.painted(this.initDisplayItems())
        this.initSize()
        this.initEvent()
      }
    })
  },
  destroyed () {
    this.removeEvent()
  },
  methods: {

    previeHandler(){
      console.log(this.previeUrl,'previeUrl')
    },
    doPaste () {
      this.isPaste = true
    },
    setValueTemp (e) {
      this.valueTemp = e.target.innerText
      const { width, height, serialWidth } = this.focusCell
      let { x, y } = this.focusCell
      if (x < serialWidth) {
        this.offset.x += serialWidth - x
        x = serialWidth
      }
      if (y < this.rowHeight) {
        this.offset.y += this.rowHeight - y
        y = this.rowHeight
      }
      if (!this.isPaste) {
        this.isSelect = false
        this.rePainted()
        this.showInput(x, y, width, height)
      } else if (!this.isEditing) {
        this.isPaste = false

        const objE = document.createElement('div')
        objE.innerHTML = e.target.innerHTML
        const dom = objE.childNodes
        e.target.innerHTML = ''
        const pasteData = []
        for (let i = 0; i < dom.length; i += 1) {
          if (dom[i].tagName === 'TABLE') {
            const trs = dom[i].querySelectorAll('tr')
            for (const tr of trs) {
              const arrTmp = []
              for (const td of tr.cells) {
                let str = td.innerText
                str = str.replace(/^\s+|\s+$/g, '')
                arrTmp.push(str)
                const colspan = td.getAttribute('colspan')
                if (colspan) {
                  for (let i = 1; i < colspan; i += 1) {
                    arrTmp.push('')
                  }
                }
              }
              pasteData.push(arrTmp)
            }
          } else {
            pasteData.push([this.valueTemp])
          }
        }
        const modifyData = []
        let lastCellIndex = 0
        let startCellAt = 0
        let startRowIndex = this.focusCell.rowIndex
        for (const row of pasteData) {
          if (this.autoAddRow || startRowIndex < this.allRows.length) {
            let startCellIndex = this.getStartIndexByCellIndex(
              this.focusCell.cellIndex
            )
            startCellAt = startCellIndex
            if (startCellIndex || startCellIndex === 0) {
              let key = this.allColumns[startCellIndex].key
              const temp = {
                rowData: this.autoAddRow
                  ? null
                  : this.allCells[startRowIndex][0].rowData,
                index: startRowIndex,
                items: []
              }
              let readOnly = false
              for (let i = 0; i < row.length; i += 1) {
                if (readOnly) {
                  temp.items.push({
                    key: '',
                    value: ''
                  })
                } else {
                  temp.items.push({
                    key,
                    value: row[i]
                  })
                }
                const nextColumn = this.nextKeyByIndex(startCellIndex)
                if (nextColumn) {
                  key = nextColumn.key
                  startCellIndex = nextColumn.index
                  readOnly = nextColumn.readOnly
                } else {
                  break
                }
              }
              if (startCellIndex - 1 > lastCellIndex) {
                lastCellIndex = startCellIndex - 1
              }
              startRowIndex += 1
              modifyData.push(temp)
            }
          }
        }
        // let height = 0
        let width = 0
        if (
          startRowIndex - this.focusCell.rowIndex > 1 ||
          lastCellIndex - startCellAt > 0
        ) {
          // for (let i = this.focusCell.rowIndex; i < startRowIndex; i += 1) {
          //     height += this.allRows[i].height
          // }
          for (let i = startCellAt; i <= lastCellIndex; i += 1) {
            if (this.allColumns[i].checked) {
              width += this.allColumns[i].width + this.fillWidth
            }
          }
          this.isSelect = true
        }
        this.$emit('update', modifyData)
      } else {
        this.isPaste = false
        e.target.innerHTML = e.target.innerText
      }
    },
    getStartIndexByCellIndex (cellIndex) {
      let startIndex = 0
      for (const item of this.allColumns) {
        if (item.cellIndex === cellIndex) {
          return startIndex
        }
        startIndex += 1
      }
      return null
    },
    nextKeyByIndex (index) {
      for (let i = index + 1; i < this.allColumns.length; i += 1) {
        if (this.allColumns[i].checked) {
          return {
            key: this.allColumns[i].key,
            index: i,
            readOnly: this.allColumns[i].readOnly
          }
        }
      }
      return null
    },
    validateKeyType (key) {
      for (const item of this.allColumns) {
        if (item.key === key) {
          if (item.type === 'number') {
            return {
              type: 'number',
              title: item.title
            }
          }
          return {
            type: 'string',
            title: item.title
          }
        }
      }
      return {
        type: 'string'
      }
    },
    paintFocusCell (cell, is) {
      if (is) {
        if (cell) {
          this.rePainted()
        }
      } else {
        if (cell) {
          this.isFocus = true
          if(!(this.focusCell &&this.focusCell.key &&  this.customComponentKeys.includes(this.focusCell.key))){
            this.$refs.input.innerHTML = ''
            this.focusInput()
          }
          this.rePainted()
        }
      }
    },
    focusInput () {
      setTimeout(() => {
        this.$refs.input.focus()
      }, 100)
    },


    /**
     * 该函数作用：
     * 检测 在有单元格处于编辑状态下，新旧值不同（有修改值动作）时，触发 更新 canvas 单元格对应的值的绘制
     */
    save () {
      // 如果获取焦点并且处于编辑状态
      if (this.focusCell && this.isEditing) {
        // 输入框内容 不等于
        if (this.$refs.input.innerText !== this.allCells[this.focusCell.rowIndex][this.focusCell.cellIndex].content) {
          this.$emit('updateItem', {
            index: this.focusCell.rowIndex,
            key: this.focusCell.key,
            value: this.$refs.input.innerText
          })
        }
      }
    },
    saveItem (data, history) {
      const { index, key } = data
      let value = data.value
      const curColumn = this.validateKeyType(key)

      if (curColumn) {
        if (curColumn.type === 'number') {
          const re =
            /^(([1-9][0-9]*\.[0-9][0-9]*)|([0]\.[0-9][0-9]*)|([1-9][0-9]*)|([0]{1}))$/
          if (value && !re.test(value)) {
            this.showTipMessage(`【 ${curColumn.title} 】单元格只支持数字。`)
            return
          }
          if (!value) {
            value = null
          }
        }

        this.data[index][key] = value
        this.setCellItemByKey(index, key, value)
        this.rePainted()
        this.$emit('updateValue', [
          { rowData: this.data[index], items: [{ key, value }] }
        ])
      }
    },
    saveItems (data, history) {
      const returnData = []
      const re =
        /^(([1-9][0-9]*\.[0-9][0-9]*)|([0]\.[0-9][0-9]*)|([1-9][0-9]*)|([0]{1}))$/
      const errorTemp = []
      const historyTemp = {
        type: 'editMore',
        focusCell: this.focusCell,
        after: [...data]
      }
      if (data.length > this.data.length) {
        if (this.autoAddRow) {
          const startIndex = this.data.length
          const length = data.length - this.data.length
          for (let i = 0; i < length; i += 1) {
            this.data.push({ ...this.templateData })
          }
          this.setAllCells(startIndex)
          this.initRows = this.data.length
        } else {
          data.splice(this.data.length, data.length - this.data.length)
        }
      }
      const beforeData = []
      for (const row of data) {
        const beforeTemp = {
          rowData: row.rowData,
          index: row.index,
          items: []
        }
        const temp = {
          rowData: row.rowData,
          items: [],
          index: row.index
        }
        for (const item of row.items) {
          const curColumn = this.validateKeyType(item.key)
          if (curColumn) {
            if (curColumn.type === 'number') {
              if (item.value && !re.test(item.value)) {
                if (errorTemp.indexOf(curColumn.title) === -1) {
                  errorTemp.push(curColumn.title)
                }
                continue
              }
              if (!item.value) {
                item.value = null
              }
            }
            beforeTemp.items.push({
              key: item.key,
              value: this.data[row.index][item.key]
            })
            this.data[row.index][item.key] = item.value
            this.setCellItemByKey(row.index, item.key, item.value)
            temp.items.push({
              key: item.key,
              value: item.value
            })
          }
        }
        returnData.push(temp)
        beforeData.push(beforeTemp)
      }
      historyTemp.before = [...beforeData]
      if (history) {
        this.pushState(historyTemp)
      }
      if (errorTemp.length > 0) {
        this.showTipMessage(`【 ${errorTemp.join(',')} 】单元格只支持数字。`)
      }

      this.rePainted()
      return returnData
    },
    showInput (x, y, width, height) {
      this.isEditing = true
      this.inputStyles = {
        position: 'absolute',
        top: `${y - 1}px`,
        left: `${x - 1}px`,
        minWidth: `${width + 2}px`,
        maxWidth: `${this.maxPoint.x - x > 300 ? 300 : this.maxPoint.x - x}px`,
        minHeight: `${height + 2}px`
      }
    },
    hideInput () {
      this.isEditing = false
      this.inputStyles = {
        top: '-10000px',
        left: '-10000px'
      }
    },
    showTipMessage (message) {
      this.tipMessage = message
      this.showTip = true
      setTimeout(() => {
        this.showTip = false
      }, 2000)
    }
  }
}
</script>

<style scoped lang="less">
* {
  box-sizing: border-box;
  font-size: 12px;
}

// 图片预览
.previe{
  width:20px;
  height:20px;
  position:absolute;
  cursor:pointer;
  &:hover .previe-content{
    display: block !important;;
    transition:all 0.3s;
  }
  .previe-content{
    width: 200px;
    height: 200px;
    padding: 12px 16px;
    background-color: #fff;
    background-clip: padding-box;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0,0,0, 0.15);
    box-sizing: content-box;
    position: absolute;
    left: 32px;
    top: -103px;
    display:none;
    .previe-arrow{
      position: absolute;
      display: block;
      width: 8.48528137px;
      height: 8.48528137px;
      background: transparent;
      border-style: solid;
      border-width: 4.24264069px;
      top:50%;
      left: -4px;
      transform: translateY(-50%) rotate(45deg);
      border-top-color: transparent;
      border-right-color: transparent;
      border-bottom-color: #fff;
      border-left-color: #fff;
      box-shadow: -3px 3px 7px rgba(0, 0, 0, 0.07);
    }
  }
}



.excel-table {
  border: 1px solid #e8e8e8;
  position: relative;
  min-width: 714px;
}

.cloumn-line{
  position: absolute;
  left: -10000px;
  top: 0;
  width: 0;
  border-left: 1px dashed #378efb;
}
.horizontal-container {
  position: absolute;
  height: 18px;
  left: 0;
  bottom: 0;
  background: #f1f1f1;
  user-select: none;
}

.scroll-bar-horizontal {
  position: absolute;
  bottom: 1px;
  height: 16px;
  padding: 0 2px;
}

.scroll-bar-horizontal>div {
  width: 100%;
  height: 16px;
  border-radius: 10px;
}

.vertical-container {
  user-select: none;
  position: absolute;
  width: 18px;
  top: 0;
  right: 0;
  background: #f1f1f1;
}

.scroll-bar-vertical {
  position: absolute;
  right: 1px;
  width: 16px;
  padding: 2px 0;
}

.scroll-bar-vertical>div {
  width: 16px;
  height: 100%;
  border-radius: 10px;
}

.input-content {
  padding: 5px;
  top: -10000px;
  left: -10000px;
  // outline: none;
  // box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 5px;
  // border: 2px solid #4285f4;
  color: #666;
  // border-radius: 0px;
  font-size: 12px;
  position: fixed;
  // background-color: #fff;
  z-index: 10;
  text-indent: 10px;
  text-align: left;
  line-height: 30px;
    margin: 0px;
    padding: 0px;
    overflow: hidden;
    box-sizing: content-box;
    resize: none;
    outline: none;
    border: 1px solid rgb(97, 173, 255);
    box-shadow: rgba(55, 142, 251 , 20%) 0px 0px 0px 2px;
    background-color: rgb(240, 249, 255);
}

.focus-area {
  display: none;
  border: 2px solid #4285f4;
  top: -10000px;
  left: -10000px;
  position: absolute;
  z-index: 5;
}

.select-area {
  z-index: 5;
  display: none;
  border: 1px solid #03a2fe;
  top: -10000px;
  left: -10000px;
  background-color: rgba(160, 195, 255, 0.2);
  position: absolute;
  transition: 0.1s all;
}

canvas {
  user-select: none;
  background-color: #fff;
}

.column-set {
  position: absolute;
  width: 150px;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 5px;
  top: 31px;
  left: 71px;
  padding: 0 8px;
  font-size: 12px;
  color: #495060;
}

.column-set__title {
  height: 30px;
  line-height: 30px;
  border-bottom: 1px solid #ddd;
}

.column-set__content {
  overflow: auto;
  padding: 5px;
  color: #495060;
}

.column-set__content ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.column-set__content ul li {
  font-size: 12px;
  height: 30px;
  line-height: 30px;
}

.column-set__footer {
  height: 40px;
  line-height: 40px;
  border-top: 1px solid #ddd;
  text-align: right;
}

.column-set__footer button {
  height: 25px;
  width: 56px;
  line-height: 24px;
  background-color: #fff;
  border: 1px solid #ddd;
  outline: none;
  cursor: pointer;
  color: #333;
}

.column-set__footer button:hover {
  background-color: #f9f9f9;
}

.column-set__footer button:active {
  background-color: #f5f5f5;
}

.tip {
  position: absolute;
  width: 300px;
  top: 10px;
  right: 30px;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 5px;
  padding: 10px 10px 10px 50px;
  word-wrap: break-word;
}

.tip .tip-icon {
  position: absolute;
  display: inline-block;
  width: 20px;
  height: 20px;
  background-size: 100%;
  left: 15px;
}

.slide-fade-enter-active {
  transition: all 0.2s ease;
}

.slide-fade-leave-active {
  transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

.footer {
  box-sizing: border-box;
}

.tooltip{
    position: absolute;
    left: -10000px;
    top: -10000px;
    width: 1px;
    height: 1px;
}
.tooltip-content{
    width: 186px;
    height: 38px;
    position: absolute;
    background-color: #fff;
    left:-92px;
    top: 10px;
}
.tooltip-arrow{
    position: absolute;
    display: block;
    width: 13px;
    height: 13px;
    overflow: hidden;
    background: transparent;
    pointer-events: none;
    left: 86px;
    top: -13px;
}
.tooltip-arrow:before {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: block;
    width: 5px;
    height: 5px;
    margin: auto;
    background-color: rgba(0,0,0,.75);
    content: "";
    pointer-events: auto;
    transform: translateY(6px) rotate(45deg);
    box-shadow: -3px -3px 7px rgb(237,237,237);
}
.tooltip-inner{
    min-width: 30px;
    min-height: 32px;
    padding: 6px 8px;
    color: #fff;
    text-align: left;
    text-decoration: none;
    word-wrap: break-word;
    background-color: rgba(0,0,0,.75);
    border-radius: 2px;
    // box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
    font-size: 12px;
    word-break: wrap;
}
</style>
