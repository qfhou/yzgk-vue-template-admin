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
                添加
              </el-button>
              <input ref="excel-upload-input" class="excel-upload-input" type="file" accept=".xlsx, .xls" @change="handleClick">
              <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-upload" @click="handleUpload">
                批量导入
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
      <!-- <el-table-column prop="identityNumber" label="身份证号" width="200" align="center" /> -->
      <el-table-column prop="realName" label="真实姓名" width="auto" align="center" />
      <el-table-column prop="username" label="用户名" width="auto" align="center" />
      <el-table-column prop="mobile" label="手机号" width="auto" align="center" />
      <el-table-column prop="email" label="邮箱" width="auto" align="center" />
      <el-table-column prop="departmentName" label="部门" width="auto" align="center" />
      <el-table-column prop="postName" label="岗位" width="auto" align="center" />
      <!-- <el-table-column prop="lastLoginTime" label="最后登录时间" width="auto" align="center" /> -->
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
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
          <el-form-item label="真是姓名：" prop="realName">
            <el-input v-model="itemSave.realName" />
          </el-form-item>
          <el-form-item label="用户名：" prop="username">
            <el-input v-model="itemSave.username" />
          </el-form-item>
          <el-form-item label="密码：" prop="password">
            <el-input v-model="itemSave.password" />
          </el-form-item>
          <el-form-item label="手机号：" prop="mobile">
            <el-input v-model="itemSave.mobile" />
          </el-form-item>
          <el-form-item label="邮箱：" prop="email">
            <el-input v-model="itemSave.email" />
          </el-form-item>
          <el-form-item label="身份证号：" prop="identityNumber">
            <el-input v-model="itemSave.identityNumber" />
          </el-form-item>
          <el-form-item label="公司、部分、岗位：" prop="post">
            <!-- <el-input v-if="false" v-model="itemSave.post" /> -->
            <el-cascader v-model="id" style="width:100% " clearable filterable placeholder="搜索：" :options="options" :props="optionProps" @change="cascaderPostChange">
              <template slot-scope="{ node, data }">
                <span>{{ data.name }}</span>
                <span v-if="!node.isLeaf"> ({{ data.child.length }}) </span>
              </template>
            </el-cascader>
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
import { mapGetters } from 'vuex'
import request from '@/utils/request'
import Axios from 'axios'
import { Message } from 'element-ui'

export default {
  name: 'Dashboard',
  data() {
    var validateMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法的手机号码
        return callback()
      }
      callback(new Error('手机号码格式不正确'))
    }
    var validateEmail = (rule, value, callback) => {
      if (!value) {
        return callback()
      }
      const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }
    var validateIdentityNumber = (rule, value, callback) => {
      if (!value) {
        return callback()
      }
      const city = {
        11: '北京',
        12: '天津',
        13: '河北',
        14: '山西',
        15: '内蒙古',
        21: '辽宁',
        22: '吉林',
        23: '黑龙江 ',
        31: '上海',
        32: '江苏',
        33: '浙江',
        34: '安徽',
        35: '福建',
        36: '江西',
        37: '山东',
        41: '河南',
        42: '湖北 ',
        43: '湖南',
        44: '广东',
        45: '广西',
        46: '海南',
        50: '重庆',
        51: '四川',
        52: '贵州',
        53: '云南',
        54: '西藏 ',
        61: '陕西',
        62: '甘肃',
        63: '青海',
        64: '宁夏',
        65: '新疆',
        71: '台湾',
        81: '香港',
        82: '澳门',
        91: '国外'
      }
      if (!value || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(value)) {
        callback(new Error('身份证号格式错误'))
      } else if (!city[value.substr(0, 2)]) {
        callback(new Error('身份证号格式错误'))
      } else {
      // 18位身份证需要验证最后一位校验位
        if (value.length === 18) {
          const code = value.split('')
          // ∑(ai×Wi)(mod 11)
          // 加权因子
          const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
          // 校验位
          const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]
          let sum = 0
          let ai = 0
          let wi = 0
          for (let i = 0; i < 17; i++) {
            ai = code[i]
            wi = factor[i]
            sum += ai * wi
          }
          if (parity[sum % 11].toString() !== code[17]) {
            callback(new Error())
          }
        }
      }
      callback()
    }

    return {
      list: null,
      queryRealName: null,
      queryMobile: null,
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
      itemSave: {
        id: null,
        realName: null,
        username: null,
        password: null,
        mobile: null,
        email: null,
        identityNumber: null,
        company: null,
        department: null,
        post: null,
        repeatPassword: false
      },
      itemSaveFormRules: {
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        mobile: [
          { required: true, validator: validateMobile, trigger: 'blur' }
        ],
        email: [
          { required: false, validator: validateEmail, trigger: 'blur' }
        ],
        identityNumber: [
          { required: false, validator: validateIdentityNumber, trigger: 'blur' }
        ],
        post: [
          { required: true, message: '请选择岗位', trigger: 'change' }
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
    getOrganizationList() {
      request({
        url: '/rest/dictionary/tree/ORGANIZATION',
        method: 'get'
      }).then(response => {
        this.options = this.getTreeData(response.data.data)
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
      this.getList({ realName: this.queryRealName, mobile: this.queryMobile, pageSize: this.pagesize, page: this.currentPage })
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
    cascaderPostChange(id) {
      if (id.length > 0) {
        this.itemSave.company = id[0]
        this.itemSave.department = id[1]
        this.itemSave.post = id[2]
      }
    },
    showSaveHandler(item) {
      this.getOrganizationList()
      if (item === undefined) {
        this.dialogTitleSave = '新增学员'
        this.id = null
        this.itemSave.id = null
        this.itemSave.realName = null
        this.itemSave.username = null
        this.itemSave.password = null
        this.itemSave.mobile = null
        this.itemSave.email = null
        this.itemSave.identityNumber = null
        this.itemSave.company = null
        this.itemSave.department = null
        this.itemSave.post = null
        this.itemSave.repeatPassword = false
      } else {
        this.dialogTitleSave = '修改学员'
        this.itemSave = item
        this.id[0] = this.itemSave.company
        this.id[1] = this.itemSave.department
        this.id[2] = this.itemSave.post
      }
      this.dialogVisibleSave = true
    },
    saveHandler() {
      this.$refs.itemSave.validate(valid => {
        if (valid) {
          this.saveData(
            {
              id: this.itemSave.id && this.itemSave.id,
              realName: this.itemSave.realName,
              username: this.itemSave.username,
              password: this.itemSave.password,
              mobile: this.itemSave.mobile,
              email: this.itemSave.email,
              identityNumber: this.itemSave.identityNumber,
              company: this.itemSave.company,
              department: this.itemSave.department,
              post: this.itemSave.post,
              repeatPassword: false
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
      const url = this.$store.state.settings.urlPath + '/rest/file/batch/import/student'
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

.excel-upload-input{
  display: none;
  z-index: -9999;
}
</style>
