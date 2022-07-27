/*
 * @Description: 行（row） 的 hover 效果
 * @Author: shufei
 * @Date: 2022-07-05 16:36:08
 * @LastEditTime: 2022-07-27 11:01:05
 * @LastEditors: shufei
 */


export default function hover({ offsetX: x, offsetY: y , target}) {
  if(target && target.tagName!=='CANVAS' ){
    this.hoverCell = null;
    this.rowHover = null;
    this.focusCell = null;
    return this.repaint();
  }
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
