## koa-best-validator
校验以下四种参数传递
- ctx.params
- ctx.request.query
- ctx.request.header 
- ctx.request.body

### 校验规则
参考[async-validator](https://www.npmjs.com/package/async-validator)

### Usage
测试
```bash
nodemon test/index.js
```

代码内容，也可以找到项目根目录下面的test文件
```javascript
//./test/validator/person-validator.js

const { KoaBestValidator } = require('../../lib/index')
/**
 * 获取用户信息的Validator 继承KoaBestValidator
 */
class PersonValidator extends KoaBestValidator {
  constructor() {
    super()
    //添加校验规则，参考[async-validator](https://www.npmjs.com/package/async-validator)
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
            //自定义校验规则，参考[async-validator](https://www.npmjs.com/package/async-validator)
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
```
```javascript
//./test/index.js

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')
//异常错误
const PersonValidator = require('./validator/person-validator')
const RegistryValidator = require('./validator/registry-validator')


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

### API
#### validate
验证
```javascript
function(ctx:any,throwError:boolean): Promise
```
- `ctx`:Koa的请求上下文(必须)
- `throwError`:验证失败的时候，是否通过`throw new Error()`方式抛出错误，默认：false，非必填。如果为true，可以通过给Koa注册中间件，捕获异常。例如
```javascript
app.use(bodyParser())
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    //捕获到异常
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