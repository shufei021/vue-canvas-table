<!--
 * @Author: shufei 1017981699@qq.com
 * @Date: 2022-06-15 09:08:58
 * @LastEditors: error: git config user.name && git config user.email & please set dead value or install git
 * @LastEditTime: 2022-06-18 18:11:47
 * @FilePath: \vue-grid-canvas\src\components\Example.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <div>
        <grid 
            :columnSet="columnSet"
            :columns="columns" 
            :grid-data="data" 
            :showCheckbox="showCheckbox" 
            :left-height="200" 
            @focus="focus"
            @updateValue="update"
        />
        <button @click="add">添加50条</button>
    </div>
</template>

<script>
import Grid from '@/components/grid'

export default {
    components: { Grid },
    data() {
        return {
            columnSet: true,
            showCheckbox: true,
            // 数据
            data: [],
            // 表头设置
            columns: [
                { title: '品牌', key: 'brandName', width: 80 },
                { title: '商品名称', key: 'goodsName', width: 150 },
                { title: '规格型号', key: 'sn', width: 400 },
                { title: '物料编码', key: 'materialNo', width: 400 },
                { title: '单位', key: 'unit', width: 70 },
                { title: '数量', key: 'requiredQuantity', type: 'number', width: 70 },
                { title: '客户备注', key: 'customerRemarks', width: 550 },
                { title: '采购价(元)', key: 'purchasePrice', type: 'number', width: 80 },
                { title: '销售价(元)', key: 'salePrice', type: 'number', width: 80 },
                { title: '货期', width: 100, key: 'shipDesc' },
                { title: '字段1', width: 100, key: 'newFiled' },
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
        for (let i = 0; i < 1000; i += 1) {
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
                newFiled: '猜一猜',
            })
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.data = this.data1
        })
    },
    methods: {
        add() {
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
                    newFiled: '猜一猜',
                })
            }
            this.data.push(...this.data1)
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
<style>
*{
    touch-action: pan-y;
}
</style>
