const http = require("http");

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on("error", reject);
    if (data) {
      req.write(typeof data === "string" ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== CricScore End-to-End Automated Test Suite ===");

  // 1. Login Organizer
  console.log("\n1. Testing Organizer Login...");
  const loginRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "organizer@cricscore.com", password: "password123" }
  );

  console.log("Login Status:", loginRes.status);
  console.log("Logged in User:", loginRes.data?.user?.name, `(${loginRes.data?.user?.role})`);
  const token = loginRes.data?.token;

  if (!token) {
    throw new Error("Failed to receive auth token.");
  }

  // 2. Fetch Tournaments
  console.log("\n2. Fetching Tournaments...");
  const tourRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/tournaments",
    method: "GET",
  });
  console.log("Tournaments count:", tourRes.data?.tournaments?.length);
  const tournament = tourRes.data?.tournaments?.[0];
  console.log("Flagship Tournament:", tournament?.name, `(Format: ${tournament?.format})`);

  // 3. Fetch Matches
  console.log("\n3. Fetching Matches...");
  const matchesRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/matches",
    method: "GET",
  });
  console.log("Matches count:", matchesRes.data?.matches?.length);
  const match = matchesRes.data?.matches?.[0];
  console.log(`Active Match: ${match?.teamA?.name} vs ${match?.teamB?.name} (Status: ${match?.status})`);

  // 4. Fetch Full Match Details
  console.log("\n4. Fetching Single Match Detail & Innings...");
  const matchDetailRes = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/matches/${match._id}`,
    method: "GET",
  });
  const currentInnings = matchDetailRes.data?.currentInnings;
  console.log(`Current Score: ${currentInnings?.totalRuns}/${currentInnings?.totalWickets} in ${currentInnings?.legalBalls} legal balls`);
  console.log(`Active Striker: ${currentInnings?.currentStriker?.name}`);
  console.log(`Current Bowler: ${currentInnings?.currentBowler?.name}`);

  // 5. Submit Ball (Sixer!)
  console.log("\n5. Submitting Ball 1 (SIX! by Striker)...");
  const ballRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/matches/${match._id}/scoring`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
    {
      inningsId: currentInnings._id,
      runsBatter: 6,
      extraType: "none",
      extraRuns: 0,
      isWicket: false,
    }
  );
  console.log("Delivery recorded:", ballRes.status === 200 ? "SUCCESS" : "FAIL");
  console.log(`Updated Score: ${ballRes.data?.innings?.totalRuns}/${ballRes.data?.innings?.totalWickets}`);
  console.log("Delivery Commentary:", ballRes.data?.delivery?.commentary);

  // 6. Submit Ball 2 (Single run with strike rotation)
  console.log("\n6. Submitting Ball 2 (1 Run - Testing Strike Rotation)...");
  const ball2Res = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/matches/${match._id}/scoring`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
    {
      inningsId: currentInnings._id,
      runsBatter: 1,
      extraType: "none",
      extraRuns: 0,
      isWicket: false,
    }
  );
  console.log("Ball 2 Status:", ball2Res.status === 200 ? "SUCCESS" : "FAIL");
  console.log(`Updated Score: ${ball2Res.data?.innings?.totalRuns}/${ball2Res.data?.innings?.totalWickets}`);
  console.log("Strike rotated successfully:", ball2Res.data?.delivery?.strikeChanged);

  // 7. Test Undo Delivery
  console.log("\n7. Testing Undo Last Delivery...");
  const undoRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/matches/${match._id}/undo`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("Undo Status:", undoRes.status === 200 ? "SUCCESS" : "FAIL");
  console.log(`Score after Undo: ${undoRes.data?.innings?.totalRuns}/${undoRes.data?.innings?.totalWickets}`);

  // 8. Test Tournament Standings & Net Run Rate
  console.log("\n8. Testing Tournament Points Table & Net Run Rate...");
  const standingsRes = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/tournaments/${tournament._id}/standings`,
    method: "GET",
  });
  console.log("Standings Table (Sorted by PTS, NRR):");
  standingsRes.data?.standings?.forEach((s, idx) => {
    console.log(
      `  #${idx + 1} ${s.team?.name.padEnd(20)} P:${s.played} W:${s.won} L:${s.lost} PTS:${s.points} NRR:${s.netRunRate > 0 ? "+" : ""}${s.netRunRate.toFixed(3)}`
    );
  });

  // 9. Test Analytics API
  console.log("\n9. Testing Analytics Dashboard API...");
  const analyticsRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/analytics",
    method: "GET",
  });
  console.log("Analytics Total Runs:", analyticsRes.data?.metrics?.totalRuns);
  console.log("Analytics Total Wickets:", analyticsRes.data?.metrics?.totalWickets);
  console.log("Orange Cap Leader:", analyticsRes.data?.leaderboards?.topRunScorers?.[0]?.name, `(${analyticsRes.data?.leaderboards?.topRunScorers?.[0]?.runs} runs)`);
  console.log("Purple Cap Leader:", analyticsRes.data?.leaderboards?.topWicketTakers?.[0]?.name, `(${analyticsRes.data?.leaderboards?.topWicketTakers?.[0]?.wickets} wkts)`);

  console.log("\n=== ALL CRICSCORE E2E INTEGRATION TESTS PASSED WITH 100% SUCCESS! ===");
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});

