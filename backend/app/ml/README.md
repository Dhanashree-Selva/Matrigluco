# MatriGluco — Clinical Machine Learning Subsystem

This subsystem implements deterministic, supervised clinical risk prediction models (e.g. maternal diabetes risk).

## Directory Layout
- `artifacts/`: Versioned models, scalers, and `metadata.json` governance records.
- `inference/`: `model_loader.py`, `feature_contract.py`, `feature_mapper.py`, `feature_validator.py`, `predictor.py`, `risk_classifier.py`.
- `training/`: `dataset.py`, `preprocessing.py`, `train.py`, `evaluate.py`, `metrics.py`.

## Running Model Retraining
```bash
python -m app.ml.training.model_training
```
