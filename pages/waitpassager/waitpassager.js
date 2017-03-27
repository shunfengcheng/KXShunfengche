const SERVER = require('../../utils/leancloud-storage');
const Team = require('../../model/team');
const { User } = require('../../utils/leancloud-storage');
var app = getApp();



Page({
    data:{
        team:null,
        },
    loadTeamInfo: function () {
        wx.showToast({
            title: '刷新中',
            icon: 'loading',
            duration: 3000
        });

        //根据全局变量中的teamid查询当前队伍，然后同步本页面和全局变量中的team对象
        var that = this;

        new SERVER.Query(Team)
        .equalTo('objectId',this.data.team.id)
        .descending('createdAt')
        .find()
        .then((t)=>
        {
            console.log('load'+t)
            that.setData({
                team: t[0]   }),
            app.globalData.team = t[0];
            var teamsts = t[0].get('teamsts');
            if(teamsts!='N')
            {
                wx.redirectTo({url:'../teamstsChanged/teamstsChanged'})
            }
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
        //页面定向到信息展示页面
        if(app.globalData.team.teamsts !='N')
        {
            wx.redirectTo({url:'../teamstsChanged/teamstsChanged'})
        }       
        this.setData({ team: app.globalData.team})    
    },
    //左上角返回按钮触发事件，等同于点击‘取消’按钮
    onUnload:function(){
        this.passengerCancelTeam();
        wx.showToast({
            title: '退出活动',
            icon: 'success',
            duration: 2000
        })
    },
    passengerCancelTeam:function(){
        //当前队伍置空，team对象passengers更新，同步全局team变量
        new SERVER.Query(Team)
        .equalTo('objectId',this.data.team.id)
        .find()
        .then((t)=>
        {
            var passengers = t[0].get('passengers');
            var temp_p=[];
            const user =User.current();
            var userid = user.getObjectId();
            //console.log("name:"+name);
            for(var i =0;i<passengers.length;i++)
            {
                if (passengers[i].id != userid)
                {
                    temp_p=temp_p.concat(passengers[i]);
                }
            };
            console.log(temp_p);
            t[0].set('passengers',temp_p).save();
            user.set('currentTeam','').save();
            app.globalData.team=null;
        }).catch(console.error);
    },

    //给队长拨打电话
    bindCallDriver:function(e){
        var iphone = e.currentTarget.dataset.num;
        console.log("----phone :" + iphone);

        if(iphone != null){
            wx.makePhoneCall({
                phoneNumber: iphone
            })
        }
    },
    //给成员拨打电话
    bindCallPassager:function(e){
        
        var iphone = e.currentTarget.dataset.num;
        console.log("----phone :" + iphone);

        if(iphone != null){
            wx.makePhoneCall({
                phoneNumber: iphone
            })
        }
    },

    //刷新按钮事件
    bindDriverRefreshBtn:function(e){
        wx.showNavigationBarLoading()
        console.log('触发了队员刷新按钮')
        this.loadTeamInfo();
        setTimeout(function(){wx.hideNavigationBarLoading();wx.stopPullDownRefresh();}, 2000);
    },   
    
    onPullDownRefresh: function(){
        this.bindDriverRefreshBtn();
    },

        //取消按钮事件
    bindDriverCancelBtn:function(e){
        console.log('触发了队员取消按钮')
        var that = this;

        //弹出提示框，提示是否取消
        wx.showModal({
            title: '确认取消',
            content: '请确认是否离开当前活动',
            confirmText: "确认",
            cancelText: "取消",
            success: function (res) {
                console.log(res);
                if (res.confirm) {
                    console.log('用户点击了确认取消')
                    that.passengerCancelTeam();                 
                    wx.navigateBack();
                }else{
                    console.log('用户点击取消，继续等待')
                }
            }
        })
    }        
});