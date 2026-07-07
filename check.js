const { chromium } = require('playwright');

const TARGET_URL = "https://sugang.seongnam.go.kr/ilms/learning/learningDetail.do?learning_id=LEARNING_00502932";
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendTelegram(message) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text: message })
  });
  const result = await res.text();
  console.log("텔레그램 응답:", res.status, result);   // ← 추가
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("https://sugang.seongnam.go.kr/ilms/learning/learningList.do", {
    waitUntil: "networkidle"
  });
  await page.goto(TARGET_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const content = await page.content();

  const isFull = content.includes("정원을 초과했습니다");
  console.log("isFull:", isFull);

  // 만석이 아니면(자리 났으면) 알림
  if (isFull) {
    await sendTelegram("🎉 자리 났습니다! 지금 바로 신청하세요 👇\n" + TARGET_URL);
    console.log("알림 발송!");
  }

  await browser.close();
})();
