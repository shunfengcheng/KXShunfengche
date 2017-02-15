//获取应用实例
var app = getApp();
const SERVER = require('../../utils/leancloud-storage');
const { User } = require('../../utils/leancloud-storage');

Page({
  data: {
    userInfo: {},
  },

  //页面初始化start
  onLoad: function () 
  {
    console.log('driver onLoad')
    var that = this
    //调用应用实例的方法获取全局数据,（微信id，头像url，昵称等）
    app.getUserInfo(function (userInfo)
    {
      that.setData({
        userInfo: userInfo
      })
    })
    if(this.data.userInfo=={})
    {
              wx.showToast({
            title: '登陆失败',
            duration: 3000
        });
      return;
    }
    
    //获取当前leancloud小程序用户
    return SERVER.Promise.resolve(SERVER.User.current())
    //如果能获取用户，检查登陆状态是否有效
    .then(user =>user ? (user.isAuthenticated()
      .then(authed => authed ? user : null)) : null)
    //如果无效，通过微信登陆leancloud
    .then(user => user ? user : SERVER.User.loginWithWeapp())
    .then((user) => {
      //打印uid
      console.log('uid：', user.id);
      //读取当前用户的teamid，没有id无特殊处理；有id：查询team数据赋值给全局team，根据用户角色跳转到乘客/司机等待页面，再由等待页面跳转到信息展示页面；
      var teamid=user.get('currentTeam');
      console.log('teamid:'+teamid );
      if(teamid!='')
      {
        //获取行程对象        
        var team = SERVER.Object.createWithoutData('Team', teamid).fetch().then(function (t) {        
          //为全局team变量赋值
          var app = getApp();
          app.globalData.team = t;
          console.log('teamdid:'+t.get('driver').id );
          console.log('uid:'+user.getObjectId() );
          //判断userid与司机id是否一致，如果一致，显示司机等待页面页面
          if(t.get('driver').id==user.getObjectId())
          {
                wx.navigateTo({url: '../waitdriver/waitdriver'})
          }
          //否则定位到乘客等待页面
          else
          {
                wx.navigateTo({url: '../waitpassager/waitpassager'})
          }
        });
      }
     })
    //处理异常
    .catch(error => console.error(error.message));

  },//页面初始化end

  //开车按钮触发事件start
  bindDriveBtnTap: function () 
  {
        wx.setStorageSync('name', this.data.userInfo.nickName);
        wx.setStorageSync('img', this.data.userInfo.avatarUrl);
   
    //转入行程创建界面
    wx.navigateTo({
      url: '../driver/driver'
    })
  },//开车按钮触发事件end

  //乘客按钮触发事件start
  bindTakeBtnTap:function () 
  {
      wx.setStorageSync('name', this.data.userInfo.nickName);
      wx.setStorageSync('img', this.data.userInfo.avatarUrl);
   
    //页面定向到乘客选择页
    wx.navigateTo({
      url: '../passager/passager'
    })
  },  //乘客按钮触发事件end

 
})
