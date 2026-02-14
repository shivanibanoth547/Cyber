/**
 * Structured prompt templates for LLaMA 2 threat analysis.
 */

const THREAT_ANALYSIS_PROMPT = (logContent) => `[INST] <<SYS>>
You are an expert cybersecurity analyst working in a Security Operations Center (SOC).
Analyze the following security log and provide a structured threat assessment.
You MUST respond in valid JSON format with the following fields:
- threatSummary: A concise summary of the threat identified (string)
- severity: One of "Low", "Medium", "High", "Critical" (string)
- mitreTechnique: The most relevant MITRE ATT&CK technique ID and name (string, e.g. "T1059 - Command and Scripting Interpreter")
- recommendedActions: An array of specific remediation steps (array of strings)
<</SYS>>

Analyze this security log:

${logContent}

Respond with ONLY a valid JSON object. [/INST]`;

const INCIDENT_SUMMARY_PROMPT = (analysisData) => `[INST] <<SYS>>
You are writing an incident report for a SOC team.
Summarize the following threat analysis into a professional incident report paragraph.
<</SYS>>

Threat Summary: ${analysisData.threatSummary}
Severity: ${analysisData.severity}
MITRE Technique: ${analysisData.mitreTechnique}
Actions: ${analysisData.recommendedActions?.join(", ")}

Write a professional incident report summary. [/INST]`;

module.exports = { THREAT_ANALYSIS_PROMPT, INCIDENT_SUMMARY_PROMPT };
