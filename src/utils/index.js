! function (n, r) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = r() : "function" == typeof define && define.amd ? define(r) : (n = "undefined" != typeof globalThis ? globalThis : n || self).arr = r()
}(this, function () {
    "use strict";

    function r(r, n) {
        var t, e = Object.keys(r);
        return Object.getOwnPropertySymbols && (t = Object.getOwnPropertySymbols(r), n && (t = t.filter(function (n) {
            return Object.getOwnPropertyDescriptor(r, n).enumerable
        })), e.push.apply(e, t)), e
    }

    function i(o) {
        for (var n = 1; n < arguments.length; n++) {
            var u = null != arguments[n] ? arguments[n] : {};
            n % 2 ? r(Object(u), !0).forEach(function (n) {
                var r, t, e;
                r = o, e = u[t = n], t in r ? Object.defineProperty(r, t, {
                    value: e,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : r[t] = e
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(o, Object.getOwnPropertyDescriptors(u)) : r(Object(u)).forEach(function (n) {
                Object.defineProperty(o, n, Object.getOwnPropertyDescriptor(u, n))
            })
        }
        return o
    }

    function u(n) {
        return function (n) {
            if (Array.isArray(n)) return e(n)
        }(n) || function (n) {
            if ("undefined" != typeof Symbol && Symbol.iterator in Object(n)) return Array.from(n)
        }(n) || function (n, r) {
            if (!n) return;
            if ("string" == typeof n) return e(n, r);
            var t = Object.prototype.toString.call(n).slice(8, -1);
            "Object" === t && n.constructor && (t = n.constructor.name);
            if ("Map" === t || "Set" === t) return Array.from(n);
            if ("Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return e(n, r)
        }(n) || function () {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function e(n, r) {
        (null == r || r > n.length) && (r = n.length);
        for (var t = 0, e = new Array(r); t < r; t++) e[t] = n[t];
        return e
    }

    function n() {
        if (!(this instanceof n)) throw new TypeError("Cannot call a class as a function")
    }
    return n.prototype = {
        union: function (r, n, t) {
            return r.concat(n.filter(function (n) {
                return t ? !r.map(function (n) {
                    return n[t]
                }).includes(n[t]) : !r.includes(n)
            }))
        },
        intersection: function (n, r, t) {
            return n.filter(function (n) {
                return t ? r.map(function (n) {
                    return n[t]
                }).includes(n[t]) : r.includes(n)
            })
        },
        except: function (n, t, e) {
            return [].concat(u(n), u(t)).filter(function (r) {
                return ![n, t].every(function (n) {
                    return e ? n.map(function (n) {
                        return n[e]
                    }).includes(r[e]) : n.includes(r)
                })
            })
        },
        sum: function (n, t) {
            return n.reduce(function (n, r) {
                return n + (t ? r[t] || 0 : r)
            }, 0)
        },
        unique: function (n, t) {
            return t ? n.reduce(function (n, r) {
                return n.map(function (n) {
                    return n[t]
                }).includes(r[t]) ? n : [].concat(u(n), [r])
            }, []) : u(new Set(n))
        },
        arrayToTree: function r(t, n, e) {
            var o = 1 < arguments.length && void 0 !== n ? n : null,
                u = 2 < arguments.length && void 0 !== e ? e : "pid";
            return t.filter(function (n) {
                return n[u] === o
            }).map(function (n) {
                return i(i({}, n), {}, {
                    children: r(t, n.id, u)
                })
            })
        },
        sample: function (n) {
            return n[Math.floor(Math.random() * n.length)]
        },
        randomArrayInRangeRepeat: function (n, r, t) {
            var e = 2 < arguments.length && void 0 !== t ? t : 1;
            return Array.from({
                length: e
            }, function () {
                return Math.floor(Math.random() * (r - n + 1)) + n
            })
        },
        randomArrayInRange: function (t, n, r) {
            for (var e = 2 < arguments.length && void 0 !== r ? r : 1, o = Array(n - t + 1).fill(0).map(function (n, r) {
                    return t + r
                }), u = e > o.length ? o.length : e, i = []; i.length != u;) {
                var c = o[Math.floor(Math.random() * o.length)];
                i.includes(c) || i.push(c)
            }
            return i
        },
        range: function (t, n, e) {
            return Array.from({
                length: (n - t) / e + 1
            }, function (n, r) {
                return t + r * e
            })
        },
        flatten: function t(n, r) {
            var e = 1 < arguments.length && void 0 !== r ? r : 1;
            return n.reduce(function (n, r) {
                return n.concat(1 < e && Array.isArray(r) ? t(r, e - 1) : r)
            }, [])
        },
        compact: function (n) {
            return n.filter(Boolean)
        },
        countOccurrences: function (n, t, e) {
            return n.reduce(function (n, r) {
                return (e ? r[t] === e : r === t) ? n + 1 : n
            }, 0)
        },
        average: function (n, r) {
            var t = Array.prototype.slice.call(arguments).every(function (n) {
                    return !isNaN(parseFloat(n)) && isFinite(n)
                }),
                e = t ? arguments.length : n.length;
            return (t ? Array.prototype.slice.call(arguments) : r ? n.map("function" == typeof r ? r : function (n) {
                return n[r]
            }) : n).reduce(function (n, r) {
                return n + +r
            }, 0) / e
        },
        arrayToCSV: function (n, r) {
            var t = 1 < arguments.length && void 0 !== r ? r : ",";
            return n.map(function (n) {
                return n.map(function (n) {
                    return '"'.concat(n, '"')
                }).join(t)
            }).join("\n")
        },
        indexOfAll: function (n, e, o) {
            return n.reduce(function (n, r, t) {
                return (o ? r[e] === o : r === e) ? [].concat(u(n), [t]) : n
            }, [])
        },
        oneArryTotwoArry: function (e, o) {
            return Array(Math.ceil(e.length / o)).fill(0).reduce(function (n, r, t) {
                return n.push(e.slice(t * o, (t + 1) * o)), n
            }, [])
        },
        changePostion: function (n, r, t) {
            n.splice(r, 1, n.splice(t, 1, n[r])[0])
        },
        change: function (n, r, t) {
            n[t] = [n[r], n[r] = n[t]][0]
        },
        inset: function (n, r, t) {
            n.splice(t, 0, n.splice(r, 1)[0])
        },
        categoryArchive: function (t, e) {
            return Array.from(new Set(t.map(function (n) {
                return n[e]
            }))).reduce(function (n, r) {
                return n.push(t.filter(function (n) {
                    return n[e] === r
                })), n
            }, [])
        }
    }, new n
});
//# sourceMappingURL=index.js.map