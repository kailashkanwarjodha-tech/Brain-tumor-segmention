"""
Biomedical Segmentation Post-Processing & Overlay Module
Title: Brain Tumor Segmentation from MRI Scans Using Deep Learning
System: Biomedical Computer Vision & Deep Learning Systems
"""

from typing import Tuple, Optional
import numpy as np
import cv2


def apply_otsu_threshold(probability_map: np.ndarray) -> Tuple[np.ndarray, float]:
    """
    Applies Otsu's optimal global binarization algorithm to automatically separate
    foreground lesion probabilities from background brain parenchyma.

    Args:
        probability_map: 2D float array with values normalized in [0.0, 1.0].

    Returns:
        Tuple containing:
            - binary_mask (np.ndarray): 2D uint8 mask (0 or 255).
            - optimal_thresh (float): Computed optimal threshold normalized in [0.0, 1.0].
    """
    prob_scaled = np.clip(probability_map * 255.0, 0, 255).astype(np.uint8)
    thresh_val, binary_mask = cv2.threshold(prob_scaled, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return binary_mask, float(thresh_val) / 255.0


def apply_manual_threshold(probability_map: np.ndarray, threshold: float = 0.5) -> np.ndarray:
    """
    Binarizes continuous probability predictions using an interactive user-defined threshold cutoff.

    Args:
        probability_map: 2D float array in [0.0, 1.0].
        threshold: Scalar decision boundary in (0.0, 1.0). Default is 0.5.

    Returns:
        np.ndarray: Binary mask in uint8 where foreground is 255 and background is 0.
    """
    binary = np.zeros_like(probability_map, dtype=np.uint8)
    binary[probability_map >= threshold] = 255
    return binary


def apply_morphological_refinement(
    binary_mask: np.ndarray,
    kernel_size: int = 3,
    iterations: int = 1
) -> np.ndarray:
    """
    Cleans binarized lesion boundaries using morphological operations:
    1. Morphological Opening (Erosion followed by Dilation) to sever thin bridges and remove isolated specks.
    2. Morphological Closing (Dilation followed by Erosion) to seal small intra-tumoral cavities and holes.

    Args:
        binary_mask: 2D uint8 array (0 or 255).
        kernel_size: Size of elliptical structuring element.
        iterations: Repetition passes for opening/closing.

    Returns:
        np.ndarray: Refined 2D uint8 binary mask.
    """
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    # Opening removes false-positive speckle noise
    opened = cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN, kernel, iterations=iterations)
    # Closing bridges interior necrosis holes
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel, iterations=iterations)
    return closed


def generate_color_overlay(
    original_gray: np.ndarray,
    binary_mask: np.ndarray,
    color_bgr: Tuple[int, int, int] = (0, 0, 255),  # Default pure Red in BGR
    alpha: float = 0.45,
    draw_contours: bool = True,
    contour_thickness: int = 2
) -> np.ndarray:
    """
    Creates an alpha-blended clinical visualization by projecting translucent colored
    lesion masks onto original anatomical MRI grayscale scans using cv2.addWeighted.

    Formula:
        Output = (alpha * Mask_Color) + ((1 - alpha) * Original_Scan) + gamma

    Args:
        original_gray: Single-channel uint8 2D array of original MRI.
        binary_mask: Single-channel uint8 2D mask (255 for tumor, 0 for background).
        color_bgr: Color tuple in (Blue, Green, Red) format. Default is Red (0, 0, 255).
        alpha: Foreground mask opacity weighting in range [0.0, 1.0].
        draw_contours: Boolean indicating whether to highlight tumor perimeter border.
        contour_thickness: Line thickness for contour boundary.

    Returns:
        np.ndarray: 3-channel BGR uint8 image of dimension (H, W, 3).
    """
    # Convert grayscale base scan into 3-channel BGR image
    if len(original_gray.shape) == 2:
        base_bgr = cv2.cvtColor(original_gray, cv2.COLOR_GRAY2BGR)
    else:
        base_bgr = original_gray.copy()

    # Create solid color plane matching mask geometry
    color_plane = np.zeros_like(base_bgr, dtype=np.uint8)
    color_plane[binary_mask > 0] = color_bgr

    # Perform linear weighted projection
    blended = base_bgr.copy()
    mask_indices = binary_mask > 0

    if np.any(mask_indices):
        blended[mask_indices] = cv2.addWeighted(
            color_plane, alpha, base_bgr, 1.0 - alpha, 0
        )[mask_indices]

    # Draw crisp contour delineation if requested
    if draw_contours and np.any(mask_indices):
        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(blended, contours, -1, (255, 255, 255), contour_thickness)

    return blended


def compute_lesion_spatial_statistics(
    binary_mask: np.ndarray,
    pixel_spacing_mm: float = 1.0
) -> dict:
    """
    Extracts geometric biomarkers from segmented tumor masks.

    Args:
        binary_mask: 2D uint8 mask (0 or 255).
        pixel_spacing_mm: Real-world in-plane spatial resolution in millimeters.

    Returns:
        dict: Summary statistics including tumor pixel area, physical area (mm²),
              perimeter, centroid coordinates, and circularity metric.
    """
    tumor_pixels = int(np.sum(binary_mask > 0))
    area_mm2 = float(tumor_pixels * (pixel_spacing_mm ** 2))

    contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    perimeter_pixels = 0.0
    circularity = 0.0
    centroid = (0, 0)

    if contours:
        # Find largest contour for centroid and perimeter
        largest_cnt = max(contours, key=cv2.contourArea)
        perimeter_pixels = float(cv2.arcLength(largest_cnt, closed=True))
        m = cv2.moments(largest_cnt)
        if m["m00"] > 0:
            centroid = (int(m["m10"] / m["m00"]), int(m["m01"] / m["m00"]))
        if perimeter_pixels > 0:
            circularity = float(4 * np.pi * (cv2.contourArea(largest_cnt) / (perimeter_pixels ** 2)))

    return {
        "pixel_count": tumor_pixels,
        "physical_area_mm2": round(area_mm2, 2),
        "perimeter_pixels": round(perimeter_pixels, 2),
        "centroid_coordinates": centroid,
        "isoperimetric_circularity": round(circularity, 3),
        "has_lesion": tumor_pixels > 10
    }
