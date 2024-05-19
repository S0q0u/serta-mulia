const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData'); // Pindahkan require storeData ke atas fungsi

async function postPredictHandler(request, h) {
  try {
    const { image } = request.payload;
    const { model } = request.server.app;

    if (!image) {
      return h
        .response({
          status: 'fail',
          message: 'Image is required for prediction',
        })
        .code(400);
    }

    const { confidenceScore, label, explanation, suggestion } =
      await predictClassification(model, image);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
      id: id,
      result: label,
      explanation: explanation,
      suggestion: suggestion,
      confidenceScore: confidenceScore,
      createdAt: createdAt,
    };

    // Simpan data menggunakan fungsi storeData
    await storeData(id, data);

    const response = h.response({
      status: 'success',
      message:
        confidenceScore > 99
          ? 'Model is predicted successfully.'
          : 'Model is predicted successfully but under threshold. Please use the correct picture',
      data,
    });
    response.code(201); // Pastikan ini adalah integer
    return response;
  } catch (error) {
    console.error('Error during prediction:', error);
    return h
      .response({
        status: 'error',
        message: 'An internal server error occurred',
      })
      .code(500);
  }
}

module.exports = postPredictHandler;
