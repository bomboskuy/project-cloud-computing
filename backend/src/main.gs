// ============================================================
// Code.gs — Presensi QR Dinamis + Sensor Telemetry Backend
// ============================================================
// Routing: e.parameter.path  (BUKAN e.pathInfo)
// Sheets:  tokens | presence | accel | gps
// ============================================================

// --------------- CONFIG ---------------
// ⚠️ WAJIB DIISI: Buka Google Sheet kamu, salin ID dari URL-nya.
// URL Sheet: https://docs.google.com/spreadsheets/d/1vpsC0vigfWfeMUdPds8QsVbPehOhQzy-QxW9xnWMijM/edit
var SPREADSHEET_ID = "1vpsC0vigfWfeMUdPds8QsVbPehOhQzy-QxW9xnWMijM";
var TOKEN_TTL_MS   = 120000; // 2 menit

// --------------- SHEET HELPERS ---------------

/**
 * Membuka Spreadsheet berdasarkan ID (karena project standalone, bukan container-bound).
 * Memanggil initSheets() otomatis untuk memastikan semua tab ada.
 */
function getDb() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  initSheets(ss);
  return ss;
}

/**
 * Buat sheet + header jika belum ada.
 */
function initSheets(ss) {
  var schema = {
    tokens:   ["qr_token", "course_id", "session_id", "created_at", "expires_at", "used"],
    presence: ["presence_id", "user_id", "device_id", "course_id", "session_id", "qr_token", "ts", "recorded_at"],
    accel:    ["device_id", "x", "y", "z", "sample_ts", "batch_ts", "recorded_at"],
    gps:      ["device_id", "lat", "lng", "accuracy", "altitude", "ts", "recorded_at"]
  };

  for (var name in schema) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(schema[name]);
    }
  }
}

// --------------- RESPONSE HELPERS ---------------

function sendSuccess(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendError(error) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: error }))
    .setMimeType(ContentService.MimeType.JSON);
}

// --------------- ROUTING ---------------

function doGet(e) {
  var path = (e.parameter && e.parameter.path) ? e.parameter.path : "ui";

  if (path === "presence/status")        return handleGetStatus(e);
  if (path === "sensor/gps/marker")      return handleGetGpsMarker(e);
  if (path === "sensor/gps/polyline")    return handleGetGpsPolyline(e);

  // Frontend UI
  if (path === "ui") {
    return HtmlService.createHtmlOutputFromFile("Index")
      .setTitle("Dashboard Presensi QR")
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }

  return sendError("Route not found");
}

function doPost(e) {
  var path = (e.parameter && e.parameter.path) ? e.parameter.path : "";

  if (path === "presence/qr/generate")   return handleGenerateQR(e);
  if (path === "presence/checkin")        return handleCheckin(e);
  if (path === "sensor/accel/batch")      return handleAccelBatch(e);
  if (path === "sensor/gps")             return handlePostGps(e);

  return sendError("Route not found");
}

// --------------- PRESENCE: GENERATE QR ---------------

function handleGenerateQR(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var courseId  = body.course_id;
    var sessionId = body.session_id;

    if (!courseId || !sessionId) {
      return sendError("course_id and session_id are required");
    }

    var token     = "TKN-" + Utilities.getUuid().substring(0, 6).toUpperCase();
    var now       = new Date();
    var expiresAt = new Date(now.getTime() + TOKEN_TTL_MS);

    var ss    = getDb();
    var sheet = ss.getSheetByName("tokens");
    sheet.appendRow([
      token,
      courseId,
      sessionId,
      now.toISOString(),
      expiresAt.toISOString(),
      "false"
    ]);

    return sendSuccess({
      qr_token:   token,
      expires_at: expiresAt.toISOString()
    });
  } catch (err) {
    return sendError(err.message);
  }
}

// --------------- PRESENCE: CHECK-IN ---------------

function handleCheckin(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var userId    = body.user_id;
    var deviceId  = body.device_id;
    var courseId   = body.course_id;
    var sessionId  = body.session_id;
    var qrToken   = body.qr_token;
    var ts        = body.ts || new Date().toISOString();

    if (!userId || !deviceId || !courseId || !sessionId || !qrToken) {
      return sendError("Missing required fields");
    }

    var ss         = getDb();
    var tokenSheet = ss.getSheetByName("tokens");
    var data       = tokenSheet.getDataRange().getValues();
    var tokenRow   = -1;

    // Cari token (kolom 0 = qr_token)
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === qrToken) {
        tokenRow = i;
        break;
      }
    }

    if (tokenRow === -1) {
      return sendError("token_invalid");
    }

    // Cek expired (kolom 4 = expires_at)
    var expiresAt = new Date(data[tokenRow][4]);
    if (new Date() > expiresAt) {
      return sendError("token_expired");
    }

    // Cek sudah dipakai (kolom 5 = used)
    if (String(data[tokenRow][5]) === "true") {
      return sendError("token_already_used");
    }

    // Cocokkan course_id & session_id
    if (data[tokenRow][1] !== courseId || data[tokenRow][2] !== sessionId) {
      return sendError("token_invalid");
    }

    // Tandai token sebagai used
    tokenSheet.getRange(tokenRow + 1, 6).setValue("true"); // kolom F (1-indexed)

    // Simpan presensi
    var presenceSheet = ss.getSheetByName("presence");
    var presenceId    = "PR-" + String(presenceSheet.getLastRow()).padStart(4, "0");
    var recordedAt    = new Date().toISOString();

    presenceSheet.appendRow([
      presenceId,
      userId,
      deviceId,
      courseId,
      sessionId,
      qrToken,
      ts,
      recordedAt
    ]);

    return sendSuccess({
      presence_id: presenceId,
      status:      "checked_in"
    });
  } catch (err) {
    return sendError(err.message);
  }
}

// --------------- PRESENCE: STATUS ---------------

function handleGetStatus(e) {
  try {
    var userId    = e.parameter.user_id;
    var courseId   = e.parameter.course_id;
    var sessionId  = e.parameter.session_id;

    if (!userId || !courseId || !sessionId) {
      return sendError("user_id, course_id, and session_id are required");
    }

    var ss    = getDb();
    var sheet = ss.getSheetByName("presence");
    var data  = sheet.getDataRange().getValues();

    // Cari record terakhir yang cocok
    var found = null;
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][1] === userId && data[i][3] === courseId && data[i][4] === sessionId) {
        found = data[i];
        break;
      }
    }

    if (!found) {
      return sendSuccess({
        user_id:    userId,
        course_id:  courseId,
        session_id: sessionId,
        status:     "not_checked_in",
        last_ts:    null
      });
    }

    return sendSuccess({
      user_id:    userId,
      course_id:  courseId,
      session_id: sessionId,
      status:     "checked_in",
      last_ts:    found[6]
    });
  } catch (err) {
    return sendError(err.message);
  }
}

// --------------- SENSOR: ACCELEROMETER BATCH ---------------

function handleAccelBatch(e) {
  try {
    var body     = JSON.parse(e.postData.contents);
    var deviceId = body.device_id;
    var batchTs  = body.ts || new Date().toISOString();
    var samples  = body.data;

    if (!deviceId || !samples || !samples.length) {
      return sendError("device_id and data[] are required");
    }

    var ss        = getDb();
    var sheet     = ss.getSheetByName("accel");
    var recordedAt = new Date().toISOString();

    // Bangun array 2D untuk batch write
    var rows = [];
    for (var i = 0; i < samples.length; i++) {
      var s = samples[i];
      rows.push([
        deviceId,
        s.x,
        s.y,
        s.z,
        s.ts || "",
        batchTs,
        recordedAt
      ]);
    }

    // Batch write — jauh lebih cepat daripada appendRow loop
    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);

    return sendSuccess({
      device_id:     deviceId,
      samples_saved: rows.length
    });
  } catch (err) {
    return sendError(err.message);
  }
}

// --------------- SENSOR: GPS POST ---------------

function handlePostGps(e) {
  try {
    var body     = JSON.parse(e.postData.contents);
    var deviceId = body.device_id;
    var lat      = body.lat;
    var lng      = body.lng;
    var accuracy = body.accuracy || null;
    var altitude = body.altitude || null;
    var ts       = body.ts || new Date().toISOString();

    if (!deviceId || lat === undefined || lng === undefined) {
      return sendError("device_id, lat, and lng are required");
    }

    var ss         = getDb();
    var sheet      = ss.getSheetByName("gps");
    var recordedAt = new Date().toISOString();

    sheet.appendRow([deviceId, lat, lng, accuracy, altitude, ts, recordedAt]);

    return sendSuccess({ device_id: deviceId, status: "saved" });
  } catch (err) {
    return sendError(err.message);
  }
}

// --------------- SENSOR: GPS MARKER ---------------

function handleGetGpsMarker(e) {
  try {
    var deviceId = e.parameter.device_id;
    if (!deviceId) return sendError("device_id is required");

    var ss    = getDb();
    var sheet = ss.getSheetByName("gps");
    var data  = sheet.getDataRange().getValues();

    // Cari titik terakhir untuk device
    var latest = null;
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === deviceId) {
        latest = data[i];
        break;
      }
    }

    if (!latest) {
      return sendError("No GPS data found for device " + deviceId);
    }

    return sendSuccess({
      device_id: deviceId,
      lat:       latest[1],
      lng:       latest[2],
      accuracy:  latest[3],
      altitude:  latest[4],
      ts:        latest[5]
    });
  } catch (err) {
    return sendError(err.message);
  }
}

// --------------- SENSOR: GPS POLYLINE ---------------

function handleGetGpsPolyline(e) {
  try {
    var deviceId = e.parameter.device_id;
    var fromStr  = e.parameter.from;
    var toStr    = e.parameter.to;

    if (!deviceId) return sendError("device_id is required");

    var ss    = getDb();
    var sheet = ss.getSheetByName("gps");
    var data  = sheet.getDataRange().getValues();

    var fromDate = fromStr ? new Date(fromStr) : new Date(0);
    var toDate   = toStr   ? new Date(toStr)   : new Date();

    var points = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] !== deviceId) continue;
      var pointTs = new Date(data[i][5]);
      if (pointTs >= fromDate && pointTs <= toDate) {
        points.push({
          lat:      data[i][1],
          lng:      data[i][2],
          accuracy: data[i][3],
          altitude: data[i][4],
          ts:       data[i][5]
        });
      }
    }

    // Urutkan berdasarkan waktu (ascending)
    points.sort(function(a, b) {
      return new Date(a.ts) - new Date(b.ts);
    });

    return sendSuccess({
      device_id: deviceId,
      count:     points.length,
      points:    points
    });
  } catch (err) {
    return sendError(err.message);
  }
}

// --------------- FRONTEND BRIDGE ---------------

/**
 * Dipanggil dari Index.html via google.script.run
 */
function processGenerateQR(payload) {
  try {
    var courseId  = payload.course_id;
    var sessionId = payload.session_id;

    if (!courseId || !sessionId) {
      return { ok: false, error: "course_id and session_id are required" };
    }

    var token     = "TKN-" + Utilities.getUuid().substring(0, 6).toUpperCase();
    var now       = new Date();
    var expiresAt = new Date(now.getTime() + TOKEN_TTL_MS);

    var ss    = getDb();
    var sheet = ss.getSheetByName("tokens");
    sheet.appendRow([
      token,
      courseId,
      sessionId,
      now.toISOString(),
      expiresAt.toISOString(),
      "false"
    ]);

    return {
      ok: true,
      data: {
        qr_token:   token,
        expires_at: expiresAt.toISOString()
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
