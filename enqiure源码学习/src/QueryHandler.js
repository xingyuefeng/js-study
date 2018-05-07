/**
 * Delegate to handle a media query being matched and unmatched.
 *
 * @param {object} options
 * @param {function} options.match callback for when the media query is matched
 * @param {function} [options.unmatch] callback for when the media query is unmatched
 * @param {function} [options.setup] one-time callback triggered the first time a query is matched
 * @param {boolean} [options.deferSetup=false] should the setup callback be run immediately, rather than first time query is matched?
 * @constructor
 */
function QueryHandler(options) {
    // 自己配置的参数
    this.options = options;
    // deferSetup 为 false 立即执行 setup()
    !options.deferSetup && this.setup();
}

QueryHandler.prototype = {

    constructor : QueryHandler,

    /**
     * coordinates setup of the handler
     * 坐标设置处理程序
     * 
     * @function
     */
    setup : function() {
        if(this.options.setup) {
            this.options.setup();
        }
        // 初始化
        this.initialised = true;
    },

    /**
     * coordinates setup and triggering of the handler
     * 坐标设置和触发处理程序
     *
     * @function
     */
    on : function() {
        // 如果setup已经执行过了 就不要执行了
        !this.initialised && this.setup();
        this.options.match && this.options.match();
    },

    /**
     * coordinates the unmatch event for the handler
     * 协调处理程序的不匹配事件
     *
     * @function
     */
    off : function() {
        // 存在 unmatch 对象 才执行 对应的代码
        this.options.unmatch && this.options.unmatch();
    },

    /**
     * called when a handler is to be destroyed.
     * 在处理程序被销毁时调用
     * delegates to the destroy or unmatch callbacks, depending on availability.
     * 代表销毁或不匹配的回调，取决于可用性。
     *
     * @function
     */
    destroy : function() {
        // 判定是否有destory 属性 有的话执行 destroy 没有的执行 unmatch
        this.options.destroy ? this.options.destroy() : this.off();
    },

    /**
     * determines equality by reference.
     * 通过参考确定平等
     * if object is supplied compare options, if function, compare match callback
     * 如果提供了对象比较选项，如果功能比较匹配回调
     *
     * @function
     * @param {object || function} [target] the target for comparison 比较的目标
     */
    equals : function(target) {
        return this.options === target || this.options.match === target;
    }

};

module.exports = QueryHandler;
