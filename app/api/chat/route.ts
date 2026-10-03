import { systemInstruction } from "@/lib/chat-knowledge";

const MODEL = "gemini-3.5-flash-lite";
const MAX_TURNS = 20;
const MAX_LENGTH = 1000;

interface ChatTurn {
  from: "bot" | "user";
  text: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Chưa cấu hình GEMINI_API_KEY." }, { status: 500 });
  }

  let messages: ChatTurn[];
  try {
    ({ messages } = await request.json());
  } catch {
    return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  // Giữ mạch hội thoại: gửi các lượt gần nhất, bỏ lời chào đầu của bot (Gemini yêu cầu bắt đầu bằng lượt user).
  const contents = messages
    .slice(-MAX_TURNS)
    .map((m) => ({
      role: m.from === "user" ? "user" : "model",
      parts: [{ text: String(m.text).slice(0, MAX_LENGTH) }],
    }));
  while (contents.length && contents[0].role !== "user") contents.shift();
  if (contents.length === 0 || contents[contents.length - 1].role !== "user") {
    return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
      }),
    },
  );

  if (!res.ok) {
    console.error("Gemini error", res.status, await res.text());
    return Response.json({ error: "Không thể kết nối trợ lý lúc này." }, { status: 502 });
  }

  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();

  if (!reply) {
    return Response.json({ error: "Trợ lý chưa có câu trả lời." }, { status: 502 });
  }
  return Response.json({ reply });
}
