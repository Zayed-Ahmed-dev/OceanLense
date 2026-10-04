import os
os.environ['TF_USE_LEGACY_KERAS'] = '1'
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import tensorflow as tf
from tensorflow.keras.layers import (
    Input, Dense, Dropout, LayerNormalization,
    LSTM, Bidirectional, MultiHeadAttention, GlobalAveragePooling1D,
    Add, Conv1D, Conv1DTranspose,
)
from tensorflow.keras.models import Model


def create_temperature_profile_model(
    time_series_shape,          # e.g. (timesteps, n_features_time)
    static_features_shape,      # e.g. (n_static,)
    n_levels: int,              # number of depth levels
    n_members: int = 1,         # number of ensemble members
    lstm_units: int = 128,
    attention_heads: int = 8,
    dropout_rate: float = 0.1,
    name: str = "temp_profile_ensemble",
) -> Model:
    """
    Model that predicts vertical temperature profiles
    (with optional ensemble output).

    Input:
      - time series (past meteo/oceanographic data)
      - static features (lat, cyclic encoding of lon and month, ...)

    Output: (batch, n_levels, n_members)
    """
    inputs_time = Input(shape=time_series_shape, name="time_series_input")
    inputs_static = Input(shape=static_features_shape, name="static_input")

    # Temporal branch: BiLSTM -> MultiHeadAttention with residual
    x = Bidirectional(
        LSTM(lstm_units, return_sequences=True),
        merge_mode='concat',
    )(inputs_time)
    x = LayerNormalization()(x)
    x = Dropout(dropout_rate)(x)

    att = MultiHeadAttention(
        num_heads=attention_heads,
        key_dim=lstm_units,
        dropout=dropout_rate,
    )(x, x)
    x = Add()([x, att])
    x = LayerNormalization()(x)

    temporal_vector = GlobalAveragePooling1D()(x)
    temporal_vector = Dense(128, activation='gelu')(temporal_vector)

    # Static branch
    s = Dense(256, activation='gelu')(inputs_static)
    s = LayerNormalization()(s)
    s = Dropout(dropout_rate)(s)
    s = Dense(128, activation='gelu')(s)
    s = LayerNormalization()(s)

    # Fusion
    fused = Add()([temporal_vector, s])
    fused = Dense(256, activation='gelu')(fused)
    fused = Dropout(dropout_rate)(fused)

    # Expand along the vertical-levels axis
    x = Dense(n_levels * 64, activation='gelu')(fused)
    x = tf.keras.layers.Reshape((n_levels, 64))(x)
    # "Vertical" part: light conv + deconv
    x = Conv1D(filters=64, kernel_size=5, padding='same', activation='gelu')(x)
    x = LayerNormalization()(x)
    x = Conv1DTranspose(filters=32, kernel_size=7, padding='same',
                        activation='gelu')(x)
    x = LayerNormalization()(x)

    # Final head: pointwise Conv1D -> n_members
    out = Conv1D(
        filters=n_members, kernel_size=1, padding='same',
        activation='linear', name="output_ensemble",
    )(x)

    return Model(inputs=[inputs_time, inputs_static], outputs=out, name=name)


if __name__ == '__main__':
    # Sanity-check: print the summary only when executed as a script.
    model = create_temperature_profile_model((25, 25), (5,), 40, 100)
    model.summary()
