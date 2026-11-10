const http = require("http");

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(dataString ? { "Content-Length": Buffer.byteLength(dataString) } : {}),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on("error", reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function run() {
  console.log("=== Testing Document Templates API Runtime ===");

  // 1. GET list
  const listRes = await request("GET", "/rest/api/templates");
  console.log("1. GET /rest/api/templates:", listRes.status, "Total count:", listRes.body.summary.total);
  if (listRes.status !== 200 || !listRes.body.success) {
    throw new Error("GET list failed");
  }

  // 2. POST with non-docx file (Should Fail)
  const failRes = await request("POST", "/rest/api/templates", {
    title: "Test File PDF Not Allowed",
    category: "proposal",
    description: "Testing rejection of non-docx",
    filename: "Document_Invalid.pdf",
    file_size: "100 KB",
  });
  console.log("2. POST with non-docx file:", failRes.status, failRes.body.message);
  if (failRes.status !== 400) {
    throw new Error("Validation should reject non-docx files!");
  }

  // 3. POST with valid .docx file (Should Succeed)
  const successRes = await request("POST", "/rest/api/templates", {
    title: "Template Riset Unggulan STMIK TIME 2026",
    category: "proposal",
    description: "Template dokumen riset unggulan dosen",
    filename: "Template_Riset_Unggulan_2026.docx",
    file_size: "185 KB",
    file_data: "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQAAAAIA...",
    version: "v2026.1",
  });
  console.log("3. POST with valid .docx file:", successRes.status, successRes.body.message);
  if (successRes.status !== 201 || !successRes.body.data.id) {
    throw new Error("POST valid docx failed!");
  }
  const createdId = successRes.body.data.id;

  // 4. GET Detail
  const detailRes = await request("GET", `/rest/api/templates/${createdId}`);
  console.log("4. GET /rest/api/templates/[id]:", detailRes.status, detailRes.body.data.title);
  if (detailRes.status !== 200 || detailRes.body.data.filename !== "Template_Riset_Unggulan_2026.docx") {
    throw new Error("GET detail failed!");
  }

  // 5. DELETE
  const deleteRes = await request("DELETE", `/rest/api/templates/${createdId}`);
  console.log("5. DELETE /rest/api/templates/[id]:", deleteRes.status, deleteRes.body.message);
  if (deleteRes.status !== 200) {
    throw new Error("DELETE failed!");
  }

  console.log("=== ALL 5 DOCUMENT TEMPLATES TESTS PASSED 100% ===");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

