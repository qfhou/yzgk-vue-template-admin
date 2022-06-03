<template>
  <div class="dashboard-container">
    <div class="filter-container">
      <el-row>
        <el-col :span="4">
          <div class="grid-content" />
        </el-col>
        <el-col :span="16">
          <div class="grid-content">
            <div class="filter-item">
              <el-input
                v-model="queryRealName"
                placeholder="真实姓名"
                style="width: 200px;margin-right: 15px;"
                class="filter-item"
                @keyup.enter.native="handleFilter"
              />
              <el-input
                v-model="queryMobile"
                placeholder="手机号"
                style="width: 200px;margin-right: 15px;"
                class="filter-item"
                @keyup.enter.native="handleFilter"
              />
              <el-button class="filter-item" type="primary" icon="el-icon-search" @click.native="handleFilter">
                查询
              </el-button>
              <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click.native.prevent="showSaveHandler()">
                批量导入
              </el-button>
              <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click.native.prevent="showSaveHandler()">
                添加
              </el-button>
            </div>
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
    >
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column prop="identityNumber" label="身份证号" width="200" align="center" />
      <el-table-column prop="realName" label="真实姓名" width="auto" align="center" />
      <el-table-column prop="username" label="用户名" width="auto" align="center" />
      <el-table-column prop="mobile" label="手机号" width="auto" align="center" />
      <el-table-column prop="email" label="邮箱" width="auto" align="center" />
      <el-table-column prop="departmentName" label="部门" width="auto" align="center" />
      <el-table-column prop="postName" label="岗位" width="auto" align="center" />
      <el-table-column prop="lastLoginTime" label="最后登录时间" width="auto" align="center" />
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!-- <el-button type="success" size="mini" @click.native.prevent="showGetHandler(scope.row)">查看</el-button> -->
          <el-button type="primary" size="mini" @click.native.prevent="showSaveHandler(scope.row)">编辑</el-button>
          <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" icon="el-icon-info" icon-color="red" title="确定删除吗？" @onConfirm="deleteHandler(scope.row)">
            <el-button slot="reference" type="danger" size="mini" style="margin-left:10px">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination :page-sizes="[5, 9, 15]" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <el-dialog :visible.sync="dialogVisibleGet" title="公告">
      <div>
        <div class="demo-input-suffix">
          <h3>公告题目：</h3>
          <span>{{ itemGet && itemGet.title }}</span>
        </div>
        <div class="demo-input-suffix">
          <h3>公告内容：</h3>
          <span>{{ itemGet && itemGet.content }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogVisibleGet = false">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisibleSave" :title="dialogTitleSave" @close="closeDialogSave">
      <div>
        <el-form ref="itemSave" :model="itemSave" :rules="itemSaveFormRules" class="login-form" status-icon label-width="100px">
          <el-form-item label="公告题目：" prop="title">
            <el-input v-model="itemSave.title" />
          </el-form-item>
          <el-form-item label="公告内容：" prop="content">
            <el-input v-model="itemSave.content" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click.native="saveHandler">确认修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import request from '@/utils/request'
// import { Message } from 'element-ui'

export default {
  name: 'Dashboard',
  data() {
    return {
      list: null,
      queryRealName: null,
      queryMobile: null,
      listLoading: true,
      currentPage: 1,
      pagesize: 5,
      total: 0,
      dialogVisibleGet: false,
      dialogVisibleSave: false,
      dialogTitleSave: null,
      itemGet: null,
      itemSave: {
        id: null,
        title: null,
        content: null
      },
      itemSaveFormRules: {
        title: [
          { required: true, message: '请输入公告标题', trigger: 'blur' }
        ],
        content: [
          { required: true, validator: '请输入公告内容', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  created() {
    this.getList({ realName: this.queryRealName, mobile: this.queryMobile, pageSize: this.pagesize, page: this.currentPage })
  },
  methods: {
    getList(params) {
      request({
        url: '/rest/student/list',
        method: 'get',
        params
      }).then(response => {
        this.list = response.data.data?.list
        this.total = response.data.data?.total
        this.listLoading = false
      })
    },
    saveData(data) {
      return request({
        url: '/rest/student/save',
        method: 'post',
        data
      })
    },
    handleFilter() {
      this.getList({ realName: this.queryRealName, pageSize: this.pagesize, page: this.currentPage })
    },
    showGetHandler(item) {
      this.itemGet = item
      this.dialogVisibleGet = true
    },
    showSaveHandler(item) {
      if (item === undefined) {
        this.dialogTitleSave = '新增公告'
        this.itemSave.id = null
        this.itemSave.title = null
        this.itemSave.content = null
      } else {
        this.dialogTitleSave = '修改公告'
        this.itemSave = item
      }
      this.dialogVisibleSave = true
    },
    saveHandler() {
      this.$refs.itemSave.validate(valid => {
        if (valid) {
          this.saveData(
            {
              title: this.itemSave.title,
              content: this.itemSave.content,
              id: this.itemSave.id && this.itemSave.id
            }
          ).then(response => {
            // alert(response.data.message)
          })
          this.dialogVisibleSave = false
        }
      })
    },
    closeDialogSave() {
      this.handleFilter()
    },
    deleteHandler(item) {
      request({
        url: '/rest/student/delete/' + item.id,
        method: 'post'
      }).then(response => {
        this.handleFilter()
      })
    },
    handleSizeChange(val) {
      this.pagesize = val
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
}

.filter-container {
  padding-bottom: 10px;

  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
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
</style>
