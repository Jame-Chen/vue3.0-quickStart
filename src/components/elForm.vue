<template>
  <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" size="small" class="formModal">
    <el-row :gutter="0" v-for="(htem, h) in formData" :key="h">
      <el-col :span="item.span" v-for="(item, i) in htem" :key="i">
        <slot v-if="item.type == 'slot'" :name="item.prop" :data="item"></slot>

        <el-form-item v-if="item.type == 'hidden'" :prop="item.prop">
          <input type="hidden" v-model="ruleForm[item.prop]" />
        </el-form-item>

        <el-form-item v-if="item.type == 'input'" :label="item.label" :prop="item.prop">
          <el-input v-model="ruleForm[item.prop]" :disabled="item.disabled"></el-input>
        </el-form-item>

        <el-form-item v-if="item.type == 'select'" :label="item.label" :prop="item.prop">
          <el-select v-model="ruleForm[item.prop]" :placeholder="'请选择' + item.label" style="width:100%">
            <el-option v-for="(jtem, j) in item.options" :key="j" :label="jtem.label" :value="jtem.value"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="item.type == 'date'" :label="item.label" :prop="item.prop">
          <el-date-picker v-model="ruleForm[item.prop]" type="date" :placeholder="'请选择' + item.label" style="width: 100%;"></el-date-picker>
        </el-form-item>

        <el-form-item v-if="item.type == 'switch'" :label="item.label" :prop="item.prop">
          <el-switch v-model="ruleForm[item.prop]" style="width:100%"></el-switch>
        </el-form-item>

        <el-form-item v-if="item.type == 'checkbox'" :label="item.label" :prop="item.prop">
          <el-checkbox-group v-model="ruleForm[item.prop]" align="left">
            <el-checkbox v-for="(jtem, j) in item.options" :key="j" :label="jtem" :name="item.prop">{{ jtem }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item v-if="item.type == 'radio'" :label="item.label" :prop="item.prop">
          <el-radio-group v-model="ruleForm[item.prop]" style="width:100%">
            <el-radio v-for="(jtem, j) in item.options" :key="j" :label="jtem">{{ jtem }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="item.type == 'textarea'" :label="item.label" :prop="item.prop">
          <el-input type="textarea" v-model="ruleForm[item.prop]" style="width:100%"></el-input>
        </el-form-item>
        <el-form-item v-if="item.type == 'connectInput'" :label="item.label" :prop="item.prop">
          <el-input v-model="ruleForm[item.prop1]" style="width:100%"></el-input>
          <span>-</span>
          <el-input v-model="ruleForm[item.prop2]" style="width:100%"></el-input>
        </el-form-item>
        <el-form-item v-if="item.type == 'file'" :label="item.label" :prop="item.prop">
          <el-upload class="upload-demo" action="#" :http-request="handleRequest" :before-upload="BeforeUpload" align="left">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">
              只能上传*文件，且不超过100M
            </div>
          </el-upload>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" style="text-align:center">
        <el-button type="primary" v-show="showBtn" size="small" @click="submitForm('ruleForm')">{{ enterText }}</el-button>
        <el-button size="small" v-show="showRset" @click="resetForm('ruleForm')">{{ resetText }}</el-button>
      </el-col>
    </el-row>
  </el-form>
</template>
<script>
export default {
  props: {
    showBtn: {
      type: Boolean,
      default: true,
    },
    showRset: {
      type: Boolean,
      default: true,
    },
    enterText: {
      type: String,
      default: '确定',
    },
    resetText: {
      type: String,
      default: '重置',
    },
    formData: {
      type: Array,
      require: true,
      default: () => [
        [
          {
            label: '活动名称',
            prop: 'name',
            type: 'input',
            required: true,
            span: 6,
            value: '',
          },
          {
            label: '活动区域',
            prop: 'region',
            type: 'select',
            required: true,
            span: 6,
            options: [
              {
                label: '区域一',
                value: '区域一',
              },
              {
                label: '区域二',
                value: '区域二',
              },
            ],
          },
          {
            label: '活动时间',
            prop: 'date',
            type: 'date',
            required: true,
            span: 6,
          },
          {
            label: '即时配送',
            prop: 'delivery',
            type: 'switch',
            required: true,
            span: 6,
          },
        ],
        [
          {
            label: '活动性质',
            prop: 'hdtype',
            type: 'checkbox',
            required: true,
            span: 12,
            options: ['美食/餐厅线上活动', '地推活动', '线下主题活动'],
          },
          {
            label: '特殊资源',
            prop: 'resource',
            type: 'radio',
            required: false,
            span: 6,
            options: ['线上品牌商赞助', '线下场地免费'],
          },
          {
            label: '活动形式',
            prop: 'desc',
            type: 'textarea',
            required: true,
            span: 6,
          },
        ],
        [
          {
            label: '自定义',
            prop: 'custom',
            type: 'slot',
            required: false,
            span: 6,
          },
          {
            label: '附件',
            prop: 'fileid',
            type: 'file',
            required: false,
            span: 6,
          },
          {
            label: '连接输入框',
            prop: 'connectInput',
            prop1: 'num1',
            prop2: 'num2',
            type: 'connectInput',
            required: true,
            span: 6,
          },
        ],
      ],
    },
  },
  watch: {
    formData: {
      handler(val) {
        this.initData();
      },
      deep: true,
    },
  },
  mounted() {
    this.initData();
  },
  data() {
    return {
      ruleForm: {
        // name: '',
        // region: '',
        // date1: '',
        // date2: '',
        // delivery: false,
        // type: [],
        // resource: '',
        //desc: '',
      },
      rules: {
        // name: [
        //   { required: true, message: '请输入活动名称', trigger: 'blur' },
        //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        // ],
        // region: [{ required: true, message: '请选择活动区域', trigger: 'change' }],
        // date1: [{ type: 'date', required: true, message: '请选择日期', trigger: 'change' }],
        // date2: [{ type: 'date', required: true, message: '请选择时间', trigger: 'change' }],
        // type: [{ type: 'array', required: true, message: '请至少选择一个活动性质', trigger: 'change' }],
        // resource: [{ required: true, message: '请选择活动资源', trigger: 'change' }],
        // desc: [{ required: true, message: '请填写活动形式', trigger: 'blur' }],
      },
    };
  },
  methods: {
    initData() {
      let _this = this;
      let list = [].concat(..._this.formData);
      list.forEach(item => {
        if (item.type == 'switch') {
          _this.$set(_this.ruleForm, item.prop, false);
        } else if (item.type == 'checkbox') {
          _this.$set(_this.ruleForm, item.prop, []);
        } else {
          _this.$set(_this.ruleForm, item.prop, item.value ? item.value : '');
        }

        let arr = [];
        if (item.required) {
          if (item.type == 'input' || item.type == 'textarea' || item.type === 'connectInput') {
            arr.push({
              required: item.required,
              message: '请输入' + item.label,
              trigger: 'blur',
            });
          }
          if (item.type == 'select' || item.type == 'radio') {
            arr.push({
              required: item.required,
              message: '请选择' + item.label,
              trigger: 'change',
            });
          }
          if (item.type == 'date') {
            arr.push({
              type: 'date',
              required: item.required,
              message: '请输入' + item.label,
              trigger: 'change',
            });
          }
          if (item.type == 'checkbox') {
            arr.push({
              type: 'array',
              required: item.required,
              message: '请勾选' + item.label,
              trigger: 'change',
            });
          }
          if (item.rules) {
            arr.push(item.rules);
          }
        }
        _this.$set(this.rules, item.prop, arr);
        // console.log('this.rules', this.rules);
      });
      // console.log('_this.ruleForm', _this.ruleForm);
    },
    BeforeUpload(file) {
      let isRightSize = file.size / 1024 / 1024 < 100;
      if (!isRightSize) {
        this.$message.error('文件大小超过 100MB');
      }
      // let isAccept = new RegExp('*.doc').test(file.type);
      // if (!isAccept) {
      //   this.$message.error('应该选择image/*类型的文件');
      // }
      return isRightSize; //&& isAccept;
    },
    handleRequest(param) {
      let _this = this;
      let fd = new FormData();
      fd.append('file', param.file); //传文件
      //let url = config.baseUrl.pro.base + '/file/add-File';
      // request.post(url, fd).then(res => {
      //   if (res.code == 200) {
      //     // console.log('res', res);
      //     _this.checkResult = res.data;
      //   }
      // });
    },
    submitForm(formName) {
      let list = [].concat(...this.formData);
      console.log(list);
      let connectInputList = list.filter(item => item.type === 'connectInput');
      connectInputList.map(items => {
        if (this.ruleForm[items.prop1] && this.ruleForm[items.prop2]) {
          this.$refs[formName].clearValidate([items.prop]);
          this.$delete(this.rules, items.prop);
        }
      });

      let _this = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          // alert('submit!');
          console.log(this.ruleForm);
          _this.$emit('submit', this.ruleForm);
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  },
};
</script>
<style lang="scss" scoped>
/deep/.el-form-item {
  display: flex;
  align-items: center;
}
/deep/.el-form-item__content {
  display: flex;
  flex: 1;
  margin-left: 0 !important;
  .el-radio-group {
    display: flex;
    .el-radio {
      margin-right: 10px;
    }
  }
}
</style>
