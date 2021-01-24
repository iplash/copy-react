/**
 * vnode
 * type 原生标签>type string
 *      文本标签>children string number
 *      函数组件>type function
 * props 属性 className href id children等等
 */
function render(vnode: any, container: any, callback?: Function) {
  //console.log(vnode)
  const node = createNode(vnode);
  container.append(node);
}

function isStringOrNumber(str: string | number) {
  return typeof str === 'string' || typeof str === 'number';
}

function createNode(vnode: any): HTMLElement {
  const { type } = vnode;
  let node;
  // todo 根据虚拟dom节点, 生成真实dom节点
  if (typeof type === 'string') {
    node = updateHostComponent(vnode)
  } else if (isStringOrNumber(vnode)) {
    //文本数字节点
    node = updateTextComponent(vnode);
  } else if (typeof type === 'function') {
    node = type.prototype.isReactComponent
      ? updateClassComponent(vnode)
      : updateFunctionComponent(vnode);
  } else {
    node = updateFragmentComponent(vnode);
  }
  return node;
}

function updateNode(node: any, nextVal: any) {
  Object.keys(nextVal).filter(k => k !== "children").forEach(k => {
    node[k] = nextVal[k]
  })
}

function updateHostComponent(vnode: any) {
  const { type, props } = vnode;
  const node = document.createElement(type);
  updateNode(node, props);
  reconcileChildren(node, props.children);
  return node;
}

function reconcileChildren(parentNode: any, children: any) {
  const newChildren = Array.isArray(children) ? children : [children];
  for (let i = 0; i < newChildren.length; i++) {
    let child = newChildren[i];
    render(child, parentNode);
  }
}

function updateTextComponent(vnode: any) {
  const node = document.createTextNode(vnode);
  return node;
}

function updateFunctionComponent(vnode: any) {
  const { type, props } = vnode;
  const child = type(props);
  const node = createNode(child);
  return node;
}

function updateClassComponent(vnode: any) {
  const { type, props } = vnode;
  const instance = new type(props);
  const child = instance.render();
  const node = createNode(child);
  return node;
}

function updateFragmentComponent(vnode: any) {
  const node = document.createDocumentFragment();
  reconcileChildren(node, vnode.props.children);
  return node;
}

//下一个要渲染更新任务
let nextUnitOfWork: any = null;

function performUnitOfWork(workInProgress: any) {
  // step1: 渲染更新fiber
  // todo
  // step2: 返回下一个
  if (workInProgress.child) {
    return workInProgress.child;
  }
  let nextFiber = workInProgress;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;
  }
}

function workLoop() {
  while (nextUnitOfWork && IdleDeadline.timeRemaining > 1) {
    // 渲染更新fiber, 并返回下一个
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // commit
    if (!nextUnitOfWork) { }
  }
}

requestIdleCallback(workLoop);

const ReactDOM = {
  render: render
}

export default ReactDOM;