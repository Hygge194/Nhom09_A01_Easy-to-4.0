const { GoogleGenerativeAI } = require('@google/generative-ai');

// Cấu hình Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ai = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
/**
 * Xử lý hàm Suggestion Slots của AI Agent
 * @param {Array} mentorSchedule - Các sự kiện hiện tại của mentor 
 * @param {Array} menteeSchedule - Các sự kiện hiện tại của mentee
 * @param {String} mentorConstraints - Sở thích của Mentor 
 * @param {String} menteeConstraints - Sở thích của Mentee
 */
const suggestSlots = async (mentorSchedule, menteeSchedule, mentorConstraints, menteeConstraints) => {
    const prompt = `
Bạn là một AI Agent điều phối lịch học cực kỳ thông minh.
Nhiệm vụ của bạn là tìm ra 3 khung giờ tối ưu nhất (mỗi khung giờ kéo dài 1 tiếng) để 1 Mentor và 1 Mentee (Học viên) có thể gặp mặt online. Phải nằm trong khung 7 ngày tới kể từ bây giờ.

CONTEXT HIỆN TẠI:
- Các sự kiện đã bận của Mentor: ${JSON.stringify(mentorSchedule)}
- Các sự kiện đã bận của Mentee: ${JSON.stringify(menteeSchedule)}

RÀNG BUỘC (Sở thích cá nhân):
- Yêu cầu từ Mentor: ${mentorConstraints || "Không có"}
- Yêu cầu từ Mentee: ${menteeConstraints || "Không có"}

HÃY TRẢ VỀ CHÍNH XÁC THEO ĐỊNH DẠNG JSON (Không có markdown block \`\`\`json, chỉ trả thuần chuỗi JSON):
[
  {
    "startTime": "YYYY-MM-DDTHH:mm:SSZ",
    "endTime": "YYYY-MM-DDTHH:mm:SSZ",
    "reason": "Giải thích ngắn gọn (bằng Tiếng Việt) tại sao khung giờ này hợp với cả 2 người dựa theo Ràng buộc."
  },
  ... (tổng cộng 3 object)
]
`;
    try {
        const result = await ai.generateContent(prompt);
        const response = await result.response; // Đợi response hoàn tất
        let textString = response.text(); // Lấy text từ response
        
        // Làm sạch chuỗi JSON phòng trường hợp AI bọc trong Markdown
        textString = textString.replace(/```json/g, "").replace(/```/g, "").trim();
        
        return JSON.parse(textString);
    } catch (error) {
        console.error("Lỗi Gemini:", error);
        throw new Error("AI đang bận, vui lòng thử lại sau.");
    }

};

module.exports = { suggestSlots };
