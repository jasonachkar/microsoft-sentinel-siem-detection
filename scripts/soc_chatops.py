import json
import logging
import os
import urllib.request

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def send_to_soc_channel(incident_id, severity, summary, ai_analysis):
    """
    Pushes an actionable alert to the SOC Slack or Teams channel.
    """
    logging.info("Initiating ChatOps webhook for Incident %s.", incident_id)

    webhook_url = os.getenv("SOC_WEBHOOK_URL")
    if not webhook_url:
        logging.warning("No SOC_WEBHOOK_URL found. Simulating ChatOps output to stdout.")

    chat_payload = {
        "text": f"New {severity} Severity Incident Detected",
        "attachments": [
            {
                "color": "#ff0000" if severity.upper() == "HIGH" else "#ffcc00",
                "fields": [
                    {"title": "Incident ID", "value": incident_id, "short": True},
                    {"title": "Summary", "value": summary, "short": False},
                    {"title": "AI Copilot Analysis", "value": ai_analysis, "short": False},
                ],
                "actions": [
                    {"type": "button", "text": "Isolate Host (SOAR)", "style": "danger", "value": "isolate"},
                    {"type": "button", "text": "View in Sentinel", "style": "primary", "value": "investigate"},
                ],
            }
        ],
    }

    if webhook_url:
        req = urllib.request.Request(
            webhook_url,
            data=json.dumps(chat_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        urllib.request.urlopen(req, timeout=10)

    print("\n" + "=" * 50)
    print("[CHATOPS ALERT DISPATCHED TO #soc-alerts]")
    print(json.dumps(chat_payload, indent=2))
    print("=" * 50 + "\n")


if __name__ == "__main__":
    send_to_soc_channel(
        "INC-98234",
        "High",
        "Suspicious PowerShell Encoded Command on vm-honeypot-01",
        "94% Malicious Confidence. Matches T1059.001. Recommend immediate isolation.",
    )
