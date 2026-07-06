const { chromium } = require('playwright');

const TARGET_URL = "https://sugang.seongnam.go.kr/ilms/learning/learningDetail.do?learning_id=LEARNING_00502932";
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendTelegram(message) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text: message })
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 목록 페이지 먼저 거쳐서 세션 형성 (대기열 통과)
  await page.goto("https://sugang.seongnam.go.kr/ilms/learning/learningList.do", {
    waitUntil: "networkidle"
  });

  // 상세 페이지 이동
  await page.goto(TARGET_URL, { waitUntil: "networkidle" });

  // 버튼이 그려질 때까지 잠깐 대기
  await page.waitForTimeout(3000);

  // 렌더링된 최종 HTML 가져오기
  const content = await page.content();

  const isFull = content.includes("정원을 초과했습니다");
  console.log("isFull:", isFull);
  console.log("대기자신청 포함:", content.includes("대기자신청"));

  // 만석이 아니면 알림
  if (!isFull) {
    await sendTelegram("🎉 자리 났습니다! 지금 바로 신청하세요 👇\n" + TARGET_URL);
    console.log("알림 발송!");
  }

  await browser.close();
})();