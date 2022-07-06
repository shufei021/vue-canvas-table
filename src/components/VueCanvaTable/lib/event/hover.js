/*
 * @Description: 行（row） 的 hover 效果
 * @Author: shufei
 * @Date: 2022-07-05 16:36:08
 * @LastEditTime: 2022-07-05 17:31:53
 * @LastEditors: shufei
 */

const  hoverFirstColumnCell= function(x,y){
  if(x>0 && x< this.serialWidth){
    const item = this.displayRows.find(i=>y<i.y+i.height)
    console.log('%c [ this.displayRows ]-339', 'font-size:13px; background:pink; color:#bf2c9f;', this.displayRows,y)
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
}

export default function hover({ offsetX: x, offsetY: y }) {
  // body cell
  const bodyCell = this.getCellAt(x, y);
  // 如果bodyCell 存在就说明hover body区域
  if (bodyCell)  {
    // 如果原来的行索引 和 新的行索引不一致，说明换行了，再去hover
    if (!this.oldBodyCell || this.oldBodyCell.rowIndex !== bodyCell.rowIndex) {
      this.oldBodyCell = bodyCell;
      this.paintBodyRowHover(bodyCell);
    }
  } else {// 如果hover的是首列cell
    this.hoverCell = null;
    this.rowHover = null;
    const firstColumnCell = this.hoverFirstColumnCell(x,y);
    // 首行单元格 hover，按需hover，性能优化
    if (firstColumnCell) {
      console.log('%c [ firstColumnCell ]-25', 'font-size:13px; background:pink; color:#bf2c9f;', firstColumnCell.rowIndex)
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
