/**
 * 滚动条滚动事件
 */
export default {
  data () {
    return {
      // 横向 x
      horizontalBar: {
        x: 0,
        size: 0,
        move: false,
        cursorX: 0,
        k: 1
      },
      // 纵向 y
      verticalBar: {
        y: 0,
        size: 0,
        move: false,
        cursorY: 0,
        k: 1
      }
    }
  },
  created () {
    // 鼠标滚轮滚动事件
    this.$on('scroll', () => {
      console.log('%c [ scroll ]-28', 'font-size:13px; background:pink; color:#bf2c9f;', )
      this.horizontalBar.x = -parseInt(this.offset.x * this.horizontalBar.k, 10)
      this.verticalBar.y = -parseInt(this.offset.y * this.verticalBar.k, 10)
    })
  },
  watch:{
    /**
     * @descripton 通过监听 横向滚动位置 x 是否为0，和 是否显示 地图统计，对底部统计输入框进行显示控制
     * @param {*} val
     */
    'offset.x'(val){
      if(this.isTotalVisible){
        if(val === 0){
          const width = this.columns.slice(0, 5).reduce((p, c) => p += c.width, 0)
          const height = this.rowHeight
          const _x = this.serialWidth
          const _y = this.height - this.scrollerWidth - 2*height
          this.showInput(_x, _y, width, height)
        }else{
          this.hideInput()
        }
      }
    }
  },
  methods: {
    scroll (e, type) {
      if (type && this.verticalBar.size) {
        if (e.offsetY < this.verticalBar.y) {
          let k = 15
          if (this.verticalBar.y - e.offsetY < 15) {
            k = this.verticalBar.y - e.offsetY
          }
          this.verticalBar.y -= k
          this.offset.y = -this.verticalBar.y / this.verticalBar.k
          requestAnimationFrame(this.rePainted)
        } else if (e.offsetY > this.verticalBar.y + this.verticalBar.size) {
          let k = 15
          if (e.offsetY - this.verticalBar.y - this.verticalBar.size < 15) {
            k = e.offsetY - this.verticalBar.y - this.verticalBar.size
          }
          this.verticalBar.y += k
          this.offset.y = -this.verticalBar.y / this.verticalBar.k
          requestAnimationFrame(this.rePainted)
        }
      }
      if (!type&& this.horizontalBar.size) {
        if (e.offsetX < this.horizontalBar.x) {
          let k = 15
          if (this.horizontalBar.x - e.offsetX < 15) {
            k = this.horizontalBar.x - e.offsetX
          }
          this.horizontalBar.x -= k
          this.offset.x = -this.horizontalBar.x / this.horizontalBar.k
          requestAnimationFrame(this.rePainted)
        } else if (e.offsetX > this.horizontalBar.x + this.horizontalBar.size) {
          let k = 15
          if (e.offsetX - this.horizontalBar.x - this.horizontalBar.size < 15) {
            k = e.offsetX - this.horizontalBar.x - this.horizontalBar.size
          }
          this.horizontalBar.x += k
          this.horizontalBar.x += 15
          this.offset.x = -this.horizontalBar.x / this.horizontalBar.k
          requestAnimationFrame(this.rePainted)
        }
      }
      this.$emit('scroll')
      this.getDisplayEditCell()
    },

    dragMoveMousedown (e, is) {
      if (is) {
        this.verticalBar.move = true
        this.verticalBar.cursorY = e.screenY
      } else {
        this.horizontalBar.move = true
        this.horizontalBar.cursorX = e.screenX
      }

    },

    resetScrollBar ({ x, y }, bodyWidth, bodyHeight, fixedWidth) {
      let width = 0
      if (this.fillWidth > 0) {
        width = x
      } else {
        width = x + fixedWidth
      }

      const horizontalRatio = width / bodyWidth
      if (horizontalRatio >= 1) {
        this.horizontalBar.size = 0
      } else {
        this.horizontalBar.size = width - ((bodyWidth - width) * horizontalRatio)
      }
      this.horizontalBar.k = horizontalRatio

      let verticalRatio = y / bodyHeight
      if (verticalRatio > 1) {
        this.verticalBar.size = 0
      } else {
        this.verticalBar.size = y - ((bodyHeight - y) * verticalRatio)
        if (this.verticalBar.size < 30) {
          this.verticalBar.size = 30
          verticalRatio = (y - 30) / (bodyHeight - y)
        }
      }
      this.verticalBar.k = verticalRatio

      if (width - this.horizontalBar.size < -this.offset.x * this.horizontalBar.k) {
        this.offset.x = width - this.bodyWidth
      }
      if (this.verticalBar.k > 1) {
        this.offset.y = 0
      } else if (this.maxPoint.y - this.verticalBar.size < -this.offset.y * this.verticalBar.k) {
        this.offset.y = this.maxPoint.y - this.bodyHeight
      }
      this.horizontalBar.x = -this.offset.x * this.horizontalBar.k
      this.verticalBar.y = -this.offset.y * this.verticalBar.k
    }
  }
}
