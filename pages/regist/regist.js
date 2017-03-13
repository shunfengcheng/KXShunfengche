//获取应用实例
var app = getApp();
const SERVER = require('../../utils/leancloud-storage');
const { User } = require('../../utils/leancloud-storage');
var timer;
var inputinfo = "";
Page({

    data: {
        showView: false,

        animationData: "",
        showModalStatus: false,
        warnmessage: '',

        username: "",
        phone: "",
        gender: "",
        havecar: false,

        items: [
            { name: '1', value: '男', checked: 'true' },
            { name: '0', value: '女' },
        ],
        cars: [
            { name: '0', value: '无车', checked: 'true' },
            { name: '1', value: '有车' },
        ],
        username_placehold: "真实姓名",
        username_style: 'border:',

        phone_placehold: '手机号',
        phone_style: 'border:',

        array: ['请选择部门', '应用开发一部', '应用开发二部', '应用开发三部', '应用开发四部', '应用开发五部', '应用开发六部'],
        index: 0,

        carType: '',
        carNum: '',
        array_carColor: ['黑色', '白色', '灰色', '黄色', '红色'],
        index_carColor: 0,
        carnum_style: 'border:',
        carnum_placehold: '请输入车牌号后四位',

    },

    onLoad: function (e) {

        //从缓存获取数据
        var username = wx.getStorageSync('username');
        var phone = wx.getStorageSync('phone');
        var driverCarNum = wx.getStorageSync('carnum');
        var driverCarColor = wx.getStorageSync('carcolor');
        if (!driverCarColor) {
            driverCarColor = 0;
            this.data.index_carColor = 0;
        }
        var driverCarType = wx.getStorageSync('cartype');

        //初始化
        this.setData({
            username: username,
            phone: phone,
            carNum: driverCarNum,
            index_carColor: driverCarColor,
            carType: driverCarType
        });

        //初始化性别
        var gender = wx.getStorageSync('gender');
        if (gender == "1") {
            this.setData({
                items: [
                    { name: '1', value: '男', checked: 'true' },
                    { name: '0', value: '女' },
                ]
            });
        } else if (gender == '0') {
            this.setData({
                items: [
                    { name: '1', value: '男' },
                    { name: '0', value: '女', checked: 'true' },
                ]
            });
        }

    },
    //自定义toast
    showModal: function () {
        // 显示遮罩层
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        })
        this.animation = animation
        animation.translateY(200).step()
        this.setData({
            animationData: animation.export(),
            showModalStatus: true
        })
        setTimeout(function () {
            animation.translateY(0).step()
            this.setData({
                animationData: animation.export()
            })
        }.bind(this), 200)
        console.log("准备执行");
        timer = setTimeout(function () {
            if (this.data.showModalStatus) {
                this.hideModal();
                console.log("是否执行");
            }
        }.bind(this), 3000)
    },
    hideModal: function () {
        if (timer != null) {
            clearTimeout(timer);
            timer = null;
        }
        // 隐藏遮罩层
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        })
        this.animation = animation
        animation.translateY(200).step()
        this.setData({
            animationData: animation.export(),
        })
        setTimeout(function () {
            animation.translateY(0).step()
            this.setData({
                animationData: animation.export(),
                showModalStatus: false
            })
        }.bind(this), 200)
    },

    //用户名输入框触发事件
    bindInputUname: function (e) {
        console.log('username改变，携带值为', e.detail.value)
        this.setData({
            username: e.detail.value,
        })
    },

    //手机号输入框触发事件
    bindInputTel: function (e) {
        console.log('phone改变，携带值为', e.detail.value)
        this.setData({
            phone: e.detail.value,
        })
    },

    //校验姓名
    checkUsername: function (str) {

        var username = this.data.username;
        if (username != '') {
            this.setData({
                username_style: "1px solid #d3d3d3",
                username_placehold: "真实姓名"
            })
            return true;
        } else {
            this.setData({
                username: "",
                username_style: "border: 2rpx solid red",
                username_placehold: "请输入真实姓名"
            })
            return false;
        }

    },

    //校验部室
    checkDepartment: function (index) {
        if (index == 0) {
            if (this.data.showModalStatus) {
                this.hideModal();
            } else {
                this.setData({
                    warnmessage: '请选择部门'
                })
                this.showModal();
            }
            return false;
        } else {
            return true;
        }
    },

    //校验信息真实性
    checkAllInfo: function (e) {
        if (this.data.showModalStatus) {
            this.hideModal();
        } else {
            this.setData({
                warnmessage: '请检查姓名、手机、部门的真实性'
            })
            this.showModal();
        }

    },

    //校验手机号
    checkPhone: function (str) {

        var re = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
        if (re.test(this.data.phone)) {

            this.setData({
                phone_style: "1px solid #d3d3d3",
                phone_placehold: "请输入手机号"
            })
            return true;
        } else {

            this.setData({
                phone: "",
                phone_style: "border: 2rpx solid red",
                phone_placehold: "手机号输入错误"
            })
            return false;
        }

    },

    //校验车牌号
    checkCarnum: function () {
        var carNum = this.data.carNum;
        if (carNum == '' || carNum.length != 4) {
            this.setData({
                carnum_style: 'border: 2rpx solid red',
                //carnum_placehold:'请输入车牌号后四位',
            })
            return false;
        } else {
            this.setData({
                carnum_style: "border:0rpx ",
                //carnum_placehold:'请输入车牌号后四位',
            })
            return true
        }
    },

    // 监听性别radio事件
    radioChange: function (e) {
        console.log('radio发生change事件，携带value值为：', e.detail.value);
        this.setData({
            gender: e.detail.value
        })
    },

    // 监听是否有车radio事件
    onChangeShowState: function (e) {
        console.log('radio发生change事件，携带value值为：', e.detail.value);
        var that = this;
        var havecar = e.detail.value == '0' ? false : true;
        that.setData({
            showView: (!that.data.showView),
            havecar: havecar
        })
    },

    //监听部门picker选择器
    listenerPickerSelected: function (e) {
        //改变index值，通过setData()方法重绘界面
        this.setData({
            index: e.detail.value
        })
    },

    //车牌号输入框触发事件
    bindInputCarNum: function (e) {
        console.log('carNum改变，携带值为', e.detail.value)
        this.setData({
            carNum: e.detail.value,
        })
    },

    //车颜色选择器触发事件
    bindCarColorChange: function (e) {
        console.log('index_carColor改变，携带值为', e.detail.value)
        this.setData({
            index_carColor: e.detail.value,
        })
    },

    //车型输入框触发事件
    bindInputCarType: function (e) {
        console.log('carType改变，携带值为', e.detail.value)
        this.setData({
            carType: e.detail.value,
        })
    },

    //点击注册按钮触发事件
    bindRegistBtn: function (e) {

        //获得当前user
        const user = User.current();

        //用户注册信息
        var username = this.data.username;
        var gender = this.data.gender;
        var phone = this.data.phone && this.data.phone.trim();
        var department = parseInt(this.data.index);



        if (!this.checkPhone(phone) && !this.checkUsername(username)) {
            return;
        }
        if (!this.checkDepartment(department)) {
            return;
        }

        var that = this;

        //校验用户的真实信息
        var phoneLastFourNum = phone.substring(7);
        var nameLastWord = "**" + username.substring(username.length - 1);
        var cql = 'select count(*) from Validation where phone = ? and name=? and department=?';
        var pvalues = [phoneLastFourNum, nameLastWord, department];
        var count = 0;
        SERVER.Query.doCloudQuery(cql, pvalues).then(function (data) {
            // results 即为查询结果，它是一个 AV.Object 数组
            count = data.count;
            console.log("count:" + count);
            if (count == 0) {
                console.log("phone or name invalide:");
                that.checkAllInfo();
                return;
            }
            console.log("validate ok!");

            if (that.data.havecar == true) {
                var icarnum = that.data.carNum && that.data.carNum.trim();
                if (!that.checkCarnum()) {
                    return;
                }
                var carnum = that.data.carNum//车牌
                var carcolor = that.data.array_carColor[that.data.index_carColor]//车颜色
                var cartype = that.data.carType//车型

                //缓存车辆信息
                wx.setStorageSync('carcolor', that.data.index_carColor);//车颜色代码
                wx.setStorageSync('cartype', that.data.carType);//车型
                wx.setStorageSync('carnum', that.data.carNum);//车牌
                //保存车辆信息
                user.set('carnum', carnum);
                user.set('carcolor', carcolor);
                user.set('cartype', cartype);
            }

            //重新更新保存一份本地存储文件
            wx.setStorageSync('username', username);
            wx.setStorageSync('gender', gender);
            wx.setStorageSync('phone', phone);

            //更新user数据
            user.set('username', username);
            user.set('gender', gender);
            user.set('phone', phone);
            user.set('isRegistered', true);
            user.save();

            //注册成功，跳转到index页面
            wx.navigateTo({ url: '../index/index' });
        }, function (error) {
        });

    },
})
