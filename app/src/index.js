require('./css/mdui.min.css');
require('./css/normalize.min.css');
require('./css/style.css');
let $ = require('./js/jquery.min.js');

let fcup = require('./js/fcup.js');
let mdui = require('./js/mdui.js');

let inst = new mdui.Headroom('#header');
inst.disable();
// 进度条
function Progress(value) {
  $('#myProgress').css('width', value + '%');
}
var inst1 = new mdui.Tooltip('#preview', {
  content: '案例展示'
});
var inst2 = new mdui.Tooltip('#document', {
  content: '开发文档'
});
var inst3 = new mdui.Tooltip('#down', {
  content: '下载'
});

// 上传案例
let up = new fcup({

  id: "upid", // 绑定id

  url: "./php/file.php", // url地址

  type: "jpg,png,jpeg,gif", // 限制上传类型，为空不限制

  shardsize: "0.1", // 每次分片大小，单位为M，默认1M

  minsize: '', // 最小文件上传M数，单位为M，默认为无

  maxsize: "50", // 上传文件最大M数，单位为M，默认200M

  // headers: {"version": "fcup-v2.0"}, // 附加的文件头

  // apped_data: {}, //每次上传的附加数据

  // 定义错误信息
  errormsg: {
    1000: "未找到该上传id",
    1001: "类型不允许上传",
    1002: "上传文件过小",
    1003: "上传文件过大",
    1004: "请求超时"
  },

  // 开始事件                
  start: () => {
    Progress(0);
    console.log('开始上传');
  },

  // 等待上传事件，可以用来loading
  beforeSend: () => {
    console.log('等待请求中');
  },

  // 上传进度事件
  progress: (num, other) => {
    Progress(num);
    console.log(num);
    console.log('上传进度' + num);
    console.log("上传类型" + other.type);

    // 以下仅作参考,并不是太准确		 
    console.log("已经上传" + other.current);
    console.log("剩余上传" + other.surplus);
    console.log("已用时间" + other.usetime);
    console.log("预计时间" + other.totaltime);
  },

  // 错误提示
  error: (msg) => {
    alert(msg);
  },

  // 上传成功回调，回调会根据切片循环，要终止上传循环，必须要return false，成功的情况下要始终要返回true;
  success: (res) => {

    let data = res ? eval('(' + res + ')') : '';

    let url = data.url + "?" + Math.random();

    if (data.status == 2) {
      //alert('上传完成');
      $('#pic').attr("src", url);
      Progress(100);
    }

    if (data.status == 3) {
      //alert('已经上传过了');
      $('#pic').attr("src", url);
      Progress(100);
      return false;
    }

    // 如果接口没有错误，必须要返回true，才不会终止上传循环
    return true;
  }
});