import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateConstructionImage(
  prompt: string, 
  size: "1K" | "2K" | "4K" = "1K",
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" = "16:9"
) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `High-fidelity architectural and engineering visualization: ${prompt}. Professional BIM (Building Information Modeling) style, functional layout, detailed electrical and mechanical conduits, realistic construction site or finished commercial interior, 8k resolution, photorealistic.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: size
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
}

export async function getAgenticPathAdvice(constraints: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a Functional 3D AI for construction, suggest an optimal pathing strategy for the following constraints: ${constraints}. Provide technical BIM-compatible advice.`
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Text Gen Error:", error);
    return "Optimizing routing algorithm based on proximity and structural integrity...";
  }
}

export async function getStructuralAnalysis(violations: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a Structural Analysis AI for BIM software, analyze the following violations of load-bearing members: ${violations}. 
      Explain the risk and suggest alternative MEP routing solutions that preserve structural integrity. Be technical and concise.`
    });
    return response.text;
  } catch (error) {
    console.error("Structural Analysis Error:", error);
    return "Violation detected in Sector 4B. Preserving the building core is critical. Suggest rerouting plumbing lines around the main column axis to maintain load-bearing reliability.";
  }
}
