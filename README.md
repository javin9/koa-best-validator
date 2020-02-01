## koa-best-validator
校验以下四种参数传递
- ctx.params
- ctx.request.query
- ctx.request.header 
- ctx.request.body

### 目录
- 校验规则
- 安装
- 使用
- 属性
- 

### 校验规则
参考[async-validator](https://www.npmjs.com/package/async-validator)

### 安装
```bash
yarn add koa-best-validator 
# 或
npm i koa-best-validator 
```
### 使用
具体的[demo地址]
```javascript
//./test/validator/person-validator.js

const { Validator } = require('koa-best-validator')

// 第一步：继承基类Validator
// 第二部：参考aysnc-validator，在属性descriptor添加校验规则
class PersonValidator extends Validator {
  constructor() {
    super()
    //添加校验规则，参考async-validator
    this.descriptor = {
      name: [
        { type: "string", required: true },
        { min: 3, max: 5, message: '长度在 3 到 5 个字符' }
      ],
      age: [
        {
          required: true, type: 'number', message: 'is error', validator: (rule, value) => {
            return value > 10
          }
        }
      ],
      grade: [
        {
          validator: (rule, value, callback) => {
            //自定义校验规则，参考async-validator
            if (value) {
              callback()
            } else {
              callback(new Error('必填啊'))
            }
          }
        }
      ]
    };
  }
}

module.exports = PersonValidator
```

```javascript
// ./test/validator/registry-validator.js
const { Validator } = require('koa-best-validator')

// 第一步：继承基类Validator
// 第二部：参考aysnc-validator，在属性descriptor添加校验规则
class RegistryValidator extends Validator {
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
```


路由中使用编写的Validaotr类，传入ctx
```javascript
//./test/index.js

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')
//异常错误
const PersonValidator = require('./validator/person-validator')
const RegistryValidator = require('./validator/registry-validator')

const {RuleResult}=require('koa-best-validator')


const app = new Koa()
const router = new Router()

app.use(bodyParser())

/**
 * 捕获全局异常
 */
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    if(error instanceof RuleResult){
    //Koa-best-validator抛出的错误实例
    console.log(error)
    }
    ctx.body = {
      message: error
    }
  }
})

router.get('/api/getuserinfo', async (ctx, next) => {
  //验证
  const { valid, validator } = await (new PersonValidator()).validate(ctx)
  //通过getValue方法可以拿到值
  const name = validator.getValue('name')
  const age = validator.getValue('age')
  const grade = validator.getValue('grade')
  ctx.body = {
    code: 'success',
    name,
    age,
    grade
  }
})


router.post('/api/registry', async (ctx, next) => {
  //验证
  const v = await (new RegistryValidator()).validate(ctx)
  ctx.body = {
    code: 'success'
  }
})
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3001)
```

### Validator 属性
descriptor：Object。校验规则，具体可以参考async-validator

### Validator API
#### validate
验证
```javascript
function(ctx:any,throwError:boolean): Promise
```
- `ctx`:Koa的请求上下文(必须)
- `throwError`:验证失败的时候，是否通过`throw new Error(new RuleResult（）)`方式抛出错误，默认：false，非必填。如果为true，可以通过给Koa注册中间件，捕获异常。例如
```javascript
const { RuleResult } = require('koa-best-validator')
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    if (error instanceof RuleResult) {
      //Koa-best-validator抛出的错误实例
      console.log(error)
    }
    ctx.body = {
      message: error
    }
  }
})
```

#### findParam
自定义校验规则时，通过key获取value
```javascript
function(key:string):any
```

#### getValue
取值。
```javascript
function(key:string):any
```
例子：
```javascript
 const { valid, validator } = await (new PersonValidator()).validate(ctx)
  //通过getValue方法可以拿到值
  const name = validator.getValue('name')
  const age = validator.getValue('age')
  const grade = validator.getValue('grade')
  ctx.body = {
    code: 'success',
    name,
    age,
    grade
  }
```
### 演示
具体的[demo地址](https://github.com/rupid/koa-best-validator/tree/master/test)
```bash
nodemon test/index.js
```