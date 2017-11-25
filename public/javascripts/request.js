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
    function myViewModel (){
        var self = this;
        //绑定一个空数组之后异步加载获取
        self.markers = ko.observableArray([]);
        //列表隐藏/显示
        self.isHideMenu = ko.observable(false);
        self.toggleHide = function(){
            self.isHideMenu(!this.isHideMenu());
        }
        //查询按钮方法
        self.search = function (){
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
        //天气属性绑定
        self.weatherPic = ko.observable('');
        self.weatherContent = ko.observable('');
    }
    //定义vm变量,在之后异步加载定位数组时使用
    var vm = new myViewModel();
    ko.applyBindings(vm);
    //直接查询监听
    $('#input_id').on('keydown',function(e){
        if(e.keyCode === 13){
           // search()
        }
    });
    $('#button_id').on('click',function(e){
           // search()
    });

    //异步获取定位地点
    $.getJSON('../data/data.json',function(data){
        var markerList = data.markers;
        for(let i = 0; i < markerList.length; i++){
            vm.markers.push(markerList[i]);
        }
        createMarkers(markerList);
    });
    //创建定位
    function createMarkers(markers){
        var menu_item = $('.menu_item');
        for(let i = 0; i < markers.length; i++){
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
                vm.weatherPic('/images/'+data.now.code+'.png');//图片
                vm.weatherContent(name+':'+temperature+' '+text);
                // $('#weatherpic').attr({'src':src,'title':name+':'+temperature+' '+text});
                // $('#weathercontent').text(name+':'+temperature+' '+text);
            }else{
                vm.weatherPic('/images/99.png');//图片
                vm.weatherContent('你若安好,便是晴天');
                // $('#weatherpic').attr('src','/images/99.png');
            }
        },
        //错误处理
        err:function(){
            $("#weatherpic").attr('src','/images/99.png');
        }
    });
    //----------------------------------------------------------------------------------------
    // //列表隐藏
    // $('.menu_btn').on('click',function(){
    //    $(this).toggleClass('active');
    //    $('.menu_group').toggleClass('hide');
    //    $('#map').toggleClass('cover');
    // })
});