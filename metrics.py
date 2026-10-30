"""
Quantitative Biomedical Validation Metrics Module
Title: Brain Tumor Segmentation from MRI Scans Using Deep Learning
System: Biomedical Computer Vision & Deep Learning Systems
"""

from typing import Dict, Union
import numpy as np


def compute_contingency_matrix(
    y_true: np.ndarray, y_pred: np.ndarray
) -> Dict[str, int]:
    """
    Computes confusion matrix elements (TP, FP, FN, TN) between binary masks.

    Definitions:
        - True Positive (TP): Both ground truth and predicted model identify lesion.
        - False Positive (FP): Predicted as lesion, but ground truth is healthy background.
        - False Negative (FN): Missed lesion; ground truth has lesion, model predicts background.
        - True Negative (TN): Both ground truth and predicted agree on healthy parenchyma.

    Args:
        y_true: 2D binary ground truth mask (boolean or integers {0, 1} / {0, 255}).
        y_pred: 2D binary predicted mask (boolean or integers {0, 1} / {0, 255}).

    Returns:
        Dict[str, int]: Dictionary containing integer counts for TP, FP, FN, TN.
    """
    true_bin = (y_true > 0).astype(bool).flatten()
    pred_bin = (y_pred > 0).astype(bool).flatten()

    tp = int(np.sum(true_bin & pred_bin))
    fp = int(np.sum((~true_bin) & pred_bin))
    fn = int(np.sum(true_bin & (~pred_bin)))
    tn = int(np.sum((~true_bin) & (~pred_bin)))

    return {"tp": tp, "fp": fp, "fn": fn, "tn": tn}


def dice_similarity_coefficient(
    y_true: np.ndarray, y_pred: np.ndarray, epsilon: float = 1e-7
) -> float:
    """
    Calculates Dice Similarity Coefficient (DSC / Sørensen–Dice Index).

    Mathematical Formula:
        DSC = (2 * |X ∩ Y|) / (|X| + |Y|) = (2 * TP) / (2 * TP + FP + FN)

    Range: [0.0, 1.0], where 1.0 indicates perfect spatial agreement.
    """
    counts = compute_contingency_matrix(y_true, y_pred)
    tp, fp, fn = counts["tp"], counts["fp"], counts["fn"]

    # Handle true negative case where neither image contains tumor
    if tp == 0 and fp == 0 and fn == 0:
        return 1.0

    return float((2.0 * tp + epsilon) / (2.0 * tp + fp + fn + epsilon))


def intersection_over_union(
    y_true: np.ndarray, y_pred: np.ndarray, epsilon: float = 1e-7
) -> float:
    """
    Calculates Intersection over Union (IoU / Jaccard Index).

    Mathematical Formula:
        IoU = |X ∩ Y| / |X ∪ Y| = TP / (TP + FP + FN)

    Range: [0.0, 1.0]. Note algebraic identity: IoU = DSC / (2 - DSC).
    """
    counts = compute_contingency_matrix(y_true, y_pred)
    tp, fp, fn = counts["tp"], counts["fp"], counts["fn"]

    if tp == 0 and fp == 0 and fn == 0:
        return 1.0

    return float((tp + epsilon) / (tp + fp + fn + epsilon))


def precision_score(
    y_true: np.ndarray, y_pred: np.ndarray, epsilon: float = 1e-7
) -> float:
    """
    Calculates Positive Predictive Value (Precision).

    Mathematical Formula:
        Precision = TP / (TP + FP)
    """
    counts = compute_contingency_matrix(y_true, y_pred)
    tp, fp = counts["tp"], counts["fp"]

    if tp + fp == 0:
        return 1.0 if counts["fn"] == 0 else 0.0

    return float((tp + epsilon) / (tp + fp + epsilon))


def recall_score(
    y_true: np.ndarray, y_pred: np.ndarray, epsilon: float = 1e-7
) -> float:
    """
    Calculates Sensitivity / True Positive Rate (Recall).

    Mathematical Formula:
        Recall = TP / (TP + FN)
    """
    counts = compute_contingency_matrix(y_true, y_pred)
    tp, fn = counts["tp"], counts["fn"]

    if tp + fn == 0:
        return 1.0

    return float((tp + epsilon) / (tp + fn + epsilon))


def specificity_score(
    y_true: np.ndarray, y_pred: np.ndarray, epsilon: float = 1e-7
) -> float:
    """
    Calculates True Negative Rate (Specificity).

    Mathematical Formula:
        Specificity = TN / (TN + FP)
    """
    counts = compute_contingency_matrix(y_true, y_pred)
    tn, fp = counts["tn"], counts["fp"]

    if tn + fp == 0:
        return 1.0

    return float((tn + epsilon) / (tn + fp + epsilon))


def pixel_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    Calculates overall pixel-wise classification accuracy.

    Mathematical Formula:
        Accuracy = (TP + TN) / (TP + TN + FP + FN)
    """
    counts = compute_contingency_matrix(y_true, y_pred)
    total = counts["tp"] + counts["tn"] + counts["fp"] + counts["fn"]

    if total == 0:
        return 1.0

    return float((counts["tp"] + counts["tn"]) / total)


def evaluate_segmentation_performance(
    y_true: np.ndarray, y_pred: np.ndarray
) -> Dict[str, Union[float, Dict[str, int]]]:
    """
    Executes complete statistical evaluation returning all quantitative metrics.

    Args:
        y_true: Ground truth mask array.
        y_pred: Predicted binary mask array.

    Returns:
        Dict containing Dice, IoU, Precision, Recall, Specificity, Pixel Accuracy,
        and contingency table counts.
    """
    contingency = compute_contingency_matrix(y_true, y_pred)
    dice = dice_similarity_coefficient(y_true, y_pred)
    iou = intersection_over_union(y_true, y_pred)
    precision = precision_score(y_true, y_pred)
    recall = recall_score(y_true, y_pred)
    specificity = specificity_score(y_true, y_pred)
    accuracy = pixel_accuracy(y_true, y_pred)

    return {
        "dice_coefficient": round(dice, 4),
        "iou_jaccard": round(iou, 4),
        "precision": round(precision, 4),
        "recall_sensitivity": round(recall, 4),
        "specificity": round(specificity, 4),
        "pixel_accuracy": round(accuracy, 4),
        "confusion_matrix": contingency
    }
