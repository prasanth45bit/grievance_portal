const fs = require("fs");
const path = require("path");

async function testSubmitComplaintWithImage() {
  // 1. Citizen login to get JWT token
  console.log("[1] Logging in citizen anbu@gmail.com...");
  const loginRes = await fetch("http://localhost:5000/api/auth/citizen/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "anbu@gmail.com", password: "citizenpassword123" }),
  });
  const loginJson = await loginRes.json();
  if (!loginJson.success || !loginJson.data?.token) {
    throw new Error("Failed to login: " + JSON.stringify(loginJson));
  }
  const token = loginJson.data.token;
  console.log("Logged in successfully. Token acquired.");

  // 2. Prepare multipart complaint payload with image
  console.log("[2] Preparing multipart form-data complaint with test image...");
  const imagePath = path.resolve(__dirname, "../../frontend/build/logo192.png");
  const fileBlob = new Blob([fs.readFileSync(imagePath)], { type: "image/png" });

  const formData = new FormData();
  formData.append("title", "Severely Damaged Road Surface with Pothole");
  formData.append("description", "Large pothole noticed on Salem bypass highway road posing serious risk to motorists.");
  formData.append("address", "Salem Bypass Road, Junction 4");
  formData.append("districtId", "23"); // Salem
  formData.append("latitude", "11.6643");
  formData.append("longitude", "78.1460");
  formData.append("images", fileBlob, "defect_inspection.png");

  console.log("[3] Submitting complaint to POST /api/complaints...");
  const submitRes = await fetch("http://localhost:5000/api/complaints", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const submitJson = await submitRes.json();
  console.log("Submit Response Status:", submitRes.status);
  console.log("Success:", submitJson.success);
  console.log("Ticket Number:", submitJson.data?.ticket_number);
  console.log("Department Assigned:", submitJson.data?.department?.department_name);
  console.log("Images Attached:", submitJson.data?.images?.map(i => i.image_url));
  console.log("AI Analysis Category:", submitJson.data?.ai_analysis?.predicted_category);
  console.log("AI Confidence:", submitJson.data?.ai_analysis?.department_confidence);
  console.log("AI Detected Objects:", JSON.stringify(submitJson.data?.ai_analysis?.detected_objects, null, 2));

  // 4. Test public tracking endpoint for this ticket
  if (submitJson.data?.ticket_number) {
    const ticketNo = submitJson.data.ticket_number;
    console.log(`\n[4] Querying public tracking for ticket ${ticketNo}...`);
    const trackRes = await fetch(`http://localhost:5000/api/complaints/track/${encodeURIComponent(ticketNo)}`);
    const trackJson = await trackRes.json();
    console.log("Track status:", trackRes.status);
    console.log("Track ticket retrieved:", trackJson.data?.ticket_number);
    console.log("Track image count:", trackJson.data?.images?.length);
    console.log("Track AI analysis exists:", !!trackJson.data?.ai_analysis);
  }
}

testSubmitComplaintWithImage().catch(console.error);
