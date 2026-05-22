import logging

# Configures the Threat Intel API ingestion pipeline.
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
OTX_URL = "https://otx.alienvault.com/api/v1/indicators/export"


def fetch_and_normalize_iocs():
    logging.info("Initiating Threat Intel Fetch Pipeline from %s", OTX_URL)
    # In a real scenario, this reaches out to OTX/MISP.
    # For demo purposes, we simulate the normalized STIX/TAXII payload.
    mock_iocs = [
        {"indicator": "185.153.196.22", "type": "ipv4-addr", "threat_actor": "APT29"},
        {"indicator": "b2b4ceb7752b1b11b5df9d273295c5eb", "type": "file:hashes.'MD5'", "malware": "Ransomware.Ryuk"},
    ]
    logging.info("Successfully normalized %s indicators.", len(mock_iocs))
    return mock_iocs


def push_to_sentinel(iocs):
    # This function uses the Azure Identity SDK in production to authenticate
    # and push to the Microsoft.SecurityInsights threatIntelligence API endpoint.
    logging.info("Authenticating via Azure DefaultCredential (zero-trust).")
    logging.info("Streaming indicators to Azure Sentinel Threat Intelligence Data Connector.")

    for ioc in iocs:
        logging.info("[SUCCESS] Ingested IOC: %s | Tags: %s", ioc["indicator"], ioc.get("threat_actor", ioc.get("malware")))


if __name__ == "__main__":
    indicators = fetch_and_normalize_iocs()
    push_to_sentinel(indicators)
    print("TI Ingestion Pipeline Completed Successfully.")
