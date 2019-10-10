let $events = {

};
function _on(event, fn) {
  ($events[event] || ($events[event] = [])).push(fn);
}

function _off(event, fn) {
  if (!arguments.length) {
    $events = Object.create(null);
  }

  const cbs = $events[event];
  if (!cbs) {
    return
  }
  if (!fn) {
    $events[event] = null;
  }

  if (fn) {
    let cb,
      i = cbs.length;

    while (i--) {
      cb = cbs[i];
      if (cb === fn) {
        cbs.splice(i, 1);
        break;
      }
    }
  }

  $events[event] = cbs;
}

function _emit(event, details) {
  let cbs = $events[event];
  if (cbs && cbs.length) {
    for (let i = 0, len = cbs.length; i < len; i++) {
      try {
        cbs[i](details);
      } catch (e) {
        console.log('error in emit');
      }
    }
  }
}

function toArray(list, start){
  start = start || 0
  let i = list.length - start
  const ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

module.exports = {
  on: _on,
  off: _off,
  emit: _emit
}