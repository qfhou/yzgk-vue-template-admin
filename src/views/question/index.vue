<template>
  <div class="dashboard-container">
    <div class="filter-container">
      <el-row>
        <el-col :span="4">
          <div class="grid-content" />
        </el-col>
        <el-col :span="16">
          <div class="grid-content">
            <el-cascader v-model="id" class="filter-item" :show-all-levels="false" clearable filterable placeholder="计划类别" :options="options" :props="optionProps" @change="cascaderPostChange">
              <template slot-scope="{ node, data }">
                <span>{{ data.name }}</span>
                <span v-if="!node.isLeaf"> ({{ data.child.length }}) </span>
              </template>
            </el-cascader>
            <el-input
              v-model="queryTitle"
              placeholder="考题题目"
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
            <input ref="excel-upload-input" class="excel-upload-input" type="file" accept=".xlsx, .xls" @change="handleClick">
            <el-button class="filter-item" type="primary" icon="el-icon-upload" @click="handleUpload">
              批量导入
            </el-button>
          </div>
        </el-col>
        <el-col :span="4">
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
      <el-table-column prop="title" label="考试题目" align="center">
        <template slot-scope="scope">
          <p class="showOverTooltip">{{ scope.row.title }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="categoryName" label="题目类型" width="150" align="center" />
      <el-table-column prop="grade" label="题目分数" width="150" align="center" />
      <el-table-column prop="planCategoryName" label="计划类别" width="150" align="center" />
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="scope">
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
          <el-form-item label="考试题目：" prop="title">
            <el-input v-model="itemSave.title" />
          </el-form-item>
          <el-form-item label="题目类型：" prop="category">
            <el-cascader v-model="categoryId" style="width:100% " :show-all-levels="false" clearable filterable placeholder="搜索：" :options="categoryOptions" :props="categoryOptionProps" @change="categoryCascaderPostChange">
              <template slot-scope="{ node, data }">
                <span>{{ data.name }}</span>
                <span v-if="!node.isLeaf"> ({{ data.child.length }}) </span>
              </template>
            </el-cascader>
          </el-form-item>
          <el-form-item label="计划类别：" prop="planCategory">
            <el-cascader v-model="planCategoryId" style="width:100% " :show-all-levels="false" clearable filterable placeholder="搜索：" :options="options" :props="optionProps" @change="planCategoryCascaderPostChange">
              <template slot-scope="{ node, data }">
                <span>{{ data.name }}</span>
                <span v-if="!node.isLeaf"> ({{ data.child.length }}) </span>
              </template>
            </el-cascader>
          </el-form-item>
          <el-form-item label="选项A：" prop="optionA">
            <el-input v-model="itemSave.optionA" />
          </el-form-item>
          <el-form-item label="选项B：" prop="optionB">
            <el-input v-model="itemSave.optionB" />
          </el-form-item>
          <el-form-item label="选项C：" prop="optionC">
            <el-input v-model="itemSave.optionC" />
          </el-form-item>
          <el-form-item label="选项D：" prop="optionD">
            <el-input v-model="itemSave.optionD" />
          </el-form-item>
          <el-form-item label="题目答案：" prop="answer">
            <el-input v-model="itemSave.answer" placeholder="多选题答案用逗号隔开，如A,D" />
          </el-form-item>
          <el-form-item label="考题分数：" prop="grade">
            <el-input v-model="itemSave.grade" />
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
import Axios from 'axios'
import { Message } from 'element-ui'

export default {
  name: 'Dashboard',
  data() {
    return {
      list: null,
      queryCategoryId: null,
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
      categoryId: [],
      categoryOptions: [{
        id: 1,
        name: '单选题'
      }, {
        id: 2,
        name: '多选题'
      }],
      categoryOptionProps: {
        expandTrigger: 'hover',
        value: 'id',
        label: 'name',
        children: 'child'
      },
      planCategoryId: [],
      itemSave: {
        id: null,
        title: null,
        category: null,
        planCategory: null,
        optionA: null,
        optionB: null,
        optionC: null,
        optionD: null,
        answer: null,
        grade: null
      },
      itemSaveFormRules: {
        title: [
          { required: true, message: '请输入考题名称', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择题目类型', trigger: 'change' }
        ],
        planCategory: [
          { required: true, message: '请选择计划类别', trigger: 'change' }
        ],
        optionA: [
          { required: true, message: '请输入选项A', trigger: 'blur' }
        ],
        optionB: [
          { required: true, message: '请输入选项B', trigger: 'blur' }
        ],
        optionC: [
          { required: true, message: '请输入选项C', trigger: 'blur' }
        ],
        optionD: [
          { required: true, message: '请输入选项D', trigger: 'blur' }
        ],
        answer: [
          { required: true, message: '请输入题目答案', trigger: 'blur' }
        ],
        grade: [
          { required: true, message: '考题分数', trigger: 'blur' }
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
        url: '/rest/question/list',
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
        url: '/rest/question/save',
        method: 'post',
        data
      })
    },
    handleFilter() {
      this.getList({ childPlanCategoryId: this.queryCategoryId, title: this.queryTitle, ageSize: this.pagesize, page: this.currentPage })
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
    cascaderPostChange(id) {
      if (id.length > 0) {
        this.queryCategoryId = id[2]
      } else {
        this.queryCategoryId = null
      }
      this.handleFilter()
    },
    categoryCascaderPostChange(categoryId) {
      if (categoryId.length > 0) {
        this.itemSave.category = categoryId[0]
      } else {
        this.itemSave.category = null
      }
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
        this.itemSave.title = null
        this.itemSave.category = null
        this.itemSave.planCategory = null
        this.itemSave.optionA = null
        this.itemSave.optionB = null
        this.itemSave.optionC = null
        this.itemSave.optionD = null
        this.itemSave.answer = null
        this.itemSave.grade = null
      } else {
        this.dialogTitleSave = '编辑'
        this.itemSave = item
        this.categoryId = this.itemSave.category
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
              title: this.itemSave.title,
              category: this.itemSave.category,
              planCategory: this.itemSave.planCategory,
              optionA: this.itemSave.optionA,
              optionB: this.itemSave.optionB,
              optionC: this.itemSave.optionC,
              optionD: this.itemSave.optionD,
              answer: this.itemSave.answer,
              grade: this.itemSave.grade
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
      this.categoryId = []
      this.planCategoryId = []
    },
    deleteHandler(item) {
      request({
        url: '/rest/question/delete/' + item.id,
        method: 'post'
      }).then(response => {
        this.handleFilter()
      })
    },
    handleSizeChange(val) {
      this.pagesize = val
      this.handleFilter()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.handleFilter()
    },
    handleUpload() {
      this.$refs['excel-upload-input'].click()
    },
    handleClick(e) {
      const formData = new FormData()
      formData.append('file', e.target.files[0])
      const url = this.$store.state.settings.urlPath + '/rest/file/batch/import/question'
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
      Axios.post(url, formData, config).then(function(response) {
        if (response.data.status !== 200) {
          Message({
            message: response.data.message,
            type: 'error',
            duration: 5 * 1000
          })
        } else {
          Message({
            message: '导入成功',
            type: 'info',
            duration: 5 * 1000
          })
        }
      })
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
