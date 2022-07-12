/*
 * @Description:
 * @Author: shufei
 * @Date: 2022-07-11 15:23:04
 * @LastEditTime: 2022-07-12 11:18:17
 * @LastEditors: shufei
 */
// 画加减
export const drawAddAndReduceCell = function(ctx,y1){
  const x = 0
  const y = y1 + 1
  const gap = 2
  const w = 57
  const h = 28
  const btnWidth = 24
  const btnHeight = 21

  // 画一个底板遮挡数字显示
  ctx.beginPath()
  ctx.rect(x + w / 2 - gap / 2 - btnWidth, y + h / 2 - btnHeight / 2, btnWidth * 2 + gap, btnHeight)
  ctx.strokeStyle = 'white'
  ctx.stroke()
  ctx.fillStyle = 'white'
  ctx.fill()

  // 减号按钮
  ctx.beginPath()
  ctx.rect(x + w / 2 - gap / 2 - btnWidth, y + h / 2 - btnHeight / 2, btnWidth, btnHeight)
  ctx.strokeStyle = '#D9D9D9'
  ctx.stroke()
  ctx.fillStyle = 'white'
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x + w / 2 - gap / 2 - btnWidth * 0.75, y + h / 2)
  ctx.lineTo(x + w / 2 - gap / 2 - btnWidth * 0.25, y + h / 2)
  ctx.strokeStyle = '#595959'
  ctx.stroke()

  // 加号按钮
  ctx.beginPath()
  ctx.rect(x + w / 2 + gap / 2, y + h / 2 - btnHeight / 2, btnWidth, btnHeight)
  ctx.strokeStyle = '#D9D9D9'
  ctx.stroke()
  ctx.fillStyle = 'white'
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x + w / 2 + gap / 2 + btnWidth * 0.25, y + h / 2)
  ctx.lineTo(x + w / 2 + gap / 2 + btnWidth * 0.75, y + h / 2)
  ctx.moveTo(x + w / 2 + gap / 2 + btnWidth / 2, y + h / 2 - btnHeight / 4)
  ctx.lineTo(x + w / 2 + gap / 2 + btnWidth / 2, y + h / 2 + btnHeight / 4)
  ctx.strokeStyle = '#595959'
  ctx.stroke()

  ctx.restore()

}
export const hoverAddAndReduceCell = function(x,y){
  if(this.sortType===1){
    const rowData = this.hoverFirstColumnCell(x, y)
    if(rowData){
      // 减
      if(x>5 && x<5+24 && y>rowData.y+5 && y<rowData.y+5+24){
        this.hoverAddReduceCell = rowData
        this.hoverAddReduceType = 1
      }else if(x>5+24+2 && x<5+24+2+24 && y>rowData.y+5 && y<rowData.y+5+24){//加
         this.hoverAddReduceCell = rowData
         this.hoverAddReduceType = 2
      }else{
        this.hoverAddReduceCell = rowData
        this.hoverAddReduceType = 0
      }
    }else{
      this.hoverAddReduceCell = null
      this.hoverAddReduceType = 0
    }
  }else{
    const rowData = this.hoverFirstColumnCell(x, y)
    if(rowData){
      this.hoverSortCell = rowData
    }else{
      this.hoverSortCell = null
    }
  }
}

// 画箭头 右箭头
export const drawArrow = function(ctx,item){
  ctx.drawImage(this.arrowR, i(item.x + (item.width / 2)-10), i(15 + item.y-10), 20, 20)
}
