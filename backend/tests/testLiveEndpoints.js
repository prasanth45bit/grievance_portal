const fs = require("fs");
const path = require("path");

async function testLive() {
  const imagePath = path.resolve(__dirname, "../../frontend/build/logo192.png");
  if (!fs.existsSync(imagePath)) {
    console.log("No test image found at", imagePath);
    return;
  }

  const fileBlob = new Blob([fs.readFileSync(imagePath)], { type: "image/png" });
  const formData = new FormData();
  formData.append("image", fileBlob, "logo192.png");

  console.log("Sending logo192.png to http://127.0.0.1:5000/api/complaints/analyze-image...");
  const res = await fetch("http://127.0.0.1:5000/api/complaints/analyze-image", {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  console.log("Response status:", res.status);
  console.log("Success:", json.success);
  console.log("Message:", json.message);
  console.log("AI Data:", JSON.stringify(json.data, null, 2));
}

testLive().catch(console.error);
