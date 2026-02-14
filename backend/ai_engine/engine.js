const axios = require("axios");
const { HUGGINGFACE_API_TOKEN, HUGGINGFACE_MODEL } = require("../config/env");
const { THREAT_ANALYSIS_PROMPT } = require("./prompts");

const HF_API_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`;

/**
 * Call HuggingFace Inference API with a prompt.
 */
async function callHuggingFace(prompt) {
    const response = await axios.post(
        HF_API_URL,
        { inputs: prompt, parameters: { max_new_tokens: 1024, temperature: 0.3 } },
        {
            headers: {
                Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            timeout: 120000,
        }
    );

    if (response.data && response.data[0]?.generated_text) {
        return response.data[0].generated_text;
    }

    throw new Error("Unexpected AI response format");
}

/**
 * Parse the AI response JSON from the generated text.
 */
function parseAiResponse(rawText) {
    try {
        // Extract JSON from the response (the model may include text before/after)
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                threatSummary: parsed.threatSummary || "Unable to determine threat",
                severity: ["Low", "Medium", "High", "Critical"].includes(parsed.severity)
                    ? parsed.severity
                    : "Medium",
                mitreTechnique: parsed.mitreTechnique || "N/A",
                recommendedActions: Array.isArray(parsed.recommendedActions)
                    ? parsed.recommendedActions
                    : ["Review logs manually", "Escalate to senior analyst"],
                rawResponse: rawText,
            };
        }
        throw new Error("No JSON found in response");
    } catch {
        // Fallback if JSON parsing fails
        return {
            threatSummary: rawText.substring(0, 500) || "Analysis completed — manual review required",
            severity: "Medium",
            mitreTechnique: "N/A",
            recommendedActions: ["Review raw AI output manually", "Escalate if suspicious patterns found"],
            rawResponse: rawText,
        };
    }
}

/**
 * Mock AI analysis for development/testing without HuggingFace token.
 */
function mockAnalysis(logContent) {
    const isSuspicious =
        /failed|unauthorized|denied|attack|malware|brute|exploit|injection|sudo|root/i.test(logContent);

    return {
        threatSummary: isSuspicious
            ? "Suspicious activity detected: potential unauthorized access attempt identified in logs. Multiple indicators suggest a targeted intrusion attempt with lateral movement characteristics."
            : "Standard operational log entries. No immediate threat indicators detected. Routine system activity within expected parameters.",
        severity: isSuspicious ? "High" : "Low",
        mitreTechnique: isSuspicious
            ? "T1110 - Brute Force"
            : "N/A — No malicious technique identified",
        recommendedActions: isSuspicious
            ? [
                "Immediately isolate the affected endpoint",
                "Reset credentials for the targeted accounts",
                "Enable enhanced logging for lateral movement detection",
                "Escalate to Tier 2 SOC analyst for deep-dive investigation",
                "Review firewall rules for the source IP range",
            ]
            : [
                "Continue routine monitoring",
                "No immediate action required",
                "Schedule periodic log review",
            ],
        rawResponse: "[MOCK] This is a simulated analysis. Set HUGGINGFACE_API_TOKEN for real AI analysis.",
    };
}

/**
 * Main analysis function: uses HuggingFace API if token exists, otherwise mock.
 */
async function analyzeLog(logContent) {
    if (!HUGGINGFACE_API_TOKEN) {
        console.warn("[AI Engine] No HuggingFace token configured — using mock analysis");
        return mockAnalysis(logContent);
    }

    try {
        const prompt = THREAT_ANALYSIS_PROMPT(logContent);
        const rawResponse = await callHuggingFace(prompt);
        return parseAiResponse(rawResponse);
    } catch (error) {
        console.error("[AI Engine] HuggingFace API error:", error.message);
        // Fallback to mock on API failure
        return {
            ...mockAnalysis(logContent),
            rawResponse: `[FALLBACK] API error: ${error.message}`,
        };
    }
}

module.exports = { analyzeLog };
