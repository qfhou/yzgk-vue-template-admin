<template>
  <div class="app-container common-list-page">
    <el-form ref="resetForm" :model="resetForm" :rules="resetFormRules" class="login-form" status-icon label-width="100px">
      <el-form-item label="旧密码：" prop="password">
        <el-input v-model="resetForm.password" type="password" />
      </el-form-item>
      <el-form-item label="新密码：" prop="newpwd">
        <el-input v-model="resetForm.newpwd" type="password" auto-complete="off" />
      </el-form-item>
      <el-form-item label="确认密码：" prop="newpassword1">
        <el-input v-model="resetForm.newpassword1" type="password" auto-complete="off" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click.native.prevent="updatePassword">确认修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>

import request from '@/utils/request'
import { Message } from 'element-ui'

export default {
  data() {
    var validatePass = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入新密码'))
      } else if (value.toString().length < 6 || value.toString().length > 18) {
        callback(new Error('密码长度为6-18位'))
      } else {
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.resetForm.newpwd) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      resetForm: {
        password: '',
        newpwd: '',
        newpassword1: ''
      },
      resetFormRules: {
        password: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        newpwd: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ],
        newpassword1: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    getLogin(data) {
      return request({
        url: '/rest/admin/update-password',
        method: 'post',
        data
      })
    },
    updatePassword() {
      this.$refs.resetForm.validate(valid => {
        if (valid) {
          this.getLogin(
            {
              origin: this.resetForm.password,
              now: this.resetForm.newpwd
            }
          ).then(response => {
            console.log(response)
            if (response.data.status !== 200) {
              Message({
                message: response.data.message,
                type: 'error',
                duration: 5 * 1000
              })
            } else {
              Message({
                message: '密码修改成功， 请重新登录吧',
                type: 'info',
                duration: 3 * 1000
              })
              setTimeout(() => {
                this.logout()
              }, 3000)
            }
          })
        }
      })
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  width: 60%;
  margin: 50px auto 0;
  text-align: center;

  button {
    margin: 20px 0 0;
  }
}
  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }
</style>
