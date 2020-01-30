const schema = require('async-validator')
const AsyncValidator = schema.default
const { cloneDeep, get, set, last, isPlainObject } = require('lodash')


/**
 * 验证结果
 */
class RuleResult {
  constructor(valid, message = '', invalidFields = '') {
    this.valid = valid
    this.message = message
    this.invalidFields = invalidFields
  }
}
/**
 * 验证器基类
 */
class KoaBestValidator {
  constructor() {
    this.parameters = {}
    this.descriptor = {}
  }

  /**
   * 验证规则
   * @param {object} ctx  context上下文
   */
  validate (ctx) {
    const descriptor = this.descriptor
    const parameters = this._assembleAllParams(ctx)
    this.parameters = cloneDeep(parameters)

    return new Promise((resolve, reject) => {
      if (descriptor && isPlainObject(descriptor) && Object.keys(descriptor).length > 0) {
        var validator = new AsyncValidator(descriptor)
        const model = this._getModel(descriptor)

        //验证
        validator.validate(model, { first: true, firstFields: true }, (errors, invalidFields) => {
          let valid = !errors
          let message = errors ? errors[0].message : '';
          resolve(new RuleResult(valid, message, invalidFields))
        })
      } else {
        resolve(new RuleResult(true))
      }
    })
  }

  /**
   * 构建request model
   * @param {object} rules 验证规则
   */
  _getModel (descriptor) {
    let model = {}
    Object.keys(descriptor).forEach((key) => {
      model[key] = this.findParam(key).value
    })
    return model
  }

  /**
   * 寻找model
   * lodash get方法
   * @param {string} key 
   */
  findParam (key) {
    let value
    value = get(this.parameters, ['query', key])
    if (value) {
      return {
        value,
        path: ['query', key]
      }
    }
    value = get(this.parameters, ['body', key])
    if (value) {
      return {
        value,
        path: ['body', key]
      }
    }
    value = get(this.parameters, ['params', key])
    if (value) {
      return {
        value,
        path: ['params', key]
      }
    }
    value = get(this.parameters, ['header', key])
    if (value) {
      return {
        value,
        path: ['header', key]
      }
    }
    return {
      value: null,
      path: []
    }
  }

  /**
   * Private:聚合请求参数
   * @param {object} ctx  context上下文
   */
  _assembleAllParams (ctx) {
    return {
      params: ctx.params,
      query: ctx.request.query,
      body: ctx.request.body,
      header: ctx.request.header
    }
  }
}

module.exports = {
  KoaBestValidator
}