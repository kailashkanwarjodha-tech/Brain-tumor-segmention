export interface PythonFileDoc {
  fileName: string;
  moduleRole: string;
  description: string;
  code: string;
}

export const PYTHON_FILES: PythonFileDoc[] = [
  {
    fileName: 'app.py',
    moduleRole: 'Master Streamlit UI Dashboard',
    description: 'Interactive clinical web application with multi-panel matrix visualizers, patient selectors, threshold sliders, and training analytics.',
    code: `"""
Master Streamlit Web Application
Title: Brain Tumor Segmentation from MRI Scans Using Deep Learning
System: Deep Learning Biomedical Vision Pipeline
Execution: streamlit run app.py
"""

import os
import time
from typing import Tuple
import numpy as np
import pandas as pd
from PIL import Image
import cv2
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px

from preprocessing import (
    decode_mri_image,
    resize_spatial_normalization,
    apply_histogram_equalization,
    suppress_high_frequency_noise,
    normalize_intensity_range,
    full_preprocessing_pipeline
)
from model import UNetInferenceEngine
from segmentation import (
    apply_manual_threshold,
    apply_otsu_threshold,
    apply_morphological_refinement,
    generate_color_overlay,
    compute_lesion_spatial_statistics
)
from metrics import evaluate_segmentation_performance

st.set_page_config(
    page_title="Brain Tumor MRI Segmentation | Deep Learning U-Net",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded",
)

@st.cache_resource(show_spinner="Initializing U-Net Deep Learning Weights...")
def load_cached_inference_engine():
    return UNetInferenceEngine(weights_path="unet_brain_tumor.keras")

inference_engine = load_cached_inference_engine()

# Navigation Sidebar
with st.sidebar:
    st.markdown("### 🧠 NeuroSegment AI")
    st.caption("Brain Tumor Deep Learning AI Platform")
    selected_page = st.radio(
        "Navigation",
        [
            "Home & Overview",
            "Data Analytics & EDA",
            "U-Net Inference & Pipeline",
            "Training & Loss Curves",
            "System Performance & Evaluation",
            "About & Architecture"
        ],
        index=2
    )

if selected_page == "U-Net Inference & Pipeline":
    st.title("🔬 Clinical U-Net Inference & Multi-Panel Visualizer")
    # Multi-Panel comparative visualization:
    # [Original Scan] vs [Preprocessed Input] vs [Ground Truth] vs [Predicted Binary Mask] vs [Blended Color Overlay]
    # Interactive threshold adjustment and metric computation...
`
  },
  {
    fileName: 'preprocessing.py',
    moduleRole: 'Computer Vision Preprocessing Pipeline',
    description: 'Area interpolation spatial normalization to 128x128, cv2.equalizeHist dynamic range expansion, and 5x5 Gaussian noise suppression.',
    code: `"""
Biomedical MRI Preprocessing Module
Title: Brain Tumor Segmentation from MRI Scans Using Deep Learning
System: Biomedical Computer Vision & Deep Learning Systems
"""

from typing import Tuple, Union
import numpy as np
import cv2
from PIL import Image


def decode_mri_image(image_input: Union[str, bytes, np.ndarray, Image.Image]) -> np.ndarray:
    """Robustly decodes input into single-channel 2D uint8 grayscale array."""
    if isinstance(image_input, Image.Image):
        img_np = np.array(image_input)
    elif isinstance(image_input, (bytes, bytearray)):
        file_bytes = np.frombuffer(image_input, dtype=np.uint8)
        img_np = cv2.imdecode(file_bytes, cv2.IMREAD_UNCHANGED)
    elif isinstance(image_input, str):
        img_np = cv2.imread(image_input, cv2.IMREAD_UNCHANGED)
    else:
        img_np = image_input.copy()

    if len(img_np.shape) == 3:
        img_np = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
    return img_np


def resize_spatial_normalization(image: np.ndarray, target_shape=(128, 128)) -> np.ndarray:
    """Standardizes spatial dimensions using area interpolation to preserve edge energy."""
    return cv2.resize(image, (target_shape[1], target_shape[0]), interpolation=cv2.INTER_AREA)


def apply_histogram_equalization(image: np.ndarray) -> np.ndarray:
    """Applies global histogram equalization (cv2.equalizeHist) to expand soft-tissue contrast."""
    return cv2.equalizeHist(image)


def suppress_high_frequency_noise(image: np.ndarray, kernel_size=(5, 5), sigma=1.0) -> np.ndarray:
    """Suppresses high-frequency acquisition noise using 2D Gaussian spatial smoothing."""
    return cv2.GaussianBlur(image, ksize=kernel_size, sigmaX=sigma, sigmaY=sigma)


def normalize_intensity_range(image: np.ndarray) -> np.ndarray:
    """Maps discrete intensity levels [0, 255] onto continuous unit domain [0.0, 1.0]."""
    return image.astype(np.float32) / 255.0


def full_preprocessing_pipeline(image_input, target_shape=(128, 128), apply_clahe=False):
    """Executes the full 5-stage biomedical preprocessing workflow."""
    raw_gray = decode_mri_image(image_input)
    resized = resize_spatial_normalization(raw_gray, target_shape=target_shape)
    enhanced = apply_histogram_equalization(resized)
    denoised = suppress_high_frequency_noise(enhanced, (5, 5), 1.0)
    norm = normalize_intensity_range(denoised)
    model_input = np.expand_dims(norm, axis=(0, -1))
    return resized, denoised, model_input
`
  },
  {
    fileName: 'model.py',
    moduleRole: 'Deep Learning U-Net Architecture',
    description: 'Contracting encoder, skip-connection concatenation layers, expanding decoder, and single-channel sigmoid classification head.',
    code: `"""
U-Net Deep Convolutional Neural Network Architecture Module
Title: Brain Tumor Segmentation from MRI Scans Using Deep Learning
"""

import os
from typing import Tuple, Optional
import numpy as np

try:
    import tensorflow as tf
    from tensorflow.keras import layers, models, optimizers, backend as K
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False


def dice_coefficient(y_true, y_pred, smooth=1e-6):
    y_true_f = K.flatten(K.cast(y_true, 'float32'))
    y_pred_f = K.flatten(K.cast(y_pred, 'float32'))
    intersection = K.sum(y_true_f * y_pred_f)
    return (2.0 * intersection + smooth) / (K.sum(y_true_f) + K.sum(y_pred_f) + smooth)


def bce_dice_loss(y_true, y_pred):
    bce = tf.keras.losses.binary_crossentropy(y_true, y_pred)
    d_loss = 1.0 - dice_coefficient(y_true, y_pred)
    return bce + d_loss


def conv_block(input_tensor, num_filters: int):
    x = layers.Conv2D(num_filters, (3, 3), padding="same")(input_tensor)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.Conv2D(num_filters, (3, 3), padding="same")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    return x


def build_unet_model(input_shape=(128, 128, 1), base_filters=32, learning_rate=1e-4):
    inputs = layers.Input(shape=input_shape)

    # Contracting Encoder
    c1 = conv_block(inputs, base_filters)
    p1 = layers.MaxPooling2D((2, 2))(c1)

    c2 = conv_block(p1, base_filters * 2)
    p2 = layers.MaxPooling2D((2, 2))(c2)

    c3 = conv_block(p2, base_filters * 4)
    p3 = layers.MaxPooling2D((2, 2))(c3)

    c4 = conv_block(p3, base_filters * 8)
    p4 = layers.MaxPooling2D((2, 2))(c4)

    # Bottleneck
    b = conv_block(p4, base_filters * 16)

    # Expansive Decoder with Skip Connections
    u4 = layers.Conv2DTranspose(base_filters * 8, (2, 2), strides=(2, 2), padding="same")(b)
    cat4 = layers.Concatenate()([u4, c4])
    c5 = conv_block(cat4, base_filters * 8)

    u3 = layers.Conv2DTranspose(base_filters * 4, (2, 2), strides=(2, 2), padding="same")(c5)
    cat3 = layers.Concatenate()([u3, c3])
    c6 = conv_block(cat3, base_filters * 4)

    u2 = layers.Conv2DTranspose(base_filters * 2, (2, 2), strides=(2, 2), padding="same")(c6)
    cat2 = layers.Concatenate()([u2, c2])
    c7 = conv_block(cat2, base_filters * 2)

    u1 = layers.Conv2DTranspose(base_filters, (2, 2), strides=(2, 2), padding="same")(c7)
    cat1 = layers.Concatenate()([u1, c1])
    c8 = conv_block(cat1, base_filters)

    outputs = layers.Conv2D(1, (1, 1), activation="sigmoid")(c8)

    model = models.Model(inputs=inputs, outputs=outputs, name="Biomedical_UNet")
    model.compile(optimizer=optimizers.Adam(learning_rate=learning_rate), loss=bce_dice_loss, metrics=["accuracy", dice_coefficient])
    return model
`
  },
  {
    fileName: 'segmentation.py',
    moduleRole: 'Morphological Refinement & Alpha Overlays',
    description: "Otsu's thresholding, morphological opening/closing noise removal, and cv2.addWeighted translucent overlays.",
    code: `"""
Biomedical Segmentation Post-Processing & Overlay Module
Title: Brain Tumor Segmentation from MRI Scans Using Deep Learning
"""

from typing import Tuple
import numpy as np
import cv2


def apply_otsu_threshold(probability_map: np.ndarray) -> Tuple[np.ndarray, float]:
    """Applies Otsu's optimal binarization algorithm."""
    prob_scaled = np.clip(probability_map * 255.0, 0, 255).astype(np.uint8)
    val, mask = cv2.threshold(prob_scaled, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return mask, float(val) / 255.0


def apply_morphological_refinement(binary_mask: np.ndarray, kernel_size=3) -> np.ndarray:
    """Applies opening to remove isolated noise, and closing to seal interior cavities."""
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    opened = cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN, kernel)
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel)
    return closed


def generate_color_overlay(original_gray, binary_mask, color_bgr=(0, 0, 255), alpha=0.45):
    """Generates translucent color projection onto original scans using cv2.addWeighted."""
    base_bgr = cv2.cvtColor(original_gray, cv2.COLOR_GRAY2BGR) if len(original_gray.shape) == 2 else original_gray.copy()
    color_plane = np.zeros_like(base_bgr, dtype=np.uint8)
    color_plane[binary_mask > 0] = color_bgr

    blended = base_bgr.copy()
    idx = binary_mask > 0
    if np.any(idx):
        blended[idx] = cv2.addWeighted(color_plane, alpha, base_bgr, 1.0 - alpha, 0)[idx]

    contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(blended, contours, -1, (255, 255, 255), 2)
    return blended
`
  },
  {
    fileName: 'metrics.py',
    moduleRole: 'Quantitative Validation Engine',
    description: 'Computes Dice Similarity Coefficient (DSC), Intersection over Union (IoU), Precision, Sensitivity, and Pixel Accuracy.',
    code: `"""
Quantitative Biomedical Validation Metrics Module
Title: Brain Tumor Segmentation from MRI Scans Using Deep Learning
"""

from typing import Dict
import numpy as np


def compute_contingency_matrix(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, int]:
    t = (y_true > 0).astype(bool).flatten()
    p = (y_pred > 0).astype(bool).flatten()
    return {
        "tp": int(np.sum(t & p)),
        "fp": int(np.sum((~t) & p)),
        "fn": int(np.sum(t & (~p))),
        "tn": int(np.sum((~t) & (~p)))
    }


def dice_similarity_coefficient(y_true: np.ndarray, y_pred: np.ndarray, eps=1e-7) -> float:
    c = compute_contingency_matrix(y_true, y_pred)
    if c["tp"] == 0 and c["fp"] == 0 and c["fn"] == 0:
        return 1.0
    return float((2.0 * c["tp"] + eps) / (2.0 * c["tp"] + c["fp"] + c["fn"] + eps))


def intersection_over_union(y_true: np.ndarray, y_pred: np.ndarray, eps=1e-7) -> float:
    c = compute_contingency_matrix(y_true, y_pred)
    if c["tp"] == 0 and c["fp"] == 0 and c["fn"] == 0:
        return 1.0
    return float((c["tp"] + eps) / (c["tp"] + c["fp"] + c["fn"] + eps))
`
  },
  {
    fileName: 'requirements.txt',
    moduleRole: 'Core Dependencies',
    description: 'Pinned Python dependencies required to execute the Streamlit pipeline locally.',
    code: `streamlit>=1.32.0
tensorflow>=2.15.0
opencv-python>=4.9.0.80
numpy>=1.24.3
matplotlib>=3.8.3
scikit-learn>=1.4.1.post1
pillow>=10.2.0
plotly>=5.19.0
pandas>=2.2.1
scipy>=1.12.0
`
  },
  {
    fileName: 'README.md',
    moduleRole: 'System Documentation & Run Instructions',
    description: 'Detailed setup instructions, mathematical formulas, dataset structure, and execution commands.',
    code: `# Brain Tumor Segmentation from MRI Scans Using Deep Learning
**System**: Production Deep Learning MRI Diagnostic Platform

## Setup & Run Instructions
\`\`\`bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
\`\`\`
`
  }
];
