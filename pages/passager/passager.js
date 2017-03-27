const SERVER = require('../../utils/leancloud-storage');
const { User } = require('../../utils/leancloud-storage');
const Team = require('../../model/team');


Page({
    data:{
        telephone:'',
        //editPhone:false,
        teams:[],
        userImg:"",
        userName:"",

        phone_style:'border:',
        phone_placehold:'请输入手机号',
    },

    loadTeams: function () {
        wx.showToast({
            title: '刷新中',
            icon: 'loading',
            duration: 3000
        });
        //查询当前有效的队伍信息
        var that=this;
        var l=[];
        new SERVER.Query(Team)
            .equalTo('teamsts','N')
            .descending('createdAt')
            .find()
            .then(function(t)
            {
                console.log(t.length)

                for (var i=0;i< t.length;i++)
                {
                    // console.log(t[i].get('passengers').length)
                    // console.log( t[i].get('seatnum'))
                    if(t[i].get('passengers').length<t[i].get('seatnum'))
                    {
                        l =l.concat([{
                            id:t[i].get('objectId'),
                            name:t[i].get('driver').name,
                            img:t[i].get('driver').img,
                            start:t[i].get('start'),
                            end:t[i].get('end'),
                            goTime:t[i].get('goTime'),
                            createdAt:t[i].get('createdAt').toLocaleDateString() +" " + t[i].get('createdAt').toLocaleTimeString(),
                            seatNum:t[i].get('seatnum')             

                            }]);
                    }
                }
                that.setData({
                    teams: l   
                })
                
            }).catch(console.error);
        setTimeout(function(){
        wx.showToast({
            title: '刷新成功',
            icon: 'success',
            duration: 2000
        })
        },3000)
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

    onLoad:function(e){
        var passagerTel = wx.getStorageSync('tel');
        var phone = wx.getStorageSync('phone');
        var userimg = wx.getStorageSync('img');
        var username = wx.getStorageSync('name');
        this.setData({
            telephone:phone,
            userImg:userimg,
            userName:username
        })
        this.loadTeams();
    },
    // onPullDownRefresh: function(){
    //     this.refresh();
    // },

    bindInputTel:function(e){
        console.log('driver input tel，携带值为', e.detail.value)
        this.setData({
            telephone:e.detail.value,
        })
        //editPhone = true;
        var tel = wx.getStorageSync('tel')
        wx.setStorageSync('tel',this.data.telephone)
        
    },
    refresh: function (e) {
        wx.showNavigationBarLoading()
        this.loadTeams();
        console.log('下拉刷新')
        setTimeout(function(){wx.hideNavigationBarLoading();wx.stopPullDownRefresh();}, 2000);
  
  },
    bindListBtn:function(e){
        var that = this;
        //校验手机号是否合法
        var itel = this.data.telephone && this.data.telephone.trim()

        if(!this.checkPhone(itel)){
            return;}
        //获取行程对象
        console.log(e.currentTarget.id)
        var team = SERVER.Object.createWithoutData('Team', e.currentTarget.id).fetch().then(function (t) {
            //判断活动状态为N当前队员数目<4
            //是-》插入成员数据，赋值给全局变量记录用户的当前行程id，页面跳转
            if( t.get('teamsts')=='N' && t.get('passengers').length<t.get('seatnum') )
            {
                console.log('ok')
                //获得当前user
                const user = User.current();
                user.set('username', wx.getStorageSync('name'));
                user.set('img', wx.getStorageSync('img'));
                var passenger =[{
                    id:user.getObjectId(),
                    name:user.get('username'),
                    img:user.get('img'),
                    phone:that.data.telephone
                }]
                passenger = passenger.concat(t.get('passengers'))
                console.log(passenger)
                t.set('passengers',passenger)
                t.save();
                user.set('currentTeam',t.id).set('phone',that.data.telephone).save();
                
                wx.setStorageSync('tel',that.data.telephone)
                //console.log(user)
                var app = getApp();
                app.globalData.team = t;
                //页面定向到报名页
                wx.navigateTo({
                    url: '../waitpassager/waitpassager'
                })
            }
            else//否-》报错并刷新
            {
                wx.showModal({
                                title: '活动已失效',
                                content: '已出发或满员或活动取消',
                                showCancel:false,
                                success: function(res) {
                                    that.loadTeams();
                                    return;
                                }
                            })

            }
            console.log(t)
        }, function (error) {
            console.error(error);
        }); 

    },//listbtn响应事件end
})