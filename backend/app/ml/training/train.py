from sklearn.linear_model import LogisticRegression


def train_logistic_regression(X_train, y_train, random_state: int = 42) -> LogisticRegression:
    """Trains Logistic Regression classifier for binary diabetes outcome prediction."""
    model = LogisticRegression(random_state=random_state)
    model.fit(X_train, y_train)
    return model
