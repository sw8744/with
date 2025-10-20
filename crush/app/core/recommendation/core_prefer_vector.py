import numpy as np
from fastapi import HTTPException
from numpy._typing import NDArray

MAX_FEATURES = 100


def process_vector(vector: list[float]) -> NDArray[np.float32]:
  n_array = np.array(vector, dtype=np.float32)
  theme_shape = len(n_array)
  if theme_shape > 100:
    raise HTTPException(
      status_code=400,
      detail=f"Theme shape must be 100"
    )
  elif theme_shape < 100:
    padding_needed = 100 - theme_shape
    n_array = np.pad(n_array, (0, padding_needed), mode='constant', constant_values=0.0)

  return n_array
