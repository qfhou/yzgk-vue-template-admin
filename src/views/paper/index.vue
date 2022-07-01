<template>
  <div class="dashboard-container">
    <div class="filter-container">
      <el-row>
        <el-col :span="8">
          <div class="grid-content" />
        </el-col>
        <el-col :span="8">
          <div class="grid-content">
            <el-input
              v-model="queryTitle"
              placeholder="试卷名称"
              style="width: 200px;"
              class="filter-item"
              @keyup.enter.native="handleFilter"
            />
            <el-button class="filter-item" type="primary" icon="el-icon-search" @click.native="handleFilter">
              查询
            </el-button>
            <el-button class="filter-item" type="primary" icon="el-icon-edit" @click.native.prevent="showSaveHandler()">
              添加
            </el-button>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="grid-content" />
        </el-col>
      </el-row>
    </div>
    <el-table
      v-loading="listLoading"
      border
      element-loading-text="Loading"
      :data="list"
      :current-page.sync="currentPage"
      :row-style="{height: '30px'}"
    >
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column prop="name" label="试卷名称" align="center">
        <template slot-scope="scope">
          <p class="showOverTooltip">{{ scope.row.name }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="passGrade" label="及格分数" width="100" align="center" />
      <el-table-column prop="fullGrade" label="满分分数" width="100" align="center" />
      <el-table-column prop="planCategoryName" label="计划类别" width="150" align="center" />
      <el-table-column prop="trainingList" label="关联培训" width="250" align="center">
        <template slot-scope="scope">
          <el-select v-if="scope.row.trainingList.length>0" v-model="scope.row.selectTrainingId">
            <el-option
              v-for="item in scope.row.trainingList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <p v-else>暂无培训关联</p>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click.native.prevent="showSaveHandler(scope.row)">查看统计</el-button>
          <el-button type="primary" size="mini" @click.native.prevent="showSaveHandler(scope.row)">编辑</el-button>
          <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" icon="el-icon-info" icon-color="red" title="确定删除吗？" @onConfirm="deleteHandler(scope.row)">
            <el-button slot="reference" type="danger" size="mini" style="margin-left:10px">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination :page-sizes="[10, 15, 20]" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <el-dialog :visible.sync="dialogVisibleSave" :title="dialogTitleSave" @close="closeDialogSave">
      <div>
        <el-form ref="itemSave" :model="itemSave" :rules="itemSaveFormRules" class="login-form" status-icon label-width="150px">
          <el-form-item label="试卷名称：" prop="name">
            <el-input v-model="itemSave.name" />
          </el-form-item>
          <el-form-item label="满分分数：" prop="fullGrade">
            <el-input-number v-model="itemSave.fullGrade" style="width: 100%" controls-position="right" :min="0" :max="999" />
          </el-form-item>
          <el-form-item label="及格分数：" prop="passGrade">
            <el-input-number v-model="itemSave.passGrade" style="width: 100%" controls-position="right" :min="0" :max="999" />
          </el-form-item>
          <el-form-item label="考试时长(分钟)：" prop="duration">
            <el-input-number v-model="itemSave.duration" style="width: 100%" controls-position="right" :min="1" :max="999" />
          </el-form-item>
          <el-form-item label="计划类别：" prop="planCategory">
            <el-cascader v-model="planCategoryId" style="width:100% " :show-all-levels="false" clearable filterable placeholder="搜索：" :options="options" :props="optionProps" @change="planCategoryCascaderPostChange">
              <template slot-scope="{ node, data }">
                <span>{{ data.name }}</span>
                <span v-if="!node.isLeaf"> ({{ data.child.length }}) </span>
              </template>
            </el-cascader>
          </el-form-item>
          <el-form-item label="题库:" prop="optionD">
            <el-input v-model="itemSave.optionD" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click.native="saveHandler">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import request from '@/utils/request'

export default {
  name: 'Dashboard',
  data() {
    return {
      list: null,
      queryTitle: '',
      listLoading: true,
      currentPage: 1,
      pagesize: 10,
      total: 0,
      dialogVisibleSave: false,
      dialogTitleSave: null,
      itemGet: null,
      id: [],
      options: [],
      optionProps: {
        expandTrigger: 'hover',
        value: 'id',
        label: 'name',
        children: 'child'
      },
      planCategoryId: [],
      itemSave: {
        id: '2323',
        name: null,
        fullGrade: 100,
        passGrade: 60,
        duration: 60,
        planCategory: null
      },
      itemSaveFormRules: {
        name: [
          { required: true, message: '请输入试卷名称', trigger: 'blur' }
        ],
        fullGrade: [
          { required: true, message: '请输入满分分数', trigger: 'blur' }
        ],
        passGrade: [
          { required: true, message: '请输入及格分数', trigger: 'blur' }
        ],
        duration: [
          { required: true, message: '请输入考试时长', trigger: 'blur' }
        ],
        planCategory: [
          { required: true, message: '请选择计划类别', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getOrganizationList()
    this.handleFilter()
  },
  methods: {
    getList(params) {
      request({
        url: '/rest/paper/list',
        method: 'get',
        params
      }).then(response => {
        this.list = response.data.data?.list
        this.total = response.data.data?.total
        this.listLoading = false
      })
    },
    getOrganizationList() {
      request({
        url: '/rest/dictionary/tree/PLAN_CATEGORY',
        method: 'get'
      }).then(response => {
        this.options = this.getTreeData(response.data.data)
      })
    },
    saveData(data) {
      return request({
        url: '/rest/paper/save',
        method: 'post',
        data
      })
    },
    deleteHandler(item) {
      request({
        url: '/rest/paper/delete/' + item.id,
        method: 'post'
      }).then(response => {
        this.handleFilter()
      })
    },
    handleFilter() {
      this.getList({ name: this.queryTitle, ageSize: this.pagesize, page: this.currentPage })
    },
    getTreeData(data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].child.length < 1) {
          // children若为空数组，则将children设为undefined
          data[i].child = undefined
        } else {
          // children若不为空数组，则继续 递归调用 本方法
          this.getTreeData(data[i].child)
        }
      }
      return data
    },
    // parents:用于返回的数组，childNode:要查询的节点，treeData：json树形数据
    findParent(parents, childId, treeData) {
      for (let i = 0; i < treeData.length; i++) {
      // 父节点查询条件
        if (treeData[i].id === childId) {
        // 如果找到结果,保存当前节点
          parents.push(treeData[i].parentId)
          // 用当前节点再去原数据查找当前节点的父节点
          this.findParent(parents, treeData[i].parentId, this.options)
          break
        } else {
          if (treeData[i].child instanceof Array) {
          //	没找到，遍历该节点的子节点
            this.findParent(parents, childId, treeData[i].child)
          }
        }
      }
      return parents
    },
    planCategoryCascaderPostChange(planCategoryId) {
      if (planCategoryId.length > 0) {
        this.itemSave.planCategory = planCategoryId[2]
      } else {
        this.itemSave.planCategory = null
      }
    },
    showSaveHandler(item) {
      this.getOrganizationList()
      if (item === undefined) {
        this.dialogTitleSave = '添加'
        this.planCategoryId = null
        this.itemSave.id = null
        this.itemSave.name = null
        this.itemSave.fullGrade = null
        this.itemSave.passGrade = null
        this.itemSave.duration = null
        this.itemSave.planCategory = null
      } else {
        this.dialogTitleSave = '编辑'
        this.itemSave = item
        var parents = []
        this.findParent(parents, this.itemSave.planCategory, this.options)
        this.planCategoryId[2] = this.itemSave.planCategory
        this.planCategoryId[1] = parents[0]
        this.planCategoryId[0] = parents[1]
      }
      this.dialogVisibleSave = true
    },
    saveHandler() {
      this.$refs.itemSave.validate(valid => {
        if (valid) {
          this.saveData(
            {
              id: this.itemSave.id && this.itemSave.id,
              name: this.itemSave.name,
              planCategory: this.itemSave.planCategory,
              fullGrade: this.itemSave.fullGrade,
              passGrade: this.itemSave.passGrade,
              duration: this.itemSave.duration
            }
          ).then(response => {
            this.handleFilter()
          })
          this.dialogVisibleSave = false
        }
      })
    },
    closeDialogSave() {
      this.handleFilter()
      this.id = []
      this.planCategoryId = []
    },
    handleSizeChange(val) {
      this.pagesize = val
      this.handleFilter()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.handleFilter()
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

.showOverTooltip {
  display: -webkit-box;
  text-overflow: ellipsis;
  overflow: hidden;
  /*这里是3行*/
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  margin: 0px;
}

.filter-container {
  padding-bottom: 10px;

  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
    margin-right: 10px;
  }
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.pagination-container {
  background: #fff;
  padding: 32px 16px;
}

.excel-upload-input{
  display: none;
  z-index: -9999;
}
</style>
