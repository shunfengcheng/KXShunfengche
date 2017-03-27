const SERVER = require('../../utils/leancloud-storage');
const Team = require('../../model/team');
const { User } = require('../../utils/leancloud-storage');

var app = getApp();

Page({
    data:{
        team:null,

        waitsts:0
        },
    //根据全局变量中的teamid查询当前队伍，然后同步本页面和全局变量中的team对象    
    loadTeamInfo: function () {
        
        wx.showToast({
            title: '刷新中',
            icon: 'loading',
            duration: 3000
        });
        var that = this;

        new SERVER.Query(Team)
        .equalTo('objectId',this.data.team.id)
        .descending('createdAt')
        .find()
        .then((t)=>
        {
            console.log('load',t)
            that.setData({
                team: t[0]   }),
            app.globalData.team = t[0];
            // if(app.globalData.team.teamsts !='N')
            // {
            //     wx.redirectTo({url:'../teamstsChanged/teamstsChanged?role=1'})
            // }
            setTimeout(function(){
                wx.showToast({
                    title: '刷新成功',
                    icon: 'success',
                    duration: 2000
                })
            },3000)
        }).catch(console.error);

        
    },
    onLoad:function(e){
        if(app.globalData.team.teamsts !='N')
        {
            wx.redirectTo({url:'../teamstsChanged/teamstsChanged?role=1'})
        }
        this.setData({
        team: app.globalData.team,
        waitsts:0
      })
    },
    driverCancelTeam:function(){
        //teamsts置C
        new SERVER.Query(Team)
        .equalTo('objectId',this.data.team.objectId)
        .find()
        .then((t)=>
        {
            t[0].set('teamsts','C').save();
            app.globalData.team=t[0]
            console.log('sts-c'+app.globalData.team)                    
        }).catch(console.error);
    },
    //左上角返回按钮触发事件，等同于点击‘取消’按钮
    onUnload:function(){
        console.log('------- waitDriver page onUnload event----', )
        if(this.data.team.get('teamsts')!='Y')
        {
            this.driverCancelTeam();
            wx.showToast({
                        title: '已取消',
                        duration: 1000
                    })
        }
        // var that = this;
        // if(that.data.waitsts == 0){
        //     console.log('-----team id:' + that.data.team.objectId)
        //     //teamsts置C
        //     new SERVER.Query(Team)
        //     .equalTo('objectId',that.data.team.objectId)
        //     .descending('createdAt')
        //     .find()
        //     .then((t)=>
        //     {
        //         t[0].set('teamsts','C').save();
        //         that.data.team =null,
        //         app.globalData.team=null

        //         //弹出提示框，提示已取消
        //         wx.showToast({
        //             title: '已取消活动，请重新选择',
        //             icon: 'loading',
        //             duration: 1000
        //         })
        //     }).catch(console.error);
        //     }

    },
    
    //刷新按钮事件
    bindDriverRefreshBtn:function(e){

        wx.showNavigationBarLoading()
        console.log('触发了刷新按钮')
        this.loadTeamInfo();
        setTimeout(function(){wx.hideNavigationBarLoading();wx.stopPullDownRefresh();}, 2000);
   
    },    
    //下拉刷新
    onPullDownRefresh: function(){
        this.bindDriverRefreshBtn();
    },

    //给司机拨打电话
    bindCallDriver:function(e){
        var iphone = e.currentTarget.dataset.num;
        console.log("----phone :" + iphone);

        if(iphone != null){
            wx.makePhoneCall({
                phoneNumber: iphone
            })
        }
    },
    //给乘客拨打电话
    bindCallPassager:function(e){
        
        var iphone = e.currentTarget.dataset.num;
        console.log("----phone :" + iphone);

        if(iphone != null){
            wx.makePhoneCall({
                phoneNumber: iphone
            })
        }
    },
    //发车按钮事件
    bindDriverGoBtn:function(e){
        console.log('触发了出发按钮')

        var that =this;


        that.data.waitsts = 1


        //弹出提示框，提示是否取消组队
        wx.showModal({
            title: '确认出发',
            content: '感谢您提供组队服务，请确认是否出发',
            confirmText: "是",
            cancelText: "否",
            success: function (res) {
                console.log(res);
                if (res.confirm) {//用户点击确定-start
                    console.log('用户点击了确认出发')
                    //teamsts置Y 
                    new SERVER.Query(Team)

                    .equalTo('objectId',that.data.team.objectId)

                    .descending('createdAt')
                    .find()
                    .then((t)=>
                    {
                        if(t[0].get('passengers').length<1)
                        {
                            wx.showModal({
                                title: '无法出发',
                                content: '没有队员',
                                showCancel:false
                            })
                            return;
                        }
                        t[0].set('teamsts','Y').save();
                        that.data.team =t[0],
                        app.globalData.team=t[0]
                        console.log('sts-Y'+app.globalData.team)
                        //页面定向到信息展示页面
                        wx.redirectTo({
                            url: '../teamstsChanged/teamstsChanged?role=1'
                        })
                    }).catch(console.error);

                    

                }//用户点击确定-end
                else{
                    console.log('用户点击取消，继续等待队员')
                }
            }
        });
    },

    //取消按钮事件
    bindDriverCancelBtn:function(e){
        console.log('触发了取消按钮')

        var that = this;

        that.data.waitsts = 2

        //弹出提示框，提示是否取消
        wx.showModal({
            title: '确认取消',
            content: '请确认是否取消队伍',
            confirmText: "是",
            cancelText: "否",
            success: function (res) {
                console.log(res);
                if (res.confirm) {
                    console.log('用户点击了确认取消')
                    that.driverCancelTeam();
                    wx.redirectTo({
                        url: '../teamstsChanged/teamstsChanged?role=1'
                    })      
                }else{
                    console.log('用户点击取消，继续等待队员')
                }
            }
        });

    }

});