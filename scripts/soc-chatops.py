from soc_chatops import send_to_soc_channel


if __name__ == "__main__":
    send_to_soc_channel(
        "INC-98234",
        "High",
        "Suspicious PowerShell Encoded Command on vm-honeypot-01",
        "94% Malicious Confidence. Matches T1059.001. Recommend immediate isolation.",
    )
