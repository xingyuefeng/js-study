# react-router 源码学习(一)

自从`react`占据了工作中的全部，为了以后不做api搬运工，必须深入了解下`react`，`react`源码本人一下子难以看懂，在`react`的生态中`react-router` 这个库，也是我离不开的,在我学习使用的时候已经v4版本了，路由也奉行了组件化思想，不用像 `vue-router` 那样单独写路由配置, so 先定个小目标看懂 `react-router`

## 预备知识

- `react-router` 核心思想 [https://zhuanlan.zhihu.com/p/25696969](https://zhuanlan.zhihu.com/p/25696969)
- `react-router` 核心库 `path-to-regexp` [https://github.com/pillarjs/path-to-regexp](https://github.com/pillarjs/path-to-regexp)
- `react-router` 核心库 `history` [https://segmentfault.com/a/1190000010251949](https://segmentfault.com/a/1190000010251949)
- `react-router` 文档(必看) [https://reacttraining.com/](https://reacttraining.com/)

## `BrowerRouter` `HashRouter`

v4版本的`react-router` 源码中将 `react-router` 分为web端跟native, 目前只分析web端 `react-router-dom`

`router-router-dom` 中 最外层 `Router` 组件有两种分别是 `BrowerRouter` `HashRouter`

两者在源码中的唯一区别:

```jsx
// BrowerRouter
import { createBrowserHistory as createHistory } from "history";

// HashRouter
import { createHashHistory as createHistory } from "history";

```

`history` 为`react-router` 提供了路由跳转，url，params参数等等，这两个引入的最大区别在于从URL创建location的方式。`browser history`使用完整URL，而`hash history`只使用在第一个hash后的那部分URL。

```jsx
// 提供如下URL
url = 'http://www.example.com/this/is/the/path?key=value#hash'
// browser history创建的location对象:
{
  pathname: '/this/is/the/path',
  search: '?key=value',
  hash: '#hash'
}
//hash history创建的location对象:
{
  pathname: 'hash',
  search: '',
  hash: ''
}
```

[何时需要hash](https://segmentfault.com/a/1190000010251949#articleHeader11)

作用：给 `Router` 组件 `history` 对象跟组件的传值， 让内部的组件可以调用`history` api

核心源码 `BrowerRouter`:

```jsx
history = createHistory(this.props);
render() {
  return <Router history={this.history} children={this.props.children} />;
}

```

## `Router`

作用： 监听路由变化 ，及时更新组件

核心源码:

```jsx

// 初始化数据， 这里的 path url 在 Route组件中会更新
computeMatch(pathname) {
    return {
      path: "/",
      url: "/",
      params: {},
      isExact: pathname === "/"
    };
  }

componentWillMount() {
  const { children, history } = this.props;

  //  监听路由变化，
  this.unlisten = history.listen(() => {
    this.setState({
      match: this.computeMatch(history.location.pathname)
    });
  });
}

render() {
    const { children } = this.props;
    return children ? React.Children.only(children) : null;
}

```

## 重头戏 `Route` 组件

作用: `Route` 组件会都渲染出来，根据路由判断是否匹配到，匹配显示,匹配不到直接 `return null`

这个组件中用到的 `matchPath` 方法， 依赖于 `path-to-regexp`, 用于匹配路由参数，
组件中也可以配置很多属性和方法， `path strict exact sensitive`, `strict  sensitive` 用于`history`, `exact` 匹配到 `/` 的时候，如果 `exact` 则只会匹配 `/` 的组件。`matchPath` 方法 在匹配路由的时候，对匹配过的路由会进行保存，当下次匹配到相同路由的时候可以直接返回已有的数据，提高效率。

```jsx
state = {
  // computeMatch 调用 matchPath
  match: this.computeMatch(this.props, this.context.router)
};

// 只有匹配到当前路由才会返回数据否则为null，， 数据格式

{
  path: "/a/:name/:age",
  url: "/a/xyf/18",
  isExact:true,
  params: {
    name: 'xyf',
    age: 18,
  }
}

// 根据返回的匹配参数，决定是否显示组件
render() {
  const { match } = this.state;
  const { children, component, render } = this.props;
  const { history, route, staticContext } = this.context.router;
  const location = this.props.location || route.location;
  const props = { match, location, history, staticContext };
  // 多种显示组件的方法
  if (component) return match ? React.createElement(component, props) : null;

  if (render) return match ? render(props) : null;

  if (typeof children === "function") return children(props);

  if (children && !isEmptyChildren(children))
    return React.Children.only(children);

  return null;
}
```

## Link

路由的跳转少不了点击，`Link` 的作用就是 生成 动态 `href` 赋值给`a`标签中， 实现点击跳转

```jsx
handleClick = event => {
  if (this.props.onClick) this.props.onClick(event);

  if (
    !event.defaultPrevented && // onClick prevented default
    event.button === 0 && // ignore everything but left clicks
    !this.props.target && // let browser handle "target=_blank" etc.
    !isModifiedEvent(event) // ignore clicks with modifier keys
  ) {
    event.preventDefault();

    const { history } = this.context.router;
    // replace: 替换原有历史记录 to: path路径
    const { replace, to } = this.props;

    if (replace) {
      history.replace(to);
    } else {
      history.push(to);
    }
  }
};

render() {
  // 路由的创建形式 之前说过有两种，此方法根据最外层 Router 传递的api 来创建对应的路由
  const href = history.createHref(location);
  return (
    <a {...props} onClick={this.handleClick} href={href} ref={innerRef} />
  );
}
```

## 暂时的总结。。。

在写`React` 包括之前 `Vue`， 写的都是单页面应用，层次一直都是能写。看了`react-router` 原来单页面的路由跳转也都是假象阿，其实并没有跳转，只是根据路由来判断页面的显示，真的很奇妙。 有时间还得抓紧看别的组件。