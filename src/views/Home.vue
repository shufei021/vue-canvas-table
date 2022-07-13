<template>
  <div class="demo-wrap">
    <VueCanvaTable
      ref="VueCanvaTable"
      :customComponentKeys="customComponentKeys"
      :allFixedCells="allFixedCells"
      :dataSource="data"
      :columns="columns"
      :columnSet="columnSet"
      :left-height="200"
      :sortType="sortType"
      @sort="sort"
      @focus="focus"
      @updateValue="update"
      @sortReduce="sortReduce"
      @sortAdd="sortAdd"
      @checkboxClick="checkboxClick"
    >
      <!-- 底部选择商品组件 -->
      <template #footer>
        <div @click="log">请输入商品名称/编号/条码</div>
      </template>

      <!-- 自定义表头字段自定义组件 -->
      <template #cell>
        <div @click="log" v-if="activeColumnsKey === 'customerRemarks'">
          自定义组件-customerRemarks - 客户备注
        </div>
        <div @click="log" v-else-if="activeColumnsKey === 'brandName'">
          自定义组件-brandName - 品牌
        </div>
      </template>
    </VueCanvaTable>
    <!-- <a-button type="primary">添加100</a-button>
    <a-button>删除1条</a-button> -->
  </div>
</template>

<script>
import VueCanvaTable from "@/components/VueCanvaTable";
import date from "rdatejs";
import utils from "rutilsjs";
const dateRangeRandom = function(d = new Date(), ft) {
  // 获取时间日期
  const dt = new Date(d);
  const month = dt.getMonth() + 1;
  const days = date.daysInMonth(dt);
  const ret = [];
  for (let i = 1; i <= days; i++) {
    ret.push(
      date.format(
        date.format(`2022/${month}/${i}`, "YYYY-MM-DD") +
          ` ${utils.rangeRandom(0, 23)}:${utils.rangeRandom(0, 59)}`,
        ft || "YYYY-MM-DD hh:mm"
      )
    );
  }
  const r = ret[utils.rangeRandom(1, days)[0]] || dateRangeRandom();
  return r;
};
const tip = new Image()
tip.src = require('../components/VueCanvaTable/images/tip.png')
export default {
  components: {
    VueCanvaTable
  },
  data() {

    const columns = [
      {
        title: "品牌",
        key: "brandName",
        width: 80,
        center: true
      },
       {
        title: "图片",
        key: "goodsCover",
        width: 48,
        center: true,
        isImage:true,
        disabled:true
      },
      {
        center: true,
        title: "赠品",
        key: "gift",
        width: 48,
        isCheckbox:true,
        disabled:true
      },
      {
        title: "商品名称",
        key: "goodsName",
        width: 150
      },
      {
        title: "规格型号",
        key: "sn",
        width: 150
      },
      {
        title: "物料编码",
        key: "materialNo",
        width: 150,
        sort: "default",
        isCloumnBg: true
      },
      {
        title: "单位",
        key: "unit",
        width: 70,
        sort: "default",
        isCloumnBg: true
      },
      {
        title: "数量",
        key: "requiredQuantity",
        type: "number",
        width: 70,
        isTotal: true,
        total: parseInt(Math.random()*10000)+''
      },
      {
        title: "客户备注",
        key: "customerRemarks",
        width: 150,
        sort: "default",
        isCloumnBg: true,
        tip:{
          img:tip,
          size:14,
          desc:'覆盖导入：采用覆盖导入，将清除已导入的全部数据，以这次数据为准重新导入。注意：当已经存在业务单据时，不允许再进行覆盖导入。差异导入：采用差异导入，系统会将本次获取的数据同之前导入的数据进行对比，只导入没有导入过的新数据。'
        }
      },
      {
        title: "采购价(元)",
        key: "purchasePrice",
        type: "number",
        width: 150,
        isTotal: true,
        total: parseInt(Math.random()*10000)+'',
        tip:{
          img:tip,
          size:14,
          desc:'双击数量或者快捷键Ctrl+Enter可进行多单位录入操作'
        }
      },
      {
        title: "销售价(元)",
        key: "salePrice",
        type: "number",
        width: 150,
        isTotal: true,
        total: parseInt(Math.random()*10000)+''
      },
      {
        title: "货期",
        width: 100,
        key: "shipDesc"
      },
      {
        title: "创建时间",
        width: 150,
        key: "createDate",
        sort: "default",
        isCloumnBg: true
      }
    ];
    this.columnsWidth = columns.reduce((p, c) => p + c.width, 0);
    const bodyWidth = this.columnsWidth + 59
    const emptyWidth =window.innerWidth-20-20 - bodyWidth;
    const result = [...columns]
    if(emptyWidth>0){
      result.push({ title: "", width: emptyWidth, key: "empty" })
    }
    return {
      sortType:1,
      columnSet: true,
      data: [],
      allFixedCells: [
        // { title: "品牌", key: "brandName", width: 80 },
        // { title: "商品名称", key: "goodsName", width: 150 }
      ],
      columns: [
        ...result,
        // { title: "", width: emptyWidth, key: "empty" },
        // {
        //     title: '操作',
        //     width: 70,
        //     fixed: true,
        //     renderButton(rowData, index) {
        //         return [{
        //             title: '操作',
        //             click() {
        //                 console.log(rowData, index)
        //             },
        //         }]
        //     },
        // },
      ],
      activeColumnsKey: "",
      customComponentKeys: ["customerRemarks", "brandName"]
    };
  },
  created() {
    this.data1 = [];
    for (let i = 0; i < 100; i += 1) {
      this.data1.push({
        brandName: `博世${i}`,
        goodsCover: 'https://test-1251330838.cos.ap-chengdu.myqcloud.com/150000000/20226/756509841132339/23f74b59617c467772584f5cbfa8a923.jpg?imageView2/1/w/40/h/40',
        goodsPreview:'https://test-1251330838.cos.ap-chengdu.myqcloud.com/150000000/20226/756509841132339/23f74b59617c467772584f5cbfa8a923.jpg?imageView2/1/w/400/h/400',
        goodsName: `电钻${i}`,
        gift: Math.random() > 0.5?'0':'1',
        sn: `${'SDFSDSDFSDSDFSDSDFSD'.slice(0,Math.round(Math.random()*20))}${i}`,
        materialNo: i + 1,
        unit: "个",
        requiredQuantity: 10,
        customerRemarks: `${'测试测试测试测测测测测测测测测测测测试测试'.slice(0,Math.round(Math.random()*21))}${i}`,
        purchasePrice: 10.2,
        salePrice: 12.3,
        shipDesc: 10,
        createDate: dateRangeRandom(),
        image:(()=>{
          const img = new Image()
          img.src = 'https://test-1251330838.cos.ap-chengdu.myqcloud'+(Math.random() > 0.5?'1':'')+'.com/150000000/20226/756509841132339/23f74b59617c467772584f5cbfa8a923.jpg?imageView2/1/w/40/h/40'
          img.state = 1
          img.onerror= ()=>{
             img.state = 0
            img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA8lJREFUWEftVl1oHFUU/s7MJqQRNbHYokj8K/VBQY2IUpD681BsMUqUIrEU64MQ4u6cnQQNopiCEH82O2dmy4IPUUFKH6T4U0FRwSIVX6rQ1r8Hf1oQKtYHK4qyZubICTvbybKJE0kpSA5cds/c757z3XPPOfcSzrHQOfaPVQL/rwgw8yCA70Xk17y5tSAC5XL5oiRJniKiGwH0Alijqr1EtMaG/QdwRERuyToYHx+/PI7jCoAHmt//BvBtc3wH4ASA43EcH6vVaqa3ZAEBZj4M4CYAB5fYwYiInGyfHxsbW9vd3X01gKtU1X43AriGiDaqan8GPyUiu1O9RcDzvCEiegvALhF5NW8I8+CY+ZImsceI6EHHce6pVqvv2NoWAWaeAvBMX1+fOzU1leQxvFwMM18B4AcAu0XE/J0hUC6XJ1V1utFonF+v139frvEUz8x3A4gAfJ0kyQtRFB1K5+yYurq6flHVyTAMn2+PAAMICoXC+kql8vN/IeB53noi+imz9qCI3JHqpVJpk+M4nziOs71arb7eTmAUQB3AlSJy3CaZedgqIgiCp/MQYuZHAbyUwZ4SkXWZ6DwM4BUiujkIAkv4BUewS1Vfdl332pmZma98378rSZJ3AXSp6p4wDIs5SWiKU9V6GIZjqe553jQRTcZxvK5Wq51qJzCiqnuNnU2o6gcA+jJOXxORnTlJPERER4MgOJbFM/N+AHeKSKsss1UwDGC/qm4mon0ALu3g7ICIDOUh0QnDzF+oaiMMQ+uY85IlsA2A1aZ1sA1LOPlYRDZ3mh8dHe3v6enZoqp/icib7RhmbhDR20EQpB3zDIHmmX+Yc3dHReT6LNb3/ftV1VfVTc3v+0RkJMUUi8ULXNc9TUQvBkHweKcI3A7go5wEDHZCRKyxzEvTwecArA2n8qSITJvi+/6tSZJ8qqrFMAz3rAQBs3FaRFqJ6nneFiJ6L7uJJEmGoyh6g5kfATBLRENBEBxYKQJm50vXdbdb6ZqStvQMiZOO42yL49gqY9xxnBuq1eqRlSJghu6zxlUqla5zHOdZAPd2OMb3AcQArE33Z98L2SpYbg78GMfxoDUUZra1s3bjLZFD9iZwRGQgi8lex3Z3f5MzCf8sFAoXVyqVP5rZP6uqF+ZYe0hEbutIoHl+VgW2myVFROaJl8vl51T1iX/DZ+Z3iMjeRQl4nmdR8AFsBXDZIoa3iojdEZZwg0S0QVUtrPODiAaa+trM+t8AWBfd0W7zrL2KJyYmzpubmxtIkqQ3iqLPFovSWSOQ91hWCaxG4B9GTIgwQGH5cAAAAABJRU5ErkJggg=='
          }
          return img
        })()
      });
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.data = this.data1;
      },300)
    });
  },
  methods: {

    /**
     * @description 排序
     * @param {Object} item :点击的排序对象
     */
    sort(item) {
      if (item.key === "materialNo") {
        // 物料编码
        if (item.sort == "up") {
          this.data.sort((a, b) => +a.materialNo - b.materialNo);
        } else {
          this.data.sort((a, b) => +b.materialNo - a.materialNo);
        }
      } else if (item.key === "customerRemarks") {
        // 客户备注
        if (item.sort == "up") {
          this.data.sort(
            (a, b) => a.customerRemarks.length - b.customerRemarks.length
          );
        } else {
          this.data.sort(
            (a, b) => b.customerRemarks.length - a.customerRemarks.length
          );
        }
      } else if (item.key === "unit") {
        // 单位
        if (item.sort == "up") {
          this.data.sort((a, b) => a.unit.length - b.unit.length);
        } else {
          this.data.sort((a, b) => b.unit.length - a.unit.length);
        }
      } else if (item.key === "createDate") {
        if (item.sort == "up") {
          this.data.sort(
            (a, b) => new Date(a.createDate) - new Date(b.createDate)
          );
        } else {
          this.data.sort(
            (a, b) => new Date(b.createDate) - new Date(a.createDate)
          );
        }
      }
    },
    log() {
      alert(1);
    },
    update(value) {
      console.log(value);
    },
    focus(value, cell) {
      const columnsKey = this.columns.map(i => i.key)[cell.cellIndex];
      this.activeColumnsKey = columnsKey;
      console.log(
        "%c [ cell ]-101",
        "font-size:13px; background:pink; color:#bf2c9f;",
        this.columns.map(i => i.key)[cell.cellIndex]
      );
      console.log(value);
    },
    sortReduce(cell){
      this.data.splice(cell.rowIndex,1)
      console.log(cell,'sortReduce')
    },
    sortAdd(cell){
      console.log(cell,'sortAdd')

      this.data.splice(cell.rowIndex+1,0,{
        brandName: '',
        goodsCover: '',
        goodsPreview:'',
        goodsName: ``,
        sn: ``,
        gift:'0',
        materialNo: '',
        unit: "",
        requiredQuantity: '',
        customerRemarks: ``,
        purchasePrice: '',
        salePrice: '',
        shipDesc: '',
        createDate: '',
        image:''
      })
    },
    checkboxClick(cell){
      console.log(cell,'checkboxClick')
      // cell.rowData[cell.key]
      this.data[cell.rowIndex][cell.key] = cell.rowData[cell.key]=='0'?'1':'0'
    }
  }
};
</script>
<style lang="less">
body {
  margin: 0;
}
.demo-wrap{
  width: 70%;
  height: 983px;
  margin: 0px auto;
  padding-top: 50px;
  box-sizing: border-box;
  padding:0 10px;
}
</style>
