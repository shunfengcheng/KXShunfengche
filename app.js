const SERVER = require('./utils/leancloud-storage');
SERVER.init({
  appId: 'hdTW4EUiVS0R0W3HYzhK5RHB-gzGzoHsz',
  appKey: 'xBNcTJbGb1qYlx1XuXAIoGyf',
});

App({
  onLaunch: function () {   
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function (res) {
          if(res.code) {  
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          });
          }
          else {  
                console.log('获取用户登录态失败！' + res.errMsg)  
          }   
        }
      })
    }
  },
  globalData:{
    userInfo:null,
    team:null
  }
})