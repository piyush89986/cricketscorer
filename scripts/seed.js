const http = require("http");

async function seed() {
  console.log("Triggering CricScore database seed...");
  const options = {
    hostname: "localhost",
    port: process.env.PORT || 3000,
    path: "/api/seed",
    method: "POST",
  };

  const req = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      console.log("Seed response:", data);
    });
  });

  req.on("error", (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
}

seed();
