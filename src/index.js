// states 선언
const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

function Promise(fn) {
  // 상태값을 저장할 변수
  var state = PENDING;

  // FULLFILLED 혹은 REJECTED 되었을 때 result 혹은 error 값을 저장할 변수
  var value = null;

  // onFulfilled, onRejected 객체들을 저장할 배열
  var handlers = [];

  /**
   *  fulfill
   *  state => FULFILLED , value에 result값 저장 , handler배열의 값 처리 후 초기화
   *
   * @param {Any} result
   */

  function fulfill(result) {
    state = FULFILLED;
    value = result;
    handlers.forEach(handle);
    handlers = null;
  }

  /**
   *  reject
   *  state => REJECTED , value에 error 메세지 저장 , handler배열의 값 handle 후 초기화
   *
   * @param {Any} error
   */

  function reject(error) {
    state = REJECTED;
    value = error;
    handlers.forEach(handle);
    handlers = null;
  }

  /**
   *  handle
   *  state에 맞게 fulfill 혹은 reject 함수를 실행 ( pending시 handler에 푸시 )
   *
   * @param { { Function , Function } } handler
   */

  function handle(handler) {
    if (state === PENDING) {
      handlers.push(handler);
    } else {
      if (state === FULFILLED && typeof handler.onFulfilled === "function") {
        handler.onFulfilled(value);
      }
      if (state === REJECTED && typeof handler.onRejected === "function") {
        handler.onRejected(value);
      }
    }
  }

  /**
   * getThen
   * value값의 타입을 확인하고, then 객체가 있는경우 then 메소드 리턴
   *
   * @param {Promise|Any} value
   * @return {Function|Null}
   */

  function getThen(value) {
    var t = typeof value;
    if (value && (t === "object" || t === "function")) {
      var then = value.then;
      if (typeof then === "function") {
        return then;
      }
    }
    return null;
  }

  /**
   * resolve
   * result가 promise인 경우 완료될때까지 기다리고, 아닌경우(plain value) fulfill 함수 | 에러 발생시 reject 함수 실행
   *
   * @param {Any} result
   * @return void
   */

  function resolve(result) {
    try {
      var then = getThen(result);
      if (then) {
        doResolve(then.bind(result), resolve, reject);
        return;
      }
      fulfill(result);
    } catch (e) {
      reject(e);
    }
  }

  /**
   * doResolve
   * onFulfilled 와 onRejected 함수가 한번만 실행되게 적용(done).
   *
   * @param {Function}
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   */

  function doResolve(fn, onFulfilled, onRejected) {
    var done = false;
    try {
      fn(
        function (value) {
          if (done) return;
          done = true;
          onFulfilled(value);
        },
        function (reason) {
          if (done) return;
          done = true;
          onRejected(reason);
        }
      );
    } catch (ex) {
      if (done) return;
      done = true;
      onRejected(ex);
    }
  }

  /**
   * then
   * 입력받은 onFulfilled, onRejected 를 handle하는 Promise 객체 리턴
   *
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   * @return {Promise}
   */

  this.then = function (onFulfilled, onRejected) {
    return new Promise(function (resolve, reject) {
      return handle({
        onFulfilled: function (result) {
          if (typeof onFulfilled === "function") {
            try {
              return resolve(onFulfilled(result));
            } catch (ex) {
              return reject(ex);
            }
          } else {
            return resolve(result);
          }
        },
        onRejected: function (error) {
          if (typeof onRejected === "function") {
            try {
              return resolve(onRejected(error));
            } catch (ex) {
              return reject(ex);
            }
          } else {
            return reject(error);
          }
        },
      });
    });
  };

  doResolve(fn, resolve, reject);
}

/**
 * all
 *
 * 각 배열에 담긴 모든 promise가 완료될 떄까지 기다렸다가 각 결과 값들을 배열에 담아 리턴
 * 결과값 순서는 input 배열 순서와 동일
 *
 * @param {Array} arr
 * @return {Promise}
 */

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === "object" || typeof val === "function")) {
        var then = val.then;
        if (typeof then === "function") {
          var p = new Promise(then.bind(val));
          p.then(function (val) {
            res(i, val);
          }, reject);
          return;
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.resolve = function (value) {
  return new Promise(function (resolve) {
    resolve(value);
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.prototype.then = function (onFulfilled, onRejected) {
  return this.then(onFulfilled, onRejected);
};

Promise.prototype["catch"] = function (onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype["finally"] = function (f) {
  return this.then(
    function (value) {
      return Promise.resolve(f()).then(function () {
        return value;
      });
    },
    function (err) {
      return Promise.resolve(f()).then(function () {
        throw err;
      });
    }
  );
};

export default Promise;
