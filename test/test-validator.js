const schema = require('async-validator')
const AsyncValidator = schema.default

var descriptor = {
  name: [
    { type: "string", required: true },
    { min: 3, max: 5, message: '长度在 3 到 5 个字符' }
  ],
  age: [
    {
      required: true, type: 'number', message: 'is error', validator: (rule, value) => {
        console.log(rule, value);
        return false
      }
    }
  ]
};
let validator = new AsyncValidator(descriptor)//var validator = new schema(descriptor);
validator.validate({ name: '333d', age: 10 }, (errors, fields) => {
  if (errors) {
    console.log(errors);
  } else {
    console.log('success');
  }
  // validation passed
});

