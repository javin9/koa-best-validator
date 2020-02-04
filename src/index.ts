
import AsyncValidator from 'async-validator'
import { cloneDeep, get, isPlainObject, last } from 'lodash'
// import cloneDeep from 'lodash/cloneDeep'
// import get from 'lodash/get'
// import isPlainObject from 'lodash/isPlainObject'

class RuleResult {
  valid: boolean
  validator: Validator
  message: string | undefined
  invalidFields: any

  constructor(valid: boolean, validator: Validator, message?: string | undefined, invalidFields?: any) {
    this.valid = valid
    this.message = message
    this.invalidFields = invalidFields
    this.validator = validator
  }
}

class Validator {
  //默认参数
  parameters!: any
  //根据类型格式化后的参数
  pasrsedParameters!: any

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
    this.pasrsedParameters = cloneDeep(parameters)

    return new Promise((resolve, reject) => {
      if (descriptor && isPlainObject(descriptor) && Object.keys(descriptor).length > 0) {
        var validator = new AsyncValidator(descriptor)
        const model = this._getModel(descriptor)

        //验证
        validator.validate(model, { first: true, firstFields: true }, (errors: any, invalidFields: any) => {
          let valid = !errors
          let message = errors ? errors[0].message : '';
          let result = new RuleResult(valid, this, message, invalidFields)
          if (thowError && !valid) {
            reject(result)
          } else {
            resolve(result)
          }
        })
      } else {
        resolve(new RuleResult(true, this))
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
      const rules = descriptor[key]
      if (!Array.isArray(rules)) {
        throw new Error('验证规则必须为数组')
      }
      let value: any = this.findParam(key).value
      for (const rule of rules) {
        if (Object.prototype.hasOwnProperty.call(rule, 'type')) {
          value = this._convert(rule.type, value)
          break;
        }
      }
      model[key] = value
    })
    this.model = model
    return model
  }

  /**
   * 类型转换
   * @param value 
   */
  _convert(type: string, value: string, ) {
    if (!value) {
      return value
    }

    let result: any = ''
    switch (type) {
      case 'number':
        result = parseInt(value)
        break;
      case 'string':
        result = String(value)
        break;
      case 'float':
        result = parseFloat(value)
        break;
      case 'boolean':
        result = !!value
        break;
      default:
        result = value
        break;
    }
    return result
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
  getValue(path: string | undefined) {
    if (!path) {
      return ''
    }
    //根据路径找，如果根据路径找不到，在根据key找
    const value = get(this.parameters, path, null)
    if (value == null && !path.includes('.')) {
      return this.model[path] || this.findParam(path).value
    }
    return value
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
  Validator,
  RuleResult
}