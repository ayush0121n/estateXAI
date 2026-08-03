const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EstateXAi API',
      version: '2.0.0',
      description: `
## EstateXAi — AI-Driven Real Estate API

Full API documentation for the EstateXAi platform.

### Authentication
Most endpoints require a Bearer JWT token in the Authorization header:
\`Authorization: Bearer <token>\`

### Price Prediction Model
- **Dataset**: Synthetic Pune Real Estate (5,000 samples)
- **Model**: Random Forest Regressor (n_estimators=200)
- **R² Score**: 0.8292 | **RMSE**: ₹8,363,232 | **MAE**: ₹2,632,019
      `,
      contact: { name: 'Ayush Narkhede', email: 'admin@estatexai.com' }
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local Development' },
      { url: 'https://estatexai-backend.onrender.com', description: 'Production (Render)' }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
