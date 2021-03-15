import moment from 'moment'
import $ from 'jquery'
import axios from 'axios'
import qs from 'qs';
import { Message ,MessageBox} from 'element-ui'
export default {
    /**
     * @param {*} url 请求的参数
     */
    getDataByInterface_get(url,f) {
        $.ajax({
            type: "GET",
            url: encodeURI(url),
            dataType: "json",
            success: function (data) {
                f(data);
            },
            error: function (e) {
                console.log("错误信息：" + e.statusText);
            }
        });
    },
    /**
     * @param {*} url 请求的参数
     */
    getDataByInterface_post(url, paras,f) {
        $.ajax({
            async: false,
            type: "POST",
            url: encodeURI(url),
            dataType: "json",
            data: JSON.stringify(encodeURI(paras)),
            headers: {
                "content-type": "application/json"
            },
            success: function (data) {
                f(data);
            },
            error: function (e) {
                console.log("错误信息：" + e.statusText);
            }
        });
    },
    //x轴8:00--8：00时间数据
    getXdata() {
        var xdata = new Array(1441);
        for (var l = 0; l < 1441; l++) {
            var xlabel = "";
            if (parseInt(l / 60) < 16) {
                var hour = parseInt(l / 60) + 8;
                xlabel = ((hour < 10) ? ("0" + hour.toString()) : hour.toString()) + ":" + ((l % 60 < 10) ? ("0" + (l % 60).toString()) : (l % 60).toString());
            } else {
                xlabel = ("0" + (parseInt(l / 60) - 16).toString()) + ":" + ((l % 60 < 10) ? ("0" + (l % 60).toString()) : (l % 60).toString());
            }
            xdata[l] = xlabel;
        }
        return xdata;
    },
    /**
     * 计算两个时间的差值
     * @param {*} stime
     * @param {*} date
     * @returns
     */
    GetM(stime, date) {
        var time = moment(date).format('YYYY-MM-DD') + " 08:00:00";
        var time1 = moment(time).format('YYYY-MM-DD H:mm:ss');
        var time2 = moment(stime).format('YYYY-MM-DD H:mm:ss');
        var m = new Date(time2).getTime() - new Date(time1).getTime();
        m = parseInt(m / 1000 / 60);
        return m;
    },
    /**
     * arr1是否包含arr2
     * @param {*} arr1 
     * @param {*} arr2 
     */
    isIncludes(arr1, arr2) {
        return arr2.every(val => arr1.includes(val));
    },
    /**
     * 判断是否为空 空返回"--"
     * @param {*} val 
     */
    isNull(val) {
        return val != null ? val : '--';
    },
    /**
     * 数组去重
     * @param {*} array 目标数组
     */
    Unique(array){
        return Array.from(new Set(array));
    },
    getRoleMessage(){

        var townArray = JSON.parse(window.sessionStorage.getItem('District'));
        var spqArray = JSON.parse(window.sessionStorage.getItem('SPQ'));

        var resultBack = {};
        var town = "";
        var spq = "";
        if (townArray && townArray.length > 0) {
            townArray.forEach(element => {
                town += element.code + ",";
            });
            town = town.substring(0, town.length - 1);
            resultBack["town"] = town;
        }
      
        if (spqArray && spqArray.length > 0) {
            spqArray.forEach(element => {
                spq += "'" + element.code + "',";
            });
            spq = spq.substring(0, spq.length - 1);
            resultBack["spq"] = spq;
        }

        return resultBack;
    },
    /**
     * 根据月份获取当前月的天数
     */
    getDaysByMonth(date) {
        var days = moment(date, "YYYY-MM").daysInMonth(); // 29
        var array = [];
        for (let index = 1; index <= days; index++) {
            array.push(index);
        }
        return array;
    },
    /**
     * @param {*} stime 
     */
    GetDay(stime) {
        return moment(stime).format('D');
    },
    /**
     * featurelayer编辑接口
     * @param {*} layerUrl 
     * @param {*} param 
     * @param {*} editType 
     * @param {*} f 
     */
    featureLayerEditApi(layerUrl,param,editType,f){
        var that = this;
        axios.post(layerUrl+"/applyEdits", param,{
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8;'
            },
            responseType: 'json'
        }).then(function (response) {
            console.log(response);
            if(response.data[editType].length > 0){
                var json = response.data[editType];
                if(json[0].success){
                    Message({
                        message: editType == 'deleteResults' ? '删除成功！':(editType == 'addResults' ? '新增成功！' : "更新成功!"),
                        type: 'success',
                        customClass:'usermessage'
                    });
                    f(json[0].success);
                }
            } 
          }).catch(function (error) {
            Message({
                message: error,
                type: 'warning',
                customClass:'usermessage'
            });
          });
    }

}