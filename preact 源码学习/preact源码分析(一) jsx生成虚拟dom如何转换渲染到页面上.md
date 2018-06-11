# preact源码分析(一) jsx生成虚拟dom如何转换渲染到页面上

`preact` 是最小的 `react-like` 库，接口与`react`大体一致，所以学习`preact` 应该能为后面去看`react`源码提供帮助。

## 最基础的渲染

```jsx
import { h, render } from 'preact';

render((
  <div id="foo">
    <div>test</div>
    <button>button</button>
  </div>
), document.body);

```

`h` 与 `react`  中的 `cloneElement` 类似, 讲`jsx`的代码转换成类似于下面这样的

```jsx
render((
  h('div', {id: 'foo'},
    h('div', null, 'test'),
    h('button', null, 'button')
  )
), document.body);

// 最后生成一个树形结构的虚拟dom
{
  'div',
  attributes: {id：'foo'},
  children: [
    VNode: {
      nodeName: 'div',
      children: ['test'],
      attributes: null,
      key: null,
    },
    VNode: {
      nodeName: 'button',
      children: ['button'],
      attributes: null,
      key: null,
    },
  ],
  key: null,
}
```

第一个参数是标签名, 如果是组件的话是组件名，第二个参数是组件的属性值，第三个参数是组件的`child`， 生成虚拟`dom`，也就是代码中经常提到的`vnode`

## render

`render`代码

```jsx
import { diff } from './vdom/diff';

export function render(vnode, parent, merge) {
  return diff(merge, vnode, {}, false, parent, false);
}
```

`render`方法调用内部的`diff`方法将虚拟`dom`转换为真实`dom`,添加到页面上去。`diff` 方法是个有非常多判断的语句，为的就是生成`dom` 的时候提高效率。暂时去掉第一次渲染页面时不需要的判断语句，这样我好分析一点，不然真是头大。

```jsx
// 生成真实dom节点
import { createNode } from '../dom/index';

// 真实dom 添加到页面中
/**
* @param dom 真实dom
* @param vnode 虚拟dom
* @param context 类似于react context
* @param mountAll 暂不清楚 第一次渲染默认为false 暂时不影响
* @param parent dom添加页面的根节点
* @param componentRoot 暂不清楚 第一次渲染默认为false 暂时不影响
*/
export function diff(dom, vnode, context, mountAll, parent, componentRoot) {

  let ret = idiff(dom, vnode, context, mountAll, componentRoot);
  if (parent && ret.parentNode!==parent) parent.appendChild(ret);
  return ret;
}

// vnode 转成真实dom
function idiff(dom, vnode, context, mountAll, componentRoot) {
  let out = dom;
  let vnodeName = vnode.nodeName;

  // 遍历到最后如果只有文字了， 直接生成文本节点
  if (typeof vnode==='string' || typeof vnode==='number') {
    out = document.createTextNode(vnode);
    return out;
  }

  vnodeName = String(vnodeName);
  out = createNode(vnodeName, false);

  // 有子节点的情况， 就是vnode的children
  let vchildren = vnode.children;
  let fc = out.firstChild;
  if (vchildren && vchildren.length || fc!=null) {
    innerDiffNode(out, vchildren, context, mountAll)
  }
  // console.log(out);
  return out;
}

// 遍历vnode子元素， 生成对应的dom元素
function innerDiffNode(dom, vchildren, context, mountAll) {
  let originalChildren = dom.childNodes,
      vlen = vchildren ? vchildren.length : 0,
    f, vchild, child;

    if (vlen!==0) {
      for (let i=0; i<vlen; i++) {
        vchild = vchildren[i];
        child = null;
        // 如果子节点还有的话 继续遍历
        child = idiff(child, vchild, context, mountAll);
        f = originalChildren[i];
        if (child && child!==dom && child!==f) {
          if (f==null) {
            dom.appendChild(child);
          }
          else {
            dom.insertBefore(child, f);
          }
        }

      }
    }
}


```

看起来也是蛮复杂的，用了三个函数，又因函数内部很多判断我都搞不清楚什么意思，精简一下感觉好多了。
`diff` 调用 `idff` 生成真实`dom` 添加到页面上。思路非常简单，这里`innerDiffNode` 函数修改的直接是 `idiff` 传给他的 `dom`,  因为`dom` 是个对象

大体就是这样，这应该是最简单的`preact` 例子，`preact` 的diff更详细的算法还没有搞懂，还有会涉及到异步渲染，组件回收， 生命周期 ... 

## 暂时心得

发现记笔记真的好阿，看源码的时候还有迷糊的地方，写笔记的时候回头再看清晰多了。这篇笔记也会查漏补缺，因为事件还没有添加上去，别的漏的地方也还未知。