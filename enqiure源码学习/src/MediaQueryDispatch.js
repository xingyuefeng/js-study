var MediaQuery = require('./MediaQuery');
var Util = require('./Util');
var each = Util.each;
var isFunction = Util.isFunction;
var isArray = Util.isArray;

/**
 * Allows for registration of query handlers.
 * 允许注册查询处理程序
 * Manages the query handler's state and is responsible for wiring up browser events
 * 管理查询处理程序的状态并负责连接浏览器事件
 * @constructor
 */
function MediaQueryDispatch () {
    // 浏览器不支持matchMedia Api
    if(!window.matchMedia) {
        throw new Error('matchMedia not present, legacy browsers require a polyfill');
    }

    this.queries = {};
    // 浏览器不支持的 
    this.browserIsIncapable = !window.matchMedia('only all').matches;
}

MediaQueryDispatch.prototype = {

    constructor : MediaQueryDispatch,

    /**
     * Registers a handler for the given media query
     * 为给定的媒体查询注册处理程序
     *
     * @param {string} q the media query
     * @param {object || Array || Function} options either a single query handler object, a function, or an array of query handlers
     * @param {function} options.match fired when query matchedu
     * @param {function} [options.unmatch] fired when a query is no longer matched
     * @param {function} [options.setup] fired when handler first triggered
     * @param {boolean} [options.deferSetup=false] whether setup should be run immediately or deferred until query is first matched
     * @param {boolean} [shouldDegrade=false] whether this particular media query should always run on incapable browsers
     *                                        这个特定的媒体查询是否应该始终运行在无能的浏览器上
     */
    register : function(q, options, shouldDegrade) {
        var queries         = this.queries,
            // 浏览器不支持 不支持 为 true 支持为 undefined
            isUnconditional = shouldDegrade && this.browserIsIncapable;
        // 将配置的代码参数， key 为 媒体查阅 value 为 具体的配置
        if(!queries[q]) {
            queries[q] = new MediaQuery(q, isUnconditional);
        }
        
        //normalise to object in an array
        if(isFunction(options)) {
            options = { match : options };
        }
        // 如果传入的options 也就是第二个参数 不是数组  是个对象 将其转换成数组 可以遍历
        if(!isArray(options)) {
            options = [options];
        }
        // 遍历options  查询添加一个处理程序，如果已经激活，则触发
        each(options, function(handler) {
            if (isFunction(handler)) {
                handler = { match : handler };
            }
            // 查询添加一个处理程序，如果已经激活，则触发
            queries[q].addHandler(handler);
        });
        // 多个注册链式调用 
        return this;
    },

    /**
     * unregisters a query and all it's handlers, or a specific handler for a query
     * 取消注册查询及其所有处理程序或查询的特定处理程序
     *
     * @param {string} q the media query to target
     * @param {object || function} [handler] specific handler to unregister 如果没有 则移除整个注册信息
     */
    unregister : function(q, handler) {
        var query = this.queries[q];

        if(query) {
            // 有第二个参数 则执行unmatch 方法
            if(handler) {
                query.removeHandler(handler);
            }
            // 执行 destory 方法
            else {
                query.clear();
                delete this.queries[q];
            }
        }

        return this;
    }
};

module.exports = MediaQueryDispatch;
