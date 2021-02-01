var RY = {};
RY.uinfo = {userId:null};
RY.requestPermission = function(){
    myApp.hasPermission(['camera','microphone','storage'],false,function(){
        api.toast({msg: '缺少权限会影响正常通话功能'});
        setTimeout(RY.requestPermission, 2000);
    });
}
RY.init = function(init) {
    RY.requestPermission();
    //创建对象
    var rong = RY.rong = api.require('rongCloud2');
    rong.setEnableBeauty({enableBeauty:true});
    if(init){
        rong.init(function(ret, err) {
            if(ret){
                RY.setConnectionStatusListener();
            }else{
                api.toast({msg:'通话模块初始化失败'});
            }
        });
    }else{
        RY.setConnectionStatusListener();
    }
    return rong;
};
RY.login = function(callback){
    var udata = myApp.getUserData();
    var token = udata && udata.uinfo && udata.uinfo.rytoken;
    if(!token){api.toast({msg:"通话模块登录失败",global:true});return;}
    RY.rong.connect({ token: token }, function(ret, err) {
        if (ret.status == 'success') {
            RY.uinfo.userId = ret.result.userId;
            callback && callback();
        }else{
            if(err && err.code==31006){return}
            // api.toast({msg:'融云连接异常，将在10秒后为您尝试连接！'});
            RY.logout();
            setTimeout(function(){RY.login()},10000);
        }
    });
}
//退出 IM 服务器
RY.logout = function(){
    RY.rong.disconnect();
}

RY.setConnectionStatusListener = function(){
    RY.rong.setOnReceiveMessageListener(function(ret, err) {
        if(ret && ret.message && ret.message.content && ret.message.content.extra){
            $api.setStorage('callExtra', ret.message.content.extra);
        }
    });
    RY.rong.addCallReceiveListener({target:'didReceiveCall'},function(ret,err){
        api.sendEvent({ name :'rongaccept', extra : ret.callSession });
    });
    RY.rong.addCallSessionListener({target:'didConnect'},function(ret,err){
        api.sendEvent({ name :'rongacceptok', extra : ret.callSession });
    });
    RY.rong.addCallSessionListener({target:'didDisconnect'},function(ret,err){
        api.sendEvent({ name :'ronghangup', extra : ret.callSession });
    });
    RY.rong.addCallSessionListener({target:'remoteUserDidLeft'},function(ret,err){
        RY.rong.hangup();
        api.sendEvent({ name :'rongoutroom', extra : ret });
    });
    RY.rong.addCallSessionListener({target: 'remoteUserDidJoin'}, function(ret) {
        api.sendEvent({ name :'rongvideo', extra : ret });
    });
}
RY.startCall = function(id,type,yyid){
    RY.rong.startCall({
        targetId: 'didReceiveCall',
        conversationType: "PRIVATE",
        mediaType: type || "video",
        userIdList: [id],
        extra: yyid
    });
}
