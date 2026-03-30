import joblib
import os
import shutil

def setup_model():
    """Setup the trained model for the backend"""
    
    # Paths
    source_model = os.path.join(os.path.dirname(__file__), 'triage_model.pkl')
    target_dir = os.path.join(os.path.dirname(__file__), 'models')
    target_model = os.path.join(target_dir, 'triage_model.pkl')
    
    print("="*50)
    print("MODEL SETUP SCRIPT")
    print("="*50)
    
    # Check if source model exists
    if not os.path.exists(source_model):
        print(f"\n❌ Source model not found at: {source_model}")
        print("\nPlease place your triage_model.pkl file in the ai-model folder.")
        return False
    
    # Create models directory if it doesn't exist
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        print(f"\n✅ Created models directory: {target_dir}")
    
    # Copy model to target location
    try:
        shutil.copy2(source_model, target_model)
        print(f"\n✅ Model copied to: {target_model}")
        
        # Verify the copy
        if os.path.exists(target_model):
            size = os.path.getsize(target_model)
            print(f"   File size: {size} bytes")
    except Exception as e:
        print(f"\n❌ Error copying model: {str(e)}")
        return False
    
    # Test loading the model
    try:
        print("\nTesting model loading...")
        model = joblib.load(target_model)
        print("✅ Model loaded successfully!")
        
        # Show model info
        print(f"\nModel type: {type(model).__name__}")
        if hasattr(model, 'named_steps'):
            print("Pipeline components:")
            for name, component in model.named_steps.items():
                print(f"  - {name}: {type(component).__name__}")
        
        print("\n✅ Setup complete!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error loading model: {str(e)}")
        return False

if __name__ == "__main__":
    success = setup_model()
    
    if success:
        print("\n🎉 Model is ready for use with the backend!")
    else:
        print("\n❌ Setup failed. Please check the errors above.")