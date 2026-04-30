from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_tier1_r001():
    # Amount > 2500 and IP != BIN
    payload = {
        "tx": {
            "id": "TX-101",
            "amount": 3000.0,
            "merchant_name": "Apple Store",
            "merchant_mcc": "5732",
            "ip_country": "US",
            "bin_country": "UK"
        },
        "features": {
            "velocity_tx_per_hour": 5,
            "device_first_seen_hours": 240,
            "risk_composite_score": 0.1
        },
        "strategy": {
            "weights": {
                "base": 40.0,
                "geo": 30.0,
                "behavior": 30.0
            }
        }
    }
    response = client.post("/v1/decision", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "STEP-UP"
    assert "R-001" in [p["step"] for p in data["path"]]
    assert data["path"][0]["match"] is True

def test_tier1_r002():
    # Velocity > 12
    payload = {
        "tx": {
            "id": "TX-102",
            "amount": 100.0,
            "merchant_name": "Starbucks",
            "merchant_mcc": "5812",
            "ip_country": "US",
            "bin_country": "US"
        },
        "features": {
            "velocity_tx_per_hour": 15,
            "device_first_seen_hours": 10,
            "risk_composite_score": 0.5
        },
        "strategy": {
            "weights": {
                "base": 40.0,
                "geo": 30.0,
                "behavior": 30.0
            }
        }
    }
    response = client.post("/v1/decision", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "DECLINE"
    assert data["path"][1]["step"] == "R-002"
    assert data["path"][1]["match"] is True

def test_tier2_ai():
    # Should fall through to Tier 2
    payload = {
        "tx": {
            "id": "TX-103",
            "amount": 500.0,
            "merchant_name": "Amazon",
            "merchant_mcc": "5311",
            "ip_country": "DE",
            "bin_country": "DE"
        },
        "features": {
            "velocity_tx_per_hour": 2,
            "device_first_seen_hours": 500,
            "risk_composite_score": 0.05
        },
        "strategy": {
            "weights": {
                "base": 50.0,
                "geo": 25.0,
                "behavior": 25.0
            }
        }
    }
    response = client.post("/v1/decision", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] in ["APPROVE", "REVIEW", "DECLINE"]
    assert data["path"][2]["step"] == "TIER-2-AI"
    assert data["path"][2]["match"] is True
    assert "hash" in data

if __name__ == "__main__":
    test_tier1_r001()
    test_tier1_r002()
    test_tier2_ai()
    print("All tests passed!")
