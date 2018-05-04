; (function () {
        if (window.AlipayJSBridge) {
            return;
        }

        function alipayjsbridgeFunc(url) {
          setTimeout(function() {
            var iframe = document.createElement('iframe');
            iframe.style.width = '1px';
            iframe.style.height = '1px';
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            setTimeout(function() {
              document.body.removeChild(iframe);
            }, 100);
          }, 0);
        }
        window.alipayjsbridgeSetTitle = function(title){
            document.title = title;
            alipayjsbridgeFunc("alipayjsbridge://setTitle?title=" + encodeURIComponent(title));
        };
        window.alipayjsbridgeRefresh = function(){alipayjsbridgeFunc("alipayjsbridge://onRefresh?")};
        window.alipayjsbridgeBack = function(){alipayjsbridgeFunc("alipayjsbridge://onBack?")};
        window.alipayjsbridgeExit = function(bsucc){alipayjsbridgeFunc("alipayjsbridge://onExit?bsucc=" + bsucc)};
        window.alipayjsbridgeShowBackButton = function(bshow){alipayjsbridgeFunc("alipayjsbridge://showBackButton?bshow=" + bshow)};

        window.AlipayJSBridge = {
        version: '2.0',
        addListener: addListener,
        hasListener: hasListener,
        callListener: callListener,
        callNativeFunc: callNativeFunc,
        callBackFromNativeFunc: callBackFromNativeFunc
        };

        var uniqueId = 1;
        var h5JsCallbackMap = {};

        function iframeCall(paramStr) {
          setTimeout(function() {
                var iframe = document.createElement('iframe');
                iframe.style.width = '1px';
                iframe.style.height = '1px';
                iframe.style.display = 'none';
                iframe.src = "alipayjsbridge://callNativeFunc?" + paramStr;
                var parent = document.body || document.documentElement;
                parent.appendChild(iframe);
                setTimeout(function() {
                  document.body.removeChild(iframe);
                }, 100);
           }, 0);
        }

        function callNativeFunc(nativeFuncName, data, h5JsCallback) {
            var h5JsCallbackId = "";
            if (h5JsCallback) {
                h5JsCallbackId = "cb_" + (uniqueId++) + "_" + new Date().getTime();
                h5JsCallbackMap[h5JsCallbackId] = h5JsCallback;
            }

            var dataStr = "";
            if (data) {
                dataStr = encodeURIComponent(JSON.stringify(data));
            }
            var paramStr = "func=" + nativeFuncName + "&cbId=" + h5JsCallbackId + "&data=" + dataStr;
            iframeCall(paramStr);
        }

        function callBackFromNativeFunc(h5JsCallbackId, data) {
            var h5JsCallback = h5JsCallbackMap[h5JsCallbackId];
            if (h5JsCallback) {
                h5JsCallback(data);
                delete h5JsCallbackMap[callbackId];
            }
        }
        var h5ListenerMap = {};

        function addListener(jsFuncName, jsFunc) {
            h5ListenerMap[jsFuncName] = jsFunc;
        }

        function hasListener(jsFuncName) {
            var jsFunc = h5ListenerMap[jsFuncName];
            if (!jsFunc) {
                return false;
            }
            return true;
        }

        function callListener(h5JsFuncName, data, nativeCallbackId) {
            var responseCallback;
            if (nativeCallbackId) {
                responseCallback = function (responseData) {
                    var dataStr = "";
                    if (responseData) {
                        dataStr = encodeURIComponent(JSON.stringify(responseData));
                    }
                    var paramStr = "func=h5JsFuncCallback" + "&cbId=" + nativeCallbackId + "&data=" + dataStr;
                    iframeCall(paramStr);
                };
            }

            var h5JsFunc = h5ListenerMap[h5JsFuncName];
            if (!h5JsFunc) {
                responseCallback({"success":"fail"});
                console.log("AlipayJSBridge: no h5JsFunc ", h5JsFuncName + data);
            } else {
                h5JsFunc(data, responseCallback);
            }
        }
        var event;
        if (window.CustomEvent) {
            event = new CustomEvent('alipayjsbridgeready');
        } else {
            event = document.createEvent('Event');
            event.initEvent('alipayjsbridgeready', true, true);
        }
        document.dispatchEvent(event);

        setTimeout(excuteH5InitFuncs, 0);
        function excuteH5InitFuncs() {
            if (window.AlipayJSBridgeInitArray) {
                var h5InitFuncs = window.AlipayJSBridgeInitArray;
                delete window.AlipayJSBridgeInitArray;
                for (var i = 0; i < h5InitFuncs.length; i++) {
                    try {
                        h5InitFuncs[i](AlipayJSBridge);
                    } catch (e) {
                        setTimeout(function() { throw e; });
                    }
                }
            }
        }

    })();