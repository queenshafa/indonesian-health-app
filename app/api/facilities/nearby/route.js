"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
var server_1 = require("@/lib/supabase/server");
var send_job_1 = require("@/lib/n8n/send-job");
var server_2 = require("next/server");
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, lat, lng, _b, radius, _c, facility_type, latitude, longitude, supabase, user, _d, job_id, responseBody, error_1;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, request.json()
                        // Validate input
                    ];
                case 1:
                    _a = _f.sent(), lat = _a.lat, lng = _a.lng, _b = _a.radius, radius = _b === void 0 ? 10 : _b, _c = _a.facility_type, facility_type = _c === void 0 ? "clinic" : _c;
                    // Validate input
                    if (lat === undefined || lng === undefined) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Latitude and longitude required' }, { status: 400 })];
                    }
                    latitude = Number(lat);
                    longitude = Number(lng);
                    if (isNaN(latitude) || isNaN(longitude)) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 2:
                    supabase = _f.sent();
                    return [4 /*yield*/, supabase.auth.getUser()
                        // Send job to N8N webhook
                    ];
                case 3:
                    user = (_f.sent()).data.user;
                    return [4 /*yield*/, (0, send_job_1.sendJobToN8N)("facility-finder", {
                            user_id: user === null || user === void 0 ? void 0 : user.id,
                            latitude: latitude,
                            longitude: longitude,
                            radius_km: radius,
                            facility_type: facility_type,
                        })];
                case 4:
                    _d = _f.sent(), job_id = _d.job_id, responseBody = _d.responseBody;
                    if (responseBody && typeof responseBody === 'object' && Array.isArray(responseBody.facilities)) {
                        return [2 /*return*/, server_2.NextResponse.json(__assign({ message: "Facility search completed", job_id: job_id, status: "completed", facilities: responseBody.facilities }, ((_e = responseBody.extra) !== null && _e !== void 0 ? _e : {})), { status: 200 })];
                    }
                    // Return immediately with job ID
                    return [2 /*return*/, server_2.NextResponse.json({
                            message: "Facility search queued",
                            job_id: job_id,
                            status: "processing",
                        }, { status: 202 })];
                case 5:
                    error_1 = _f.sent();
                    console.error('Server Error:', error_1);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to queue facility search' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
