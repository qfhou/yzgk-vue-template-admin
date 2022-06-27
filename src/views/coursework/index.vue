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
      <el-table-column prop="title" label="课件标题" align="center">
        <template slot-scope="scope">
          <p class="showOverTooltip">{{ scope.row.title }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="课件描述" align="center">
        <template slot-scope="scope">
          <p class="showOverTooltip">{{ scope.row.content }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="planCategoryName" label="计划类别" width="150" align="center" />
      <el-table-column prop="fileTypeName" label="课件类型" width="150" align="center" />
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click.native.prevent="showSaveHandler(scope.row)">查看</el-button>
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

    <el-dialog :visible.sync="dialogVisibleSave" :title="dialogTitleSave" @close="closeDialogSave" @opened="openedDialogSave">
      <div>
        <el-form ref="itemSave" :model="itemSave" :rules="itemSaveFormRules" class="login-form" status-icon label-width="150px">
          <el-form-item label="课件标题：" prop="title">
            <el-input v-model="itemSave.title" />
          </el-form-item>
          <el-form-item label="课件描述：" prop="content">
            <el-input v-model="itemSave.content" />
          </el-form-item>
          <el-form-item label="计划类别：" prop="planCategory">
            <el-cascader v-model="planCategoryId" style="width:100% " :show-all-levels="false" clearable filterable placeholder="搜索：" :options="options" :props="optionProps" @change="planCategoryCascaderPostChange">
              <template slot-scope="{ node, data }">
                <span>{{ data.name }}</span>
                <span v-if="!node.isLeaf"> ({{ data.child.length }}) </span>
              </template>
            </el-cascader>
          </el-form-item>
          <el-form-item label="课件类型：" prop="fileType">
            <el-cascader v-model="fileTypeId" style="width:100% " clearable filterable placeholder="搜索：" :options="fileTypeOptions" :props="fileTypeOptionsProps" @change="fileTypeCascaderPostChange">
              <template slot-scope="{ node, data }">
                <span>{{ data.name }}</span>
                <span v-if="!node.isLeaf"> ({{ data.child.length }}) </span>
              </template>
            </el-cascader>
          </el-form-item>
          <el-form-item label="课件文件：" prop="optionA">
            <input ref="file-upload-input" class="file-upload-input" type="file" accept=".xlsx, .xls" @change="fileHandleClick">
            <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-upload" @click="fileHandleUpload">
              上传
            </el-button>
            <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-upload" @click="fileHandleDownLoad">
              下载
            </el-button>
            <el-image
              v-show="imageShow"
              ref="image"
              style="width: 150px; height: 150px"
              :src="itemSave.visitUrl"
              fit="cover"
              :preview-src-list="imageSrcList"
            />
            <video-player
              v-show="playerShow"
              ref="videoPlayer"
              style="width: 150px; height: 112.5px"
              class="video-player vjs-custom-skin"
              :playsinline="true"
              :options="playerOptions"
            />
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
import { Message } from 'element-ui'
import { videoPlayer } from 'vue-video-player'
import 'video.js/dist/video-js.css'

export default {
  name: 'Dashboard',
  components: {
    videoPlayer
  },
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
      fileTypeId: [],
      fileTypeOptions: [{
        id: 1,
        name: '视频',
        accept: '.mp4,.mov,.qlv,.wmv,.avi,.mkv,.f4v,.rmvb'
      }, {
        id: 2,
        name: 'PPT',
        accept: '.pptx,.ppt'
      }, {
        id: 3,
        name: '图片',
        accept: '.jpg,.png,.jpeg,.gif'
      }, {
        id: 4,
        name: 'pdf',
        accept: '.pdf'
      }, {
        id: 5,
        name: 'word',
        accept: '.doc,.docx'
      }],
      fileTypeOptionsProps: {
        expandTrigger: 'hover',
        value: 'id',
        label: 'name',
        children: 'child'
      },
      planCategoryId: [],
      formData: null,
      itemSave: {
        id: null,
        title: null,
        content: null,
        planCategory: null,
        fileType: null,
        filePath: null
      },
      itemSaveFormRules: {
        title: [
          { required: true, message: '课件标题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '课件描述', trigger: 'blur' }
        ],
        planCategory: [
          { required: true, message: '请选择计划类别', trigger: 'change' }
        ],
        fileType: [
          { required: true, message: '课件类型', trigger: 'change' }
        ]
      },
      imageShow: false,
      imageSrcList: [],
      playerShow: false,
      playerOptions: {
        playbackRates: [0.5, 1.0, 1.5, 2.0], // 可选的播放速度
        autoplay: false, // 如果为true,浏览器准备好时开始回放。
        muted: false, // 默认情况下将会消除任何音频。
        loop: false, // 是否视频一结束就重新开始。
        preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: 'zh-CN',
        aspectRatio: '4:3', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [{
          type: 'video/mp4', // 类型
          src: 'http://localhost/video/2022/6/26/FD79EE53B4B946B9A277DF510DF18CA1.mp4' // url地址
        }],
        poster: '', // 封面地址
        notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: true, // 当前时间和持续时间的分隔符
          durationDisplay: true, // 显示持续时间
          remainingTimeDisplay: false, // 是否显示剩余时间功能
          fullscreenToggle: true // 是否显示全屏按钮
        }
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
        url: '/rest/coursework/list',
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
        url: '/rest/coursework/save',
        method: 'post',
        data
      })
    },
    deleteHandler(item) {
      request({
        url: '/rest/coursework/delete/' + item.id,
        method: 'post'
      }).then(response => {
        if (response.data.status !== 200) {
          Message({
            message: response.data.message,
            type: 'error',
            duration: 5 * 1000
          })
        } else {
          this.handleFilter()
        }
      })
    },
    fileHandleUpload() {
      this.$refs['file-upload-input'].click()
    },
    fileHandleClick(e) {
      this.formData = new FormData()
      this.formData.append('file', e.target.files[0])
    },
    fileHandleDownLoad() {
      window.open(this.itemSave.visitUrl)
    },
    saveHandler() {
      this.$refs.itemSave.validate(valid => {
        if (valid) {
          request({
            url: '/rest/file/upload',
            method: 'post',
            data: this.formData,
            headers: { 'Content-Type': 'multipart/form-data' }
          }).then(response => {
            if (response.data.status !== 200) {
              Message({
                message: response.data.message,
                type: 'error',
                duration: 5 * 1000
              })
            } else {
              this.saveData(
                {
                  id: this.itemSave.id && this.itemSave.id,
                  title: this.itemSave.title,
                  content: this.itemSave.content,
                  planCategory: this.itemSave.planCategory,
                  fileType: this.itemSave.fileType,
                  filePath: response.data.data.fileKey
                }
              ).then(response => {
                this.handleFilter()
              })
              this.dialogVisibleSave = false
            }
          })
        }
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
    planCategoryCascaderPostChange(planCategoryId) {
      if (planCategoryId.length > 0) {
        this.itemSave.planCategory = planCategoryId[2]
      } else {
        this.itemSave.planCategory = null
      }
    },
    fileTypeCascaderPostChange(fileTypeId) {
      if (fileTypeId.length > 0) {
        const accept = this.fileTypeOptions[fileTypeId - 1].accept
        this.itemSave.fileType = fileTypeId[0]
        this.$set(this.$refs['file-upload-input'], 'accept', accept)
      } else {
        this.itemSave.fileType = null
      }
    },
    showSaveHandler(item) {
      this.getOrganizationList()
      if (item === undefined) {
        this.dialogTitleSave = '添加'
        this.planCategoryId = null
        this.itemSave.id = null
        this.itemSave.title = null
        this.itemSave.content = null
        this.itemSave.planCategory = null
      } else {
        this.dialogTitleSave = '编辑'
        this.itemSave = item
        this.imageSrcList = null
        this.imageSrcList = []
        this.imageSrcList[0] = this.itemSave.visitUrl

        var parents = []
        this.findParent(parents, this.itemSave.planCategory, this.options)
        this.planCategoryId[2] = this.itemSave.planCategory
        this.planCategoryId[1] = parents[0]
        this.planCategoryId[0] = parents[1]

        this.fileTypeId = null
        this.fileTypeId = []
        this.fileTypeId[0] = this.itemSave.fileType

        if (this.fileTypeId[0] === 1) { // 视频
          this.playerShow = true
        } else if (this.fileTypeId[0] === 3) { // 图片
          this.imageShow = true
        }
      }
      this.dialogVisibleSave = true
    },
    closeDialogSave() {
      this.handleFilter()
      this.id = []
      this.planCategoryId = []
      this.fileTypeId = []
      this.imageShow = false
      this.playerShow = false
    },
    openedDialogSave() {
      if (this.itemSave !== null) {
        var acceptValue = this.fileTypeOptions[this.itemSave.fileType - 1].accept
        this.$set(this.$refs['file-upload-input'], 'accept', acceptValue)
      }
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

.file-upload-input{
  display: none;
  z-index: -9999;
}
</style>
