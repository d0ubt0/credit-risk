from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import load_model
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Credit Risk Neural Network API")

# Setup CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define paths to artifacts
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "best_credit_risk_nn.h5")
PREPROCESSOR_PATH = os.path.join(ARTIFACTS_DIR, "preprocessor.joblib")

# Global variables for model and preprocessor
model = None
preprocessor = None

@app.on_event("startup")
def load_artifacts():
    global model, preprocessor
    try:
        model = load_model(MODEL_PATH)
        preprocessor = joblib.load(PREPROCESSOR_PATH)
        print("Model and preprocessor loaded successfully.")
    except Exception as e:
        print(f"Error loading artifacts: {e}")

class CreditApplication(BaseModel):
    last_pymnt_amnt: float = Field(..., description="Last total payment amount received")
    recoveries: float = Field(..., description="Post charge off gross recovery")
    out_prncp: float = Field(..., description="Remaining outstanding principal for total amount funded")
    int_rate: float = Field(..., description="Interest Rate on the loan")
    term: str = Field(..., description="Loan term")
    total_rec_late_fee: float = Field(..., description="Late fees received to date")
    tot_cur_bal: float = Field(..., description="Total current balance of all accounts")
    dti: float = Field(..., description="A ratio calculated using the borrower's total monthly debt payments on the total debt obligations")
    initial_list_status: str = Field(..., description="The initial listing status of the loan")
    loan_amnt: float = Field(..., description="The listed amount of the loan applied for by the borrower")

@app.post("/predict")
async def predict_credit_risk(application: CreditApplication):
    if model is None or preprocessor is None:
        raise HTTPException(status_code=500, detail="Model or preprocessor not loaded")

    # Extract data with alias to match feature names
    try:
        input_data = application.model_dump(by_alias=True)
    except AttributeError:
        # Fallback for older pydantic versions
        input_data = application.dict(by_alias=True)
        
    df = pd.DataFrame([input_data])
    
    # Preprocess the data
    try:
        processed_data = preprocessor.transform(df)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in preprocessing: {e}")
        
    # Make prediction
    try:
        prediction = model.predict(processed_data)
        probability_of_default = float(prediction[0][0])
        return {
            "probability_of_default": probability_of_default,
            "risk_class": "High Risk" if probability_of_default > 0.5 else "Low Risk",
            "features_used": list(input_data.keys())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in prediction: {e}")

@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "model_loaded": model is not None, 
        "preprocessor_loaded": preprocessor is not None
    }
