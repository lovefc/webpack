/**
 * fcup大文件分片上传插件
 * author: lovefc
 * blog：https://lovefc.cn
 * github: https://github.com/lovefc/fcup2
 * gitee: https://gitee.com/lovefc/fcup2
 * time: 2020/04/30 14:21
 * uptime: 2020/11/29 16:12 修改跨域问题
 */
let SparkMD5 = require('spark-md5');
;(function (factory) {
    if (typeof exports === "object") {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        let glob;
        try {
            glob = window;
        } catch (e) {
            glob = self;
        }
        glob.fcup = factory();
    }
})(function () {
	'use strice';
    return function (config) {
        let that = this;
        this.datas = [];
        this.id = '';
        this.shardsize = '2';
        this.minsize;
        this.maxsize = "200";
        // 检查url
        this.checkurl = '';
        this.url = '';
        this.headers = null;
        this.type = '';
        this.apped_data = {};
        this.currentsize = 0;
        this.currenttime = 0;
        this.reStatus = true;
        this.delaytime = 300;
        this.timeout = 10000;
        this.canceStatus = 0;
        this.formdata = new FormData();
        this.xhr = new XMLHttpRequest();
        this.errormsg = {
            1000: "未找到该上传id",
            1001: "不允许上传的文件类型",
            1002: "上传文件过小",
            1003: "上传文件过大",
            1004: "请求超时"
        };
        this.start = function () {};
        this.error = function (err) {
            alert(err)
        };
        this.success = function (res) {
            return true;
        };
        this.checksuccess = function (res) {
            return true;
        };
        this.createcors = function () {
            let xhr = new XMLHttpRequest();
            if ('withCredentials' in xhr) {} else if (typeof XDomainRequest != 'undefined') {
                let xhr = new XDomainRequest();
            } else {
                let xhr = null;
            }
            return xhr;
        };

        this.setheader = function (xhrs) {
            let header = this.headers;
            if (header) {
                if (Object.prototype.toString.call(header) === '[object Object]') {
                    for (let i in header) {
                        xhrs.setRequestHeader(i, header[i]);
                    };
                }
            }
            header = null;
        };

        this.progress = function (num) {};
        // 上传检查,可用于分片
        this.upcheck = function (md5) {
            if (!this.checkurl) {
                return false;
            }
            this.formdata.append('file_name', that.filename);
            this.formdata.append('file_md5', md5);
            this.formdata.append('file_size', that.size);
            this.formdata.append('file_total', that.shardTotal);
            if (this.apped_data) {
                this.formdata.append("apped_data", JSON.stringify(this.apped_data));
            }
            let xhrs = new this.createcors();
            xhrs.open('POST', this.checkurl, false); // 同步
            this.setheader(xhrs);
            xhrs.onreadystatechange = function () {
                if (xhrs.status == 404) {
                    return;
                }
                if ((xhrs.readyState == 4) && (xhrs.status == 200)) {
                    if (typeof that.checksuccess == 'function') {
                        that.alreadyExists = that.checksuccess(xhrs.responseText);
                    }
                }
            }
            xhrs.send(this.formdata);
            this.formdata.delete('file_md5');
            this.formdata.delete('file_name');
            this.formdata.delete('file_size');
            this.formdata.delete('file_total');
            if (that.apped_data) {
                this.formdata.delete("apped_data");
            }
            xhrs = null;
        };
        // 设置当前切片
        this.setshard = function (index) {
            index = index < 1 ? 1 : index;
            that.k = index - 1;
            that.shardIndex = index;
        };
        // 取消上传
        this.cancel = function () {
            that.cancelStatus = 1;
        };
        // 配置参数
        this.exetnd = function (jb) {
            if (Object.prototype.toString.call(jb) === '[object Object]') {
                for (let i in jb) {
                    that[i] = jb[i];
                };
                this.init();
            }
			return that;
        };
        // 初始化操作
        this.init = function () {
            if (!this.id) {
                return false;
            }
            let id = this.id;
            this.dom = document.querySelector(`#${id}`);
            if (this.dom === null) {
                this.error(this.errormsg['1000']);
                return;
            }
            this.domtext = this.dom.innerHTML;
            this.credom();
            this.dom.onclick = function () {
                that.filedom.click();
            };
            let evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, false);
            this.filedom.dispatchEvent(evt);
        };
        // 注销
        this.destroy = function () {
            this.datas = [];
            this.file = null;
        };
        // 创建元素
        this.credom = function () {
            let up_id = 'fcup_' + this.id + '_' + new Date().getTime();
            this.dom.innerHTML = this.domtext + '<input type="file" id="' + up_id + '" style="display:none;">';
            this.filedom = document.getElementById(up_id);
            this.filedom.addEventListener('change', this.onevent, false);
        };
        // 触发事件
        this.onevent = function () {
            that.start();
            let files = that.filedom.files[0];
            that.upload(files);
        };
        // 上传处理
        this.post = function (md5) {
            let shardCount = this.shardTotal;
            let shardIndex = this.shardIndex;
            if (this.cancelStatus == 1) {
                return false;
            }
            if (shardIndex >= (shardCount + 1) || (this.reStatus == false)) {
                return false;
            }
            let file = this.datas[this.k];
            this.formdata.append("file_data", file['file_data']);
            this.formdata.append("file_name", file['file_name']);
            this.formdata.append("file_size", file['file_size']);
            this.formdata.append("file_chunksize", file['file_chunksize']);
            this.formdata.append("file_suffix", file['file_suffix']);
            this.formdata.append("file_total", shardCount);
            this.formdata.append("file_md5", md5);
            this.formdata.append("file_index", this.shardIndex);
            this.currentsize += file['file_chunksize'];
            if (this.apped_data) {
                this.formdata.append("apped_data", JSON.stringify(this.apped_data));
            }
            let xhrs = this.createcors();
            xhrs.open('POST', this.url, true);
            this.setheader(xhrs);
            xhrs.timeout = this.timeout;
            xhrs.onloadstart = function () {
                let progress_num = that.getpercent(shardIndex, shardCount);
                that.progress_num = progress_num > 100 ? 100 : progress_num;
                that.startTime = new Date().getTime();
            };
            xhrs.onload = function () {
                that.post(md5);
            };
            xhrs.onreadystatechange = function () {
                that.result(xhrs);
            };
            xhrs.ontimeout = function (e) {
                that.error(that.errormsg['1004']);
            };
            xhrs.send(this.formdata);
            this.formdata.delete('file_data');
            this.formdata.delete('file_name');
            this.formdata.delete('file_size');
            this.formdata.delete("file_chunksize");
            this.formdata.delete("file_suffix");
            this.formdata.delete('file_md5');
            this.formdata.delete('file_total');
            this.formdata.delete('file_index');
            if (that.apped_data) {
                this.formdata.delete("apped_data");
            }
            this.k++;
            this.shardIndex++;
        };
        // 时间计算
        this.computeTime = function (totalTime) {
            if (totalTime < 1000) {
                totalTime = (totalTime / 1000).toFixed(4) + '秒';
            } else {
                if (totalTime >= (1000 * 60)) {
                    totalTime = Math.floor(totalTime / (1000 * 60)) + '分钟';
                } else {
                    totalTime = (totalTime / 1000).toFixed(4) + '秒';
                }
            }
            return totalTime;
        };
        // 结果处理
        this.result = function (xhr) {
            that.reStatus = false;
            if (xhr.status == 404) {
                return;
            }
            if ((xhr.readyState == 4) && (xhr.status == 200)) {
                let pertime = Math.round(new Date().getTime() - that.startTime);
                that.shardTime += pertime;
                if (that.progress_num < 80) {
                    that.cachepertime = pertime;
                }
                let total_time = that.cachepertime * that.shardTotal;
                if (that.shardTotal == 1) {
                    total_time = that.shardTime;
                }
                let use_time = that.shardTime;
                let total_times = that.computeTime(total_time);
                let use_times = that.computeTime(use_time);
                let type = xhr.getResponseHeader("Content-Type");
                let other = {
                    'totaltime': total_times,
                    'usetime': use_times,
                    'current': this.getconver(that.currentsize),
                    "surplus": this.getconver(that.size - that.currentsize),
                    "type": type
                };
                if (typeof that.progress == 'function') {
                    that.progress(that.progress_num, other);
                }
                if (typeof that.success == 'function') {
                    other.progress = that.progress_num;
                    if (that.progress_num == 100) {
                        setTimeout(function () {
                            that.reStatus = that.success(xhr.responseText, other);
                            that.destroy();
                        }, that.delaytime);
                    } else {
                        that.reStatus = that.success(xhr.responseText);
                    }
                }
            } else {
                if (typeof that.beforeSend == 'function') {
                    that.beforeSend();
                }
            }
        };
        // 参数解析
        this.postData = function (i, start, end) {
            this.datas[i] = [];
            let file = this.file.slice(start, end);
            this.datas[i]["file_data"] = file;
            this.datas[i]["file_name"] = this.filename;
            this.datas[i]["file_size"] = this.size;
            this.datas[i]["file_chunksize"] = file.size;
            this.datas[i]["file_suffix"] = this.suffix;
        };
        // 大小格式
        this.limitFileSize = function (limitSize) {
            var arr = ["KB", "MB", "GB"],
                limit = limitSize.toUpperCase(),
                limitNum = 0;
            for (var i = 0; i < arr.length; i++) {
                var leval = limit.indexOf(arr[i]);
                if (leval > -1) {
                    limitNum = parseInt(limit.substr(0, leval)) * Math.pow(1024, (i + 1));
                    break;
                }
            }
            return limitNum;
        };
        this.getpercent = function (num, total) {
            num = parseFloat(num);
            total = parseFloat(total);
            if (isNaN(num) || isNaN(total)) {
                return "-";
            }
            return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00);
        };
        this.getconver = function (limit) {
            let size = "";
            if (limit < 0.1 * 1024) {
                size = limit.toFixed(2) + "B";
            } else if (limit < 0.1 * 1024 * 1024) {
                size = (limit / 1024).toFixed(2) + "KB";
            } else {
                size = (limit / (1024 * 1024)).toFixed(2) + "MB";
            }
            let sizestr = size + "";
            let len = sizestr.indexOf("\.");
            let dec = sizestr.substr(len + 1, 2);
            if (dec == "00") {
                return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
            }
            return sizestr;
        };
        // 上传主函数
        this.upload = function (file) {
            if (!file) {
                return;
            }
            this.credom();
            this.datas = [];
            this.progress_num = 0;
            this.currentsize = 0;
            this.reStatus = true;
            this.shardTime = 0;
            this.file = file;
            this.size = file.size;
            this.filename = file.name;
            this.alreadyExists = true;
            let ext = this.filename.lastIndexOf("."),
                ext_len = this.filename.length;
            this.suffix = this.filename.substring(ext + 1, ext_len).toLowerCase();
            if (this.type) {
                let uptype = this.type.split(",");
                if (uptype.indexOf(this.suffix) == -1) {
                    this.error(this.errormsg['1001']);
                    return;
                }
            }
            if (this.minsize) {
                let limitNum = this.limitFileSize(this.minsize + 'MB');
                if (file.size < limitNum) {
                    this.error(this.errormsg['1002']);
                    return;
                }
            }
            if (this.maxsize) {
                let limitNum = this.limitFileSize(this.maxsize + 'MB');
                if (file.size > limitNum) {
                    this.error(this.errormsg['1003']);
                    return;
                }
            }
            let i = 0,
                blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
                chunkSize = (+this.shardsize) * 1024 * 1024,
                chunks = Math.ceil(file.size / chunkSize),
                currentChunk = 0,
                md5id = 0,
                fileReader = new FileReader(),
                spark = new SparkMD5.ArrayBuffer();

            this.shardTotal = chunks;
            let frOnload = function (e) {
                spark.append(e.target.result);
                currentChunk++;
                if (currentChunk < chunks) {
                    loadNext();
                } else {
                    md5id = spark.end(); // 获取md5
                    that.md5str = md5id;
                    that.k = 0;
                    that.shardIndex = 1;
                    that.cachepertime = 0;
                    that.startUpload();

                }
            };
            let frOnerror = function () {};
            fileReader.onload = frOnload;
            fileReader.onerror = frOnerror;

            function loadNext() {
                let start = currentChunk * chunkSize,
                    end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize,
                    filedata = file.slice(start, end);
                that.postData(i, start, end);
                fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
                i++;
            };
            loadNext();
        };
        // 开始上传
        this.startUpload = function () {
            that.upcheck(that.md5str); // 检查上传
            if (that.alreadyExists == false) {
                return;
            } else {
                that.cancelStatus = 0;
                that.post(that.md5str);
            }
        };
        this.exetnd(config);
    };
});