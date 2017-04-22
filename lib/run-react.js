const most = require('most')
const ReactDOM = require('react-dom')
const h = require('react-hyperscript')

class ReactSource {
  constructor (component, rootNode, props$) {
    this.component = component
    this.rootNode = rootNode
    this.props$ = props$
  }

  run (sink, scheduler) {
    const props$ = this.props$
    const Component = this.component
    const rootNode = this.rootNode
    const task = {
      run (t) {
        const propsSubscription = props$.source.run({
          event (t, props) {
            console.log('a')
            ReactDOM.render(h(Component, props), rootNode)
          },
          error (t, err) {
            ReactDOM.render(h('div', [err.message, err.stack]), rootNode)
          },
          end (t) {
            ReactDOM.unmountComponentAtNode(rootNode)
          }
        }, scheduler)
        this._disposables.push(propsSubscription)
      },
      error (t, err) {
        this.dispose()
        sink.error(t, err)
      },
      dispose () {
        ReactDOM.unmountComponentAtNode(rootNode)
        return Promise.all(this._disposables.map(x => x.dispose()))
      },
      _disposables: []
    }
    return scheduler.asap(task)
  }
}

module.exports = function (component, rootNode) {
  return function ({props$}) {
    return {
      action$: new most.Stream(
        new ReactSource(component, rootNode, props$)
      ).multicast()
    }
  }
}
