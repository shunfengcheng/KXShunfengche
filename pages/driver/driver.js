
const SERVER = require('../../utils/leancloud-storage');
const { User } = require('../../utils/leancloud-storage');
const Team = require('../../model/team');

Page({
    data:{
        array_goAddr:['金唐大厦','七里庄'],
        index_goAddr:0,        
        array_arrAddr:['西局地铁站','菜户营桥北','菜户营桥东','七里庄'],
        index_arrAddr:0,
        array_seatNum:['1','2','3','4'],
        index_seatNum:3,        
        goTime:'17:40',
        telephone:'',
        carNum:'',
        array_carColor:['黑色','白色','灰色','黄色','红色'],
        index_carColor:0,        
        carType:'',
        name:'司机',
        imgUrl:"",
        driverName:"",

        phone_style:'border:',
        phone_placehold:'请输入手机号',
        carnum_style:'border:',
        carnum_placehold:'请输入车牌号后四位',
        gotime_style:'',
        
    },

    
    onLoad:function(e){
        //获取本地缓存中的司机信息
        var driverName = wx.getStorageSync('name')
        var imgurl=wx.getStorageSync('img')//头像
        console.log("----url:" + imgurl)
        if(imgurl){
            this.setData({imgUrl:imgurl})
        }
        var driverTel = wx.getStorageSync('tel')
        var driverCarNum = wx.getStorageSync('carnum')
        var driverCarColor = wx.getStorageSync('carcolor')
        if(!driverCarColor){
            driverCarColor = 0;
            this.data.index_carColor = 0; }
        var driverCarType = wx.getStorageSync('cartype')
        var driverseatNum = wx.getStorageSync('seatnum')
        if(!driverseatNum){
            driverseatNum = 1;
            this.data.index_seatNum = 1;}
        var driverGoTime = wx.getStorageSync('goTime')
        if(!driverGoTime){
            driverGoTime = "17:40";
            this.data.goTime = "17:40";}
        //缓存数据赋值给页面的data
        this.setData({
            name:driverName,
            telephone: driverTel,
            carNum: driverCarNum,
            index_carColor:driverCarColor,
            carType:driverCarType,
            index_seatNum:driverseatNum,
            goTime:driverGoTime
            })        

    },
    //校验手机号
    checkPhone: function(str){
        
        var re = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/; 
        if (re.test(this.data.telephone)) {
           
            this.setData({
                phone_style:"border: 0rpx",
                phone_placehold:"请输入手机号"
            })
            return true;
        } else {
            
            this.setData({
                telephone:"",
                phone_style:"border: 2rpx solid red",
                phone_placehold:"手机号输入错误"
            })
            return false;
        }
       
    },
    //校验车牌号
    checkCarnum:function(){
        if(!this.data.carNum){
            this.setData({
                carnum_style:'border: 2rpx solid red',
                //carnum_placehold:'请输入车牌号后四位',
            })
            return false;
        }else{
            this.setData({
                carnum_style:"border:0rpx ",
                //carnum_placehold:'请输入车牌号后四位',
            })
            return true
        }
    },

    //出发地选择器触发事件start
    bindGoAddrChange:function(e)
    { 
        console.log('index_goAddr改变，携带值为', e.detail.value)
        this.setData({
            index_goAddr: e.detail.value,
        })
    },//出发地选择器触发事件start

    //目的地选择器触发事件start
    bindArrAddrChange:function(e)
    {
        console.log('index_arrAddr改变，携带值为', e.detail.value)
        this.setData({
            index_arrAddr: e.detail.value,
        })
    },//目的地选择器触发事件end

    //座位数选择器触发事件start
    bindSeatNumChange:function(e){
        console.log('carType picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            index_seatNum:e.detail.value
        })
    },//座位数选择器触发事件end
    
    //出发时间选择器触发事件start
    bindGoTimeChange: function (e) {
        console.log('时间改变，携带值为', e.detail.value)
        this.setData({
            goTime: e.detail.value
        })
    },//出发时间选择器触发事件end

    //手机号输入框触发事件start
    bindInputTel:function(e){
        console.log('telephone改变，携带值为', e.detail.value)
        this.setData({
            telephone:e.detail.value,
        })          
    },//手机号输入框触发事件end

    //车牌号输入框触发事件start
    bindInputCarNum:function(e){
        console.log('carNum改变，携带值为', e.detail.value)
        this.setData({
            carNum:e.detail.value,
        })      
    },//车牌号输入框触发事件end

    //车颜色选择器触发事件start
    bindCarColorChange:function(e){
        console.log('index_carColor改变，携带值为', e.detail.value)
        this.setData({
            index_carColor: e.detail.value,
        })
    },//车颜色选择器触发事件end

    //车型输入框触发事件start
    bindInputCarType:function(e)
    {
        console.log('carType改变，携带值为', e.detail.value)
        this.setData({
            carType: e.detail.value,
        })
    },//车类型选择器触发事件end

    //确认载客按钮触发事件
    bindStarGoBtn:function(e)
    {
        wx.showToast({
            title: '正在创建行程',
            icon: 'loading',
            duration: 3000
        });
        //获得当前user
        const user = User.current();
        if(user.get('currentteam')!='')
        {
            //弹出提示框，提示是否取消顺风车服务
            wx.showModal({
                title: '不能新建行程',
                content: '当前有未处理完成的行程',
                showCancel:false,
                success: function (res) {
                    console.log(res);
                    if (res.confirm) {
                        console.log('前往行程页面')
                        //that.driverCancelTeam();
                        wx.redirectTo({
                            url: '../teamstsChanged/teamstsChanged'
                        })      
                    }
                }
            });
        }
        //用户信息
        var name = this.data.name//昵称
        var img=wx.getStorageSync('img')//头像
        var phone = this.data.telephone//手机
        var carnum=this.data.carNum//车牌
        var carcolor=this.data.array_carColor[this.data.index_carColor]//车颜色
        var cartype=this.data.carType//车型
        //行程信息
        var start=this.data.array_goAddr[this.data.index_goAddr]//出发地
        var end=this.data.array_arrAddr[this.data.index_arrAddr]//目的地
        var goTime=this.data.goTime//时间

        //检查必输项；给临时变量赋值，在上传时使用
        var itel = this.data.telephone && this.data.telephone.trim()
        if(!this.checkPhone(itel)){       
            return;}
        var icarnum = this.data.carNum && this.data.carNum.trim()
        if (!this.checkCarnum()) {
            return;}
        //var igotime = this.data.goTime && this.data.goTime.trim()
       

        //重新更新保存一份本地存储文件
        wx.setStorageSync('carcolor',this.data.index_carColor)//车颜色代码
        wx.setStorageSync('cartype',this.data.carType)//车型
        wx.setStorageSync('gotime',this.data.goTime)//发车时间
        wx.setStorageSync('tel',this.data.telephone)//电话
        wx.setStorageSync('carnum',this.data.carNum)//车牌
        wx.setStorageSync('seatnum',this.data.index_seatNum)//座位数
        //建立与服务器的连接控制对象
        console.log('--------start server---------')

        //更新user数据
        user.set('username', name);
        user.set('img', img);
        user.set('phone', phone);
        user.set('carnum', carnum);
        user.set('carcolor', carcolor);
        user.set('cartype', cartype);
        //user.save();
        var id = user.getObjectId() ;

        var acl = new SERVER.ACL();
        acl.setPublicReadAccess(true);
        acl.setPublicWriteAccess(true);

        //acl.setReadAccess(SERVER.User.current(), true);
        //acl.setWriteAccess(SERVER.User.current(), true); 
        
         new Team({
             'teamsts':'N',//行程状态
             'start':start,//起点
             'end':end,//终点终点
             'goTime':goTime,//出发时间
             //rem//备注
             'seatnum':Number(this.data.index_seatNum)+1,
             'driver':{id,name,img,phone,carnum,carcolor,cartype} ,
             'passengers':[]
         }).setACL(acl).save().then((team)=>{
             var app = getApp();
             app.globalData.team = team;
            console.log('team值为', app.globalData.team)  
            user.set('currentTeam', team.getObjectId());
            user.save();
            //页面跳转
            wx.navigateTo({
                url: '../waitdriver/waitdriver',
                success: function(res){
                    // success
                    wx.setStorageSync('driverstatus', '1')
                    setTimeout(function(){
                        wx.showToast({
                            title: '行程创建成功',
                            icon: 'success',
                            duration: 1000
                        })
                    },1000)
                },
                fail: function() {
                    // fail
                },
                complete: function() {
                    // complete
                }
            })

         }).catch(console.error);    
        console.log('--------end server---------')     

        
     
    },


});