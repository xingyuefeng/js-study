# reduce方法的理解

### 文档说明

``` javascript
_.reduce(list, iteratee, [memo], [context]) Aliases: inject, foldl
```

别名为 inject 和 foldl, reduce方法把list中元素归结为一个单独的数值。Memo是reduce函数的初始值，会被每一次成功调用iteratee函数的返回值所取代 。这个迭代传递4个参数：memo,value 和 迭代的index（或者 key）和最后一个引用的整个 list。

类似于es6中的reduce

如果没有memo传递给reduce的初始调用，iteratee不会被列表中的第一个元素调用。第一个元素将取代memo参数传递给列表中下一个元素调用的iteratee函数。

```javascript
var sum = _.reduce([1, 2, 3], function(memo, num){ return memo + num; }, 0);
=> 6
```

### 迭代

相对于for循环 更推崇使用迭代

### 理解

我个人觉得大体思路:

- 将获取迭代的值单独拆分出来，通过内部的遍历获取迭代的结果，返回结果值
- 利用闭包 外部传入需要迭代的值、方法、memo值 等等

### 简化版代码

```javascript
var reducer = function(dir) {
  // 单独拆分迭代函数
  // 返回reduce遍历迭代最新的值，memo为当前reduce迭代的值
  // obj: 需要遍历的对象或者数组
  // iteratee： 传入的迭代方法
  var reduce = function(obj, iteratee, memo, keys, index, length) {
    // 根据dir 的正负值 循环判断顺序
    for(;index >= 0 && index < length; index += dir) {
      // 迭代，返回值供下次迭代调用
      memo = iteratee(memo, obj[index], currentKey, obj);
    }
    return memo
  }
  // 外部传入 数组 迭代方法 初始值 this需要指向的上下文
  return function(obj, iteratee, memo, context) {
    // 重点 cd方法的作用
    // 首先判断传入的iteratee 是方法还是对象， 在本段代码中是方法
    //  cd 调用 写在内部的 optimizeCb 这个方法的大概作用就是将 arguments参数 具体到只想用的，提高性能
    //  重写的iteratee方法 返回一个需要传4个参数的方法 就是 reduce里要用的
    // iteratee 会将传入的前两个值 第一个为memo 就是迭代的是 第二个是当前迭代中数组的值，根据传入的方法进行运算
    iteratee = cb(iteratee, context, 4);
    var keys = '';
    var length = obj.length;
    var index = dir > 0 ? 0 : length - 1;
    if(arguments.length < 3) {
      memo = obj[0]
    }
    return reduce(obj, iteratee, memo, keys, index, length)
  }
}
// 调用函数
var r = reducer(1)
var m = r([1,2,3], function(memo, b) {return memo+b}, 0) // 6
```

### 感悟

理解完underscore中的reduce方法 个人觉得在es6成为标准的今天，优先使用e6中的方法，是不会错的。单独写个reduce就太傻了。 但是学习怎么实现非常有价值，特别是我没有接触过函数式编程。学习理解underscore也是我当前阶段的一大计划。