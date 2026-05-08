#!/usr/bin/env python3
"""Build a tiny feature-based ONNX classifier for browser smoke testing.

Requires:
  python3 -m pip install onnx
"""

import os

import onnx
from onnx import TensorProto, helper


def make_model():
    features = helper.make_tensor_value_info("features", TensorProto.FLOAT, [1, 5])
    scores = helper.make_tensor_value_info("scores", TensorProto.FLOAT, [1, 4])

    weights = helper.make_tensor(
        "weights",
        TensorProto.FLOAT,
        [5, 4],
        [
            3.2,
            -0.5,
            1.7,
            -1.1,
            -0.3,
            3.0,
            -0.6,
            0.6,
            -1.0,
            0.2,
            -0.6,
            3.4,
            0.8,
            0.6,
            0.9,
            -1.8,
            -0.8,
            1.4,
            0.7,
            1.9,
        ],
    )
    bias = helper.make_tensor("bias", TensorProto.FLOAT, [4], [0.2, -0.1, 0.1, -0.2])

    node = helper.make_node("Gemm", ["features", "weights", "bias"], ["scores"], alpha=1.0, beta=1.0)
    graph = helper.make_graph([node], "urban_farm_tiny_classifier", [features], [scores], [weights, bias])
    model = helper.make_model(
        graph,
        producer_name="urban-farm-year",
        opset_imports=[helper.make_operatorsetid("", 13)],
    )
    onnx.checker.check_model(model)
    return model


if __name__ == "__main__":
    os.makedirs("public/models", exist_ok=True)
    onnx.save(make_model(), "public/models/plant_classifier.onnx")
