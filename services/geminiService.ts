
import { GoogleGenAI, Type } from "@google/genai";
import { MindMapNode, Lesson } from "../types";

export const geminiService = {
  async extractLessonsFromText(text: string): Promise<Lesson[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Phân tích văn bản mục lục sau và trích xuất danh sách các tiêu đề bài học hoặc chương. Trả về một mảng JSON các đối tượng có thuộc tính 'title'.
      
      Văn bản:
      ${text.substring(0, 4000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
            },
            required: ["title"]
          }
        }
      }
    });

    try {
      const data = JSON.parse(response.text || '[]');
      return data.map((item: any, index: number) => ({
        id: `lesson-${index}`,
        title: item.title
      }));
    } catch (e) {
      console.error("Failed to parse lessons", e);
      return [];
    }
  },

  async generateMindMap(title: string, context: string, isFullCourse: boolean = false): Promise<MindMapNode> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = isFullCourse 
      ? `Bạn là một chuyên gia tư duy hệ thống. Hãy tạo một sơ đồ tư duy TỔNG QUÁT cho toàn bộ tài liệu học tập dựa trên danh sách các bài học này: ${context}.
         Yêu cầu:
         1. Nút gốc (Root) là tên chung của tài liệu.
         2. Các nhánh cấp 1 phải là các CHỦ ĐỀ LỚN hoặc CỤM KIẾN THỨC.
         3. Các bài học cụ thể sẽ là nhánh con của các chủ đề lớn đó.
         4. Mỗi nút cần có 'label' ngắn gọn và 'description' tóm tắt ý nghĩa giáo dục của nhánh đó.
         5. Tạo ra sự liên kết logic giữa các phần.`
      : `Bạn là một chuyên gia giáo dục. Hãy tạo một sơ đồ tư duy CHI TIẾT cho bài học: "${title}".
         Dựa trên ngữ cảnh: ${context.substring(0, 5000)}.
         Yêu cầu:
         1. Nút gốc là tiêu đề bài học.
         2. Phân tách thành các khái niệm chính, định nghĩa, và ứng dụng.
         3. Mỗi nút cần có 'label' sinh động và 'description' giải thích chi tiết kiến thức đó.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            label: { type: Type.STRING },
            description: { type: Type.STRING },
            children: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  children: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { 
                        id: { type: Type.STRING }, 
                        label: { type: Type.STRING },
                        description: { type: Type.STRING }
                      } 
                    } 
                  }
                }
              }
            }
          },
          required: ["id", "label"]
        }
      }
    });

    try {
      const text = response.text;
      if (!text) throw new Error("No text returned from Gemini");
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse mind map", e);
      return { id: 'root', label: title, description: "Không thể tạo nội dung chi tiết", children: [] };
    }
  }
};
