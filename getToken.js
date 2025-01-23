// Secret code and API key
const apiKey = "qa-sagar"; // Replace with your actual API key
const secretCode = "qa-sagar"; // Replace with your secret code
const workerUrl = "https://token.newtonjavacloud.workers.dev"; // Replace with your Cloudflare Worker URL

// Function to generate HMAC using Web Crypto API
async function generateHMAC(data, secretCode) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const keyBuffer = encoder.encode(secretCode);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer);
  const signatureArray = new Uint8Array(signatureBuffer);
  return Array.from(signatureArray).map(byte => byte.toString(16).padStart(2, "0")).join('');
}

// Function to fetch token from Cloudflare Worker
async function fetchToken() {
  const dataToSign = 'datasigner'; // Add the actual data to be signed (e.g., request body, URL, etc.)
  const signature = await generateHMAC(dataToSign, secretCode);

  const headers = {
    "X-API-KEY": apiKey,
    "X-Signature": signature,
  };

  try {
    const response = await fetch(workerUrl, {
      method: "GET",
      headers: headers,
    
    });

    if (!response.ok) {
      throw new Error(`Error fetching token: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.token) {
      console.log("Token received:", data.token);
      // Optionally, display the token in your page
      document.getElementById("token-display").innerText = `Token: ${data.token}`;
    } else {
      console.error("No token received");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Call the function to fetch the token when the page loads
window.onload = fetchToken;
