
import AsyncValidator from 'async-validator'
import { cloneDeep, get, isPlainObject } from 'lodash'
// import cloneDeep from 'lodash/cloneDeep'
// import get from 'lodash/get'
// import isPlainObject from 'lodash/isPlainObject'

class RuleResult {
  valid: boolean
  message: string | undefined
  invalidFields: any
  constructor(valid: boolean, message?: string | undefined, invalidFields?: any) {
    this.valid = valid
    this.message = message
    this.invalidFields = invalidFields
  }
}

class KoaBestValidator {
  parameters!: any
  model!: any
  descriptor!: any

  /**
   * 验证规则
   * @param {object} ctx  context上下文
   * @param {boolean} thowError  是否抛出异常错误，默认false
   */
  validate(ctx: any, thowError: boolean = false) {
    const descriptor = this.descriptor
    const parameters = this._assembleAllParams(ctx)
    this.parameters = cloneDeep(parameters)

    return new Promise((resolve, reject) => {
      if (descriptor && isPlainObject(descriptor) && Object.keys(descriptor).length > 0) {
        var validator = new AsyncValidator(descriptor)
        const model = this._getModel(descriptor)

        //验证
        validator.validate(model, { first: true, firstFields: true }, (errors: any, invalidFields: any) => {
          let valid = !errors
          let message = errors ? errors[0].message : '';
          if (thowError && !valid) {
            reject(message)
          } else {
            resolve(new RuleResult(valid, message, invalidFields))
          }
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
  _getModel(descriptor: any) {
    let model: any = {}
    Object.keys(descriptor).forEach((key) => {
      model[key] = this.findParam(key).value
    })
    this.model = model
    return model
  }

  /**
   * 寻找model
   * lodash get方法
   * @param {string} key 
   */
  findParam(key: string) {
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
   * 根据key获取参数值
   * @param {string} key 
   */
  getValue(key: string) {
    return this.model[key] || ''
  }

  /**
   * Private:聚合请求参数
   * @param {object} ctx  context上下文
   */
  _assembleAllParams(ctx: any) {
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