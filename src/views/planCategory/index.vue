<template>
  <div class="custom-tree-container">
    <div class="block">
      <el-tree
        :data="treeList"
        show-checkbox
        node-key="id"
        default-expand-all
        :props="treeProps"
        :expand-on-click-node="false"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>
              <el-button type="success" size="mini" style="padding-top: 5px;padding-bottom: 5px;" @click.native.prevent="showSaveHandler(node,data,'add')">添加</el-button>
              <el-button type="primary" size="mini" style="padding-top: 5px;padding-bottom: 5px;" @click.native.prevent="showSaveHandler(node,data,'update')">编辑</el-button>
              <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" icon="el-icon-info" icon-color="red" title="确定删除吗？" @onConfirm="deleteHandler(node,data)">
                <el-button slot="reference" type="danger" size="mini" style="margin-left:10px;padding-top: 5px;padding-bottom: 5px;">删除</el-button>
              </el-popconfirm>
            </span>
          </span>
        </template>
      </el-tree>
    </div>

    <el-dialog :visible.sync="dialogVisibleSave" :title="dialogTitleSave" @close="closeDialogSave">
      <div>
        <el-form ref="itemSave" :model="itemSave" :rules="itemSaveFormRules" class="login-form" status-icon label-width="100px">
          <el-form-item label="节点名称：" prop="name">
            <el-input v-model="itemSave.name " />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click.native="saveHandler(treeItemData)">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import request from '@/utils/request'
// import { Message } from 'element-ui'

export default {
  data() {
    return {
      treeList: null,
      treeItemNode: null,
      treeItemData: null,
      listLoading: true,
      treeProps: {
        label: 'name',
        children: 'child'
      },
      itemSave: {
        id: null,
        name: null,
        parentId: null,
        level: null,
        type: null
      },
      itemSaveFormRules: {
        name: [
          { required: true, message: '请输入节点名称', trigger: 'blur' }
        ]
      },
      dialogVisibleSave: false,
      dialogTitleSave: null,
      itemSaveType: null
    }
  },
  created() {
    this.GetList()
  },
  methods: {
    GetList() {
      request({
        url: '/rest/dictionary/tree/PLAN_CATEGORY',
        method: 'get'
      }).then(response => {
        this.treeList = response.data.data
        this.listLoading = false
      })
    },
    saveData(data) {
      return request({
        url: '/rest/dictionary/save',
        method: 'post',
        data
      })
    },
    showSaveHandler(node, data, dataType) {
      this.treeItemNode = node
      this.treeItemData = data
      this.itemSaveType = dataType
      if (this.itemSaveType === 'add') {
        this.dialogTitleSave = '新增'
        this.itemSave.name = null
        this.itemSave.parentId = node.key
        this.itemSave.level = node.level
        this.itemSave.type = 'PLAN_CATEGORY'
      } else {
        this.dialogTitleSave = '修改'
        this.itemSave = JSON.parse(JSON.stringify(data))
      }
      this.dialogVisibleSave = true
    },
    saveHandler(data) {
      this.$refs.itemSave.validate(valid => {
        if (valid) {
          this.saveData(
            {
              id: this.itemSave.id && this.itemSave.id,
              name: this.itemSave.name,
              parentId: this.itemSave.parentId,
              level: this.itemSave.level,
              type: this.itemSave.type
            }
          ).then(response => {
            if (this.itemSaveType === 'add') {
              const newChild = { id: response.data.data.id, name: response.data.data.name, children: [] }
              if (!data.child) {
                data.child = []
              }
              data.child.push(newChild)
            } else {
              this.treeItemData.name = response.data.data.name
            }
          })
          this.dialogVisibleSave = false
        }
      })
    },
    deleteHandler(node, data) {
      request({
        url: '/rest/dictionary/delete/' + data.id,
        method: 'post'
      }).then(response => {
        const parent = node.parent
        const child = parent.data.child || parent.data
        const index = child.findIndex(d => d.id === data.id)
        child.splice(index, 1)
      })
    },
    closeDialogSave() {
      // this.handleFilter()
    }
  }
}
</script>
<style>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
