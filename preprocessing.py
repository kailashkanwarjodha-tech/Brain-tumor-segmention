"""
Biomedical MRI Preprocessing Module
Title: Brain Tumor Segmentation from MRI Scans Using Deep Learning
System: Biomedical Computer Vision & Deep Learning Systems
"""

from typing import Tuple, Union, Optional
import numpy as np
import cv2
from PIL import Image


def decode_mri_image(image_input: Union[str, bytes, np.ndarray, Image.Image]) -> np.ndarray:
    """
    Robustly decodes an MRI image from file path, byte stream, PIL Image, or NumPy array.
    Guarantees a 2D single-channel grayscale uint8 image array.

    Args:
        image_input: Input image representation (filepath, bytes, PIL.Image, or ndarray).

    Returns:
        np.ndarray: Grayscale image array with shape (H, W) and dtype uint8.

    Raises:
        ValueError: If input cannot be decoded into a valid 2D image matrix.
    """
    if isinstance(image_input, Image.Image):
        img_np = np.array(image_input)
    elif isinstance(image_input, (bytes, bytearray)):
        file_bytes = np.frombuffer(image_input, dtype=np.uint8)
        decoded = cv2.imdecode(file_bytes, cv2.IMREAD_UNCHANGED)
        if decoded is None:
            raise ValueError("Failed to decode raw byte stream into image.")
        img_np = decoded
    elif isinstance(image_input, str):
        loaded = cv2.imread(image_input, cv2.IMREAD_UNCHANGED)
        if loaded is None:
            raise ValueError(f"Unable to read image from path: {image_input}")
        img_np = loaded
    elif isinstance(image_input, np.ndarray):
        img_np = image_input.copy()
    else:
        raise ValueError(f"Unsupported image input type: {type(image_input)}")

    # Ensure 8-bit unsigned integer range [0, 255]
    if img_np.dtype != np.uint8:
        if np.max(img_np) > 1.0:
            img_np = np.clip(img_np, 0, 255).astype(np.uint8)
        else:
            img_np = np.clip(img_np * 255.0, 0, 255).astype(np.uint8)

    # Convert RGB/RGBA multi-channel color profiles into single-channel grayscale
    if len(img_np.shape) == 3:
        channels = img_np.shape[2]
        if channels == 4:
            img_np = cv2.cvtColor(img_np, cv2.COLOR_BGRA2GRAY)
        elif channels == 3:
            img_np = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
        elif channels == 1:
            img_np = img_np.squeeze(-1)
        else:
            img_np = img_np[:, :, 0]

    return img_np


def resize_spatial_normalization(
    image: np.ndarray, target_shape: Tuple[int, int] = (128, 128)
) -> np.ndarray:
    """
    Standardizes spatial dimensions to uniform height and width using area interpolation.
    Area interpolation preserves energy and reduces aliasing artifacts during downsampling.

    Args:
        image: Single-channel 2D uint8 image array.
        target_shape: (height, width) target dimensions. Default is (128, 128).

    Returns:
        np.ndarray: Resized 2D image of dimension target_shape.
    """
    target_w, target_h = target_shape[1], target_shape[0]
    return cv2.resize(image, (target_w, target_h), interpolation=cv2.INTER_AREA)


def apply_histogram_equalization(image: np.ndarray) -> np.ndarray:
    """
    Applies global histogram equalization (cv2.equalizeHist) to expand dynamic contrast
    range across low-intensity anatomical soft tissues in brain MRI.

    Args:
        image: Single-channel uint8 2D array.

    Returns:
        np.ndarray: Contrast-enhanced uint8 2D array.
    """
    if image.dtype != np.uint8:
        image = np.clip(image, 0, 255).astype(np.uint8)
    return cv2.equalizeHist(image)


def suppress_high_frequency_noise(
    image: np.ndarray, kernel_size: Tuple[int, int] = (5, 5), sigma: float = 1.0
) -> np.ndarray:
    """
    Suppresses high-frequency Rician and Gaussian acquisition noise from MRI receiver coils
    using 2D Gaussian spatial smoothing.

    Args:
        image: 2D uint8 array.
        kernel_size: Gaussian kernel window dimensions (must be odd integers).
        sigma: Standard deviation along both coordinate axes.

    Returns:
        np.ndarray: Noise-suppressed 2D uint8 array.
    """
    return cv2.GaussianBlur(image, ksize=kernel_size, sigmaX=sigma, sigmaY=sigma)


def normalize_intensity_range(image: np.ndarray) -> np.ndarray:
    """
    Maps discrete intensity levels [0, 255] onto continuous unit interval [0.0, 1.0]
    required for neural network forward-pass activation stability.

    Args:
        image: 2D or 3D uint8 image array.

    Returns:
        np.ndarray: Float32 array with elements strictly bounded in [0.0, 1.0].
    """
    return image.astype(np.float32) / 255.0


def full_preprocessing_pipeline(
    image_input: Union[str, bytes, np.ndarray, Image.Image],
    target_shape: Tuple[int, int] = (128, 128),
    apply_clahe: bool = False
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Executes the complete end-to-end biomedical preprocessing workflow.

    Pipeline Stages:
        1. Decode raw input & enforce single-channel grayscale (uint8).
        2. Spatial resampling to uniform target resolution (128x128) via INTER_AREA.
        3. Dynamic range contrast normalization via cv2.equalizeHist (or CLAHE).
        4. Gaussian noise reduction (5x5 kernel, sigma=1.0).
        5. Continuous numerical scaling to float32 domain [0, 1] with channel dim (128, 128, 1).

    Args:
        image_input: Filepath, byte buffer, or image array.
        target_shape: Spatial tuple (height, width).
        apply_clahe: Optional boolean to toggle CLAHE vs standard equalizeHist.

    Returns:
        Tuple containing:
            - original_resized (np.ndarray): Unaltered resized image in uint8 [0, 255].
            - preprocessed_vis (np.ndarray): Enhanced 2D display image in uint8 [0, 255].
            - model_input (np.ndarray): 4D batch tensor of shape (1, H, W, 1) in float32 [0, 1].
    """
    # Stage 1: Decode
    raw_gray = decode_mri_image(image_input)

    # Stage 2: Spatial Normalization
    resized = resize_spatial_normalization(raw_gray, target_shape=target_shape)

    # Stage 3: Contrast Enhancement
    if apply_clahe:
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        contrast_enhanced = clahe.apply(resized)
    else:
        contrast_enhanced = apply_histogram_equalization(resized)

    # Stage 4: Noise Suppression
    denoised = suppress_high_frequency_noise(contrast_enhanced, kernel_size=(5, 5), sigma=1.0)

    # Stage 5: Intensity Normalization to [0, 1]
    norm_continuous = normalize_intensity_range(denoised)

    # Prepare model input batch: (1, 128, 128, 1)
    model_input = np.expand_dims(norm_continuous, axis=(0, -1))

    return resized, denoised, model_input
