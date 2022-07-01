<template>
  <div class="dashboard-container">
    <div class="filter-container">
      <el-row>
        <el-col :span="8">
          <div class="grid-content" />
        </el-col>
        <el-col :span="8">
          <div class="grid-content">
            <div class="filter-item">
              <el-input
                v-model="queryTitle"
                placeholder="学员名称"
                style="width: 200px;margin-right: 15px;"
                class="filter-item"
                @keyup.enter.native="handleFilter"
              />
              <el-button class="filter-item" type="primary" icon="el-icon-search" @click.native="handleFilter">
                查询
              </el-button>
            </div>
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
      <el-table-column prop="studentName" label="学员名称" width="auto" align="center" />
      <el-table-column prop="department" label="所属部门" width="auto" align="center" />
      <el-table-column prop="grade" label="所得分数" width="auto" align="center" />
      <el-table-column prop="resultStatusName" label="考试结果" width="auto" align="center">
        <template slot-scope="scope">
          <button v-if="statistics.resultStatus == 0" @click.native.prevent="examAgainHandler(scope.row)">再次考试</button>
        </template>
      </el-table-column>
      <el-table-column prop="modifyTime" label="交卷时间" width="auto" align="center" />
    </el-table>
    <div class="pagination-container">
      <el-pagination :page-sizes="[10, 15, 20]" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
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
      queryTitle: null,
      listLoading: true,
      currentPage: 1,
      pagesize: 10,
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
    this.announcementList({ title: this.queryTitle, pageSize: this.pagesize, page: this.currentPage })
  },
  methods: {
    announcementList(params) {
      request({
        url: '/rest/announcement/list',
        method: 'get',
        params
      }).then(response => {
        this.list = response.data?.list
        this.total = response.data?.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.announcementList({ title: this.queryTitle, pageSize: this.pagesize, page: this.currentPage })
    },
    examAgainHandler(item) {
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
    handleSizeChange(val) {
      this.pagesize = val
      this.handleFilter()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.handleFilter()
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => { })
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
