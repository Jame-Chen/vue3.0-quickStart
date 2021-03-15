export default {
    /**
     * @description 配置显示在浏览器标签的title
     */
    title: '杨浦市政设施养护管理系统',
    /**
     * @description 配置请求的系统别名
     */
    moduleCode: 'upms',
    /**
     * @description token在Cookie中存储的天数，默认1天, 单位天
     */
    cookieExpires: 1 / 12, // 一小时
    /**
     * @description 默认打开的首页的路由name值，默认为home
     */
    homeName: 'Home',
    /**
     * @description 是否在左侧显示二三级菜单，默认为 false
     */
    side: false,
    /**
     * @description 需要加载的插件
     */
    plugin: {
        'error-store': {
            showInHeader: true, // 设为false后不会在顶部显示错误日志徽标
            developmentOff: true // 设为true后在开发环境不会收集错误信息，方便开发中排查错误
        }
    },
    /**
     * @description 是否使用国际化，默认为false
     *              如果不使用，则需要在路由中给需要在菜单中展示的路由设置meta: {title: 'xxx'}
     *              用来在菜单中显示文字
     */
    useI18n: true,
    /**
     * @description api请求基础路径
     */
    /**
     * @description api请求基础路径
     */
    baseUrl: {
        dev: {
            base: 'http://localhost:8080/wavenet',
            login: 'http://localhost:8080/wavenet'
        },
        pro: {
            //服务器环境
            base: 'http://106.75.229.99/api-yp',
            userbase: 'http://106.75.229.99/api-sso',
            ssourl: 'http://106.75.229.99/yp-sso/#/Login',
            //本地环境
            // base: 'http://172.18.0.159:9016/api-yp',
            // userbase: 'http://172.18.0.159:81/permission',
            // ssourl: 'http://222.66.154.70:2099/ypsys/#/Login',

            gisApi: 'http://106.75.229.99:8181',
            serverip: 'http://106.75.229.99:6080',
            imgurl: 'http://106.75.229.99:8888/' // 云服务器
        },
        localhost: {
            // 本地 - 服务器相对位置
            base: 'http://localhost:8080/wavenet',
            login: 'http://localhost:8080/wavenet'
        },
        active: 'pro' // 强制选择 dev, 默认值为 null
    }
}