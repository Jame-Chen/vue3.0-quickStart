export default {
    /**
 * 
 * @desc   url参数转对象
 * @param  {String} url  default: window.location.href
 * @return {Object} 
 */
    parseQueryString(url) {
        url = !url ? window.location.href : url;
        if (url.indexOf('?') === -1) {
            return {};
        }
        var search = url[0] === '?' ? url.substr(1) : url.substring(url.lastIndexOf('?') + 1);
        if (search === '') {
            return {};
        }
        search = search.split('&');
        var query = {};
        for (var i = 0; i < search.length; i++) {
            var pair = search[i].split('=');
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        return query;
    },
    isEmptyObject(obj) {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj))
            return false
        return !Object.keys(obj).length
    },
    getDateDiff(dateTimeStamp) {
        var result;
        var minute = 1000 * 60;
        var hour = minute * 60;
        var day = hour * 24;
        var halfamonth = day * 15;
        var month = day * 30;
        var now = new Date().getTime();
        var diffValue = now - new Date(dateTimeStamp).getTime();
        if (diffValue < 0) {
          return;
        }
        var monthC = diffValue / month;
        var weekC = diffValue / (7 * day);
        var dayC = diffValue / day;
        var hourC = diffValue / hour;
        var minC = diffValue / minute;
        if (monthC >= 1) {
          if (monthC <= 12) result = "" + parseInt(monthC) + "月前";
          else {
            result = "" + parseInt(monthC / 12) + "年前";
          }
        } else if (weekC >= 1) {
          result = "" + parseInt(weekC) + "周前";
        } else if (dayC >= 1) {
          result = "" + parseInt(dayC) + "天前";
        } else if (hourC >= 1) {
          result = "" + parseInt(hourC) + "小时前";
        } else if (minC >= 1) {
          result = "" + parseInt(minC) + "分钟前";
        } else {
          result = "刚刚";
        }
        return result;
      }

}