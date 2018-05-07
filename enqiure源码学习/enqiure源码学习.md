# enquire源码学习

[enquire.js](https://github.com/WickyNilliams/enquire.js) 是一个用写js的方式， 响应媒体查询的一个非常精简的库。

之前我如果写响应式网站我会第一时间想到css的媒体查询，因为我想不到别的办法。现在看了这个库，发现原来js也是可以写响应式的，并且某些方面能做到比用css好。 例如 从后台通过ajax 根据屏幕宽度的不同加载不同的数据， 只用css的话，需要两个接口都调用，用js的方式写的话可以根据宽度的不同调取不同的接口。提高网站性能。

## 核心 api matchMedia

[matchMedia](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Testing_media_queries)

## 大体结构

这个库是用面向对象的方法写的，跟之前看的js-cookies不同。 主入口文件是在`index.js`中引入的`MediaQueryDispatch.js`, `MediaQueryDispatch.js` 中的构造函数原型上提供`register` 和 `unregister` 方法供外部调用。
调用 `register` 方法时 会先把 媒体查询的参数作为 `key` 值，第二个参数也就是相应的方法作为 `value`, 因为第二个参数也支持数组所以 内部 会先将传入的对象转成数组，遍历根据当前的屏幕宽度执行对应的 `match`;

检测查询条件是否符合，是在 `MediaQuery.js` 执行的， 这个类 的作用是提供单个注册程序的注册， 管理其查询的状态和注册处理程序。 内部会有一个监听器，监听屏幕变化。

## 链式调用

enquire 也是支持链式调用的， 我开始没搞明白， 原来是在 register 方法中返回一个this

## 总结

具体的分析都在代码中了，英语不好的我苦逼阿，就着翻译来的。这个库代码非常精简，但是我花了两三天的时间。。。因为我一开始看的是编译过的版本，太尴尬了。 学习不间断。