let arr = [
  { a: 1 },
  { a: 2, b: 1 },
  { a: 3 },
]

for (const item of arr) {
  console.log(Object.prototype.hasOwnProperty.call(item, 'a'));

  if (item.a === 2) {
    break
  }
  console.log(item);
}