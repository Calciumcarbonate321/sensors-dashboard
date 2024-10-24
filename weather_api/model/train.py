import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import pickle
import os

class WeatherModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()

    def generate_sample_data(self, n_samples=5000):
        """
        Generate realistic sample weather data for training.
        In production, replace this with real historical data.
        """
        np.random.seed(42)

        # Generate more realistic temperature patterns
        temperatures = np.random.normal(25, 5, n_samples)  # Mean of 25°C with SD of 5

        # Generate humidity with seasonal correlation to temperature
        base_humidity = np.random.normal(65, 15, n_samples)
        # Higher temperature generally means lower humidity
        humidity = base_humidity - (temperatures - 25) * 0.5
        humidity = np.clip(humidity, 30, 95)  # Clip to realistic range

        # Generate pressure with slight correlation to weather
        base_pressure = np.random.normal(1013, 5, n_samples)

        # Create weather patterns
        weather = []
        for i in range(n_samples):
            temp = temperatures[i]
            hum = humidity[i]
            press = base_pressure[i]

            # Logic for weather classification
            if press < 1008:  # Low pressure system
                if hum > 70:
                    weather.append('rainy')
                else:
                    weather.append('cloudy')
            elif temp > 30 and hum < 60:  # Hot and dry
                weather.append('sunny')
            elif hum > 80:  # High humidity
                weather.append('rainy')
            else:
                if np.random.rand() > 0.5:
                    weather.append('sunny')
                else:
                    weather.append('cloudy')

        data = pd.DataFrame({
            'temperature': temperatures,
            'humidity': humidity,
            'pressure': base_pressure,
            'weather': weather
        })

        return data

    def preprocess_data(self, df, is_training=True):
        """
        Preprocess the input data before training or prediction.
        """
        # Create a copy to avoid modifying the original data
        df_copy = df.copy()

        # Handle missing values if any
        df_copy = df_copy.fillna(df_copy.mean())

        # Clip values to realistic ranges
        df_copy['temperature'] = df_copy['temperature'].clip(-20, 50)
        df_copy['humidity'] = df_copy['humidity'].clip(0, 100)
        df_copy['pressure'] = df_copy['pressure'].clip(900, 1100)

        # Extract the features
        features = df_copy[['temperature', 'humidity', 'pressure']]

        # During training, fit the scaler; during prediction, use the pre-fitted scaler
        if is_training:
            scaled_features = self.scaler.fit_transform(features)  # Fit and transform during training
        else:
            scaled_features = self.scaler.transform(features)  # Only transform during inference

        return scaled_features

    def train(self):
        """
        Train the weather prediction model
        """
        print("Loading and preparing data...")
        df = self.generate_sample_data()

        # Prepare features and target
        X = df[['temperature', 'humidity', 'pressure']]
        y = df['weather']

        # Preprocess features
        X_processed = self.preprocess_data(X, is_training=True)

        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y, test_size=0.2, random_state=42
        )

        print("Training model...")
        self.model = RandomForestClassifier(
            n_estimators=200,  # More trees for better accuracy
            max_depth=15,      # Increased depth for more complex patterns
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1  # Use all available cores
        )

        # Train the model
        self.model.fit(X_train, y_train)

        # Evaluate the model
        train_accuracy = self.model.score(X_train, y_train)
        test_accuracy = self.model.score(X_test, y_test)

        print("\nModel Performance:")
        print(f"Train accuracy: {train_accuracy:.3f}")
        print(f"Test accuracy: {test_accuracy:.3f}")

        # Print detailed classification report
        y_pred = self.model.predict(X_test)
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))

        print("\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))

        # Save both the model and the scaler
        print("\nSaving model and scaler...")
        model_path = os.path.join(os.path.dirname(__file__), 'weather_model.pkl')
        with open(model_path, 'wb') as f:
            pickle.dump({'model': self.model, 'scaler': self.scaler}, f)

        print(f"Model saved to {model_path}")
        return self.model


def preprocess_data(df, is_training=False):
    """
    Utility function for preprocessing new data using the saved scaler.
    The `is_training` parameter controls whether to fit the scaler or not.
    """
    model_path = os.path.join(os.path.dirname(__file__), 'weather_model.pkl')
    with open(model_path, 'rb') as f:
        saved_objects = pickle.load(f)
        scaler = saved_objects['scaler']

    # Prepare the features
    features = df[['temperature', 'humidity', 'pressure']]

    # Scale the features using the saved scaler
    scaled_features = scaler.transform(features)
    return scaled_features


if __name__ == '__main__':
    # Train and save the model
    weather_model = WeatherModel()
    weather_model.train()
