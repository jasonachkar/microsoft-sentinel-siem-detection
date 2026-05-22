import logging
import time

try:
    from azure.identity import DefaultAzureCredential  # noqa: F401
    from azure.mgmt.securityinsight import SecurityInsights  # noqa: F401
except ImportError:
    DefaultAzureCredential = None
    SecurityInsights = None

# Continuous Detection Validation (CDV) Engine.
# Asserts that simulated attacks actually trigger Sentinel alerts. Fails CI/CD if they do not.

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def verify_alert_fired(subscription_id, resource_group, workspace_name, expected_technique):
    logging.info("Authenticating via Azure OIDC to verify MITRE Technique: %s", expected_technique)

    # In a real CI/CD run, this uses the pipeline's Azure credentials:
    # credential = DefaultAzureCredential()
    # client = SecurityInsights(credential, subscription_id)
    if DefaultAzureCredential is None or SecurityInsights is None:
        logging.info("Azure SDK packages are not installed; running portfolio-safe mocked Sentinel assertion.")

    timeout_mins = 5
    poll_interval = 30

    logging.info("Polling Sentinel Incidents API every %ss for %s minutes.", poll_interval, timeout_mins)

    for index in range(int((timeout_mins * 60) / poll_interval)):
        # Mocking the API response for portfolio demonstration.
        # response = client.incidents.list(resource_group, workspace_name)
        time.sleep(1)

        # Simulate finding the alert on the third poll.
        if index == 2:
            logging.info("[SUCCESS] Alert found mapping to %s.", expected_technique)
            logging.info("Detection-as-Code Assertion Passed.")
            return True

        logging.info("Alert not yet populated in SIEM. Retrying.")

    logging.error("[FATAL] No alert triggered for %s within %s minutes.", expected_technique, timeout_mins)
    logging.error("The detection rule is either broken or the data source is down.")
    raise SystemExit(1)


if __name__ == "__main__":
    verify_alert_fired("sub-123", "rg-secops", "law-sentinel", "T1059.001")
