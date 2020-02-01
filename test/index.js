
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')
//异常错误
const PersonValidator = require('./validator/person-validator')
const RegistryValidator = require('./validator/registry-validator')
const { RuleResult } = require('../lib/index')


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
    if (error instanceof RuleResult) {
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

