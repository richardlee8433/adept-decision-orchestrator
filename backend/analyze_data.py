import pandas as pd
import numpy as np
import time
import json
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, confusion_matrix

def analyze_adept_experts(file_path="creditcard.csv"):
    if not os.path.exists(file_path):
        print(f"Error: Dataset not found at {file_path}")
        print("Please ensure 'creditcard.csv' is in the directory.")
        return

    print(f"Loading {file_path}...")
    df = pd.read_csv(file_path)
    
    # Target variable
    y = df['Class']
    X = df.drop(columns=['Class'])

    # Expert Feature Sets
    expert_features = {
        "base": X.columns.tolist(),
        "geo": [f"V{i}" for i in range(1, 9)],
        "behavior": [f"V{i}" for i in range(20, 29)] + ["Amount", "Time"]
    }

    results = {}

    for expert_name, features in expert_features.items():
        print(f"Training Expert: {expert_name}...")
        
        X_expert = X[features]
        X_train, X_test, y_train, y_test = train_test_split(
            X_expert, y, test_size=0.2, random_state=42, stratify=y
        )

        # Initialize and Train Model
        model = RandomForestClassifier(max_depth=5, n_estimators=10, random_state=42)
        model.fit(X_train, y_train)

        # Measure Inference Latency
        start_time = time.perf_counter()
        y_pred = model.predict(X_test)
        end_time = time.perf_counter()

        # Calculate Metrics
        total_time_ms = (end_time - start_time) * 1000
        avg_latency_ms = total_time_ms / len(X_test)
        
        f1 = f1_score(y_test, y_pred)
        
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0

        results[expert_name] = {
            "f1_score": round(f1, 4),
            "false_positive_rate": round(fpr, 6),
            "avg_latency_ms": round(avg_latency_ms, 6)
        }

    print("\n--- ADEPT Model Metrics (JSON Format) ---")
    print(json.dumps(results, indent=4))
    print("\nCopy the above into 'model-weighting.jsx' for realistic prototype values.")

if __name__ == "__main__":
    analyze_adept_experts()
