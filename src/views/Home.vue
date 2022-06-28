<!--
 * @Author: shufei 1017981699@qq.com
 * @Date: 2022-06-24 11:12:31
 * @LastEditors: shufei 1017981699@qq.com
 * @LastEditTime: 2022-06-28 10:49:02
 * @FilePath: \canvas-table-vue\src\views\Home.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <div>
        <VueCanvaTable :allFixedCells="allFixedCells" :grid-data="data" :columns="columns" :showCheckbox="showCheckbox" :columnSet="columnSet" :left-height="200" @focus="focus" @updateValue="update">
          <div @click="log">自定义组件</div>
        </VueCanvaTable>
    </div>
</template>

<script>
import VueCanvaTable from '@/components/VueCanvaTable'

export default {
    components: {
        VueCanvaTable,
    },
    data() {
        return {
            columnSet: true,
            showCheckbox: false,
            data: [],
            allFixedCells:[
               { title: '品牌', key: 'brandName', width: 80 },
                { title: '商品名称', key: 'goodsName', width: 150 },
            ],
            columns: [
                { title: '品牌', key: 'brandName', width: 80 },
                { title: '商品名称', key: 'goodsName', width: 150 },
                { title: '规格型号', key: 'sn', width: 100 },
                { title: '物料编码', key: 'materialNo', width: 100 },
                { title: '单位', key: 'unit', width: 70 },
                { title: '数量', key: 'requiredQuantity', type: 'number', width: 70,isTotal: true },
                { title: '客户备注', key: 'customerRemarks', width: 150 },
                { title: '采购价(元)', key: 'purchasePrice', type: 'number', width: 80,isTotal: true},
                { title: '销售价(元)', key: 'salePrice', type: 'number', width: 80,isTotal: true },
                { title: '货期', width: 100, key: 'shipDesc' },
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
        }
    },
    created() {
        this.data1 = []
        for (let i = 0; i < 100; i += 1) {
            this.data1.push({
                brandName: `博世${i}`,
                goodsName: `电钻${i}`,
                sn: `SDFSD${i}`,
                materialNo: `1231${i}`,
                unit: '个',
                requiredQuantity: 10,
                customerRemarks: `测试测试${i}`,
                purchasePrice: 10.2,
                salePrice: 12.3,
                shipDesc: 10,
            })
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.data = this.data1
        })
    },
    methods: {
        log(){
          alert(1)
        },
        update(value) {
            console.log(value)
        },
        focus(value) {
            console.log(value)
        },
    },
}
</script>
