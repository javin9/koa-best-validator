const { KoaBestValidator } = require('../../lib/index')

/**
 * 注册验证
 */
class RegistryValidator extends KoaBestValidator {
  constructor() {
    super()
    this.descriptor = {
      username: [
        {
          type: "string",
          required: true
        }
      ],
      passwd1: [
        {
          //自定义验证规则
          validator: (rule, value, cb) => {
            if (!value) {
              cb(new Error('请输入密码'))
            } else {
              cb()
            }
          }
        }
      ],
      passwd2: [
        {
          validator: (rule, value, cb) => {
            if (!value) {
              cb(new Error('请再次输入密码'))
            } else {
              //获取某一个字段
              const passwd1 = this.findParam('passwd1').value
              if (value !== passwd1) {
                cb(new Error('两次输入密码不一致!'));
              } else {
                cb();
              }
            }
          }
        }
      ]
    }
  }
}


module.exports = RegistryValidator