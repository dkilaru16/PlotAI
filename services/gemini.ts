import { GoogleGenAI, Type } from "@google/genai";
import { BylawCheck, PlanAnalysis, UserRequirements } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: Analyze the requirements and generate the logical structure of the floor plan.
 */
export const generatePlanAnalysis = async (req: UserRequirements): Promise<PlanAnalysis> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Act as a Senior Architect. Design a residential floor plan based on these requirements:
    - Country: ${req.country} (Apply local building codes/bylaws strictly)
    - Total Area: ${req.totalArea} sq ft
    - Bedrooms: ${req.rooms} (STRICTLY enforce this exact number)
    - Living Hall: ${req.hasHall ? "Yes" : "No"}
    - Kitchen: ${req.hasKitchen ? "Yes" : "No"}
    - Balcony: ${req.hasBalcony ? "Yes" : "No"}
    - Notes: ${req.additionalNotes}

    CRITICAL RULES FOR LAYOUT:
    1. EXACT BEDROOM COUNT: You must provide EXACTLY ${req.rooms} bedrooms. Do NOT add extra bedrooms even if the area is large.
    2. SURPLUS AREA: If ${req.totalArea} sq ft is generous for ${req.rooms} bedrooms, do NOT create more bedrooms. Instead, assign the extra space to:
       - A dedicated Storage Room or Pantry
       - A Utility / Laundry Room
       - A larger Living/Dining Hall
       - An Open Space / Courtyard
    3. SHAPE: The outer perimeter must be STRICTLY RECTANGULAR or SQUARE.
    4. NAMING CONVENTION: For multiple rooms of the same type, use standard architectural numbering.
       - Primary bedroom: "Master Bedroom"
       - Secondary bedrooms: "Bedroom 2", "Bedroom 3", etc.

    Output a JSON object with the following structure:
    1. "visualPrompt": A highly detailed, descriptive paragraph describing the visual layout for an image generation AI. Mention "2D architectural floor plan top view", "white background", "black walls". CRITICAL: Explicitly mention that the building perimeter must be STRICTLY RECTANGULAR or SQUARE. Do not use circular, curved, or irregular organic shapes. The layout must be orthogonal. Explicitly mention that the plan must include visible dimension lines and numeric measurements for each room (e.g., '12x14', '10x10') drawn clearly on the plan. STATE CLEARLY: "The plan features exactly ${req.rooms} bedrooms". Include furniture placements (bed, sofa, dining table), window locations, and door swings. It must be clean, professional, and look like a technical architectural blueprint.
    2. "distributionLogic": A short explanation of why the layout is arranged this way (e.g., "Placed kitchen near entrance for ventilation...").
    3. "roomDimensions": An array of objects { "name", "width", "length", "area", "notes" }.
    4. "totalUtilizedArea": Number (Sum of all room areas).
    5. "efficiencyScore": Number (0-100, representing usable space ratio).
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visualPrompt: { type: Type.STRING },
            distributionLogic: { type: Type.STRING },
            roomDimensions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  width: { type: Type.STRING },
                  length: { type: Type.STRING },
                  area: { type: Type.STRING },
                  notes: { type: Type.STRING },
                }
              }
            },
            totalUtilizedArea: { type: Type.NUMBER },
            efficiencyScore: { type: Type.NUMBER }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No data received from analysis model");
    }

    let jsonString = response.text.trim();
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        parsedData = JSON.parse(jsonString.substring(firstBrace, lastBrace + 1));
      } else {
        throw e;
      }
    }

    const utilizedArea = Number(parsedData.totalUtilizedArea) || Math.round(req.totalArea * 0.90);
    let score = Number(parsedData.efficiencyScore);
    if (!score || isNaN(score)) {
        if (utilizedArea > 0 && req.totalArea > 0) {
            score = Math.round((utilizedArea / req.totalArea) * 100);
            if (score > 100) score = 99;
        } else {
            score = 88; 
        }
    }

    return {
      visualPrompt: parsedData.visualPrompt || "A standard residential floor plan.",
      distributionLogic: parsedData.distributionLogic || "Layout based on standard practices.",
      roomDimensions: Array.isArray(parsedData.roomDimensions) ? parsedData.roomDimensions : [],
      bylawCompliance: [], // Will be filled by vision step
      totalUtilizedArea: utilizedArea,
      efficiencyScore: score
    };
  } catch (error) {
    console.error("Error generating plan analysis:", error);
    throw error;
  }
};

/**
 * Step 2: Generate the visual floor plan image.
 */
export const generatePlanImage = async (visualPrompt: string): Promise<string> => {
  const model = "gemini-2.5-flash-image";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: visualPrompt + " Render strictly as a rectangular architectural floor plan. Do not use circular shapes, do not use a circular vignette, do not use a round frame. The image must fill the rectangular canvas. High quality, blueprint aesthetic, precise lines, white background, high contrast, technical drawing with dimension lines and room labels clearly visible."
          }
        ]
      },
      config: {
        imageConfig: {
            aspectRatio: "4:3",
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("The AI model returned text but no image.");
  } catch (error) {
    console.error("Error generating plan image:", error);
    throw error;
  }
};

/**
 * Step 3: Analyze the GENERATED image for bylaw compliance using Vision.
 */
export const validatePlanWithVision = async (imageUrl: string, req: UserRequirements): Promise<BylawCheck[]> => {
  const model = "gemini-2.5-flash";

  try {
    // Extract base64 data from data URL
    const base64Data = imageUrl.split(',')[1];
    const mimeType = imageUrl.split(':')[1].split(';')[0];

    const prompt = `
      Act as a Lead Building Inspector for ${req.country}. 
      Analyze this architectural floor plan image strictly against local building codes (e.g., NBC for India, IRC/IBC for USA, Building Regs for UK).
      
      Look at the image and identify 5 specific compliance points regarding:
      1. Room Shapes & Aspect Ratios (Rectangular vs Irregular)
      2. Ventilation & Window Placement
      3. Door Swings & Egress
      4. General Circulation Space
      5. Furniture Clearance

      Output a JSON array of objects with keys: "rule" (string name of the code), "status" ("Compliant", "Warning", "Non-Compliant"), and "details" (string description of what is seen in the image).
      Make the details specific to the image provided.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
             inlineData: {
               data: base64Data,
               mimeType: mimeType
             }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              rule: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["Compliant", "Warning", "Non-Compliant"] },
              details: { type: Type.STRING }
            }
          }
        }
      }
    });

    let jsonString = response.text.trim();
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
    }

    const checks = JSON.parse(jsonString);
    return Array.isArray(checks) ? checks : [];

  } catch (error) {
    console.error("Error validating plan with vision:", error);
    // Return a fallback check if vision fails, so the app doesn't crash
    return [
      {
        rule: "Automated Visual Inspection",
        status: "Warning",
        details: "Could not complete visual verification of bylaws. Please manually review the plan."
      }
    ];
  }
};