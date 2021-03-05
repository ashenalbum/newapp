var myApp = {
    // baseUrl:"http://sxjy.okdela.top"
    baseUrl:"http://wl03.sx-ug.com"
};
// ajax
myApp.ajax = function(obj){
    // obj: {url, alert, method, token, timeout, data, loading}
    if(api.connectionType == "none"){
        myApp.alert({title:"提示", content:"网络未连接，请检查您的网络！"});
        obj.error && obj.error({errcode:1});
        return false;
    }
    var url = this.baseUrl + obj.url;
    var token = obj.token===false?"":myApp.getToken();
    if(obj.loading!==false){api.showProgress();}

    api.ajax({
        url: url,
        method: obj.method || "get",
        headers: {"X-AppToken": token},
        timeout: obj.timeout || 60,
        data: {values:obj.data||{}},
        dataType: "json",
    },function(ret,err){
        api.hideProgress();
        if(ret){
            if(obj.alert!==false && ret.errcode!=200 && ret.errcode!=0 ){api.toast({msg:ret.msg, global:true});}
            if(ret.errcode==1001){setTimeout(function(){
                myApp.openWin({title:"实名认证", needLogin:true, url:"/html/personal/realname.html"});
            },300)}
            if(ret.errcode==201){setTimeout(function(){
                myApp.openWin({title:"我的钱包", needLogin:true, url:"/html/personal/wallet.html", headColor:"#f6f7f8"});
            },300)}
            obj.success && obj.success(ret);
        }else{
            api.toast({msg: '请求失败,稍后再试'});
            obj.error && obj.error(err);
        }
    });
}
// 获取userdata
myApp.getUserData = function(){return $api.getStorage('userData')}
// 获取token
myApp.getToken = function(){
    var userData = this.getUserData();
    if(!userData){return false}
    return userData.access_token;
}
// 退出登录
myApp.logout = function(callback){
    $api.rmStorage('userData');
    api.sendEvent({name:'logoutok'});
    api.sendEvent({name: 'instantlyTestLogin'});
    api.sendEvent({name: 'messageTestLogin'});
    api.sendEvent({name: 'personalTestLogin'});
    callback && callback();
    api.toast({msg: '已退出登录', global:true});
}
// 判断并登录
myApp.login = function(callback){
    if($api.getStorage("userData")){
        callback && callback();
        return true;
    }else{
        setTimeout(function(){
            myApp.openWin({url:"/html/personal/login.html"});
        },300);
        return false;
    }
}
// 判断是否登录
myApp.isLogin = function(){return Boolean($api.getStorage("userData"))}
// 显示loading
myApp.showLoading = function(title,text,modal){ api.showProgress({title: title || '', text: text || '', modal: modal});};
// 隐藏loading
myApp.hideLoading = function(){api.hideProgress()};
// 判断权限
myApp.hasPermission = function(one_per,callback,error) {
    var rets = api.hasPermission({list: one_per});
	//获取需要判断的权限
	var temp = new Array();
	var status = true;
	for (var obj in rets) {
		var granted = rets[obj].granted;
		var names = rets[obj].name;
		if (granted == false) {
			temp.push(names);
			status = false;
		}
	}
    if(status){if (callback) {callback()};return}
    api.requestPermission({
        list: temp,
        code: 100001
    }, function(ret, err) {
		var list = ret.list;
		for (var i in list) {
			//只有有一项权限不足，就返回
			if (list[i].granted == false) {
                if(error){error()}
                else{api.toast({msg: '权限不足，无法进行下一步操作'})}
				return false;
			}
		}
        if (callback) {callback()}
    });
}
// 打开父窗口
myApp.openWin = function(obj){
    // 參數： obj: {name, url, needLogin, title, pageParam, headColor, headTxtColor, contColor, hideHead, hideBack}
    if(obj.needLogin && !this.login()){api.toast({msg:'请先登录账号', global:true});return}
    if(!obj.url){return}
    var name = obj.name || obj.url.match(/([^/]+\/[^/]+)(.html)$/)[1].replace("/","_");
    api.openWin({
        name: name,
        url: api.wgtRootDir + "/html/common/open_window.html",
        pageParam: obj
    });
}
// 点击banner
myApp.openBanner = function(type, data, param){
    switch(true){
        case type=="url": myApp.openUrl(data); break;
        case type=="page": myApp.openWin(param); break;
        case type=="news": myApp.openWin({title:"教育资讯",url:"/html/information/detail.html",pageParam:{id:data}}); break;
        case type=="school": myApp.openWin({title:"院校", url:'/html/consult/school_main.html', pageParam:{id:data}}); break;
        case type=="consult": myApp.openWin({hideAll:true, url:"/html/consult/expert_detail.html", pageParam:{uid:data}}); break;
        case type=="journal": myApp.openWin({title:"报刊介绍", url: "/html/journal/detail.html", headColor: "#E8DAD5", pageParam:{id:data}}); break;
        case type=="listen": myApp.openWin({title:"旁听", needLogin:true, url:"/html/consult/listen.html", pageParam:{id:data}}); break;
    }
}
// 打开web页
myApp.openUrl = function(url){
    if(!url){return}
    var browser = api.require('webBrowser');
    browser.open({url: url});
}
// 输入支付密码
myApp.inputPayPwd = function(callback,title){
    if(!this.login()){return}
    if(!this.getUserData().uinfo.paypwd){
        myApp.alert({
            content: "首次支付将设置支付密码",
            callback(){
                myApp.setPayPwd();
            }
        });
        return;
    }
    myApp.inputPwd({title:title||"请输入支付密码"}, function(pwdval){
        callback && callback(pwdval);
    });
}
// 设置支付密码
myApp.setPayPwd = function(callback){
    if(!this.login()){return}
    var pwd = "";
    var qrpwd = "";
    myApp.inputPwd({title:"请设置支付密码"}, function(pwdval){
        pwd = pwdval;
        setTimeout(function(){
            myApp.inputPwd({title:"请再次确认密码"}, function(qrpwdval){
                qrpwd = qrpwdval;
                if(pwd!=qrpwd){api.toast({msg:"设置失败，两次密码不一致", duration:2600});return}
                myApp.setPayPwdRequest(pwd, callback);
            });
        },50);
    });
}
// 设置密码
myApp.setPayPwdRequest = function(pwd, callback){
    myApp.ajax({
        url: "/api/home/Common/setpaypwd",
        method: "get",
        data: {password: pwd},
        success(data){
            if(data.errcode!=0 && data.errcode!=200){return}
            api.toast({msg:"设置成功，请牢记密码！", global:true});

            var userData = myApp.getUserData();
            userData.uinfo.paypwd = true;
            $api.rmStorage('userData');
            $api.setStorage('userData', userData);

            callback && callback();
        },
        error(){api.toast({msg:"error"})}
    });
}
// 上传图片
myApp.upImg = function(obj,callback,error){
    // obj: { clip:true, clipW:200/100%, clipH:200/50% }
    // callback( url )
    if(!this.login()){return}
    api.actionSheet({
        cancelTitle: '取消',
        buttons: ['从相册选择','拍照']
    }, function(ret, err) {
        var index = ret.buttonIndex;
        if(index!=1 && index!=2){return}
        var type = "album";
        switch(true){
            case index==1: type="albmu"; break;
            case index==2: type="camera"; break;
        }
        selPhoto(type);
    });
    // 选择图片
    function selPhoto(type){
        var imgUrl = '';
        api.getPicture({
            sourceType: type || 'album',
            encodingType: 'jpg',
            mediaValue: 'pic',
            destinationType: 'url',
            saveToPhotoAlbum: true
        }, function(ret, err) {
            if(ret){
                if(!ret.data){return}
                imgUrl = ret.data;
                if(!obj || !obj.clip){
                    upFile(imgUrl);
                }else{
                    clip(imgUrl);
                }
            }else{
                error && error();
                api.toast({msg:err.msg});
            }
        });
    }
    // 裁剪
    function clip(imgUrl){
        api.addEventListener({name:'clipOver'}, function(ret, err){
            if(!ret){api.toast({msg:"error"}); return}
            upFile(ret.value.imgUrl);
        });
        myApp.openWin({
            title: "裁剪图片",
            url: "/html/common/clip_img.html",
            pageParam: {imgUrl:imgUrl, clip:obj}
        });
    }
    // 上传
    function upFile(imgUrl){
        var udata = myApp.getUserData();
        var url = udata.uinfo.uid+"/";
        var imgName = Date.now()+imgUrl.match(/^.*\/([^\/]+)$/)[1];
        myApp.showLoading("上传中","请稍候...");
        var oss = api.require('aliCloudOss');
        oss.init();
        oss.putObject({
            bucket: "sxjyapps",
            objectKey: 'sxjy/' + url + imgName,
            filePath: imgUrl
        }, function(ret, err){
            if( ret ){
                if(ret.eventType == "onComplete"){
                    myApp.hideLoading();
                    var imgsrc = 'https://sxjyapps.oss-cn-beijing.aliyuncs.com/'+'sxjy/'+ url + imgName;
                    callback && callback(imgsrc);
                }else if(ret.eventType == "onProgress"){
                    myApp.showLoading(parseInt(ret.currentSize/ret.totalSize*100)+"%");
                }else if(ret.eventType == "onError"){
                    myApp.hideLoading();
                    api.toast({msg:"error"});
                }
            }else if (err) {
                myApp.hideLoading();
                api.toast({msg:err.msg});
                error && error();
            }
        });
    }
}
// 显示图片
myApp.showImg = function(src){
    var mask = $('<div class="mask df df-c ai-c just-c-ct" style="z-index:9999;">'+
        '<div class="bg"></div>'+
        '<img class="show-img" />'+
        '<div class="download mt-10 c-ff fs-14 txt-c">保存图片</div>'+
    '</div>');
    mask.find(".show-img").attr("src",src).get(0).onload = function(){
        setTimeout(function(){
            mask.find(".show-img").addClass("loadover")
        },10);
    };
    mask.click(function(e){
        if($(e.target).hasClass('download')){
            myApp.confirm({
                title: "提示",
                content: "要下载该图片吗",
                callback(btnIndex){
                    if(btnIndex!=1){return}
                    myApp.downImg(src);
                }
            });
            return
        }
        mask.remove();
    });
    $(document.body).append(mask);
}
// 下载图片
myApp.downImg = function(src){
    myApp.showLoading("下载中","请稍候...");
    api.saveMediaToAlbum({path:src}, function(ret, err){
        myApp.hideLoading();
        api.toast({msg:(ret && ret.status && "已保存到相册")||"下载失败"});
    });
}
// 替换字符串
myApp.htmlEscape = function(text){
    if(!text){return ""}
    return text.replace(/[<>"&]/g, function(match, pos, originalText){
        switch(match){
            case "<": return "&lt;";
            case ">":return "&gt;";
            case "&":return "&amp;";
            case "\"":return "&quot;";
        }
    });
}
// alert
myApp.alert = function(obj){
    // 参数： {title, content(必填), ok, callback}
    if(!obj){return}
    if(!myApp.dialogBox){myApp.dialogBox = api.require('dialogBox')}
    myApp.dialogBox.alert({
        texts: {
            title: obj.title || '',
            content: obj.content || '',
            rightBtnTitle: obj.ok || '确认'
        },
        styles: {
            bg: '#fff',
            w: 320,
            corner:16,
            title: obj.title && {marginT:12, titleSize:16, titleColor:'#333333'},
            content: {marginT:22, marginB:20, color:'#646566', size:14},
            right: {marginB:0, marginL:0, w:320, h:48, bg:'#ffffff', color:'#FF3942', size:16, corner:16},
            horizontalLine:{color:'#ebedf0', height:1}
        }
    }, function(ret) {
        myApp.dialogBox.close({dialogName: 'alert'});
        obj.callback && obj.callback();
    });
}
// confirm
myApp.confirm = function(obj){
    // 参数： {title, content(必填), cancel, ok, callback:(btnIndex)}
    if(!obj){return}
    if(!myApp.dialogBox){myApp.dialogBox = api.require('dialogBox')}
    myApp.dialogBox.alert({
        texts: {
            title: obj.title || '',
            content: obj.content || '',
            leftBtnTitle: obj.cancel || '取消',
            rightBtnTitle: obj.ok || '确认'
        },
        styles: {
            bg: '#fff',
            w: 320,
            corner:16,
            title: obj.title && {marginT:12, titleSize:16, titleColor:'#333333'},
            content: {marginT:22, marginB:20, color:'#646566', size:14},
            left: {marginB:0, marginL:0, w:160, h:48, bg:'#ffffff', color:'#333333', size:16, corner:16},
            right: {marginB:0, marginL:0, w:160, h:48, bg:'#ffffff', color:'#FF3942', size:16, corner:16},
            horizontalLine:{color:'#ebedf0', height:1},
            verticalLine:{color:'#ebedf0', width:1}
        }
    }, function(ret) {
        myApp.dialogBox.close({dialogName: 'alert'});
        obj.callback && obj.callback((ret&&ret.eventType!='left')?1:0);
    });
}
// 密码输入
myApp.inputPwd = function(obj, callback){
    // obj: {title:"请输入密码"}
    var myinputpwdbox = $("#myinputpwdbox");
    var pwd = [];
    if(!myinputpwdbox.length){
        myinputpwdbox = $('<div id="myinputpwdbox" class="mask hide">'+
            '<div class="bg"></div>'+
            '<div class="paypwdbox">'+
                '<div class="title fs-18 txt-c">'+
                    '<span class="txt">请输入支付密码</span>'+
                    '<div class="cls">&times;</div>'+
                '</div>'+
                '<div class="pwdbox">'+
                    '<div class="iptbox df">'+
                        '<div class="num fc"></div>'+
                        '<div class="num fc"></div>'+
                        '<div class="num fc"></div>'+
                        '<div class="num fc"></div>'+
                        '<div class="num fc"></div>'+
                        '<div class="num fc"></div>'+
                    '</div>'+
                '</div>'+
                '<div class="keybord">'+
                    '<div class="row df">'+
                        '<div class="key keynum fc df ai-c just-c-ct" data-id="1" tapmode="touch-style">1</div>'+
                        '<div class="key keynum fc df ai-c just-c-ct" data-id="2" tapmode="touch-style">2</div>'+
                        '<div class="key keynum fc df ai-c just-c-ct" data-id="3" tapmode="touch-style">3</div>'+
                    '</div>'+
                    '<div class="row df">'+
                        '<div class="key keynum fc df ai-c just-c-ct" data-id="4" tapmode="touch-style">4</div>'+
                        '<div class="key keynum fc df ai-c just-c-ct" data-id="5" tapmode="touch-style">5</div>'+
                        '<div class="key keynum fc df ai-c just-c-ct" data-id="6" tapmode="touch-style">6</div>'+
                    '</div>'+
                    '<div class="row df">'+
                        '<div class="key keynum fc df ai-c just-c-ct" data-id="7" tapmode="touch-style">7</div>'+
                        '<div class="key keynum fc df ai-c just-c-ct" data-id="8" tapmode="touch-style">8</div>'+
                        '<div class="key keynum fc df ai-c just-c-ct" data-id="9" tapmode="touch-style">9</div>'+
                    '</div>'+
                    '<div class="row df">'+
                        '<div class="key space fc df ai-c just-c-ct"></div>'+
                        '<div class="key keynum fc df ai-c just-c-ct" data-id="0" tapmode="touch-style">0</div>'+
                        '<div class="key back space fc df ai-c just-c-ct c-66">←</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>');
        $(document.body).append(myinputpwdbox);
        api.parseTapmode();

        myinputpwdbox.children(".bg").on("click",function(){
            myinputpwdbox.addClass("hide").find(".num").removeClass("active");
            myinputpwdbox.find(".title .txt").html("请输入密码");
            pwd = [];
        });
        myinputpwdbox.find(".title .cls").on("click",function(){
            myinputpwdbox.addClass("hide").find(".num").removeClass("active");
            myinputpwdbox.find(".title .txt").html("请输入密码");
            pwd = [];
        });
        myinputpwdbox.find(".back").on("click",function(){
            if(!pwd.length){return}
            pwd.splice(pwd.length-1,1);
            myinputpwdbox.find(".iptbox .num").eq(pwd.length).removeClass("active");
        });
    }
    myinputpwdbox.find(".keynum").unbind().on("click",function(){
        if(pwd.length>=6){
            console.log("length")
            return
        }
        var num = Number($(this).data('id'));
        pwd.push(num);
        myinputpwdbox.find(".iptbox .num").eq(pwd.length-1).addClass("active");
        if(pwd.length==6){
            var pwdstr = Number(pwd.join(""));
            myinputpwdbox.addClass("hide").find(".num").removeClass("active");
            myinputpwdbox.find(".title .txt").html("请输入密码");
            pwd = [];
            callback(pwdstr);
        }
    });
    myinputpwdbox.find(".title .txt").html(obj.title || "请输入密码");
    myinputpwdbox.removeClass("hide");
}
