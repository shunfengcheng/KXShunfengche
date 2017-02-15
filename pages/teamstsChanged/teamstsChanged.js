const SERVER = require('../../utils/leancloud-storage');
const Team = require('../../model/team');
const { User } = require('../../utils/leancloud-storage');

var app = getApp();

Page({
    data:{
        team:null,
        role:'passenger',
        act:'选择',
        sts:'出发'
    },
    onLoad:function(e){        
      if(e.role==1)
      this.setData({role: 'driver',
                    act:'发起',});
      this.setData({team: app.globalData.team})    
      //console.log(app.globalData.team);
      //console.log('thisteam'+this.data.team);      
      if(this.data.team.teamsts =='C')
      {
          this.setData({sts: '取消'})    
      }
    },
    //左上角返回按钮触发事件，等同于点击按钮
    onUnload:function(){
        this.bindOKBtn();
    },

    //按钮事件
    bindOKBtn:function(e){
        User.current().set('currentTeam','').save();
        wx.navigateBack(); 
    },
})