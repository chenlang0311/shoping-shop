const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatSec = function (seconds, addzero) {
  if(!seconds) {
    return '00:00';
  }
  var min = Math.floor(seconds / 60),
    second = seconds % 60,
    hour, newMin, time;

  if (min > 60) {
    hour = Math.floor(min / 60);
    newMin = min % 60;
  }

  if (second < 10) { second = '0' + second; }
  if (min < 10) { min = '0' + min; }

  return time = hour ? (hour + ':' + newMin + ':' + second) : 
    addzero ? ('00:' + min + ':' + second) : (min + ':' + second);
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  formatSec: formatSec
}
