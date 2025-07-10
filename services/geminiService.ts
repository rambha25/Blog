
import { GoogleGenAI, Type } from "@google/genai";
import type { SeoData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume the key is set in the environment.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = "gemini-2.5-flash";

export const generateBlogPost = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `कृप्या इस विषय पर एक आकर्षक ब्लॉग पोस्ट लिखें: "${prompt}". पोस्ट हिंदी में होनी चाहिए, जिसमें शीर्षक और पैराग्राफ शामिल हों।`,
      config: {
        systemInstruction: "आप 'InfoBharatKa' ब्लॉग के लिए एक सहायक लेखक हैं। आपकी प्राथमिक भाषा हिंदी है। आकर्षक, सूचनात्मक और अच्छी तरह से संरचित ब्लॉग पोस्ट लिखें जो एक सामान्य भारतीय दर्शकों के लिए उपयुक्त हों। सुनिश्चित करें कि लहजा सकारात्मक और सम्मानजनक हो।",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating blog post:", error);
    return "AI से पोस्ट बनाते समय एक त्रुटि हुई। कृपया पुन: प्रयास करें।";
  }
};

export const generateSeoSuggestions = async (title: string, content: string): Promise<SeoData> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `निम्नलिखित ब्लॉग पोस्ट का विश्लेषण करें और SEO मेटाडेटा उत्पन्न करें। शीर्षक: "${title}". सामग्री: "${content.substring(0, 2000)}..."`,
            config: {
                systemInstruction: "आप एक विशेषज्ञ SEO विश्लेषक हैं। आपका कार्य हिंदी में SEO मेटाडेटा उत्पन्न करना है।",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        keywords: {
                            type: Type.ARRAY,
                            description: "ब्लॉग पोस्ट के लिए प्रासंगिक 5-7 SEO कीवर्ड की सूची।",
                            items: { type: Type.STRING },
                        },
                        metaDescription: {
                            type: Type.STRING,
                            description: "लगभग 150-160 वर्णों का एक संक्षिप्त, आकर्षक मेटा विवरण।",
                        },
                    },
                    required: ["keywords", "metaDescription"],
                },
            },
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as SeoData;
    } catch (error) {
        console.error("Error generating SEO suggestions:", error);
        return {
            keywords: ["त्रुटि"],
            metaDescription: "AI से SEO सुझाव उत्पन्न करते समय एक त्रुटि हुई।",
        };
    }
};
