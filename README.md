# Brain Tumor Segmentation from MRI Scans Using Deep Learning
**System**: Production Biomedical Computer Vision & Deep Learning Platform  
**Architecture**: 4-Level U-Net with Skip Connections & Multi-Sequence MRI Analytics  

---

## 1. Project Overview & Clinical Objective
Gliomas, meningiomas, and pituitary tumors represent the most prevalent primary intracranial neoplasms. Accurate delineation of pathological tumor margins on Magnetic Resonance Imaging (MRI) is essential for neurosurgical resection planning, stereotactic radiotherapy, and longitudinal oncological monitoring. 

This project implements an end-to-end clinical machine learning system employing a **Symmetric Deep Convolutional U-Net Architecture** with skip-connection feature concatenation to segment brain tumors from axial MRI scans.

---

## 2. Mathematical Formulations & Validation Metrics

### A. Dice Similarity Coefficient (DSC / Sørensen–Dice Index)
$$\text{DSC} = \frac{2 \cdot |X \cap Y|}{|X| + |Y|} = \frac{2 \cdot \text{TP}}{2 \cdot \text{TP} + \text{FP} + \text{FN}}$$

### B. Intersection over Union (IoU / Jaccard Index)
$$\text{IoU} = \frac{|X \cap Y|}{|X \cup Y|} = \frac{\text{TP}}{\text{TP} + \text{FP} + \text{FN}} = \frac{\text{DSC}}{2 - \text{DSC}}$$

### C. Objective Loss Function (Hybrid BCE + Dice Loss)
$$\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{BCE}} + \mathcal{L}_{\text{Dice}} = -\frac{1}{N}\sum_{i=1}^N \left[ y_i \log(\hat{y}_i) + (1-y_i)\log(1-\hat{y}_i) \right] + \left( 1 - \frac{2\sum y_i \hat{y}_i + \epsilon}{\sum y_i + \sum \hat{y}_i + \epsilon} \right)$$

---

## 3. Modular Architecture & Project Structure
```text
├── app.py                  # Master Streamlit clinical dashboard & multi-panel visualizer
├── preprocessing.py        # OpenCV & NumPy image analytics (128x128 resize, EqualizeHist, Gaussian blur)
├── model.py                # TensorFlow/Keras U-Net architecture, skip connections, inference engine
├── segmentation.py         # Otsu thresholding, morphological opening/closing, alpha-blended overlays
├── metrics.py              # Quantitative metrics (DSC, IoU, Sensitivity, Specificity, Contingency matrix)
├── requirements.txt        # Pinned core dependencies
└── README.md               # System architecture and execution documentation
```

---

## 4. Setup & Execution Instructions

### Step 1: Clone and Initialize Python Virtual Environment
```bash
# Clone the repository
git clone <repository_url>
cd <repository_folder>

# Create a clean virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS / Linux:
source venv/bin/activate
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
```

### Step 2: Install Pinned Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Run the Streamlit Clinical Application
```bash
streamlit run app.py
```
The application will open automatically in your browser at `http://localhost:8501`.

---

## 5. Dataset Organization Layout
For training models on benchmark datasets (e.g. Figshare Brain Tumor Dataset, BraTS, or Kaggle LGG Segmentation):
```text
dataset/
├── images/
│   ├── patient_001_t1ce.png
│   ├── patient_002_t1ce.png
│   └── ...
└── masks/
    ├── patient_001_mask.png
    ├── patient_002_mask.png
    └── ...
```
