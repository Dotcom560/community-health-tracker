import joblib
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

def test_model_loading():
    """Test loading the trained model"""
    
    # Path to your model file
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'triage_model.pkl')
    
    print(f"Looking for model at: {model_path}")
    
    if not os.path.exists(model_path):
        print(f"ERROR: Model file not found at {model_path}")
        print("Please ensure your triage_model.pkl is in the ai-model/models/ folder")
        return False
    
    try:
        # Load the model
        print("Loading model...")
        model = joblib.load(model_path)
        
        print("\n" + "="*50)
        print("MODEL LOADED SUCCESSFULLY!")
        print("="*50)
        
        # Display model information
        print(f"\nModel type: {type(model)}")
        
        # Check if it's a pipeline
        if hasattr(model, 'named_steps'):
            print("\nPipeline components:")
            for name, component in model.named_steps.items():
                print(f"  - {name}: {type(component).__name__}")
        
        # Try to get classes
        if hasattr(model, 'classes_'):
            print(f"\nModel classes: {model.classes_}")
        elif hasattr(model, 'named_steps') and 'classifier' in model.named_steps:
            classifier = model.named_steps['classifier']
            if hasattr(classifier, 'classes_'):
                print(f"\nModel classes: {classifier.classes_}")
        
        # Test prediction
        print("\n" + "="*50)
        print("TESTING PREDICTION")
        print("="*50)
        
        test_symptoms = [
            "I have fever and headache",
            "Chest pain and difficulty breathing",
            "Mild cough and runny nose"
        ]
        
        for symptoms in test_symptoms:
            print(f"\nSymptoms: {symptoms}")
            
            # Make prediction
            if hasattr(model, 'predict'):
                prediction = model.predict([symptoms])[0]
                print(f"Prediction: {prediction}")
                
                # Get probabilities if available
                if hasattr(model, 'predict_proba'):
                    probs = model.predict_proba([symptoms])[0]
                    print(f"Probabilities: {probs}")
                    if hasattr(model, 'classes_'):
                        for cls, prob in zip(model.classes_, probs):
                            print(f"  - {cls}: {prob:.3f}")
            else:
                print("Model doesn't have predict method")
        
        return True
        
    except Exception as e:
        print(f"\nERROR loading model: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_model_loading()
    
    if success:
        print("\n✅ Model test completed successfully!")
    else:
        print("\n❌ Model test failed. Please check the error above.")