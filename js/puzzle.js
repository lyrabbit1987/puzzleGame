/**
 * 拼图游戏(兼容手机端)
 * 需要jquery,和jquery.ui.dragable, jquery.ui.dropable, jquery.touch.punch.js, underscore/lo-dash支持
 *
 * @author zak-wu
 * @qq 123537200
 * @2015-12-16
 */
var PuzzleGame = function(options) {
    var $ = window.$;
    if(!$) return alert('没有zepto或者jquery支持！');

    // 拼图外包装元素
    this.$warp = $(options.warpSelector) || $('body');

    // 预处理数据
    options.pieceH = /em/.test(options.pieceH) ? (parseFloat(options.pieceH) * parseFloat(this.$warp.css('font-size'))) : options.pieceH;
    options.pieceW = /em/.test(options.pieceW) ? (parseFloat(options.pieceW) * parseFloat(this.$warp.css('font-size'))) : options.pieceW;

    $.extend(this, {
        // 行
        row: 3,
        // 列
        low: 4,
        // 每片高度, 支持单位(em, px)
        pieceH: '166px',
        // 每片宽度, 支持单位(em, px)
        pieceW: '191px',
        // 片的边框宽度,单位px
        border: '2px solid #ffffff',
        // 片图片存储位置前缀
        urlPreFix: './img'
    }, options);

    // 是否正在进行重置
    this.isReseting = false;

    this.puzzleInit();
};

PuzzleGame.fn = PuzzleGame.prototype;

/**
 * 是否完成拼图
 */
PuzzleGame.fn.isSuccess = function () {
    var isOk = true;

    // 拼图游戏游戏是否正确
    var divList = this.$warp.find('div');

    for(var i = 0, it; it = divList[i]; i++) {
        if(i !== +$(it).attr('change-index')) {
            isOk = false;
            break;
        }
    }

    return isOk;
};

/**
 * 重新随机
 */
PuzzleGame.fn.reset = function() {
    var _this = this;
    if(_this.isReseting) return console.log('正在刷新');

    _this.isReseting = true;
    // 随机排序
    _this.random();
    _this.bindPuzzleEvt();
};

/**
 * 初始化拼图
 *
 */
PuzzleGame.fn.puzzleInit = function() {
    var simpleTpl = function(data) {
        var tpl = '<div class="piece" o-top="{{top}}" o-left="{{left}}" style="border: {{border}}; width:{{width}}; height:{{height}}; background: {{bgImg}}; top:{{top}}; left:{{left}};" change-index="{{index}}" index="{{index}}" draggable="true"></div>';

        return tpl.replace(/\{\{(\w*)\}\}/gi, function($0, $1) {
            return data[$1];
        });
    };

    var $warp = this.$warp;
    $warp.html('');

    var row = this.row;
    var low = this.low;
    var html = '';
    var temp = '';
    var w = parseFloat(this.pieceW) + parseFloat(this.border);
    var h = parseFloat(this.pieceH) + parseFloat(this.border);

    $warp.css({
        width: w * row,
        height: h * low
    });

    for(var i = 0; i < row * low; i++) {
        temp = simpleTpl({
            index: i,
            top: Math.floor(i / row) * h + 'px',
            left: i % row * w + 'px',
            bgImg: 'url(' + this.urlPreFix + '/' + (i + 1) + '.png)',
            width: parseFloat(this.pieceW) + 'px',
            height: parseFloat(this.pieceH) + 'px',
            border: this.border
        });
        html += temp;
    }

    $warp.append(html);
};

/**
 * 交换两个格子
 *
 * @param {Number} srcIndex 原piece索引
 * @param {Number} distIndex 目标piece索引
 */
PuzzleGame.fn.transPlace = function(srcIndex, distIndex) {
    var $warp = this.$warp;

    // 交换位置
    var dragIndex = +srcIndex + 1;
    var dropIndex = +distIndex + 1;
    var dist = $warp.find('> div:nth-child(' + dragIndex + ')');
    var src = $warp.find('> div:nth-child(' + dropIndex + ')');
    var distCi = dist.attr('change-index');
    var srcCi = src.attr('change-index');
    var dropTop = dist.attr('o-top');
    var dropLeft = dist.attr('o-left');
    var dragTop = src.attr('o-top');
    var dragLeft = src.attr('o-left');

    dist.css({
        top: dragTop,
        left: dragLeft,
        zIndex: 0
    }).attr('o-top', dragTop).attr('o-left', dragLeft).attr('change-index', srcCi);

    src.css({
        top: dropTop,
        left: dropLeft,
        zIndex: 0
    }).attr('o-top', dropTop).attr('o-left', dropLeft).attr('change-index', distCi);
};

/**
 * 随机排布格子
 */
PuzzleGame.fn.random = function() {
    var list = _.shuffle(_.range(this.row * this.low));
    var $warp = this.$warp;
    var _this = this;

    $warp.find('div').css({
        'transition': 'all, .2s',
        '-webkit-transition': 'all, .2s'
    });

    // 两两交换
    _.each(list, function(it, ins) {
        if((ins + 1) % 2 === 1) return;
        _this.transPlace(list[ins - 1], it, $warp);
    });

    // 去掉动画
    setTimeout(function() {
        $warp.find('div').css({
            'transition': 'none',
            '-webkit-transition': 'none'
        });

        _this.isReseting = false;
    }, 1000)
};

/**
 * 绑定事件
 */
PuzzleGame.fn.bindPuzzleEvt = function() {
    var $warp = this.$warp;
    var $dragDiv = '';
    var _this = this;

    $warp.find('> div').draggable({
        containment: 'parent',
        revert: 'invalid',
        start: function() {
            $dragDiv = $(this);
            $(this).css('zIndex', 10);
        }
    });

    $warp.find('> div').droppable({
        accept: '.piece',
        drop: function() {
            _this.transPlace($dragDiv.attr('index'), $(this).attr('index'), $warp);
            if(_this.isSuccess()) alert('恭喜你成功拼图！');
        }
    });
};

/**
 * 游戏开始
 *
 */
PuzzleGame.fn.puzzleStart = function() {
    var _this = this;
    _this.reset();
};