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
 * Detect if input is a conversational message rather than security logs.
 */
function isConversational(text) {
    const trimmed = text.trim().toLowerCase();
    // Short messages (< 40 chars) without log-like patterns
    const logPatterns = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|sshd|httpd|failed password|EventID|HTTP\/|port \d+|\[\d{2}\/\w{3}\/\d{4}|^\w{3}\s+\d{1,2}\s+\d{2}:\d{2}/im;
    const greetings = /^(hi|hello|hey|yo|sup|what's up|who are you|how are you|thanks|thank you|ok|yes|no|help|bye|good morning|good evening|what can you do)/i;

    if (greetings.test(trimmed)) return true;
    if (trimmed.length < 50 && !logPatterns.test(trimmed)) return true;
    return false;
}

/**
 * Return a conversational response when user sends non-log input.
 */
function conversationalResponse(text) {
    const trimmed = text.trim().toLowerCase();
    let reply = "";

    if (/who are you|what are you|what can you do|help/i.test(trimmed)) {
        reply = "I'm the SOC AI Assistant — your cybersecurity copilot. I analyze security logs, detect threats, map them to MITRE ATT&CK techniques, and recommend actions. Paste some log data (SSH, Apache, Windows Event, firewall, etc.) and I'll break it down for you.";
    } else if (/hi|hello|hey|yo|sup|good morning|good evening/i.test(trimmed)) {
        reply = "Hey! 👋 I'm your SOC AI Assistant. Paste security logs here and I'll analyze them for threats, severity, and recommended actions. You can also try the quick action buttons below!";
    } else if (/thanks|thank you/i.test(trimmed)) {
        reply = "You're welcome! Let me know if you need more log analysis. Stay secure! 🛡️";
    } else {
        reply = "I'm built for security log analysis. Try pasting SSH logs, Apache access logs, Windows Event logs, or firewall logs — and I'll detect threats and recommend actions.";
    }

    return {
        threatSummary: reply,
        severity: "Info",
        mitreTechnique: null,
        recommendedActions: null,
        rawResponse: "[CHAT] Conversational response — no log analysis performed.",
        isConversational: true,
    };
}

/**
 * Mock AI analysis for development/testing without HuggingFace token.
 */
function mockAnalysis(logContent) {
    // Handle non-log conversational messages
    if (isConversational(logContent)) {
        return conversationalResponse(logContent);
    }

    const isSuspicious =
        /failed|unauthorized|denied|attack|malware|brute|exploit|injection|sudo|root|shell\.php|passwd|powershell.*-enc|net\s+user/i.test(logContent);

    const isCritical =
        /shell\.php|powershell.*-enc|net\s+user.*\/add|rm\s+-rf|mkfifo|reverse.*shell|base64.*decode/i.test(logContent);

    return {
        threatSummary: isCritical
            ? "CRITICAL: Active intrusion detected. Indicators of command execution, reverse shells, or privilege escalation found. Immediate incident response required."
            : isSuspicious
                ? "Suspicious activity detected: potential unauthorized access attempt identified in logs. Multiple indicators suggest a targeted intrusion attempt with lateral movement characteristics."
                : "Standard operational log entries. No immediate threat indicators detected. Routine system activity within expected parameters.",
        severity: isCritical ? "Critical" : isSuspicious ? "High" : "Low",
        mitreTechnique: isCritical
            ? "T1059 - Command and Scripting Interpreter"
            : isSuspicious
                ? "T1110 - Brute Force"
                : "N/A — No malicious technique identified",
        recommendedActions: isCritical
            ? [
                "IMMEDIATELY isolate the affected endpoint from the network",
                "Capture memory dump and disk image for forensic analysis",
                "Reset ALL credentials for affected accounts",
                "Review network traffic for C2 communication patterns",
                "Escalate to Incident Response team — Severity P1",
            ]
            : isSuspicious
                ? [
                    "Isolate the affected endpoint for investigation",
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
