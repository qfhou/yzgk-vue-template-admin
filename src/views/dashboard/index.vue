<template>
  <div class="dashboard-container">
    <div class="block">
      <span class="demonstration">hover 触发子菜单</span>
      <!-- <el-cascader
        v-model="id"
        :options="options"
        :props="optionProps"
        @change="handleChange"
      /> -->
      <el-cascader v-model="id" clearable filterable placeholder="试试搜索：" :options="options" :props="optionProps" @change="handleChange">
        <template slot-scope="{ node, data }">
          <span>{{ data.name }}</span>
          <span v-if="data.child">{{ data.child.length }}</span>
          <!-- <span v-if="data.child.length != 0"> {{ data.name }} </span> -->
          <!-- <span v-if="!node.isLeaf"> ({{ data.child.length }}) </span> -->
          <!-- <el-button type="success" size="mini" @click.native.prevent="showGetHandler(node, data)">查看</el-button> -->
        </template>
      </el-cascader>
      <el-input
        v-model="queryRealName"
        placeholder="考题题目"
        style="width: 200px;margin-right: 15px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click.native="handleFilter">
        查询
      </el-button>
      <el-select v-model="value" filterable placeholder="请选择">
        <el-option
          v-for="item in options2"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      options2: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }],
      value: '选项2',
      id: [],
      optionProps: {
        expandTrigger: 'hover',
        value: 'id',
        label: 'name',
        children: 'child'
      },
      options: [{
        id: 'zhinan',
        name: '指南',
        child: [{
          id: 'shejiyuanze',
          name: '设计原则',
          child: [{
            id: 'yizhi',
            name: '一致',
            child: []
          }, {
            id: 'fankui',
            name: '反馈'
          }, {
            id: 'xiaolv',
            name: '效率'
          }, {
            id: 'kekong',
            name: '可控'
          }]
        }, {
          id: 'daohang',
          name: '导航',
          child: [{
            id: 'cexiangdaohang',
            name: '侧向导航'
          }, {
            id: 'dingbudaohang',
            name: '顶部导航'
          }]
        }]
      }, {
        id: 'zujian',
        name: '组件',
        child: [{
          id: 'basic',
          name: 'Basic',
          child: [{
            id: 'layout',
            name: 'Layout 布局'
          }, {
            id: 'color',
            name: 'Color 色彩'
          }, {
            id: 'typography',
            name: 'Typography 字体'
          }, {
            id: 'icon',
            name: 'Icon 图标'
          }, {
            id: 'button',
            name: 'Button 按钮'
          }]
        }, {
          id: 'form',
          name: 'Form',
          child: [{
            id: 'radio',
            name: 'Radio 单选框'
          }, {
            id: 'checkbox',
            name: 'Checkbox 多选框'
          }, {
            id: 'input',
            name: 'Input 输入框'
          }, {
            id: 'input-number',
            name: 'InputNumber 计数器'
          }, {
            id: 'select',
            name: 'Select 选择器'
          }, {
            id: 'cascader',
            name: 'Cascader 级联选择器'
          }, {
            id: 'switch',
            name: 'Switch 开关'
          }, {
            id: 'slider',
            name: 'Slider 滑块'
          }, {
            id: 'time-picker',
            name: 'TimePicker 时间选择器'
          }, {
            id: 'date-picker',
            name: 'DatePicker 日期选择器'
          }, {
            id: 'datetime-picker',
            name: 'DateTimePicker 日期时间选择器'
          }, {
            id: 'upload',
            name: 'Upload 上传'
          }, {
            id: 'rate',
            name: 'Rate 评分'
          }, {
            id: 'form',
            name: 'Form 表单'
          }]
        }, {
          id: 'data',
          name: 'Data',
          child: [{
            id: 'table',
            name: 'Table 表格'
          }, {
            id: 'tag',
            name: 'Tag 标签'
          }, {
            id: 'progress',
            name: 'Progress 进度条'
          }, {
            id: 'tree',
            name: 'Tree 树形控件'
          }, {
            id: 'pagination',
            name: 'Pagination 分页'
          }, {
            id: 'badge',
            name: 'Badge 标记'
          }]
        }, {
          id: 'notice',
          name: 'Notice',
          child: [{
            id: 'alert',
            name: 'Alert 警告'
          }, {
            id: 'loading',
            name: 'Loading 加载'
          }, {
            id: 'message',
            name: 'Message 消息提示'
          }, {
            id: 'message-box',
            name: 'MessageBox 弹框'
          }, {
            id: 'notification',
            name: 'Notification 通知'
          }]
        }, {
          id: 'navigation',
          name: 'Navigation',
          child: [{
            id: 'menu',
            name: 'NavMenu 导航菜单'
          }, {
            id: 'tabs',
            name: 'Tabs 标签页'
          }, {
            id: 'breadcrumb',
            name: 'Breadcrumb 面包屑'
          }, {
            id: 'dropdown',
            name: 'Dropdown 下拉菜单'
          }, {
            id: 'steps',
            name: 'Steps 步骤条'
          }]
        }, {
          id: 'others',
          name: 'Others',
          child: [{
            id: 'dialog',
            name: 'Dialog 对话框'
          }, {
            id: 'tooltip',
            name: 'Tooltip 文字提示'
          }, {
            id: 'popover',
            name: 'Popover 弹出框'
          }, {
            id: 'card',
            name: 'Card 卡片'
          }, {
            id: 'carousel',
            name: 'Carousel 走马灯'
          }, {
            id: 'collapse',
            name: 'Collapse 折叠面板'
          }]
        }]
      }, {
        id: 'ziyuan',
        name: '资源',
        child: [{
          id: 'axure',
          name: 'Axure Components'
        }, {
          id: 'sketch',
          name: 'Sketch Templates'
        }, {
          id: 'jiaohu',
          name: '组件交互文档'
        }]
      }]
    }
  },
  methods: {
    handleChange(id) {
      if (id.length > 0) {
        console.log(id[0])
        console.log(id[1])
        console.log(id[2])
        console.log(id)
      }
    },
    showGetHandler(node, data) {
      console.log(node)
      console.log(data)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
