$(function(){
    //创建地图对象
    var map = new AMap.Map('map', {
        resizeEnable: true,
        dragEnable: true,
        keyboardEnable: true,
        doubleClickZoom: true,
        zoom: 13
    });
    var auto;//定义自动补全插件
    //地图对象插件调用
    map.plugin(['AMap.ToolBar','AMap.Autocomplete'], function() {
        map.addControl(new AMap.ToolBar());
        var autoOptions = {
            city: '', //城市，默认全国
            input:'input_id'//使用联想输入的input的id
        };
        auto= new AMap.Autocomplete(autoOptions);
    });
    //补全插件选择监听
    AMap.event.addListener(auto, 'select', select);
    //补全插件选择方法
    function select(e) {
        AMap.service(['AMap.PlaceSearch'], function() {
            var placeSearch = new AMap.PlaceSearch({ //构造地点查询类
                pageSize: 5,
                pageIndex: 1,
                city: e.poi.adcode, //城市
                map: map,
                panel: 'panel'
            });
            //关键字查询
            placeSearch.search(e.poi.name);
        });
    }
    //直接查询监听
    $('#input_id').on('keydown',function(e){
        if(e.keyCode === 13){
            search()
        }
    });
    $('#button_id').on('click',function(e){
            search()
    });
    function search(){
        AMap.service(['AMap.PlaceSearch'], function() {
            var placeSearch = new AMap.PlaceSearch({ //构造地点查询类
                pageSize: 5,
                pageIndex: 1,
                city: '', //城市，默认全国
                map: map,
                panel: "panel"
            });
            //关键字查询
            placeSearch.search($('#input_id').val());
        });
    }
    //异步获取定位地点
    $.getJSON('../data/data.json',function(data){
        ko.applyBindings({
            markers : data.markers
        });
        createMarkers(data.markers);
    });
    //创建定位
    function createMarkers(markers){
        for(let i = 0; i < markers.length; i++){
            //DOM部分改由ko绑定
            // var menu_item = $("<p class='menu_item'>"+markers[i].name+"<i class='iconfont icon-you fr'></i></p>");
            // $('.menu_group').append(menu_item);
            var menu_item = $('.menu_item');
            //在地图中增加5个坐标的位置
            var marker = new AMap.Marker({
                map: map,
                position: [markers[i].x, markers[i].y]
            });
            AMap.event.addDomListener(menu_item[i], 'click', function() {
                // 设置缩放级别和中心点
                map.setZoomAndCenter(14, [markers[i].x, markers[i].y]);
            });
        }
    }
    //------------------------------------------------------------------------------------------
    //ajax请求天气
    var city = '北京市';//临时天气地址
    $.ajax({
        url:'/weather?city='+city,
        method:'get',
        success:function(data){
            if(data){
                var name = data.location.name;//地点
                var text = data.now.text;//天气
                var temperature = data.now.temperature+'°C';//温度
                var src = '/images/'+data.now.code+'.png';//图片
                $('#weatherpic').attr({'src':src,'title':name+':'+temperature+' '+text});
                $('#weathercontent').text(name+':'+temperature+' '+text);
            }else{
                $('#weatherpic').attr('src','/images/99.png');
            }
        },
        //错误处理
        err:function(){
            $("#weatherpic").attr('src','/images/99.png');
        }
    });
    //----------------------------------------------------------------------------------------
    //列表隐藏
    $('.menu_btn').on('click',function(){
       $(this).toggleClass('active');
       $('.menu_group').toggleClass('hide');
       $('#map').toggleClass('cover');
    })
});