<template>
  <div class="demo-wrap">
    <VueCanvaTable
      ref="VueCanvaTable"
      :allFixedCells="allFixedCells"
      :dataSource="data"
      :columns="columns"
      :columnSet="columnSet"
      :left-height="200"
      :sortType="sortType"
      :allStatsList="allStatsList"
      @focus="focus"
      @updateValue="update"
      @sortReduce="sortReduce"
      @sortAdd="sortAdd"
      @checkboxChange="checkboxChange"
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

    <button @click="add(0)">添加100条</button>
    <button @click="add(1)">添加1000条</button>
    <button @click="change">改变</button>
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
        center: true,
        title: "赠品",
        key: "gift",
        width: 48,
        isCheckbox:true,
        disabled:true
      },
       {
        title: "品牌",
        key: "brandName",
        width: 190,
        center: true,
        isCustomComponent:true,
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
        title: "商品名称",
        key: "goodsName",
        width: 150,
        center: true,
        // textAlign:'center',
        disabled:true
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
        isCloumnBg: true,
        sort: "default",
        sorter:(a, b) => +b.materialNo - a.materialNo
      },
      {
        title: "单位",
        key: "unit",
        width: 70,
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
        isCloumnBg: true,
        isCustomComponent:true,
        tip:{
          img:tip,
          size:14,
          desc:'覆盖导入：采用覆盖导入，将清除已导入的全部数据，以这次数据为准重新导入。注意：当已经存在业务单据时，不允许再进行覆盖导入。差异导入：采用差异导入，系统会将本次获取的数据同之前导入的数据进行对比，只导入没有导入过的新数据。'
        },
          sort: "default",
          sorter: (a, b) => a.customerRemarks.length - b.customerRemarks.length
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
        width: 550,
        isTotal: true,
        total: parseInt(Math.random()*10000)+''
      },
      {
        title: "货期",
        width: 60,
        key: "shipDesc",
        isCloumnBg: true,
        // renderText:()=>'DSDSD'
      },
      {
        title: "创建时间",
        width: 180,
        key: "createDate",
        sort: "default",
        sorter:(a,b)=> new Date(b.createDate) - new Date(a.createDate)
      }
    ];
    this.columnsWidth = columns.reduce((p, c) => p + c.width, 0);
    const result = [...columns]
    return {
      sortType:1,
      columnSet: true,
      data: [],
      allFixedCells: [
        // { title: "品牌", key: "brandName", width: 80 },
        // { title: "商品名称", key: "goodsName", width: 150 }
      ],
      allStatsList: [
        {
          id: 'stats1',
          index: ''
        },
        {
          id: 'stats2',
          index: '合计'
        }
      ],
      columns: [
        ...result,
        // {
        //     title: '操作',
        //     width: 70,
        //     // fixed: true,
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
      // customComponentKeys: ["customerRemarks", "brandName"]
    };
  },
  created() {
    this.data1 = [];
    for (let i = 0; i < 100; i += 1) {
      this.data1.push({
        brandName: `111111111111博世${i}`,
        goodsName: `电钻电钻电钻电钻电钻电钻电钻电钻电钻电钻电钻电钻电钻电钻${i}`,
        gift: Math.random() > 0.5,
        // check:  Math.random() > 0.5?'0':'1',
        sn: `${'SDFSDSDFSDSDFSDSDFSD'.slice(0,Math.round(Math.random()*20))}${i}`,
        materialNo: i + 1,
        unit: "个",
        requiredQuantity: 10,
        customerRemarks: `${'测试测试测试测测测测测测测测测测测测试测试'.slice(0,Math.round(Math.random()*21))}${i}`,
        purchasePrice: 10.2,
        salePrice: 12.3,
        shipDesc: 10,
        id:utils.guid(),
        createDate: dateRangeRandom(),
        goodsCover: 'https://test-1251330838.cos.ap-chengdu.myqcloud.com/150000000/20226/756509841132339/23f74b59617c467772584f5cbfa8a923.jpg?imageView2/1/w/40/h/40',
        goodsPreview:'https://test-1251330838.cos.ap-chengdu.myqcloud.com/150000000/20226/756509841132339/23f74b59617c467772584f5cbfa8a923.jpg?imageView2/1/w/400/h/400',
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
        this.data = [...this.data1];
        this.chacheData = this.data1.map(i=>{
          return {
            ...i
          }
        })
      },1000)
    });
  },
  methods: {
    change(){
      this.columns.find(i=>i.isTotal).total =  parseInt(Math.random()*10000)+''
    },
    add(flag){
      const count = flag?1000:100
      this.data1 = [];
      for (let i = 0; i < count; i += 1) {
        this.data1.push({
          brandName: `111111111111博世${i+this.data.length}`,
          goodsCover: 'https://test-1251330838.cos.ap-chengdu.myqcloud.com/150000000/20226/756509841132339/23f74b59617c467772584f5cbfa8a923.jpg?imageView2/1/w/40/h/40',
          goodsPreview:'https://test-1251330838.cos.ap-chengdu.myqcloud.com/150000000/20226/756509841132339/23f74b59617c467772584f5cbfa8a923.jpg?imageView2/1/w/400/h/400',
          goodsName: `电钻${i}`,
          gift: Math.random() > 0.5,
          sn: `${'SDFSDSDFSDSDFSDSDFSD'.slice(0,Math.round(Math.random()*20))}${i}`,
          materialNo: i + this.data.length,
          unit: "个",
          requiredQuantity: 10,
          customerRemarks: `${'测试测试测试测测测测测测测测测测测测试测试'.slice(0,Math.round(Math.random()*21))}${i}`,
          purchasePrice: 10.2,
          salePrice: 12.3,
          shipDesc: 10,
          id:utils.guid(),
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
      this.data.push(...this.data1)
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
      // console.log(
      //   "%c [ cell ]-101",
      //   "font-size:13px; background:pink; color:#bf2c9f;",
      //   this.columns.map(i => i.key)[cell.cellIndex]
      // );
      console.log(value);
    },
    sortReduce(cell){
      this.data.splice(cell.rowIndex,1)
    },
    sortAdd(cell){
      this.data.splice(cell.rowIndex+1,0,{
        brandName: '',
        goodsCover: '',
        goodsPreview:'',
        goodsName: ``,
        sn: ``,
        gift:false,
        id:utils.guid(),
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
    checkboxChange(cell){
    }
  }
};
</script>
<style lang="less">
body {
  margin: 0;
}
.demo-wrap{
  width: 91%;
  height: 100%;
  margin: 0px auto;
  padding-top: 50px;
  box-sizing: border-box;
  // padding:0 10px;
}
</style>
