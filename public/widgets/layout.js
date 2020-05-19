define(["jquery", "base"], function($){

    $.widget("ui.layout", $.ui.base, {

        options: {
            title: "4PX-UED"
        },

        renders: {
            main: function (o, w) {
                return ["this.layout",
                    ["render[name=header]"],
                    ["render[name=body]"]
                ];
            },
            header: function (o, w) {
                return ["div.layout-header", [
                    ["nav.navbar.navbar-primary", [
                        ["render[name=navbarHeader]"],
                        ["render[name=navbarCollapse]"]
                    ]]
                ]];
            },
            navbarHeader: function (o, w) {
                return ["navbar-header", [
                    ["div.navbar-brand", [
                        ["a", {href: "javascript:;"}, ["i.glyphicon.glyphicon-home"]],
                        ["span.min"],
                        ["span.max", o.title]
                    ]],
                    ["span.navbar-switch.pull-right", ["i.glyphicon.glyphicon-cog"]],
                    ["span.navbar-toggle.collapsed", {
                        "data-toggle": "collapse",
                        "data-target": "#navbar-header"
                    }, "MENU"],
                    ["span.navbar-switch.pull-left", ["i.glyphicon.glyphicon-chevron-left"]],
                ]];
            },
            navbarCollapse: function (o, w) {
                return ["div#navbar-header.collapse.navbar-collapse", [
                    ["render[name=navbarLeft]"],
                    ["render[name=navbarRight]"]
                ]];
            }
        },

        templates: {

            navbarCollapse: '\
                <div class="collapse navbar-collapse" id="navbar-1">\
                    {{tmpl "navbarLeft"}}\
                    {{tmpl "navbarRight"}}\
                </div>',

            navbarLeft: '\
                <ul class="nav navbar-nav">\
                    {{tmpl "products"}}\
                </ul>',

            products: '\
                <li class="dropdown products">\
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">产品与服务 <span class="caret"></span></a>\
                    <div class="dropdown-menu">\
                        <ul class="nav nav-pills">\
                            {{tmpl(products) "productPill"}}\
                        </ul>\
                        <div class="tab-content"></div>\
                    </div>\
                </li>',

            productPill: '\
                <li><a href="javascript:;" class="product-pill"><i class="${icon}"></i> ${title}</a></li>',

            productPane: '\
                <div class="row">\
                    {{tmpl(products) "productList"}}\
                </div>',

            productList: '\
                <dl class="col-md-2 col-sm-3">\
                    <dt><i class="${icon}"></i> ${title}</dt>\
                    {{each products}}\
                    <dd><a href="${url}"><i class="${icon}"></i> ${title}</a></dd>\
                    {{/each}}\
                </dl>',

            navbarRight: '\
                <ul class="nav navbar-nav navbar-right">\
                    {{tmpl "tasks"}}\
                    {{tmpl(user) "user"}}\
                </ul>',

            tasks: '\
                <li class="dropdown">\
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">\
                        <i class="glyphicon glyphicon-bell"></i>\
                        <span class="label label-success">0</span>\
                    </a>\
                    <ul class="dropdown-menu">\
                        <li><a href="javascript:;">待办任务</a></li>\
                        <li><a href="javascript:;">您还没有待办任务哦~</a></li>\
                        <li role="separator" class="divider"></li>\
                        <li><a href="http://home.test.i4px.com/allTask" target="_blank">查看全部任务</a></li>\
                    </ul>\
                </li>',

            user: '\
                <li class="dropdown">\
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">\
                        <i class="glyphicon glyphicon-user"></i> ${username}(${id}) <span class="caret"></span>\
                    </a>\
                    <div class="dropdown-menu">\
                        <div class="media">\
                            <div class="media-body">\
                                <h4 class="media-heading">个人信息</h4>\
                                <p>姓　名：${username}</p>\
                                <p>手　机：${phone}</p>\
                                <p>邮　箱：${email}</p>\
                                <p>办公地：${address}</p>\
                            </div>\
                            <div class="media-right">\
                                <img class="media-object img-circle" src="/img/user.png" alt="用户头像">\
                            </div>\
                        </div>\
                         <div class="time-zone media">\
                            <div class="zone-body media-body">\
                                <h4 class="zone-heading media-heading">时区信息</h4>\
                                <p>时  区：${timezone}</p>\
                            </div>\
                            <div class="media-right">\
                                <a href="${workbenchUrl}preSetting" class="btn btn-default btn-logout"  target="_blank">修改</a>\
                            </div>\
                         </div>\
                        <p>\
                            <a href="${changePasswordUrl}" class="btn btn-primary">修改密码</a>\
                            <a href="/logout" class="btn btn-default btn-logout">注销</a>\
                        </p>\
                    </div>\
                </li>',

            layoutAside: '\
                {{tmpl "asideMenu"}}',

            asideMenu: '\
                <ul class="menu">\
                    {{tmpl(menu) "menuItem"}}\
                </ul>',

            menuItem: '\
                {{if $data.url}}\
                    {{tmpl "menuLink"}}\
                {{else}}\
                    <li>\
                        <a href="javascript:;" data-toggle="collapse" data-target="#menu-${$index}">\
                            <i class="glyphicon glyphicon-menu-left pull-right"></i>\
                            <i class="${icon}"></i>\
                            <span>${text}</span>\
                        </a>\
                        <ul class="menu collapse" id="menu-${$index}">\
                            {{tmpl(menu) "menuLink"}}\
                        </ul>\
                    </li>\
                {{/if}}',

            menuLink: '\
                <li>\
                    <a href="${url}">\
                        <i class="${icon}"></i>\
                        <span>${text}</span>\
                    </a>\
                </li>',

            layoutArticle: '\
                <div class="layout-title">\
                    <span>登录界面</span>\
                </div>\
                <div class="layout-detail">\
                    <span>欢迎光临登录界面~</span>\
                </div>',

            layoutBar: '\
                {{tmpl "barTab"}}',

            barTab: '\
                <div class="tab-inverse">\
                    <ul class="nav nav-justified nav-tabs">\
                        <li class="active"><a href="#home" data-toggle="tab"><i class="glyphicon glyphicon-globe"></i></a></li>\
                        <li><a href="#profile" data-toggle="tab"><i class="glyphicon glyphicon-comment"></i></a></li>\
                        <li><a href="#settings" data-toggle="tab"><i class="glyphicon glyphicon-camera"></i></a></li>\
                    </ul>\
                    <div class="tab-content">\
                        <div class="tab-pane active" id="home"></div>\
                        <div class="tab-pane" id="profile"></div>\
                        <div class="tab-pane" id="settings"></div>\
                    </div>\
                </div>',

            layoutFooter: '\
                <div class="container text-center">\
                    <p>${footer}</p>\
                </div>'
        },

        options: {

            title: 'C类市场活动管理中心',
            disableBar: true
        },

        _create: function(){

            this._addClass(this.widgetFullName);
        },

        _init: function(){
            this._getData(function(res){
                this._isTimeZoneNull();
                this._setOpts(res);
                this.element.html(this._tmpl('main', this.options));
                this._getElements();
            });
        },

        _setOpts: function(res){
            var opts = this.options;
            var employee = res.headInfo.employee;
            opts.user = {
                id: employee.empCode,
                username: employee.fullName,
                phone: employee.phone,
                email: employee.email,
                address: employee.country + employee.province + employee.city,
                changePasswordUrl: window.G.changePasswordUrl,
                workbenchUrl : window.G.workbenchUrl,
                timezone:this._getCookies('pref-timezone')
            };
            opts.workbenchUrl = window.G.workbenchUrl;
            opts.footer = res.footBarInfo.footBar;
            opts.products = [];
            $.each(res.headInfo.dimensionList, function(i, item){
                opts.products.push({
                    title: item.name,
                    products: (function(){
                        var arr = [];
                        $.each(item.categoryList, function(i, item){
                            arr.push({
                                icon: 'glyphicon glyphicon-plus',
                                title: item.name,
                                products: (function(){
                                    var arr = [];
                                    $.each(item.systemList, function(i, item){
                                        arr.push({
                                            icon: 'glyphicon glyphicon-menu-right',
                                            title: item.name,
                                            url: item.url
                                        });
                                    });
                                    return arr;
                                })()
                            });
                        });
                        return arr;
                    })()
                });
            });

            opts.menu = [];
            $.each(res.sideBarInfo.menus, function(i, item){
                opts.menu.push({
                    icon: 'glyphicon glyphicon-folder-open',
                    text: item.name,
                    menu: (function(){
                        var arr = [];
                        $.each(item.children, function(i, item){
                            arr.push({
                                icon: 'glyphicon glyphicon-file',
                                text: item.name,
                                url: item.url
                            });
                        });
                        return arr;
                    })()
                });
            });
        },

        _getData: function(callback){
            var that = this;
            $.ajax({
                url:  window.G.componentsUrl,
                type: 'POST',
                data: {
                    clientId: window.G.clientId || 'IXG0xerbr2iB8RHD',
                    userId: window.G.userId,
                    isInternational: false
                },
                success: function(res){
                    callback.call(that, res);
                }
            });
        },

        _getElements: function(){
            this.header = this.element.find('.layout-header');
            this.body = this.element.find('.layout-body');
            this.aside = this.body.find('.layout-aside');
            this.article = this.body.find('.layout-article');
            this.bar = this.body.find('.layout-bar');

            this.brand = this.header.find('.navbar-brand');
            this.navbarCollapse = this.header.find('.navbar-collapse');
            this.products = this.header.find('.products');

            this._bindEvents();
        },

        _bindEvents: function(){
            var that = this;

            this._on(this.header, {
                'click .navbar-switch.pull-left': '_clickSwitchleft',
                'click .navbar-switch.pull-right': '_clickSwitchright',
                'click .navbar-toggle.collapsed': '_clickNavbartoggle',
                'click .product-pill': '_clickProduct'
            });

            this._on(this.aside.find('> .menu'), {
                'click .collapse a': '_clickCollapseA',
                'click .navbar-switch.pull-left': '_clickSwitchleft',
                'click .navbar-switch.pull-right': '_clickSwitchright',
                'click .navbar-toggle.collapsed': '_clickNavbartoggle',
                'click .product-pill': '_clickProduct'
            });

            this.header
                .on('show.bs.dropdown', '.products', function(event){
                    var $this = $(this);
                    var left = $this.offset().left;
                    var menu = $this.find('>.dropdown-menu').css({
                        left: -left,
                        width: that.element.width()
                    });


                });
            this.aside
                .on('show.bs.collapse', '.menu', function (event) {
                    var target = $(event.target);

                    if(target.css('position') === 'absolute'){
                        return false;
                    }
                    that.aside.find(target).parent().addClass('open');
                    that.aside.find('.menu.collapse.in').not(event.target).collapse('hide');
                })
                .on('hide.bs.collapse', '.menu', function(event){
                    var target = $(event.target);
                    if(target.css('position') === 'absolute'){
                        return false;
                    }
                    that.aside.find(target).parent().removeClass('open');
                });

            this.products.find('.product-pill').eq(0).click();

            this.window.scroll(function(event){
                var title = that.article.find('.layout-title');
                var $this = $(this), interval;
                if(!title.length){
                    interval = setInterval(function(){
                        title = that.article.find('.layout-title');
                        if(title.length){
                            clearInterval(interval);
                            _setpin();
                        }
                    });
                }else{
                    _setpin();
                }
                function _setpin(){
                    var width = title.width();
                    if($this.scrollTop() > 50){
                        that.article.addClass('pin');
                        title.width(width);
                    }else{
                        that.article.removeClass('pin');
                        title.width('auto');
                    }
                }
            });
        },

        _clickCollapseA: function(event){
            var href = $(event.currentTarget).attr('href');
            window.setGlobal(href, null);
            window.loadPage(href);
            return false;
        },

        _clickSwitchleft: function(){

            this._hideNavbarCollapse();

            if (this.brand.hasClass('min')) {
                this.brand.removeClass('min').closest('.navbar').removeClass('min');
                this.body.removeClass('transform');
                this.aside.addClass('extend');
            } else {
                this.brand.addClass('min').closest('.navbar').addClass('min');
                this.body.addClass('transform');
                this.aside.removeClass('extend');
            }
        },

        _clickSwitchright: function(){
            this._hideNavbarCollapse();
            this.bar.toggleClass('extend');
        },

        _clickNavbartoggle: function(){
            this._hideAside();
            this._hideBar();
        },

        _clickProduct: function(event, item){
            $(event.target)
                .closest('li').addClass('active')
                .siblings('li').removeClass('active');

            this.products
                .find('.tab-content')
                .html(this._tmpl('productPane', item.data));

            return false;
        },

        _hideNavbarCollapse: function(){
            if (this.navbarCollapse.hasClass('in')) {
                this.navbarCollapse.collapse('hide');
            }
        },

        _hideAside: function(){
            if (this.body.hasClass('transform')) {
                this.header.find('.navbar-switch.pull-left').trigger('click');
            }
        },

        _hideBar: function() {
            if (this.bar.hasClass('extend')) {
                this.header.find('.navbar-switch.pull-right').trigger('click');
            }
        },
        _isTimeZoneNull:function () {
            //时区存在，则不设置
            //console.log(this._getCookies('pref-timezone'));
            if(this._getCookies('pref-timezone')!=false || this._getCookies('pref-format')!=''){
                return;
            }
            //时区不存在，默认设置为+8:00      .i4px.com
            this._setDefaultTimeZone('pref-timezone', '%2B08%3A00');
        }
    });
});