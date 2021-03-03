function paymentDialog(c) {
    var a = $('<div class="as-pay">'+
        '<div class="pay-box transitionAll05">'+
            '<div class="pb-close">'+
                '<i class="iconfont icon-juxing9"></i>'+
            '</div>'+
            '<div class="pb-title">请输入支付密码</div>'+
            '<div class="pb-int flex flex-center align-center">'+
                '<span class="flex flex-center align-center"></span>'+
                '<span class="flex flex-center align-center"></span>'+
                '<span class="flex flex-center align-center"></span>'+
                '<span class="flex flex-center align-center"></span>'+
                '<span class="flex flex-center align-center"></span>'+
                '<span class="flex flex-center align-center"></span>'+
            '</div>'+
            '<div class="pb-keyboard flex flex-wrap align-center">'+
                '<span class="figure">1</span>'+
                '<span class="figure">2</span>'+
                '<span class="figure">3</span>'+
                '<span class="figure">4</span>'+
                '<span class="figure">5</span>'+
                '<span class="figure">6</span>'+
                '<span class="figure">7</span>'+
                '<span class="figure">8</span>'+
                '<span class="figure">9</span>'+
                '<span class="pb-empty"><i class="iconfont icon-qingkong"></i></span>'+
                '<span class="figure">0</span>'+
                '<span class="pb-del"><i class="iconfont icon-juxing9"></i></span>'+
            '</div>'+
        '</div>'+
        '<div class="modal"></div>'+
    '</div>');
    $("body").append(a);

    var h = this;
    var b = [];
    a.find(".pay-box .pb-keyboard").on("click", ".figure",
    function() {
        var i = $(this);
        var j = a.find(".pay-box .pb-int span");
        if (b.length < 6) {
            b.push(i.html())
        }
        j.each(function(o, n) {
            var m = $(n);
            if (!m.html()) {
                m.html('<div class="point"></div>');
                return false
            }
        });
        if (b.length == 6) {
            var l = {};
            var k = "";
            l.password = b.join("");
            c.call(h, l, k)
        }
    });
    a.find(".pay-box .pb-del").click(function() {
        var k = a.find(".pay-box .pb-int span");
        if (b.length > 0) {
            b.splice(b.length - 1, 1)
        }
        for (var l = b.length; l > -1; l--) {
            var j = k.eq(l);
            if (j.html()) {
                j.html("");
                break
            }
        }
    });
    function e() {
        b = [];
        var i = a.find(".pay-box .pb-int span");
        i.each(function(l, k) {
            var j = $(k);
            j.html("")
        })
    }
    this.empty = function() {
        e()
    };
    a.find(".pay-box .pb-empty").click(function() {
        e()
    });
    function g() {
        a.find(".pay-box").css("bottom", 0);
        a.find(".modal").show();
    }
    this.open = function(i) {
        if (i) {
            a.find(".pb-title").html(i)
        }
        g()
    };
    function d() {
        a.find(".pay-box").css("bottom", "-408px");
        a.find(".modal").hide();
        e();
        a.remove();
    }
    this.close = function() {
        d()
    };
    a.find(".pay-box .pb-close i").click(function() {
        d()
    });
    a.find(".modal").click(function() {
        d()
    })
};
