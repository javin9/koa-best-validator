## Koa-best-validator
校验以下四种参数传递
- ctx.params
- ctx.request.query
- ctx.request.header 
- ctx.request.body

### 校验规则
参考[async-validator](https://www.npmjs.com/package/async-validator)

### API
#### validate
验证
```javascript
function(ctx,throwError): Promise
```
- `ctx`:Koa的请求上下文(必须)
- `throwError`:验证失败的时候，是否通过`throw new Error()`方式抛出错误，默认：false，非必填

### findParam
通过key获取value
```javascript
function(key):any
```

### usae
```javascript
const { KoaBestValidator } = require('../src/index')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()

app.use(bodyParser())

/**
 * 获取用户信息的Validator
 */
class PersonValidator extends KoaBestValidator {
  constructor() {
    super()
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




router.get('/api/getuserinfo', async (ctx, next) => {
  const v = await (new PersonValidator()).validate(ctx)
  console.log(v);
  ctx.body = {
    code: 'success'
  }
})


router.post('/api/registry', async (ctx, next) => {
  const v = await (new RegistryValidator()).validate(ctx)
  ctx.body = {
    code: 'success'
  }
})
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3001)


```
