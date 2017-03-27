//获取应用实例
var app = getApp();
const SERVER = require('../../utils/leancloud-storage');
const { User } = require('../../utils/leancloud-storage');

Page({
  data: {
    userInfo: {},

    lastTapDiffTime1:0,  //记录开车按钮的上一次点击时间
    lastTapDiffTime2:0,  //记录乘车按钮的上一次点击时间
  },

  //体验版设置，应用开放时间在下午3点到到24点之间
  tempControl:function(){
    
    var that = this
    var d = new Date();
    var tempHour = d.getHours();
    if(tempHour >= 0 && tempHour < 15){
        wx.showModal({
          title: '内测版',
          content: '为保证体验，请在15点后使用！',
          showCancel:false,
          success: function(res) {
            if (res.confirm) {
              console.log('用户点击确定')
              that.setData({
                btn_disabled: true
              })
              console.log("---" + that.data.btn_disabled);
            }
          }
        })
        return true;
    }else{
      that.setData({btn_disabled: false})
      return false;
    }
  },  

  //体验版设置，为保证使用，限制人数在在100人以内
  tempUserControl:function(){

      var that = this;

      var query =new SERVER.Query('User');
      
      query.count().then(function (count) {
          console.log("---user count is:" + count);
          if(count <=100){
              that.setData({btn_disabled: false})
              return false;
          }else{
            wx.showModal({
              title: '内测版',
              content: '已达使用人数上限，暂无法体验。\r\n正式版将近期发布,请耐心等待！',
              showCancel:false,
              success: function(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  that.setData({
                    btn_disabled: true
                  })
                  console.log("---" + that.data.btn_disabled);
                }
              }
            })
            return true;
          }

      }, function (error) {
        return true;
      });

  },

  //页面初始化start
  onLoad: function () 
  {
    
    //如果return true,表示达到限制条件，不再往下执行
    // if(this.tempControl()){
    //   return;
    // }
    // if(this.tempUserControl()){
    //   return;
    // }

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
      var team = SERVER.Object.createWithoutData('User', user.id).fetch().then(function (t) {
          var isregistered = t.get('isRegistered');
          console.log('isregistered:' + isregistered);

          //判断是否注册，若未注册则进入注册界面

          // if (isregistered != true) {
          //   console.log('enter regist page');
          //   wx.redirectTo({ url: '../regist/regist' });
          // }

          if (teamid != '') {
            //获取行程对象        
            var team = SERVER.Object.createWithoutData('Team', teamid).fetch().then(function (t) {
              //为全局team变量赋值
              var app = getApp();
              app.globalData.team = t;
              console.log('teamdid:' + t.get('driver').id);
              console.log('uid:' + user.getObjectId());
              //判断userid与司机id是否一致，如果一致，显示司机等待页面页面
              if (t.get('driver').id == user.getObjectId()) {
                console.log('enter waitdriver page');
                wx.navigateTo({ url: '../waitdriver/waitdriver' })
              }
              //否则定位到乘客等待页面
              else {
                console.log('waitpassager regist page');
                wx.navigateTo({ url: '../waitpassager/waitpassager' })
              }
            });
          }
        });
     })
    //处理异常
    .catch(error => console.error(error.message));

  },//页面初始化end

  //开车按钮触发事件start
  bindDriveBtnTap: function (e) 
  {
    var curTime = e.timeStamp;
    var lastTime = this.data.lastTapDiffTime1;

    if(lastTime > 0 && (curTime - lastTime < 300)){
        //两次时间间隔小于300毫秒，认为是双击事件
        console.log("===db tap");
        return;
    }

    this.setData({lastTapDiffTime1:curTime});
    
    wx.setStorageSync('name', this.data.userInfo.nickName);
    wx.setStorageSync('img', this.data.userInfo.avatarUrl);

    //转入行程创建界面
    wx.navigateTo({
      url: '../driver/driver'
    })
   
    
  },//开车按钮触发事件end

  //乘客按钮触发事件start
  bindTakeBtnTap:function (e) 
  {
    var curTime = e.timeStamp;
    var lastTime = this.data.lastTapDiffTime2;

    if(lastTime > 0 && (curTime - lastTime < 300)){
        //两次时间间隔小于300毫秒，认为是双击事件
        console.log("===db tap");
        return;
    }
        
     
    this.setData({lastTapDiffTime2:curTime});

    wx.setStorageSync('name', this.data.userInfo.nickName);
    wx.setStorageSync('img', this.data.userInfo.avatarUrl);
    //页面定向到乘客选择页
    wx.navigateTo({
      url: '../passager/passager'
    })
    
  },  //乘客按钮触发事件end

 
})
